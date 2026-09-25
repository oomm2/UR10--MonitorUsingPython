import io
import json
import os
import time
import unittest
import urllib.error
from unittest.mock import Mock, patch

import mac_controller_heartbeat as helper


class HeartbeatTests(unittest.TestCase):
    def args(self, *extra):
        return helper.build_parser().parse_args(['--token', 'test-token', *extra])

    def response(self, body=b'{"ok":true,"observed_ip":"127.0.0.1"}', status=200):
        response = Mock(status=status)
        response.read.return_value = body
        return response

    @patch.object(helper.urllib.request, 'urlopen')
    def test_payload_and_header(self, urlopen):
        response = self.response()
        urlopen.return_value = response
        result = helper.send_heartbeat(self.args('--details', 'tracking ready'))
        request = urlopen.call_args.args[0]
        self.assertEqual(result['observed_ip'], '127.0.0.1')
        self.assertEqual(json.loads(request.data)['details'], 'tracking ready')
        self.assertEqual(request.get_header('X-heartbeat-token'), 'test-token')
        self.assertEqual(request.get_method(), 'POST')
        self.assertEqual(urlopen.call_args.kwargs['timeout'], 2)
        response.close.assert_called_once()

    def test_environment_token_and_cli_precedence(self):
        with patch.dict(os.environ, {helper.TOKEN_ENV: 'env-token'}, clear=True):
            self.assertEqual(helper.token_from_args(helper.build_parser().parse_args([])), 'env-token')
            self.assertEqual(helper.token_from_args(self.args()), 'test-token')

    def test_bad_tokens(self):
        for value in ['', 'with space', '\n', '中文', '\x7f', 'x' * 257]:
            with self.subTest(value=repr(value)), self.assertRaises(ValueError):
                helper.validate_token(value)

    def test_bad_intervals(self):
        for value in ['nan', 'inf', '-1', '0', 'abc']:
            with self.subTest(value=value), self.assertRaises(helper.argparse.ArgumentTypeError):
                helper.positive_interval(value)
        self.assertEqual(helper.positive_interval('1.5'), 1.5)

    def test_missing_token_fails_before_network(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(helper.urllib.request, 'urlopen') as urlopen:
            with patch('sys.stderr', new_callable=io.StringIO):
                self.assertEqual(helper.run(helper.build_parser().parse_args([])), 2)
            urlopen.assert_not_called()

    def test_http_error_includes_json_detail_and_redacts_token(self):
        error = urllib.error.HTTPError('http://localhost', 401, 'Unauthorized', {},
                                      io.BytesIO(b'{"error":"Invalid test-token"}'))
        with patch.object(helper.urllib.request, 'urlopen', side_effect=error):
            with self.assertRaisesRegex(helper.HeartbeatError, 'HTTP 401: Invalid \\[redacted\\]'):
                helper.send_heartbeat(self.args())

    def test_error_body_is_bounded(self):
        error = urllib.error.HTTPError('http://localhost', 500, 'Error', {}, io.BytesIO(b'x' * 5000))
        with patch.object(helper.urllib.request, 'urlopen', side_effect=error):
            with self.assertRaises(helper.HeartbeatError) as raised:
                helper.send_heartbeat(self.args())
            self.assertLess(len(str(raised.exception)), 600)

    def test_network_and_timeouts(self):
        for error in [urllib.error.URLError('connection refused'), TimeoutError('timed out')]:
            with patch.object(helper.urllib.request, 'urlopen', side_effect=error):
                with self.assertRaisesRegex(helper.HeartbeatError, 'could not reach monitor'):
                    helper.send_heartbeat(self.args())

    def test_body_timeout_closes_response(self):
        response = self.response()
        response.read.side_effect = TimeoutError('body timed out')
        with patch.object(helper.urllib.request, 'urlopen', return_value=response):
            with self.assertRaisesRegex(helper.HeartbeatError, 'could not read monitor response'):
                helper.send_heartbeat(self.args())
        response.close.assert_called_once()

    def test_bad_responses(self):
        for body in [b'not JSON', b'[]', b'{}', b'{"ok":false}', b'{"ok":true}']:
            with self.subTest(body=body), patch.object(helper.urllib.request, 'urlopen', return_value=self.response(body)):
                with self.assertRaises(helper.HeartbeatError):
                    helper.send_heartbeat(self.args())

    def test_unexpected_status(self):
        with patch.object(helper.urllib.request, 'urlopen', return_value=self.response(status=302)):
            with self.assertRaisesRegex(helper.HeartbeatError, 'unexpected HTTP status 302'):
                helper.send_heartbeat(self.args())

    def test_ctrl_c_is_clean(self):
        with patch.object(helper, 'send_heartbeat', side_effect=KeyboardInterrupt), patch('sys.stderr', new_callable=io.StringIO):
            self.assertEqual(helper.run(self.args()), 0)


class HeartbeatClientTests(unittest.TestCase):
    def make_client(self, **kwargs):
        kwargs.setdefault("token", "test-token")
        kwargs.setdefault("interval", 0.05)
        return helper.HeartbeatClient(**kwargs)

    @staticmethod
    def ok_response():
        response = Mock(status=200)
        response.read.return_value = b'{"ok":true,"observed_ip":"127.0.0.1"}'
        return response

    def wait_for(self, condition, timeout=5.0):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if condition():
                return True
            time.sleep(0.01)
        return False

    @patch.object(helper.urllib.request, "urlopen")
    def test_embedded_lifecycle_payload_and_updates(self, urlopen):
        urlopen.return_value = self.ok_response()
        client = self.make_client(latency_clock="unix", name="Vision", robot_ip="192.0.2.10")
        client.start()
        self.assertTrue(self.wait_for(lambda: urlopen.call_count >= 1))
        client.update(state="tracking", details="hand detected")
        self.assertTrue(self.wait_for(lambda: any(
            json.loads(call.args[0].data).get("state") == "tracking"
            for call in urlopen.call_args_list
        )))
        client.stop()
        self.assertFalse(client.running)

        first = json.loads(urlopen.call_args_list[0].args[0].data)
        self.assertEqual(first["name"], "Vision")
        self.assertEqual(first["robot_ip"], "192.0.2.10")
        self.assertEqual(first["state"], "controlling")
        self.assertIsInstance(first["sent_at"], float)
        self.assertIs(first["clock_sync"], True)
        request = urlopen.call_args_list[0].args[0]
        self.assertEqual(request.get_header("X-heartbeat-token"), "test-token")
        self.assertEqual(urlopen.call_args.kwargs["timeout"], 2.0)

    @patch.object(helper.urllib.request, "urlopen")
    def test_monotonic_default_has_no_clock_sync_flag(self, urlopen):
        urlopen.return_value = self.ok_response()
        client = self.make_client()
        client.send_once()
        payload = json.loads(urlopen.call_args.args[0].data)
        self.assertIsInstance(payload["sent_at"], float)
        self.assertNotIn("clock_sync", payload)

    def test_client_validation(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ValueError):
                helper.HeartbeatClient(token=None)
        for kwargs in [{"interval": 0}, {"interval": float("nan")}, {"timeout": -1},
                       {"latency_clock": "bogus"}]:
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.make_client(**kwargs)

    @patch.object(helper.urllib.request, "urlopen")
    def test_failures_reach_on_error_without_raising(self, urlopen):
        urlopen.side_effect = helper.urllib.error.URLError("monitor down")
        errors = []
        client = self.make_client(on_error=errors.append)
        client.start()
        self.assertTrue(self.wait_for(lambda: bool(errors)))
        client.stop()
        self.assertIn("could not reach monitor", errors[0])
        self.assertIn("could not reach monitor", client.last_error or "")

    @patch.object(helper.urllib.request, "urlopen")
    def test_stop_pauses_sending(self, urlopen):
        urlopen.return_value = self.ok_response()
        client = self.make_client()
        client.start()
        self.assertTrue(self.wait_for(lambda: urlopen.call_count >= 1))
        client.stop()
        count = urlopen.call_count
        time.sleep(0.2)
        self.assertEqual(urlopen.call_count, count)

    def test_token_redaction_in_client_errors(self):
        error = urllib.error.HTTPError("http://localhost", 401, "Unauthorized", {},
                                      io.BytesIO(b'{"error":"bad test-token"}'))
        with patch.object(helper.urllib.request, "urlopen", side_effect=error):
            client = self.make_client()
            with self.assertRaisesRegex(helper.HeartbeatError, "bad \\[redacted\\]"):
                client.send_once()
            self.assertIn("[redacted]", client.last_error or "")


if __name__ == '__main__':
    unittest.main()

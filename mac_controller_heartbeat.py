#!/usr/bin/env python3
"""Identify the Mac Vision controller to the Windows UR10 monitor.

This module only sends an authenticated HTTP heartbeat to the monitor. It never
sends URScript, motion commands, or RTDE input data to the robot.

Use it two ways:

- CLI: ``python3 mac_controller_heartbeat.py`` sends heartbeats until Ctrl-C.
- Embedded: import :class:`HeartbeatClient` and start/stop it with the Vision
  controller lifecycle so the dashboard state follows the real app.
"""
from __future__ import annotations

import argparse
import contextlib
import json
import math
import os
import sys
import threading
import time
import urllib.error
import urllib.request
from collections.abc import Callable
from typing import Any

TOKEN_ENV = "UR_MONITOR_HEARTBEAT_TOKEN"
DEFAULT_MONITOR = "http://192.0.2.20:8080"
DEFAULT_ROBOT_IP = "192.0.2.10"
DEFAULT_NAME = "Mac Vision controller"
DEFAULT_PROTOCOL = "Vision / RTDE"
MAX_ERROR_BODY = 512
LATENCY_CLOCKS = {"monotonic", "unix"}


class HeartbeatError(RuntimeError):
    """An expected heartbeat request or response error."""


def validate_token(value: str | None) -> str:
    """Validate a token before putting it into an HTTP header."""
    token = str(value or "")
    if not token:
        raise ValueError(
            f"missing heartbeat token; set {TOKEN_ENV} or pass --token"
        )
    try:
        token.encode("ascii")
    except UnicodeEncodeError as exc:
        raise ValueError("heartbeat token must contain ASCII characters only") from exc
    if any(character.isspace() or ord(character) < 32 or ord(character) == 127 for character in token):
        raise ValueError("heartbeat token must not contain whitespace or control characters")
    if len(token) > 256:
        raise ValueError("heartbeat token is too long (maximum 256 characters)")
    return token


def positive_interval(value: str) -> float:
    try:
        interval = float(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("interval must be a number greater than zero") from exc
    if not math.isfinite(interval) or interval <= 0:
        raise argparse.ArgumentTypeError("interval must be a finite number greater than zero")
    return interval


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Identify a Mac Vision controller in the UR10 Monitor"
    )
    parser.add_argument("--monitor", default=DEFAULT_MONITOR, help="monitor base URL")
    parser.add_argument(
        "--token",
        default=None,
        help=f"heartbeat token; defaults to {TOKEN_ENV} (avoid putting secrets in shell history)",
    )
    parser.add_argument("--name", default=DEFAULT_NAME)
    parser.add_argument("--state", default="controlling")
    parser.add_argument("--protocol", default=DEFAULT_PROTOCOL)
    parser.add_argument("--details", default="", help="optional controller status details")
    parser.add_argument("--robot-ip", default=DEFAULT_ROBOT_IP)
    parser.add_argument("--session-id", default="")
    parser.add_argument(
        "--interval",
        type=positive_interval,
        default=1.0,
        help="seconds between heartbeats (default: 1.0)",
    )
    parser.add_argument(
        "--latency-clock",
        choices=sorted(LATENCY_CLOCKS),
        default="monotonic",
        help="clock used for sent_at: monotonic (same host) or unix (NTP-synced hosts)",
    )
    return parser


def token_from_args(args: argparse.Namespace) -> str:
    """Resolve an explicit token first, then the process environment."""
    return validate_token(args.token if args.token is not None else os.environ.get(TOKEN_ENV))


def _sent_at(latency_clock: str) -> dict[str, Any]:
    """Stamp the payload for the monitor's latency tracker.

    ``monotonic`` matches ``latency_mode: monotonic`` and is only meaningful when
    the sender runs on the monitor host. ``unix`` pairs with
    ``latency_mode: clock_sync`` on NTP-synchronised machines.
    """
    if latency_clock == "unix":
        return {"sent_at": time.time(), "clock_sync": True}
    return {"sent_at": time.monotonic()}


def _response_body(response: Any) -> str:
    raw = response.read(MAX_ERROR_BODY + 1)
    if isinstance(raw, bytes):
        text = raw.decode("utf-8", errors="replace")
    else:
        text = str(raw)
    text = text.strip()
    if len(text) > MAX_ERROR_BODY:
        text = text[:MAX_ERROR_BODY] + "…"
    return text


def _describe_http_error(error: urllib.error.HTTPError) -> str:
    body = _response_body(error)
    detail = ""
    if body:
        try:
            payload = json.loads(body)
            if isinstance(payload, dict) and payload.get("error"):
                detail = f": {payload['error']}"
            else:
                detail = f": {body}"
        except json.JSONDecodeError:
            detail = f": {body}"
    return f"monitor rejected heartbeat with HTTP {error.code}{detail}"


def post_heartbeat(
    monitor_url: str, token: str, payload: dict[str, Any], timeout: float = 2.0
) -> dict[str, Any]:
    """Send one authenticated heartbeat and return the monitor's JSON response."""
    request = urllib.request.Request(
        monitor_url.rstrip("/") + "/api/control/heartbeat",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Heartbeat-Token": token,
        },
        method="POST",
    )
    try:
        response = urllib.request.urlopen(request, timeout=timeout)
    except urllib.error.HTTPError as exc:
        try:
            message = _describe_http_error(exc)
        except (TimeoutError, OSError):
            message = f"monitor rejected heartbeat with HTTP {exc.code}; error body unavailable"
        finally:
            exc.close()
        raise HeartbeatError(message.replace(token, "[redacted]")) from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise HeartbeatError(f"could not reach monitor: {exc}") from exc

    try:
        status = getattr(response, "status", None)
        if status is None:
            status = response.getcode()
        body = _response_body(response)
    except (TimeoutError, OSError) as exc:
        raise HeartbeatError(f"could not read monitor response: {exc}") from exc
    finally:
        response.close()
    if not 200 <= int(status) < 300:
        raise HeartbeatError(f"monitor returned unexpected HTTP status {status}")
    try:
        result = json.loads(body)
    except json.JSONDecodeError as exc:
        raise HeartbeatError("monitor returned invalid JSON") from exc
    if not isinstance(result, dict) or result.get("ok") is not True:
        raise HeartbeatError("monitor returned an invalid heartbeat response")
    if not result.get("observed_ip"):
        raise HeartbeatError("monitor response did not include observed_ip")
    return result


def send_heartbeat(args: argparse.Namespace) -> dict[str, Any]:
    """Send one CLI heartbeat and return the monitor's JSON response."""
    token = token_from_args(args)
    payload = {
        "name": args.name,
        "state": args.state,
        "protocol": args.protocol,
        "session_id": args.session_id,
        "robot_ip": args.robot_ip,
        "details": args.details,
        **_sent_at(getattr(args, "latency_clock", "monotonic")),
    }
    return post_heartbeat(args.monitor, token, payload)


class HeartbeatClient:
    """Background heartbeat sender for embedding in the Vision controller.

    The client owns one daemon thread. ``start()`` begins sending every
    ``interval`` seconds; ``stop()`` ends it. Field updates through ``update()``
    are thread-safe and apply from the next beat. Failures never propagate into
    the caller's control loop: they surface through ``on_error`` and
    ``last_error``.
    """

    def __init__(
        self,
        monitor_url: str = DEFAULT_MONITOR,
        token: str | None = None,
        *,
        name: str = DEFAULT_NAME,
        state: str = "controlling",
        protocol: str = DEFAULT_PROTOCOL,
        robot_ip: str = DEFAULT_ROBOT_IP,
        session_id: str = "",
        details: str = "",
        interval: float = 1.0,
        latency_clock: str = "monotonic",
        timeout: float = 2.0,
        on_error: Callable[[str], None] | None = None,
    ) -> None:
        if not math.isfinite(interval) or interval <= 0:
            raise ValueError("interval must be a finite number greater than zero")
        if not math.isfinite(timeout) or timeout <= 0:
            raise ValueError("timeout must be a finite number greater than zero")
        if latency_clock not in LATENCY_CLOCKS:
            raise ValueError(f"latency_clock must be one of {sorted(LATENCY_CLOCKS)}")
        self.monitor_url = monitor_url
        self.token = validate_token(token if token is not None else os.environ.get(TOKEN_ENV))
        self.interval = float(interval)
        self.timeout = float(timeout)
        self.latency_clock = latency_clock
        self.on_error = on_error
        self._lock = threading.Lock()
        self._identity: dict[str, str] = {
            "name": name,
            "protocol": protocol,
            "robot_ip": robot_ip,
            "session_id": session_id,
        }
        self._state = state
        self._details = details
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._last_error: str | None = None

    @property
    def running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    @property
    def last_error(self) -> str | None:
        return self._last_error

    def update(self, *, state: str | None = None, details: str | None = None,
               session_id: str | None = None) -> None:
        """Change reported fields; takes effect from the next heartbeat."""
        with self._lock:
            if state is not None:
                self._state = state
            if details is not None:
                self._details = details
            if session_id is not None:
                self._identity["session_id"] = session_id

    def send_once(self) -> dict[str, Any]:
        """Send one heartbeat immediately with the current field values."""
        with self._lock:
            payload = {
                **self._identity,
                "state": self._state,
                "details": self._details,
            }
        payload.update(_sent_at(self.latency_clock))
        try:
            result = post_heartbeat(self.monitor_url, self.token, payload, timeout=self.timeout)
        except HeartbeatError as exc:
            self._last_error = str(exc)
            raise
        self._last_error = None
        return result

    def start(self) -> None:
        """Start the background sender; safe to call more than once."""
        if self.running:
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="heartbeat-client", daemon=True)
        self._thread.start()

    def stop(self, timeout: float = 2.5) -> None:
        """Stop the background sender and wait for it to exit."""
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=timeout)
            self._thread = None

    def _run(self) -> None:
        while not self._stop_event.is_set():
            started = time.monotonic()
            try:
                self.send_once()
            except HeartbeatError as exc:
                self._last_error = str(exc)
                if self.on_error is not None:
                    # A broken callback must never kill the sender thread.
                    with contextlib.suppress(Exception):
                        self.on_error(str(exc))
            elapsed = time.monotonic() - started
            self._stop_event.wait(max(0.05, self.interval - elapsed))


def run(args: argparse.Namespace) -> int:
    """Send heartbeats until interrupted."""
    try:
        token_from_args(args)
    except ValueError as exc:
        print(f"heartbeat configuration error: {exc}", file=sys.stderr)
        return 2

    try:
        while True:
            try:
                result = send_heartbeat(args)
                print(
                    "heartbeat accepted; Windows observed controller IP: "
                    f"{result['observed_ip']}"
                )
            except HeartbeatError as exc:
                print(f"heartbeat failed: {exc}", file=sys.stderr)
            time.sleep(max(0.25, args.interval))
    except KeyboardInterrupt:
        print("heartbeat stopped", file=sys.stderr)
        return 0


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return run(args)


if __name__ == "__main__":
    raise SystemExit(main())

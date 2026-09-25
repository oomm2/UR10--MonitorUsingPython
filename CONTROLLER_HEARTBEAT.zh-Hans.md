# Controller Heartbeat API

[English](CONTROLLER_HEARTBEAT.md) | [廣東話](CONTROLLER_HEARTBEAT.zh-HK.md) | [繁體中文](CONTROLLER_HEARTBEAT.zh-Hant.md) | **简体中文**

## 为什么有这个 API

Windows 监控器使用 RTDE **纯输出**遥测。RTDE 可以上报机器人状态，但不会告诉监控器目前有哪些其他计算机连接 URSim 控制器。Windows 也看不到 Mac 对 VM 的直接 TCP 连接，因为监控器不是代理。

为了可靠显示控制端 IP，Mac 控制端会向监控器发送一个小型、**以 token 验证的 heartbeat**。TCP 来源地址由监控器自行记录，因此显示的 IP 是 Windows 实际观察到的地址，而非用户自行填写的字段。heartbeat 用于识别发送者进程；它不能证明该进程正在发送机器人运动指令。要让仪表板状态准确，请随 Vision 控制器一同启动、一同停止。

heartbeat 端点永远不会向机器人发送任何数据，也无法控制机器人。

## Token 设置

Windows 监控器从进程环境变量 `UR_MONITOR_HEARTBEAT_TOKEN` 读取 heartbeat token。若该变量不存在，则读取本地被忽略的 `.env` 文件。`config.json` 已不再存放密钥。token 是必需的：若监控器未配置 token，heartbeat 写入将失效关闭（fail closed），返回 HTTP 503。

在 Windows 上，将 `.env.example` 复制为 `.env` 并设置一个随机 ASCII token。在 Mac 上使用相同值，并保持在版本控制之外。在 shell 中可用以下方式输入而不显示内容：

```bash
read -r -s UR_MONITOR_HEARTBEAT_TOKEN
export UR_MONITOR_HEARTBEAT_TOKEN
```

辅助程序也兼容 `--token` 参数，但建议使用环境变量，因为命令行参数可能被其他本地进程看到。

## 端点

```text
POST http://192.0.2.20:8080/api/control/heartbeat
Content-Type: application/json
X-Heartbeat-Token: <与 Windows 监控器相同的 token>
```

JSON 示例：

```json
{
  "name": "Mac Vision controller",
  "state": "controlling",
  "protocol": "Vision / RTDE",
  "session_id": "vision-session-001",
  "robot_ip": "192.0.2.10",
  "details": "hand tracking ready"
}
```

Mac 应用程序启用期间每秒发送一次。仪表板在最近 4 秒内收到 heartbeat 时标记为 `Active`，之后显示 `Heartbeat stale`。

## 在 Mac 上快速测试

将 `mac_controller_heartbeat.py` 复制到 Mac，按上述方式导出 token，然后运行：

```bash
python3 mac_controller_heartbeat.py \
  --monitor http://192.0.2.20:8080 \
  --name 'Mac Vision controller' \
  --details 'hand tracking ready'
```

预期错误都很明确：

- `401` — token 错误。
- `429` — 此来源地址的 token 验证失败次数过多，已被暂时锁定。响应附带 `Retry-After` 标头（秒数）。正确的 token 会清除计数。
- `503` — Windows 监控器未配置 token，拒绝写入。
- `400` 或 `413` — heartbeat 内容格式错误或过大。
- `403` — 浏览器请求使用了 CORS 精确允许列表以外的 origin。原生 Python 辅助程序不发送 `Origin` 标头，不受该浏览器限定检查影响。

锁定按来源地址计算，由 `config.json` 的 `heartbeat_max_failures`（默认 5）与 `heartbeat_lockout_seconds`（默认 60）控制。将 `heartbeat_lockout_seconds` 设为 `0` 可禁用锁定。由于计数按地址计算，一个失去网络的控制器不会被其他客户端的失败连累锁定。

此端点在此专用局域网设置中为纯 HTTP。请勿暴露到不受信任的网络；如有必要，请使用受保护的网络或先加上传输层加密。

## Python 集成（嵌入 Vision 应用）

`mac_controller_heartbeat.py` 同时是一个可 import 的模块，heartbeat 可以跟随 Vision 控制器的真实生命周期运行，无需另开脚本。将文件复制到你的 Vision 应用旁（仅使用标准库），然后：

```python
import mac_controller_heartbeat as hb

heartbeat = hb.HeartbeatClient(
    monitor_url="http://192.0.2.20:8080",
    name="Mac Vision controller",
    protocol="Vision / RTDE",
    robot_ip="192.0.2.10",
    latency_clock="unix",   # 见下方延迟说明
)
heartbeat.start()                                   # Vision 控制器启动时
heartbeat.update(state="tracking", details="hand detected")
heartbeat.update(state="idle")
heartbeat.stop()                                    # Vision 控制器停止时
```

token 会从 `UR_MONITOR_HEARTBEAT_TOKEN` 读取（或直接传入 `token=`）。发送失败绝不会抛进你的控制流程：只会通过可选的 `on_error` 回调与 `last_error` 属性上报。

延迟说明：`latency_clock="monotonic"`（默认）对应监控器默认的 `latency_mode`，只有在发送端与监控器同一主机时才有意义。真实 Mac → Windows 设置：在监控器的 `config.json` 设置 `"latency_mode": "clock_sync"`，两台机器保持 NTP 时间同步，并使用 `latency_clock="unix"`。

## Swift / Vision 集成

在 Vision 控制器启动后以定时器运行此代码，控制器停止时停止定时器。token 请放在运行时配置中，不要放进源码控制。

```swift
struct ControllerHeartbeat: Encodable {
    let name: String
    let state: String
    let protocolName: String
    let sessionID: String
    let robotIP: String
    let details: String

    enum CodingKeys: String, CodingKey {
        case name, state
        case protocolName = "protocol"
        case sessionID = "session_id"
        case robotIP = "robot_ip"
        case details
    }
}

func sendHeartbeat(token: String, details: String, completion: @escaping (Error?) -> Void) {
    var request = URLRequest(url: URL(string: "http://192.0.2.20:8080/api/control/heartbeat")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    request.setValue(token, forHTTPHeaderField: "X-Heartbeat-Token")
    let body = ControllerHeartbeat(
        name: "Mac Vision controller",
        state: "controlling",
        protocolName: "Vision / RTDE",
        sessionID: "vision-session-001",
        robotIP: "192.0.2.10",
        details: details
    )
    request.httpBody = try? JSONEncoder().encode(body)

    URLSession.shared.dataTask(with: request) { _, response, error in
        if let error {
            completion(error)
            return
        }
        guard let http = response as? HTTPURLResponse,
              (200..<300).contains(http.statusCode) else {
            completion(NSError(domain: "ControllerHeartbeat", code: 1))
            return
        }
        completion(nil)
    }.resume()
}
```

如果 Mac 无法连接，请确认 Windows 防火墙允许专用网络的 TCP 8080 入站，且监控器正在监听 `0.0.0.0`。

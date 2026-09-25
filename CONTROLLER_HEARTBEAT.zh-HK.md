# Controller Heartbeat API

[English](CONTROLLER_HEARTBEAT.md) | **廣東話** | [繁體中文](CONTROLLER_HEARTBEAT.zh-Hant.md) | [简体中文](CONTROLLER_HEARTBEAT.zh-Hans.md)

## 點解會有呢個 API

Windows monitor 用嘅係 RTDE **純輸出**遙測。RTDE 可以匯報機械人狀態，但唔會話畀 monitor 知而家有咩其他電腦連住 URSim 控制器。Windows 亦睇唔到 Mac 對 VM 嘅直接 TCP 連線，因為 monitor 唔係 proxy。

想可靠咁顯示控制端 IP，Mac 控制端會向 monitor 發一個小型、**用 token 驗證嘅 heartbeat**。TCP 來源位址由 monitor 自己記錄，所以顯示嘅 IP 係 Windows 親眼觀察到嘅位址，唔係用戶自己填嘅欄位。heartbeat 用嚟識別發送者程序；佢唔能證明該程序正在發送機械人運動指令。想 dashboard 狀態準確，就同 Vision 控制器一齊開同埋一齊停。

heartbeat 端點永遠唔會發送任何嘢畀機械人，亦控制唔到機械人。

## Token 設定

Windows monitor 由 process environment 讀取 `UR_MONITOR_HEARTBEAT_TOKEN`。如果冇呢個變數，就會讀本地被 ignore 嘅 `.env` 檔。`config.json` 已經唔再存放密鑰。token 係必需嘅：如果 monitor 冇設定 token，heartbeat 寫入會 fail closed，回 HTTP 503。

喺 Windows，將 `.env.example` 複製做 `.env` 並設定一個隨機 ASCII token。喺 Mac 用同一個值，並且唔好放入版本控制。喺 shell 可以咁樣輸入而唔會顯示出嚟：

```bash
read -r -s UR_MONITOR_HEARTBEAT_TOKEN
export UR_MONITOR_HEARTBEAT_TOKEN
```

helper 亦兼容 `--token` 參數，但建議用環境變數，因為命令列參數可能會被其他本地程序睇到。

## 端點

```text
POST http://192.0.2.20:8080/api/control/heartbeat
Content-Type: application/json
X-Heartbeat-Token: <同 Windows monitor 一樣嘅 token>
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

Mac app 開住嘅時候每秒發一次。dashboard 喺最近 4 秒內收過 heartbeat 就會標記 `Active`，之後就變 `Heartbeat stale`。

## 喺 Mac 快速測試

將 `mac_controller_heartbeat.py` 複製去 Mac，跟上面方法匯出 token，然後行：

```bash
python3 mac_controller_heartbeat.py \
  --monitor http://192.0.2.20:8080 \
  --name 'Mac Vision controller' \
  --details 'hand tracking ready'
```

常見錯誤好明確：

- `401` — token 錯。
- `429` — 呢個來源位址 token 錯太多次，暫時被鎖定。回應會帶 `Retry-After` header（秒數）。token 啱嘅請求會清返計數。
- `503` — Windows monitor 冇設定 token，拒絕寫入。
- `400` 或者 `413` — heartbeat 內容格式錯或者太大。
- `403` — 瀏覽器請求用咗 CORS 允許清單以外嘅 origin。原生 Python helper 唔會送 `Origin` header，唔受呢個瀏覽器限定檢查影響。

鎖定按來源位址計，由 `config.json` 嘅 `heartbeat_max_failures`（預設 5）同 `heartbeat_lockout_seconds`（預設 60）控制。將 `heartbeat_lockout_seconds` 設做 `0` 可以停用。因為計數係按位址，一個斷咗網嘅控制器唔會被第個 client 嘅失敗連累鎖定。

呢個端點喺呢個私人 LAN 設定入面係純 HTTP。唔好暴露喺唔受信嘅網絡；如果必須，請用受保護網絡或者先加傳輸層加密。

## Python 整合（直接嵌入 Vision app）

`mac_controller_heartbeat.py` 同時係一個可以 import 嘅模組，heartbeat 可以跟住 Vision 控制器嘅真實生命周期行，唔使另開 script。將個檔案複製去你個 Vision app 隔籬（只用標準庫），然後：

```python
import mac_controller_heartbeat as hb

heartbeat = hb.HeartbeatClient(
    monitor_url="http://192.0.2.20:8080",
    name="Mac Vision controller",
    protocol="Vision / RTDE",
    robot_ip="192.0.2.10",
    latency_clock="unix",   # 見下面延遲說明
)
heartbeat.start()                                   # Vision 控制器啟動時
heartbeat.update(state="tracking", details="hand detected")
heartbeat.update(state="idle")
heartbeat.stop()                                    # Vision 控制器停止時
```

token 會由 `UR_MONITOR_HEARTBEAT_TOKEN` 讀取（或者直接傳 `token=`）。發送失敗永遠唔會炸入你嘅控制流程：只會經選配嘅 `on_error` callback 同 `last_error` property 回報。

延遲說明：`latency_clock="monotonic"`（預設）對應 monitor 預設嘅 `latency_mode`，只有 sender 同 monitor 同機先有意義。真實 Mac → Windows 設定：喺 monitor 嘅 `config.json` 設 `"latency_mode": "clock_sync"`，兩部機保持 NTP 對時，並用 `latency_clock="unix"`。

## Swift / Vision 整合

喺 Vision 控制器啟動之後用 timer 行呢段 code，控制器停止時就停個 timer。token 放喺執行時配置，唔好放入 source control。

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

如果 Mac 連唔上，檢查 Windows 防火牆有冇畀私人網絡嘅 TCP 8080 入站，同埋 monitor 係咪監聽緊 `0.0.0.0`。

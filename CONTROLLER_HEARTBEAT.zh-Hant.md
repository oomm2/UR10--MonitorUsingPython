# Controller Heartbeat API

[English](CONTROLLER_HEARTBEAT.md) | [廣東話](CONTROLLER_HEARTBEAT.zh-HK.md) | **繁體中文** | [简体中文](CONTROLLER_HEARTBEAT.zh-Hans.md)

## 為什麼有這個 API

Windows 監控器使用 RTDE **純輸出**遙測。RTDE 可以回報機器人狀態，但不會告訴監控器目前有哪些其他電腦連接 URSim 控制器。Windows 也看不到 Mac 對 VM 的直接 TCP 連線，因為監控器不是代理。

為了可靠顯示控制端 IP，Mac 控制端會向監控器發送一個小型、**以 token 驗證的 heartbeat**。TCP 來源位址由監控器自行記錄，因此顯示的 IP 是 Windows 實際觀察到的位址，而非使用者自行填寫的欄位。heartbeat 用於識別發送者程序；它不能證明該程序正在發送機器人運動指令。若要讓儀表板狀態準確，請與 Vision 控制器一同啟動、一同停止。

heartbeat 端點永遠不會向機器人發送任何資料，也無法控制機器人。

## Token 設定

Windows 監控器從處理程序環境變數 `UR_MONITOR_HEARTBEAT_TOKEN` 讀取 heartbeat token。若該變數不存在，則讀取本地被忽略的 `.env` 檔。`config.json` 已不再存放密鑰。token 是必需的：若監控器未設定 token，heartbeat 寫入會失效關閉（fail closed），回傳 HTTP 503。

在 Windows 上，將 `.env.example` 複製為 `.env` 並設定一個隨機 ASCII token。在 Mac 上使用相同值，並保持在版本控制之外。在 shell 中可用以下方式輸入而不顯示內容：

```bash
read -r -s UR_MONITOR_HEARTBEAT_TOKEN
export UR_MONITOR_HEARTBEAT_TOKEN
```

輔助程式也相容 `--token` 參數，但建議使用環境變數，因為命令列參數可能會被其他本地程序看到。

## 端點

```text
POST http://192.0.2.20:8080/api/control/heartbeat
Content-Type: application/json
X-Heartbeat-Token: <與 Windows 監控器相同的 token>
```

JSON 範例：

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

Mac 應用程式啟用期間每秒發送一次。儀表板在最近 4 秒內收到 heartbeat 時標記為 `Active`，之後顯示 `Heartbeat stale`。

## 在 Mac 上快速測試

將 `mac_controller_heartbeat.py` 複製到 Mac，依上述方式匯出 token，然後執行：

```bash
python3 mac_controller_heartbeat.py \
  --monitor http://192.0.2.20:8080 \
  --name 'Mac Vision controller' \
  --details 'hand tracking ready'
```

預期錯誤都很明確：

- `401` — token 錯誤。
- `429` — 此來源位址的 token 驗證失敗次數過多，已被暫時鎖定。回應附帶 `Retry-After` 標頭（秒數）。正確的 token 會清除計數。
- `503` — Windows 監控器未設定 token，拒絕寫入。
- `400` 或 `413` — heartbeat 內容格式錯誤或過大。
- `403` — 瀏覽器請求使用了 CORS 精確允許清單以外的 origin。原生 Python 輔助程式不會送出 `Origin` 標頭，不受此瀏覽器限定檢查影響。

鎖定按來源位址計算，由 `config.json` 的 `heartbeat_max_failures`（預設 5）與 `heartbeat_lockout_seconds`（預設 60）控制。將 `heartbeat_lockout_seconds` 設為 `0` 可停用鎖定。由於計數按位址計算，一個失去網路的控制器不會被其他用戶端的失敗連累鎖定。

此端點在此私人區網設定中為純 HTTP。請勿暴露於不受信任的網路；若有必要，請使用受保護的網路或先加上傳輸層加密。

## Python 整合（內嵌於 Vision 應用程式）

`mac_controller_heartbeat.py` 同時是一個可 import 的模組，heartbeat 可以跟隨 Vision 控制器的真實生命週期運作，不需另開腳本。將檔案複製到你的 Vision 應用程式旁（僅使用標準庫），然後：

```python
import mac_controller_heartbeat as hb

heartbeat = hb.HeartbeatClient(
    monitor_url="http://192.0.2.20:8080",
    name="Mac Vision controller",
    protocol="Vision / RTDE",
    robot_ip="192.0.2.10",
    latency_clock="unix",   # 見下方延遲說明
)
heartbeat.start()                                   # Vision 控制器啟動時
heartbeat.update(state="tracking", details="hand detected")
heartbeat.update(state="idle")
heartbeat.stop()                                    # Vision 控制器停止時
```

token 會從 `UR_MONITOR_HEARTBEAT_TOKEN` 讀取（或直接傳入 `token=`）。發送失敗絕不會拋入你的控制流程：只會透過選配的 `on_error` 回呼與 `last_error` 屬性回報。

延遲說明：`latency_clock="monotonic"`（預設）對應監控器預設的 `latency_mode`，只有在傳送端與監控器同一部主機時才有意義。真實 Mac → Windows 設定：在監控器的 `config.json` 設定 `"latency_mode": "clock_sync"`，兩台機器保持 NTP 對時，並使用 `latency_clock="unix"`。

## Swift / Vision 整合

在 Vision 控制器啟動後以計時器執行此程式碼，控制器停止時停止計時器。token 請放在執行時設定中，不要放進原始碼控制。

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

如果 Mac 無法連線，請確認 Windows 防火牆允許私人網路的 TCP 8080 入站，且監控器正在監聽 `0.0.0.0`。

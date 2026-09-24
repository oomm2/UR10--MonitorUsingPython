# UR10——MonitorUsingPython

[English](README.md) | [廣東話](README.zh-HK.md) | **繁體中文** | [简体中文](README.zh-Hans.md)

適用於 Windows 的 UR10 RTDE 唯讀遙測監控器。

GitHub 儲存庫名稱：`UR10--MonitorUsingPython`。
以下所有 `192.0.2.x` 位址僅為文件範例，並非實際部署位址。
Mac Vision 程式仍然是唯一的控制器：本應用程式只使用 RTDE **純輸出** recipe，絕不會發送 URScript、運動指令或 RTDE 輸入暫存器。

本專案刻意維持唯讀設計——整個儲存庫內沒有任何輸入 recipe、URScript 或運動指令。

## 架構

```text
Mac: Vision hand tracking  ──(your control path)──>  URSim / UR controller
Windows: this monitor       ──(RTDE outputs only)──> URSim / UR controller
VirtualBox: Bridged Adapter; URSim IP = 192.0.2.10
```

監控器可以與 Mac 控制端同時運行，因為它只訂閱遙測數據。

## 安裝（Windows PowerShell）

```powershell
cd path\to\UR10--MonitorUsingPython
Copy-Item config.example.json config.json
# 啟動伺服器前，先為你的機器人與監控器編輯 config.json。
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

RTDE 相依套件為 Universal Robots 官方的 `RTDE_Python_Client_Library`，並鎖定至已知的上游 commit，以確保安裝可重現。

瀏覽器儀表板使用鎖定版本的本機 Three.js 與 `urdf-loader` 副本；載入 3D 視圖不需要連接網際網路。

範例設定預設將 HTTP 綁定至 loopback。如需在可信任的區域網路上接收 heartbeat，請為自己的網路明確設定 `http_host` 與 `monitor_advertised_ip`。切勿將此伺服器暴露於網際網路。

### 選配的 heartbeat 驗證

將 `.env.example` 複製為 `.env`，並依照檔內說明產生新的私密 token，然後在控制端設定相同的 token。切勿 commit `.env`，也不要在實際部署中使用測試 token。沒有設定 token 時，需要驗證的寫入端點會保持停用；唯讀遙測仍然可用。

開發檢查（請先由範例建立本機 `config.json`）：

```powershell
# Python 單元測試（不會開啟機器人連線）
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

# Lint 與型別檢查
.\.venv\Scripts\python.exe -m pip install ruff mypy
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m mypy

# 瀏覽器端單元測試（Node 20+；無需 npm install）
node --test "tests/js/*.test.mjs"

# 從 vendor/ 重新產生 UR10 URDF 與網格
.\.venv\Scripts\python.exe tools\build_models.py

# 端對端煙霧測試：在一次性連接埠啟動伺服器並測試所有端點。
# 不會開啟 RTDE 連線，也不會接觸機器人。
.\.venv\Scripts\python.exe tools\smoke_test.py
```

## 執行

1. 在 VirtualBox 以 **Bridged Adapter** 啟動 URSim，並將 `config.json` 內的 `robot_ip` 設定為其實際位址。
2. 測試 RTDE 連接埠：

   ```powershell
   Test-NetConnection <ROBOT_IP> -Port 30004
   ```

3. 按兩下 `start_monitor.bat` 啟動監控器，或執行：

   ```powershell
   .\.venv\Scripts\python.exe server.py
   ```

4. 在 Chrome/Edge 開啟 `http://127.0.0.1:8080`。

## 讀取的資料

以下每個欄位都是**純輸出**。絕不會發送任何輸入暫存器、URScript 呼叫或運動指令。

| 欄位 | 說明 |
|---|---|
| `timestamp` | 控制器時鐘，用作即時遙測的判斷依據 |
| `actual_q` | 六個實際關節角度 |
| `actual_TCP_pose` | TCP 位置與姿態 |
| `actual_TCP_speed` | TCP 速度；會另外計算線速度與角速度大小 |
| `actual_joint_current` | 每個關節的電流（安培） |
| `joint_temperatures` | 每個關節的溫度（°C）；儀表板在 60 °C 時警示、70 °C 時標記為危險 |
| `robot_mode` | 以依狀態變化的顏色顯示 |
| `safety_mode` | 以依嚴重程度變化的顏色顯示 |
| `speed_scaling` | 已編程速度的百分比 |
| `actual_digital_input_bits` | 以十六進位遮罩顯示 |
| `actual_digital_output_bits` | 以十六進位遮罩顯示 |

數位分身使用 Universal Robots 官方的 UR10 視覺 DAE 網格與扁平化 URDF（`static/ur10.urdf`）。本機 URDF 載入器套用真實的 UR10 連桿／關節原點，模型會跟隨六個即時關節數值，且不會對量測姿態做鉗制。關節進度條採用 `static/joint_limits.json` 的標稱 ROS 規劃範圍；J3 的 ±180° 範圍僅是規劃／顯示提示，並非控制器安全限制。超出標稱範圍的數值仍會顯示，並以琥珀色標記。

## 儀表板行為

- **即時串流優先。** 儀表板訂閱 `GET /api/stream`，一個以 `event_stream_frequency`（預設 10 Hz）發佈的 Server-Sent Events 串流。若 `EventSource` 無法使用或串流中斷，會自動改用 `GET /api/state` 輪詢，並在 Events 記錄中說明。
- **趨勢圖。** 關節角度、工具速度與關節電流會在瀏覽器內以有上限的 600 點視窗繪製。資料不會上傳，重新載入後緩衝區即清空。
- **3D 快捷鍵。** 點選 3D 視圖後，`R` 重設相機、`G` 切換參考網格。
- **錄製。** 儀表板可將遙測數據直接串流寫入監控主機上的 CSV 檔案。詳見下文。
- **凍結。** `Space` 會暫停所有面板，方便閱讀某個瞬間的數值。串流會在背景繼續運行；啟用時標題列會顯示 `FROZEN` 標籤。
- **跳變警示。** 若任一關節在兩個取樣之間移動超過 `25°`，該關節會在 Joints 卡片標紅並顯示橫幅。由於監控器是唯讀的，它只能_回報_跳變，無法阻止。
- **飛行記錄器。** 最後約 20 000 個 TCP 點會保存在主機的環形緩衝區，並繪製成 3D 軌跡。`GET /api/trajectory` 可取得資料，`POST /api/trajectory/clear`（需 token）可清空緩衝區。
- **重播。** 按 `P` 可以 0.25×–4× 速度前後拖曳檢視已記錄的軌跡，機器人模型上會顯示移動標記。
- **關節限制環。** `L` 可切換每個關節的限制環；當關節離開其標稱規劃範圍時會轉為琥珀色。
- **延遲。** 當 Mac 控制端的 heartbeat 內含 `sent_at` 欄位時，Link Diagnostics 卡片會顯示傳送至接收的延遲。詳見下文_延遲_。
- **基線比較。** 已完成的錄製可載入為基線；圖表會在共用時間軸上同時繪製基線與即時曲線。
- **主題。** 開關可在深色與淺色配置間切換，並將選擇記在 `localStorage`。
- **快照／報告。** `C` 可匯出目前視圖。詳見下文_快照與報告_。
- **說明。** `?` 開啟鍵盤快捷鍵卡片；所有快捷鍵都列在那裡。

### 鍵盤快捷鍵

| 按鍵 | 功能 |
|---|---|
| `Space` | 凍結／恢復所有面板 |
| `S` | 切換 3D 軌跡 |
| `1`–`6` | 高亮單一關節 |
| `L` | 切換關節限制環 |
| `J` | 切換跳變警示 |
| `P` | 播放／暫停重播 |
| `C` | 匯出快照或報告 |
| `T` | 切換主題 |
| `R` | 重設 3D 相機 |
| `G` | 切換參考網格 |
| `?` | 顯示或隱藏快捷鍵卡片 |

## 延遲

Link Diagnostics 卡片量測 heartbeat 從傳送到送達所需的時間。可透過 `latency_mode` 選擇兩種模式：

| 模式 | 量測內容 | 前提條件 |
|---|---|---|
| `monotonic`（預設） | 使用同一時鐘的傳送至接收時間，在單一主機上最為可靠 | 傳送者在 heartbeat 內容加入 `sent_at`（秒，源自單調時鐘） |
| `clock_sync` | 使用牆上時鐘量測 Mac → Windows 的完整路徑 | 兩台機器必須完成 NTP 對時；漂移值會與數據一併回報 |

超出 `0 s – 60 s` 的樣本會視為時鐘雜訊而捨棄，並計入 `rejected`。`GET /api/latency` 會回傳 `last_ms`、`mean_ms`、`p95_ms`、`min_ms`、`max_ms`、`samples`、`rejected` 與目前 `mode`。

## 診斷

`GET /api/diagnostics` 回報監控器執行期間收集的連線健康狀況：收到的總樣本數、連線次數、重新連線次數、最後一次斷線原因、訂閱者數量與丟棄的 SSE 幀數。這些是唯讀統計——不會寫回控制器。

## 快照與報告

`C`（或 Snapshot 按鈕）可將 3D 視圖匯出為 PNG。若正在錄製，同一操作亦可產生獨立的 HTML 報告，內含即時數值、近期趨勢表與渲染的 3D 影像。兩種檔案都在瀏覽器下載；不會上傳任何資料。

## HTTP API

| 方法 | 路徑 | 驗證 | 用途 |
|---|---|---|---|
| `GET` | `/api/state` | 無 | 完整遙測快照（狀態、延遲、軌跡狀態、訂閱者） |
| `GET` | `/api/stream` | 無 | Server-Sent Events 遙測串流 |
| `GET` | `/api/config` | 無 | 非機密設定 |
| `GET` | `/api/trajectory` | 無 | 飛行記錄器資料點 |
| `POST` | `/api/trajectory/clear` | token | 清空飛行記錄器 |
| `GET` | `/api/latency` | 無 | 延遲統計 |
| `GET` | `/api/diagnostics` | 無 | 連線與訂閱者計數 |
| `GET` | `/api/baseline` | 無 | 供比較用的基線時間軸 |
| `POST` | `/api/control/heartbeat` | token | 控制端 heartbeat（同時夾帶結構化遙測） |
| `GET` | `/api/recording` | 無 | 錄製狀態、時長與檔案清單 |
| `POST` | `/api/recording/start` | token | 開始 CSV 錄製 |
| `POST` | `/api/recording/stop` | token | 停止目前的錄製 |
| `GET` | `/api/recording/download/<name>` | 無 | 從 `recording_directory` 下載 `.csv` |

需要 token 的端點會從 `X-Heartbeat-Token` 讀取共享密鑰。

## 將遙測錄製為 CSV

錄製在啟動前保持關閉，而且只寫入監控主機——絕不會寫入機器人。

```powershell
# 開始（需要 heartbeat token）
curl.exe -X POST http://127.0.0.1:8080/api/recording/start `
  -H "X-Heartbeat-Token: $env:UR_MONITOR_HEARTBEAT_TOKEN"

# 查看狀態、時長與列數
curl.exe http://127.0.0.1:8080/api/recording

# 停止
curl.exe -X POST http://127.0.0.1:8080/api/recording/stop `
  -H "X-Heartbeat-Token: $env:UR_MONITOR_HEARTBEAT_TOKEN"
```

檔案會存入 `recording_directory`（預設 `recordings/`），並可透過 `GET /api/recording/download/<name>.csv` 下載。只有該目錄內的純 `.csv` 檔名可解析；其他任何路徑都回傳 404。

錄製會在 `recording_max_seconds`（預設 3600）後自動停止，並回報 `auto_stopped: true`。CSV 表頭固定不變，記錄於 `recording.py` 的 `RECORDING_COLUMNS`。

> 錄製與 heartbeat 端點使用同一組密鑰，因為它會在主機上寫入檔案。它絕不會接觸機器人。

## 檔案

- `server.py` — HTTP 處理器與程式進入點；負責串接以下模組
- `monitor_config.py` — `config.json` / `.env` 的載入、驗證與快取
- `telemetry_state.py` — 共用狀態儲存、飛行記錄器軌跡緩衝與延遲追蹤
- `rtde_client.py` — 純輸出 RTDE 讀取執行緒與重連迴圈
- `events.py` — Server-Sent Events 代理與狀態發佈器
- `recording.py` — CSV 錄製工作階段與固定欄位集
- `controller.py` — Mac 控制端 heartbeat 儲存、節流與結構化遙測
- `monitor.xml` — 純輸出 RTDE recipe
- `static/index.html` — 儀表板外殼與樣式（深色與淺色主題）
- `static/app.js` — 遙測儀表板、圖表、驗證、凍結、重播、快捷鍵與匯出
- `static/scene.js` — 本機 Three.js / URDF 數位分身，含軌跡、限制環、相機快捷鍵與影像擷取
- `static/telemetry.js` — 可測試的輪詢、SSE 用戶端、狀態驗證、歷史、圖表與軌跡輔助函式
- `static/replay.js` — 軌跡重播的時間軸拖曳器
- `static/theme.js` — 儀表板共用的主題控制器
- `static/vendor/` — 鎖定版本的本機 Three.js 與 URDF 載入器模組（含授權）
- `static/ur10.urdf` — 瀏覽器使用的扁平化 UR10 運動鏈
- `static/joint_limits.json` — 六個關節的標稱進度條範圍
- `static/meshes/ur10/` — 官方 UR10 視覺網格
- `config.example.json` — 公開設定範本；複製為被忽略的 `config.json` 作本機設定
- `.env` — 本機 heartbeat 密鑰（被忽略；請複製 `.env.example`）
- `start_monitor.bat` — 一鍵啟動器
- `tests/` — Python 單元測試
- `tests/js/` — 瀏覽器模組單元測試（Node 內建執行器）
- `tools/build_models.py` — 從 `vendor/` 重新產生 `static/ur10.urdf` 與網格
- `tools/smoke_test.py` — 針對一次性伺服器的端對端 HTTP 煙霧測試
- `pyproject.toml` — ruff 與 mypy 設定

## 機器人模型

數位分身渲染的是 **UR10**。`config.json` 內的 `robot_model` 只接受 `UR10`，與本專案監控的機械臂一致。執行一次 `tools/build_models.py` 即可從 `vendor/Universal_Robots_ROS2_Description`（重新）產生 `static/ur10.urdf` 與 `static/meshes/ur10/`。

日後若要支援其他機型，請在 `tools/build_models.py` 的 `MODELS` 加入其 `urXY` -> `URXY` 條目，並在 `monitor_config._validate_config` 的允許清單加入同名稱，然後重新執行腳本——腳本也會清除已移除機型殘留的 URDF 或網格資料夾。本發布版本僅包含 UR10 的建置輸入。支援其他機型需要另行取得並審查其上游檔案與適用授權。

## 設定

所有設定值都存於 `config.json`，載入時會驗證。若編輯後格式錯誤，系統會繼續使用最後一次正確的設定並記錄警告；首次載入則必須有效。

| 鍵 | 預設值 | 意義 |
|---|---|---|
| `robot_ip` | `192.0.2.10` | URSim / 控制器位址 |
| `rtde_port` | `30004` | RTDE 連接埠 |
| `rtde_frequency` | `25.0` | 輸出 recipe 頻率（Hz） |
| `http_host` | `127.0.0.1` | 安全的本機預設值；僅在可信任網路上明確啟用區網綁定 |
| `http_port` | `8080` | HTTP 連接埠 |
| `monitor_advertised_ip` | `192.0.2.20` | 顯示給 Mac 的位址；留空表示「由路由推導」 |
| `controller_heartbeat_timeout` | `4.0` | heartbeat 視為過期前的秒數 |
| `cors_allowed_origins` | `[]` | 額外的精確瀏覽器來源；拒絕萬用字元 |
| `heartbeat_max_failures` | `5` | 單一 IP 在鎖定前允許的 token 失敗次數 |
| `heartbeat_lockout_seconds` | `60.0` | 鎖定持續時間；`0` 表示停用鎖定 |
| `event_stream_frequency` | `10.0` | SSE 發佈頻率（Hz） |
| `recording_directory` | `recordings` | CSV 輸出的相對目錄 |
| `recording_max_seconds` | `3600.0` | 錄製長度的硬性上限 |
| `robot_model` | `UR10` | 數位分身機型。僅建置並接受 `UR10` |
| `latency_mode` | `monotonic` | `monotonic`（單一時鐘）或 `clock_sync`（NTP 對時主機） |
| `trajectory_capacity` | `20000` | 飛行記錄器環形緩衝區的點數上限 |
| `trajectory_sample_hz` | `25.0` | 軌跡點儲存的最大頻率 |

## 網路注意事項

若 Windows 主機與 Mac 需要直接連到 URSim VM，請在 VirtualBox 使用 **Bridged Adapter**。監控器直接連接 URSim，並非 Mac Vision 控制器的代理。

若 VM 取得新位址，請編輯 `config.json` 並修改 `robot_ip`。

## 查看目前 Mac 控制端 IP

儀表板有一張 **Control Client** 卡片。當 Mac Vision 控制端每秒向監控器發送一次通過 token 驗證的 heartbeat 時，它就能可靠地顯示 IP。Windows 會自行記錄 HTTP 來源位址，因此顯示的 IP 並非應用程式自行提供的值。heartbeat 用於識別傳送者程序；並不能證明機器人正在執行運動指令。

- Windows 監控器區網位址：`192.0.2.20`
- Heartbeat 端點：`http://192.0.2.20:8080/api/control/heartbeat`
- 整合指南：`CONTROLLER_HEARTBEAT.md`
- 即用型 Mac 輔助程式：`mac_controller_heartbeat.py`
- Heartbeat 密鑰：被忽略的 `.env` 或處理程序環境中的 `UR_MONITOR_HEARTBEAT_TOKEN`——請勿 commit 或外洩。

只有 RTDE 遙測**無法**列出其他用戶端的 IP。若 Mac 應用程式未發送 heartbeat，卡片會刻意顯示 `Unknown`，而不是猜測。

範例設定只在本機監聽。若要讓 Mac 存取 heartbeat API，請明確啟用區網綁定。若 Mac 無法連線，請在 Windows 防火牆為私人網路允許 TCP 8080 入站。

同一來源位址的錯誤 token 達到 `heartbeat_max_failures` 次後，會回傳 `429` 並附帶 `Retry-After` 標頭。鎖定期間即使 token 正確，也必須等待鎖定結束。鎖定結束後，成功通過驗證的請求會清除失敗計數。

## 最小化 UR10 模型來源

本發布版本僅包含 `tools/build_models.py` 所需的 UR10 設定與視覺網格輸入。不含上游 Git metadata 或其他機型。瀏覽器在執行時使用 `static/`；請保留最小化的 vendor 輸入以供重新產生與測試。兩份網格副本皆已移除作者工具、貢獻者與建立／修改時間等 metadata，但未改變幾何、單位或座標軸。上游授權條文均已保留。

## 授權與第三方聲明

原始專案程式碼尚未選定授權。公開可見不等於開源授權。擁有者必須先選定授權，才能稱為開源發布。第三方元件保留其自身授權；見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 安全與部署限制

這是監控輔助工具，不是安全裝置。它無法停止或阻止機器人運動。包括遙測與錄製下載在內的讀取端點均未驗證。對非瀏覽器用戶端而言，CORS 並非存取控制邊界。請僅在可信任網路上使用，並在發布即時錄製、截圖或報告前，先檢查其中是否含部署 metadata。

準備工作檢查與未解決事項見 [PUBLIC_RELEASE_CHECK.md](PUBLIC_RELEASE_CHECK.md)。

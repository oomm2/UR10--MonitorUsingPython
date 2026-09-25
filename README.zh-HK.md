# UR10——MonitorUsingPython

[English](README.md) | **廣東話** | [繁體中文](README.zh-Hant.md) | [简体中文](README.zh-Hans.md)

[![CI](https://github.com/oomm2/UR10--MonitorUsingPython/actions/workflows/ci.yml/badge.svg)](https://github.com/oomm2/UR10--MonitorUsingPython/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)

一個喺 Windows 上面行嘅 UR10 RTDE 唯讀遙測監控器。

以下所有 `192.0.2.x` 位址都係文件範例，唔係實際部署位址。
Mac Vision 程式繼續係唯一嘅控制器：呢個 app 只用 RTDE **純輸出** recipe，唔會發送 URScript、運動指令或者 RTDE 輸入暫存器。

成個 repo 刻意保持唯讀——入面冇任何 input recipe、URScript 或者運動指令。

![UR10 Monitor dashboard](docs/dashboard.png)
_Dashboard：即時 SSE 遙測、UR10 digital twin 同趨勢圖（合成示範數據）。_

## 架構

```text
Mac: Vision hand tracking  ──(your control path)──>  URSim / UR controller
Windows: this monitor       ──(RTDE outputs only)──> URSim / UR controller
VirtualBox: Bridged Adapter; URSim IP = 192.0.2.10
```

監控器可以同 Mac 控制端同時行，因為佢只係訂閱遙測數據。

## 安裝（Windows PowerShell）

```powershell
cd path\to\UR10--MonitorUsingPython
Copy-Item config.example.json config.json
# 起 server 之前，先為自己嘅機械人同 monitor 改好 config.json。
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

RTDE 依賴係 Universal Robots 官方嘅 `RTDE_Python_Client_Library`，鎖定咗一個已知上游 commit，確保安裝結果可以重現。

瀏覽器 dashboard 用嘅係鎖定版本嘅本地 Three.js 同 `urdf-loader` 副本；載入 3D 視圖唔使上網。

範例設定預設將 HTTP 綁定喺 loopback。如果想喺可信嘅 LAN 收 heartbeat，就要為自己個網絡明確設定 `http_host` 同 `monitor_advertised_ip`。唔好將個 server 暴露喺互聯網。

### 選配嘅 heartbeat 驗證

將 `.env.example` 複製做 `.env`，跟入面說明產生一個新嘅私人 token，然後喺控制端設定同一個 token。千祈唔好 commit `.env`，亦唔好喺真實部署用測試 token。冇 token 嘅話，需要驗證嘅寫入端點會保持停用；唯讀遙測照常用得。

開發檢查（先由範例建立本機 `config.json`）：

```powershell
# Python 單元測試（唔會連接機械人）
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

# Lint 同型別檢查
.\.venv\Scripts\python.exe -m pip install ruff mypy
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m mypy

# 瀏覽器端單元測試（Node 20+；唔使 npm install）
node --test "tests/js/*.test.mjs"

# 由 vendor/ 重新產生 UR10 URDF 同 mesh
.\.venv\Scripts\python.exe tools\build_models.py

# 端對端煙霧測試：喺一次性 port 起 server，逐個 endpoint 測。
# 唔會開 RTDE 連線，亦唔會掂到機械人。
.\.venv\Scripts\python.exe tools\smoke_test.py
```

## 執行

1. 喺 VirtualBox 用 **Bridged Adapter** 起 URSim，並將 `config.json` 入面嘅 `robot_ip` 設定為佢實際位址。
2. 測試 RTDE port：

   ```powershell
   Test-NetConnection <ROBOT_IP> -Port 30004
   ```

3. 撳兩下 `start_monitor.bat` 起 monitor，或者行：

   ```powershell
   .\.venv\Scripts\python.exe server.py
   ```

4. 喺 Chrome/Edge 開 `http://127.0.0.1:8080`。

## 會讀取嘅數據

以下每個欄位都係**純輸出**。唔會發送任何輸入暫存器、URScript 呼叫或者運動指令。

| 欄位 | 說明 |
|---|---|
| `timestamp` | 控制器時鐘，用嚟判斷遙測係咪即時 |
| `actual_q` | 六個實際關節角度 |
| `actual_TCP_pose` | TCP 位置同姿態 |
| `actual_TCP_speed` | TCP 速度；會另外計線速度同角速度大細 |
| `actual_joint_current` | 每個關節電流（安培） |
| `joint_temperatures` | 每個關節溫度（°C）；dashboard 喺 60 °C 警示、70 °C 標記危險 |
| `robot_mode` | 按狀態用唔同顏色顯示 |
| `safety_mode` | 按嚴重程度用唔同顏色顯示 |
| `speed_scaling` | 已編程速度嘅百分比 |
| `actual_digital_input_bits` | 以十六進制遮罩顯示 |
| `actual_digital_output_bits` | 以十六進制遮罩顯示 |

Digital Twin 用 Universal Robots 官方 UR10 視覺 DAE mesh 同扁平化 URDF（`static/ur10.urdf`）。本地 URDF loader 會套用真實 UR10 link／關節原點，模型跟六個即時關節值郁，唔會鉗制度量出嚟嘅姿態。關節 bar 用 `static/joint_limits.json` 嘅標稱 ROS 規劃範圍；J3 嘅 ±180° 只係規劃／顯示提示，唔係控制器安全限制。超出標稱範圍嘅數值照樣顯示，並以琥珀色標記。

## Dashboard 行為

- **即時串流優先。** dashboard 訂閱 `GET /api/stream`——一個以 `event_stream_frequency`（預設 10 Hz）發佈嘅 Server-Sent Events 串流。如果 `EventSource` 用唔到或者串流斷咗，會自動轉返 `GET /api/state` 輪詢，並喺 Events log 話你知。
- **趨勢圖。** 關節角度、工具速度同關節電流會喺瀏覽器入面，用有上限嘅 600 點視窗畫出嚟。數據唔會上載，reload 之後 buffer 就清空。
- **3D 快捷鍵。** 撳入 3D 視圖之後，`R` 重設相機、`G` 切換參考網格。
- **錄製。** dashboard 可以將遙測數據直接串流寫入 monitor 主機嘅 CSV 檔。詳見下文。
- **凍結。** `Space` 會暫停晒所有面板，等你睇清楚某個瞬間嘅數字。串流會喺背景照行；啟用時 header 會顯示 `FROZEN` 標籤。
- **跳變警示。** 如果任何關節喺兩個取樣之間郁超過 `25°`，有關關節會喺 Joints 卡片標紅，並彈出橫幅。因為 monitor 係唯讀，佢只可以_匯報_跳變，冇得擋。
- **飛行記錄器。** 最後約 20 000 個 TCP 點會存喺主機嘅環形緩衝區，並畫做 3D 軌跡。`GET /api/trajectory` 攞數據，`POST /api/trajectory/clear`（要 token）清空 buffer。
- **重播。** 撳 `P` 可以用 0.25×–4× 前後掃放已記錄嘅軌跡，機械人模型上面有移動標記。
- **關節限制環。** `L` 切換每個關節嘅限制環；關節離開標稱規劃範圍時會變琥珀色。
- **延遲。** 當 Mac 控制端嘅 heartbeat 帶 `sent_at` 欄位時，Link Diagnostics 卡會顯示傳送去接收嘅延遲。詳見下文_延遲_。
- **基線比較。** 完成咗嘅錄製可以載入做基線；圖表會喺同一條時間軸上面畫埋基線同即時曲線。
- **主題。** 開關喺深色同淺色配色之間切換，選擇會記喺 `localStorage`。
- **語言。** header 個選擇器可以將成個 dashboard 切換做 English、廣東話、繁體中文或者简体中文，選擇會記喺 `localStorage`。Events log 保持英文。
- **快照／報告。** `C` 匯出而家個畫面。詳見下文_快照與報告_。
- **說明。** `?` 開關鍵盤快捷鍵卡；所有快捷鍵都列晒喺入面。

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
| `?` | 顯示或隱藏快捷鍵卡 |

## 延遲

Link Diagnostics 卡量度 heartbeat 由發出到到達需時幾耐。透過 `latency_mode` 可以揀兩種模式：

| 模式 | 量度內容 | 前提條件 |
|---|---|---|
| `monotonic`（預設） | 用同一個時鐘量發送至接收時間，喺同一部主機上面最誠實 | 發送方喺 heartbeat body 入面加入 `sent_at`（秒，源自單調時鐘） |
| `clock_sync` | 用牆鐘量 Mac → Windows 全程 | 兩部機要 NTP 對時；漂移會連同數據一齊回報 |

超出 `0 s – 60 s` 嘅樣本會當時鐘雜訊掉咗佢，並計入 `rejected`。`GET /api/latency` 回傳 `last_ms`、`mean_ms`、`p95_ms`、`min_ms`、`max_ms`、`samples`、`rejected` 同目前 `mode`。

## 診斷

`GET /api/diagnostics` 匯報 monitor 行緊期間收集嘅連線健康狀況：收到嘅總樣本數、連線次數、重連次數、最後斷線原因、訂閱者數量同丟棄咗嘅 SSE 幀數。呢啲係唯讀統計——唔會寫返去控制器。

## 快照與報告

`C`（或者 Snapshot 撳鈕）將 3D 視圖匯出做 PNG。如果正在錄製，同一個動作可以整到一份獨立 HTML 報告，入面有即時數值、近期趨勢表同渲染好嘅 3D 影像。兩種檔案都係喺瀏覽器度下載；唔會上載任何嘢。

## HTTP API

| 方法 | 路徑 | 驗證 | 用途 |
|---|---|---|---|
| `GET` | `/api/state` | 無 | 完整遙測快照（狀態、延遲、軌跡狀態、訂閱者） |
| `GET` | `/api/stream` | 無 | Server-Sent Events 遙測串流 |
| `GET` | `/api/config` | 無 | 非機密設定 |
| `GET` | `/api/trajectory` | 無 | 飛行記錄器數據點 |
| `POST` | `/api/trajectory/clear` | token | 清空飛行記錄器 |
| `GET` | `/api/latency` | 無 | 延遲統計 |
| `GET` | `/api/diagnostics` | 無 | 連線同訂閱者計數 |
| `GET` | `/api/baseline` | 無 | 用嚟比較嘅基線時間軸 |
| `POST` | `/api/control/heartbeat` | token | 控制端 heartbeat（同時帶結構化遙測） |
| `GET` | `/api/recording` | 無 | 錄製狀態、時長同檔案清單 |
| `POST` | `/api/recording/start` | token | 開始 CSV 錄製 |
| `POST` | `/api/recording/stop` | token | 停止目前錄製 |
| `GET` | `/api/recording/download/<name>` | 無 | 由 `recording_directory` 下載 `.csv` |

需要 token 嘅端點會由 `X-Heartbeat-Token` 讀取共享密鑰。

## 將遙測錄做 CSV

錄製喺啟動之前係關閉嘅，而且只會寫入 monitor 主機——絕唔會寫入機械人。

```powershell
# 開始（需要 heartbeat token）
curl.exe -X POST http://127.0.0.1:8080/api/recording/start `
  -H "X-Heartbeat-Token: $env:UR_MONITOR_HEARTBEAT_TOKEN"

# 檢查狀態、時長同列數
curl.exe http://127.0.0.1:8080/api/recording

# 停止
curl.exe -X POST http://127.0.0.1:8080/api/recording/stop `
  -H "X-Heartbeat-Token: $env:UR_MONITOR_HEARTBEAT_TOKEN"
```

檔案會存入 `recording_directory`（預設 `recordings/`），可以由 `GET /api/recording/download/<name>.csv` 下載。只有該目錄入面單純嘅 `.csv` 檔名會解析；其他任何嘢都回 404。

錄製會喺 `recording_max_seconds`（預設 3600）之後自動停，並回報 `auto_stopped: true`。CSV 表頭係固定嘅，記錄喺 `recording.py` 嘅 `RECORDING_COLUMNS`。

> 錄製同 heartbeat 端點用同一組密鑰，因為佢會喺主機寫檔。佢絕唔會掂機械人。

## 檔案

- `server.py` — HTTP 處理器同程式入口；負責砌埋以下模組
- `monitor_config.py` — `config.json` / `.env` 嘅載入、驗證同快取
- `telemetry_state.py` — 共用狀態儲存、飛行記錄器軌跡 buffer 同延遲追蹤
- `rtde_client.py` — 純輸出 RTDE 讀取 thread 同重連 loop
- `events.py` — Server-Sent Events broker 同狀態發佈器
- `recording.py` — CSV 錄製 session 同固定欄位集
- `controller.py` — Mac 控制端 heartbeat 儲存、節流同結構化遙測
- `monitor.xml` — 純輸出 RTDE recipe
- `static/index.html` — dashboard 外殼同樣式（深色同淺色主題）
- `static/app.js` — 遙測 dashboard、圖表、驗證、凍結、重播、快捷鍵同匯出
- `static/scene.js` — 本地 Three.js / URDF digital twin，有軌跡、限制環、相機快捷鍵同影像擷取
- `static/telemetry.js` — 可以測試嘅輪詢、SSE client、狀態驗證、歷史、圖表同軌跡輔助函式
- `static/replay.js` — 軌跡重播用嘅時間軸 scrubber
- `static/theme.js` — dashboard 共用嘅主題控制器
- `static/vendor/` — 鎖定版本嘅本地 Three.js 同 URDF loader 模組（連授權）
- `static/ur10.urdf` — 瀏覽器用嘅扁平化 UR10 運動鏈
- `static/joint_limits.json` — 六個關節 bar 嘅標稱範圍
- `static/meshes/ur10/` — 官方 UR10 視覺 mesh
- `config.example.json` — 公開設定範本；複製做被 ignore 嘅 `config.json` 做本機設定
- `.env` — 本地 heartbeat 密鑰（被 ignore；複製 `.env.example`）
- `start_monitor.bat` — 一鍵啟動器
- `tests/` — Python 單元測試
- `tests/js/` — 瀏覽器模組單元測試（Node 內建 runner）
- `tools/build_models.py` — 由 `vendor/` 重新產生 `static/ur10.urdf` 同 mesh
- `tools/smoke_test.py` — 針對一次性 server 嘅端對端 HTTP 煙霧測試
- `pyproject.toml` — ruff 同 mypy 設定

## 機械人模型

Digital Twin 渲染嘅係 **UR10**。`config.json` 入面嘅 `robot_model` 只接受 `UR10`，同呢個 project 監控嘅機械臂一致。行一次 `tools/build_models.py`，就可以由 `vendor/Universal_Robots_ROS2_Description`（重新）產生 `static/ur10.urdf` 同 `static/meshes/ur10/`。

日後想支援其他機型：喺 `tools/build_models.py` 嘅 `MODELS` 加返個 `urXY` -> `URXY` entry，喺 `monitor_config._validate_config` 嘅允許清單加同名，再行多次個 script——script 亦會清走你移除咗嘅機型殘留嘅 URDF 或者 mesh 資料夾。今次發布只包含 UR10 嘅建置輸入。支援其他機型要自行攞同審查佢嘅上游檔案同適用授權。

## 設定

所有設定值都喺 `config.json`，載入時會驗證。改壞咗會繼續用最後一次正確嘅設定，並記 warning；第一次載入就一定要有效。

| 鍵 | 預設值 | 意思 |
|---|---|---|
| `robot_ip` | `192.0.2.10` | URSim / 控制器位址 |
| `rtde_port` | `30004` | RTDE port |
| `rtde_frequency` | `25.0` | 輸出 recipe 頻率（Hz） |
| `http_host` | `127.0.0.1` | 安全嘅本地預設值；只會喺可信網絡先明確開 LAN bind |
| `http_port` | `8080` | HTTP port |
| `monitor_advertised_ip` | `192.0.2.20` | 顯示畀 Mac 嘅位址；留空即係「由路由推導」 |
| `controller_heartbeat_timeout` | `4.0` | heartbeat 視為過期前嘅秒數 |
| `cors_allowed_origins` | `[]` | 額外嘅精確瀏覽器 origin；唔接受萬用字元 |
| `heartbeat_max_failures` | `5` | 單一 IP 鎖定之前嘅 token 失敗次數 |
| `heartbeat_lockout_seconds` | `60.0` | 鎖定時間；`0` 即停用鎖定 |
| `event_stream_frequency` | `10.0` | SSE 發佈頻率（Hz） |
| `recording_directory` | `recordings` | CSV 輸出嘅相對目錄 |
| `recording_max_seconds` | `3600.0` | 錄製長度硬上限 |
| `robot_model` | `UR10` | Digital Twin 機型。只會建置同接受 `UR10` |
| `latency_mode` | `monotonic` | `monotonic`（單一時鐘）或者 `clock_sync`（NTP 對時主機） |
| `trajectory_capacity` | `20000` | 飛行記錄器環形 buffer 嘅點數上限 |
| `trajectory_sample_hz` | `25.0` | 軌跡點儲存嘅最大頻率 |

## 網絡注意事項

如果 Windows 主機同 Mac 要直接連 URSim VM，喺 VirtualBox 用 **Bridged Adapter**。monitor 係直接連 URSim，唔係 Mac Vision 控制器嘅 proxy。

如果 VM 轉咗新位址，改 `config.json` 入面嘅 `robot_ip`。

## 睇目前 Mac 控制端 IP

dashboard 有一張 **Control Client** 卡。當 Mac Vision 控制端每秒向 monitor 發一次通過 token 驗證嘅 heartbeat，佢就可以可靠咁顯示 IP。Windows 會自己記錄 HTTP 來源位址，所以顯示嘅 IP 唔係 app 自己報嘅值。heartbeat 用嚟識別發送者程序；唔能證明機械人正在行運動指令。

- Windows monitor LAN 位址：`192.0.2.20`
- Heartbeat 端點：`http://192.0.2.20:8080/api/control/heartbeat`
- 整合指南：`CONTROLLER_HEARTBEAT.zh-HK.md`
- 即用 Mac helper：`mac_controller_heartbeat.py`
- Heartbeat 密鑰：被 ignore 嘅 `.env` 或者 process environment 入面嘅 `UR_MONITOR_HEARTBEAT_TOKEN`——唔好 commit 或者泄露。

齋 RTDE 遙測**唔會**提供其他 client IP 清單。如果 Mac app 冇發 heartbeat，張卡會刻意顯示 `Unknown`，唔會亂估。

範例設定只監聽本地。想 Mac 連到 heartbeat API，要明確開 LAN bind。如果 Mac 連唔上，喺 Windows 防火牆畀私人網絡嘅 TCP 8080 入站。

同一個位址錯 token 達到 `heartbeat_max_failures` 次之後，會回 `429` 連 `Retry-After` header。鎖定期間就算 token 啱，都要等鎖定完。完咗之後，成功通過驗證嘅請求會清返失敗計數。

## 最小化 UR10 模型來源

今次發布只包含 `tools/build_models.py` 需要嘅 UR10 設定同視覺 mesh 輸入。冇上游 Git metadata，亦冇其他機型。瀏覽器執行時用 `static/`；保留最細嘅 vendor 輸入用嚟重新產生同測試。兩份 mesh 副本都移除咗作者工具、貢獻者同建立／修改時間 metadata，但幾何、單位、座標軸不變。上游授權條文保留晒。

## 授權同第三方聲明

呢個 project 以 [MIT License](LICENSE) 發布。第三方元件保留自己嘅授權；見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 安全同部署限制

呢個係監控輔助工具，唔係安全裝置。佢冇得停或者擋機械人郁。讀取端點（包括遙測同錄製下載）都冇驗證。對非瀏覽器 client 嚟講，CORS 唔係存取控制邊界。只可以喺可信網絡用；發布即時錄製、截圖或者報告之前，先檢查入面有冇部署 metadata。

準備檢查同未解決事項見 [PUBLIC_RELEASE_CHECK.md](PUBLIC_RELEASE_CHECK.md)。

# 實機空氣牆量度工作紙（返學用）

目的：填好 `UR10_PythonCamCode/safety_config.py` 嘅 `REAL_WORKSPACE_*` 六個值，
令實體 UR10 嘅軟件空氣牆生效。預計需時 15–20 分鐘。

**帶去學校：** 呢個 FYP 資料夾（有 monitor + 工具）、 notebook、（需要嘅話）相機。

---

## 0. 開工前檢查

- [ ] Monitor 行緊：double-click `start_monitor.bat`，瀏覽器開 `http://127.0.0.1:8080`
      見到 **Connected**（綠燈）
- [ ] 部機嘅 PolyScope 可以入 backdrive/freedrive（個 dashboard 應該顯示 BACKDRIVE）
- [ ] 急停喺手邊、枱面清空

## 1. 量度（用工具，全程只讀唔寫）

開 terminal：

```bash
cd C:\Users\SingCheng\Desktop\FYP
.venv\Scripts\python.exe tools\measure_workspace.py
```

 freedrive 部機，將 TCP 推去六個極點（工具會即時更新 min/max）：

| 軸 | 推去邊 |
| --- | --- |
| X | 最遠離自己、最貼近自己 |
| Y | 最左、最右 |
| Z | 最高、最低 |

## 2. 有底座／枱面嘅特別注意

- 六個值係 **robot base frame**（米）：base 安裝面就係 Z=0 原點
- 底座／枱面／夾具**唔好包入個箱入面**：
  - `Z_MIN` 要喺枱面之上留返起碼幾 cm 嘅 margin
  - X/Y 嘅 min/max 要避開夾具同圍欄
- 箱愈細愈安全 — 只包你真正想個 app 活動嘅範圍

## 3. 收數據

1. 將 TCP park 喺你想做「安全原點」嘅位置（箱入面、遠離邊界）
2. 㩒 **Ctrl+C**
3. 工具會印出六行 `REAL_WORKSPACE_X_MIN: Optional[float] = ...` 同
   `REAL_SAFE_ORIGIN = (...)` — 影相／copy 低

## 4. 填入設定

開 `UR10_PythonCamCode\safety_config.py`，將六個 `REAL_WORKSPACE_*` 由 `None`
改成量到嘅值，`REAL_SAFE_ORIGIN` 都一樣。檢查：

- [ ] 每個軸 lower < upper
- [ ] 安全原點喺箱入面
- [ ] 單位係米、base frame

## 5. 驗證

1. 重開 `啟動 UR10 Vision.bat`
2. banner 應該由「工作區：未設定｜實際控制鎖定」變做已設定
3. 連機械人 → 用預設 **0.02 m/s** 慢速試推去牆：應該感受到減速帶，
   過界會 trip fault 停機（要重新啟動控制先再郁到）
4. 提醒：實體機冇自動返回原點 — 撞牆就停

## 6. 行埋 heartbeat（可選，dashboard 會顯示控制端）

```bash
set UR_MONITOR_HEARTBEAT_TOKEN=<.env 入面嗰串>
.venv\Scripts\python.exe mac_controller_heartbeat.py --name "Mac Vision controller"
```

---

**安全備忘：** 呢個係軟件牆（學術 prototype）。真正嘅安全層係 PolyScope
Installation → Safety 嘅 safety planes／limits（要 safety 密碼）＋實體急停。
兩邊都應該設。任何異常即按急停，唔好靠個 app。

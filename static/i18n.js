/**
 * Dashboard i18n: English, 廣東話, 繁體中文, 简体中文.
 *
 * Static chrome carries ``data-i18n`` / ``data-i18n-title`` attributes; dynamic
 * strings go through ``t(key, vars)``. Event-log lines intentionally stay in
 * English — they are timestamped technical records, not UI chrome. The chosen
 * language is persisted and survives reloads.
 */
export const LANGUAGES = ['en', 'zh-HK', 'zh-Hant', 'zh-Hans'];
export const LANGUAGE_LABELS = {
  en: 'English', 'zh-HK': '廣東話', 'zh-Hant': '繁體中文', 'zh-Hans': '简体中文',
};
export const STORAGE_KEY = 'ur-monitor-language';

export const MESSAGES = {
  transport_starting: {
    en: 'Starting…', 'zh-HK': '啟動中…', 'zh-Hant': '啟動中…', 'zh-Hans': '启动中…',
  },
  transport_sse: {
    en: 'SSE stream', 'zh-HK': 'SSE 串流', 'zh-Hant': 'SSE 串流', 'zh-Hans': 'SSE 流',
  },
  transport_poll: {
    en: 'HTTP polling', 'zh-HK': 'HTTP 輪詢', 'zh-Hant': 'HTTP 輪詢', 'zh-Hans': 'HTTP 轮询',
  },
  pill_frozen: {
    en: 'Frozen', 'zh-HK': '已凍結', 'zh-Hant': '已凍結', 'zh-Hans': '已冻结',
  },
  pill_connected: {
    en: 'Connected', 'zh-HK': '已連接', 'zh-Hant': '已連線', 'zh-Hans': '已连接',
  },
  pill_disconnected: {
    en: 'Disconnected', 'zh-HK': '未連接', 'zh-Hant': '未連線', 'zh-Hans': '未连接',
  },
  theme_title: {
    en: 'Toggle light/dark theme (T)', 'zh-HK': '切換深色／淺色主題 (T)',
    'zh-Hant': '切換深色／淺色主題 (T)', 'zh-Hans': '切换深色／浅色主题 (T)',
  },
  help_title: {
    en: 'Keyboard shortcuts (?)', 'zh-HK': '鍵盤快捷鍵 (?)',
    'zh-Hant': '鍵盤快捷鍵 (?)', 'zh-Hans': '键盘快捷键 (?)',
  },
  language_title: {
    en: 'Dashboard language', 'zh-HK': 'Dashboard 語言',
    'zh-Hant': '儀表板語言', 'zh-Hans': '仪表板语言',
  },
  subtitle: {
    en: 'Read-only RTDE telemetry · Windows', 'zh-HK': '唯讀 RTDE 遙測 · Windows',
    'zh-Hant': '唯讀 RTDE 遙測 · Windows', 'zh-Hans': '只读 RTDE 遥测 · Windows',
  },
  btn_theme: {
    en: 'Theme', 'zh-HK': '主題', 'zh-Hant': '主題', 'zh-Hans': '主题',
  },

  card_twin: {
    en: 'Digital Twin', 'zh-HK': '3D 數位分身', 'zh-Hant': '數位分身', 'zh-Hans': '数字孪生',
  },
  btn_trail: { en: 'Trail', 'zh-HK': '軌跡', 'zh-Hant': '軌跡', 'zh-Hans': '轨迹' },
  title_trail: {
    en: 'Show the recorded TCP trail (L)', 'zh-HK': '顯示記錄咗嘅 TCP 軌跡 (L)',
    'zh-Hant': '顯示已記錄的 TCP 軌跡 (L)', 'zh-Hans': '显示已记录的 TCP 轨迹 (L)',
  },
  btn_limits: { en: 'Limits', 'zh-HK': '限制環', 'zh-Hant': '限制環', 'zh-Hans': '限制环' },
  title_limits: {
    en: 'Show joint limit rings (J)', 'zh-HK': '顯示關節限制環 (J)',
    'zh-Hant': '顯示關節限制環 (J)', 'zh-Hans': '显示关节限制环 (J)',
  },
  btn_export: { en: 'Export', 'zh-HK': '匯出', 'zh-Hant': '匯出', 'zh-Hans': '导出' },
  title_export: {
    en: 'Export a PNG snapshot or HTML report (S)', 'zh-HK': '匯出 PNG 快照或 HTML 報告 (S)',
    'zh-Hant': '匯出 PNG 快照或 HTML 報告 (S)', 'zh-Hans': '导出 PNG 快照或 HTML 报告 (S)',
  },
  scene_loading: {
    en: 'Loading robot URDF…', 'zh-HK': '載入機械人 URDF…',
    'zh-Hant': '載入機器人 URDF…', 'zh-Hans': '加载机器人 URDF…',
  },
  scene_hint1: {
    en: 'Drag to orbit · Scroll to zoom', 'zh-HK': '拖曳旋轉 · 滾輪縮放',
    'zh-Hant': '拖曳旋轉 · 滾輪縮放', 'zh-Hans': '拖动旋转 · 滚轮缩放',
  },
  scene_hint2: {
    en: 'R reset · G grid · Space freeze · S export · 1-6 joint',
    'zh-HK': 'R 重設 · G 網格 · Space 凍結 · S 匯出 · 1-6 關節',
    'zh-Hant': 'R 重設 · G 網格 · Space 凍結 · S 匯出 · 1-6 關節',
    'zh-Hans': 'R 重置 · G 网格 · Space 冻结 · S 导出 · 1-6 关节',
  },
  scene_loaded_live: {
    en: '{model} model loaded · live pose', 'zh-HK': '{model} 模型已載入 · 即時姿態',
    'zh-Hant': '{model} 模型已載入 · 即時姿態', 'zh-Hans': '{model} 模型已加载 · 实时位姿',
  },
  scene_loaded_held: {
    en: '{model} model loaded · no live telemetry; pose held',
    'zh-HK': '{model} 模型已載入 · 冇即時遙測；保持目前姿態',
    'zh-Hant': '{model} 模型已載入 · 無即時遙測；保持目前姿態',
    'zh-Hans': '{model} 模型已加载 · 无实时遥测；保持当前位姿',
  },
  scene_loading_model: {
    en: 'Loading {model} model and meshes…', 'zh-HK': '載入 {model} 模型同 mesh…',
    'zh-Hant': '載入 {model} 模型與網格…', 'zh-Hans': '加载 {model} 模型与网格…',
  },
  scene_asset_error: {
    en: '3D asset load error — telemetry remains available',
    'zh-HK': '3D 資源載入失敗——遙測照常顯示',
    'zh-Hant': '3D 資源載入失敗——遙測照常顯示',
    'zh-Hans': '3D 资源加载失败——遥测照常显示',
  },
  scene_unavailable: {
    en: '3D unavailable — telemetry remains available',
    'zh-HK': '3D 用唔到——遙測照常顯示',
    'zh-Hant': '3D 無法使用——遙測照常顯示',
    'zh-Hans': '3D 不可用——遥测照常显示',
  },
  btn_play: { en: 'Play', 'zh-HK': '播放', 'zh-Hant': '播放', 'zh-Hans': '播放' },
  btn_pause: { en: 'Pause', 'zh-HK': '暫停', 'zh-Hant': '暫停', 'zh-Hans': '暂停' },
  btn_rewind: { en: 'Rewind', 'zh-HK': '返回起點', 'zh-Hant': '回到起點', 'zh-Hans': '回到起点' },
  btn_reload: { en: 'Reload', 'zh-HK': '重新載入', 'zh-Hant': '重新載入', 'zh-Hans': '重新加载' },
  title_reload: {
    en: 'Reload the trail from the server', 'zh-HK': '由伺服器重新載入軌跡',
    'zh-Hant': '從伺服器重新載入軌跡', 'zh-Hans': '从服务器重新加载轨迹',
  },
  replay_points: {
    en: '{index} / {total} points', 'zh-HK': '{index} / {total} 點',
    'zh-Hant': '{index} / {total} 點', 'zh-Hans': '{index} / {total} 点',
  },
  replay_path_title: {
    en: 'Path length {length} m', 'zh-HK': '路徑長度 {length} m',
    'zh-Hant': '路徑長度 {length} m', 'zh-Hans': '路径长度 {length} m',
  },

  card_status: {
    en: 'Robot Status', 'zh-HK': '機械人狀態', 'zh-Hant': '機器人狀態', 'zh-Hans': '机器人状态',
  },
  label_robot_ip: {
    en: 'Robot IP', 'zh-HK': '機械人 IP', 'zh-Hant': '機器人 IP', 'zh-Hans': '机器人 IP',
  },
  label_monitor_ip: {
    en: 'Windows monitor IP', 'zh-HK': 'Windows monitor IP',
    'zh-Hant': 'Windows 監控器 IP', 'zh-Hans': 'Windows 监控器 IP',
  },
  label_last_update: {
    en: 'Last update', 'zh-HK': '最後更新', 'zh-Hant': '最後更新', 'zh-Hans': '最后更新',
  },
  label_robot_mode: {
    en: 'Robot mode', 'zh-HK': '機械人模式', 'zh-Hant': '機器人模式', 'zh-Hans': '机器人模式',
  },
  label_safety_mode: {
    en: 'Safety mode', 'zh-HK': '安全模式', 'zh-Hant': '安全模式', 'zh-Hans': '安全模式',
  },
  label_speed: {
    en: 'Speed scaling', 'zh-HK': '速度比例', 'zh-Hant': '速度比例', 'zh-Hans': '速度比例',
  },
  label_role: {
    en: 'Monitor role', 'zh-HK': '監控器角色', 'zh-Hant': '監控器角色', 'zh-Hans': '监控器角色',
  },
  value_role: {
    en: 'RTDE output-only', 'zh-HK': 'RTDE 純輸出', 'zh-Hant': 'RTDE 純輸出', 'zh-Hans': 'RTDE 纯输出',
  },
  label_transport: {
    en: 'Data transport', 'zh-HK': '數據傳輸', 'zh-Hant': '資料傳輸', 'zh-Hans': '数据传输',
  },

  card_diag: {
    en: 'Link Diagnostics', 'zh-HK': '連線診斷', 'zh-Hant': '連線診斷', 'zh-Hans': '连接诊断',
  },
  label_reconnects: {
    en: 'Reconnects', 'zh-HK': '重連次數', 'zh-Hant': '重新連線次數', 'zh-Hans': '重连次数',
  },
  label_uptime: {
    en: 'Cumulative uptime', 'zh-HK': '累計上線時間', 'zh-Hant': '累計上線時間', 'zh-Hans': '累计在线时间',
  },
  label_samples_read: {
    en: 'Samples read', 'zh-HK': '已讀樣本', 'zh-Hant': '已讀樣本數', 'zh-Hans': '已读样本数',
  },
  label_trail_points: {
    en: 'Trail points', 'zh-HK': '軌跡點數', 'zh-Hant': '軌跡點數', 'zh-Hans': '轨迹点数',
  },
  label_subscribers: {
    en: 'SSE subscribers', 'zh-HK': 'SSE 訂閱者', 'zh-Hant': 'SSE 訂閱者', 'zh-Hans': 'SSE 订阅者',
  },
  label_sample_age: {
    en: 'Last sample age', 'zh-HK': '最後樣本時距', 'zh-Hant': '最後樣本時間', 'zh-Hans': '最后样本时距',
  },
  diag_no_disconnect: {
    en: 'No disconnect recorded in this session.',
    'zh-HK': '本 session 未記錄過斷線。',
    'zh-Hant': '本次工作階段未記錄斷線。',
    'zh-Hans': '本次会话未记录断线。',
  },
  diag_disconnect: {
    en: 'Last disconnect: {reason}', 'zh-HK': '最後斷線：{reason}',
    'zh-Hant': '最後斷線：{reason}', 'zh-Hans': '最后断线：{reason}',
  },

  card_latency: { en: 'Latency', 'zh-HK': '延遲', 'zh-Hant': '延遲', 'zh-Hans': '延迟' },
  label_mode: { en: 'Mode', 'zh-HK': '模式', 'zh-Hant': '模式', 'zh-Hans': '模式' },
  label_last_heartbeat: {
    en: 'Last heartbeat', 'zh-HK': '最後 heartbeat', 'zh-Hant': '最後 heartbeat', 'zh-Hans': '最后 heartbeat',
  },
  label_mean: { en: 'Mean', 'zh-HK': '平均', 'zh-Hant': '平均', 'zh-Hans': '平均' },
  label_p95: { en: 'p95', 'zh-HK': 'p95', 'zh-Hant': 'p95', 'zh-Hans': 'p95' },
  label_min_max: {
    en: 'Min / Max', 'zh-HK': '最小 / 最大', 'zh-Hant': '最小 / 最大', 'zh-Hans': '最小 / 最大',
  },
  label_samples_n: { en: 'Samples', 'zh-HK': '樣本', 'zh-Hant': '樣本', 'zh-Hans': '样本' },
  lat_note_monotonic: {
    en: 'Monotonic mode measures arrival delay without needing clock synchronisation with the Mac.',
    'zh-HK': 'Monotonic 模式量度到達延遲，唔使同 Mac 對時。',
    'zh-Hant': 'Monotonic 模式量測到達延遲，無需與 Mac 對時。',
    'zh-Hans': 'Monotonic 模式测量到达延迟，无需与 Mac 对时。',
  },
  lat_note_clock: {
    en: 'Clock-synced mode: heartbeat timestamps are compared directly against this host clock.',
    'zh-HK': 'Clock-sync 模式：heartbeat 時間戳直接同本機時鐘比較。',
    'zh-Hant': 'Clock-sync 模式：heartbeat 時間戳直接與本機時鐘比較。',
    'zh-Hans': 'Clock-sync 模式：heartbeat 时间戳直接与本机时钟比较。',
  },
  lat_note_clock_drift: {
    en: 'Clock-synced mode. Last offset vs Mac clock: {offset}s (drift {drift}s).',
    'zh-HK': 'Clock-sync 模式。與 Mac 時鐘嘅最近偏移：{offset}s（漂移 {drift}s）。',
    'zh-Hant': 'Clock-sync 模式。與 Mac 時鐘的最近偏移：{offset}s（漂移 {drift}s）。',
    'zh-Hans': 'Clock-sync 模式。与 Mac 时钟的最近偏移：{offset}s（漂移 {drift}s）。',
  },

  card_control: {
    en: 'Control Client', 'zh-HK': '控制端', 'zh-Hant': '控制端', 'zh-Hans': '控制端',
  },
  pill_active: { en: 'Active', 'zh-HK': '使用中', 'zh-Hant': '使用中', 'zh-Hans': '使用中' },
  pill_stale: { en: 'Stale', 'zh-HK': '過期', 'zh-Hant': '過期', 'zh-Hans': '过期' },
  pill_waiting: { en: 'Waiting', 'zh-HK': '等待中', 'zh-Hant': '等待中', 'zh-Hans': '等待中' },
  value_unknown: { en: 'Unknown', 'zh-HK': 'Unknown', 'zh-Hant': '未知', 'zh-Hans': '未知' },
  value_stale_state: {
    en: 'Heartbeat stale', 'zh-HK': 'Heartbeat 過期', 'zh-Hant': 'Heartbeat 過期', 'zh-Hans': 'Heartbeat 过期',
  },
  label_source_ip: {
    en: 'Observed source IP', 'zh-HK': '觀察到嘅來源 IP',
    'zh-Hant': '觀察到的來源 IP', 'zh-Hans': '观察到的来源 IP',
  },
  label_controller_name: {
    en: 'Controller name', 'zh-HK': '控制器名稱', 'zh-Hant': '控制器名稱', 'zh-Hans': '控制器名称',
  },
  label_reported_state: {
    en: 'Reported state', 'zh-HK': '回報狀態', 'zh-Hant': '回報狀態', 'zh-Hans': '上报状态',
  },
  label_protocol: {
    en: 'Control protocol', 'zh-HK': '控制協定', 'zh-Hant': '控制協定', 'zh-Hans': '控制协议',
  },
  label_heartbeat_age: {
    en: 'Heartbeat age', 'zh-HK': 'Heartbeat 時齡', 'zh-Hant': 'Heartbeat 時齡', 'zh-Hans': 'Heartbeat 时龄',
  },
  label_target_robot: {
    en: 'Target robot', 'zh-HK': '目標機械人', 'zh-Hant': '目標機器人', 'zh-Hans': '目标机器人',
  },
  label_vision_fps: {
    en: 'Vision FPS', 'zh-HK': 'Vision FPS', 'zh-Hant': 'Vision FPS', 'zh-Hans': 'Vision FPS',
  },
  label_confidence: {
    en: 'Tracking confidence', 'zh-HK': '追蹤置信度', 'zh-Hant': '追蹤信心度', 'zh-Hans': '追踪置信度',
  },
  label_gesture: {
    en: 'Current gesture', 'zh-HK': '目前手勢', 'zh-Hant': '目前手勢', 'zh-Hans': '当前手势',
  },
  label_dropped: {
    en: 'Dropped frames', 'zh-HK': '掉幀', 'zh-Hant': '丟棄幀數', 'zh-Hans': '丢帧',
  },
  label_inference: {
    en: 'Inference time', 'zh-HK': '推理時間', 'zh-Hant': '推理時間', 'zh-Hans': '推理时间',
  },
  label_heartbeats: {
    en: 'Heartbeats received', 'zh-HK': '已收 heartbeat', 'zh-Hant': '已收 heartbeat', 'zh-Hans': '已收 heartbeat',
  },
  control_note: {
    en: 'When the controller sends a heartbeat every second, Windows records the source IP from the HTTP connection itself. RTDE alone never exposes other clients\' IP addresses.',
    'zh-HK': '控制端每秒向 monitor 發 heartbeat 時，IP 會由 Windows 自動從 HTTP source address 記錄。RTDE 本身唔會提供其他 client 的 IP 清單。',
    'zh-Hant': '控制端每秒向監控器發送 heartbeat 時，IP 會由 Windows 自動從 HTTP 來源位址記錄。RTDE 本身不會提供其他用戶端的 IP 清單。',
    'zh-Hans': '控制端每秒向监控器发送 heartbeat 时，IP 会由 Windows 自动从 HTTP 来源地址记录。RTDE 本身不会提供其他客户端的 IP 列表。',
  },

  card_tcp: { en: 'TCP Pose', 'zh-HK': 'TCP 位姿', 'zh-Hant': 'TCP 姿態', 'zh-Hans': 'TCP 位姿' },
  label_tcp_position: {
    en: 'Position (x, y, z) m', 'zh-HK': '位置 (x, y, z) m',
    'zh-Hant': '位置 (x, y, z) m', 'zh-Hans': '位置 (x, y, z) m',
  },
  label_tcp_orientation: {
    en: 'Orientation (rx, ry, rz)', 'zh-HK': '姿態 (rx, ry, rz)',
    'zh-Hant': '姿態 (rx, ry, rz)', 'zh-Hans': '位姿 (rx, ry, rz)',
  },
  label_tcp_tool_speed: {
    en: 'Tool speed (linear / angular)', 'zh-HK': '工具速度 (線性 / 角)',
    'zh-Hant': '工具速度 (線性 / 角)', 'zh-Hans': '工具速度 (线性 / 角)',
  },

  card_joints: {
    en: 'Joint Angles', 'zh-HK': '關節角度', 'zh-Hant': '關節角度', 'zh-Hans': '关节角度',
  },
  joints_note_bars: {
    en: 'Bars show nominal ROS planning ranges.',
    'zh-HK': 'Bar 顯示標稱 ROS 規劃範圍。',
    'zh-Hant': '進度條顯示標稱 ROS 規劃範圍。',
    'zh-Hans': '进度条显示标称 ROS 规划范围。',
  },
  joints_note_reduced: {
    en: 'Reduced range: {list}.', 'zh-HK': '範圍較細：{list}。',
    'zh-Hant': '範圍較小：{list}。', 'zh-Hans': '范围较小：{list}。',
  },
  joints_note_amber: {
    en: 'Amber = outside nominal range. Live values and 3D poses are never clamped.',
    'zh-HK': '琥珀色 = 超出標稱範圍。實際數值同 3D 姿態永遠唔會被鉗制。',
    'zh-Hant': '琥珀色 = 超出標稱範圍。實際數值與 3D 姿態永遠不會被鉗制。',
    'zh-Hans': '琥珀色 = 超出标称范围。实际数值与 3D 位姿永不会被钳制。',
  },
  joints_note_fallback: {
    en: 'Range metadata unavailable; bars disabled. Numeric joint values remain available.',
    'zh-HK': '攞唔到範圍資料；bar 已停用。關節數值照常顯示。',
    'zh-Hant': '取不到範圍資料；進度條已停用。關節數值照常顯示。',
    'zh-Hans': '拿不到范围数据；进度条已禁用。关节数值照常显示。',
  },
  joints_title_within: {
    en: 'Within nominal display range {range}', 'zh-HK': '喺標稱顯示範圍 {range} 內',
    'zh-Hant': '在標稱顯示範圍 {range} 內', 'zh-Hans': '在标称显示范围 {range} 内',
  },
  joints_title_outside: {
    en: 'Outside nominal display range {range}', 'zh-HK': '超出標稱顯示範圍 {range}',
    'zh-Hant': '超出標稱顯示範圍 {range}', 'zh-Hans': '超出标称显示范围 {range}',
  },
  label_joint_current: {
    en: 'Joint current (A)', 'zh-HK': '關節電流 (A)', 'zh-Hant': '關節電流 (A)', 'zh-Hans': '关节电流 (A)',
  },
  label_joint_temp: {
    en: 'Joint temperature (°C)', 'zh-HK': '關節溫度 (°C)', 'zh-Hant': '關節溫度 (°C)', 'zh-Hans': '关节温度 (°C)',
  },
  label_digital_io: {
    en: 'Digital I/O', 'zh-HK': '數碼 I/O', 'zh-Hant': '數位 I/O', 'zh-Hans': '数字 I/O',
  },

  card_trends: { en: 'Trends', 'zh-HK': '趨勢', 'zh-Hant': '趨勢', 'zh-Hans': '趋势' },
  trends_label_joints: {
    en: 'Joint angles (degrees) · last 600 samples', 'zh-HK': '關節角度 (度) · 最近 600 個樣本',
    'zh-Hant': '關節角度 (度) · 最近 600 個樣本', 'zh-Hans': '关节角度 (度) · 最近 600 个样本',
  },
  trends_label_load: {
    en: 'Tool speed (m/s) and joint current (A)', 'zh-HK': '工具速度 (m/s) 同關節電流 (A)',
    'zh-Hant': '工具速度 (m/s) 與關節電流 (A)', 'zh-Hans': '工具速度 (m/s) 与关节电流 (A)',
  },
  trends_note: {
    en: 'Trends are kept in the browser only and are cleared on reload. Charts do not alter the RTDE session.',
    'zh-HK': '趨勢只會存在瀏覽器入面，reload 就清空。圖表唔會影響 RTDE session。',
    'zh-Hant': '趨勢只會存在瀏覽器內，重新載入即清空。圖表不會影響 RTDE 工作階段。',
    'zh-Hans': '趋势只保存在浏览器内，刷新即清空。图表不会影响 RTDE 会话。',
  },
  chart_waiting: {
    en: 'Waiting for telemetry…', 'zh-HK': '等待遙測數據…',
    'zh-Hant': '等待遙測資料…', 'zh-Hans': '等待遥测数据…',
  },

  card_baseline: {
    en: 'Baseline Comparison', 'zh-HK': '基線比較', 'zh-Hant': '基線比較', 'zh-Hans': '基线比较',
  },
  baseline_left: {
    en: 'Left · joint angles (deg)', 'zh-HK': '左 · 關節角度 (度)',
    'zh-Hant': '左 · 關節角度 (度)', 'zh-Hans': '左 · 关节角度 (度)',
  },
  baseline_right: {
    en: 'Right · joint angles (deg)', 'zh-HK': '右 · 關節角度 (度)',
    'zh-Hant': '右 · 關節角度 (度)', 'zh-Hans': '右 · 关节角度 (度)',
  },
  btn_compare: { en: 'Compare', 'zh-HK': '比較', 'zh-Hant': '比較', 'zh-Hans': '比较' },
  baseline_pick: {
    en: 'Pick two recordings to compare Mac control against a manual jog run.',
    'zh-HK': '揀兩段錄影，比較 Mac 控制同手動 jog。',
    'zh-Hant': '選兩段錄製，比較 Mac 控制與手動微調。',
    'zh-Hans': '选两段录制，比较 Mac 控制与手动点动。',
  },
  baseline_need_two: {
    en: 'Two recordings are needed. Record a run first (recording controls live in the API).',
    'zh-HK': '需要兩段錄影。先錄一段（錄影控制喺 API 度）。',
    'zh-Hant': '需要兩段錄製。請先錄製（錄製控制位於 API）。',
    'zh-Hans': '需要两段录制。请先录制（录制控制位于 API）。',
  },
  option_no_recordings: {
    en: 'no recordings', 'zh-HK': '冇錄影', 'zh-Hant': '沒有錄製', 'zh-Hans': '暂无录制',
  },

  card_shortcuts: {
    en: 'Keyboard Shortcuts', 'zh-HK': '鍵盤快捷鍵', 'zh-Hant': '鍵盤快捷鍵', 'zh-Hans': '键盘快捷键',
  },
  sc_freeze: {
    en: 'freeze / resume the live view', 'zh-HK': '凍結／恢復即時畫面',
    'zh-Hant': '凍結／恢復即時畫面', 'zh-Hans': '冻结／恢复实时画面',
  },
  sc_export: {
    en: 'export a PNG snapshot + HTML report', 'zh-HK': '匯出 PNG 快照＋HTML 報告',
    'zh-Hant': '匯出 PNG 快照＋HTML 報告', 'zh-Hans': '导出 PNG 快照＋HTML 报告',
  },
  sc_highlight: {
    en: 'highlight a single joint (press again to clear)', 'zh-HK': '高亮單一關節（再撳一次取消）',
    'zh-Hant': '高亮單一關節（再按一次取消）', 'zh-Hans': '高亮单个关节（再按一次取消）',
  },
  sc_trail: {
    en: 'toggle the recorded trail', 'zh-HK': '切換記錄軌跡',
    'zh-Hant': '切換已記錄軌跡', 'zh-Hans': '切换已记录轨迹',
  },
  sc_rings: {
    en: 'toggle joint limit rings', 'zh-HK': '切換關節限制環',
    'zh-Hant': '切換關節限制環', 'zh-Hans': '切换关节限制环',
  },
  sc_replay: {
    en: 'play / pause trajectory replay', 'zh-HK': '播放／暫停軌跡重播',
    'zh-Hant': '播放／暫停軌跡重播', 'zh-Hans': '播放／暂停轨迹重放',
  },
  sc_clear: {
    en: 'clear the on-screen trail', 'zh-HK': '清除畫面上的軌跡',
    'zh-Hant': '清除畫面上的軌跡', 'zh-Hans': '清除画面上的轨迹',
  },
  sc_theme: {
    en: 'switch light / dark theme', 'zh-HK': '切換淺色／深色主題',
    'zh-Hant': '切換淺色／深色主題', 'zh-Hans': '切换浅色／深色主题',
  },
  sc_view: {
    en: 'reset the 3D view', 'zh-HK': '重設 3D 視圖', 'zh-Hant': '重設 3D 視圖', 'zh-Hans': '重置 3D 视图',
  },
  sc_grid: {
    en: 'toggle grid', 'zh-HK': '切換網格', 'zh-Hant': '切換網格', 'zh-Hans': '切换网格',
  },
  sc_help: {
    en: 'show or hide this panel', 'zh-HK': '顯示或隱藏此面板',
    'zh-Hant': '顯示或隱藏此面板', 'zh-Hans': '显示或隐藏此面板',
  },

  card_events: { en: 'Events', 'zh-HK': '事件', 'zh-Hant': '事件', 'zh-Hans': '事件' },
  events_waiting: {
    en: 'Waiting for RTDE telemetry…', 'zh-HK': '等待 RTDE 遙測…',
    'zh-Hant': '等待 RTDE 遙測…', 'zh-Hans': '等待 RTDE 遥测…',
  },

  monitor_offline: {
    en: 'Monitor offline', 'zh-HK': 'Monitor 離線', 'zh-Hant': '監控器離線', 'zh-Hans': '监控器离线',
  },
  monitor_timeout: {
    en: 'Monitor timeout', 'zh-HK': 'Monitor 逾時', 'zh-Hant': '監控器逾時', 'zh-Hans': '监控器超时',
  },
  monitor_http: {
    en: 'Monitor HTTP error', 'zh-HK': 'Monitor HTTP 錯誤',
    'zh-Hant': '監控器 HTTP 錯誤', 'zh-Hans': '监控器 HTTP 错误',
  },
  monitor_invalid: {
    en: 'Invalid monitor data', 'zh-HK': 'Monitor 數據無效',
    'zh-Hant': '監控器資料無效', 'zh-Hans': '监控器数据无效',
  },
  dashboard_error: {
    en: 'Dashboard error', 'zh-HK': 'Dashboard 錯誤', 'zh-Hant': '儀表板錯誤', 'zh-Hans': '仪表板错误',
  },
  jump_alert: {
    en: '⚠ J{j} jumped {deg}° in one sample (threshold {threshold}°, {count} total). Possible RTDE packet loss.',
    'zh-HK': '⚠ J{j} 喺一個取樣內跳咗 {deg}°（門檻 {threshold}°，共 {count} 次）。可能係 RTDE 甩包。',
    'zh-Hant': '⚠ J{j} 在一個取樣內跳了 {deg}°（門檻 {threshold}°，共 {count} 次）。可能是 RTDE 漏封包。',
    'zh-Hans': '⚠ J{j} 在一个采样内跳了 {deg}°（阈值 {threshold}°，共 {count} 次）。可能是 RTDE 丢包。',
  },
};

export function isLanguage(value) {
  return LANGUAGES.includes(value);
}

/**
 * Map browser languages onto the four supported ones. Exact matches win, then
 * Chinese subtag fallback (zh-TW -> 繁體, zh-HK -> 廣東話, other zh -> 简体).
 */
export function detectLanguage(preferredLanguages) {
  for (const raw of preferredLanguages || []) {
    const tag = String(raw).toLowerCase();
    if (LANGUAGES.includes(raw)) return raw;
    if (tag === 'zh-hant' || tag === 'zh-tw') return 'zh-Hant';
    if (tag === 'zh-hk' || tag === 'zh-mo') return 'zh-HK';
    if (tag.startsWith('zh')) return 'zh-Hans';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}

export function readStoredLanguage(storage) {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLanguage(storage, language) {
  try {
    storage?.setItem(STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

/** Translate one key; unknown keys fall back to English, then to the key itself. */
export function translate(language, key, vars) {
  const entry = MESSAGES[key];
  const text = (entry && (entry[language] ?? entry.en)) ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/** Swap every marked static string; called on init and on language change. */
export function applyStaticMessages(doc, language) {
  doc.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = translate(language, element.dataset.i18n);
  });
  doc.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.setAttribute('title', translate(language, element.dataset.i18nTitle));
  });
}

export function createI18n({ doc = document, storage = globalThis.localStorage } = {}) {
  let current = readStoredLanguage(storage)
    || detectLanguage(globalThis.navigator?.languages);
  let needsApply = true;
  const listeners = new Set();
  function apply() {
    applyStaticMessages(doc, current);
    doc.documentElement.setAttribute('data-lang', current);
    doc.documentElement.setAttribute('lang', current);
    needsApply = false;
  }
  return {
    get language() {
      return current;
    },
    /** Apply the stored/browser language once at startup. */
    init() {
      if (needsApply) apply();
      return current;
    },
    t(key, vars) {
      return translate(current, key, vars);
    },
    set(language) {
      if (!isLanguage(language) || language === current) return current;
      current = language;
      storeLanguage(storage, language);
      apply();
      listeners.forEach((listener) => listener(current));
      return current;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Shared instance for browser modules. Created lazily so Node-based tests can
// import this file without touching `document`.
let shared = null;
export function getSharedI18n() {
  if (!shared) shared = createI18n();
  return shared;
}

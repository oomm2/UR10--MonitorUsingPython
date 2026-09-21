# ur_monitor 目錄掃描報告

- **掃描根目錄**：`C:\Users\SingCheng\Desktop\FYP\ur_monitor`
- **掃描時間**：2026-09-21 03:20 (GMT+8)
- **子資料夾總數**：232
- **檔案總數**：1193
- **總容量**：118.1 MB (123,866,192 bytes)

---

## 一、頂層結構

```
ur_monitor/
├── .env                      61 B     環境變數（實際值，含敏感資料）
├── .env.example             231 B     環境變數範本
├── .gitignore               135 B
├── config.json              248 B
├── CONTROLLER_HEARTBEAT.md  4.9 KB   控制器心跳協議文件
├── README.md                4.5 KB
├── mac_controller_heartbeat.py 6.8 KB  Mac 控制器心跳發送端
├── monitor.xml              448 B
├── requirements.txt         255 B
├── server.py               27.4 KB  主服務程式
├── start_monitor.bat        196 B
│
├── .venv/                  11.4 MB   Python 虛擬環境（891 個檔案）
├── static/                 10.0 MB   前端資源（22 個檔案）
├── tests/                  52.7 KB  測試（4 個檔案）
├── vendor/                 96.6 MB   第三方 URDF 描述庫（263 個檔案）
└── __pycache__/            57.6 KB  編譯快取（2 個檔案）
```

---

## 二、各頂層目錄容量排行

| 目錄 | 檔案數 | 大小 | 佔比 | 說明 |
|---|---:|---:|---:|---|
| `vendor/` | 263 | 96.6 MB | 81.8% | UR 機器人 ROS2 描述庫（含 .git 25 MB） |
| `.venv/` | 891 | 11.4 MB | 9.7% | Python 虛擬環境 |
| `static/` | 22 | 10.0 MB | 8.5% | 前端：3D 模型 + Three.js |
| `__pycache__/` | 2 | 57.6 KB | <0.1% | Python 位元碼快取 |
| `tests/` | 4 | 52.7 KB | <0.1% | 測試 |
| 根目錄檔案 | 11 | 45.1 KB | <0.1% | 專案核心檔案 |

---

## 三、檔案類型統計（依容量排序）

| 副檔名 | 數量 | 總大小 | 類型說明 |
|---|---:|---:|---|
| `.dae` | 71 | 70.8 MB | Collada 3D 網格（視覺模型） |
| `.pack` | 1 | 24.9 MB | Git pack 檔 |
| `.pyc` | 413 | 5.5 MB | Python 位元碼 |
| `.stl` | 64 | 4.9 MB | STL 3D 網格（碰撞模型） |
| `.py` | 417 | 4.1 MB | Python 原始碼 |
| `.png` | 4 | 3.1 MB | 點陣圖 |
| `.exe` | 11 | 1.5 MB | Windows 執行檔（venv） |
| `.js` | 10 | 1.4 MB | JavaScript |
| `.jpg` | 3 | 899.2 KB | 點陣圖 |
| `.pem` | 1 | 283.3 KB | 憑證 |
| （無副檔名） | 44 | 147.5 KB | 多為 venv Scripts |
| `.svg` | 1 | 138.9 KB | 向量圖 |
| `.yaml` | 58 | 119.3 KB | UR 設定檔 |
| `.txt` | 18 | 96.7 KB | 文字 |
| `.xacro` | 8 | 51.3 KB | URDF 巨集 |
| `.rst` | 5 | 32.1 KB | 文件 |
| `.pdf` | 1 | 28.4 KB | model.pdf |
| `.sample` | 14 | 26.2 KB | Git hook 範本 |
| `.md` | 6 | 23.2 KB | Markdown |
| 其餘 | ~35 | ~50 KB | .drawio/.html/.rviz/.yml/.xml/.urdf/.bat/.json 等 |

---

## 四、專案原始碼檔案（排除 .venv / .git）

### 根目錄
| 大小 | 路徑 |
|---:|---|
| 61 B | `.env` |
| 231 B | `.env.example` |
| 135 B | `.gitignore` |
| 248 B | `config.json` |
| 4.9 KB | `CONTROLLER_HEARTBEAT.md` |
| 6.8 KB | `mac_controller_heartbeat.py` |
| 448 B | `monitor.xml` |
| 4.5 KB | `README.md` |
| 255 B | `requirements.txt` |
| 27.4 KB | `server.py` |
| 196 B | `start_monitor.bat` |

### static/ — 前端資源（10.0 MB）
| 大小 | 路徑 |
|---:|---|
| 8.0 KB | `static/app.js` |
| 7.2 KB | `static/index.html` |
| 848 B | `static/joint_limits.json` |
| 2.9 KB | `static/scene.js` |
| 3.7 KB | `static/telemetry.js` |
| 3.3 KB | `static/ur10.urdf` |
| 144.0 KB | `static/meshes/ur10/visual/base.dae` |
| 2.0 MB | `static/meshes/ur10/visual/forearm.dae` |
| 1.1 MB | `static/meshes/ur10/visual/shoulder.dae` |
| 1.8 MB | `static/meshes/ur10/visual/upperarm.dae` |
| 1.3 MB | `static/meshes/ur10/visual/wrist1.dae` |
| 2.3 MB | `static/meshes/ur10/visual/wrist2.dae` |
| 118.2 KB | `static/meshes/ur10/visual/wrist3.dae` |
| 1.1 KB | `static/vendor/three/LICENSE` |
| 1.2 MB | `static/vendor/three/build/three.module.js` |
| 31.5 KB | `static/vendor/three/examples/jsm/controls/OrbitControls.js` |
| 81.9 KB | `static/vendor/three/examples/jsm/loaders/ColladaLoader.js` |
| 9.8 KB | `static/vendor/three/examples/jsm/loaders/STLLoader.js` |
| 10.9 KB | `static/vendor/three/examples/jsm/loaders/TGALoader.js` |
| 11.1 KB | `static/vendor/urdf-loader/LICENSE` |
| 11.8 KB | `static/vendor/urdf-loader/src/URDFClasses.js` |
| 18.9 KB | `static/vendor/urdf-loader/src/URDFLoader.js` |

### tests/ — 測試（52.7 KB）
| 大小 | 路徑 |
|---:|---|
| 4.9 KB | `tests/test_heartbeat.py` |
| 11.9 KB | `tests/test_server.py` |
| 13.1 KB | `tests/__pycache__/test_heartbeat.cpython-314.pyc` |
| 22.8 KB | `tests/__pycache__/test_server.cpython-314.pyc` |

### __pycache__/ — 編譯快取（57.6 KB）
| 大小 | 路徑 |
|---:|---|
| 12.2 KB | `__pycache__/mac_controller_heartbeat.cpython-314.pyc` |
| 45.3 KB | `__pycache__/server.cpython-314.pyc` |

---

## 五、vendor/Universal_Robots_ROS2_Description（96.6 MB）

這是 Universal Robots 官方 ROS2 描述包（Git shallow clone，branch `jazzy`）。

### 子資料夾結構
```
vendor/Universal_Robots_ROS2_Description/
├── .git/                    25.0 MB  Git 倉庫（27 個檔案，pack 24.9 MB）
├── .github/workflows/       CI 設定（8 個 yml）
├── config/                  機型設定：ur3, ur3e, ur5, ur5e, ur7e, ur8long,
│                            ur10, ur10e, ur12e, ur15, ur16e, ur18, ur20, ur30
│                            （每型號 4 個 yaml：default_kinematics / joint_limits
│                              / physical_parameters / visual_parameters）
├── doc/                     文件（conf.py, *.rst, structure.svg/drawio, frames/*.png）
├── launch/                  view_ur.launch.py / .xml
├── meshes/                  3D 網格，14 個機型 × (collision .stl + visual .dae)
├── rviz/                    view_robot.rviz
├── test/                    test_ur_urdf_xacro.py, test_view_ur_launch.py
└── urdf/                    ur.urdf.xacro, ur_macro.xacro + inc/*.xacro
```

### 依機型統計（meshes 部分）

| 機型 | 檔案數 | 大小 |
|---|---:|---:|
| ur3 | 14 | 10.7 MB |
| ur3e | 14 | 15.1 MB |
| ur5 | 14 | 11.1 MB |
| ur5e | 14 | 12.8 MB |
| ur10 | 14 | 9.4 MB |
| ur10e | 14 | 12.4 MB |
| ur15 | 15 | 3.5 MB |
| ur16e | 4 | 4.7 MB |
| ur18 | 5 | 1.3 MB |
| ur20 | 15 | 6.8 MB |
| ur30 | 5 | 3.5 MB |
| ur8long | 5 | 1.4 MB |
| ur12e / ur7e | 0 | 僅 config |

> 注意：`ur12e` 同 `ur7e` 只有 config YAML，冇對應 meshes。

### 完整檔案清單（vendor，不含 .git/objects）

**根目錄**
| 大小 | 路徑 |
|---:|---|
| 17 B | `.gitignore` |
| 3.0 KB | `.pre-commit-config.yaml` |
| 23.0 KB | `CHANGELOG.rst` |
| 6.1 KB | `ci_status.md` |
| 495 B | `CMakeLists.txt` |
| 2.3 KB | `CONTRIBUTING.md` |
| 70 B | `doc_requirements.txt` |
| 1.4 KB | `LICENSE` |
| 28.4 KB | `model.pdf` |
| 3.5 KB | `package.xml` |
| 3.9 KB | `README.md` |

**config/**
| 大小 | 路徑 |
|---:|---|
| 133 B | `config/initial_positions.yaml` |
| 各機型 4 檔 | `config/{ur3,ur3e,ur5,ur5e,ur7e,ur8long,ur10,ur10e,ur12e,ur15,ur16e,ur18,ur20,ur30}/{default_kinematics,joint_limits,physical_parameters,visual_parameters}.yaml` |

**doc/**
| 大小 | 路徑 |
|---:|---|
| 2.7 KB | `doc/conf.py` |
| 84.5 KB | `doc/frames/base.png` |
| 84.9 KB | `doc/frames/base_link.png` |
| 4.8 KB | `doc/index.rst` |
| 1.2 KB | `doc/migration/jazzy.rst` |
| 120 B | `doc/migration_notes.rst` |
| 3.0 KB | `doc/robot_frames.rst` |
| 10.1 KB | `doc/structure.drawio` |
| 138.9 KB | `doc/structure.svg` |

**launch/ · rviz/ · test/ · urdf/**
| 大小 | 路徑 |
|---:|---|
| 2.5 KB | `launch/view_ur.launch.py` |
| 2.0 KB | `launch/view_ur.launch.xml` |
| 6.4 KB | `rviz/view_robot.rviz` |
| 4.7 KB | `test/test_ur_urdf_xacro.py` |
| 2.3 KB | `test/test_view_ur_launch.py` |
| 1.1 KB | `urdf/ros2_control_mock_hardware.xacro` |
| 2.1 KB | `urdf/ur.urdf.xacro` |
| 17.1 KB | `urdf/ur_macro.xacro` |
| 2.8 KB | `urdf/ur_mocked.urdf.xacro` |
| 20.6 KB | `urdf/inc/ur_common.xacro` |
| 4.1 KB | `urdf/inc/ur_joint_control.xacro` |
| 847 B | `urdf/inc/ur_sensors.xacro` |
| 2.7 KB | `urdf/inc/ur_transmissions.xacro` |

**meshes/**（完整）

| 機型 | collision (.stl) | visual (.dae) |
|---|---|---|
| ur3 | base 390 KB / forearm 241 KB / shoulder 384 KB / upperarm 501 KB / wrist1 179 KB / wrist2 179 KB / wrist3 26 KB | base 585 KB / forearm 897 KB / shoulder 1.6 MB / upperarm 2.1 MB / wrist1 711 KB / wrist2 718 KB / wrist3 43 KB |
| ur3e | base 21 KB / forearm 50 KB / shoulder 89 KB / upperarm 99 KB / wrist1 62 KB / wrist2 71 KB / wrist3 8 KB | base 234 KB / forearm 1.2 MB / shoulder 2.0 MB / upperarm 3.5 MB / wrist1 1.4 MB / wrist2 1.4 MB / wrist3 82 KB |
| ur5 | base 12 KB / forearm 51 KB / shoulder 33 KB / upperarm 58 KB / wrist1 34 KB / wrist2 34 KB / wrist3 22 KB | base 154 KB / forearm 1.4 MB / shoulder 984 KB / upperarm 1.9 MB / wrist1 927 KB / wrist2 926 KB / wrist3 121 KB |
| ur5e | base 21 KB / forearm 52 KB / shoulder 68 KB / upperarm 97 KB / wrist1 58 KB / wrist2 66 KB / wrist3 7 KB | base 350 KB / forearm 1.1 MB / shoulder 1.7 MB / upperarm 2.9 MB / wrist1 1.3 MB / wrist2 1.5 MB / wrist3 65 KB |
| ur10 | base 18 KB / forearm 53 KB / shoulder 48 KB / upperarm 60 KB / wrist1 43 KB / wrist2 41 KB / wrist3 24 KB | base 144 KB / forearm 2.0 MB / shoulder 1.1 MB / upperarm 1.8 MB / wrist1 1.3 MB / wrist2 2.3 MB / wrist3 118 KB |
| ur10e | base 22 KB / forearm 66 KB / shoulder 83 KB / upperarm 92 KB / wrist1 65 KB / wrist2 87 KB / wrist3 7 KB | base 362 KB / forearm 1.3 MB / shoulder 2.2 MB / upperarm 3.0 MB / wrist1 1.2 MB / wrist2 1.4 MB / wrist3 70 KB |
| ur15 | base 15 KB / forearm 60 KB / shoulder 8 KB / upperarm 43 KB / wrist1 26 KB / wrist2 13 KB / wrist3 14 KB | base 345 KB / forearm 440 KB / shoulder 170 KB / upperarm 434 KB / wrist1 169 KB / wrist2 169 KB / wrist3 277 KB / UR15_DIFF_8bit_2K.jpg 281 KB / LICENSE.txt 13 KB |
| ur16e | forearm 97 KB / upperarm 134 KB | forearm 1.3 MB / upperarm 2.9 MB |
| ur18 | forearm 89 KB / upperarm 91 KB | forearm 432 KB / upperarm 434 KB / UR18_DIFF_8bit_2K.jpg 345 KB / LICENSE.txt 13 KB |
| ur20 | base 21 KB / forearm 122 KB / shoulder 26 KB / upperarm 119 KB / wrist1 36 KB / wrist2 27 KB / wrist3 15 KB | base 402 KB / forearm 755 KB / shoulder 198 KB / upperarm 711 KB / wrist1 373 KB / wrist2 254 KB / wrist3 371 KB / UR20_DIFF_8bit_2K.png 1.5 MB / LICENSE.txt 13 KB |
| ur30 | forearm 174 KB / upperarm 137 KB | forearm 821 KB / upperarm 723 KB / UR30_DIFF_8bit_2K.png 1.5 MB / LICENSE.txt 13 KB |
| ur8long | forearm 75 KB / upperarm 81 KB | forearm 441 KB / upperarm 435 KB / UR8Long_DIFF_8bit_2K.jpg 274 KB / LICENSE.txt 13 KB |

---

## 六、.venv/ Python 虛擬環境（11.4 MB）

```
.venv/
├── .gitignore               71 B
├── pyvenv.cfg              206 B     Python 3.14
├── Lib/site-packages/     10.5 MB   879 個檔案
│   ├── pip/                          pip 25.2（含 pip/_vendor 全套依賴）
│   ├── pip-25.2.dist-info/           套件元資料 + 授權檔
│   ├── rtde/                         urrtde 2.7.12 — UR 即時資料交換
│   └── urrtde-2.7.12.dist-info/     套件元資料
└── Scripts/                 ~1.0 MB  activate 腳本 + python/pip 執行檔
    ├── python.exe          249.3 KB
    ├── pythonw.exe         245.8 KB
    ├── pip.exe             105.9 KB
    ├── pip3.exe            105.9 KB
    ├── pip3.14.exe         105.9 KB
    ├── activate / activate.bat / activate.ps1 / activate.fish / deactivate.bat
```

已安裝第三方套件：**pip 25.2**、**urrtde 2.7.12**（Universal Robots RTDE Python 客戶端）

---

## 七、掃描備註

1. **`.env` 含實際環境變數值（61 B）**，可能包含敏感資料；`.env.example` 為範本，兩個檔案內容不同。
2. `vendor/Universal_Robots_ROS2_Description` 為 **Git shallow clone**（`.git/shallow` 存在），branch 為 `jazzy`，pack 檔單一 24.9 MB。
3. `ur12e`、`ur7e` 在 `config/` 有設定檔，但 `meshes/` 無對應目錄。
4. `__pycache__/` 與 `tests/__pycache__/` 共 4 個 `.pyc`，皆為 Python 3.14 編譯。
5. `.venv` 內 `.pyc` 413 個，多數來自 pip 自身的 `__pycache__`。
6. 完整原始資料已匯出至 `ur_monitor_scan.json`（1193 筆記錄，含路徑 / 名稱 / 類型 / 大小）。

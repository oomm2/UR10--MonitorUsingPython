#!/usr/bin/env python3
"""Measure the TCP workspace extremes for the vision controller's air wall.

The Qt vision controller (UR10_PythonCamCode/safety_config.py) locks physical
control until the six REAL_WORKSPACE_* limits are filled in. This helper turns
the measurement step into a procedure: start the monitor, put the robot into
backdrive/freedrive, walk the TCP around the intended box while this script
watches the monitor's read-only /api/state, then copy the printed values into
safety_config.py.

Everything here is read-only: it only polls the monitor's HTTP API and never
talks to the robot.

Usage::

    py tools/measure_workspace.py                 # until Ctrl+C
    py tools/measure_workspace.py --duration 30   # fixed 30 s run

Park the TCP at the pose you want as the safe origin BEFORE stopping the
script — the final sample is printed as the REAL_SAFE_ORIGIN suggestion.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import time
import urllib.error
import urllib.request

DEFAULT_MONITOR = "http://127.0.0.1:8080"
STATE_PATH = "/api/state"
# The monitor reports TCP pose as (x, y, z, rx, ry, rz) in the base frame,
# metres + radians. Only the first three matter for the box.
AXES = ("X", "Y", "Z")


def fetch_state(monitor: str, timeout: float = 2.0) -> dict | None:
    url = monitor.rstrip("/") + STATE_PATH
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return None


def tcp_xyz(state: dict | None) -> tuple[float, float, float] | None:
    if not state:
        return None
    pose = state.get("actual_TCP_pose")
    if not isinstance(pose, (list, tuple)) or len(pose) < 3:
        return None
    try:
        values = tuple(float(value) for value in pose[:3])
    except (TypeError, ValueError):
        return None
    if not all(math.isfinite(value) for value in values):
        return None
    return values  # type: ignore[return-value]


def fmt(value: float | None) -> str:
    return f"{value:+.3f}" if value is not None else "  —  "


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--monitor", default=DEFAULT_MONITOR, help="monitor base URL")
    parser.add_argument("--interval", type=float, default=0.2, help="poll seconds")
    parser.add_argument("--duration", type=float, default=0.0,
                        help="stop after this many seconds (0 = run until Ctrl+C)")
    args = parser.parse_args()
    if args.interval <= 0 or args.duration < 0:
        parser.error("interval must be > 0 and duration must be >= 0")

    lows: list[float | None] = [None, None, None]
    highs: list[float | None] = [None, None, None]
    last: tuple[float, float, float] | None = None
    samples = 0
    started = time.monotonic()
    print(f"watching {args.monitor}{STATE_PATH} — freedrive the TCP around the box;"
          " Ctrl+C to finish (park at the safe origin first)")
    try:
        while True:
            xyz = tcp_xyz(fetch_state(args.monitor))
            if xyz is not None:
                last = xyz
                samples += 1
                lows = [b if a is None else min(a, b) for a, b in zip(lows, xyz)]
                highs = [b if a is None else max(a, b) for a, b in zip(highs, xyz)]
                print("\r" + ", ".join(
                    f"{AXES[i]} {fmt(xyz[i])}  min {fmt(lows[i])}  max {fmt(highs[i])}"
                    for i in range(3)
                ) + f"   [{samples} samples]", end="", flush=True)
            else:
                print("\r(no fresh telemetry — is the monitor running?)      ",
                      end="", flush=True)
            if args.duration and time.monotonic() - started >= args.duration:
                break
            time.sleep(args.interval)
    except KeyboardInterrupt:
        pass

    print()
    if samples == 0 or last is None:
        print("no TCP samples were seen; nothing to paste", file=sys.stderr)
        return 1
    if any(value is None for value in lows + highs):
        print("incomplete extremes; nothing to paste", file=sys.stderr)
        return 1

    names = ("X_MIN", "X_MAX", "Y_MIN", "Y_MAX", "Z_MIN", "Z_MAX")
    values = [lows[0], highs[0], lows[1], highs[1], lows[2], highs[2]]
    print(f"\n{samples} samples over {time.monotonic() - started:.0f}s."
          " Paste into UR10_PythonCamCode/safety_config.py:\n")
    for name, value in zip(names, values):
        print(f"REAL_WORKSPACE_{name}: Optional[float] = {value:.3f}")
    print(f"\n# safe origin suggestion (park the TCP at home first; last seen below)\n"
          f"REAL_SAFE_ORIGIN = ({last[0]:.3f}, {last[1]:.3f}, {last[2]:.3f})")
    print("\nRemember: lower < upper for every axis, the origin must sit inside the"
          " box, and the Qt app only moves the robot while safety mode is"
          " NORMAL/REDUCED and the TCP feedback is fresh.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

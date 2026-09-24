# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's
**private vulnerability reporting** for this repository
(Security → Report a vulnerability), and include:

- a description of the issue and its impact,
- the steps or configuration needed to reproduce it,
- any log excerpt that shows the problem (redact tokens first).

## Scope and expectations

This project is a **read-only monitoring aid for a private, trusted network**
(windows host + URSim/UR controller on a LAN). Keep the following in mind when
assessing reports:

- Read endpoints (`/api/state`, `/api/stream`, recording downloads, …) are
  **unauthenticated by design** and must never be exposed to the internet.
- CORS is a browser control, not an access-control boundary for non-browser
  clients.
- The heartbeat token protects mutating endpoints only. It is shared-secret
  authentication on plain HTTP for a trusted LAN.
- This software is **not a safety device**. It cannot stop or prevent robot
  motion and must not be relied on for any safety function.

## Supported versions

Only the latest tagged release receives security fixes.

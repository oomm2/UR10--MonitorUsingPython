# Public release preparation check

Project display name: **UR10——MonitorUsingPython**  
Intended repository slug: `UR10--MonitorUsingPython`

## Preparation completed

- Created a new, separate export from an explicit 62-file source allowlist. No source repository files were modified.
- No Git history, upstream Git backups, local secrets, environments, recordings, internal scans or workspace data were copied.
- Replaced deployment addresses with documentation IPv4 examples. Removed personal local paths and account references. Existing loopback test fixtures remain loopback.
- Added `config.example.json`; the identical local `config.json` is ignored and excluded from publication candidates.
- Flattened the setup instructions and CI working directory. CI creates its local configuration before tests.
- The HTTP configuration example binds to loopback. LAN exposure requires a deliberate local configuration change.
- Added root ignore rules for environment files, local configuration, caches, runtime output and internal metadata.
- Retained only the UR10 model-builder inputs and required local browser dependencies.
- Removed contributor, authoring-tool and creation/modification metadata from all 14 DAE copies. Content outside asset headers, including geometry, is unchanged; units and axes are retained.
- Preserved upstream license files and added `THIRD_PARTY_NOTICES.md`. No license was chosen for original project code.
- Made the smoke-test bootstrap explicitly disable RTDE connections, even when the RTDE dependency is installed.

## Checks performed

All checks ran inside this export using an existing Python environment, without downloading dependencies.

| Check | Result |
| --- | --- |
| `python -B tools/build_models.py` | PASS: regenerated UR10 with seven meshes |
| `unittest` discovery of `tests`, verbosity 2 | PASS: 119 tests; an audit guard restricted socket connections/binds and name resolution to loopback |
| `python -B tools/smoke_test.py` | PASS: HTTP endpoint, authentication, recording, SSE, static-asset and CORS checks; local loopback only, RTDE disabled |
| `python -B -m ruff check . --no-cache` | PASS |
| `python -B -m mypy` | PASS: eight source files |
| DAE geometry/metadata comparison | PASS: 14 copies checked against source |
| Source-file hashes and source Git status comparison | PASS: unchanged |
| Credential-signature / credential-bearing URL scan | PASS: no matches in export candidates or local example configuration |
| Private IPv4 / personal absolute path / local account scan | PASS: no matches |
| Frontend `node --test "tests/js/*.test.mjs"` | NOT RUN: Node.js was not on PATH or found in a bounded search of the known application installation |

The signature scan is heuristic, not a comprehensive secret-scanning certification. Synthetic test tokens remain test fixtures and must never be used as deployment credentials. No actual local environment file was read or copied.

## Publication candidates and integrity

`SHA256SUMS.txt` lists every publication candidate except itself, using relative paths and SHA256 hashes.
It excludes the ignored `config.json`, caches and all runtime artifacts. There are 68 manifest entries;
including the manifest itself, the intended publication set contains 69 files. The working directory also
contains one ignored local configuration file for tests, for 70 files total after cache cleanup.

Recompute the manifest after any edit. It describes file bytes, not a signed attestation. Do not publish
an unrestricted recursive copy of this working directory: publish only manifest-listed files plus the
manifest itself. Never include the local configuration or future environment files.

## Remaining decisions and checks

1. GitHub authentication is not available in the preparation session. Authenticate before repository creation or upload; neither was attempted here.
2. The owner has not selected a license for original code. Public source without a license is not an open-source grant. Select one before claiming an open-source release, while retaining third-party license exceptions and notices.
3. Run the frontend tests with Node.js 20 or newer. The prepared CI uses Node.js 22, but remote CI has not run.
4. Revalidate from a clean candidate-only checkout: copy `config.example.json` to ignored `config.json`, then run the documented checks. Review live screenshots, recordings and reports separately before sharing.
5. Do not expose this monitor directly to the internet. Read endpoints and recording downloads are not authenticated; CORS does not authenticate non-browser clients. The monitor is not a robot safety device.

No repository initialization, commits, pushes, uploads, authentication changes or external network requests were performed during preparation. Loopback HTTP was used only for local tests.

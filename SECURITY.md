# Security Policy & Architecture

## <img src="docs/assets/icons/shield.svg" width="20" height="20" align="absmiddle" alt="" /> Security Design Principles

AirPop is engineered with a strict **offline-first, least-privilege** security posture:

1. **Zero Network Egress & Zero Telemetry**:
   - Neither the Rust core (`src-tauri`) nor the WebView2 UI (`ui`) initiates outbound HTTP/HTTPS/WebSocket requests.
   - No analytics SDKs, crash reporters, or third-party tracking scripts are bundled.

2. **Locked-Down Content Security Policy (CSP)**:
   - Configured in [`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json):
     ```text
     default-src 'self';
     script-src 'self';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: asset: http://asset.localhost;
     connect-src ipc: http://ipc.localhost;
     object-src 'none';
     base-uri 'self'
     ```
   - Blocks remote script execution, inline script injection, and external data exfiltration.

3. **Tauri v2 Capabilities ACL (`src-tauri/capabilities/default.json`)**:
   - Explicitly scopes permissions for the `popup` and `flyout` windows to `core:default`, `core:event:default`, `core:window:allow-show`, `core:window:allow-hide`, and `core:window:allow-set-ignore-cursor-events`.
   - File system write, shell execution, and arbitrary process spawning are disabled.

4. **BLE Parser Memory Safety & Fuzz Resistance**:
   - [`src-tauri/src/ble/apple_proximity.rs`](src-tauri/src/ble/apple_proximity.rs) is written in 100% safe Rust without `unwrap()` or `unsafe` blocks.
   - Malformed or truncated BLE advertisements immediately return a typed `ParseError::TooShort` or `ParseError::InvalidMessageType`.
   - [`src-tauri/src/device/registry.rs`](src-tauri/src/device/registry.rs) enforces a hard capacity cap (`MAX_TRACKED_DEVICES = 32`) and a 30-minute TTL eviction policy to prevent memory exhaustion from BLE advertisement flooding/spoofing.

5. **IPC Allowlist Validation**:
   - All UI-to-Rust commands validate `model_id` and `color` against [`catalog/models.json`](catalog/models.json) allowlists and enforce strict length and character set bounds on user settings (`sanitize_settings`).

## Reporting a Vulnerability

If you discover a security issue, please open a private security advisory on GitHub at [https://github.com/Ignaciobrenas/AirPop/security/advisories](https://github.com/Ignaciobrenas/AirPop/security/advisories).

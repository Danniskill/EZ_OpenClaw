# Guide for Developers & AI Agents (AGENTS.md)

This document contains system design rules, source code architecture, and important notes when modifying or extending the **EZ-OpenClaw** project. Any developer or AI Agent taking over this project must strictly adhere to the rules below.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS v3.
- **Backend:** Electron v31 (using the secure isolation model: Main Process, Preload Script, and Renderer Process).
- **Styling & Theme:** Utilize custom CSS variables (`--win11-bg`, `--win11-card`, `--win11-border`) combined with `@media (prefers-color-scheme: light)` to automate Light/Dark mode synchronization directly from Windows OS settings.

---

## 📌 Critical Engineering Rules

### 1. OpenClaw Gateway Status Monitoring (Port Checking)
- **Rule:** Absolutely **DO NOT** track the On/Off status of the OpenClaw Gateway by monitoring the lifecycle of child processes (`child_process` or `PID`). Because on some systems, OpenClaw runs as a background Scheduled Task and the initial launching process terminates itself after activation.
- **Solution:** Use an HTTP GET request sent to `http://127.0.0.1:18789`.
  - If the connection responds successfully (HTTP 200 OK): Confirm the status as **Running / Online**.
  - If the connection fails or is refused: Confirm the status as **Stopped / Offline**.

### 2. Log Extraction & Display (Log Tailing via Byte Offset)
- **Rule:** Do not read the entire content of log files or continuously stream stdout/stderr directly for a long time as it will cause memory leaks and log duplication.
- **Solution:**
  - Locate the latest log file matching `openclaw-*.log` in the system Temp directory (`AppData/Local/Temp/openclaw`).
  - Read logs periodically (e.g., every 5 seconds) using the **Tailing** method: Remember the byte offset (last read position) and only read the new data appended to the file.

### 3. Local Model Management (Ollama & AI Models)
- **Portable Environment:** Ollama and Portable Node.js are downloaded as compressed archives and extracted locally into the application directory (`AppData/Local/ez-openclaw-runtime/`). Absolutely do not call or interfere with the global Environment Paths of the Windows system.
- **Isolated Models Directory:** Ensure Ollama running in the background via the `ollama serve` command is always accompanied by the `OLLAMA_MODELS` environment variable pointing to the local runtime directory to avoid cluttering the system drive (`C:\Users\<Name>\.ollama`).
- **Pruning Ollama digest logs:** When Ollama downloads a model, CLI logs will continuously output sha256 hashes. It is necessary to filter and convert logs like `pulling sha256:...` into concise text (e.g., "Pulling model" / "Đang tải mô hình") before pushing to the UI to enhance the user experience.

### 4. Theme Syncing & Overrides Rules
- **No React State:** Do not define React state or use local storage for Light/Dark themes. Theme switching must be handled entirely automatically using the CSS Media Query `@media (prefers-color-scheme: light)` in `index.css`.
- **Restrict Universal Child Selector (*):** When writing CSS overrides for Light Mode, do not use the universal child selector with high specificity like `.text-white *` or `.text-gray-100 *`. This will override specialized status text colors (such as `text-green-500` for YES/ONLINE, `text-red-500` for NO/OFFLINE) with black, causing them to lose their meaning. Only apply styles directly to specific classes.

### 5. Direct Packaging Requirements
- **Packaging Rule:** When packaging a release build using `electron-builder` via the `npm run dist` command, only generate a Windows Installer `.exe` file (using the NSIS target). Do not package into `.zip` format for official release versions of the installer.

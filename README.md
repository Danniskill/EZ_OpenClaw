# EZ-OpenClaw: Windows 11 Fluent GUI Installer & Manager

## Introduction
EZ-OpenClaw is a Desktop GUI application built with Electron, React, and Tailwind CSS following the **Windows 11 Settings UI (Fluent Design)** language. The application simplifies and automates the entire process of installing, configuring, and operating OpenClaw (an AI agent daemon framework) and Ollama on Windows without the need for a command-line interface (CLI).

### Target Audience & Important Notes
- **No Coding Experience Required:** This software is perfectly suited for users who have no experience with coding or command-line interfaces but still want to seamlessly experience and run AI agents.
- **Maximum Convenience:** To ensure the highest level of convenience and a "plug-and-play" experience, this software utilizes a portable version of Ollama by default, keeping your system environment clean.
- **For Advanced Users:** If you already have Ollama installed globally with your own downloaded models, or have a pre-configured OpenClaw environment with custom settings, you might not need this software. However, if you still wish to use this GUI with your existing setup, you can modify `src/main/main.js` to bypass the portable environment and point the application to your custom configurations.

## Features

- **Automated Setup Wizard:** Flexible Node.js configuration allows you to use your system's Node.js or automatically download and extract a portable, isolated version. It also automates the installation of Ollama Windows Portable, initializes the daemon, and sets up isolated model storage.
- **Hardware Diagnostic Radar & AI Model Suggestions:** Analyzes detailed system information (CPU, RAM, GPU, VRAM) to calculate a dynamic GPU Performance Index (GPI). It intelligently suggests the most compatible local AI models (such as Llama 3.2, Qwen 2.5, Gemma 3/4) based on your hardware capabilities and specific use cases (Chat, Coding, Writing).
- **OpenClaw Gateway Control & Monitoring:** Safely start and stop the OpenClaw Gateway and Ollama Engine with a single click. It includes a smart log tailing system for optimal performance and automatically renders Monospace ASCII QR codes from logs for quick WhatsApp linking.
- **Auto OS Theme Synchronization:** The application UI seamlessly switches between Light and Dark themes based on your Windows OS settings using CSS Media Queries, without requiring a page reload.
- **Built-in Utilities:** Features an embedded chat dashboard to interact directly with the AI assistant, a one-click "Doctor Fix" diagnostic tool, and bilingual support (English/Vietnamese).

## Installation

### For Regular Users
Simply download the latest `.exe` installer from the releases page and run it. The application will automatically install and create a shortcut on your Desktop and Start Menu.

### For Developers
1. Ensure you have Node.js installed on your development machine.
2. Clone the repository and navigate to the project directory.
3. Install the dependencies:
   ```powershell
   npm install
   ```
4. Start the development environment (Vite dev server for React + Electron app):
   ```powershell
   npm run dev
   ```

## Usage

1. **Initial Setup:** Launch the EZ-OpenClaw application. The Setup Wizard will guide you through initializing the required environment (Node.js and Ollama) automatically.
2. **Hardware Scanning:** Navigate to the Hardware Radar tab to scan your system. Review the hardware tier and select an AI model that best fits your system capabilities and needs.
3. **Gateway Management:** Go to the Dashboard to start the OpenClaw Gateway and Ollama. You can monitor the real-time status and logs directly from the UI.
4. **Chat & Connect:** Once the gateway is running, use the integrated Chat Dashboard to interact with your AI. If you want to link your WhatsApp account, simply scan the QR code that appears in the log console.
5. **Troubleshooting:** If you encounter any issues with the OpenClaw core, click the "Doctor Fix" button to automatically diagnose and repair the framework.

---

### Packaging the Application
To build and package the application into a standalone Windows Installer (`.exe`), run:
```powershell
npm run dist
```
The packaged installer will be generated in the `dist-package/` directory.

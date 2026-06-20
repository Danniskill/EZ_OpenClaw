const { app, BrowserWindow, ipcMain, safeStorage, Tray, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const os = require('os');
const child_process = require('child_process');
const JSON5 = require('json5');

// Node.js Portable version to download — update this when a new LTS is released
const NODE_PORTABLE_VERSION = '22.22.3';

// Official SHA256 checksums — from https://nodejs.org/dist/v{version}/SHASUMS256.txt
const NODE_PORTABLE_SHA256 = '6c8d54f635feff4df76c2ca80f45332eb2ff57d25226edce36592e51a177ee33';

// Prefix used to mark encrypted values stored in config file
const ENC_PREFIX = 'enc:v1:';

/**
 * Encrypt a sensitive string value using Electron safeStorage (DPAPI on Windows).
 * Returns a prefixed Base64 string safe to store in a JSON file.
 * Falls back to storing plaintext if safeStorage is not available (dev mode).
 */
function encryptEnvValue(plaintext) {
  if (!plaintext) return plaintext;
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(plaintext);
      return ENC_PREFIX + encrypted.toString('base64');
    }
  } catch (e) {
    console.warn('[Security] safeStorage encryption failed, storing plaintext:', e.message);
  }
  return plaintext;
}

/**
 * Decrypt a value that was previously encrypted with encryptEnvValue().
 * If the value is not prefixed (legacy plaintext), returns it as-is for migration.
 */
function decryptEnvValue(value) {
  if (!value || !value.startsWith(ENC_PREFIX)) return value;
  try {
    const buf = Buffer.from(value.slice(ENC_PREFIX.length), 'base64');
    return safeStorage.decryptString(buf);
  } catch (e) {
    console.warn('[Security] safeStorage decryption failed:', e.message);
    return value; // return raw value as fallback rather than crashing
  }
}

/**
 * Verify the SHA256 hash of a file on disk.
 * Throws an error if the hash does not match.
 */
function verifyChecksum(filePath, expectedHash) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      const actual = hash.digest('hex');
      if (actual === expectedHash) {
        resolve();
      } else {
        reject(new Error(`Checksum mismatch!\nExpected: ${expectedHash}\nGot:      ${actual}\nFile may be corrupt or tampered with.`));
      }
    });
    stream.on('error', reject);
  });
}

let mainWindow;
let tray = null;
let isQuitting = false;
let ollamaProcess = null;
let openClawProcess = null;

let lastLogFile = null;
let lastLogOffset = 0;
let monitoringInterval = null;

// Paths setup
const appDataDir = path.join(app.getPath('userData'), 'ez-openclaw-runtime');
const downloadsDir = path.join(appDataDir, 'downloads');
const nodePortableDir = path.join(appDataDir, 'node-portable');
const ollamaDir = path.join(appDataDir, 'ollama');
const modelsDir = path.join(appDataDir, 'models');
const openclawConfigDir = path.join(process.env.USERPROFILE || process.env.HOME || 'C:', '.openclaw');
const openclawConfigFile = path.join(openclawConfigDir, 'openclaw.json');

// Ensure directories exist
[appDataDir, downloadsDir, nodePortableDir, ollamaDir, modelsDir, openclawConfigDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 780,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    title: "EZ-OpenClaw Installer & Manager",
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      // Optionally notify renderer
      if (mainWindow.webContents) {
        mainWindow.webContents.send('window-hidden');
      }
    }
  });

  mainWindow.on('show', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('window-show');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopMonitoring();
    // Clean up processes on real close
    cleanupProcesses();
  });

  // Start background monitoring for Gateway status and logs
  startMonitoring();
}



function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'available', info });
    // Begin downloading immediately for seamless experience
    autoUpdater.downloadUpdate();
  });
  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'downloaded', info });
  });
  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'downloading', progress: progressObj.percent });
  });
  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
    if (mainWindow) mainWindow.webContents.send('update-status', { status: 'error', message: err.message });
  });
}

// Helper: Kill a process and its entire child tree on Windows
function killProcessTree(pid) {
  try {
    child_process.execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
  } catch (e) {
    // taskkill may fail if process already exited, that's OK
    console.warn(`taskkill failed for PID ${pid}:`, e.message);
  }
}

function cleanupProcesses() {
  if (ollamaProcess) {
    killProcessTree(ollamaProcess.pid);
    ollamaProcess = null;
  }
  if (openClawProcess) {
    killProcessTree(openClawProcess.pid);
    openClawProcess = null;
  }
}

app.on('ready', () => {
  // Create a 1x1 transparent dummy icon for the Tray so it doesn't crash before user adds real icon
  try {
    const dummyIconPath = path.join(__dirname, 'dummy_icon.png');
    if (!fs.existsSync(dummyIconPath)) {
      // 1x1 transparent PNG base64
      const dummyIconB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      fs.writeFileSync(dummyIconPath, Buffer.from(dummyIconB64, 'base64'));
    }
  } catch (e) {}

  createWindow();
  
  // Create Tray with dummy icon
  try {
    tray = new Tray(path.join(__dirname, 'dummy_icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => { mainWindow?.show(); } },
      { type: 'separator' },
      { label: 'Quit EZ-OpenClaw', click: () => { 
          isQuitting = true; 
          app.quit(); 
        } 
      }
    ]);
    tray.setToolTip('EZ-OpenClaw Gateway');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow?.show());
  } catch (e) { console.error('Tray setup failed:', e); }

  setupAutoUpdater();
  
  // Check for updates shortly after startup
  setTimeout(() => {
    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch(e) {
      console.warn('AutoUpdate check failed:', e.message);
    }
  }, 3000);
});

app.on('window-all-closed', () => {
  // We do not quit on window-all-closed because we want to stay in Tray
  // app.quit() is called explicitly from Tray context menu
});

app.on('before-quit', () => {
  isQuitting = true;
  cleanupProcesses();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Helper: Download a file with proper stream handling
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    let rejected = false;

    const failCleanup = (err) => {
      if (rejected) return;
      rejected = true;
      file.destroy();
      fs.unlink(destPath, () => {});
      reject(err);
    };

    file.on('error', failCleanup);

    const request = proto.get(url, (response) => {
      // Handle redirects (301, 302, 303, 307, 308)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.destroy();
        fs.unlink(destPath, () => {
          downloadFile(response.headers.location, destPath, onProgress).then(resolve).catch(reject);
        });
        return;
      }
      if (response.statusCode !== 200) {
        failCleanup(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        file.write(chunk);
        downloadedSize += chunk.length;
        if (onProgress && totalSize) {
          onProgress(downloadedSize, totalSize);
        }
      });

      response.on('error', failCleanup);
      
      response.on('end', () => {
        // Use file.close() with callback to ensure data is fully flushed to disk
        file.close((err) => {
          if (err) failCleanup(err);
          else resolve();
        });
      });
    });

    request.on('error', failCleanup);
  });
}

// Helper: Extract zip via PowerShell
function unzipFile(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    const psCommand = `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`;
    const child = child_process.spawn('powershell.exe', ['-Command', psCommand]);
    
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Unzip failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

function checkGatewayOnline() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:18789', (res) => {
      // Consume response data to free up memory
      res.resume();
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
    // Note: http.get() automatically calls req.end(), no need to call manually
  });
}

function getLatestLogFile() {
  const logDir = path.join(os.tmpdir(), 'openclaw');
  if (!fs.existsSync(logDir)) return null;
  try {
    const files = fs.readdirSync(logDir)
      .filter(f => f.startsWith('openclaw-') && f.endsWith('.log'))
      .map(f => {
        const filePath = path.join(logDir, f);
        try {
          return { path: filePath, mtime: fs.statSync(filePath).mtimeMs };
        } catch (e) {
          return { path: filePath, mtime: 0 };
        }
      });
    if (files.length === 0) return null;
    files.sort((a, b) => b.mtime - a.mtime);
    return files[0].path;
  } catch (e) {
    console.error("Error finding log files:", e);
    return null;
  }
}

function pollNewLogs() {
  const latestFile = getLatestLogFile();
  if (!latestFile) return;

  try {
    const stats = fs.statSync(latestFile);
    const size = stats.size;

    if (latestFile !== lastLogFile) {
      lastLogFile = latestFile;
      lastLogOffset = Math.max(0, size - 15000);
    }

    if (size < lastLogOffset) {
      lastLogOffset = 0;
    }

    if (size > lastLogOffset) {
      const buffer = Buffer.alloc(size - lastLogOffset);
      const fd = fs.openSync(latestFile, 'r');
      fs.readSync(fd, buffer, 0, buffer.length, lastLogOffset);
      fs.closeSync(fd);

      lastLogOffset = size;
      const newContent = buffer.toString('utf-8');
      if (newContent.trim() && mainWindow) {
        mainWindow.webContents.send('openclaw-log', newContent);
        
        // Look for WhatsApp QR Code pattern
        if (newContent.includes('QR code') || newContent.includes('2@')) {
          const match = newContent.match(/2@[a-zA-Z0-9_\-\+\=\/]+/);
          if (match) {
            mainWindow.webContents.send('whatsapp-qr', match[0]);
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading log file:", e);
  }
}

function startMonitoring() {
  if (monitoringInterval) return;
  
  // Run an immediate check on startup
  checkGatewayOnline().then(online => {
    if (mainWindow) {
      mainWindow.webContents.send('openclaw-status', online);
    }
    if (online) {
      pollNewLogs();
    }
  });

  monitoringInterval = setInterval(async () => {
    const online = await checkGatewayOnline();
    if (mainWindow) {
      mainWindow.webContents.send('openclaw-status', online);
    }
    if (online) {
      pollNewLogs();
    }
  }, 5000);
}

function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

// IPC: Get hardware info and scoring
ipcMain.handle('get-hardware-info', async () => {
  try {
    const cpuInfo = await si.cpu();
    const memInfo = await si.mem();
    const graphicsInfo = await si.graphics();
    
    const totalRamGB = Math.round(memInfo.total / (1024 * 1024 * 1024));
    let gpuControllers = graphicsInfo.controllers || [];
    
    // Filter: identify integrated GPUs by known iGPU keywords
    const isIntegratedGpu = (name) => {
      const n = name.toLowerCase();
      return (n.includes('integrated') || n.includes('uhd ') || n.includes('iris') || n.includes('vega') ||
        (n.includes('intel') && !n.includes('arc ')) ||
        (n.includes('radeon') && (n.includes(' r5') || n.includes(' r7')) && !n.includes('rx ')));
    };
    let discreteGpus = gpuControllers.filter(gpu => !isIntegratedGpu(gpu.model));
    
    let selectedGpu = discreteGpus.length > 0 ? discreteGpus[0] : (gpuControllers[0] || null);
    
    let gpuName = selectedGpu ? selectedGpu.model : "Only CPU";
    let vramMB = selectedGpu ? (selectedGpu.vram || 0) : 0;
    let vramGB = Math.round((vramMB / 1024) * 10) / 10;
    let memoryType = selectedGpu ? (selectedGpu.memoryType || "") : "";
    
    // 1. GPU Architecture Score (G)
    let G = 0.1;
    let archName = "Unknown";
    if (selectedGpu) {
      const nameLower = selectedGpu.model.toLowerCase();
      // NVIDIA Blackwell (RTX 50xx)
      if (nameLower.includes('rtx 50')) {
        G = 12.0;
        archName = "Blackwell (RTX 50xx)";
      // NVIDIA Ada Lovelace (RTX 40xx)
      } else if (nameLower.includes('rtx 40')) {
        G = 10.0;
        archName = "Ada Lovelace (RTX 40xx)";
      // NVIDIA Ampere (RTX 30xx)
      } else if (nameLower.includes('rtx 30')) {
        G = 8.0;
        archName = "Ampere (RTX 30xx)";
      // NVIDIA Turing (RTX 20xx / GTX 16xx)
      } else if (nameLower.includes('rtx 20') || nameLower.includes('gtx 16')) {
        G = 5.0;
        archName = "Turing (RTX 20xx / GTX 16xx)";
      // NVIDIA Pascal (GTX 10xx)
      } else if (nameLower.includes('gtx 10')) {
        G = 3.0;
        archName = "Pascal (GTX 10xx)";
      // NVIDIA Professional (RTX A-series workstation)
      } else if (nameLower.includes('rtx a')) {
        G = 9.0;
        archName = "NVIDIA Professional (RTX Axxxx)";
      // AMD RDNA 3 (RX 7xxx)
      } else if (nameLower.includes('rx 7')) {
        G = 8.0;
        archName = "RDNA 3 (RX 7xxx)";
      // AMD RDNA 2 (RX 6xxx)
      } else if (nameLower.includes('rx 6')) {
        G = 6.0;
        archName = "RDNA 2 (RX 6xxx)";
      // AMD RDNA 1 (RX 5xxx)
      } else if (nameLower.includes('rx 5')) {
        G = 4.0;
        archName = "RDNA 1 (RX 5xxx)";
      // Intel Arc (A-series discrete)
      } else if (nameLower.includes('arc ')) {
        G = 5.0;
        archName = "Intel Arc (Alchemist)";
      // Integrated GPU fallback
      } else if (isIntegratedGpu(selectedGpu.model)) {
        G = 1.0;
        archName = "Integrated GPU (iGPU)";
      } else {
        G = 2.0;
        archName = "Generic Discrete GPU";
      }
    } else {
      archName = "CPU Only";
    }
    
    // 2. Memory Bandwidth Weight (B)
    let B = 0.3;
    const memTypeLower = memoryType.toLowerCase();
    if (memTypeLower.includes('hbm') || memTypeLower.includes('gddr6x')) {
      B = 1.5;
    } else if (memTypeLower.includes('gddr6')) {
      B = 1.2;
    } else if (memTypeLower.includes('gddr5') || memTypeLower.includes('gddr5x')) {
      B = 0.8;
    } else if (selectedGpu && G > 1.0) {
      B = 1.0;
    }
    
    // 3. System RAM Bonus (R)
    let R = 0.0;
    if (totalRamGB >= 64) R = 8.0;
    else if (totalRamGB >= 32) R = 5.0;
    else if (totalRamGB >= 16) R = 3.0;
    else if (totalRamGB >= 8) R = 1.0;
    
    // 4. Score GPI
    let gpi = 0;
    if (selectedGpu && G > 1.0) {
      gpi = G * vramGB * B + R;
    } else {
      gpi = G * (totalRamGB / 2) * B + R;
    }
    gpi = Math.round(gpi * 10) / 10;
    
    let tier = 1;
    let tierName = "Tier 1: Entry-Level";
    if (gpi >= 100) {
      tier = 4;
      tierName = "Tier 4: Enthusiast / Ultra";
    } else if (gpi >= 50) {
      tier = 3;
      tierName = "Tier 3: High-End";
    } else if (gpi >= 15) {
      tier = 2;
      tierName = "Tier 2: Mid-Range";
    }
    
    return {
      cpu: cpuInfo.brand,
      ram: totalRamGB,
      gpu: gpuName,
      vram: vramGB,
      gpuArch: archName,
      gpuMemType: memoryType || "Shared/DDR",
      gpi: gpi,
      tier: tier,
      tierName: tierName
    };
  } catch (error) {
    console.error("Failed to run hardware diagnostics:", error);
    return {
      cpu: "Unknown CPU",
      ram: 8,
      gpu: "Unknown GPU",
      vram: 0,
      gpuArch: "Unknown",
      gpuMemType: "Unknown",
      gpi: 1.0,
      tier: 1,
      tierName: "Tier 1: Entry-Level"
    };
  }
});

// IPC: Environment check
ipcMain.handle('check-environment', async () => {
  const envStatus = {
    node: { installed: false, version: '', path: '' },
    ollama: { installed: false, version: '', path: '', running: false },
    openclaw: { installed: false, running: false }
  };

  // 1. Check Node.js
  // Check system node
  try {
    const nodeVer = child_process.execSync('node -v').toString().trim();
    envStatus.node.installed = true;
    envStatus.node.version = nodeVer;
    envStatus.node.path = 'system';
  } catch (e) {
    // Check portable node
    const portableNodeExe = path.join(nodePortableDir, 'node.exe');
    if (fs.existsSync(portableNodeExe)) {
      try {
        const nodeVer = child_process.execSync(`"${portableNodeExe}" -v`).toString().trim();
        envStatus.node.installed = true;
        envStatus.node.version = nodeVer;
        envStatus.node.path = portableNodeExe;
      } catch (err) {}
    }
  }

  // 2. Check Ollama
  const headlessOllamaExe = path.join(ollamaDir, 'ollama.exe');
  if (fs.existsSync(headlessOllamaExe)) {
    envStatus.ollama.installed = true;
    envStatus.ollama.path = headlessOllamaExe;
  } else {
    // Check system Ollama
    try {
      child_process.execSync('where ollama');
      envStatus.ollama.installed = true;
      envStatus.ollama.path = 'system';
    } catch (e) {}
  }

  if (envStatus.ollama.installed) {
    // Check if running
    try {
      const res = await new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:11434/api/tags', (res) => {
          res.resume(); // consume response to free socket
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        // http.get() calls req.end() automatically
      });
      envStatus.ollama.running = res;
    } catch (e) {
      envStatus.ollama.running = false;
    }
  }

  // 3. Check OpenClaw
  const localOpenClawMjs = path.join(appDataDir, 'node_modules', 'openclaw', 'openclaw.mjs');
  if (fs.existsSync(localOpenClawMjs)) {
    envStatus.openclaw.installed = true;
  } else {
    // Check if globally installed
    try {
      child_process.execSync('openclaw -v', { stdio: 'ignore' });
      envStatus.openclaw.installed = true;
    } catch (err) {}
  }
  
  envStatus.openclaw.running = await checkGatewayOnline();
  if (envStatus.openclaw.running) {
    pollNewLogs();
  }

  return envStatus;
});

// IPC: Setup Node.js
ipcMain.handle('setup-node', async (event, option) => {
  if (option === 'system') {
    try {
      child_process.execSync('node -v');
      return { success: true, path: 'system' };
    } catch (e) {
      throw new Error("Node.js is not installed on your system PATH.");
    }
  }

  // Install Portable
  const nodeZipUrl = `https://nodejs.org/dist/v${NODE_PORTABLE_VERSION}/node-v${NODE_PORTABLE_VERSION}-win-x64.zip`;
  const zipPath = path.join(downloadsDir, 'node.zip');
  
  try {
    mainWindow.webContents.send('pull-progress', { status: 'Downloading Node.js...', percent: 10, task: 'node' });
    await downloadFile(nodeZipUrl, zipPath, (downloaded, total) => {
      const percent = Math.round((downloaded / total) * 78) + 10;
      mainWindow.webContents.send('pull-progress', { status: 'Downloading Node.js Portable...', percent, task: 'node' });
    });

    // Verify integrity before extracting
    mainWindow.webContents.send('pull-progress', { status: 'Verifying file integrity...', percent: 90, task: 'node' });
    await verifyChecksum(zipPath, NODE_PORTABLE_SHA256);

    mainWindow.webContents.send('pull-progress', { status: 'Extracting Node.js Portable...', percent: 95, task: 'node' });
    await unzipFile(zipPath, nodePortableDir);
    
    // Move files from nested folder to nodePortableDir if needed
    const nestedDir = path.join(nodePortableDir, `node-v${NODE_PORTABLE_VERSION}-win-x64`);
    if (fs.existsSync(nestedDir)) {
      const files = fs.readdirSync(nestedDir);
      files.forEach(file => {
        const oldPath = path.join(nestedDir, file);
        const newPath = path.join(nodePortableDir, file);
        if (fs.existsSync(newPath)) {
          if (fs.statSync(newPath).isDirectory()) fs.rmSync(newPath, { recursive: true });
          else fs.unlinkSync(newPath);
        }
        fs.renameSync(oldPath, newPath);
      });
      fs.rmdirSync(nestedDir);
    }
    
    // Clean up zip
    fs.unlinkSync(zipPath);
    
    const portableNodeExe = path.join(nodePortableDir, 'node.exe');
    return { success: true, path: portableNodeExe };
  } catch (error) {
    console.error("Node setup failed:", error);
    throw new Error(`Node.js Portable installation failed: ${error.message}`);
  }
});

// IPC: Setup Ollama Headless
ipcMain.handle('setup-ollama', async () => {
  const ollamaZipUrl = "https://ollama.com/download/ollama-windows-amd64.zip";
  const zipPath = path.join(downloadsDir, 'ollama.zip');
  
  try {
    mainWindow.webContents.send('pull-progress', { status: 'Downloading Ollama Headless...', percent: 10, task: 'ollama' });
    await downloadFile(ollamaZipUrl, zipPath, (downloaded, total) => {
      const percent = Math.round((downloaded / total) * 78) + 10;
      mainWindow.webContents.send('pull-progress', { status: 'Downloading Ollama...', percent, task: 'ollama' });
    });

    // Size sanity check for Ollama (official build should be >50MB)
    mainWindow.webContents.send('pull-progress', { status: 'Verifying file integrity...', percent: 90, task: 'ollama' });
    const ollamaStat = fs.statSync(zipPath);
    if (ollamaStat.size < 50 * 1024 * 1024) {
      fs.unlinkSync(zipPath);
      throw new Error(`Ollama download appears corrupt or incomplete (size: ${Math.round(ollamaStat.size / 1024 / 1024)}MB, expected >50MB).`);
    }

    mainWindow.webContents.send('pull-progress', { status: 'Extracting Ollama...', percent: 95, task: 'ollama' });
    await unzipFile(zipPath, ollamaDir);
    
    // Clean up zip
    fs.unlinkSync(zipPath);
    
    return { success: true, path: path.join(ollamaDir, 'ollama.exe') };
  } catch (error) {
    console.error("Ollama setup failed:", error);
    throw new Error(`Ollama Headless installation failed: ${error.message}`);
  }
});

// IPC: Start Ollama Headless
ipcMain.handle('start-ollama', async () => {
  if (ollamaProcess) return { success: true, msg: "Already running" };
  
  let ollamaExe = 'ollama';
  const localOllama = path.join(ollamaDir, 'ollama.exe');
  if (fs.existsSync(localOllama)) {
    ollamaExe = localOllama;
  }
  
  try {
    const env = { 
      ...process.env, 
      OLLAMA_MODELS: modelsDir,
      OLLAMA_HOST: '127.0.0.1:11434'
    };
    
    // Spawn without shell:true — pass executable and args directly to avoid command injection
    ollamaProcess = child_process.spawn(ollamaExe, ['serve'], {
      env,
      detached: false // Keep attached to app lifecycle
    });
    
    // Wait for API to boot up
    let retries = 10;
    while (retries > 0) {
      const isOnline = await new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:11434/api/tags', (res) => {
          res.resume();
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        // http.get() calls req.end() automatically
      });
      if (isOnline) break;
      await new Promise(r => setTimeout(r, 1000));
      retries--;
    }
    
    if (retries === 0) throw new Error("Ollama took too long to start.");
    
    return { success: true };
  } catch (error) {
    ollamaProcess = null;
    throw error;
  }
});

// IPC: Stop Ollama
ipcMain.handle('stop-ollama', async () => {
  if (!ollamaProcess) return { success: true };
  try {
    ollamaProcess.kill();
  } catch (e) {}
  ollamaProcess = null;
  return { success: true };
});

// IPC: Pull Model
ipcMain.handle('pull-model', async (event, modelName) => {
  const options = {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/pull',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            let percent = 0;
            if (data.status === 'success') {
              percent = 100;
            } else if (data.total > 0) {
              percent = Math.round((data.completed / data.total) * 100);
            }
            mainWindow.webContents.send('pull-progress', {
              status: data.status,
              percent,
              completed: data.completed,
              total: data.total,
              task: 'model'
            });
          } catch (e) {
            console.error("JSON parse error on pull progress:", e);
          }
        }
      });
      
      res.on('end', () => {
        resolve({ success: true });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify({ name: modelName }));
    req.end();
  });
});

// IPC: Load config — decrypts any encrypted env keys on read
ipcMain.handle('load-config', async () => {
  if (!fs.existsSync(openclawConfigFile)) {
    return {
      agents: {
        defaults: { workspace: path.join(openclawConfigDir, 'workspace') }
      },
      channels: {}
    };
  }
  try {
    const content = fs.readFileSync(openclawConfigFile, 'utf-8');
    const config = JSON5.parse(content);
    // Decrypt env API keys so the renderer receives plaintext values for display
    if (config.env && typeof config.env === 'object') {
      for (const key of Object.keys(config.env)) {
        config.env[key] = decryptEnvValue(config.env[key]);
      }
    }
    return config;
  } catch (e) {
    console.error("Error loading config:", e);
    return {};
  }
});

// IPC: Save config — encrypts env API keys before writing to disk
ipcMain.handle('save-config', async (event, config) => {
  // Basic type-safety guard: config must be a plain object
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Invalid config: must be a plain object.');
  }
  try {
    const configToWrite = { ...config };
    // Encrypt all values inside config.env (API keys, tokens)
    if (configToWrite.env && typeof configToWrite.env === 'object') {
      const encryptedEnv = {};
      for (const [key, value] of Object.entries(configToWrite.env)) {
        encryptedEnv[key] = encryptEnvValue(String(value));
      }
      configToWrite.env = encryptedEnv;
    }
    const jsonString = JSON5.stringify(configToWrite, null, 2);
    fs.writeFileSync(openclawConfigFile, jsonString, 'utf-8');
    return { success: true };
  } catch (e) {
    console.error("Error saving config:", e);
    throw e;
  }
});

// IPC: Start OpenClaw Gateway
ipcMain.handle('start-openclaw', async () => {
  const online = await checkGatewayOnline();
  if (online) return { success: true };

  // Find node path to run
  let nodeBin = 'node';
  const portableNode = path.join(nodePortableDir, 'node.exe');
  if (fs.existsSync(portableNode)) {
    nodeBin = portableNode;
  }

  // Ensure OpenClaw is installed locally in ez-openclaw runtime folder if not global
  const runDir = appDataDir;
  
  // Set up local environment for npm/node resolution (adds portable Node to PATH if selected)
  const env = {
    ...process.env,
    OPENCLAW_CONFIG_PATH: openclawConfigFile,
    OLLAMA_API_KEY: 'ollama-local'
  };
  if (fs.existsSync(portableNode)) {
    env.PATH = `${nodePortableDir};${process.env.PATH || ''}`;
  }

  if (!fs.existsSync(path.join(runDir, 'node_modules', 'openclaw'))) {
    try {
      mainWindow.webContents.send('openclaw-log', "[EZ-Installer] Initializing OpenClaw core files...\n");
      // Run npm install using the corrected environment path
      child_process.execSync('npm install openclaw@latest', { 
        cwd: runDir, 
        env,
        stdio: 'pipe'
      });
    } catch (e) {
      console.error("Local openclaw install failed:", e);
      throw new Error(`Failed to initialize OpenClaw core files: ${e.message}`);
    }
  }

  try {
    // Run the official OpenClaw CLI gateway command
    const openclawCliPath = path.join(runDir, 'node_modules', 'openclaw', 'openclaw.mjs');
    
    // Ensure the gateway scheduled task is registered (required on fresh Windows installs/Sandbox)
    try {
      child_process.execSync(`"${nodeBin}" "${openclawCliPath}" gateway install`, {
        cwd: runDir,
        env,
        stdio: 'ignore'
      });
    } catch (err) {
      console.warn("Gateway install task creation warning (might already exist or lack permissions):", err.message);
    }

    // Spawn without shell:true — pass args directly to avoid command injection
    const proc = child_process.spawn(nodeBin, [openclawCliPath, 'gateway', 'start'], {
      cwd: runDir,
      env
    });

    proc.stdout.on('data', (data) => {
      if (mainWindow) mainWindow.webContents.send('openclaw-log', data.toString());
    });

    proc.stderr.on('data', (data) => {
      if (mainWindow) mainWindow.webContents.send('openclaw-log', `[ERROR] ${data.toString()}`);
    });

    // Wait for the gateway to be online (up to 15 seconds)
    let retries = 15;
    while (retries > 0) {
      const isOnline = await checkGatewayOnline();
      if (isOnline) break;
      await new Promise(r => setTimeout(r, 1000));
      retries--;
    }

    // Trigger an immediate log poll once online
    pollNewLogs();

    return { success: true };
  } catch (error) {
    throw error;
  }
});

// IPC: Stop OpenClaw
ipcMain.handle('stop-openclaw', async () => {
  let nodeBin = 'node';
  const portableNode = path.join(nodePortableDir, 'node.exe');
  if (fs.existsSync(portableNode)) {
    nodeBin = portableNode;
  }

  const runDir = appDataDir;
  const openclawCliPath = path.join(runDir, 'node_modules', 'openclaw', 'openclaw.mjs');

  try {
    const env = {
      ...process.env,
      OPENCLAW_CONFIG_PATH: openclawConfigFile,
      OLLAMA_API_KEY: 'ollama-local'
    };

    // Run the official OpenClaw CLI gateway stop command
    child_process.execSync(`"${nodeBin}" "${openclawCliPath}" gateway stop`, {
      cwd: runDir,
      env
    });

    // Wait for the gateway to be offline (up to 10 seconds)
    let retries = 10;
    while (retries > 0) {
      const isOnline = await checkGatewayOnline();
      if (!isOnline) return { success: true };
      await new Promise(r => setTimeout(r, 1000));
      retries--;
    }

    // If still online after retries, report failure
    const stillOnline = await checkGatewayOnline();
    return { success: !stillOnline };
  } catch (e) {
    console.error("Failed to stop gateway via CLI command:", e);
    // Even if command failed, check if gateway actually stopped
    const stillOnline = await checkGatewayOnline();
    return { success: !stillOnline };
  }
});

// IPC: Run Doctor Fix
ipcMain.handle('run-doctor-fix', async () => {
  let nodeBin = 'node';
  const portableNode = path.join(nodePortableDir, 'node.exe');
  if (fs.existsSync(portableNode)) {
    nodeBin = portableNode;
  }

  const runDir = appDataDir;
  const openclawCliPath = path.join(runDir, 'node_modules', 'openclaw', 'openclaw.mjs');

  // Validate OpenClaw is installed before running doctor
  if (!fs.existsSync(openclawCliPath)) {
    if (mainWindow) {
      mainWindow.webContents.send('openclaw-log', '[Doctor] ERROR: OpenClaw is not installed. Please run Setup Wizard first.\n');
    }
    return { success: false };
  }

  return new Promise((resolve) => {
    const env = {
      ...process.env,
      OPENCLAW_CONFIG_PATH: openclawConfigFile,
      OLLAMA_API_KEY: 'ollama-local'
    };
    if (fs.existsSync(portableNode)) {
      env.PATH = `${nodePortableDir};${process.env.PATH || ''}`;
    }

    // Spawn without shell:true — pass args directly to avoid command injection
    const doctorProcess = child_process.spawn(nodeBin, [openclawCliPath, 'doctor', '--fix'], {
      cwd: runDir,
      env
    });

    doctorProcess.stdout.on('data', (data) => {
      if (mainWindow) mainWindow.webContents.send('openclaw-log', `[Doctor] ${data.toString()}`);
    });

    doctorProcess.stderr.on('data', (data) => {
      if (mainWindow) mainWindow.webContents.send('openclaw-log', `[Doctor ERROR] ${data.toString()}`);
    });

    doctorProcess.on('error', (err) => {
      if (mainWindow) mainWindow.webContents.send('openclaw-log', `[Doctor] Failed to start: ${err.message}\n`);
      resolve({ success: false });
    });

    doctorProcess.on('close', (code) => {
      resolve({ success: code === 0 });
    });
  });
});

// IPC: Get default workspace path (dynamic, based on user profile)
ipcMain.handle('get-default-workspace', async () => {
  const userProfile = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Public';
  return path.join(userProfile, 'ez-openclaw-workspace');
});

// IPC: Resource Monitor
ipcMain.handle('get-resource-usage', async () => {
  try {
    const cpuLoad = await si.currentLoad();
    const memInfo = await si.mem();
    return {
      cpu: cpuLoad.currentLoad || 0,
      ramTotal: memInfo.total || 0,
      ramUsed: memInfo.active || 0
    };
  } catch (e) {
    return { cpu: 0, ramTotal: 0, ramUsed: 0 };
  }
});

// IPC: Model Management
ipcMain.handle('get-local-models', async () => {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:11434/api/tags', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
});

ipcMain.handle('delete-local-model', async (_, name) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ name });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/delete',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
});

// IPC: Updates
ipcMain.on('check-for-updates', () => {
  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) { console.warn(e.message); }
});

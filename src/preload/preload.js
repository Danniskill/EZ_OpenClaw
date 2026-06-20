const { contextBridge, ipcRenderer } = require('electron');

// --- Input Validation Helpers ---

/** Allow only 'portable' or 'system' for node setup option */
function validateNodeOption(option) {
  if (option !== 'portable' && option !== 'system') {
    throw new Error(`Invalid node option: "${option}". Must be 'portable' or 'system'.`);
  }
  return option;
}

/**
 * Validate Ollama model name/tag.
 * Allowed characters: lowercase letters, digits, colon, dot, hyphen, underscore, forward-slash.
 * Examples: "qwen2.5:7b-instruct-q4_K_M", "llama3.2:3b", "custom/model:tag"
 */
function validateModelName(modelName) {
  if (typeof modelName !== 'string' || modelName.trim().length === 0) {
    throw new Error('Model name must be a non-empty string.');
  }
  if (modelName.length > 200) {
    throw new Error('Model name is too long (max 200 characters).');
  }
  // Only allow safe characters — no shell metacharacters
  if (!/^[a-zA-Z0-9._:\/\-]+$/.test(modelName.trim())) {
    throw new Error(`Model name contains invalid characters: "${modelName}"`);
  }
  return modelName.trim();
}

/** Ensure config is a plain serializable object, not a function or array */
function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config) || typeof config === 'function') {
    throw new Error('Config must be a plain object.');
  }
  // Serialize and deserialize to strip any non-serializable values (functions, circular refs)
  try {
    return JSON.parse(JSON.stringify(config));
  } catch (e) {
    throw new Error('Config contains non-serializable values.');
  }
}

// --- Exposed API Bridge ---

contextBridge.exposeInMainWorld('api', {
  getHardwareInfo: () => ipcRenderer.invoke('get-hardware-info'),
  checkEnvironment: () => ipcRenderer.invoke('check-environment'),

  setupNode: (option) => ipcRenderer.invoke('setup-node', validateNodeOption(option)),
  setupOllama: () => ipcRenderer.invoke('setup-ollama'),
  startOllama: () => ipcRenderer.invoke('start-ollama'),
  stopOllama: () => ipcRenderer.invoke('stop-ollama'),

  pullModel: (modelName) => ipcRenderer.invoke('pull-model', validateModelName(modelName)),

  saveConfig: (config) => ipcRenderer.invoke('save-config', validateConfig(config)),
  loadConfig: () => ipcRenderer.invoke('load-config'),

  startOpenClaw: () => ipcRenderer.invoke('start-openclaw'),
  stopOpenClaw: () => ipcRenderer.invoke('stop-openclaw'),
  runDoctorFix: () => ipcRenderer.invoke('run-doctor-fix'),
  getDefaultWorkspace: () => ipcRenderer.invoke('get-default-workspace'),

  getResourceUsage: () => ipcRenderer.invoke('get-resource-usage'),
  getLocalModels: () => ipcRenderer.invoke('get-local-models'),
  deleteLocalModel: (name) => ipcRenderer.invoke('delete-local-model', validateModelName(name)),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),

  // Event listeners with cleanup support:
  // Each returns an unsubscribe function to prevent memory leaks.
  onPullProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('pull-progress', handler);
    return () => ipcRenderer.removeListener('pull-progress', handler);
  },
  onOpenClawLog: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('openclaw-log', handler);
    return () => ipcRenderer.removeListener('openclaw-log', handler);
  },
  onOpenClawStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('openclaw-status', handler);
    return () => ipcRenderer.removeListener('openclaw-status', handler);
  },
  onWhatsAppQR: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('whatsapp-qr', handler);
    return () => ipcRenderer.removeListener('whatsapp-qr', handler);
  },
  onUpdateStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  },
  onWindowShow: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('window-show', handler);
    return () => ipcRenderer.removeListener('window-show', handler);
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Cpu, MessageSquare, ToggleLeft, ShieldAlert, Settings, 
  Play, Square, RefreshCw, CheckCircle, AlertTriangle, ArrowRight,
  Globe, Terminal, Download, Check, Key, HelpCircle, FileText, Code
} from 'lucide-react';
import { OLLAMA_MODELS } from './modelsData';
import { useTranslation } from 'react-i18next';
// Error Boundary: catches render errors and prevents full app crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[EZ-OpenClaw] Render error caught by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#1f1f1f', color: '#fff', fontFamily: 'Segoe UI, sans-serif', padding: 40
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>An unexpected error occurred</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20, maxWidth: 480, textAlign: 'center' }}>
            EZ-OpenClaw encountered a rendering error. Please reload the app.
          </p>
          <pre style={{
            background: '#2b2b2b', color: '#f87171', padding: '12px 16px', borderRadius: 6,
            fontSize: 11, maxWidth: '80%', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24, padding: '8px 24px', background: '#0078d4', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const checkModelCompatibility = (variant, hwInfo) => {
  if (!hwInfo || !variant) return 'smooth';
  const ram = hwInfo.ram || 8;
  const vram = hwInfo.vram || 0;
  
  if (ram < variant.minRamGB) {
    return 'warning';
  }
  if (variant.minVramGB > 0 && vram < variant.minVramGB) {
    return 'heavy';
  }
  return 'smooth';
};

const findModelVariantByTag = (tag) => {
  if (!tag) return null;
  for (const model of OLLAMA_MODELS) {
    const variant = model.variants.find(v => v.tag === tag);
    if (variant) {
      return { model, variant };
    }
  }
  return null;
};

const getSelectedModelAndVariant = (tag) => {
  if (!tag) return { modelId: '', tag: '', custom: false };
  const match = findModelVariantByTag(tag);
  if (match) {
    return { modelId: match.model.id, tag: match.variant.tag, custom: false };
  }
  return { modelId: '__custom__', tag: tag, custom: true };
};

const renderCompatibilityBadge = (variant, hwInfo) => {
  if (!variant || !hwInfo) return null;
  const status = checkModelCompatibility(variant, hwInfo);
  if (status === 'smooth') {
    return (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">
        Smooth (GPU)
      </span>
    );
  } else if (status === 'heavy') {
    return (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
        Heavy (CPU Fallback)
      </span>
    );
  } else {
    return (
      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">
        Low RAM Warning
      </span>
    );
  }
};

const ModelSelectorRow = ({ label, role, currentValue, onChange, hwInfo, onPull }) => {
  const { t } = useTranslation();
  const parsed = getSelectedModelAndVariant(currentValue);
  const selectedModel = OLLAMA_MODELS.find(m => m.id === parsed.modelId) || null;
  const selectedVariant = selectedModel?.variants.find(v => v.tag === currentValue) || null;

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    if (modelId === '__custom__') {
      onChange(''); // start with empty custom value
    } else {
      const model = OLLAMA_MODELS.find(m => m.id === modelId);
      if (model && model.variants.length > 0) {
        // Prefer q4_K_M or first variant
        const recommendedVariant = model.variants.find(v => v.tag.includes('q4_K_M')) || model.variants[0];
        onChange(recommendedVariant.tag);
      }
    }
  };

  const handleVariantChange = (e) => {
    onChange(e.target.value);
  };

  const filteredModels = OLLAMA_MODELS.filter(m => m.roles.includes(role));

  return (
    <div className="space-y-2 bg-win11-bgDark/50 p-4 border border-win11-borderDark rounded-lg">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-gray-300">{label}</label>
        <div className="flex items-center space-x-2">
          {selectedVariant && renderCompatibilityBadge(selectedVariant, hwInfo)}
          {onPull && currentValue && (
            <button
              onClick={() => onPull(currentValue)}
              title={t('model_pull_title') || 'Download/pull this model via Ollama'}
              className="px-2 py-0.5 bg-win11-cardDark hover:bg-win11-accent hover:text-white border border-win11-borderDark rounded text-[9px] text-gray-300 flex items-center space-x-1 transition-colors"
            >
              <Download className="w-2.5 h-2.5" />
              <span>{t('model_pull_btn') || 'Pull'}</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] text-gray-500 font-semibold block">{t('model_family_label') || 'Model Family'}</span>
          <select 
            value={parsed.modelId || ''} 
            onChange={handleModelChange}
            className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-2.5 py-1.5 text-xs text-white focus:border-win11-accent focus:outline-none"
          >
            <option value="" disabled>{t('model_select_placeholder') || 'Select a model...'}</option>
            {filteredModels.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
            <option value="__custom__">{t('model_custom_tag') || 'Custom Model Tag...'}</option>
          </select>
        </div>

        {parsed.modelId !== '__custom__' && selectedModel ? (
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold block">{t('model_quantization_label') || 'Quantization / Tag'}</span>
            <select 
              value={currentValue} 
              onChange={handleVariantChange}
              className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-2.5 py-1.5 text-xs text-white focus:border-win11-accent focus:outline-none"
            >
              {selectedModel.variants.map(v => {
                const comp = checkModelCompatibility(v, hwInfo);
                const suffix = comp === 'smooth' ? ' (Smooth)' : comp === 'heavy' ? ' (Heavy/Slow)' : ' (Low RAM Warning)';
                return (
                  <option key={v.tag} value={v.tag}>
                    {v.label} - {v.sizeGB} GB{suffix}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold block">{t('model_custom_tag_label') || 'Custom Tag (e.g. llama3:8b)'}</span>
            <input 
              type="text"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('model_custom_placeholder') || 'Enter Ollama model tag...'}
              className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-2.5 py-1.5 text-xs text-white focus:border-win11-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      {selectedModel && (
        <div className="text-[10px] text-gray-400 leading-normal mt-1 pt-1.5 border-t border-win11-borderDark/30">
          <span className="font-semibold text-win11-accent">{selectedModel.name}</span>: {selectedModel.desc}
          {selectedVariant && (
            <span className="block text-gray-500 mt-0.5">
              Size: {selectedVariant.sizeGB} GB | Minimum RAM: {selectedVariant.minRamGB} GB {selectedVariant.minVramGB > 0 ? `| Minimum VRAM: ${selectedVariant.minVramGB} GB` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [showDashboard, setShowDashboard] = useState(false);
  const [gatewayToken, setGatewayToken] = useState('');
  const [logsExpanded, setLogsExpanded] = useState(false);
  
  const [resourceUsage, setResourceUsage] = useState({ cpu: 0, ramTotal: 0, ramUsed: 0 });
  const [localModelsList, setLocalModelsList] = useState([]);
  const [isDeletingModel, setIsDeletingModel] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  const getCleanStatusText = (status) => {
    if (!status) return "";
    if (status.startsWith('pulling ') && !status.endsWith('manifest') && !status.endsWith('config')) {
      return t('status_pulling_model');
    }
    if (status.startsWith('verifying ') || status.startsWith('sha256:')) {
      return t('status_pulling_model');
    }
    return status;
  };

  // Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(1);

  // Setup options
  const [nodeOption, setNodeOption] = useState('portable');
  const [aiProvider, setAiProvider] = useState('hybrid'); // 'local' | 'cloud' | 'hybrid'
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getAvailableSubSteps = () => {
    switch (aiProvider) {
      case 'local':
        return ['provider', 'local-models', 'channels'];
      case 'cloud':
        return ['provider', 'cloud-keys', 'channels'];
      case 'hybrid':
      default:
        return ['provider', 'local-models', 'cloud-keys', 'channels'];
    }
  };
  const [cloudKeys, setCloudKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: '',
    deepseek: ''
  });
  const [selectedChannels, setSelectedChannels] = useState({
    whatsapp: true,
    telegram: false,
    discord: false
  });
  const [whatsappAllowedNumbers, setWhatsappAllowedNumbers] = useState(''); // comma-separated phone numbers
  const [telegramToken, setTelegramToken] = useState('');
  const [discordToken, setDiscordToken] = useState('');

  // Environmental Status
  const [envStatus, setEnvStatus] = useState({
    node: { installed: false, version: '', path: '' },
    ollama: { installed: false, version: '', path: '', running: false },
    openclaw: { installed: false, running: false }
  });

  // Hardware Diagnostic
  const [isScanningHw, setIsScanningHw] = useState(false);
  const [hwInfo, setHwInfo] = useState(null);

  // Model Pull Progress
  const [pullProgress, setPullProgress] = useState(null); // { status, percent }
  const [overallPercent, setOverallPercent] = useState(0);
  const activeTasks = useRef([]);
  const [localModelsConfigured, setLocalModelsConfigured] = useState({
    chat: '',
    code: '',
    write: ''
  });
  const [assistantRole, setAssistantRole] = useState('chat'); // 'chat' | 'code' | 'write'
  const [localModelWizardStep, setLocalModelWizardStep] = useState('role-select'); // 'role-select' | 'model-config'

  // OpenClaw Daemon Control
  const [gatewayLogs, setGatewayLogs] = useState([]);
  const [whatsappQr, setWhatsappQr] = useState('');
  const [isDoctorRunning, setIsDoctorRunning] = useState(false);
  const [doctorResult, setDoctorResult] = useState(null); // 'success' | 'fail' | null

  // OpenClaw Skills Config
  const [skills, setSkills] = useState([
    { id: 'web_search', name: 'Web Search', desc: 'Allow assistant to search the web for real-time information.', enabled: true },
    { id: 'file_manager', name: 'File Management', desc: 'Read and write local files in workspace directory.', enabled: true },
    { id: 'shell_execution', name: 'Shell Command Execution', desc: 'Run shell commands (requires approval).', enabled: false },
    { id: 'calendar', name: 'Calendar Sync', desc: 'Manage calendars and appointments.', enabled: false },
    { id: 'email_manager', name: 'Email Assistant', desc: 'Draft and clean email inbox.', enabled: false }
  ]);

  const logConsoleRef = useRef(null);

  // Load Initial Configuration and Check Environment
  useEffect(() => {
    checkEnvironment();
    loadOpenClawConfig();
    
    // Setup IPC listeners (each returns an unsubscribe function)
    const cleanups = [];
    if (window.api) {
      cleanups.push(
        window.api.onUpdateStatus((data) => {
          setUpdateStatus(data);
        })
      );
      cleanups.push(
        window.api.onPullProgress((data) => {
          setPullProgress(data);
          if (activeTasks.current && activeTasks.current.length > 0 && data.task) {
            const taskIndex = activeTasks.current.indexOf(data.task);
            if (taskIndex !== -1) {
              const stepWeight = 100 / activeTasks.current.length;
              const overall = Math.round((taskIndex * stepWeight) + (data.percent / 100) * stepWeight);
              setOverallPercent(overall);
            }
          }
        })
      );
      
      cleanups.push(
        window.api.onOpenClawLog((log) => {
          setGatewayLogs(prev => [...prev.slice(-300), log]); // Keep last 300 lines
        })
      );

      cleanups.push(
        window.api.onWhatsAppQR((qrCode) => {
          setWhatsappQr(qrCode);
        })
      );

      cleanups.push(
        window.api.onOpenClawStatus((running) => {
          setEnvStatus(prev => ({
            ...prev,
            openclaw: { ...prev.openclaw, running: running }
          }));
        })
      );
    }

    // Cleanup: remove all IPC listeners on unmount to prevent memory leaks
    return () => {
      cleanups.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
    };
  }, []);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [gatewayLogs]);

  useEffect(() => {
    const fetchModels = async () => {
      if (window.api) {
        const result = await window.api.getLocalModels();
        if (result && result.models) {
          setLocalModelsList(result.models);
        }
      }
    };
    fetchModels();

    const fetchRes = async () => {
      if (window.api) {
        const usage = await window.api.getResourceUsage();
        setResourceUsage(usage);
      }
    };
    fetchRes();
    const interval = setInterval(() => {
      fetchRes();
      if (activeTab === 'ai') { fetchModels(); }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleDeleteModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete ${modelName}?`)) return;
    setIsDeletingModel(true);
    const success = await window.api.deleteLocalModel(modelName);
    if (success) {
      const result = await window.api.getLocalModels();
      if (result && result.models) setLocalModelsList(result.models);
    } else {
      alert(t('model_deleted_fail') || "Failed to delete model.");
    }
    setIsDeletingModel(false);
  };

  const checkEnvironment = async () => {
    if (window.api) {
      const status = await window.api.checkEnvironment();
      setEnvStatus(status);
      if (status.node.installed && status.openclaw.installed) {
        setIsSetupComplete(true);
      }
    }
  };

  const selectRecommendedModelForRole = (role, info = hwInfo) => {
    const tier = info?.tier || 1;
    let modelTag = '';
    if (role === 'chat') {
      if (tier === 4) modelTag = 'qwen2.5:14b-instruct-q4_K_M';
      else if (tier === 3) modelTag = 'qwen2.5:7b-instruct-q4_K_M';
      else if (tier === 2) modelTag = 'llama3.2:3b-instruct-q4_K_M';
      else modelTag = 'llama3.2:1b-instruct-q4_K_M';
    } else if (role === 'code') {
      if (tier === 4) modelTag = 'qwen2.5-coder:32b-instruct-q4_K_M';
      else if (tier === 3) modelTag = 'qwen2.5-coder:7b-instruct-q4_K_M';
      else if (tier === 2) modelTag = 'qwen2.5-coder:7b-instruct-q4_K_M';
      else modelTag = 'qwen2.5-coder:1.5b-instruct-q4_K_M';
    } else if (role === 'write') {
      if (tier === 4) modelTag = 'gemma3:27b-q4_K_M';
      else if (tier === 3) modelTag = 'gemma4:12b-q4_K_M';
      else if (tier === 2) modelTag = 'gemma4:e4b-q4_K_M';
      else modelTag = 'llama3.2:1b-instruct-q4_K_M';
    }
    setLocalModelsConfigured(prev => ({ ...prev, [role]: modelTag }));
  };

  const handleSelectRole = (role) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAssistantRole(role);
      selectRecommendedModelForRole(role);
      setLocalModelWizardStep('model-config');
      setIsTransitioning(false);
    }, 150);
  };

  const loadOpenClawConfig = async () => {
    if (window.api) {
      const config = await window.api.loadConfig();
      if (config.gateway?.auth?.token) {
        setGatewayToken(config.gateway.auth.token);
      }
      // Parse active models and channels
      if (config.agents?.defaults?.model?.primary) {
        let modelTag = config.agents.defaults.model.primary;
        // Strip provider prefix if present
        if (modelTag.startsWith('ollama/')) {
          modelTag = modelTag.substring('ollama/'.length);
        }
        let role = 'chat';
        const matched = findModelVariantByTag(modelTag);
        if (matched) {
          if (matched.model.roles.includes('chat')) role = 'chat';
          else if (matched.model.roles.includes('code')) role = 'code';
          else if (matched.model.roles.includes('write')) role = 'write';
        }
        setAssistantRole(role);
        setLocalModelsConfigured(prev => ({ ...prev, [role]: modelTag }));
      }
      if (config.channels) {
        setSelectedChannels({
          whatsapp: !!config.channels.whatsapp,
          telegram: !!config.channels.telegram,
          discord: !!config.channels.discord
        });
      }
    }
  };

  // Hardware scan action
  const handleScanHardware = async () => {
    setIsScanningHw(true);
    if (window.api) {
      // Small artificial delay for visual feedback
      await new Promise(r => setTimeout(r, 2000));
      const info = await window.api.getHardwareInfo();
      setHwInfo(info);
      
      // Auto recommend models based on Tier
      if (info.tier === 4) {
        setLocalModelsConfigured({
          chat: 'qwen2.5:14b-instruct-q4_K_M',
          code: 'qwen2.5-coder:32b-instruct-q4_K_M',
          write: 'gemma3:27b-q4_K_M'
        });
      } else if (info.tier === 3) {
        setLocalModelsConfigured({
          chat: 'qwen2.5:7b-instruct-q4_K_M',
          code: 'qwen2.5-coder:7b-instruct-q4_K_M',
          write: 'gemma4:12b-q4_K_M'
        });
      } else if (info.tier === 2) {
        setLocalModelsConfigured({
          chat: 'llama3.2:3b-instruct-q4_K_M',
          code: 'qwen2.5-coder:7b-instruct-q4_K_M',
          write: 'gemma4:e4b-q4_K_M'
        });
      } else {
        setLocalModelsConfigured({
          chat: 'llama3.2:1b-instruct-q4_K_M',
          code: 'qwen2.5-coder:1.5b-instruct-q4_K_M',
          write: 'llama3.2:1b-instruct-q4_K_M'
        });
      }
    }
    setIsScanningHw(false);
  };

  // Parse WhatsApp allowed numbers input into a config array
  const parseWhatsappAllowList = (input) => {
    if (!input || !input.trim()) return ['*'];
    return input.split(',').map(n => n.trim()).filter(n => n.length > 0);
  };

  // Run installer in Setup Wizard
  const handleInstallDependencies = async () => {
    if (aiProvider === 'cloud') {
      const hasKey = Object.values(cloudKeys).some(key => key && key.trim().length > 0);
      if (!hasKey) {
        alert(lang === 'vi' 
          ? "Vui lòng cấu hình ít nhất một API Key (OpenAI, Anthropic, Gemini, hoặc DeepSeek) trước khi tiếp tục!" 
          : "Please configure at least one API Key (OpenAI, Anthropic, Gemini, or DeepSeek) before proceeding!"
        );
        return;
      }
    }

    try {
      const tasks = [];
      if (nodeOption === 'portable') {
        tasks.push('node');
      }
      if (aiProvider === 'local' || aiProvider === 'hybrid') {
        tasks.push('ollama');
        tasks.push('model');
      }
      activeTasks.current = tasks;
      setOverallPercent(0);
      setPullProgress({ status: 'Initializing installation...', percent: 5, task: tasks[0] });
      
      // 1. Setup Node
      await window.api.setupNode(nodeOption);
      
      // 2. Setup Ollama if Local/Hybrid is selected
      if (aiProvider === 'local' || aiProvider === 'hybrid') {
        await window.api.setupOllama();
        await window.api.startOllama();
        
        // Pull primary model
        const primaryModel = localModelsConfigured[assistantRole] || 'qwen2.5:7b-instruct-q4_K_M';
        await window.api.pullModel(primaryModel);
      }
      
      // 3. Save initial config with dynamic workspace path
      const workspacePath = await window.api.getDefaultWorkspace();
      const isLocal = aiProvider === 'local' || aiProvider === 'hybrid';
      const primaryModel = isLocal 
        ? `ollama/${localModelsConfigured[assistantRole]}` 
        : 'openai/gpt-4o';

      const initialConfig = {
        models: isLocal ? {
          providers: {
            ollama: {
              baseUrl: "http://127.0.0.1:11434",
              apiKey: "ollama-local",
              api: "openai-completions"
            }
          }
        } : {},
        agents: {
          defaults: {
            workspace: workspacePath,
            model: {
              primary: primaryModel
            }
          },
          list: [
            { id: "main", identity: { name: "EZ-Claw", theme: "helpful assistant", emoji: "\uD83E\uDD16" } }
          ]
        },
        channels: {},
        env: {}
      };

      // Save cloud API keys into config.env
      if (isLocal) {
        initialConfig.env.OLLAMA_API_KEY = "ollama-local";
      }
      if (cloudKeys.openai && cloudKeys.openai.trim()) initialConfig.env.OPENAI_API_KEY = cloudKeys.openai.trim();
      if (cloudKeys.gemini && cloudKeys.gemini.trim()) initialConfig.env.GEMINI_API_KEY = cloudKeys.gemini.trim();
      if (cloudKeys.anthropic && cloudKeys.anthropic.trim()) initialConfig.env.ANTHROPIC_API_KEY = cloudKeys.anthropic.trim();
      if (cloudKeys.deepseek && cloudKeys.deepseek.trim()) initialConfig.env.DEEPSEEK_API_KEY = cloudKeys.deepseek.trim();

      if (selectedChannels.whatsapp) {
        initialConfig.channels.whatsapp = { allowFrom: parseWhatsappAllowList(whatsappAllowedNumbers) };
      }
      if (selectedChannels.telegram) {
        initialConfig.channels.telegram = { token: telegramToken };
      }
      if (selectedChannels.discord) {
        initialConfig.channels.discord = { token: discordToken };
      }

      await window.api.saveConfig(initialConfig);

      // Force refresh env status
      await checkEnvironment();
      
      setPullProgress(null);
      setSetupStep(4); // Move to success page
    } catch (e) {
      alert(`Installation failed: ${e.message}`);
      setPullProgress(null);
    }
  };

  // OpenClaw Daemon control
  const handleStartOpenClaw = async () => {
    if (window.api) {
      setGatewayLogs(prev => [...prev, "[SYSTEM] Booting Ollama background process...\n"]);
      await window.api.startOllama();
      setGatewayLogs(prev => [...prev, "[SYSTEM] Starting OpenClaw Gateway...\n"]);
      await window.api.startOpenClaw();
      await checkEnvironment();
    }
  };

  const handleStartDashboard = async () => {
    setShowDashboard(true);
    if (window.api) {
      try {
        const config = await window.api.loadConfig();
        if (config.gateway?.auth?.token) {
          setGatewayToken(config.gateway.auth.token);
        }
      } catch (e) {
        console.error("Failed to load gateway token:", e);
      }
    }

    if (!envStatus.openclaw.running) {
      setGatewayLogs(prev => [...prev, "[SYSTEM] Booting Ollama background process...\n"]);
      await window.api.startOllama();
      setGatewayLogs(prev => [...prev, "[SYSTEM] Starting OpenClaw Gateway...\n"]);
      await window.api.startOpenClaw();
      await checkEnvironment();
      
      if (window.api) {
        try {
          const config = await window.api.loadConfig();
          if (config.gateway?.auth?.token) {
            setGatewayToken(config.gateway.auth.token);
          }
        } catch (e) {
          console.error("Failed to reload gateway token:", e);
        }
      }
    }
  };

  const handleStopOpenClaw = async () => {
    if (window.api) {
      setGatewayLogs(prev => [...prev, "[SYSTEM] Stopping services...\n"]);
      await window.api.stopOpenClaw();
      await window.api.stopOllama();
      setWhatsappQr('');
      setShowDashboard(false);
      await checkEnvironment();
    }
  };

  const handleRunDoctor = async () => {
    setIsDoctorRunning(true);
    setDoctorResult(null);
    if (window.api) {
      const res = await window.api.runDoctorFix();
      setDoctorResult(res.success ? 'success' : 'fail');
    }
    setIsDoctorRunning(false);
  };

  const getCurrentSubStepContent = () => {
    const subSteps = getAvailableSubSteps();
    const currentSubStep = subSteps[subStepIndex];

    switch (currentSubStep) {
      case 'provider':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">{t('ai_choice_title')}</h2>
            <p className="text-gray-400 text-xs">{t('ai_choice_desc')}</p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {['local', 'cloud', 'hybrid'].map((opt) => (
                <label key={opt} className={`flex flex-col items-center justify-center p-5 border rounded cursor-pointer transition-all ${
                  aiProvider === opt 
                    ? 'border-win11-accent bg-win11-accent/10' 
                    : 'border-win11-borderDark bg-win11-bgDark hover:border-gray-500'
                }`}>
                  <input 
                    type="radio" 
                    name="aiProvider" 
                    value={opt} 
                    checked={aiProvider === opt} 
                    onChange={() => {
                      setAiProvider(opt);
                      setSubStepIndex(0); // Reset index to prevent out-of-bounds on transition
                    }}
                    className="sr-only"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider mb-2">
                    {opt === 'local' ? 'Local-Only' : opt === 'cloud' ? 'Cloud-Only' : 'Hybrid'}
                  </span>
                  <span className="text-[10px] text-gray-400 text-center leading-normal">
                    {opt === 'local' ? t('ai_opt_local') : opt === 'cloud' ? t('ai_opt_cloud') : t('ai_opt_hybrid')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'local-models':
        if (localModelWizardStep === 'role-select') {
          return (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">
                {lang === 'vi' ? "Chọn vai trò chính của Trợ lý" : "Select Assistant Primary Purpose"}
              </h2>
              <p className="text-gray-400 text-xs">
                {lang === 'vi' 
                  ? "Chọn mục đích sử dụng để chúng tôi đề xuất cấu hình tối ưu. Mỗi máy tính chỉ cần cài đặt 1 mô hình chính." 
                  : "Choose how you plan to use your assistant so we can recommend the optimal configuration. Only 1 model is needed."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Card 1: Chat/General */}
                <div 
                  onClick={() => handleSelectRole('chat')}
                  className="flex flex-col items-center p-5 bg-win11-cardDark border border-win11-borderDark hover:border-win11-accent hover:bg-win11-accent/5 rounded-lg cursor-pointer transition-all space-y-3 text-center"
                >
                  <div className="p-3 bg-win11-accent/10 rounded-full text-win11-accent">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm">
                    {lang === 'vi' ? "Trợ lý đa năng" : "General Assistant"}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    {lang === 'vi' 
                      ? "Trò chuyện hàng ngày, giải đáp thắc mắc thông thường và kiến thức tổng hợp." 
                      : "For daily conversations, general Q&A, and broad knowledge base."}
                  </p>
                </div>

                {/* Card 2: Code */}
                <div 
                  onClick={() => handleSelectRole('code')}
                  className="flex flex-col items-center p-5 bg-win11-cardDark border border-win11-borderDark hover:border-win11-accent hover:bg-win11-accent/5 rounded-lg cursor-pointer transition-all space-y-3 text-center"
                >
                  <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm">
                    {lang === 'vi' ? "Hỗ trợ lập trình" : "Programming Support"}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    {lang === 'vi' 
                      ? "Tập trung viết code, giải thích logic lập trình, debug và phân tích kỹ thuật." 
                      : "Optimized for code generation, logic explanations, and debugging."}
                  </p>
                </div>

                {/* Card 3: Write */}
                <div 
                  onClick={() => handleSelectRole('write')}
                  className="flex flex-col items-center p-5 bg-win11-cardDark border border-win11-borderDark hover:border-win11-accent hover:bg-win11-accent/5 rounded-lg cursor-pointer transition-all space-y-3 text-center"
                >
                  <div className="p-3 bg-green-500/10 rounded-full text-green-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm">
                    {lang === 'vi' ? "Viết lách & Dịch thuật" : "Writing & Translation"}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    {lang === 'vi' 
                      ? "Tối ưu hóa soạn thảo văn bản, viết email quảng cáo, sáng tạo nội dung và dịch ngôn ngữ." 
                      : "Specialized in copywriting, translations, email drafting, and creative writing."}
                  </p>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-win11-borderDark pb-2">
                <div>
                  <h2 className="text-base font-semibold">
                    {lang === 'vi' ? "Cấu hình AI Model cục bộ" : "Configure Local AI Model"}
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {lang === 'vi' 
                      ? "Chúng tôi đã chọn phiên bản tối ưu nhất cho cấu hình máy tính của bạn." 
                      : "We pre-selected the optimal model variant for your computer hardware."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setLocalModelWizardStep('role-select');
                      setIsTransitioning(false);
                    }, 150);
                  }}
                  className="px-3 py-1 bg-win11-cardDark hover:bg-win11-borderDark border border-win11-borderDark rounded text-[10px] text-gray-300 transition-colors"
                >
                  {lang === 'vi' ? "← Thay đổi vai trò" : "← Change Role"}
                </button>
              </div>
              
              <div className="space-y-4">
                <ModelSelectorRow 
                  label={
                    assistantRole === 'chat' 
                      ? (lang === 'vi' ? "Mô hình Trợ lý đa năng (Chat)" : "General Assistant Model")
                      : assistantRole === 'code'
                      ? (lang === 'vi' ? "Mô hình Hỗ trợ lập trình (Code)" : "Programming Assistant Model")
                      : (lang === 'vi' ? "Mô hình Viết lách & Dịch thuật (Write)" : "Writing Assistant Model")
                  }
                  role={assistantRole}
                  currentValue={localModelsConfigured[assistantRole]}
                  onChange={(value) => setLocalModelsConfigured({ ...localModelsConfigured, [assistantRole]: value })}
                  hwInfo={hwInfo}
                />
              </div>
            </div>
          );
        }

      case 'cloud-keys':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">{t('cloud_key_section')}</h2>
            <p className="text-gray-400 text-xs">
              Enter your API keys for the cloud models you want to use.
            </p>
            <div className="space-y-3 bg-win11-bgDark p-5 border border-win11-borderDark rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">OpenAI API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-..."
                    value={cloudKeys.openai}
                    onChange={(e) => setCloudKeys({...cloudKeys, openai: e.target.value})}
                    className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Gemini API Key</label>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..."
                    value={cloudKeys.gemini}
                    onChange={(e) => setCloudKeys({...cloudKeys, gemini: e.target.value})}
                    className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Anthropic API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-ant-..."
                    value={cloudKeys.anthropic}
                    onChange={(e) => setCloudKeys({...cloudKeys, anthropic: e.target.value})}
                    className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">DeepSeek API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-..."
                    value={cloudKeys.deepseek}
                    onChange={(e) => setCloudKeys({...cloudKeys, deepseek: e.target.value})}
                    className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'channels':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">{t('channel_setup_title')}</h2>
            <p className="text-gray-400 text-xs">{t('channel_setup_desc')}</p>
            <div className="space-y-4 bg-win11-bgDark p-5 border border-win11-borderDark rounded">
              <div className="flex space-x-6 border-b border-win11-borderDark pb-3">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedChannels.whatsapp}
                    onChange={(e) => setSelectedChannels({...selectedChannels, whatsapp: e.target.checked})}
                    className="w-4 h-4 accent-win11-accent"
                  />
                  <span>WhatsApp (QR Code)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedChannels.telegram}
                    onChange={(e) => setSelectedChannels({...selectedChannels, telegram: e.target.checked})}
                    className="w-4 h-4 accent-win11-accent"
                  />
                  <span>Telegram Bot</span>
                </label>

                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedChannels.discord}
                    onChange={(e) => setSelectedChannels({...selectedChannels, discord: e.target.checked})}
                    className="w-4 h-4 accent-win11-accent"
                  />
                  <span>Discord Bot</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedChannels.whatsapp && (
                  <div className="space-y-1 text-xs md:col-span-2">
                    <label className="text-gray-400 font-semibold">WhatsApp Allowed Numbers</label>
                    <input
                      type="text"
                      placeholder="+84901234567, +84987654321 (leave empty to allow all)"
                      value={whatsappAllowedNumbers}
                      onChange={(e) => setWhatsappAllowedNumbers(e.target.value)}
                      className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                    />
                    {!whatsappAllowedNumbers.trim() ? (
                      <p className="text-amber-400 text-[10px] flex items-center gap-1">
                        <span>⚠️</span> Empty = anyone can message your assistant. Recommended: enter your phone number.
                      </p>
                    ) : (
                      <p className="text-green-500 text-[10px]">✓ Only listed numbers can interact with your assistant.</p>
                    )}
                  </div>
                )}
                {selectedChannels.telegram && (
                  <div className="space-y-1 text-xs">
                    <label className="text-gray-400 font-semibold">Telegram Bot Token</label>
                    <input 
                      type="text" 
                      placeholder="123456789:ABCdefGhI..."
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                )}

                {selectedChannels.discord && (
                  <div className="space-y-1 text-xs">
                    <label className="text-gray-400 font-semibold">Discord Token</label>
                    <input 
                      type="text" 
                      placeholder="MTY3..."
                      value={discordToken}
                      onChange={(e) => setDiscordToken(e.target.value)}
                      className="w-full bg-win11-cardDark border border-win11-borderDark rounded px-3 py-1.5 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render Setup Wizard View
  const renderSetupWizard = () => {
    return (
      <div className="flex flex-col h-full bg-win11-bgDark text-white p-10 select-none overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 border-b border-win11-borderDark pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">EZ-OpenClaw Setup Wizard</h1>
            <p className="text-gray-400 text-sm mt-1">Configure your personal assistant environment in just a few clicks.</p>
          </div>
          {/* Language Switch */}
          <div className="flex space-x-2 bg-win11-cardDark border border-win11-borderDark p-1 rounded">
            <button 
              onClick={() => i18n.changeLanguage('vi')} 
              className={`px-3 py-1 text-xs rounded transition-colors ${lang && lang.startsWith('vi') ? 'bg-win11-accent text-white' : 'text-gray-400 hover:text-white'}`}>
              VI
            </button>
            <button 
              onClick={() => i18n.changeLanguage('en')} 
              className={`px-3 py-1 text-xs rounded transition-colors ${!lang || !lang.startsWith('vi') ? 'bg-win11-accent text-white' : 'text-gray-400 hover:text-white'}`}>
              EN
            </button>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center space-x-4 mb-10">
          {[1, 2, 3, 4].map(step => (
            <React.Fragment key={step}>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border text-sm transition-colors ${
                  setupStep === step 
                    ? 'bg-win11-accent border-win11-accent text-white font-bold' 
                    : setupStep > step 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-win11-borderDark text-gray-500 bg-transparent'
                }`}>
                  {setupStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`text-xs ${setupStep === step ? 'text-white font-medium' : 'text-gray-500'}`}>
                  {step === 1 ? t('node_title') : step === 2 ? t('hw_diag_title') : step === 3 ? t('ai_choice_title') : t('setup_complete_title')}
                </span>
              </div>
              {step < 4 && <div className="h-px w-12 bg-win11-borderDark"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard content */}
        <div className="flex-1 bg-win11-cardDark border border-win11-borderDark rounded-lg p-8 mb-6 min-h-[300px]">
          {/* STEP 1: Node.js setup */}
          {setupStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">{t('node_title')}</h2>
              <p className="text-gray-400 text-sm max-w-2xl">{t('node_desc')}</p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-win11-bgDark border border-win11-borderDark rounded cursor-pointer hover:border-win11-accent transition-colors">
                  <input 
                    type="radio" 
                    name="nodeOpt" 
                    value="portable" 
                    checked={nodeOption === 'portable'} 
                    onChange={() => setNodeOption('portable')} 
                    className="accent-win11-accent w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">{t('node_option_portable')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Isolated runtime inside APP folder, keeps system clean.</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-4 bg-win11-bgDark border border-win11-borderDark rounded cursor-pointer hover:border-win11-accent transition-colors">
                  <input 
                    type="radio" 
                    name="nodeOpt" 
                    value="system" 
                    checked={nodeOption === 'system'} 
                    onChange={() => setNodeOption('system')}
                    className="accent-win11-accent w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-sm">{t('node_option_system')}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Find node.exe using system PATH env.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Hardware scan */}
          {setupStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">{t('hw_diag_title')}</h2>
              <p className="text-gray-400 text-sm max-w-2xl">{t('hw_diag_desc')}</p>

              {!hwInfo ? (
                <div className="flex flex-col items-center justify-center p-8 bg-win11-bgDark border border-win11-borderDark rounded-lg">
                  {isScanningHw ? (
                    <div className="flex flex-col items-center space-y-4">
                      <RefreshCw className="w-10 h-10 text-win11-accent animate-spin" />
                      <span className="text-sm text-gray-400">{t('btn_scanning')}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleScanHardware} 
                      className="px-6 py-2.5 bg-win11-accent hover:bg-win11-accentHover text-white rounded font-medium text-sm transition-colors">
                      {t('btn_start_scan')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System details */}
                  <div className="space-y-4 bg-win11-bgDark p-6 border border-win11-borderDark rounded">
                    <h3 className="font-medium text-sm border-b border-win11-borderDark pb-2 text-win11-accent">System Info</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">CPU:</span> <span className="font-mono text-xs">{hwInfo.cpu}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">{t('ram_system')}:</span> <span>{hwInfo.ram} GB</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">GPU Model:</span> <span>{hwInfo.gpu}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">{t('gpu_vram')}:</span> <span>{hwInfo.vram} GB ({hwInfo.gpuMemType})</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">{t('gpu_arch')}:</span> <span>{hwInfo.gpuArch}</span></div>
                    </div>
                  </div>

                  {/* Benchmark & Tier result */}
                  <div className="flex flex-col justify-between bg-win11-bgDark p-6 border border-win11-borderDark rounded">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm border-b border-win11-borderDark pb-2 text-win11-accent">{t('recommended_tier')}</h3>
                      <div className="text-2xl font-bold mt-4 text-green-500">{hwInfo.tierName}</div>
                      <div className="text-sm text-gray-400 mt-2">{t('gpi_score')}: <span className="font-mono font-bold text-white">{hwInfo.gpi}</span></div>
                    </div>
                    
                    <button 
                      onClick={() => setHwInfo(null)} 
                      className="mt-6 text-xs text-win11-accent hover:underline flex items-center space-x-1 justify-end">
                      <RefreshCw className="w-3 h-3" /> <span>Scan Again</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Model Setup & Channels */}
          {setupStep === 3 && (
            <div className={`transition-all duration-200 ${isTransitioning ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
              {getCurrentSubStepContent()}
            </div>
          )}

          {/* STEP 4: Success / Ready screen */}
          {setupStep === 4 && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              <h2 className="text-xl font-semibold">{t('setup_complete_title')}</h2>
              <p className="text-gray-400 text-sm max-w-md">{t('setup_complete_desc')}</p>
            </div>
          )}
        </div>

        {/* Wizard actions buttons */}
        <div className="flex justify-between items-center">
          {setupStep > 1 && setupStep < 4 ? (
            <button 
              onClick={() => {
                if (setupStep === 3) {
                  const currentSub = getAvailableSubSteps()[subStepIndex];
                  if (currentSub === 'local-models' && localModelWizardStep === 'model-config') {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setLocalModelWizardStep('role-select');
                      setIsTransitioning(false);
                    }, 150);
                  } else if (subStepIndex > 0) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setSubStepIndex(prev => prev - 1);
                      setIsTransitioning(false);
                    }, 150);
                  } else {
                    setSetupStep(2);
                  }
                } else {
                  setSetupStep(setupStep - 1);
                }
              }}
              className="px-5 py-2 bg-transparent hover:bg-win11-cardDark border border-win11-borderDark rounded text-sm text-gray-300 transition-colors">
              {t('btn_back')}
            </button>
          ) : <div></div>}

          {pullProgress ? (
            <div className="w-80 bg-win11-bgDark border border-win11-borderDark rounded p-3 text-xs space-y-3">
              {/* Current Task Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{getCleanStatusText(pullProgress.status)}</span>
                  <span>{pullProgress.percent}%</span>
                </div>
                <div className="w-full bg-win11-cardDark h-1 rounded-full overflow-hidden">
                  <div className="bg-win11-accent h-full transition-all duration-300" style={{ width: `${pullProgress.percent}%` }}></div>
                </div>
              </div>

              {/* Overall Progress */}
              {activeTasks.current && activeTasks.current.length > 1 && (
                <div className="space-y-1 pt-2 border-t border-win11-borderDark">
                  <div className="flex justify-between text-[10px] font-semibold text-win11-accent">
                    <span>{t('overall_progress')}</span>
                    <span>{overallPercent}%</span>
                  </div>
                  <div className="w-full bg-win11-cardDark h-1.5 rounded-full overflow-hidden">
                    <div className="bg-win11-accent h-full transition-all duration-300" style={{ width: `${overallPercent}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            setupStep === 3 ? (
              (getAvailableSubSteps()[subStepIndex] === 'local-models' && localModelWizardStep === 'role-select') ? (
                <div></div> // Hide Next button to force role selection card click
              ) : subStepIndex === getAvailableSubSteps().length - 1 ? (
                <button 
                  onClick={handleInstallDependencies}
                  className="px-6 py-2 bg-win11-accent hover:bg-win11-accentHover rounded text-sm font-semibold flex items-center space-x-1.5 transition-colors">
                  <span>{t('btn_download')}</span>
                  <Download className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setSubStepIndex(prev => prev + 1);
                      setIsTransitioning(false);
                    }, 150);
                  }}
                  className="px-6 py-2 bg-win11-accent hover:bg-win11-accentHover rounded text-sm font-semibold flex items-center space-x-1.5 transition-colors">
                  <span>{t('btn_next')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : setupStep === 4 ? (
              <button 
                onClick={() => {
                  setIsSetupComplete(true);
                  setActiveTab('home');
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold flex items-center space-x-1.5 transition-colors">
                <span>{t('btn_finish')}</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (setupStep === 2 && !hwInfo) {
                    alert("Please run hardware diagnostic scan before continuing.");
                    return;
                  }
                  if (setupStep === 2) {
                    setSubStepIndex(0);
                    setIsTransitioning(false);
                  }
                  setSetupStep(setupStep + 1);
                }}
                className="px-6 py-2 bg-win11-accent hover:bg-win11-accentHover rounded text-sm font-semibold flex items-center space-x-1.5 transition-colors">
                <span>{t('btn_next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  // Main Dashboard View (Render when Setup is complete)
  const renderMainDashboard = () => {
    return (
      <div className="flex h-screen bg-win11-bgDark text-white select-none">
        {/* Left Sidebar */}
        <div className="w-[240px] bg-win11-bgDark border-r border-win11-borderDark flex flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 px-2 py-3 border-b border-win11-borderDark">
              <div className="w-8 h-8 rounded bg-win11-accent flex items-center justify-center font-bold text-white text-lg">C</div>
              <div>
                <h1 className="font-semibold text-sm leading-tight">EZ-OpenClaw</h1>
                <span className="text-[10px] text-gray-500">v1.0.0 (Windows)</span>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="space-y-1">
              {[
                { id: 'home', label: t('sidebar_home'), icon: Home },
                { id: 'ai', label: t('sidebar_ai'), icon: Cpu },
                { id: 'channels', label: t('sidebar_channels'), icon: MessageSquare },
                { id: 'skills', label: t('sidebar_skills'), icon: ToggleLeft },
                { id: 'system', label: t('sidebar_system'), icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors text-left ${
                      activeTab === item.id 
                        ? 'bg-win11-cardDark text-white font-medium border-l-4 border-win11-accent' 
                        : 'text-gray-400 hover:bg-win11-cardDark hover:text-white'
                    }`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Doctor Tool & Lang */}
          <div className="space-y-3 border-t border-win11-borderDark pt-4 px-2">
            <button 
              onClick={handleRunDoctor} 
              disabled={isDoctorRunning}
              className="w-full text-xs bg-win11-cardDark hover:bg-win11-borderDark border border-win11-borderDark text-gray-300 py-1.5 rounded flex items-center justify-center space-x-1 transition-colors">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
              <span>{isDoctorRunning ? t('doctor_running') : t('run_doctor')}</span>
            </button>
            
            {doctorResult && (
              <div className={`text-[10px] text-center p-1 rounded font-medium ${doctorResult === 'success' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                {doctorResult === 'success' ? t('doctor_success') : t('doctor_fail')}
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
              <span>LANG:</span>
              <div className="space-x-1.5">
                <button onClick={() => i18n.changeLanguage('vi')} className={lang && lang.startsWith('vi') ? 'text-win11-accent font-bold' : 'hover:text-white'}>VI</button>
                <span>|</span>
                <button onClick={() => i18n.changeLanguage('en')} className={!lang || !lang.startsWith('vi') ? 'text-win11-accent font-bold' : 'hover:text-white'}>EN</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-win11-bgDark p-8">
          
          {/* TAB 1: HOME (DASHBOARD) */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-win11-borderDark pb-4">
                <div>
                  <h2 className="text-xl font-semibold">{t('dashboard_title')}</h2>
                  <p className="text-xs text-gray-400 mt-1">Control and monitor your AI agent daemon.</p>
                </div>
                {/* Gateway Daemon controls */}
                <div className="flex space-x-3">
                  {showDashboard ? (
                    <button 
                      onClick={() => setShowDashboard(false)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>{t('btn_stop_dashboard')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartDashboard}
                      className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      <span>{t('btn_start_dashboard')}</span>
                    </button>
                  )}

                  {envStatus.openclaw.running ? (
                    <button 
                      onClick={handleStopOpenClaw}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>{t('btn_stop_gateway')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleStartOpenClaw}
                      className="px-4 py-2 bg-transparent hover:bg-win11-cardDark border border-win11-borderDark text-gray-300 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{t('btn_start_gateway')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Indicator Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-win11-cardDark border border-win11-borderDark rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">OpenClaw Gateway</div>
                    <div className={`text-sm font-semibold mt-1 ${envStatus.openclaw.running ? 'text-green-500' : 'text-red-500'}`}>
                      {envStatus.openclaw.running ? t('status_running') : t('status_stopped')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${envStatus.openclaw.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>

                <div className="bg-win11-cardDark border border-win11-borderDark rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Ollama Engine</div>
                    <div className={`text-sm font-semibold mt-1 ${envStatus.ollama.running ? 'text-green-500' : 'text-gray-500'}`}>
                      {envStatus.ollama.running ? t('status_online') : t('status_offline')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${envStatus.ollama.running ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                </div>

                <div className="bg-win11-cardDark border border-win11-borderDark rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Workspace Location</div>
                    <div className="text-xs font-mono mt-1 text-gray-300 truncate max-w-[180px]">
                      ~/.openclaw/workspace
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-win11-accent" />
                </div>
              </div>

              {/* QR Code section (only if QR exists or waiting connection) */}
              {selectedChannels.whatsapp && (
                <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span>{t('qr_title')}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">{t('qr_desc')}</p>
                  
                  <div className="flex flex-col items-center justify-center bg-win11-bgDark border border-win11-borderDark rounded p-6 min-h-[180px]">
                    {whatsappQr ? (
                      <div className="bg-white p-4 rounded flex flex-col items-center">
                        {/* Display QR code using monospace fixed characters */}
                        <pre className="font-mono text-[5px] leading-[4px] tracking-[1px] text-black select-none">
                          {whatsappQr}
                        </pre>
                        <span className="text-[9px] text-gray-600 font-sans mt-3 font-semibold">LINK STRING DETECTED</span>
                      </div>
                    ) : envStatus.openclaw.running ? (
                      <div className="text-center space-y-2">
                        <RefreshCw className="w-6 h-6 text-win11-accent animate-spin mx-auto" />
                        <span className="text-xs text-gray-400 block">Waiting for OpenClaw to generate link QR...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Start OpenClaw Gateway to view WhatsApp QR link.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Logs Console (Accordion Dropdown) */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg overflow-hidden">
                <button
                  onClick={() => setLogsExpanded(!logsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-win11-bgDark/30 transition-colors text-left focus:outline-none"
                >
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-win11-accent" />
                    <span className="text-sm font-semibold text-white">{t('logs_title')}</span>
                  </div>
                  <div className="text-gray-400">
                    {logsExpanded ? (
                      <span className="text-xs flex items-center space-x-1 font-semibold">
                        <span>{lang === 'vi' ? "Thu gọn" : "Collapse"}</span>
                        <span>▲</span>
                      </span>
                    ) : (
                      <span className="text-xs flex items-center space-x-1 font-semibold">
                        <span>{lang === 'vi' ? "Mở rộng" : "Expand"}</span>
                        <span>▼</span>
                      </span>
                    )}
                  </div>
                </button>

                {logsExpanded && (
                  <div className="p-4 pt-0 border-t border-win11-borderDark bg-win11-cardDark">
                    <div 
                      ref={logConsoleRef}
                      className="bg-black text-gray-300 font-mono text-xs p-4 rounded h-[220px] overflow-y-auto whitespace-pre-wrap select-text border border-win11-borderDark">
                      {gatewayLogs.length === 0 ? (
                        <span className="text-gray-600 italic">No logs available. Click 'Start OpenClaw' to launch daemon process.</span>
                      ) : (
                        gatewayLogs.join('')
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Dashboard Webview */}
              {showDashboard && (
                <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-5 mt-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-win11-borderDark pb-2">
                    <h3 className="text-sm font-semibold text-win11-accent flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat Dashboard (http://localhost:18789)</span>
                    </h3>
                    <button 
                      onClick={() => setShowDashboard(false)}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {lang === 'vi' ? "Đóng Chat" : "Close Chat"}
                    </button>
                  </div>
                  {gatewayToken && envStatus.openclaw.running && (
                    <div className="flex items-center justify-between text-xs bg-win11-bgDark border border-win11-borderDark/40 p-2.5 rounded-lg">
                      <span className="text-gray-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                        {lang === 'vi' ? "Gateway Token của bạn:" : "Your Gateway Token:"}{" "}
                        <code className="bg-black/35 px-1.5 py-0.5 rounded text-win11-accent font-mono ml-1.5 select-all">{gatewayToken}</code>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(gatewayToken);
                          alert(lang === 'vi' ? "Đã copy Gateway Token vào Clipboard!" : "Gateway Token copied to Clipboard!");
                        }}
                        className="px-2.5 py-1 bg-win11-accent/20 hover:bg-win11-accent/35 text-win11-accent rounded text-[10px] transition-colors border border-win11-accent/30 font-medium"
                      >
                        {lang === 'vi' ? "Sao chép" : "Copy"}
                      </button>
                    </div>
                  )}
                  {envStatus.openclaw.running ? (
                    <iframe 
                      src={gatewayToken ? `http://127.0.0.1:18789/#token=${gatewayToken}` : "http://127.0.0.1:18789"} 
                      className="w-full h-[550px] bg-white rounded border border-win11-borderDark"
                      title="OpenClaw Chat Dashboard"
                      allow="clipboard-read; clipboard-write; display-capture"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  ) : (
                    <div className="w-full h-[550px] bg-black/40 rounded border border-win11-borderDark flex flex-col items-center justify-center space-y-3 text-gray-400">
                      <RefreshCw className="w-8 h-8 text-win11-accent animate-spin" />
                      <span className="text-xs">
                        {lang === 'vi' 
                          ? "Đang khởi chạy OpenClaw Gateway... Vui lòng đợi trong giây lát." 
                          : "Launching OpenClaw Gateway... Please wait a moment."}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI MODELS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="border-b border-win11-borderDark pb-4">
                <h2 className="text-xl font-semibold">{t('sidebar_ai')}</h2>
                <p className="text-xs text-gray-400 mt-1">Manage local and cloud AI providers.</p>
              </div>

              {/* Local AI / Ollama management */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-win11-accent">Local Model Settings</h3>
                <p className="text-xs text-gray-400">Configure Ollama model files. Select model families and quantization levels, then pull them to your machine.</p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5 max-w-xs">
                    <label className="text-xs text-gray-400 font-semibold block">{lang === 'vi' ? "Vai trò Trợ lý" : "Assistant Primary Role"}</label>
                    <select 
                      value={assistantRole} 
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setAssistantRole(newRole);
                        if (!localModelsConfigured[newRole]) {
                          selectRecommendedModelForRole(newRole);
                        }
                      }}
                      className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-2.5 py-1.5 text-xs text-white focus:border-win11-accent focus:outline-none"
                    >
                      <option value="chat">{lang === 'vi' ? "Trợ lý đa năng (Chat)" : "General Assistant (Chat)"}</option>
                      <option value="code">{lang === 'vi' ? "Hỗ trợ lập trình (Code)" : "Programming Support (Code)"}</option>
                      <option value="write">{lang === 'vi' ? "Viết lách & Dịch thuật (Write)" : "Writing & Translation (Write)"}</option>
                    </select>
                  </div>

                  <ModelSelectorRow 
                    label={
                      assistantRole === 'chat' 
                        ? (lang === 'vi' ? "Mô hình Trợ lý đa năng (Chat)" : "General Assistant Model")
                        : assistantRole === 'code'
                        ? (lang === 'vi' ? "Mô hình Hỗ trợ lập trình (Code)" : "Programming Assistant Model")
                        : (lang === 'vi' ? "Mô hình Viết lách & Dịch thuật (Write)" : "Writing Assistant Model")
                    }
                    role={assistantRole}
                    currentValue={localModelsConfigured[assistantRole]}
                    onChange={(value) => setLocalModelsConfigured({ ...localModelsConfigured, [assistantRole]: value })}
                    hwInfo={hwInfo}
                    onPull={async (tag) => {
                      setPullProgress({ status: 'Connecting to Ollama...', percent: 0 });
                      try {
                        await window.api.pullModel(tag);
                        alert(`Model ${tag} pulled successfully!`);
                      } catch (err) {
                        alert(`Failed to pull model ${tag}: ` + err.message);
                      }
                      setPullProgress(null);
                    }}
                  />
                </div>

                <div className="pt-4 border-t border-win11-borderDark flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">
                    {lang === 'vi' 
                      ? "* Hãy lưu các thay đổi trước khi khởi chạy OpenClaw." 
                      : "* Save model changes before starting OpenClaw."}
                  </span>
                  <button 
                    onClick={async () => {
                      if (window.api) {
                        try {
                          const config = await window.api.loadConfig();
                          config.agents = config.agents || {};
                          config.agents.defaults = config.agents.defaults || {};
                          config.agents.defaults.model = config.agents.defaults.model || {};
                          
                          const modelTag = localModelsConfigured[assistantRole];
                          config.agents.defaults.model.primary = modelTag.includes('/') 
                            ? modelTag 
                            : `ollama/${modelTag}`;
                          
                          config.models = config.models || {};
                          config.models.providers = config.models.providers || {};
                          config.models.providers.ollama = {
                            baseUrl: "http://127.0.0.1:11434",
                            apiKey: "ollama-local",
                            api: "openai-completions"
                          };
                          
                          config.env = config.env || {};
                          config.env.OLLAMA_API_KEY = "ollama-local";
                          
                          await window.api.saveConfig(config);
                          alert(lang === 'vi' ? "Đã lưu cài đặt model cục bộ!" : "Local model settings saved successfully!");
                        } catch (e) {
                          alert("Failed to save config: " + e.message);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? "Lưu cài đặt model" : "Save Local Models"}</span>
                  </button>
                </div>

                {pullProgress && (
                  <div className="bg-win11-bgDark border border-win11-borderDark rounded p-4 text-xs space-y-2 mt-4">
                    <div className="flex justify-between text-gray-400 text-[10px]">
                      <span>{getCleanStatusText(pullProgress.status)}</span>
                      <span>{pullProgress.percent}%</span>
                    </div>
                    <div className="w-full bg-win11-cardDark h-2 rounded-full overflow-hidden">
                      <div className="bg-win11-accent h-full transition-all duration-300" style={{ width: `${pullProgress.percent}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Models List */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-win11-accent">{t('model_management_title') || "Local Models Management"}</h3>
                  <button 
                    onClick={async () => {
                      if(window.api) {
                        const result = await window.api.getLocalModels();
                        if(result && result.models) setLocalModelsList(result.models);
                      }
                    }}
                    className="p-1.5 hover:bg-win11-bgDark rounded transition-colors text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {localModelsList.length === 0 ? (
                    <p className="text-xs text-gray-400">{t('no_models_installed') || "No local models installed via Ollama yet."}</p>
                  ) : (
                    localModelsList.map(model => (
                      <div key={model.name} className="flex justify-between items-center bg-win11-bgDark border border-win11-borderDark p-3 rounded">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{model.name}</span>
                          <span className="text-[10px] text-gray-500">
                            Size: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteModel(model.name)}
                          disabled={isDeletingModel}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white rounded text-xs transition-colors flex items-center"
                        >
                          {isDeletingModel ? (t('model_deleting') || "Deleting...") : (t('model_delete_btn') || "Delete")}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cloud API Keys Config */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-win11-accent">Cloud API Credentials</h3>
                <p className="text-xs text-gray-400">Save keys for remote LLM inference services.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">OpenAI API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      value={cloudKeys.openai}
                      onChange={(e) => setCloudKeys({...cloudKeys, openai: e.target.value})}
                      className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">Gemini API Key</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      value={cloudKeys.gemini}
                      onChange={(e) => setCloudKeys({...cloudKeys, gemini: e.target.value})}
                      className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">Anthropic API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-ant-..."
                      value={cloudKeys.anthropic}
                      onChange={(e) => setCloudKeys({...cloudKeys, anthropic: e.target.value})}
                      className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400">DeepSeek API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      value={cloudKeys.deepseek}
                      onChange={(e) => setCloudKeys({...cloudKeys, deepseek: e.target.value})}
                      className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={async () => {
                      if (window.api) {
                        const config = await window.api.loadConfig();
                        // Write cloud keys into config.auth or env if needed
                        config.agents = config.agents || {};
                        config.agents.defaults = config.agents.defaults || {};
                        config.env = config.env || {};
                        
                        if (cloudKeys.openai) config.env.OPENAI_API_KEY = cloudKeys.openai;
                        if (cloudKeys.gemini) config.env.GEMINI_API_KEY = cloudKeys.gemini;
                        if (cloudKeys.anthropic) config.env.ANTHROPIC_API_KEY = cloudKeys.anthropic;
                        if (cloudKeys.deepseek) config.env.DEEPSEEK_API_KEY = cloudKeys.deepseek;

                        await window.api.saveConfig(config);
                        alert("API Keys saved successfully!");
                      }
                    }}
                    className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                    <Key className="w-3.5 h-3.5" />
                    <span>Save API Keys</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="border-b border-win11-borderDark pb-4">
                <h2 className="text-xl font-semibold">{t('sidebar_channels')}</h2>
                <p className="text-xs text-gray-400 mt-1">Configure user messaging interfaces.</p>
              </div>

              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-6">
                {/* WhatsApp */}
                <div className="flex flex-col gap-3 border-b border-win11-borderDark pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-6">
                      <h4 className="font-semibold text-sm">WhatsApp Client</h4>
                      <p className="text-xs text-gray-400">Links OpenClaw to your personal WhatsApp account. Scans a QR code on gateway startup.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedChannels.whatsapp} 
                        onChange={(e) => setSelectedChannels({...selectedChannels, whatsapp: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-win11-accent"></div>
                    </label>
                  </div>
                  {selectedChannels.whatsapp && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400">Allowed Phone Numbers (whitelist)</label>
                      <input
                        type="text"
                        placeholder="+84901234567, +84987654321 (leave empty to allow all)"
                        value={whatsappAllowedNumbers}
                        onChange={(e) => setWhatsappAllowedNumbers(e.target.value)}
                        className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                      />
                      {!whatsappAllowedNumbers.trim() ? (
                        <p className="text-amber-400 text-[10px]">⚠️ Empty = anyone can message your assistant.</p>
                      ) : (
                        <p className="text-green-500 text-[10px]">✓ Only listed numbers can interact with your assistant.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Telegram */}
                <div className="space-y-4 border-b border-win11-borderDark pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Telegram Bot Gateway</h4>
                      <p className="text-xs text-gray-400">Host your own personal Telegram chatbot. Requires a bot token from @BotFather.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedChannels.telegram} 
                        onChange={(e) => setSelectedChannels({...selectedChannels, telegram: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-win11-accent"></div>
                    </label>
                  </div>
                  {selectedChannels.telegram && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400">Telegram Bot Token</label>
                      <input 
                        type="text" 
                        placeholder="Token key..."
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Discord */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Discord Bot Client</h4>
                      <p className="text-xs text-gray-400">Listen and respond to direct mentions inside Discord servers.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedChannels.discord} 
                        onChange={(e) => setSelectedChannels({...selectedChannels, discord: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-win11-accent"></div>
                    </label>
                  </div>
                  {selectedChannels.discord && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400">Discord Token</label>
                      <input 
                        type="text" 
                        placeholder="Token key..."
                        value={discordToken}
                        onChange={(e) => setDiscordToken(e.target.value)}
                        className="w-full bg-win11-bgDark border border-win11-borderDark rounded px-3 py-2 text-xs focus:border-win11-accent focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={async () => {
                      if (window.api) {
                        const config = await window.api.loadConfig();
                        config.channels = {};
                        if (selectedChannels.whatsapp) {
                          config.channels.whatsapp = { allowFrom: parseWhatsappAllowList(whatsappAllowedNumbers) };
                        }
                        if (selectedChannels.telegram) {
                          config.channels.telegram = { token: telegramToken };
                        }
                        if (selectedChannels.discord) {
                          config.channels.discord = { token: discordToken };
                        }
                        await window.api.saveConfig(config);
                        alert("Channels configuration updated!");
                      }
                    }}
                    className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold transition-colors">
                    Save Channels
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="border-b border-win11-borderDark pb-4">
                <h2 className="text-xl font-semibold">{t('skills_title')}</h2>
                <p className="text-xs text-gray-400 mt-1">{t('skills_desc')}</p>
              </div>

              {/* Skills checklist */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.id} className="flex items-center justify-between border-b border-win11-borderDark last:border-0 pb-4 last:pb-0">
                    <div className="space-y-1 pr-6">
                      <h4 className="font-semibold text-sm">{t[`skill_${skill.id}_name`] || skill.name}</h4>
                      <p className="text-xs text-gray-400">{t[`skill_${skill.id}_desc`] || skill.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={skill.enabled}
                        onChange={() => {
                          // Use immutable update to avoid directly mutating state object
                          setSkills(prev => prev.map((s, i) =>
                            i === index ? { ...s, enabled: !s.enabled } : s
                          ));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-win11-accent"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={async () => {
                      if (window.api) {
                        const config = await window.api.loadConfig();
                        config.agents = config.agents || {};
                        config.agents.defaults = config.agents.defaults || {};
                        
                        // Setup allowed skills inside agents defaults configuration
                        config.agents.defaults.skills = skills.filter(s => s.enabled).map(s => s.id);
                        
                        await window.api.saveConfig(config);
                        alert(t('skills_saved_alert') || "Agent plugins and skills updated!");
                      }
                    }}
                    className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold transition-colors">
                    {t('save_skills_btn') || "Save Skills"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM INFO */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-win11-borderDark pb-4">
                <h2 className="text-xl font-semibold">{t('sidebar_system')}</h2>
                <p className="text-xs text-gray-400 mt-1">Host system parameters and software health check diagnostics.</p>
              </div>

              {/* Hardware diagnostics */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-win11-accent">Hardware Analytics</h3>
                
                {hwInfo ? (
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-win11-bgDark border border-win11-borderDark p-4 rounded text-gray-300">
                    <div>CPU brand: <span className="text-white">{hwInfo.cpu}</span></div>
                    <div>System RAM: <span className="text-white">{hwInfo.ram} GB</span></div>
                    <div>GPU device: <span className="text-white">{hwInfo.gpu}</span></div>
                    <div>VRAM capacity: <span className="text-white">{hwInfo.vram} GB</span></div>
                    <div>GPU architecture: <span className="text-white">{hwInfo.gpuArch}</span></div>
                    <div>GPU memory: <span className="text-white">{hwInfo.gpuMemType}</span></div>
                    <div className="col-span-2 border-t border-win11-borderDark pt-2 mt-2 font-sans flex justify-between items-center">
                      <span className="text-xs font-semibold">GPU Performance Index (GPI) score:</span>
                      <span className="text-sm font-bold text-green-500 font-mono">{hwInfo.gpi}</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleScanHardware} 
                    disabled={isScanningHw}
                    className="px-4 py-2 bg-win11-accent hover:bg-win11-accentHover text-white rounded text-xs font-semibold transition-colors">
                    {isScanningHw ? 'Scanning...' : 'Diagnose System Performance'}
                  </button>
                )}
              </div>

              {/* Resource Monitor */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-win11-accent">{t('sys_res_title') || "Resource Monitor"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-win11-bgDark border border-win11-borderDark p-4 rounded space-y-2">
                    <span className="text-xs font-semibold text-gray-400 block">{t('sys_res_cpu') || "CPU Usage"}</span>
                    <div className="flex justify-between text-sm text-white font-mono">
                      <span>Load</span>
                      <span>{Math.round(resourceUsage.cpu)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(resourceUsage.cpu, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-win11-bgDark border border-win11-borderDark p-4 rounded space-y-2">
                    <span className="text-xs font-semibold text-gray-400 block">{t('sys_res_ram') || "RAM Usage"}</span>
                    <div className="flex justify-between text-sm text-white font-mono">
                      <span>{(resourceUsage.ramUsed / 1024 / 1024 / 1024).toFixed(1)} / {(resourceUsage.ramTotal / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                      <span>{resourceUsage.ramTotal ? Math.round((resourceUsage.ramUsed / resourceUsage.ramTotal) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${resourceUsage.ramTotal ? Math.min((resourceUsage.ramUsed / resourceUsage.ramTotal) * 100, 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environments diagnostic */}
              <div className="bg-win11-cardDark border border-win11-borderDark rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-win11-accent">Environments Check</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-win11-borderDark pb-2">
                    <span className="text-gray-400">Node.js Installed:</span>
                    <span className={envStatus.node.installed ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                      {envStatus.node.installed ? `YES (${envStatus.node.version})` : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-win11-borderDark pb-2">
                    <span className="text-gray-400">Ollama Installed:</span>
                    <span className={envStatus.ollama.installed ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                      {envStatus.ollama.installed ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-win11-borderDark pb-2">
                    <span className="text-gray-400">Ollama API Status:</span>
                    <span className={envStatus.ollama.running ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                      {envStatus.ollama.running ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-400">OpenClaw Core Status:</span>
                    <span className={envStatus.openclaw.installed ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                      {envStatus.openclaw.installed ? 'INSTALLED' : 'MISSING'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={async () => {
                      await checkEnvironment();
                      alert("Environments status updated!");
                    }}
                    className="px-4 py-1.5 bg-win11-cardDark hover:bg-win11-borderDark border border-win11-borderDark rounded text-xs text-gray-300 transition-colors">
                    Recheck Env Status
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {updateStatus && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 border px-6 py-3 flex justify-between items-center text-sm rounded-lg shadow-lg z-[9999] min-w-[300px] ${
          updateStatus.status === 'error' 
            ? 'bg-red-500/20 border-red-500 text-red-200' 
            : 'bg-win11-accent/20 border-win11-accent text-white'
        }`}>
          <span>
            {updateStatus.status === 'error' && <span className="text-red-400 font-bold mr-2">Error:</span>}
            {updateStatus.status === 'available' && (t('update_available') || 'Update Available!')}
            {updateStatus.status === 'downloading' && `${t('update_downloading') || 'Downloading...'} (${Math.round(updateStatus.progress || 0)}%)`}
            {updateStatus.status === 'downloaded' && (t('update_downloaded') || 'Update Ready! Restart to install.')}
            {updateStatus.status === 'error' && (updateStatus.message || 'Update failed.')}
          </span>
        </div>
      )}
      {isSetupComplete ? renderMainDashboard() : renderSetupWizard()}
    </>
  );
}

export { ErrorBoundary };

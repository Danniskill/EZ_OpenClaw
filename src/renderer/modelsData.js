export const OLLAMA_MODELS = [
  // Llama 3.2 Series
  {
    id: 'llama3.2-1b',
    name: 'Llama 3.2 1B',
    provider: 'Meta',
    parameters: '1B',
    roles: ['chat', 'write'],
    recommendedTier: 1,
    desc: 'Ultra-lightweight model by Meta, optimized for low-end hardware.',
    variants: [
      { tag: 'llama3.2:1b', label: 'Default (Ollama Auto)', sizeGB: 1.3, minRamGB: 4, minVramGB: 0 },
      { tag: 'llama3.2:1b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 1.3, minRamGB: 4, minVramGB: 0 },
      { tag: 'llama3.2:1b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 2.0, minRamGB: 8, minVramGB: 2 },
      { tag: 'llama3.2:1b-instruct-fp16', label: '16-bit (fp16) [Full Precision]', sizeGB: 2.6, minRamGB: 8, minVramGB: 4 }
    ]
  },
  {
    id: 'llama3.2-3b',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    parameters: '3B',
    roles: ['chat', 'write'],
    recommendedTier: 2,
    desc: 'Excellent balance of speed and intelligence for general tasks.',
    variants: [
      { tag: 'llama3.2:3b', label: 'Default (Ollama Auto)', sizeGB: 2.0, minRamGB: 8, minVramGB: 2 },
      { tag: 'llama3.2:3b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 2.0, minRamGB: 8, minVramGB: 2 },
      { tag: 'llama3.2:3b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 3.4, minRamGB: 12, minVramGB: 4 },
      { tag: 'llama3.2:3b-instruct-fp16', label: '16-bit (fp16) [Full Precision]', sizeGB: 6.4, minRamGB: 16, minVramGB: 8 }
    ]
  },

  // Llama 3.1 Series
  {
    id: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    parameters: '8B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Highly intelligent 8B parameter model for complex instructions.',
    variants: [
      { tag: 'llama3.1:8b', label: 'Default (Ollama Auto)', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'llama3.1:8b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'llama3.1:8b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 8.5, minRamGB: 24, minVramGB: 10 },
      { tag: 'llama3.1:8b-instruct-fp16', label: '16-bit (fp16) [Full Precision]', sizeGB: 16.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'llama3-8b',
    name: 'Llama 3 8B',
    provider: 'Meta',
    parameters: '8B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Standard Llama 3 8B model, fast and reliable.',
    variants: [
      { tag: 'llama3:8b', label: 'Default (Ollama Auto)', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'llama3:8b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'llama3:8b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 8.5, minRamGB: 24, minVramGB: 10 }
    ]
  },
  {
    id: 'llama3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    parameters: '70B',
    roles: ['chat'],
    recommendedTier: 4,
    desc: 'Enthusiast-tier large model by Meta. Requires powerful workstation.',
    variants: [
      { tag: 'llama3.1:70b', label: 'Default (Ollama Auto)', sizeGB: 42.0, minRamGB: 64, minVramGB: 24 },
      { tag: 'llama3.1:70b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 42.0, minRamGB: 64, minVramGB: 24 },
      { tag: 'llama3.1:70b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 75.0, minRamGB: 128, minVramGB: 48 }
    ]
  },

  // Qwen 2.5 General Series
  {
    id: 'qwen2.5-0.5b',
    name: 'Qwen 2.5 0.5B',
    provider: 'Alibaba',
    parameters: '0.5B',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Tiny, lightning-fast model for embedded or legacy systems.',
    variants: [
      { tag: 'qwen2.5:0.5b', label: 'Default (Ollama Auto)', sizeGB: 0.35, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5:0.5b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 0.35, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5:0.5b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 0.58, minRamGB: 4, minVramGB: 0 }
    ]
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen 2.5 1.5B',
    provider: 'Alibaba',
    parameters: '1.5B',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Small and fast model with high accuracy for general chat.',
    variants: [
      { tag: 'qwen2.5:1.5b', label: 'Default (Ollama Auto)', sizeGB: 0.98, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5:1.5b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 0.98, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5:1.5b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 1.6, minRamGB: 8, minVramGB: 2 }
    ]
  },
  {
    id: 'qwen2.5-3b',
    name: 'Qwen 2.5 3B',
    provider: 'Alibaba',
    parameters: '3B',
    roles: ['chat'],
    recommendedTier: 2,
    desc: 'Strong multi-language and reasoning capabilities in a small package.',
    variants: [
      { tag: 'qwen2.5:3b', label: 'Default (Ollama Auto)', sizeGB: 1.9, minRamGB: 8, minVramGB: 2 },
      { tag: 'qwen2.5:3b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 1.9, minRamGB: 8, minVramGB: 2 },
      { tag: 'qwen2.5:3b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 3.2, minRamGB: 12, minVramGB: 4 }
    ]
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    parameters: '7B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Top tier 7B model, excellent at reasoning, structure, and multilingual chat.',
    variants: [
      { tag: 'qwen2.5:7b', label: 'Default (Ollama Auto)', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'qwen2.5:7b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'qwen2.5:7b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 7.7, minRamGB: 24, minVramGB: 10 },
      { tag: 'qwen2.5:7b-instruct-fp16', label: '16-bit (fp16) [Full Precision]', sizeGB: 15.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'qwen2.5-14b',
    name: 'Qwen 2.5 14B',
    provider: 'Alibaba',
    parameters: '14B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'Deep understanding, coding support, and detailed writing.',
    variants: [
      { tag: 'qwen2.5:14b', label: 'Default (Ollama Auto)', sizeGB: 9.0, minRamGB: 16, minVramGB: 10 },
      { tag: 'qwen2.5:14b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 9.0, minRamGB: 16, minVramGB: 10 },
      { tag: 'qwen2.5:14b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 15.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'qwen2.5-32b',
    name: 'Qwen 2.5 32B',
    provider: 'Alibaba',
    parameters: '32B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'High-intelligence reasoning model, ideal for developer tasks.',
    variants: [
      { tag: 'qwen2.5:32b', label: 'Default (Ollama Auto)', sizeGB: 20.0, minRamGB: 32, minVramGB: 20 },
      { tag: 'qwen2.5:32b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 20.0, minRamGB: 32, minVramGB: 20 },
      { tag: 'qwen2.5:32b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 35.0, minRamGB: 64, minVramGB: 32 }
    ]
  },
  {
    id: 'qwen2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    parameters: '72B',
    roles: ['chat'],
    recommendedTier: 4,
    desc: 'Alibaba flagship model, extremely powerful reasoning.',
    variants: [
      { tag: 'qwen2.5:72b', label: 'Default (Ollama Auto)', sizeGB: 47.0, minRamGB: 64, minVramGB: 32 },
      { tag: 'qwen2.5:72b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 47.0, minRamGB: 64, minVramGB: 32 }
    ]
  },

  // Qwen 2.5 Coder Series
  {
    id: 'qwen2.5-coder-1.5b',
    name: 'Qwen 2.5 Coder 1.5B',
    provider: 'Alibaba',
    parameters: '1.5B',
    roles: ['code'],
    recommendedTier: 1,
    desc: 'Lightweight code generation assistant.',
    variants: [
      { tag: 'qwen2.5-coder:1.5b', label: 'Default (Ollama Auto)', sizeGB: 0.98, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5-coder:1.5b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 0.98, minRamGB: 4, minVramGB: 0 },
      { tag: 'qwen2.5-coder:1.5b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 1.6, minRamGB: 8, minVramGB: 2 }
    ]
  },
  {
    id: 'qwen2.5-coder-7b',
    name: 'Qwen 2.5 Coder 7B',
    provider: 'Alibaba',
    parameters: '7B',
    roles: ['code'],
    recommendedTier: 3,
    desc: 'State-of-the-art 7B programming assistant, highly recommended.',
    variants: [
      { tag: 'qwen2.5-coder:7b', label: 'Default (Ollama Auto)', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'qwen2.5-coder:7b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 },
      { tag: 'qwen2.5-coder:7b-instruct-q8_0', label: '8-bit (q8_0) [High Quality]', sizeGB: 7.7, minRamGB: 24, minVramGB: 10 },
      { tag: 'qwen2.5-coder:7b-instruct-fp16', label: '16-bit (fp16) [Full Precision]', sizeGB: 15.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'qwen2.5-coder-14b',
    name: 'Qwen 2.5 Coder 14B',
    provider: 'Alibaba',
    parameters: '14B',
    roles: ['code'],
    recommendedTier: 4,
    desc: 'Superb coding capabilities, supports repository-level understanding.',
    variants: [
      { tag: 'qwen2.5-coder:14b', label: 'Default (Ollama Auto)', sizeGB: 9.0, minRamGB: 16, minVramGB: 10 },
      { tag: 'qwen2.5-coder:14b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 9.0, minRamGB: 16, minVramGB: 10 },
      { tag: 'qwen2.5-coder:14b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 15.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'qwen2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Alibaba',
    parameters: '32B',
    roles: ['code'],
    recommendedTier: 4,
    desc: 'Flagship code model, near GPT-4o coding level.',
    variants: [
      { tag: 'qwen2.5-coder:32b', label: 'Default (Ollama Auto)', sizeGB: 20.0, minRamGB: 32, minVramGB: 20 },
      { tag: 'qwen2.5-coder:32b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 20.0, minRamGB: 32, minVramGB: 20 },
      { tag: 'qwen2.5-coder:32b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 35.0, minRamGB: 64, minVramGB: 32 }
    ]
  },

  // DeepSeek R1 Series (Reasoning Models)
  {
    id: 'deepseek-r1-1.5b',
    name: 'DeepSeek R1 1.5B',
    provider: 'DeepSeek',
    parameters: '1.5B',
    roles: ['chat', 'write'],
    recommendedTier: 1,
    desc: 'Distilled reasoning model based on Qwen 1.5B, fast thinking.',
    variants: [
      { tag: 'deepseek-r1:1.5b', label: 'Default (4-bit Q4_K_M)', sizeGB: 0.98, minRamGB: 4, minVramGB: 0 }
    ]
  },
  {
    id: 'deepseek-r1-7b',
    name: 'DeepSeek R1 7B',
    provider: 'DeepSeek',
    parameters: '7B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Highly popular distilled 7B reasoning model with logic chains.',
    variants: [
      { tag: 'deepseek-r1:7b', label: 'Default (4-bit Q4_K_M)', sizeGB: 4.7, minRamGB: 16, minVramGB: 6 }
    ]
  },
  {
    id: 'deepseek-r1-8b',
    name: 'DeepSeek R1 8B',
    provider: 'DeepSeek',
    parameters: '8B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Distilled model based on Llama 3.1 8B, great logical processing.',
    variants: [
      { tag: 'deepseek-r1:8b', label: 'Default (4-bit Q4_K_M)', sizeGB: 4.9, minRamGB: 16, minVramGB: 6 }
    ]
  },
  {
    id: 'deepseek-r1-14b',
    name: 'DeepSeek R1 14B',
    provider: 'DeepSeek',
    parameters: '14B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'Distilled model based on Qwen 14B. Rich analytical capabilities.',
    variants: [
      { tag: 'deepseek-r1:14b', label: 'Default (4-bit Q4_K_M)', sizeGB: 9.0, minRamGB: 16, minVramGB: 10 }
    ]
  },
  {
    id: 'deepseek-r1-32b',
    name: 'DeepSeek R1 32B',
    provider: 'DeepSeek',
    parameters: '32B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'Distilled model based on Qwen 32B. Highly detailed reasoning.',
    variants: [
      { tag: 'deepseek-r1:32b', label: 'Default (4-bit Q4_K_M)', sizeGB: 20.0, minRamGB: 32, minVramGB: 20 }
    ]
  },
  {
    id: 'deepseek-r1-70b',
    name: 'DeepSeek R1 70B',
    provider: 'DeepSeek',
    parameters: '70B',
    roles: ['chat'],
    recommendedTier: 4,
    desc: 'Distilled Llama 70B reasoning model. Near top-tier performance.',
    variants: [
      { tag: 'deepseek-r1:70b', label: 'Default (4-bit Q4_K_M)', sizeGB: 42.0, minRamGB: 64, minVramGB: 24 }
    ]
  },

  // Gemma 3 & 4 Series
  {
    id: 'gemma3-1b',
    name: 'Gemma 3 1B',
    provider: 'Google',
    parameters: '1B',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Google lightweight multimodal model, fast and efficient.',
    variants: [
      { tag: 'gemma3:1b', label: 'Default (Ollama Auto)', sizeGB: 1.0, minRamGB: 4, minVramGB: 0 },
      { tag: 'gemma3:1b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 1.0, minRamGB: 4, minVramGB: 0 },
      { tag: 'gemma3:1b-q8_0', label: '8-bit (q8_0)', sizeGB: 1.8, minRamGB: 8, minVramGB: 2 }
    ]
  },
  {
    id: 'gemma3-4b',
    name: 'Gemma 3 4B',
    provider: 'Google',
    parameters: '4B',
    roles: ['chat', 'write'],
    recommendedTier: 2,
    desc: 'Google Gemma 3 mid-sized multimodal model, excellent for daily tasks.',
    variants: [
      { tag: 'gemma3:4b', label: 'Default (Ollama Auto)', sizeGB: 2.6, minRamGB: 8, minVramGB: 3 },
      { tag: 'gemma3:4b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 2.6, minRamGB: 8, minVramGB: 3 },
      { tag: 'gemma3:4b-q8_0', label: '8-bit (q8_0)', sizeGB: 4.5, minRamGB: 12, minVramGB: 6 }
    ]
  },
  {
    id: 'gemma3-12b',
    name: 'Gemma 3 12B',
    provider: 'Google',
    parameters: '12B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Highly capable multilingual multimodal model with a 128K context window.',
    variants: [
      { tag: 'gemma3:12b', label: 'Default (Ollama Auto)', sizeGB: 7.2, minRamGB: 16, minVramGB: 8 },
      { tag: 'gemma3:12b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 7.2, minRamGB: 16, minVramGB: 8 },
      { tag: 'gemma3:12b-q8_0', label: '8-bit (q8_0)', sizeGB: 12.0, minRamGB: 24, minVramGB: 12 }
    ]
  },
  {
    id: 'gemma3-27b',
    name: 'Gemma 3 27B',
    provider: 'Google',
    parameters: '27B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'Flagship Gemma 3 model, strong logic, math, and coding support.',
    variants: [
      { tag: 'gemma3:27b', label: 'Default (Ollama Auto)', sizeGB: 16.0, minRamGB: 32, minVramGB: 16 },
      { tag: 'gemma3:27b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 16.0, minRamGB: 32, minVramGB: 16 },
      { tag: 'gemma3:27b-q8_0', label: '8-bit (q8_0)', sizeGB: 28.0, minRamGB: 48, minVramGB: 20 }
    ]
  },
  {
    id: 'gemma4-e4b',
    name: 'Gemma 4 Edge 4B',
    provider: 'Google',
    parameters: '4B',
    roles: ['chat'],
    recommendedTier: 2,
    desc: 'Google Gemma 4 edge-optimized variant for notebooks and PCs.',
    variants: [
      { tag: 'gemma4:e4b', label: 'Default (Ollama Auto)', sizeGB: 2.7, minRamGB: 8, minVramGB: 3 },
      { tag: 'gemma4:e4b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 2.7, minRamGB: 8, minVramGB: 3 },
      { tag: 'gemma4:e4b-q8_0', label: '8-bit (q8_0)', sizeGB: 4.8, minRamGB: 12, minVramGB: 6 },
      { tag: 'gemma4:e4b-fp16', label: '16-bit (fp16)', sizeGB: 9.6, minRamGB: 16, minVramGB: 10 }
    ]
  },
  {
    id: 'gemma4-12b',
    name: 'Gemma 4 12B',
    provider: 'Google',
    parameters: '12B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Google Gemma 4 next-gen multimodal reasoning and agentic model.',
    variants: [
      { tag: 'gemma4:12b', label: 'Default (Ollama Auto)', sizeGB: 7.5, minRamGB: 16, minVramGB: 8 },
      { tag: 'gemma4:12b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 7.5, minRamGB: 16, minVramGB: 8 },
      { tag: 'gemma4:12b-q8_0', label: '8-bit (q8_0)', sizeGB: 13.0, minRamGB: 24, minVramGB: 12 },
      { tag: 'gemma4:12b-fp16', label: '16-bit (fp16)', sizeGB: 25.0, minRamGB: 32, minVramGB: 24 }
    ]
  },
  {
    id: 'gemma4-26b',
    name: 'Gemma 4 26B',
    provider: 'Google',
    parameters: '26B',
    roles: ['chat', 'write'],
    recommendedTier: 4,
    desc: 'Enthusiast-tier Gemma 4 model, supreme reasoning and coding performance.',
    variants: [
      { tag: 'gemma4:26b', label: 'Default (Ollama Auto)', sizeGB: 16.0, minRamGB: 32, minVramGB: 16 },
      { tag: 'gemma4:26b-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 16.0, minRamGB: 32, minVramGB: 16 },
      { tag: 'gemma4:26b-q8_0', label: '8-bit (q8_0)', sizeGB: 29.0, minRamGB: 48, minVramGB: 20 }
    ]
  },

  // DeepSeek Coder Series
  {
    id: 'deepseek-coder-v2-16b',
    name: 'DeepSeek Coder V2 16B',
    provider: 'DeepSeek',
    parameters: '16B',
    roles: ['code'],
    recommendedTier: 4,
    desc: 'Mixture of Experts coding model by DeepSeek, very high capabilities.',
    variants: [
      { tag: 'deepseek-coder-v2:16b', label: 'Default (4-bit Q4_K_M)', sizeGB: 10.0, minRamGB: 16, minVramGB: 12 }
    ]
  },

  // Mistral / Mixtral Series
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'Mistral',
    parameters: '7B',
    roles: ['chat', 'write'],
    recommendedTier: 3,
    desc: 'Original high-performance 7B model, very popular.',
    variants: [
      { tag: 'mistral:7b', label: 'Default (Ollama Auto)', sizeGB: 4.1, minRamGB: 16, minVramGB: 6 },
      { tag: 'mistral:7b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 4.1, minRamGB: 16, minVramGB: 6 },
      { tag: 'mistral:7b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 7.1, minRamGB: 24, minVramGB: 10 }
    ]
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    parameters: '8x7B',
    roles: ['chat'],
    recommendedTier: 4,
    desc: 'MoE architecture, high quality but demands significant RAM.',
    variants: [
      { tag: 'mixtral:8x7b', label: 'Default (4-bit Q4_K_M)', sizeGB: 26.0, minRamGB: 48, minVramGB: 20 }
    ]
  },

  // Microsoft Phi Series
  {
    id: 'phi3.5-3.8b',
    name: 'Phi 3.5 3.8B',
    provider: 'Microsoft',
    parameters: '3.8B',
    roles: ['chat'],
    recommendedTier: 2,
    desc: 'Microsoft lightweight model, strong logic and math reasoning.',
    variants: [
      { tag: 'phi3.5:3.8b', label: 'Default (Ollama Auto)', sizeGB: 2.2, minRamGB: 8, minVramGB: 2 },
      { tag: 'phi3.5:3.8b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 2.2, minRamGB: 8, minVramGB: 2 },
      { tag: 'phi3.5:3.8b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 3.8, minRamGB: 12, minVramGB: 4 }
    ]
  },
  {
    id: 'phi3-3.8b',
    name: 'Phi 3 3.8B',
    provider: 'Microsoft',
    parameters: '3.8B',
    roles: ['chat'],
    recommendedTier: 2,
    desc: 'Older stable Microsoft model, fast and efficient.',
    variants: [
      { tag: 'phi3:3.8b', label: 'Default (Ollama Auto)', sizeGB: 2.2, minRamGB: 8, minVramGB: 2 }
    ]
  },

  // SmolLM Series (HuggingFace)
  {
    id: 'smollm-135m',
    name: 'SmolLM 135M',
    provider: 'HuggingFace',
    parameters: '135M',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Ultralight, educational model by HuggingFace.',
    variants: [
      { tag: 'smollm:135m', label: 'Default (Ollama Auto)', sizeGB: 0.1, minRamGB: 2, minVramGB: 0 }
    ]
  },
  {
    id: 'smollm-360m',
    name: 'SmolLM 360M',
    provider: 'HuggingFace',
    parameters: '360M',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Very fast small model for quick text completion.',
    variants: [
      { tag: 'smollm:360m', label: 'Default (Ollama Auto)', sizeGB: 0.25, minRamGB: 2, minVramGB: 0 }
    ]
  },
  {
    id: 'smollm-1.7b',
    name: 'SmolLM 1.7B',
    provider: 'HuggingFace',
    parameters: '1.7B',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Highly optimized small model by HuggingFace.',
    variants: [
      { tag: 'smollm:1.7b', label: 'Default (Ollama Auto)', sizeGB: 1.0, minRamGB: 4, minVramGB: 0 },
      { tag: 'smollm:1.7b-instruct-q4_K_M', label: '4-bit (q4_K_M) [Recommended]', sizeGB: 1.0, minRamGB: 4, minVramGB: 0 },
      { tag: 'smollm:1.7b-instruct-q8_0', label: '8-bit (q8_0)', sizeGB: 1.8, minRamGB: 8, minVramGB: 2 }
    ]
  },

  // TinyLlama
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama 1.1B',
    provider: 'TinyLlama',
    parameters: '1.1B',
    roles: ['chat'],
    recommendedTier: 1,
    desc: 'Compact model, fits easily on almost any hardware.',
    variants: [
      { tag: 'tinyllama:1.1b', label: 'Default (4-bit Q4_K_M)', sizeGB: 0.64, minRamGB: 4, minVramGB: 0 }
    ]
  },

  // Specialized & Coding
  {
    id: 'codegemma-2b',
    name: 'CodeGemma 2B',
    provider: 'Google',
    parameters: '2B',
    roles: ['code'],
    recommendedTier: 2,
    desc: 'Google Gemma-based coding model, lightweight coding.',
    variants: [
      { tag: 'codegemma:2b', label: 'Default (4-bit Q4_K_M)', sizeGB: 1.6, minRamGB: 8, minVramGB: 2 }
    ]
  },
  {
    id: 'codegemma-7b',
    name: 'CodeGemma 7B',
    provider: 'Google',
    parameters: '7B',
    roles: ['code'],
    recommendedTier: 3,
    desc: 'Google code specialized model.',
    variants: [
      { tag: 'codegemma:7b', label: 'Default (4-bit Q4_K_M)', sizeGB: 4.8, minRamGB: 16, minVramGB: 6 }
    ]
  },
  {
    id: 'codellama-7b',
    name: 'CodeLlama 7B',
    provider: 'Meta',
    parameters: '7B',
    roles: ['code'],
    recommendedTier: 3,
    desc: 'Llama 2 specialized for programming tasks.',
    variants: [
      { tag: 'codellama:7b', label: 'Default (4-bit Q4_K_M)', sizeGB: 3.8, minRamGB: 16, minVramGB: 6 }
    ]
  },
  {
    id: 'codellama-13b',
    name: 'CodeLlama 13B',
    provider: 'Meta',
    parameters: '13B',
    roles: ['code'],
    recommendedTier: 4,
    desc: 'Medium Llama 2 code model.',
    variants: [
      { tag: 'codellama:13b', label: 'Default (4-bit Q4_K_M)', sizeGB: 7.3, minRamGB: 16, minVramGB: 10 }
    ]
  },

  // Cohere Series
  {
    id: 'command-r-35b',
    name: 'Command R 35B',
    provider: 'Cohere',
    parameters: '35B',
    roles: ['chat'],
    recommendedTier: 4,
    desc: 'Optimized for RAG and enterprise tool use by Cohere.',
    variants: [
      { tag: 'command-r:35b', label: 'Default (4-bit Q4_K_M)', sizeGB: 20.0, minRamGB: 32, minVramGB: 16 }
    ]
  },
  {
    id: 'aya-8b',
    name: 'Aya 23 8B',
    provider: 'Cohere',
    parameters: '8B',
    roles: ['chat'],
    recommendedTier: 3,
    desc: 'Multilingual model by Cohere supporting 23 languages.',
    variants: [
      { tag: 'aya:8b', label: 'Default (4-bit Q4_K_M)', sizeGB: 4.8, minRamGB: 16, minVramGB: 6 }
    ]
  }
];

/**
 * 智能写作助手 - 主应用逻辑
 * 集成智谱 AI API 和流式输出
 */

// ==================== 配置和状态 ====================

const CONFIG = {
  apiKey: '',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash'
};

let currentOutput = '';
let history = [];
let isGenerating = false;

// ==================== DOM 元素 ====================

const elements = {
  writingMode: document.getElementById('writingMode'),
  inputText: document.getElementById('inputText'),
  temperature: document.getElementById('temperature'),
  tempValue: document.getElementById('tempValue'),
  maxTokens: document.getElementById('maxTokens'),
  maxTokensValue: document.getElementById('maxTokensValue'),
  outputLength: document.getElementById('outputLength'),
  optimizeBtn: document.getElementById('optimizeBtn'),
  generateBtn: document.getElementById('generateBtn'),
  outputArea: document.getElementById('outputArea'),
  copyBtn: document.getElementById('copyBtn'),
  copyToast: document.getElementById('copyToast'),
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  advancedToggle: document.getElementById('advancedToggle'),
  advancedPanel: document.getElementById('advancedPanel'),
  toggleIcon: document.getElementById('toggleIcon')
};

// ==================== 提示词模板 ====================

const promptTemplates = {
  continue: (input) => `请继续写下面的文章，保持风格一致，内容连贯：\n\n${input}`,
  rewrite: (input) => `请改写下面的内容，使其更加流畅、专业：\n\n${input}`,
  expand: (input) => `请扩展下面的内容，增加更多细节和例子：\n\n${input}`,
  summarize: (input) => `请总结下面的内容，提取核心要点：\n\n${input}`,
  email: (input) => `请写一封专业的邮件，主题是：\n\n${input}`,
  copywriting: (input) => `请为以下内容写一段吸引人的营销文案：\n\n${input}`
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  loadApiKey();
  loadHistory();
  updateButtonStates();
  initEventListeners();
  
  // 配置 marked.js
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }
});

// ==================== 事件监听 ====================

function initEventListeners() {
  // 创意度滑块
  elements.temperature.addEventListener('input', (e) => {
    elements.tempValue.textContent = e.target.value;
  });

  // 输出长度滑块
  elements.maxTokens.addEventListener('input', (e) => {
    elements.maxTokensValue.textContent = e.target.value;
  });

  // 输入框变化
  elements.inputText.addEventListener('input', updateButtonStates);

  // 优化提示词
  elements.optimizeBtn.addEventListener('click', handleOptimize);

  // 生成内容
  elements.generateBtn.addEventListener('click', handleGenerate);

  // 复制内容
  elements.copyBtn.addEventListener('click', handleCopy);

  // 设置按钮
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.closeModalBtn.addEventListener('click', closeSettings);
  elements.saveApiKeyBtn.addEventListener('click', saveApiKey);

  // 高级设置折叠
  elements.advancedToggle.addEventListener('click', toggleAdvancedPanel);

  // 清空历史记录
  elements.clearHistoryBtn.addEventListener('click', clearAllHistory);
}

// ==================== 高级设置面板 ====================

function toggleAdvancedPanel() {
  const isHidden = elements.advancedPanel.classList.contains('hidden');
  
  if (isHidden) {
    elements.advancedPanel.classList.remove('hidden');
    elements.toggleIcon.style.transform = 'rotate(180deg)';
  } else {
    elements.advancedPanel.classList.add('hidden');
    elements.toggleIcon.style.transform = 'rotate(0deg)';
  }
}

// 应用预设配置
function applyPreset(preset) {
  const presets = {
    conservative: { temperature: 0.3, maxTokens: 1000 },
    balanced: { temperature: 0.7, maxTokens: 1500 },
    creative: { temperature: 0.9, maxTokens: 2000 }
  };

  const config = presets[preset];
  if (config) {
    elements.temperature.value = config.temperature;
    elements.tempValue.textContent = config.temperature;
    elements.maxTokens.value = config.maxTokens;
    elements.maxTokensValue.textContent = config.maxTokens;
    
    const presetNames = {
      conservative: '保守',
      balanced: '平衡',
      creative: '创意'
    };
    showToast(`✅ 已应用 ${presetNames[preset]} 预设`, 'success');
  }
}

// 将函数暴露到全局作用域供 HTML 调用
window.applyPreset = applyPreset;

// ==================== API Key 管理 ====================

function loadApiKey() {
  const stored = localStorage.getItem('zhipu_api_key');
  if (stored) {
    CONFIG.apiKey = stored;
    elements.apiKeyInput.value = stored;
  }
}

function saveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  if (!apiKey) {
    showToast('❌ 请输入 API Key', 'error');
    return;
  }
  
  CONFIG.apiKey = apiKey;
  localStorage.setItem('zhipu_api_key', apiKey);
  showToast('✅ API Key 已保存', 'success');
  closeSettings();
}

function openSettings() {
  elements.settingsModal.classList.remove('hidden');
}

function closeSettings() {
  elements.settingsModal.classList.add('hidden');
}

// ==================== 按钮状态管理 ====================

function updateButtonStates() {
  const hasInput = elements.inputText.value.trim().length > 0;
  elements.optimizeBtn.disabled = !hasInput || isGenerating;
  elements.generateBtn.disabled = !hasInput || isGenerating;
}

// ==================== 优化提示词 ====================

async function handleOptimize() {
  const input = elements.inputText.value.trim();
  if (!input) return;

  if (!CONFIG.apiKey) {
    showToast('❌ 请先设置 API Key', 'error');
    openSettings();
    return;
  }

  elements.optimizeBtn.disabled = true;
  elements.optimizeBtn.textContent = '⏳ 优化中...';

  try {
    const mode = elements.writingMode.value;
    const modeNames = {
      continue: '文章续写',
      rewrite: '内容改写',
      expand: '内容扩展',
      summarize: '内容总结',
      email: '邮件撰写',
      copywriting: '文案生成'
    };

    const optimizePrompt = `请优化以下${modeNames[mode]}任务的描述，使其更加清晰、具体：

${input}

要求：
1. 保持原意不变
2. 增加必要的细节和上下文
3. 使描述更加专业和准确
4. 直接输出优化后的内容，不要额外说明`;

    const optimized = await generateContentSync(optimizePrompt, 0.7);
    elements.inputText.value = optimized.trim();
    showToast('✅ 提示词已优化', 'success');
    
  } catch (error) {
    console.error('优化失败:', error);
    showToast(`❌ ${error.message}`, 'error');
  } finally {
    elements.optimizeBtn.disabled = false;
    elements.optimizeBtn.textContent = '🎯 优化提示词';
  }
}

// ==================== 生成内容 ====================

async function handleGenerate() {
  const input = elements.inputText.value.trim();
  if (!input) return;

  if (!CONFIG.apiKey) {
    showToast('❌ 请先设置 API Key', 'error');
    openSettings();
    return;
  }

  isGenerating = true;
  updateButtonStates();
  
  elements.generateBtn.disabled = true;
  elements.generateBtn.textContent = '⏳ 生成中...';
  elements.copyBtn.classList.add('hidden');
  
  // 清空输出区
  elements.outputArea.innerHTML = '<p class="text-gray-600">正在生成内容...</p>';
  currentOutput = '';

  try {
    const mode = elements.writingMode.value;
    const prompt = promptTemplates[mode](input);
    const temp = parseFloat(elements.temperature.value);
    const maxTokens = parseInt(elements.maxTokens.value);

    await generateContentStream(prompt, temp, maxTokens);
    
    // 显示复制按钮
    elements.copyBtn.classList.remove('hidden');
    
    // 保存到历史
    saveToHistory(input, currentOutput);
    
  } catch (error) {
    console.error('生成失败:', error);
    elements.outputArea.innerHTML = `<p class="text-red-600">❌ 生成失败：${error.message}</p>`;
  } finally {
    isGenerating = false;
    updateButtonStates();
    elements.generateBtn.disabled = false;
    elements.generateBtn.textContent = '✨ 生成内容';
  }
}

// ==================== 智谱 AI API 调用 ====================

async function generateContentStream(prompt, temperature, maxTokens) {
  const response = await fetch(`${CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  elements.outputArea.innerHTML = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          
          if (content) {
            currentOutput += content;
            renderMarkdown(currentOutput);
            elements.outputArea.scrollTop = elements.outputArea.scrollHeight;
          }
        } catch (e) {
          console.warn('解析 SSE 数据失败:', e);
        }
      }
    }
  }
}

async function generateContentSync(prompt, temperature) {
  const response = await fetch(`${CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 1000,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ==================== Markdown 渲染 ====================

function renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    elements.outputArea.innerHTML = marked.parse(text);
  } else {
    elements.outputArea.textContent = text;
  }
}

// ==================== 工具函数 ====================

// getMaxTokens 函数已被移除，直接使用滑块值

// ==================== 复制功能 ====================

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(currentOutput);
    showCopyToast();
  } catch (error) {
    showToast('❌ 复制失败', 'error');
  }
}

function showCopyToast() {
  elements.copyToast.classList.remove('hidden');
  setTimeout(() => {
    elements.copyToast.classList.add('hidden');
  }, 2000);
}

// ==================== 通用提示 ====================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  toast.className = `fixed top-20 right-6 px-6 py-3 rounded-lg shadow-lg fade-in ${bgColor} text-white z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// ==================== 历史记录 ====================

function saveToHistory(input, output) {
  const record = {
    id: Date.now(),
    mode: elements.writingMode.value,
    modeName: elements.writingMode.options[elements.writingMode.selectedIndex].text,
    prompt: input,
    input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
    output: output,
    temperature: parseFloat(elements.temperature.value),
    maxTokens: parseInt(elements.maxTokens.value),
    timestamp: new Date().toLocaleString('zh-CN'),
    timestampRaw: Date.now()
  };
  
  history.unshift(record);
  
  // 限制历史记录数量为 100 条
  if (history.length > 100) {
    history = history.slice(0, 100);
  }
  
  localStorage.setItem('writingHistory', JSON.stringify(history));
  renderHistory();
  
  // 显示保存成功提示
  console.log('✅ 历史记录已保存');
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('writingHistory');
    if (saved) {
      history = JSON.parse(saved);
      renderHistory();
      console.log(`📚 已加载 ${history.length} 条历史记录`);
    }
  } catch (error) {
    console.error('加载历史记录失败:', error);
    history = [];
  }
}

function renderHistory() {
  if (history.length === 0) {
    elements.historyList.innerHTML = '<p class="text-gray-400 text-center py-8 text-sm">暂无历史记录</p>';
    return;
  }
  
  elements.historyList.innerHTML = history.map(record => {
    const timeAgo = getTimeAgo(record.timestampRaw || Date.now());
    return `
      <div class="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition group" onclick="loadHistoryRecord(${record.id})">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-medium text-blue-600">${record.modeName}</span>
          <button 
            onclick="deleteHistory(${record.id}); event.stopPropagation();" 
            class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
            title="删除"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-700 line-clamp-2 mb-2">${record.input}</p>
        <div class="flex justify-between items-center text-xs text-gray-500">
          <span title="${record.timestamp}">${timeAgo}</span>
          <div class="flex gap-2">
            <span title="创意度">🎨 ${record.temperature}</span>
            <span title="长度">📏 ${record.maxTokens}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function loadHistoryRecord(id) {
  const record = history.find(r => r.id === id);
  if (!record) return;
  
  // 显示输出内容
  currentOutput = record.output;
  renderMarkdown(currentOutput);
  elements.copyBtn.classList.remove('hidden');
  
  // 恢复输入内容
  if (record.prompt) {
    elements.inputText.value = record.prompt;
  }
  
  // 恢复写作模式
  if (record.mode) {
    elements.writingMode.value = record.mode;
  }
  
  // 恢复参数设置
  if (record.temperature !== undefined) {
    elements.temperature.value = record.temperature;
    elements.tempValue.textContent = record.temperature;
  }
  if (record.maxTokens !== undefined) {
    elements.maxTokens.value = record.maxTokens;
    elements.maxTokensValue.textContent = record.maxTokens;
  }
  
  showToast('✅ 已加载历史记录', 'success');
}

function deleteHistory(id) {
  if (!confirm('确定要删除这条历史记录吗？')) {
    return;
  }
  
  history = history.filter(r => r.id !== id);
  localStorage.setItem('writingHistory', JSON.stringify(history));
  renderHistory();
  showToast('🗑️ 已删除', 'info');
}

function clearAllHistory() {
  if (!confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
    return;
  }
  
  history = [];
  localStorage.setItem('writingHistory', JSON.stringify(history));
  renderHistory();
  showToast('🗑️ 已清空所有历史记录', 'info');
}

// 计算相对时间
function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

// 将函数暴露到全局作用域供 HTML 调用
window.loadHistoryRecord = loadHistoryRecord;
window.deleteHistory = deleteHistory;

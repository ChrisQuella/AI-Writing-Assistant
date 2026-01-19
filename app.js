// 智能写作助手 - 主逻辑

// DOM 元素
const writingMode = document.getElementById('writingMode');
const inputText = document.getElementById('inputText');
const temperature = document.getElementById('temperature');
const tempValue = document.getElementById('tempValue');
const outputLength = document.getElementById('outputLength');
const optimizeBtn = document.getElementById('optimizeBtn');
const generateBtn = document.getElementById('generateBtn');
const outputArea = document.getElementById('outputArea');
const copyBtn = document.getElementById('copyBtn');
const copyToast = document.getElementById('copyToast');
const historyList = document.getElementById('historyList');

// 状态管理
let currentOutput = '';
let history = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateButtonStates();
});

// 更新创意度显示
temperature.addEventListener('input', (e) => {
    tempValue.textContent = e.target.value;
});

// 监听输入变化，更新按钮状态
inputText.addEventListener('input', updateButtonStates);

// 更新按钮状态
function updateButtonStates() {
    const hasInput = inputText.value.trim().length > 0;
    optimizeBtn.disabled = !hasInput;
    generateBtn.disabled = !hasInput;
}

// 优化提示词
optimizeBtn.addEventListener('click', async () => {
    const input = inputText.value.trim();
    if (!input) return;

    optimizeBtn.disabled = true;
    optimizeBtn.textContent = '⏳ 优化中...';

    try {
        // 模拟 AI 优化（实际应用中调用 API）
        await simulateDelay(1500);
        
        const optimized = optimizePrompt(input, writingMode.value);
        inputText.value = optimized;
        
        showToast('✅ 提示词已优化', 'success');
    } catch (error) {
        showToast('❌ 优化失败，请重试', 'error');
    } finally {
        optimizeBtn.disabled = false;
        optimizeBtn.textContent = '🎯 优化提示词';
    }
});

// 生成内容
generateBtn.addEventListener('click', async () => {
    const input = inputText.value.trim();
    if (!input) return;

    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ 生成中...';
    copyBtn.classList.add('hidden');
    
    // 清空输出区
    outputArea.innerHTML = '<p class="text-gray-600">正在生成内容...</p>';

    try {
        // 模拟流式生成（实际应用中调用 API）
        const generatedText = await streamGenerate(input, writingMode.value);
        currentOutput = generatedText;
        
        // 显示复制按钮
        copyBtn.classList.remove('hidden');
        
        // 保存到历史
        saveToHistory(input, generatedText);
        
    } catch (error) {
        outputArea.innerHTML = `<p class="text-red-600">❌ 生成失败：${error.message}</p>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ 生成内容';
    }
});

// 复制内容
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(currentOutput);
        showCopyToast();
    } catch (error) {
        showToast('❌ 复制失败', 'error');
    }
});

// 显示复制成功提示
function showCopyToast() {
    copyToast.classList.remove('hidden');
    setTimeout(() => {
        copyToast.classList.add('hidden');
    }, 2000);
}

// 通用提示
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-6 px-6 py-3 rounded-lg shadow-lg fade-in ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// 模拟流式生成
async function streamGenerate(input, mode) {
    const prompt = getPromptTemplate(mode, input);
    const response = generateMockResponse(prompt, mode);
    
    outputArea.innerHTML = '';
    
    // 流式显示
    for (let i = 0; i < response.length; i++) {
        await simulateDelay(20);
        outputArea.textContent += response[i];
        outputArea.scrollTop = outputArea.scrollHeight;
    }
    
    return response;
}

// 获取提示词模板
function getPromptTemplate(mode, input) {
    const templates = {
        continue: `请继续写下面的文章，保持风格一致，内容连贯：\n${input}`,
        rewrite: `请改写下面的内容，使其更加流畅、专业：\n${input}`,
        expand: `请扩展下面的内容，增加更多细节和例子：\n${input}`,
        summarize: `请总结下面的内容，提取核心要点：\n${input}`,
        email: `请写一封专业的邮件，主题是：\n${input}`,
        copywriting: `请为以下内容写一段吸引人的营销文案：\n${input}`
    };
    return templates[mode] || input;
}

// 优化提示词
function optimizePrompt(input, mode) {
    const modeNames = {
        continue: '文章续写',
        rewrite: '内容改写',
        expand: '内容扩展',
        summarize: '内容总结',
        email: '邮件撰写',
        copywriting: '文案生成'
    };
    
    return `【${modeNames[mode]}】\n\n${input}\n\n请注意保持专业性和连贯性，确保内容质量。`;
}

// 生成模拟响应
function generateMockResponse(prompt, mode) {
    const responses = {
        continue: '随着科技的不断发展，人工智能已经深入到我们生活的方方面面。从智能手机到自动驾驶汽车，从医疗诊断到金融分析，AI 正在改变着世界的运作方式。这种变革不仅提高了效率，也为人类创造了更多可能性。\n\n然而，我们也需要思考 AI 发展带来的挑战。如何确保 AI 的安全性和可控性？如何平衡技术进步与隐私保护？这些都是我们需要认真对待的问题。',
        rewrite: '人工智能技术的快速发展正在深刻改变我们的生活方式。从日常使用的智能设备到复杂的工业应用，AI 的影响无处不在。这项技术不仅提升了工作效率，更为人类社会开辟了全新的发展方向。',
        expand: '人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个重要分支，致力于创建能够模拟人类智能行为的系统。\n\n具体来说，AI 包括以下几个关键领域：\n\n1. 机器学习：通过数据训练模型，使计算机能够自主学习和改进\n2. 自然语言处理：让计算机理解和生成人类语言\n3. 计算机视觉：使机器能够"看懂"图像和视频\n4. 机器人技术：创造能够在物理世界中自主行动的智能系统\n\n这些技术的结合，正在推动着第四次工业革命的到来。',
        summarize: '核心要点：\n\n1. AI 技术发展迅速，应用广泛\n2. 提高了效率，创造了新机遇\n3. 需要关注安全性和伦理问题\n4. 平衡技术进步与社会责任很重要',
        email: '尊敬的团队成员：\n\n您好！\n\n我写信是想与大家分享关于人工智能项目的最新进展。经过团队的共同努力，我们在技术研发方面取得了重要突破。\n\n接下来，我们将进入项目的下一阶段。希望大家继续保持热情和专注，共同推动项目成功。\n\n如有任何问题或建议，欢迎随时与我联系。\n\n此致\n敬礼',
        copywriting: '🚀 开启智能新时代！\n\n我们的 AI 解决方案，让您的业务更智能、更高效。\n\n✨ 核心优势：\n• 智能化处理，节省 80% 时间\n• 精准分析，提升决策质量\n• 简单易用，零门槛上手\n\n💡 立即体验，感受 AI 的力量！\n\n限时优惠，前 100 名用户享受专属折扣。不要错过这个改变未来的机会！'
    };
    
    return responses[mode] || '这是生成的内容示例。在实际应用中，这里会显示 AI 生成的真实内容。';
}

// 保存到历史
function saveToHistory(input, output) {
    const record = {
        id: Date.now(),
        mode: writingMode.options[writingMode.selectedIndex].text,
        input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        output: output,
        timestamp: new Date().toLocaleString('zh-CN')
    };
    
    history.unshift(record);
    
    // 限制历史记录数量
    if (history.length > 100) {
        history = history.slice(0, 100);
    }
    
    localStorage.setItem('writingHistory', JSON.stringify(history));
    renderHistory();
}

// 加载历史
function loadHistory() {
    const saved = localStorage.getItem('writingHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

// 渲染历史记录
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-gray-400 text-center py-8">暂无历史记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map(record => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition" onclick="loadHistoryRecord(${record.id})">
            <div class="flex justify-between items-start mb-2">
                <span class="text-sm font-medium text-blue-600">${record.mode}</span>
                <span class="text-xs text-gray-500">${record.timestamp}</span>
            </div>
            <p class="text-sm text-gray-700 truncate">${record.input}</p>
            <button onclick="deleteHistory(${record.id}); event.stopPropagation();" class="text-xs text-red-500 hover:text-red-700 mt-2">删除</button>
        </div>
    `).join('');
}

// 加载历史记录
function loadHistoryRecord(id) {
    const record = history.find(r => r.id === id);
    if (record) {
        outputArea.textContent = record.output;
        currentOutput = record.output;
        copyBtn.classList.remove('hidden');
        showToast('✅ 已加载历史记录', 'success');
    }
}

// 删除历史记录
function deleteHistory(id) {
    history = history.filter(r => r.id !== id);
    localStorage.setItem('writingHistory', JSON.stringify(history));
    renderHistory();
    showToast('🗑️ 已删除', 'info');
}

// 工具函数：模拟延迟
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

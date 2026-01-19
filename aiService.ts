/**
 * 智谱 AI API 服务
 * 处理与智谱 AI 的交互，支持流式输出
 */

export interface GenerateOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  onStream?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * 智谱 AI 配置
 */
const ZHIPU_CONFIG = {
  apiKey: '', // 需要在使用前设置
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4-flash' // 使用 GLM-4-Flash 模型
};

/**
 * 设置 API Key
 */
export function setApiKey(apiKey: string): void {
  ZHIPU_CONFIG.apiKey = apiKey;
}

/**
 * 获取 API Key（从环境变量或本地存储）
 */
export function getApiKey(): string {
  if (ZHIPU_CONFIG.apiKey) {
    return ZHIPU_CONFIG.apiKey;
  }
  
  // 尝试从 localStorage 获取
  const stored = localStorage.getItem('zhipu_api_key');
  if (stored) {
    ZHIPU_CONFIG.apiKey = stored;
    return stored;
  }
  
  return '';
}

/**
 * 保存 API Key 到本地存储
 */
export function saveApiKey(apiKey: string): void {
  ZHIPU_CONFIG.apiKey = apiKey;
  localStorage.setItem('zhipu_api_key', apiKey);
}

/**
 * 流式生成内容
 */
export async function generateContent(options: GenerateOptions): Promise<string> {
  const {
    prompt,
    temperature = 0.7,
    maxTokens = 2000,
    onStream,
    onComplete,
    onError
  } = options;

  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error('请先设置 API Key');
    onError?.(error);
    throw error;
  }

  try {
    const response = await fetch(`${ZHIPU_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: ZHIPU_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            continue;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            
            if (content) {
              fullText += content;
              onStream?.(content);
            }
          } catch (e) {
            console.warn('解析 SSE 数据失败:', e);
          }
        }
      }
    }

    onComplete?.(fullText);
    return fullText;

  } catch (error) {
    const err = error instanceof Error ? error : new Error('生成内容失败');
    onError?.(err);
    throw err;
  }
}

/**
 * 非流式生成（一次性返回完整结果）
 */
export async function generateContentSync(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先设置 API Key');
  }

  const response = await fetch(`${ZHIPU_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: ZHIPU_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 测试 API 连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    await generateContentSync('你好', 0.7, 10);
    return true;
  } catch (error) {
    console.error('API 连接测试失败:', error);
    return false;
  }
}

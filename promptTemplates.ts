/**
 * 智能写作助手 - 提示词模板
 * 根据不同的写作模式生成相应的提示词
 */

/**
 * 写作模式类型
 */
export type WritingMode = 
  | 'continue'      // 文章续写
  | 'rewrite'       // 内容改写
  | 'expand'        // 内容扩展
  | 'summarize'     // 内容总结
  | 'email'         // 邮件撰写
  | 'copywriting';  // 文案生成

/**
 * 邮件风格类型
 */
export type EmailStyle = 'formal' | 'friendly';

/**
 * 文案风格类型
 */
export type CopywritingStyle = 'professional' | 'casual' | 'creative' | 'persuasive';

/**
 * 提示词生成选项
 */
export interface PromptOptions {
  emailStyle?: EmailStyle;
  copywritingStyle?: CopywritingStyle;
  productName?: string;
}

/**
 * 文章续写
 * @param userInput 用户输入的文章内容
 * @returns 完整的提示词
 */
export function continueWriting(userInput: string): string {
  return `请继续写下面的文章，保持风格一致，内容连贯：

${userInput}`;
}

/**
 * 内容改写
 * @param userInput 用户输入的内容
 * @returns 完整的提示词
 */
export function rewriteContent(userInput: string): string {
  return `请改写下面的内容，使其更加流畅、专业：

${userInput}`;
}

/**
 * 内容扩展
 * @param userInput 用户输入的内容
 * @returns 完整的提示词
 */
export function expandContent(userInput: string): string {
  return `请扩展下面的内容，增加更多细节和例子：

${userInput}`;
}

/**
 * 内容总结
 * @param userInput 用户输入的内容
 * @returns 完整的提示词
 */
export function summarizeContent(userInput: string): string {
  return `请总结下面的内容，提取核心要点：

${userInput}`;
}

/**
 * 邮件撰写
 * @param subject 邮件主题
 * @param style 邮件风格（正式/友好）
 * @returns 完整的提示词
 */
export function writeEmail(subject: string, style: EmailStyle = 'formal'): string {
  const styleText = style === 'formal' ? '正式' : '友好';
  return `请写一封${styleText}的邮件，主题是：

${subject}`;
}

/**
 * 文案生成
 * @param productName 产品名称
 * @param style 文案风格
 * @returns 完整的提示词
 */
export function generateCopywriting(
  productName: string, 
  style: CopywritingStyle = 'professional'
): string {
  const styleMap: Record<CopywritingStyle, string> = {
    professional: '专业',
    casual: '轻松',
    creative: '创意',
    persuasive: '说服力'
  };
  
  const styleText = styleMap[style];
  return `请为${productName}写一段${styleText}风格的营销文案`;
}

/**
 * 根据写作模式生成提示词（统一入口）
 * @param mode 写作模式
 * @param userInput 用户输入
 * @param options 额外选项
 * @returns 完整的提示词
 */
export function generatePrompt(
  mode: WritingMode,
  userInput: string,
  options: PromptOptions = {}
): string {
  switch (mode) {
    case 'continue':
      return continueWriting(userInput);
    
    case 'rewrite':
      return rewriteContent(userInput);
    
    case 'expand':
      return expandContent(userInput);
    
    case 'summarize':
      return summarizeContent(userInput);
    
    case 'email':
      return writeEmail(userInput, options.emailStyle);
    
    case 'copywriting':
      return generateCopywriting(
        options.productName || userInput,
        options.copywritingStyle
      );
    
    default:
      throw new Error(`未知的写作模式: ${mode}`);
  }
}

/**
 * 优化用户输入的提示词
 * @param userInput 用户原始输入
 * @param mode 写作模式
 * @returns 优化后的提示词
 */
export function optimizePrompt(userInput: string, mode: WritingMode): string {
  const modeNames: Record<WritingMode, string> = {
    continue: '文章续写',
    rewrite: '内容改写',
    expand: '内容扩展',
    summarize: '内容总结',
    email: '邮件撰写',
    copywriting: '文案生成'
  };

  const modeName = modeNames[mode];
  
  return `【${modeName}任务】

原始内容：
${userInput}

要求：
- 保持内容的专业性和准确性
- 确保语言流畅、逻辑清晰
- 注意上下文的连贯性
- 符合${modeName}的特点和规范`;
}

/**
 * 获取写作模式的描述
 * @param mode 写作模式
 * @returns 模式描述
 */
export function getModeDescription(mode: WritingMode): string {
  const descriptions: Record<WritingMode, string> = {
    continue: '根据已有内容继续创作，保持风格和逻辑的一致性',
    rewrite: '重新组织语言，使内容更加流畅和专业',
    expand: '在原有基础上增加细节、例子和深度',
    summarize: '提炼核心观点，形成简洁的摘要',
    email: '撰写符合商务或日常场景的邮件',
    copywriting: '创作吸引人的营销文案，突出产品特点'
  };
  
  return descriptions[mode];
}

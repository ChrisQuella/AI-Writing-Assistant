# 快速启动指南

## 🚀 5 分钟快速上手

### 步骤 1: 打开应用
直接在浏览器中打开 `index.html` 文件。

### 步骤 2: 设置 API Key
1. 点击右上角 **⚙️ 设置** 按钮
2. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/) 获取 API Key
3. 将 API Key 粘贴到输入框
4. 点击 **保存**

### 步骤 3: 开始使用
1. 选择写作模式（如：文章续写）
2. 在输入框输入内容
3. 点击 **✨ 生成内容**
4. 查看右侧实时生成的结果

### 步骤 4: 探索功能
- 点击 **⚙️ 高级设置** 调整参数
- 点击 **🎯 优化提示词** 改进输入
- 查看左侧 **📚 历史记录**
- 点击 **📋 复制** 保存结果

---

## 📋 功能测试

### 方法 1: 使用测试页面
打开 `test.html` 进行自动化测试：
```
1. 双击打开 test.html
2. 点击"运行所有测试"
3. 查看测试结果
```

### 方法 2: 手动测试
按照 `TEST_CHECKLIST.md` 中的清单逐项测试。

### 方法 3: 浏览器控制台测试
在主应用页面按 F12 打开控制台，运行：

```javascript
// 检查 API Key
console.log('API Key:', localStorage.getItem('zhipu_api_key') ? '已设置' : '未设置');

// 检查历史记录
const history = JSON.parse(localStorage.getItem('writingHistory') || '[]');
console.log('历史记录数:', history.length);

// 添加测试记录
const testRecord = {
    id: Date.now(),
    mode: 'continue',
    modeName: '📖 文章续写',
    prompt: '测试内容',
    input: '测试内容...',
    output: '这是测试生成的内容',
    temperature: 0.7,
    maxTokens: 1500,
    timestamp: new Date().toLocaleString('zh-CN'),
    timestampRaw: Date.now()
};

history.unshift(testRecord);
localStorage.setItem('writingHistory', JSON.stringify(history));
console.log('✅ 测试记录已添加，刷新页面查看');
```

---

## ✅ 功能检查清单

### 基础功能
- [ ] 页面正常加载
- [ ] API Key 可以保存
- [ ] 6 种写作模式可选择
- [ ] 输入框可以输入文本
- [ ] 生成按钮可以点击

### 高级功能
- [ ] 高级设置面板可展开/折叠
- [ ] 创意度滑块可调节（0.0-1.0）
- [ ] 输出长度滑块可调节（100-2000）
- [ ] 快速预设按钮可用
- [ ] 提示词优化功能可用

### 生成功能
- [ ] 内容可以流式生成
- [ ] Markdown 格式正确渲染
- [ ] 复制按钮可用
- [ ] 生成结果正确显示

### 历史记录
- [ ] 生成后自动保存到历史
- [ ] 历史记录显示在左侧
- [ ] 点击历史记录可加载
- [ ] 可以删除单条记录
- [ ] 可以清空所有记录
- [ ] 刷新后历史记录仍存在

---

## 🐛 常见问题排查

### 问题 1: 页面无法加载
**解决方案：**
- 检查浏览器是否支持（推荐 Chrome/Firefox/Edge）
- 检查网络连接（需要加载 CDN 资源）
- 打开浏览器控制台查看错误信息

### 问题 2: 生成失败
**可能原因：**
1. 未设置 API Key → 点击设置按钮配置
2. API Key 无效 → 检查 API Key 是否正确
3. 网络问题 → 检查网络连接
4. API 配额用完 → 检查智谱 AI 账户余额

### 问题 3: 历史记录不显示
**解决方案：**
1. 检查浏览器控制台是否有错误
2. 运行测试代码添加测试记录
3. 清除浏览器缓存后重试
4. 检查 localStorage 是否被禁用

### 问题 4: 样式显示异常
**解决方案：**
- 确保网络正常（Tailwind CSS 从 CDN 加载）
- 清除浏览器缓存
- 尝试硬刷新（Ctrl+F5）

---

## 📊 测试数据示例

### 测试输入 1: 文章续写
```
人工智能技术正在快速发展，它已经深入到我们生活的方方面面。
```

### 测试输入 2: 内容改写
```
AI 很厉害，可以做很多事情，比如写文章、画图、聊天等等。
```

### 测试输入 3: 内容总结
```
[粘贴一篇长文章]
```

### 测试输入 4: 邮件撰写
```
通知团队成员下周一召开项目启动会议
```

### 测试输入 5: 文案生成
```
智能写作助手 - AI 驱动的写作工具
```

---

## 🔧 开发者测试

### 检查文件完整性
```bash
# 检查所有必需文件是否存在
ls -la index.html main.js aiService.ts promptTemplates.ts prompts.md README.md
```

### 检查 JavaScript 语法
```bash
# 使用 Node.js 检查语法
node -c main.js
node -c aiService.ts
node -c promptTemplates.ts
```

### 检查 localStorage
```javascript
// 查看所有存储的数据
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key, ':', localStorage.getItem(key));
}
```

### 性能测试
```javascript
// 测试历史记录性能
console.time('加载历史记录');
const history = JSON.parse(localStorage.getItem('writingHistory') || '[]');
console.timeEnd('加载历史记录');

console.log('记录数:', history.length);
console.log('数据大小:', new Blob([JSON.stringify(history)]).size, 'bytes');
```

---

## 📝 测试报告模板

```
测试日期: ___________
测试人员: ___________
浏览器: ___________
操作系统: ___________

功能测试结果:
✅ 基础功能: 通过/失败
✅ 高级设置: 通过/失败
✅ 内容生成: 通过/失败
✅ 历史记录: 通过/失败
✅ 数据持久化: 通过/失败

发现的问题:
1. ___________
2. ___________

建议改进:
1. ___________
2. ___________

总体评价: ___________
```

---

## 🎯 下一步

测试完成后，你可以：

1. **正式使用**：开始用于实际写作任务
2. **反馈问题**：记录使用中遇到的问题
3. **功能建议**：提出新功能需求
4. **性能优化**：测试大量数据下的性能

---

## 📞 获取帮助

如果遇到问题：
1. 查看 `README.md` 了解详细功能说明
2. 查看 `TEST_CHECKLIST.md` 进行系统测试
3. 检查浏览器控制台的错误信息
4. 尝试清除浏览器缓存和 localStorage

祝使用愉快！✨

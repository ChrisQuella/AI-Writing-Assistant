/**
 * 历史记录管理模块
 * 负责历史记录的存储、加载、渲染和管理
 */

class HistoryManager {
  constructor() {
    this.storageKey = 'writingHistory';
    this.maxRecords = 100;
    this.history = [];
  }

  /**
   * 初始化 - 从 localStorage 加载历史记录
   */
  init() {
    this.loadFromStorage();
    return this;
  }

  /**
   * 从 localStorage 加载历史记录
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.history = JSON.parse(saved);
        console.log(`📚 已加载 ${this.history.length} 条历史记录`);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.history = [];
    }
  }

  /**
   * 保存到 localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  /**
   * 添加新记录
   */
  addRecord(record) {
    const newRecord = {
      id: Date.now(),
      ...record,
      timestamp: new Date().toLocaleString('zh-CN'),
      timestampRaw: Date.now()
    };

    this.history.unshift(newRecord);

    // 限制记录数量
    if (this.history.length > this.maxRecords) {
      this.history = this.history.slice(0, this.maxRecords);
    }

    this.saveToStorage();
    return newRecord;
  }

  /**
   * 获取所有记录
   */
  getAllRecords() {
    return this.history;
  }

  /**
   * 根据 ID 获取记录
   */
  getRecordById(id) {
    return this.history.find(r => r.id === id);
  }

  /**
   * 删除记录
   */
  deleteRecord(id) {
    this.history = this.history.filter(r => r.id !== id);
    this.saveToStorage();
  }

  /**
   * 清空所有记录
   */
  clearAll() {
    this.history = [];
    this.saveToStorage();
  }

  /**
   * 获取记录数量
   */
  getCount() {
    return this.history.length;
  }

  /**
   * 搜索记录
   */
  search(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.history.filter(record => 
      record.input?.toLowerCase().includes(lowerKeyword) ||
      record.output?.toLowerCase().includes(lowerKeyword) ||
      record.modeName?.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 按模式筛选
   */
  filterByMode(mode) {
    return this.history.filter(record => record.mode === mode);
  }

  /**
   * 导出历史记录为 JSON
   */
  exportToJSON() {
    const dataStr = JSON.stringify(this.history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `writing-history-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * 从 JSON 导入历史记录
   */
  importFromJSON(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        this.history = imported;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入失败:', error);
      return false;
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const stats = {
      total: this.history.length,
      byMode: {},
      totalWords: 0,
      avgTemperature: 0,
      avgMaxTokens: 0
    };

    let tempSum = 0;
    let tokensSum = 0;

    this.history.forEach(record => {
      // 按模式统计
      const mode = record.modeName || '未知';
      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;

      // 统计字数
      if (record.output) {
        stats.totalWords += record.output.length;
      }

      // 统计参数
      if (record.temperature !== undefined) {
        tempSum += record.temperature;
      }
      if (record.maxTokens !== undefined) {
        tokensSum += record.maxTokens;
      }
    });

    if (this.history.length > 0) {
      stats.avgTemperature = (tempSum / this.history.length).toFixed(2);
      stats.avgMaxTokens = Math.round(tokensSum / this.history.length);
    }

    return stats;
  }
}

// 导出单例
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HistoryManager;
}

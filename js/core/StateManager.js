// ==================== 狀態管理器 ====================
// 來源: app.js 行 4-26
// 集中管理應用的所有狀態

export class StateManager {
    constructor() {
        // 用戶狀態
        this.currentUser = null;  // Firebase 用戶物件

        // 視圖狀態
        this.currentView = 'list';  // 'list' | 'calendar'
        this.currentPage = 'homePage';  // 'homePage' | 'notebooksPage' | 'analyticsPage'

        // 日期相關狀態
        this.currentMonth = new Date();  // 日曆顯示的月份
        this.currentDayView = new Date();  // 首頁時間軸查看的日期
        this.selectedDate = null;  // 選中的日期

        // 日期區間狀態
        this.isRangeMode = false;  // 是否為區間模式
        this.rangeStart = null;  // 區間開始日期
        this.rangeEnd = null;  // 區間結束日期

        // 日期區間選擇器狀態
        this.rangeCalendarMonth = new Date();  // 日期選擇器顯示的月份
        this.tempRangeStart = null;  // 臨時選擇的開始日期
        this.tempRangeEnd = null;  // 臨時選擇的結束日期
        this.isSelectingEnd = false;  // 是否正在選擇結束日期

        // 分析頁面日期選擇
        this.isAnalyticsDateSelection = false;  // 是否為分析頁面選擇日期
        this.analyticsStartDate = null;  // 分析頁面自訂開始日期
        this.analyticsEndDate = null;  // 分析頁面自訂結束日期
        this.analyticsCustomBtn = null;  // 分析頁面自訂按鈕引用

        // 表單相關狀態
        this.selectedCategories = [];  // 選中的分類
        this.currentPeriod = 'month';  // 當前分析週期

        // 狀態訂閱機制（用於未來擴展）
        this.listeners = {};
    }

    /**
     * 訂閱狀態變化
     * @param {string} key - 狀態鍵名
     * @param {Function} callback - 回調函數
     */
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    /**
     * 取消訂閱
     * @param {string} key - 狀態鍵名
     * @param {Function} callback - 回調函數
     */
    unsubscribe(key, callback) {
        if (!this.listeners[key]) return;
        this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    }

    /**
     * 觸發狀態變化通知
     * @param {string} key - 狀態鍵名
     * @param {*} value - 新值
     */
    notify(key, value) {
        if (!this.listeners[key]) return;
        this.listeners[key].forEach(callback => callback(value));
    }

    /**
     * 設定狀態
     * @param {string} key - 狀態鍵名
     * @param {*} value - 值
     */
    setState(key, value) {
        if (this.hasOwnProperty(key)) {
            this[key] = value;
            this.notify(key, value);
        } else {
            console.warn(`State key "${key}" does not exist`);
        }
    }

    /**
     * 取得狀態
     * @param {string} key - 狀態鍵名
     * @returns {*} - 狀態值
     */
    getState(key) {
        return this[key];
    }

    /**
     * 重置區間選擇狀態
     */
    resetRangeSelection() {
        this.tempRangeStart = null;
        this.tempRangeEnd = null;
        this.isSelectingEnd = false;
    }

    /**
     * 重置分析頁面日期選擇
     */
    resetAnalyticsDateSelection() {
        this.isAnalyticsDateSelection = false;
        this.analyticsStartDate = null;
        this.analyticsEndDate = null;
        this.analyticsCustomBtn = null;
    }
}

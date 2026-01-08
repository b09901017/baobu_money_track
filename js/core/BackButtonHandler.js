// ==================== Android 返回鍵處理器 ====================

/**
 * BackButtonHandler - 處理 Android 返回鍵邏輯
 *
 * 優先級順序：
 * 1. 關閉開啟的彈窗（表單、詳情、通知面板等）
 * 2. 返回首頁（如果在其他頁面）
 * 3. 退出應用（如果已在首頁且無彈窗）
 *
 * @example
 * BackButtonHandler.init();
 * BackButtonHandler.registerSheet('.bottom-sheet', closeCallback);
 */

class BackButtonHandler {
    constructor() {
        this.handlers = []; // 返回鍵處理器堆疊（後進先出）
        this.isEnabled = false;
    }

    /**
     * 初始化返回鍵監聽器
     */
    init() {
        // 監聽 Android 返回鍵事件
        window.addEventListener('backbutton', (e) => {
            e.preventDefault();
            this.handleBackButton();
        });

        // 瀏覽器環境模擬（開發測試用）
        if (!window.Capacitor) {
            console.log('[BackButtonHandler] 瀏覽器模式：按 ESC 模擬返回鍵');
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.handleBackButton();
                }
            });
        }

        this.isEnabled = true;
        console.log('[BackButtonHandler] 初始化完成');
    }

    /**
     * 處理返回鍵邏輯
     */
    handleBackButton() {
        console.log('[BackButtonHandler] 返回鍵被按下，當前堆疊：', this.handlers.length);

        // 優先級 1：執行最新註冊的處理器（LIFO）
        if (this.handlers.length > 0) {
            const handler = this.handlers[this.handlers.length - 1];
            console.log('[BackButtonHandler] 執行處理器：', handler.name);
            handler.callback();
            return;
        }

        // 優先級 2：返回首頁（如果不在首頁）
        const currentPage = window.StateManager?.currentPage || 'home';
        if (currentPage !== 'home') {
            console.log('[BackButtonHandler] 返回首頁');
            window.Router?.navigateTo('home');
            return;
        }

        // 優先級 3：退出應用
        console.log('[BackButtonHandler] 退出應用');
        if (window.Capacitor && window.Capacitor.Plugins.App) {
            window.Capacitor.Plugins.App.exitApp();
        }
    }

    /**
     * 註冊返回鍵處理器
     * @param {string} name - 處理器名稱（用於除錯）
     * @param {Function} callback - 返回時執行的回調函數
     * @returns {Function} 取消註冊函數
     */
    register(name, callback) {
        const handler = { name, callback };
        this.handlers.push(handler);
        console.log(`[BackButtonHandler] 註冊處理器：${name}，當前堆疊：${this.handlers.length}`);

        // 返回取消註冊函數
        return () => {
            const index = this.handlers.indexOf(handler);
            if (index > -1) {
                this.handlers.splice(index, 1);
                console.log(`[BackButtonHandler] 取消註冊：${name}，當前堆疊：${this.handlers.length}`);
            }
        };
    }

    /**
     * 自動偵測並註冊彈窗返回處理（簡化版）
     * 當彈窗顯示時自動註冊，關閉時自動取消
     *
     * @param {string} sheetSelector - 彈窗選擇器（如 '.bottom-sheet'）
     * @param {Function} closeCallback - 關閉彈窗的函數
     */
    registerSheet(sheetSelector, closeCallback) {
        const sheet = document.querySelector(sheetSelector);
        if (!sheet) {
            console.warn(`[BackButtonHandler] 找不到彈窗：${sheetSelector}`);
            return;
        }

        let unregister = null;

        // 使用 MutationObserver 監聽彈窗顯示/隱藏
        const observer = new MutationObserver(() => {
            const isVisible = sheet.classList.contains('active');

            if (isVisible && !unregister) {
                // 彈窗顯示：註冊返回處理
                unregister = this.register(sheetSelector, closeCallback);
            } else if (!isVisible && unregister) {
                // 彈窗關閉：取消註冊
                unregister();
                unregister = null;
            }
        });

        observer.observe(sheet, {
            attributes: true,
            attributeFilter: ['class']
        });

        console.log(`[BackButtonHandler] 自動追蹤彈窗：${sheetSelector}`);
    }

    /**
     * 清除所有處理器（登出時使用）
     */
    clear() {
        this.handlers = [];
        console.log('[BackButtonHandler] 清除所有處理器');
    }
}

// 建立全域單例
window.BackButtonHandler = new BackButtonHandler();

export default window.BackButtonHandler;

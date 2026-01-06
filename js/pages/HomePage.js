// ==================== 首頁控制器 ====================
// 來源: app.js 行 273-433
// 負責首頁的整體更新和協調

export class HomePage {
    constructor(balanceCard, timelineView) {
        this.balanceCard = balanceCard;
        this.timelineView = timelineView;
    }

    /**
     * 更新首頁
     * 注意：透過即時監聽自動更新，無需手動呼叫 update()
     */
    async update() {
        // 透過訂閱自動更新，不再需要手動刷新
        // balanceCard 和 timelineView 會自動響應 StateManager 的通知
    }

    /**
     * 初始化首頁
     */
    async init() {
        // 初始化訂閱（timelineView 會在 constructor 中訂閱）
        await this.timelineView.init();
        // balanceCard 的初始化由 app.js 在傳入 state 後自動處理（Stage 4.4）
    }

    /**
     * 更新帳本標題
     */
    updateNotebookTitle() {
        const notebook = window.DataManager.getCurrentNotebook();
        if (notebook) {
            const titleElement = document.getElementById('currentNotebookTitle');
            if (titleElement) {
                titleElement.textContent = notebook.name;
            }
        }
    }
}

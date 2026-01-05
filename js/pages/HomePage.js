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
     */
    async update() {
        this.balanceCard.update();
        await this.timelineView.refresh();
    }

    /**
     * 初始化首頁
     */
    async init() {
        this.balanceCard.update();
        await this.timelineView.init();
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

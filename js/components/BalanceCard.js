// ==================== 結算卡片組件 ====================
// 來源: app.js 行 279-290
// 負責更新首頁的結算卡片顯示

export class BalanceCard {
    constructor() {
        this.element = document.getElementById('balanceStatus');
    }

    /**
     * 更新結算卡片
     */
    update() {
        if (!this.element) {
            console.warn('balanceStatus element not found');
            return;
        }

        const balance = window.DataManager.calculateBalance();

        if (balance.status === 'settled') {
            this.element.textContent = '已結清 💖';
        } else if (balance.status === 'owed') {
            this.element.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        } else {
            this.element.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        }
    }
}

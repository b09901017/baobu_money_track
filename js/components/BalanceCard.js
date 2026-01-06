// ==================== 結算卡片組件 ====================
// 來源: app.js 行 279-290
// 負責更新首頁的結算卡片顯示

export class BalanceCard {
    constructor(state) {
        this.state = state;
        this.element = document.getElementById('balanceStatus');

        // 訂閱餘額變更事件
        if (this.state) {
            this.state.subscribe('balance', (balance) => this.handleBalanceUpdate(balance));
        }
    }

    /**
     * 處理餘額變更訂閱
     * @param {Object} balance - 餘額狀態
     */
    handleBalanceUpdate(balance) {
        if (!this.element) {
            console.warn('balanceStatus element not found');
            return;
        }

        if (!balance) return;

        if (balance.status === 'settled') {
            this.element.textContent = '已結清 💖';
        } else if (balance.status === 'owed') {
            this.element.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        } else {
            this.element.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        }
    }

    /**
     * 更新結算卡片（保留以維持相容性）
     * 注意：現在透過即時監聽自動更新，無需手動呼叫 update()
     */
    update() {
        // 透過 onSnapshot 即時監聽，餘額變更會自動推送
        // 此方法保留以維持相容性，但實際上不執行任何操作
    }
}

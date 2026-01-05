// ==================== 時間軸視圖組件 ====================
// 無限滾動時間軸，顯示所有交易記錄

import { TransactionRenderer } from './TransactionRenderer.js';

export class TimelineView {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        this.container = document.getElementById('transactionList');
        this.emptyState = document.getElementById('emptyTimelineState');
        this.timelineContainer = document.getElementById('timelineContainer');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');

        // 無限滾動參數
        this.transactionsLoaded = 30; // 初始載入 30 筆
        this.loadMoreCount = 30; // 每次載入更多 30 筆
    }

    /**
     * 初始化時間軸
     */
    async init() {
        await this.loadTransactions();
    }

    /**
     * 載入交易記錄
     * @param {boolean} append - 是否追加到現有記錄
     */
    async loadTransactions(append = false) {
        // 獲取最近 N 筆交易記錄
        const transactions = await window.DataManager.getRecentTransactions(this.transactionsLoaded);

        // 檢查是否有記錄
        if (transactions.length === 0 && !append) {
            if (this.timelineContainer) this.timelineContainer.classList.add('hidden');
            if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
            if (this.emptyState) this.emptyState.classList.remove('hidden');
            return;
        }

        if (this.timelineContainer) this.timelineContainer.classList.remove('hidden');
        if (this.emptyState) this.emptyState.classList.add('hidden');

        // 記錄已經按 created_at 排序（由 getRecentTransactions 完成）

        // 渲染交易記錄
        this.renderTimeline(transactions, append);

        // 顯示或隱藏「載入更多」按鈕
        if (transactions.length >= this.transactionsLoaded) {
            if (this.loadMoreContainer) this.loadMoreContainer.classList.remove('hidden');
        } else {
            if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
        }
    }

    /**
     * 載入更多記錄
     */
    async loadMore() {
        this.transactionsLoaded += this.loadMoreCount;
        await this.loadTransactions(false);
    }

    /**
     * 渲染時間軸（對話式布局）
     * @param {Array} transactions - 交易列表
     * @param {boolean} append - 是否追加
     */
    renderTimeline(transactions, append = false) {
        if (!this.container) return;

        // 按日期分組
        const grouped = {};
        transactions.forEach(tx => {
            if (!grouped[tx.date]) grouped[tx.date] = [];
            grouped[tx.date].push(tx);
        });

        // 只顯示有花費的天，並按日期排序（最新的在上面）
        const datesWithTransactions = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        let html = '';
        datesWithTransactions.forEach((date, dateIndex) => {
            const txList = grouped[date];

            // 日期分隔線
            html += this.renderDateDivider(date, dateIndex === 0 && !append);

            // 該日期的所有交易（按時間排序）
            txList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            txList.forEach((tx) => {
                html += TransactionRenderer.renderTimelineItemWithTime(tx);
            });
        });

        if (append) {
            this.container.innerHTML += html;
        } else {
            this.container.innerHTML = html;
        }

        TransactionRenderer.bindClickEvents(this.container, this.onTransactionClickCallback);
    }

    /**
     * 渲染可愛的日期分隔線
     */
    renderDateDivider(dateStr, isFirst = false) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let displayText = '';

        // 判斷是今天、昨天還是其他
        if (this.isSameDay(date, today)) {
            displayText = '今天';
        } else if (this.isSameDay(date, yesterday)) {
            displayText = '昨天';
        } else {
            const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekday = weekdays[date.getDay()];
            displayText = `${month}月${day}日 ${weekday}`;
        }

        return `
            <div class="relative flex items-center justify-center ${isFirst ? 'mt-0' : 'mt-8'} mb-6">
                <!-- 左側裝飾線 -->
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/40 to-macaron-pink/60"></div>

                <!-- 日期標籤 -->
                <div class="relative mx-4 px-4 py-2 bg-gradient-to-br from-macaron-cream to-white rounded-full border-2 border-macaron-pink/30 shadow-watercolor-layered">
                    <div class="absolute -top-2 -left-1 text-lg">✨</div>
                    <div class="absolute -bottom-2 -right-1 text-lg">🌸</div>
                    <span class="font-hand font-bold text-soft-ink text-base">${displayText}</span>
                </div>

                <!-- 右側裝飾線 -->
                <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/60 via-macaron-pink/40 to-transparent"></div>
            </div>
        `;
    }

    /**
     * 判斷兩個日期是否為同一天
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * 刷新時間軸（在新增/編輯/刪除交易後）
     */
    async refresh() {
        this.transactionsLoaded = 30; // 重置為初始筆數
        await this.loadTransactions(false);
    }
}

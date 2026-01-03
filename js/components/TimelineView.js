// ==================== 時間軸視圖組件 ====================
// 來源: app.js 行 292-421
// 負責首頁時間軸的渲染和更新

import { TransactionRenderer } from './TransactionRenderer.js';
import { isSameDay } from '../utils/dateUtils.js';

export class TimelineView {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        this.container = document.getElementById('transactionList');
        this.emptyState = document.getElementById('emptyDayState');
        this.timelineContainer = document.getElementById('timelineContainer');
    }

    /**
     * 更新時間軸視圖
     */
    update() {
        let transactions;

        if (this.state.isRangeMode && this.state.rangeStart && this.state.rangeEnd) {
            // 區間模式
            const startStr = window.DataManager.formatDate(this.state.rangeStart);
            const endStr = window.DataManager.formatDate(this.state.rangeEnd);
            transactions = window.DataManager.getTransactionsByDateRange(startStr, endStr);
        } else {
            // 單日模式
            const dateStr = window.DataManager.formatDate(this.state.currentDayView);
            transactions = window.DataManager.getTransactionsByDate(dateStr);
        }

        // 更新日期顯示
        this.updateDayDisplay();

        // 更新時間軸
        if (transactions.length === 0) {
            if (this.timelineContainer) this.timelineContainer.classList.add('hidden');
            if (this.emptyState) this.emptyState.classList.remove('hidden');
            return;
        }

        if (this.timelineContainer) this.timelineContainer.classList.remove('hidden');
        if (this.emptyState) this.emptyState.classList.add('hidden');

        // 按創建時間排序（最新的在上）
        transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (this.container) {
            this.container.innerHTML = transactions.map((tx, index) =>
                TransactionRenderer.renderTimelineItem(tx, index)
            ).join('');

            // 綁定點擊事件
            TransactionRenderer.bindClickEvents(this.container, this.onTransactionClickCallback);
        }

        // 更新當天花費統計（只在非區間模式顯示）
        if (!this.state.isRangeMode) {
            this.updateDayExpenseStats(transactions);
        } else {
            const statsCard = document.getElementById('dayExpenseStats');
            if (statsCard) statsCard.classList.add('hidden');
        }
    }

    /**
     * 更新當天花費統計
     * @param {Array} transactions - 交易列表
     */
    updateDayExpenseStats(transactions) {
        const statsCard = document.getElementById('dayExpenseStats');
        const baobaoCard = document.getElementById('baobaoExpenseCard');
        const bubuCard = document.getElementById('bubuExpenseCard');

        let baobaoTotal = 0;
        let bubuTotal = 0;
        let total = 0;

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            total += amount;

            if (tx.payer === 'me') {
                baobaoTotal += amount;
            } else {
                bubuTotal += amount;
            }
        });

        // 只有當至少有一人有花費時才顯示
        if (baobaoTotal > 0 || bubuTotal > 0) {
            if (statsCard) statsCard.classList.remove('hidden');

            // 只顯示有花費的人
            if (baobaoTotal > 0) {
                if (baobaoCard) baobaoCard.classList.remove('hidden');
                const baobaoExpense = document.getElementById('baobaoExpense');
                if (baobaoExpense) baobaoExpense.textContent = `$${Math.round(baobaoTotal)}`;
            } else {
                if (baobaoCard) baobaoCard.classList.add('hidden');
            }

            if (bubuTotal > 0) {
                if (bubuCard) bubuCard.classList.remove('hidden');
                const bubuExpense = document.getElementById('bubuExpense');
                if (bubuExpense) bubuExpense.textContent = `$${Math.round(bubuTotal)}`;
            } else {
                if (bubuCard) bubuCard.classList.add('hidden');
            }

            const totalDayExpense = document.getElementById('totalDayExpense');
            if (totalDayExpense) totalDayExpense.textContent = `$${Math.round(total)}`;
        } else {
            if (statsCard) statsCard.classList.add('hidden');
        }
    }

    /**
     * 更新日期顯示
     */
    updateDayDisplay() {
        const today = new Date();
        const dayDisplay = document.getElementById('currentDayDisplay');
        const dateDisplay = document.getElementById('currentDateDisplay');

        if (!dayDisplay || !dateDisplay) return;

        // 判斷是否是今天、昨天、明天
        const isToday = isSameDay(this.state.currentDayView, today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = isSameDay(this.state.currentDayView, yesterday);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = isSameDay(this.state.currentDayView, tomorrow);

        if (isToday) {
            dayDisplay.textContent = '今天';
        } else if (isYesterday) {
            dayDisplay.textContent = '昨天';
        } else if (isTomorrow) {
            dayDisplay.textContent = '明天';
        } else {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            dayDisplay.textContent = weekdays[this.state.currentDayView.getDay()];
        }

        dateDisplay.textContent = `${this.state.currentDayView.getFullYear()} 年 ${this.state.currentDayView.getMonth() + 1} 月 ${this.state.currentDayView.getDate()} 日`;
    }

    /**
     * 切換日期
     * @param {number} delta - 日期偏移量
     */
    changeDay(delta) {
        this.state.currentDayView = new Date(this.state.currentDayView);
        this.state.currentDayView.setDate(this.state.currentDayView.getDate() + delta);
        this.update();
    }

    /**
     * 回到今天
     */
    goToToday() {
        this.state.currentDayView = new Date();
        this.state.isRangeMode = false;
        this.update();
    }
}

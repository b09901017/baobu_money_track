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

        // 折疊/展開狀態管理
        this.expandedDates = new Set(); // 儲存已展開的日期
        this.allExpanded = false; // 全域展開/收合狀態

        // 訂閱交易變更事件
        this.state.subscribe('transactions', (data) => this.handleTransactionsUpdate(data));
    }

    /**
     * 初始化時間軸
     */
    async init() {
        // 初始資料將由訂閱自動更新，無需主動載入
        // DataManager 會在 init() 時啟動監聽並推送初始資料
    }

    /**
     * 處理交易變更訂閱
     * @param {Object} data - { transactions, changes }
     */
    handleTransactionsUpdate(data) {
        const { transactions, changes } = data;

        // 檢查是否有記錄
        if (!transactions || transactions.length === 0) {
            if (this.timelineContainer) this.timelineContainer.classList.add('hidden');
            if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
            if (this.emptyState) this.emptyState.classList.remove('hidden');
            return;
        }

        if (this.timelineContainer) this.timelineContainer.classList.remove('hidden');
        if (this.emptyState) this.emptyState.classList.add('hidden');

        // 渲染交易記錄
        this.renderTimeline(transactions);

        // 判斷是否可以載入更多（如果已載入的交易數達到監聽起始日期）
        const listeningStartDate = window.DataManager.listeningStartDate;
        if (listeningStartDate) {
            const oldestTransaction = transactions[transactions.length - 1];
            if (oldestTransaction && oldestTransaction.date <= listeningStartDate) {
                if (this.loadMoreContainer) this.loadMoreContainer.classList.remove('hidden');
            } else {
                if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
            }
        }
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
     * 載入更多記錄（批次載入更早的交易）
     */
    async loadMore() {
        await window.DataManager.loadEarlierTransactions(this.loadMoreCount);
        // DataManager 會自動合併資料並透過訂閱通知更新
    }

    /**
     * 渲染時間軸（對話式布局 + 折疊/展開）
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

        // 初始化展開狀態（只在第一次渲染時）
        if (!append && this.expandedDates.size === 0) {
            const today = new Date().toISOString().split('T')[0];
            datesWithTransactions.forEach(date => {
                if (date === today) {
                    this.expandedDates.add(date); // 今天預設展開
                }
            });
        }

        let html = '';
        datesWithTransactions.forEach((date, dateIndex) => {
            const txList = grouped[date];
            const isExpanded = this.expandedDates.has(date);

            // 該日期的所有交易（按時間排序）
            txList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // 渲染日期區塊（精緻分隔線 + 摘要/展開內容）
            html += this.renderDateBlock(date, txList, isExpanded, dateIndex === 0 && !append);
        });

        if (append) {
            this.container.innerHTML += html;
        } else {
            this.container.innerHTML = html;
        }

        // 綁定摘要區塊點擊事件
        this.bindSummaryClicks();
        // 綁定交易項目點擊事件
        TransactionRenderer.bindClickEvents(this.container, this.onTransactionClickCallback);
    }

    /**
     * 渲染日期區塊（包含精緻分隔線、摘要卡片、交易列表）
     */
    renderDateBlock(date, txList, isExpanded, isFirst) {
        const stats = this.calculateDayStats(txList);

        // 預先生成交易列表 HTML
        const transactionsHTML = txList.map(tx => TransactionRenderer.renderTimelineItemWithTime(tx)).join('');

        return `
            <div class="date-group" data-date="${date}">
                ${this.renderDateDivider(date, isFirst)}

                <div class="day-summary-card ${isExpanded ? 'hidden' : ''}" data-date="${date}">
                    <div class="summary-content">
                        <div class="summary-item">
                            <span class="summary-label">共花</span>
                            <span class="summary-value total">$${stats.total}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-item">
                            <span class="summary-label">🎀 寶花</span>
                            <span class="summary-value">$${stats.baobaoSpent}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-item">
                            <span class="summary-label">🐾 步花</span>
                            <span class="summary-value">$${stats.bubuSpent}</span>
                        </div>
                    </div>
                    <div class="summary-expand-hint">
                        <span class="text-xs opacity-60">點擊展開 ✨</span>
                    </div>
                </div>

                <div class="date-transactions-wrapper ${isExpanded ? 'expanded' : 'collapsed'}">
                    ${transactionsHTML}
                </div>
            </div>
        `;
    }

    /**
     * 渲染精緻的日期分隔線（保留原本的 LINE 風格）
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
            <div class="relative flex items-center justify-center ${isFirst ? 'mt-0' : 'mt-6'} mb-4">
                <!-- 左側裝飾線 -->
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/20 to-macaron-pink/30"></div>

                <!-- 日期標籤 - 精緻軟萌 -->
                <div class="relative mx-3 px-3 py-1 bg-white/80 rounded-full border border-macaron-pink/20 shadow-sm backdrop-blur-sm">
                    <span class="font-hand text-soft-ink text-xs opacity-70">${displayText}</span>
                </div>

                <!-- 右側裝飾線 -->
                <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/30 via-macaron-pink/20 to-transparent"></div>
            </div>
        `;
    }

    /**
     * 計算當日統計（總花費、寶寶花費、步步花費）
     */
    calculateDayStats(txList) {
        let total = 0;
        let baobaoSpent = 0;
        let bubuSpent = 0;

        txList.forEach(tx => {
            total += tx.amount;
            if (tx.payer === 'baobao') {
                baobaoSpent += tx.amount;
            } else if (tx.payer === 'bubu') {
                bubuSpent += tx.amount;
            }
        });

        return {
            total,
            baobaoSpent,
            bubuSpent,
            count: txList.length
        };
    }

    /**
     * 綁定摘要卡片點擊事件
     */
    bindSummaryClicks() {
        const summaries = this.container.querySelectorAll('.day-summary-card');
        summaries.forEach(summary => {
            summary.addEventListener('click', (e) => {
                const date = summary.dataset.date;
                this.toggleDateExpansion(date);
            });
        });
    }

    /**
     * 切換日期展開/收合
     */
    toggleDateExpansion(date) {
        if (this.expandedDates.has(date)) {
            this.expandedDates.delete(date);
        } else {
            this.expandedDates.add(date);
        }

        // 重新渲染（保持目前的交易資料）
        const currentTransactions = this.state.getState('transactions')?.transactions || [];
        this.renderTimeline(currentTransactions);
    }

    /**
     * 切換全部展開/收合
     */
    toggleAllExpansion() {
        this.allExpanded = !this.allExpanded;

        const currentTransactions = this.state.getState('transactions')?.transactions || [];

        // 按日期分組
        const grouped = {};
        currentTransactions.forEach(tx => {
            if (!grouped[tx.date]) grouped[tx.date] = [];
            grouped[tx.date].push(tx);
        });

        const dates = Object.keys(grouped);

        if (this.allExpanded) {
            // 全部展開
            dates.forEach(date => this.expandedDates.add(date));
        } else {
            // 全部收合
            this.expandedDates.clear();
            // 保持今天展開
            const today = new Date().toISOString().split('T')[0];
            if (dates.includes(today)) {
                this.expandedDates.add(today);
            }
        }

        // 重新渲染
        this.renderTimeline(currentTransactions);
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
     * 注意：現在透過即時監聽自動更新，無需手動呼叫 refresh()
     */
    async refresh() {
        // 透過 onSnapshot 即時監聽，交易變更會自動推送
        // 此方法保留以維持相容性，但實際上不執行任何操作
    }
}

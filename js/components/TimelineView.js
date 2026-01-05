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

        // 時間軸模式：'detail' | 'summary'
        this.timelineMode = 'detail';
    }

    /**
     * 更新時間軸視圖
     */
    async update() {
        let transactions;

        if (this.state.isRangeMode && this.state.rangeStart && this.state.rangeEnd) {
            // 區間模式
            const startStr = window.DataManager.formatDate(this.state.rangeStart);
            const endStr = window.DataManager.formatDate(this.state.rangeEnd);
            transactions = await window.DataManager.getTransactionsByDateRange(startStr, endStr);
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

        // 按日期和時間排序
        transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // 根據模式渲染
        if (this.timelineMode === 'detail') {
            this.renderDetailMode(transactions);
        } else {
            this.renderSummaryMode(transactions);
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

    /**
     * 切換時間軸模式
     */
    toggleMode(mode) {
        this.timelineMode = mode;

        // 更新按鈕樣式
        const detailBtn = document.getElementById('btnTimelineDetail');
        const summaryBtn = document.getElementById('btnTimelineSummary');

        if (detailBtn && summaryBtn) {
            if (mode === 'detail') {
                detailBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-watercolor-layered');
                detailBtn.classList.remove('bg-white/60', 'text-soft-ink');
                summaryBtn.classList.remove('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-watercolor-layered');
                summaryBtn.classList.add('bg-white/60', 'text-soft-ink');
            } else {
                summaryBtn.classList.add('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-watercolor-layered');
                summaryBtn.classList.remove('bg-white/60', 'text-soft-ink');
                detailBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-watercolor-layered');
                detailBtn.classList.add('bg-white/60', 'text-soft-ink');
            }
        }

        this.update();
    }

    /**
     * 渲染詳情模式（按日期分組，顯示所有交易）
     */
    renderDetailMode(transactions) {
        if (!this.container) return;

        // 按日期分組
        const grouped = {};
        transactions.forEach(tx => {
            if (!grouped[tx.date]) grouped[tx.date] = [];
            grouped[tx.date].push(tx);
        });

        // 只顯示有花費的天
        const datesWithTransactions = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        let html = '';
        datesWithTransactions.forEach((date, dateIndex) => {
            const txList = grouped[date];

            // 日期分隔線
            html += this.renderDateDivider(date, dateIndex === 0);

            // 該日期的所有交易
            txList.forEach((tx, index) => {
                html += TransactionRenderer.renderTimelineItemWithTime(tx, index);
            });
        });

        this.container.innerHTML = html;
        TransactionRenderer.bindClickEvents(this.container, this.onTransactionClickCallback);
    }

    /**
     * 渲染摘要模式（每天一張卡片，顯示總結）
     */
    renderSummaryMode(transactions) {
        if (!this.container) return;

        // 按日期分組
        const grouped = {};
        transactions.forEach(tx => {
            if (!grouped[tx.date]) grouped[tx.date] = [];
            grouped[tx.date].push(tx);
        });

        // 只顯示有花費的天
        const datesWithTransactions = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        let html = '';
        datesWithTransactions.forEach((date, dateIndex) => {
            const txList = grouped[date];

            // 計算統計
            let baobaoTotal = 0;
            let bubuTotal = 0;

            txList.forEach(tx => {
                const amount = parseFloat(tx.amount);
                if (tx.payer === 'me') {
                    baobaoTotal += amount;
                } else {
                    bubuTotal += amount;
                }
            });

            const total = baobaoTotal + bubuTotal;

            // 日期分隔線
            html += this.renderDateDivider(date, dateIndex === 0);

            // 摘要卡片
            html += this.renderDaySummaryCard(date, baobaoTotal, bubuTotal, total, txList.length);
        });

        this.container.innerHTML = html;

        // 綁定摘要卡片的點擊事件（展開詳情）
        this.bindSummaryCardEvents(grouped);
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
     * 渲染每日摘要卡片
     */
    renderDaySummaryCard(date, baobaoTotal, bubuTotal, total, count) {
        return `
            <div class="relative mb-6 summary-card cursor-pointer" data-date="${date}">
                <div class="bg-gradient-to-br from-white to-macaron-cream/30 rounded-2xl p-5 shadow-watercolor-layered border-2 border-macaron-pink/20 hover:shadow-floating hover:scale-[1.02] transition-all">
                    <!-- 交易筆數標記 -->
                    <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-antique-gold to-shimmer-gold rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <span class="text-xs font-bold text-white">${count}</span>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <!-- 寶寶 -->
                        <div class="text-center ${baobaoTotal === 0 ? 'opacity-50' : ''}">
                            <div class="text-xs text-warm-brown/70 mb-1 font-hand">寶寶付</div>
                            <div class="text-xl font-display font-bold ${baobaoTotal > 0 ? 'text-macaron-rose' : 'text-warm-brown/40'}">$${Math.round(baobaoTotal)}</div>
                        </div>

                        <!-- 步步 -->
                        <div class="text-center ${bubuTotal === 0 ? 'opacity-50' : ''}">
                            <div class="text-xs text-warm-brown/70 mb-1 font-hand">步步付</div>
                            <div class="text-xl font-display font-bold ${bubuTotal > 0 ? 'text-blue-600' : 'text-warm-brown/40'}">$${Math.round(bubuTotal)}</div>
                        </div>

                        <!-- 總計 -->
                        <div class="text-center">
                            <div class="text-xs text-warm-brown/70 mb-1 font-hand">共花費</div>
                            <div class="text-xl font-display font-bold text-[#E27D60]">$${Math.round(total)}</div>
                        </div>
                    </div>

                    <!-- 點擊提示 -->
                    <div class="mt-3 text-center text-xs text-warm-brown/50 font-hand">點擊查看詳情 ➜</div>
                </div>
            </div>
        `;
    }

    /**
     * 綁定摘要卡片事件（點擊展開詳情）
     */
    bindSummaryCardEvents(grouped) {
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                if (date && grouped[date]) {
                    // 暫時切換到詳情模式來查看該天的交易
                    // 或者可以打開一個模態框顯示詳情
                    this.showDayDetail(date, grouped[date]);
                }
            });
        });
    }

    /**
     * 顯示某天的詳情（在摘要模式點擊時）
     */
    showDayDetail(date, transactions) {
        // 這裡可以彈出模態框或暫時切換顯示
        // 簡單實作：切換到詳情模式並聚焦到該日期
        this.toggleMode('detail');
    }

    /**
     * 判斷兩個日期是否為同一天
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

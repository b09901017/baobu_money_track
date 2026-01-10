// ==================== 時間軸視圖組件（扁平流式階層）====================
// 扁平化 LINE 風格：Year > Month > Week > Day
// 支援結算分割與折疊/展開

import { TransactionRenderer } from './TransactionRenderer.js';
import { TimelineGrouper } from '../utils/TimelineGrouper.js';

export class TimelineView {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        this.container = document.getElementById('transactionList');
        this.emptyState = document.getElementById('emptyTimelineState');
        this.timelineContainer = document.getElementById('timelineContainer');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');

        // 🆕 階層式展開狀態管理
        this.expandedYears = new Set();   // 已展開的年份
        this.expandedMonths = new Set();  // 已展開的月份 (格式: "2025-3")
        this.expandedWeeks = new Set();   // 已展開的週 (格式: "2025-3-10")
        this.expandedDays = new Set();    // 已展開的日期 (格式: "2025-03-15")

        // 🆕 三階段展開模式：'default' | 'half' | 'full'
        this.expansionMode = 'default';

        // 快取最後收到的交易列表
        this.cachedTransactions = [];

        // 快取階層式結構
        this.hierarchyCache = [];

        // 訂閱交易變更事件
        this.state.subscribe('transactions', (data) => this.handleTransactionsUpdate(data));
    }

    /**
     * 初始化時間軸
     */
    async init() {
        // 初始資料將由訂閱自動更新
    }

    /**
     * 處理交易變更訂閱
     */
    handleTransactionsUpdate(data) {
        const { transactions, changes } = data;

        this.cachedTransactions = transactions || [];

        if (!transactions || transactions.length === 0) {
            if (this.timelineContainer) this.timelineContainer.classList.add('hidden');
            if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
            if (this.emptyState) this.emptyState.classList.remove('hidden');
            return;
        }

        if (this.timelineContainer) this.timelineContainer.classList.remove('hidden');
        if (this.emptyState) this.emptyState.classList.add('hidden');

        // 初始化展開狀態（只在首次載入時）
        if (this.expandedYears.size === 0) {
            this.initializeDefaultExpansion(transactions);
        }

        // 渲染扁平流式時間軸
        this.renderFlatTimeline(transactions);

        // 隱藏「載入更多」按鈕
        if (this.loadMoreContainer) {
            this.loadMoreContainer.classList.add('hidden');
        }
    }

    /**
     * 🆕 初始化預設展開狀態（智能階層式折疊）
     * - 今天和昨天：展開到當天花費對話
     * - 當週其他天：顯示當天摘要（收合）
     * - 當月其他週：顯示當週摘要（收合）
     * - 當年其他月：顯示當月摘要（收合）
     * - 其他年：顯示年摘要（收合）
     */
    initializeDefaultExpansion(transactions) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentWeek = TimelineGrouper.getWeekNumber(now);

        // 計算今天和昨天的日期
        const today = this.formatDate(now);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.formatDate(yesterday);

        // 1. 展開當年
        this.expandedYears.add(currentYear);

        // 2. 展開當月
        this.expandedMonths.add(`${currentYear}-${currentMonth}`);

        // 3. 展開當週
        this.expandedWeeks.add(`${currentYear}-${currentMonth}-${currentWeek}`);

        // 4. 只展開今天和昨天的交易對話
        this.expandedDays.add(today);
        this.expandedDays.add(yesterdayStr);

        console.log('📅 智能折疊初始化:', {
            展開年份: currentYear,
            展開月份: `${currentYear}-${currentMonth}`,
            展開週: `${currentYear}-${currentMonth}-${currentWeek}`,
            展開日期: [today, yesterdayStr]
        });
    }

    /**
     * 🆕 渲染扁平流式時間軸（LINE 風格）
     */
    renderFlatTimeline(transactions) {
        if (!this.container) return;

        // 使用 TimelineGrouper 轉換為階層結構
        this.hierarchyCache = TimelineGrouper.groupByHierarchy(transactions);

        let html = '';

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentWeek = TimelineGrouper.getWeekNumber(now);

        // 遍歷每個年份
        this.hierarchyCache.forEach((yearData, yearIndex) => {
            const { year, months, summary } = yearData;
            const isYearExpanded = this.expandedYears.has(year);
            const isCurrentYear = year === currentYear;

            // 檢查是否需要並排顯示（當年且展開）
            const shouldStackLabels = isCurrentYear && isYearExpanded;

            if (shouldStackLabels) {
                // 🆕 並排模式：渲染年/月/週標籤在同一行
                html += this.renderStackedLabels(yearData, currentYear, currentMonth, currentWeek);
            } else {
                // 原有模式：年份標籤
                html += this.renderDivider(year, '年', summary, `year-${year}`, false);

                // 年份總結卡片（收合時顯示）
                if (!isYearExpanded) {
                    html += this.renderSummaryCard(summary, `year-${year}`, 'year');
                } else {
                    // 展開：渲染所有月份
                    months.forEach((monthData) => {
                        html += this.renderMonthFlow(monthData, year, false);
                    });
                }
            }
        });

        this.container.innerHTML = html;

        // 綁定事件
        this.bindFlatEvents();
        TransactionRenderer.bindClickEvents(this.container, this.onTransactionClickCallback);
    }

    /**
     * 🆕 渲染並排標籤（年/月/週）
     */
    renderStackedLabels(yearData, currentYear, currentMonth, currentWeek) {
        const { year, months } = yearData;
        let html = '';

        // 找到當月資料
        const currentMonthData = months.find(m => m.month === currentMonth);

        if (currentMonthData && this.expandedMonths.has(`${currentYear}-${currentMonth}`)) {
            // 找到當週資料
            const currentWeekData = currentMonthData.weeks.find(w => w.weekNumber === currentWeek);

            if (currentWeekData && this.expandedWeeks.has(`${currentYear}-${currentMonth}-${currentWeek}`)) {
                // 🎯 三層都展開：並排顯示年/月/週
                html += `
                    <div class="stacked-labels-container">
                        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/20 to-macaron-pink/30"></div>
                        <div class="stacked-labels">
                            ${this.renderDivider(year, '年', yearData.summary, `year-${year}`, true)}
                            ${this.renderDivider(currentMonth, '月', currentMonthData.summary, `month-${currentYear}-${currentMonth}`, true)}
                            ${this.renderDivider(currentWeek, '週', currentWeekData.summary, `week-${currentYear}-${currentMonth}-${currentWeek}`, true)}
                        </div>
                        <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/30 via-macaron-pink/20 to-transparent"></div>
                    </div>
                `;

                // 渲染當週的所有日期
                currentWeekData.days.forEach((dayData) => {
                    html += this.renderDayFlow(dayData);
                });

                // 渲染當月其他週
                currentMonthData.weeks.forEach((weekData) => {
                    if (weekData.weekNumber !== currentWeek) {
                        html += this.renderWeekFlow(weekData, currentYear, currentMonth, false);
                    }
                });

                // 渲染當年其他月份
                months.forEach((monthData) => {
                    if (monthData.month !== currentMonth) {
                        html += this.renderMonthFlow(monthData, currentYear, false);
                    }
                });
            } else {
                // 只有年/月展開：並排顯示年/月
                html += `
                    <div class="stacked-labels-container">
                        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/20 to-macaron-pink/30"></div>
                        <div class="stacked-labels">
                            ${this.renderDivider(year, '年', yearData.summary, `year-${year}`, true)}
                            ${this.renderDivider(currentMonth, '月', currentMonthData.summary, `month-${currentYear}-${currentMonth}`, true)}
                        </div>
                        <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/30 via-macaron-pink/20 to-transparent"></div>
                    </div>
                `;

                // 渲染當月所有週
                currentMonthData.weeks.forEach((weekData) => {
                    html += this.renderWeekFlow(weekData, currentYear, currentMonth, false);
                });

                // 渲染當年其他月份
                months.forEach((monthData) => {
                    if (monthData.month !== currentMonth) {
                        html += this.renderMonthFlow(monthData, currentYear, false);
                    }
                });
            }
        } else {
            // 只有年展開：單獨顯示年標籤
            html += this.renderDivider(year, '年', yearData.summary, `year-${year}`, false);

            // 渲染所有月份
            months.forEach((monthData) => {
                html += this.renderMonthFlow(monthData, year, false);
            });
        }

        return html;
    }

    /**
     * 渲染月份流（包含週和日期）
     */
    renderMonthFlow(monthData, year, skipStacking = false) {
        const { month, weeks, settlementBefore, summary } = monthData;
        const monthKey = `${year}-${month}`;
        const isMonthExpanded = this.expandedMonths.has(monthKey);

        let html = '';

        // 🔮 結算分隔線
        if (settlementBefore) {
            html += this.renderSettlementDivider(settlementBefore);
        }

        // 月份標籤（如果不是並排模式）
        if (!skipStacking) {
            html += this.renderDivider(month, '月', summary, `month-${monthKey}`, false);
        }

        // 月份總結卡片（收合時顯示）
        if (!isMonthExpanded) {
            html += this.renderSummaryCard(summary, `month-${monthKey}`, 'month');
        } else {
            // 展開：渲染所有週
            weeks.forEach((weekData) => {
                html += this.renderWeekFlow(weekData, year, month, false);
            });
        }

        return html;
    }

    /**
     * 渲染週流（包含日期）
     */
    renderWeekFlow(weekData, year, month, skipStacking = false) {
        const { weekNumber, days, settlementBefore, summary } = weekData;
        const weekKey = `${year}-${month}-${weekNumber}`;
        const isWeekExpanded = this.expandedWeeks.has(weekKey);

        let html = '';

        // 🔮 結算分隔線
        if (settlementBefore) {
            html += this.renderSettlementDivider(settlementBefore);
        }

        // 週標籤（如果不是並排模式）
        if (!skipStacking) {
            html += this.renderDivider(weekNumber, '週', summary, `week-${weekKey}`, false);
        }

        // 週總結卡片（收合時顯示）
        if (!isWeekExpanded) {
            html += this.renderSummaryCard(summary, `week-${weekKey}`, 'week');
        } else {
            // 展開：渲染所有日期
            days.forEach((dayData) => {
                html += this.renderDayFlow(dayData);
            });
        }

        return html;
    }

    /**
     * 渲染日期流（原有邏輯）
     */
    renderDayFlow(dayData) {
        const { date, transactions, summary } = dayData;
        const isExpanded = this.expandedDays.has(date);

        // 預先生成交易列表 HTML
        const transactionsHTML = transactions
            .map(tx => TransactionRenderer.renderTimelineItemWithTime(tx))
            .join('');

        // 生成摘要卡片內容
        let summaryHTML = this.generateDaySummaryHTML(summary);

        return `
            <div class="flat-day-group" data-date="${date}">
                ${this.renderDateDivider(date)}

                <div class="day-summary-card ${isExpanded ? 'hidden' : ''}" data-date="${date}">
                    ${summaryHTML}
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
     * 🆕 渲染統一的精緻小標籤（年/月/週）- 支援並排
     */
    renderDivider(value, unit, summary, dataKey, isStacked = false) {
        let displayText = '';
        if (unit === '年') {
            displayText = `${value} 年`;
        } else if (unit === '月') {
            displayText = `${value}月`;
        } else if (unit === '週') {
            displayText = `第 ${value} 週`;
        }

        // 如果是並排模式，使用簡化版標籤
        if (isStacked) {
            return `
                <div class="hierarchy-divider-label-inline relative px-3 py-1 bg-white/90 rounded-full border-2 border-macaron-pink/30 shadow-md backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-macaron-pink/10 hover:border-macaron-pink/50 hover:shadow-lg" data-key="${dataKey}">
                    <span class="font-hand text-soft-ink text-sm font-semibold opacity-80">${displayText}</span>
                </div>
            `;
        }

        // 原有的完整版標籤
        return `
            <div class="relative flex items-center justify-center mt-6 mb-4">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/20 to-macaron-pink/30"></div>
                <div class="hierarchy-divider-label relative mx-3 px-4 py-1.5 bg-white/90 rounded-full border-2 border-macaron-pink/30 shadow-md backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-macaron-pink/10 hover:border-macaron-pink/50 hover:shadow-lg" data-key="${dataKey}">
                    <span class="font-hand text-soft-ink text-sm font-semibold opacity-80">${displayText}</span>
                </div>
                <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/30 via-macaron-pink/20 to-transparent"></div>
            </div>
        `;
    }

    /**
     * 🆕 渲染總結卡片（年/月/週收合時顯示）
     */
    renderSummaryCard(summary, dataKey, type) {
        let summaryHTML = '';
        if (summary.debtInfo) {
            summaryHTML = `
                <div class="bookmark-card">
                    <div class="bookmark-main">
                        ${summary.debtInfo.debtor}欠${summary.debtInfo.creditor} <span class="bookmark-amount">$${summary.debtInfo.amount.toFixed(0)}</span>
                    </div>
                    <div class="bookmark-stats">
                        <div class="stat-col">
                            <div class="stat-label">共花</div>
                            <div class="stat-value">$${summary.total.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">寶付</div>
                            <div class="stat-value">$${summary.baobaoSpent.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">步付</div>
                            <div class="stat-value">$${summary.bubuSpent.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            summaryHTML = `
                <div class="bookmark-card settled">
                    <div class="bookmark-main">
                        <span class="settled-icon">✨</span> 已結清
                    </div>
                    <div class="bookmark-stats">
                        <div class="stat-col">
                            <div class="stat-label">共花</div>
                            <div class="stat-value">$${summary.total.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">寶付</div>
                            <div class="stat-value">$${summary.baobaoSpent.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">步付</div>
                            <div class="stat-value">$${summary.bubuSpent.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="hierarchy-summary-card" data-key="${dataKey}">
                ${summaryHTML}
                <div class="summary-expand-hint">
                    <span class="text-xs opacity-60">點擊展開 ✨</span>
                </div>
            </div>
        `;
    }

    /**
     * 生成日期摘要 HTML
     */
    generateDaySummaryHTML(summary) {
        if (summary.debtInfo) {
            return `
                <div class="bookmark-card">
                    <div class="bookmark-main">
                        ${summary.debtInfo.debtor}欠${summary.debtInfo.creditor} <span class="bookmark-amount">$${summary.debtInfo.amount.toFixed(0)}</span>
                    </div>
                    <div class="bookmark-stats">
                        <div class="stat-col">
                            <div class="stat-label">共花</div>
                            <div class="stat-value">$${summary.total.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">寶付</div>
                            <div class="stat-value">$${summary.baobaoSpent.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">步付</div>
                            <div class="stat-value">$${summary.bubuSpent.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bookmark-card settled">
                    <div class="bookmark-main">
                        <span class="settled-icon">✨</span> 已結清
                    </div>
                    <div class="bookmark-stats">
                        <div class="stat-col">
                            <div class="stat-label">共花</div>
                            <div class="stat-value">$${summary.total.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">寶付</div>
                            <div class="stat-value">$${summary.baobaoSpent.toFixed(0)}</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-label">步付</div>
                            <div class="stat-value">$${summary.bubuSpent.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 渲染結算分隔線
     */
    renderSettlementDivider(date) {
        const formattedDate = this.formatSettlementDate(date);
        return `
            <div class="settlement-divider">
                <div class="settlement-line"></div>
                <div class="settlement-label">
                    <span class="settlement-icon">✨</span>
                    <span class="settlement-text">結清於 ${formattedDate}</span>
                    <span class="settlement-icon">✨</span>
                </div>
                <div class="settlement-line"></div>
            </div>
        `;
    }

    /**
     * 渲染日期分隔線（保留原邏輯）
     */
    renderDateDivider(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let displayText = '';

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
            <div class="relative flex items-center justify-center mt-6 mb-4">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-macaron-pink/20 to-macaron-pink/30"></div>
                <div class="date-divider-label relative mx-3 px-3 py-1 bg-white/80 rounded-full border border-macaron-pink/20 shadow-sm backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-macaron-pink/10 hover:border-macaron-pink/40 hover:shadow-md" data-date="${dateStr}">
                    <span class="font-hand text-soft-ink text-xs opacity-70">${displayText}</span>
                </div>
                <div class="flex-1 h-px bg-gradient-to-r from-macaron-pink/30 via-macaron-pink/20 to-transparent"></div>
            </div>
        `;
    }

    /**
     * 🆕 綁定扁平流式事件
     */
    bindFlatEvents() {
        // 綁定年/月/週標籤點擊（包含並排標籤）
        const hierarchyLabels = this.container.querySelectorAll('.hierarchy-divider-label, .hierarchy-divider-label-inline');
        hierarchyLabels.forEach(label => {
            label.addEventListener('click', (e) => {
                const key = label.dataset.key;
                this.toggleHierarchy(key);
            });
        });

        // 綁定年/月/週總結卡片點擊
        const hierarchySummaries = this.container.querySelectorAll('.hierarchy-summary-card');
        hierarchySummaries.forEach(card => {
            card.addEventListener('click', (e) => {
                const key = card.dataset.key;
                this.toggleHierarchy(key);
            });
        });

        // 綁定日期標籤和摘要卡片
        const summaries = this.container.querySelectorAll('.day-summary-card');
        summaries.forEach(summary => {
            summary.addEventListener('click', (e) => {
                const date = summary.dataset.date;
                this.toggleDay(date);
            });
        });

        const dateLabels = this.container.querySelectorAll('.date-divider-label');
        dateLabels.forEach(label => {
            label.addEventListener('click', (e) => {
                const date = label.dataset.date;
                this.toggleDay(date);
            });
        });
    }

    /**
     * 🆕 切換階層展開/收合（統一處理年/月/週）
     */
    toggleHierarchy(key) {
        if (key.startsWith('year-')) {
            const year = parseInt(key.replace('year-', ''));
            if (this.expandedYears.has(year)) {
                this.expandedYears.delete(year);
            } else {
                this.expandedYears.add(year);
            }
        } else if (key.startsWith('month-')) {
            const monthKey = key.replace('month-', '');
            if (this.expandedMonths.has(monthKey)) {
                this.expandedMonths.delete(monthKey);
            } else {
                this.expandedMonths.add(monthKey);
            }
        } else if (key.startsWith('week-')) {
            const weekKey = key.replace('week-', '');
            if (this.expandedWeeks.has(weekKey)) {
                this.expandedWeeks.delete(weekKey);
            } else {
                this.expandedWeeks.add(weekKey);
            }
        }

        this.renderFlatTimeline(this.cachedTransactions);
    }

    /**
     * 切換日期展開/收合
     */
    toggleDay(date) {
        if (this.expandedDays.has(date)) {
            this.expandedDays.delete(date);
        } else {
            this.expandedDays.add(date);
        }
        this.renderFlatTimeline(this.cachedTransactions);
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
     * 格式化日期為 YYYY-MM-DD
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 格式化結算日期顯示
     */
    formatSettlementDate(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}/${month}/${day}`;
    }

    /**
     * 🆕 三階段切換展開狀態（預設 → 半開 → 全開 → 預設...）
     * - 預設模式：今天/昨天展開，當週其他天摘要，當月其他週摘要，當年其他月摘要，其他年摘要
     * - 半開模式：最近3個月的所有日期都展開，其他月份和年份維持摘要
     * - 全開模式：最近半年的所有日期都展開，其他月份和年份維持摘要
     */
    toggleAllExpansion() {
        // 狀態循環：default → half → full → default
        if (this.expansionMode === 'default') {
            this.setExpansionMode('half');
        } else if (this.expansionMode === 'half') {
            this.setExpansionMode('full');
        } else {
            this.setExpansionMode('default');
        }

        // 重新渲染時間軸
        this.renderFlatTimeline(this.cachedTransactions);

        return this.expansionMode;
    }

    /**
     * 🆕 設定展開模式並更新展開狀態
     */
    setExpansionMode(mode) {
        this.expansionMode = mode;

        // 清空所有展開狀態
        this.expandedYears.clear();
        this.expandedMonths.clear();
        this.expandedWeeks.clear();
        this.expandedDays.clear();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentWeek = TimelineGrouper.getWeekNumber(now);

        if (mode === 'default') {
            // 預設模式：智能折疊
            this.initializeDefaultExpansion(this.cachedTransactions);
        } else if (mode === 'half') {
            // 半開模式：最近3個月全部展開
            this.expandRecentMonths(3, currentYear, currentMonth);
        } else if (mode === 'full') {
            // 全開模式：最近6個月全部展開
            this.expandRecentMonths(6, currentYear, currentMonth);
        }

        console.log(`🔄 切換展開模式: ${mode}`, {
            展開年份: [...this.expandedYears],
            展開月份: [...this.expandedMonths],
            展開週: [...this.expandedWeeks],
            展開日期數: this.expandedDays.size
        });
    }

    /**
     * 🆕 展開最近 N 個月的所有日期
     */
    expandRecentMonths(monthsCount, currentYear, currentMonth) {
        const monthsToExpand = [];

        // 計算需要展開的月份
        for (let i = 0; i < monthsCount; i++) {
            let year = currentYear;
            let month = currentMonth - i;

            // 處理跨年
            while (month <= 0) {
                month += 12;
                year -= 1;
            }

            monthsToExpand.push({ year, month });
        }

        // 展開對應的年/月/週/日
        this.hierarchyCache.forEach(yearData => {
            const { year, months } = yearData;

            const shouldExpandYear = monthsToExpand.some(m => m.year === year);
            if (shouldExpandYear) {
                this.expandedYears.add(year);

                months.forEach(monthData => {
                    const { month, weeks } = monthData;
                    const monthKey = `${year}-${month}`;

                    const shouldExpandMonth = monthsToExpand.some(m => m.year === year && m.month === month);
                    if (shouldExpandMonth) {
                        this.expandedMonths.add(monthKey);

                        weeks.forEach(weekData => {
                            const { weekNumber, days } = weekData;
                            const weekKey = `${year}-${month}-${weekNumber}`;
                            this.expandedWeeks.add(weekKey);

                            days.forEach(dayData => {
                                this.expandedDays.add(dayData.date);
                            });
                        });
                    }
                });
            }
        });
    }

    /**
     * 刷新時間軸（保留相容性）
     */
    async refresh() {
        // 透過 onSnapshot 即時監聽
    }

    /**
     * 載入更多記錄（保留但不再使用）
     */
    async loadMore() {
        console.log('⚠️ 已載入完整歷史記錄');
    }
}

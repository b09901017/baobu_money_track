// ==================== 分析頁面控制器 ====================
// 來源: app.js 行 1108-1255

import { TransactionRenderer } from '../components/TransactionRenderer.js';
import { PieChart } from '../components/PieChart.js';
import { BarChart } from '../components/BarChart.js';
import TrendChart from '../components/TrendChart.js';
import VerticalBarChart from '../components/VerticalBarChart.js';

export class AnalyticsPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        // 視圖模式：'bar' | 'pie'
        this.categoryViewMode = 'bar';

        // 統計模式：'all' | 'me' | 'partner'
        this.statMode = 'all';

        // 篩選狀態（支援多重篩選）
        this.currentFilter = {
            payer: null,    // 'me' | 'partner' | null
            category: null  // 分類名稱 | null
        };

        // 當前週期（用於重新計算）
        this.currentPeriod = 'month';

        // ========== 趨勢分析參數（v5.9.0 新增）==========
        this.trendSettings = {
            range: 7,               // 日期範圍（天數）
            granularity: 'daily',   // 時間粒度 ('daily' | 'weekly' | 'monthly')
            category: null,         // 類別篩選（null = 全部）
            chartType: 'line',      // 圖表類型 ('line' | 'bar')
            currentTab: 'stats'     // 當前 Tab ('stats' | 'trend')
        };

        // 圖表實例
        this.trendLineChart = null;
        this.trendBarChart = null;

        // 儲存當前趨勢資料（用於全螢幕顯示）v5.9.0 新增
        this.currentTrendData = null;
        this.currentLegends = null;

        // 訂閱交易變更（新增）
        this.state.subscribe('transactions', (data) => {
            console.log('📊 AnalyticsPage 收到交易更新');
            // 重新計算統計（保持當前篩選條件）
            if (this.trendSettings.currentTab === 'stats') {
                this.update(this.currentPeriod);
            } else {
                this.updateTrendAnalysis();
            }
        });

        console.log('📊 AnalyticsPage 已建立並訂閱交易變更');
    }

    /**
     * 更新趨勢分析類別按鈕（當新增自訂類別時調用）
     */
    updateTrendCategoryButtons() {
        const customCategories = window.DataManager.getCustomCategories();
        const moreCategories = document.getElementById('trendMoreCategories');

        if (!moreCategories) return;

        // 取得目前已存在的類別
        const existingCategories = new Set(
            Array.from(document.querySelectorAll('.trend-category-btn'))
                .map(btn => btn.dataset.category)
        );

        // 新增不存在的自訂類別
        customCategories.forEach(category => {
            if (!existingCategories.has(category.name)) {
                const button = document.createElement('button');
                button.className = 'trend-category-btn px-3 py-1.5 rounded-full font-hand font-bold text-xs transition-all text-soft-ink bg-white border border-macaron-pink/30 hover:bg-macaron-pink/10 active:scale-95';
                button.dataset.category = category.name;
                button.innerHTML = `${category.icon || '🏷️'} ${category.name}`;

                // 綁定點擊事件
                button.addEventListener('click', () => {
                    this.changeTrendCategory(category.name);
                });

                moreCategories.appendChild(button);
            }
        });

        // 重新計算展開狀態的高度
        const isExpanded = moreCategories.style.maxHeight && moreCategories.style.maxHeight !== '0px';
        if (isExpanded) {
            moreCategories.style.maxHeight = moreCategories.scrollHeight + 'px';
        }
    }

    async update(period = 'month') {
        // 儲存當前週期（用於交易變更時重新計算）
        this.currentPeriod = period;

        const { startDate, endDate } = this.getDateRange(period);
        const transactions = await window.DataManager.getTransactionsByDateRange(startDate, endDate);

        // 儲存完整交易列表（用於篩選）
        this.allTransactions = transactions;

        // 更新支出統計（使用絕對角色，不分誰登入）
        const stats = window.DataManager.getExpenseStats(transactions);
        const totalExpenseEl = document.getElementById('totalExpense');
        const baobaoExpenseEl = document.getElementById('myExpense');      // HTML 中對應寶寶
        const bubuExpenseEl = document.getElementById('partnerExpense');   // HTML 中對應步步

        if (totalExpenseEl) totalExpenseEl.textContent = `$${Math.round(stats.totalExpense)}`;
        if (baobaoExpenseEl) baobaoExpenseEl.textContent = `$${Math.round(stats.baobaoExpense)}`;
        if (bubuExpenseEl) bubuExpenseEl.textContent = `$${Math.round(stats.bubuExpense)}`;

        // 更新分類統計（根據當前統計模式）
        this.updateCategoryStats();

        // 清除篩選
        this.currentFilter = { payer: null, category: null };

        // 初始不顯示交易明細
        this.renderEmptyTransactionList();
    }

    /**
     * 更新分類統計（根據統計模式）
     */
    updateCategoryStats() {
        let transactions = this.allTransactions;

        // 根據統計模式篩選（使用絕對角色）
        if (this.statMode === 'baobao') {
            transactions = transactions.filter(tx => tx.payer === 'baobao');
        } else if (this.statMode === 'bubu') {
            transactions = transactions.filter(tx => tx.payer === 'bubu');
        }

        const categoryStats = window.DataManager.getCategoryStats(transactions);
        this.renderCategoryStats(categoryStats);
    }

    /**
     * 切換統計模式
     */
    toggleStatMode(mode) {
        this.statMode = mode;

        // 更新按鈕樣式
        document.querySelectorAll('.stat-mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                btn.classList.remove('text-soft-ink');
            } else {
                btn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                btn.classList.add('text-soft-ink');
            }
        });

        // 重新計算分類統計
        this.updateCategoryStats();

        // 如果有篩選，重新應用
        if (this.currentFilter.category || this.currentFilter.payer) {
            this.applyCurrentFilter();
        }
    }

    renderCategoryStats(stats) {
        // 儲存統計資料和顏色
        this.categoryStats = stats;
        this.categoryColors = ['#FFB7B2', '#C7CEEA', '#E2F0CB', '#E0BBE4', '#FFC7D8', '#A8D8FF'];

        // 根據當前視圖模式渲染
        if (this.categoryViewMode === 'bar') {
            this.renderCategoryBar();
        } else {
            this.renderCategoryPie();
        }
    }

    /**
     * 渲染分類長條圖視圖
     */
    renderCategoryBar() {
        const container = document.getElementById('categoryBarChart');
        if (!container) return;

        const stats = this.categoryStats;
        const colors = this.categoryColors;

        if (!stats || stats.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <span class="text-4xl">📊</span>
                    <p class="text-warm-brown/60 font-hand mt-2">暫無分類資料</p>
                </div>
            `;
            return;
        }

        // 渲染長條圖
        container.innerHTML = BarChart.render(stats, colors);

        // 綁定點擊事件
        BarChart.bindEvents(container, (category) => {
            this.filterByCategory(category);
        });
    }

    /**
     * 渲染分類圓餅圖視圖
     */
    renderCategoryPie() {
        const chartContainer = document.getElementById('categoryPieChart');
        const legendContainer = document.getElementById('categoryLegend');

        if (!chartContainer || !legendContainer) return;

        const stats = this.categoryStats;
        const colors = this.categoryColors;

        if (!stats || stats.length === 0) {
            chartContainer.innerHTML = `
                <div class="text-center py-8">
                    <span class="text-4xl">🍰</span>
                    <p class="text-warm-brown/60 font-hand mt-2">暫無分類資料</p>
                </div>
            `;
            legendContainer.innerHTML = '';
            return;
        }

        // 渲染圓餅圖
        chartContainer.innerHTML = PieChart.render(stats, colors);

        // 渲染圖例
        legendContainer.innerHTML = PieChart.renderLegend(stats, colors);

        // 綁定點擊事件
        PieChart.bindEvents(document.getElementById('categoryChartView'), (category) => {
            this.filterByCategory(category);
        });
    }

    /**
     * 切換分類視圖模式
     */
    toggleCategoryView(mode) {
        this.categoryViewMode = mode;

        const barView = document.getElementById('categoryBarView');
        const pieView = document.getElementById('categoryPieView');
        const barBtn = document.getElementById('btnCategoryBarView');
        const pieBtn = document.getElementById('btnCategoryPieView');

        if (mode === 'bar') {
            // 顯示長條圖，隱藏圓餅圖
            if (barView) barView.classList.remove('hidden');
            if (pieView) pieView.classList.add('hidden');

            // 更新按鈕樣式
            if (barBtn) {
                barBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                barBtn.classList.remove('bg-white', 'text-soft-ink', 'border', 'border-macaron-pink/30');
            }
            if (pieBtn) {
                pieBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                pieBtn.classList.add('bg-white', 'text-soft-ink', 'hover:bg-macaron-cream/50', 'border', 'border-macaron-pink/30');
            }

            this.renderCategoryBar();
        } else {
            // 顯示圓餅圖，隱藏長條圖
            if (barView) barView.classList.add('hidden');
            if (pieView) pieView.classList.remove('hidden');

            // 更新按鈕樣式
            if (pieBtn) {
                pieBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                pieBtn.classList.remove('bg-white', 'text-soft-ink', 'border', 'border-macaron-pink/30');
            }
            if (barBtn) {
                barBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                barBtn.classList.add('bg-white', 'text-soft-ink', 'hover:bg-macaron-cream/50', 'border', 'border-macaron-pink/30');
            }

            this.renderCategoryPie();
        }
    }

    /**
     * 按分類篩選
     */
    filterByCategory(category) {
        this.currentFilter.category = category;
        this.applyCurrentFilter();
        this.showClearFilterButton();
    }

    /**
     * 按付款人篩選（從統計卡片點擊）
     */
    filterByPayer(payer) {
        // 改為切換統計模式（payer 現在是 'baobao' 或 'bubu'）
        this.toggleStatMode(payer);
    }

    /**
     * 應用當前篩選
     */
    applyCurrentFilter() {
        let filtered = this.allTransactions;

        // 先根據統計模式篩選付款人（使用絕對角色）
        if (this.statMode === 'baobao') {
            filtered = filtered.filter(tx => tx.payer === 'baobao');
        } else if (this.statMode === 'bubu') {
            filtered = filtered.filter(tx => tx.payer === 'bubu');
        }

        // 再根據分類篩選
        if (this.currentFilter.category) {
            if (this.currentFilter.category === '未分類') {
                // 篩選出沒有分類或分類為空的交易
                filtered = filtered.filter(tx =>
                    !tx.categories || tx.categories.length === 0
                );
            } else {
                // 篩選出包含指定分類的交易
                filtered = filtered.filter(tx =>
                    tx.categories && tx.categories.includes(this.currentFilter.category)
                );
            }
        }

        // 生成篩選標籤
        const labels = [];
        if (this.statMode === 'baobao') labels.push('寶寶');
        else if (this.statMode === 'bubu') labels.push('步步');
        if (this.currentFilter.category) labels.push(this.currentFilter.category);

        const filterLabel = labels.length > 0 ? labels.join(' · ') : null;

        this.renderTransactionList(filtered, filterLabel);
    }

    /**
     * 清除篩選
     */
    clearFilter() {
        this.currentFilter = { payer: null, category: null };
        this.statMode = 'all';

        // 重置統計模式按鈕
        this.toggleStatMode('all');

        // 初始不顯示交易明細
        this.renderEmptyTransactionList();
        this.hideClearFilterButton();
    }

    /**
     * 顯示清除篩選按鈕
     */
    showClearFilterButton() {
        const btn = document.getElementById('btnClearFilter');
        if (btn) btn.classList.remove('hidden');
    }

    /**
     * 隱藏清除篩選按鈕
     */
    hideClearFilterButton() {
        const btn = document.getElementById('btnClearFilter');
        if (btn) btn.classList.add('hidden');
    }

    /**
     * 渲染空的交易列表（初始狀態）
     */
    renderEmptyTransactionList() {
        const container = document.getElementById('analyticsTransactionList');
        if (!container) return;

        // 顯示交易總數，讓用戶知道資料已載入
        const totalCount = this.allTransactions ? this.allTransactions.length : 0;
        const countText = totalCount > 0 ? `共 ${totalCount} 筆交易` : '暫無交易記錄';

        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-3">📊</div>
                <p class="text-warm-brown/60 font-hand text-base">點擊上方分類查看明細</p>
                <p class="text-warm-brown/40 font-hand text-sm mt-2">${countText}</p>
            </div>
        `;
    }

    /**
     * 渲染交易列表（卡片式布局）
     */
    renderTransactionList(transactions, filterLabel = null) {
        const container = document.getElementById('analyticsTransactionList');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">無交易記錄 ✨</p>';
            return;
        }

        // 按日期分組
        const grouped = {};
        transactions.forEach(tx => {
            if (!grouped[tx.date]) grouped[tx.date] = [];
            grouped[tx.date].push(tx);
        });

        // 篩選標籤
        const filterHeader = filterLabel ? `
            <div class="mb-4 flex items-center gap-2">
                <div class="px-3 py-1.5 bg-macaron-pink/20 text-macaron-rose rounded-full text-xs font-hand font-bold">
                    ${filterLabel}
                </div>
                <div class="text-xs text-warm-brown/60 font-hand">${transactions.length} 筆</div>
            </div>
        ` : '';

        // 渲染每日卡片
        let html = filterHeader;
        const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        dates.forEach((date, index) => {
            const txList = grouped[date];
            html += this.renderDayCard(date, txList, index === 0 && !filterLabel);
        });

        container.innerHTML = html;
        TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
    }

    /**
     * 渲染每日卡片（童話風格）
     */
    renderDayCard(dateStr, transactions, isFirst) {
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

        // 計算總計
        let total = 0;
        transactions.forEach(tx => {
            total += parseFloat(tx.amount);
        });

        // 渲染清單項目
        const listItems = transactions.map(tx => this.renderCardListItem(tx)).join('');

        return `
            <div class="mb-4 ${isFirst ? '' : 'mt-4'}">
                <!-- 童話風格卡片 -->
                <div class="bg-white rounded-2xl shadow-watercolor-layered overflow-hidden border border-macaron-pink/20">
                    <!-- 卡片頭部 -->
                    <div class="bg-gradient-to-r from-macaron-cream/50 to-macaron-pink/20 px-4 py-3 border-b border-macaron-pink/20">
                        <div class="flex justify-between items-center">
                            <h3 class="font-hand font-bold text-soft-ink text-base">${displayText}</h3>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-hand text-warm-brown/70">${transactions.length} 筆</span>
                                <span class="text-sm font-display font-bold text-[#E27D60]">$${Math.round(total)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 清單 -->
                    <div class="divide-y divide-macaron-pink/10">
                        ${listItems}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染卡片清單項目
     */
    renderCardListItem(tx) {
        // 使用「誰幫誰付」表達方式（使用絕對角色）
        let payText = '';
        if (tx.payer === 'baobao') {
            if (tx.beneficiary === 'baobao') payText = '寶幫寶付';
            else if (tx.beneficiary === 'bubu') payText = '寶幫步付';
            else payText = '寶幫共付';
        } else if (tx.payer === 'bubu') {
            if (tx.beneficiary === 'bubu') payText = '步幫步付';
            else if (tx.beneficiary === 'baobao') payText = '步幫寶付';
            else payText = '步幫共付';
        }

        const payerColor = tx.payer === 'baobao' ? 'text-macaron-rose' : 'text-blue-600';
        const photoIcon = tx.photo_url ? '<span class="text-xs ml-1">📸</span>' : '';

        // 備註：顯示分類或一般備註
        let note = '';
        if (tx.categories && tx.categories.length > 0) {
            note = tx.categories.slice(0, 2).join(' · ');
        } else if (tx.note) {
            note = tx.note;
        }

        return `
            <div class="transaction-item px-4 py-3 hover:bg-macaron-cream/20 cursor-pointer transition-colors" data-transaction-id="${tx.id}">
                <div class="flex items-center gap-3" style="width: 100%;">
                    <!-- 付款標籤（固定寬度 70px） -->
                    <div class="shrink-0" style="width: 70px; min-width: 70px; max-width: 70px;">
                        <span class="text-xs font-hand font-bold ${payerColor}">${payText}</span>
                    </div>

                    <!-- 項目資訊（彈性區域，置中） -->
                    <div class="flex flex-col justify-center" style="flex: 1 1 0; min-width: 0; overflow: hidden;">
                        <!-- 名稱 -->
                        <div class="flex items-center justify-center" style="width: 100%;">
                            <span class="font-hand text-sm text-soft-ink font-bold text-center" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${tx.item_name}</span>
                            ${photoIcon}
                        </div>
                        <!-- 備註/分類 -->
                        ${note ? `<div class="text-xs text-warm-brown/60 mt-0.5 text-center" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${note}</div>` : ''}
                    </div>

                    <!-- 金額（固定寬度 70px，右對齊） -->
                    <div class="shrink-0" style="width: 70px; min-width: 70px; max-width: 70px; text-align: right;">
                        <span class="font-display font-bold text-base text-[#E27D60]">$${tx.amount}</span>
                    </div>
                </div>
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

    changeDateFilter(period, btn) {
        if (period === 'custom') {
            // 由外部處理（透過 DateRangePicker）
            return;
        }

        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            b.classList.add('text-soft-ink');
        });

        if (btn) {
            btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            btn.classList.remove('text-soft-ink');
        }

        this.state.currentPeriod = period;
        this.update(period);
    }

    getDateRange(period) {
        const today = new Date();
        let startDate, endDate;

        if (period === 'week') {
            const dayOfWeek = today.getDay();
            startDate = new Date(today);
            startDate.setDate(today.getDate() - dayOfWeek);
            endDate = new Date(today);
        } else if (period === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (period === 'custom' && this.state.analyticsStartDate && this.state.analyticsEndDate) {
            startDate = this.state.analyticsStartDate;
            endDate = this.state.analyticsEndDate;
        } else {
            startDate = new Date(2000, 0, 1);
            endDate = new Date(2100, 0, 1);
        }

        return {
            startDate: window.DataManager.formatDate(startDate),
            endDate: window.DataManager.formatDate(endDate)
        };
    }

    // ==================== 趨勢分析（v5.9.0 新增）====================

    /**
     * 切換 Tab（統計 / 趨勢）
     */
    switchTab(tab) {
        this.trendSettings.currentTab = tab;

        // 更新 Tab 按鈕樣式
        document.querySelectorAll('.analytics-tab').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                btn.classList.remove('text-soft-ink', 'hover:bg-macaron-cream/50');
            } else {
                btn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                btn.classList.add('text-soft-ink', 'hover:bg-macaron-cream/50');
            }
        });

        // 切換內容區域
        document.querySelectorAll('.analytics-tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        if (tab === 'stats') {
            document.getElementById('statsTabContent').classList.remove('hidden');
        } else if (tab === 'trend') {
            document.getElementById('trendTabContent').classList.remove('hidden');
            this.updateTrendAnalysis(); // 初次進入時更新趨勢圖
        }
    }

    /**
     * 更新趨勢分析
     */
    async updateTrendAnalysis() {
        const { range, granularity, category, customStartDate, customEndDate } = this.trendSettings;

        // 計算日期範圍
        let startDate, endDate;

        if (range === 'custom' && customStartDate && customEndDate) {
            // 使用自訂日期範圍
            startDate = customStartDate;
            endDate = customEndDate;
        } else {
            // 使用預設日期範圍（最近 N 天）
            const today = new Date();
            endDate = window.DataManager.formatDate(today);
            startDate = new Date(today);
            startDate.setDate(today.getDate() - parseInt(range));
            startDate = window.DataManager.formatDate(startDate);
        }

        const transactions = await window.DataManager.getTransactionsByDateRange(
            startDate,
            endDate
        );

        // 取得趨勢資料
        const { data, legends } = window.DataManager.getTrendData(
            transactions,
            granularity,
            category === 'all' ? null : category,
            'both'
        );

        // 更新統計摘要（傳遞 category 參數）
        const summary = window.DataManager.getTrendSummary(
            transactions,
            granularity,
            category === 'all' ? null : category
        );
        this.updateTrendSummary(summary);

        // 儲存當前資料（用於全螢幕顯示）v5.9.0 新增
        this.currentTrendData = data;
        this.currentLegends = legends;

        // 渲染圖表
        if (this.trendSettings.chartType === 'line') {
            this.renderTrendLineChart(data, legends);
        } else {
            this.renderTrendBarChart(data, legends);
        }
    }

    /**
     * 渲染折線圖
     */
    renderTrendLineChart(data, legends) {
        const container = document.getElementById('trendLineChart');
        container.innerHTML = '';

        if (!this.trendLineChart) {
            // 顏色順序：寶寶（粉）、步步（藍）、總花費（綠）- 與圖例順序一致
            this.trendLineChart = new TrendChart(container, {
                width: 800,
                height: 300,
                colors: ['#FFB5D8', '#A8D8FF', '#B8F0D8'],
                smooth: true,
                showGrid: true,
                showPoints: true,
                showArea: true,
                animate: true
            });
        }

        this.trendLineChart.render(data, legends);
    }

    /**
     * 渲染直立式長條圖
     */
    renderTrendBarChart(data, legends) {
        const container = document.getElementById('trendBarChart');
        container.innerHTML = '';

        if (!this.trendBarChart) {
            // 顏色順序：寶寶（粉）、步步（藍）、總花費（綠）- 與圖例順序一致
            this.trendBarChart = new VerticalBarChart(container, {
                width: 800,
                height: 300,
                colors: ['#FFB5D8', '#A8D8FF', '#B8F0D8'],
                showGrid: true,
                showValues: false,
                barWidth: 0.6,
                animate: true
            });
        }

        this.trendBarChart.render(data, legends);
    }

    /**
     * 更新趨勢統計摘要
     */
    updateTrendSummary(summary) {
        // 儲存 maxDetail 供點擊使用
        this.currentMaxDetail = summary.maxDetail;

        document.getElementById('trendAverage').textContent = `$${Math.round(summary.average)}`;
        document.getElementById('trendMax').textContent = `$${Math.round(summary.max)}`;
        document.getElementById('trendCount').textContent = `${summary.count} 筆`;

        // 最高值卡片加上點擊提示（如果有資料）
        const maxCard = document.querySelector('#trendMax').closest('.bg-gradient-to-br');
        if (maxCard) {
            if (summary.maxDetail) {
                maxCard.style.cursor = 'pointer';
                maxCard.classList.add('hover:scale-105', 'transition-transform');
            } else {
                maxCard.style.cursor = 'default';
                maxCard.classList.remove('hover:scale-105', 'transition-transform');
            }
        }
    }

    /**
     * 顯示最高值詳情氣泡
     */
    showMaxDetail() {
        if (!this.currentMaxDetail) return;

        const detail = this.currentMaxDetail;
        const { label, amount, count, transactions } = detail;

        // 格式化標籤
        let formattedLabel = label;
        if (label.includes('W')) {
            formattedLabel = label.replace('W', '第') + '週';
        } else if (label.length === 7) {
            formattedLabel = label.substring(0, 7) + ' 月';
        } else if (label.length === 10) {
            formattedLabel = label;
        }

        // 建立氣泡內容
        let content = `
            <div class="max-detail-bubble">
                <div class="text-center mb-3">
                    <div class="text-sm font-hand font-bold text-warm-brown mb-1">📌 最高花費時段</div>
                    <div class="text-lg font-display font-bold text-soft-ink">${formattedLabel}</div>
                    <div class="text-2xl font-display font-bold text-macaron-rose mt-1">$${Math.round(amount)}</div>
                    <div class="text-xs text-warm-brown/70 mt-1">共 ${count} 筆交易</div>
                </div>
                <div class="border-t border-macaron-pink/30 pt-3 mt-3 max-h-48 overflow-y-auto">
                    <div class="text-xs font-hand font-bold text-warm-brown mb-2">交易明細：</div>
        `;

        // 列出前 5 筆交易
        const displayTxs = transactions.slice(0, 5);
        displayTxs.forEach(tx => {
            const categories = tx.categories && tx.categories.length > 0
                ? tx.categories.join(', ')
                : '未分類';
            content += `
                <div class="flex items-center justify-between py-1.5 border-b border-macaron-cream/50 last:border-0">
                    <div class="flex-1">
                        <div class="text-xs font-bold text-soft-ink">${tx.item_name}</div>
                        <div class="text-[10px] text-warm-brown/60">${categories} • ${tx.date}</div>
                    </div>
                    <div class="text-xs font-bold text-macaron-rose">$${Math.round(tx.amount)}</div>
                </div>
            `;
        });

        if (transactions.length > 5) {
            content += `<div class="text-[10px] text-center text-warm-brown/60 mt-2">還有 ${transactions.length - 5} 筆...</div>`;
        }

        content += `</div></div>`;

        // 顯示氣泡（使用 domUtils 的 showToast 或自訂彈窗）
        this.showMaxDetailModal(content);
    }

    /**
     * 顯示最高值詳情彈窗
     */
    showMaxDetailModal(content) {
        // 檢查是否已存在彈窗
        let modal = document.getElementById('maxDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'maxDetailModal';
            modal.className = 'fixed inset-0 z-[200] flex items-center justify-center hidden';
            modal.innerHTML = `
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="maxDetailOverlay"></div>
                <div class="relative bg-white rounded-3xl p-6 shadow-watercolor-layered max-w-sm w-11/12 mx-4 transform transition-all" id="maxDetailContent">
                    <button class="absolute top-4 right-4 w-8 h-8 rounded-full bg-macaron-cream/50 hover:bg-macaron-pink/20 flex items-center justify-center transition-colors" id="btnCloseMaxDetail">
                        <span class="material-symbols-outlined text-sm text-warm-brown">close</span>
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            // 綁定關閉事件
            document.getElementById('btnCloseMaxDetail').addEventListener('click', () => this.closeMaxDetailModal());
            document.getElementById('maxDetailOverlay').addEventListener('click', () => this.closeMaxDetailModal());
        }

        // 更新內容
        const contentDiv = document.getElementById('maxDetailContent');
        const closeBtn = contentDiv.querySelector('#btnCloseMaxDetail');
        contentDiv.innerHTML = content;
        contentDiv.appendChild(closeBtn);

        // 顯示彈窗
        modal.classList.remove('hidden');
        setTimeout(() => {
            contentDiv.style.transform = 'scale(1)';
            contentDiv.style.opacity = '1';
        }, 10);
    }

    /**
     * 關閉最高值詳情彈窗
     */
    closeMaxDetailModal() {
        const modal = document.getElementById('maxDetailModal');
        const content = document.getElementById('maxDetailContent');
        if (modal && content) {
            content.style.transform = 'scale(0.95)';
            content.style.opacity = '0';
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 150);
        }
    }

    /**
     * 切換日期範圍
     */
    changeTrendRange(range) {
        this.trendSettings.range = parseInt(range);
        this.updateButtonStyles('.trend-range-btn', 'range', range);
        this.updateTrendAnalysis();
    }

    /**
     * 切換時間粒度
     */
    changeTrendGranularity(granularity) {
        this.trendSettings.granularity = granularity;
        this.updateButtonStyles('.trend-granularity-btn', 'granularity', granularity);
        this.updateTrendAnalysis();
    }

    /**
     * 切換類別篩選
     */
    changeTrendCategory(category) {
        this.trendSettings.category = category;
        this.updateButtonStyles('.trend-category-btn', 'category', category);
        this.updateTrendAnalysis();
    }

    /**
     * 切換圖表類型
     */
    switchTrendChartType(type) {
        this.trendSettings.chartType = type;

        // 更新按鈕樣式
        const lineBtn = document.getElementById('btnTrendLineView');
        const barBtn = document.getElementById('btnTrendBarView');

        if (type === 'line') {
            lineBtn.classList.add('bg-gradient-to-br', 'from-macaron-purple', 'to-macaron-blue', 'text-white', 'shadow-sm');
            lineBtn.classList.remove('text-soft-ink');
            barBtn.classList.remove('bg-gradient-to-br', 'from-macaron-purple', 'to-macaron-blue', 'text-white', 'shadow-sm');
            barBtn.classList.add('text-soft-ink');

            document.getElementById('trendLineChartContainer').classList.remove('hidden');
            document.getElementById('trendBarChartContainer').classList.add('hidden');
        } else {
            barBtn.classList.add('bg-gradient-to-br', 'from-macaron-purple', 'to-macaron-blue', 'text-white', 'shadow-sm');
            barBtn.classList.remove('text-soft-ink');
            lineBtn.classList.remove('bg-gradient-to-br', 'from-macaron-purple', 'to-macaron-blue', 'text-white', 'shadow-sm');
            lineBtn.classList.add('text-soft-ink');

            document.getElementById('trendLineChartContainer').classList.add('hidden');
            document.getElementById('trendBarChartContainer').classList.remove('hidden');
        }

        this.updateTrendAnalysis();
    }

    /**
     * 更新按鈕樣式（通用方法）
     */
    updateButtonStyles(selector, dataAttr, value) {
        document.querySelectorAll(selector).forEach(btn => {
            const btnValue = btn.dataset[dataAttr];
            if (btnValue === value || btnValue === value.toString()) {
                // 選中樣式
                if (selector === '.trend-category-btn') {
                    btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                    btn.classList.remove('text-soft-ink', 'bg-white', 'border');
                } else if (selector === '.trend-granularity-btn') {
                    btn.classList.add('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-sm');
                    btn.classList.remove('text-soft-ink');
                } else {
                    btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                    btn.classList.remove('text-soft-ink');
                }
            } else {
                // 未選中樣式
                if (selector === '.trend-category-btn') {
                    btn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                    btn.classList.add('text-soft-ink', 'bg-white');
                    if (btnValue !== 'all') {
                        btn.classList.add('border');
                    }
                } else if (selector === '.trend-granularity-btn') {
                    btn.classList.remove('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-sm');
                    btn.classList.add('text-soft-ink');
                } else {
                    btn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-sm');
                    btn.classList.add('text-soft-ink');
                }
            }
        });
    }

    /**
     * 套用自訂日期範圍（趨勢分析）v5.9.0 新增
     * @param {string} startStr - 開始日期字串 (YYYY-MM-DD)
     * @param {string} endStr - 結束日期字串 (YYYY-MM-DD)
     */
    applyCustomTrendRange(startStr, endStr) {
        // 儲存自訂日期範圍
        this.trendSettings.customStartDate = startStr;
        this.trendSettings.customEndDate = endStr;
        this.trendSettings.range = 'custom';

        // 更新趨勢分析
        this.updateTrendAnalysis();
    }

    /**
     * 放大圖表至全螢幕（v5.9.0 新增，v6.2.0 改為橫向顯示）
     * @param {string} chartType - 圖表類型 ('line' | 'bar')
     */
    expandChart(chartType) {
        const modal = document.getElementById('chartFullscreenModal');
        const content = document.getElementById('chartFullscreenContent');
        const title = document.getElementById('chartFullscreenTitle');
        const rotateHint = document.getElementById('rotateHint');
        const wrapper = document.getElementById('chartFullscreenWrapper');

        if (!modal || !content || !this.currentTrendData || !this.currentLegends) return;

        // 設定標題
        const granularityText = {
            daily: '每日',
            weekly: '每週',
            monthly: '每月'
        }[this.trendSettings.granularity] || '趨勢';

        title.textContent = `${granularityText}花費趨勢`;

        // 清空內容
        content.innerHTML = '';

        // 偵測螢幕方向並顯示/隱藏旋轉提示
        const updateOrientation = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (rotateHint && wrapper) {
                if (isPortrait) {
                    rotateHint.classList.remove('hidden');
                    wrapper.style.opacity = '0.2';
                } else {
                    rotateHint.classList.add('hidden');
                    wrapper.style.opacity = '1';
                }
            }

            // 重新計算尺寸（橫向時使用更大的寬度）
            const width = isPortrait
                ? Math.min(window.innerWidth - 40, 800)
                : Math.min(window.innerWidth - 80, 1400);
            const height = isPortrait
                ? Math.min(window.innerHeight - 200, 400)
                : Math.min(window.innerHeight - 150, 600);

            // 建立全螢幕圖表實例
            const chartContainer = document.createElement('div');
            chartContainer.id = 'fullscreenChartContainer';
            chartContainer.style.width = '100%';
            chartContainer.style.height = '100%';
            content.innerHTML = '';
            content.appendChild(chartContainer);

            // 根據類型渲染圖表（使用正確的顏色順序）
            const colors = ['#FFB5D8', '#A8D8FF', '#B8F0D8']; // 寶寶（粉）、步步（藍）、總花費（綠）

            if (chartType === 'line') {
                const chart = new TrendChart(chartContainer, {
                    width: width,
                    height: height,
                    colors: colors,
                    animate: true,
                    smooth: true
                });
                chart.render(this.currentTrendData, this.currentLegends);
            } else if (chartType === 'bar') {
                const chart = new VerticalBarChart(chartContainer, {
                    width: width,
                    height: height,
                    colors: colors,
                    animate: true
                });
                chart.render(this.currentTrendData, this.currentLegends);
            }
        };

        // 初始渲染
        updateOrientation();

        // 監聽螢幕旋轉
        const orientationHandler = () => updateOrientation();
        window.addEventListener('orientationchange', orientationHandler);
        window.addEventListener('resize', orientationHandler);

        // 顯示彈窗
        modal.classList.remove('hidden');

        // 儲存 cleanup 函數（關閉時移除監聽器）
        this._fullscreenCleanup = () => {
            window.removeEventListener('orientationchange', orientationHandler);
            window.removeEventListener('resize', orientationHandler);
        };
    }

    /**
     * 關閉全螢幕圖表（v5.9.0 新增，v6.2.0 新增清理邏輯）
     */
    closeChartFullscreen() {
        const modal = document.getElementById('chartFullscreenModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // 清理事件監聽器
        if (this._fullscreenCleanup) {
            this._fullscreenCleanup();
            this._fullscreenCleanup = null;
        }
    }
}

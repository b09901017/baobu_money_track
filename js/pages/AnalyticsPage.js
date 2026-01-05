// ==================== 分析頁面控制器 ====================
// 來源: app.js 行 1108-1255

import { TransactionRenderer } from '../components/TransactionRenderer.js';
import { PieChart } from '../components/PieChart.js';

export class AnalyticsPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        // 視圖模式：'list' | 'chart'
        this.categoryViewMode = 'list';

        // 統計模式：'all' | 'me' | 'partner'
        this.statMode = 'all';

        // 篩選狀態（支援多重篩選）
        this.currentFilter = {
            payer: null,    // 'me' | 'partner' | null
            category: null  // 分類名稱 | null
        };
    }

    async update(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const transactions = await window.DataManager.getTransactionsByDateRange(startDate, endDate);

        // 儲存完整交易列表（用於篩選）
        this.allTransactions = transactions;

        // 更新支出統計
        const stats = window.DataManager.getExpenseStats(transactions);
        const totalExpenseEl = document.getElementById('totalExpense');
        const myExpenseEl = document.getElementById('myExpense');
        const partnerExpenseEl = document.getElementById('partnerExpense');

        if (totalExpenseEl) totalExpenseEl.textContent = `$${Math.round(stats.totalExpense)}`;
        if (myExpenseEl) myExpenseEl.textContent = `$${Math.round(stats.myExpense)}`;
        if (partnerExpenseEl) partnerExpenseEl.textContent = `$${Math.round(stats.partnerExpense)}`;

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

        // 根據統計模式篩選
        if (this.statMode === 'me') {
            transactions = transactions.filter(tx => tx.payer === 'me');
        } else if (this.statMode === 'partner') {
            transactions = transactions.filter(tx => tx.payer === 'partner');
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
        if (this.categoryViewMode === 'list') {
            this.renderCategoryList();
        } else {
            this.renderCategoryChart();
        }
    }

    /**
     * 渲染分類列表視圖
     */
    renderCategoryList() {
        const container = document.getElementById('categoryList');
        if (!container) return;

        const stats = this.categoryStats;
        const colors = this.categoryColors;

        if (!stats || stats.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 font-hand">無分類資料 ✨</p>';
            return;
        }

        container.innerHTML = stats.map((item, index) => `
            <div class="category-stat-item flex items-center gap-3 p-3 rounded-xl hover:bg-macaron-cream/30 transition-all cursor-pointer" data-category="${item.category}">
                <div class="w-5 h-5 rounded-full" style="background: ${colors[index % colors.length]}; box-shadow: 0 2px 8px ${colors[index % colors.length]}40;"></div>
                <div class="flex-1 font-hand font-bold text-soft-ink">${item.category}</div>
                <div class="font-display font-bold text-soft-ink">$${Math.round(item.amount)}</div>
                <div class="text-sm text-warm-brown/70 min-w-[50px] text-right">${item.percentage}%</div>
                <span class="material-symbols-outlined text-warm-brown/40 text-lg">chevron_right</span>
            </div>
        `).join('');

        // 綁定點擊事件
        container.querySelectorAll('.category-stat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    /**
     * 渲染分類圓餅圖視圖
     */
    renderCategoryChart() {
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

        const listView = document.getElementById('categoryListView');
        const chartView = document.getElementById('categoryChartView');
        const listBtn = document.getElementById('btnCategoryListView');
        const chartBtn = document.getElementById('btnCategoryChartView');

        if (mode === 'list') {
            // 顯示列表，隱藏圓餅圖
            if (listView) listView.classList.remove('hidden');
            if (chartView) chartView.classList.add('hidden');

            // 更新按鈕樣式
            if (listBtn) {
                listBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                listBtn.classList.remove('bg-white', 'text-soft-ink', 'border', 'border-macaron-pink/30');
            }
            if (chartBtn) {
                chartBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                chartBtn.classList.add('bg-white', 'text-soft-ink', 'hover:bg-macaron-cream/50', 'border', 'border-macaron-pink/30');
            }

            this.renderCategoryList();
        } else {
            // 顯示圓餅圖，隱藏列表
            if (listView) listView.classList.add('hidden');
            if (chartView) chartView.classList.remove('hidden');

            // 更新按鈕樣式
            if (chartBtn) {
                chartBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                chartBtn.classList.remove('bg-white', 'text-soft-ink', 'border', 'border-macaron-pink/30');
            }
            if (listBtn) {
                listBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white');
                listBtn.classList.add('bg-white', 'text-soft-ink', 'hover:bg-macaron-cream/50', 'border', 'border-macaron-pink/30');
            }

            this.renderCategoryChart();
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
     * 按付款人篩選（從統計卡片點擊，不再使用）
     */
    filterByPayer(payer) {
        // 改為切換統計模式
        this.toggleStatMode(payer === 'me' ? 'me' : 'partner');
    }

    /**
     * 應用當前篩選
     */
    applyCurrentFilter() {
        let filtered = this.allTransactions;

        // 先根據統計模式篩選付款人
        if (this.statMode === 'me') {
            filtered = filtered.filter(tx => tx.payer === 'me');
        } else if (this.statMode === 'partner') {
            filtered = filtered.filter(tx => tx.payer === 'partner');
        }

        // 再根據分類篩選
        if (this.currentFilter.category) {
            filtered = filtered.filter(tx =>
                tx.categories && tx.categories.includes(this.currentFilter.category)
            );
        }

        // 生成篩選標籤
        const labels = [];
        if (this.statMode === 'me') labels.push('寶寶');
        else if (this.statMode === 'partner') labels.push('步步');
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

        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-3">📊</div>
                <p class="text-warm-brown/60 font-hand text-base">點擊上方分類查看明細</p>
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
        // 使用「誰幫誰付」表達方式
        let payText = '';
        if (tx.payer === 'me') {
            if (tx.beneficiary === 'self') payText = '寶幫寶付';
            else if (tx.beneficiary === 'partner') payText = '寶幫步付';
            else payText = '寶幫共付';
        } else {
            if (tx.beneficiary === 'self') payText = '步幫步付';
            else if (tx.beneficiary === 'partner') payText = '步幫寶付';
            else payText = '步幫共付';
        }

        const payerColor = tx.payer === 'me' ? 'text-macaron-rose' : 'text-blue-600';
        const photoIcon = tx.photo_url ? '<span class="text-xs">📸</span>' : '';
        const categories = tx.categories && tx.categories.length > 0
            ? tx.categories.slice(0, 2).join(' · ')
            : '';

        return `
            <div class="transaction-item px-4 py-3 hover:bg-macaron-cream/20 cursor-pointer transition-colors" data-transaction-id="${tx.id}">
                <div class="flex items-center gap-2">
                    <!-- 付款標籤 -->
                    <span class="text-xs font-hand font-bold ${payerColor} shrink-0" style="width: 64px;">${payText}</span>

                    <!-- 項目資訊 -->
                    <div class="flex-1 min-w-0 overflow-hidden">
                        <div class="flex items-center gap-1">
                            <span class="font-hand text-sm text-soft-ink truncate font-bold block">${tx.item_name}</span>
                            ${photoIcon}
                        </div>
                        ${categories ? `<div class="text-xs text-warm-brown/60 truncate">${categories}</div>` : ''}
                    </div>

                    <!-- 金額（固定在右側） -->
                    <span class="font-display font-bold text-base text-[#E27D60] shrink-0" style="min-width: 60px; text-align: right;">$${tx.amount}</span>
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
}

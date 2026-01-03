// ==================== 分析頁面控制器 ====================
// 來源: app.js 行 1108-1255

import { TransactionRenderer } from '../components/TransactionRenderer.js';

export class AnalyticsPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;
    }

    async update(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const transactions = await window.DataManager.getTransactionsByDateRange(startDate, endDate);

        // 更新支出統計
        const stats = window.DataManager.getExpenseStats(transactions);
        const totalExpenseEl = document.getElementById('totalExpense');
        const myExpenseEl = document.getElementById('myExpense');
        const partnerExpenseEl = document.getElementById('partnerExpense');

        if (totalExpenseEl) totalExpenseEl.textContent = `$${Math.round(stats.totalExpense)}`;
        if (myExpenseEl) myExpenseEl.textContent = `$${Math.round(stats.myExpense)}`;
        if (partnerExpenseEl) partnerExpenseEl.textContent = `$${Math.round(stats.partnerExpense)}`;

        // 更新分類統計
        const categoryStats = window.DataManager.getCategoryStats(transactions);
        this.renderCategoryStats(categoryStats);

        // 更新交易列表
        const container = document.getElementById('analyticsTransactionList');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">該期間無交易記錄 ✨</p>';
        } else {
            container.innerHTML = transactions.map(tx => TransactionRenderer.renderTransactionItem(tx)).join('');
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }
    }

    renderCategoryStats(stats) {
        const container = document.getElementById('categoryList');
        if (!container) return;

        const colors = ['#FFB7B2', '#C7CEEA', '#E2F0CB', '#E0BBE4', '#FFC7D8', '#A8D8FF'];

        if (stats.length === 0) {
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
                this.showCategoryDetail(category);
            });
        });
    }

    async showCategoryDetail(category) {
        const { startDate, endDate } = this.getDateRange(this.state.currentPeriod || 'month');
        const allTransactions = await window.DataManager.getTransactionsByDateRange(startDate, endDate);
        const categoryTransactions = allTransactions.filter(tx =>
            tx.categories && tx.categories.includes(category)
        );

        const container = document.getElementById('analyticsTransactionList');
        if (!container) return;

        if (categoryTransactions.length === 0) {
            container.innerHTML = `<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">該分類無交易記錄 ✨</p>`;
        } else {
            container.innerHTML = `
                <div class="flex items-center justify-between mb-4 px-2">
                    <div class="flex items-center gap-2">
                        <button class="back-to-all-btn w-8 h-8 rounded-full bg-macaron-pink/20 hover:bg-macaron-pink/40 flex items-center justify-center transition-colors">
                            <span class="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <h3 class="text-lg font-hand font-bold text-soft-ink">${category} (${categoryTransactions.length})</h3>
                    </div>
                </div>
                ${categoryTransactions.map(tx => TransactionRenderer.renderTransactionItem(tx)).join('')}
            `;

            // 綁定返回按鈕
            const backBtn = container.querySelector('.back-to-all-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.update(this.state.currentPeriod || 'month');
                });
            }

            // 綁定交易點擊事件
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }

        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

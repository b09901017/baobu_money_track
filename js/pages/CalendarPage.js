// ==================== 日曆頁面控制器 ====================
// 來源: app.js 行 841-970

import { TransactionRenderer } from '../components/TransactionRenderer.js';
import { formatDisplayDate } from '../utils/dateUtils.js';

export class CalendarPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;
    }

    renderCalendar() {
        const year = this.state.currentMonth.getFullYear();
        const month = this.state.currentMonth.getMonth();

        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) {
            currentMonthEl.textContent = `${year}年${month + 1}月`;
        }

        const dailyExpenses = window.DataManager.getDailyExpenses(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        grid.innerHTML = '';

        // 星期標題
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'text-center text-sm font-bold text-warm-brown/60 py-2 font-hand';
            cell.textContent = day;
            grid.appendChild(cell);
        });

        // 上個月的日期
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const cell = this.createCalendarDay(day, year, month - 1, true);
            grid.appendChild(cell);
        }

        // 當月日期
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = this.createCalendarDay(day, year, month, false, dailyExpenses);
            grid.appendChild(cell);
        }

        // 下個月的日期
        const remainingCells = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            const cell = this.createCalendarDay(day, year, month + 1, true);
            grid.appendChild(cell);
        }
    }

    createCalendarDay(day, year, month, isOtherMonth, dailyExpenses = {}) {
        const cell = document.createElement('div');
        cell.className = 'aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all relative font-hand';

        if (isOtherMonth) {
            cell.className += ' opacity-30 bg-transparent';
        } else {
            cell.className += ' bg-white hover:bg-macaron-pink/20';
        }

        const dateStr = window.DataManager.formatDate(new Date(year, month, day));
        const today = window.DataManager.getToday();

        if (dateStr === today && !isOtherMonth) {
            cell.className += ' bg-macaron-cream font-bold ring-2 ring-antique-gold/30';
        }

        if (dailyExpenses[dateStr]) {
            cell.className += ' ring-2 ring-macaron-pink/30';
        }

        // 日期數字
        const dayNum = document.createElement('div');
        dayNum.className = 'text-base font-bold mb-1';
        dayNum.textContent = day;
        cell.appendChild(dayNum);

        // 金額
        if (dailyExpenses[dateStr]) {
            const amount = document.createElement('div');
            amount.className = 'text-xs text-[#E27D60] font-bold';
            amount.textContent = `$${Math.round(dailyExpenses[dateStr])}`;
            cell.appendChild(amount);
        }

        // 點擊事件
        if (!isOtherMonth) {
            cell.addEventListener('click', () => {
                this.selectCalendarDay(dateStr, cell);
            });
        }

        return cell;
    }

    selectCalendarDay(dateStr, cell) {
        document.querySelectorAll('#calendarGrid > div').forEach(day => {
            day.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
        });

        cell.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
        this.state.selectedDate = dateStr;

        this.showDayTransactions(dateStr);
    }

    showDayTransactions(dateStr) {
        const transactions = window.DataManager.getTransactionsByDate(dateStr);
        const container = document.getElementById('dayTransactions');
        const header = document.getElementById('selectedDate');

        if (header) header.textContent = formatDisplayDate(dateStr);

        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">當天無交易記錄 ✨</p>';
        } else {
            container.innerHTML = transactions.map(tx => TransactionRenderer.renderTransactionItem(tx)).join('');
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }
    }

    changeMonth(delta) {
        this.state.currentMonth = new Date(
            this.state.currentMonth.getFullYear(),
            this.state.currentMonth.getMonth() + delta,
            1
        );
        this.renderCalendar();
    }
}

// ==================== 日曆頁面控制器 ====================
// 來源: app.js 行 841-970

import { TransactionRenderer } from '../components/TransactionRenderer.js';
import { formatDisplayDate } from '../utils/dateUtils.js';

export class CalendarPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;

        // 日曆模式：'single' | 'range'
        this.calendarMode = 'single';

        // 單日模式的當前選中日期
        this.currentSelectedDate = null;

        // 區間模式的臨時選中日期
        this.tempRangeStart = null;
        this.tempRangeEnd = null;
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

        // 今天的標記
        if (dateStr === today && !isOtherMonth) {
            cell.className += ' bg-macaron-cream font-bold ring-2 ring-antique-gold/30';
        }

        // 有花費的標記
        if (dailyExpenses[dateStr]) {
            cell.className += ' ring-2 ring-macaron-pink/30';
        }

        // 單日模式：選中的日期
        if (this.calendarMode === 'single' && dateStr === this.currentSelectedDate && !isOtherMonth) {
            cell.className += ' bg-gradient-to-br from-macaron-pink to-macaron-purple text-white scale-105 shadow-watercolor-layered';
        }

        // 區間模式：開始、結束、中間日期的高亮
        if (this.calendarMode === 'range' && !isOtherMonth) {
            const cellDate = new Date(dateStr);

            // 開始日期
            if (this.tempRangeStart && dateStr === this.tempRangeStart) {
                cell.className += ' bg-gradient-to-br from-macaron-blue to-macaron-purple text-white ring-2 ring-macaron-blue shadow-watercolor-layered';
            }

            // 結束日期
            if (this.tempRangeEnd && dateStr === this.tempRangeEnd) {
                cell.className += ' bg-gradient-to-br from-macaron-blue to-macaron-purple text-white ring-2 ring-macaron-purple shadow-watercolor-layered';
            }

            // 中間日期
            if (this.tempRangeStart && this.tempRangeEnd) {
                const start = new Date(this.tempRangeStart);
                const end = new Date(this.tempRangeEnd);

                if (cellDate > start && cellDate < end) {
                    cell.className += ' bg-macaron-blue/20 border-2 border-macaron-blue/40';
                }
            }
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
        if (this.calendarMode === 'single') {
            // 單日模式：選中一天，顯示該天的交易
            document.querySelectorAll('#calendarGrid > div').forEach(day => {
                day.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
            });

            cell.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
            this.currentSelectedDate = dateStr;
            this.state.selectedDate = dateStr;

            this.showDayTransactions(dateStr);
        } else {
            // 區間模式：選擇開始和結束日期
            if (!this.tempRangeStart || this.tempRangeEnd) {
                // 選擇開始日期
                this.tempRangeStart = dateStr;
                this.tempRangeEnd = null;
                this.renderCalendar();
            } else {
                // 選擇結束日期
                const start = new Date(this.tempRangeStart);
                const end = new Date(dateStr);

                if (end < start) {
                    // 如果結束日期早於開始日期，交換
                    this.tempRangeEnd = this.tempRangeStart;
                    this.tempRangeStart = dateStr;
                } else {
                    this.tempRangeEnd = dateStr;
                }

                this.showRangeTransactions(this.tempRangeStart, this.tempRangeEnd);
                this.renderCalendar();
            }
        }
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

    /**
     * 顯示區間交易
     */
    showRangeTransactions(startDateStr, endDateStr) {
        const transactions = window.DataManager.getTransactionsByDateRange(startDateStr, endDateStr);
        const container = document.getElementById('dayTransactions');
        const header = document.getElementById('selectedDate');

        if (header) {
            header.textContent = `${formatDisplayDate(startDateStr)} ~ ${formatDisplayDate(endDateStr)}`;
        }

        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">區間內無交易記錄 ✨</p>';
        } else {
            // 按日期分組
            const grouped = {};
            transactions.forEach(tx => {
                if (!grouped[tx.date]) grouped[tx.date] = [];
                grouped[tx.date].push(tx);
            });

            // 渲染分組交易
            let html = '';
            Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
                html += `<div class="mb-4">`;
                html += `<h5 class="text-xs font-bold text-warm-brown/70 mb-2 font-hand">${formatDisplayDate(date)}</h5>`;
                html += `<div class="space-y-2">`;
                grouped[date].forEach(tx => {
                    html += TransactionRenderer.renderTransactionItem(tx);
                });
                html += `</div></div>`;
            });
            container.innerHTML = html;
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }
    }

    /**
     * 切換模式（單日/區間）
     */
    toggleMode(mode) {
        this.calendarMode = mode;

        // 重置選擇
        if (mode === 'range') {
            this.tempRangeStart = null;
            this.tempRangeEnd = null;
        }

        // 更新按鈕樣式
        const singleBtn = document.getElementById('btnCalendarSingleMode');
        const rangeBtn = document.getElementById('btnCalendarRangeMode');

        if (singleBtn && rangeBtn) {
            if (mode === 'single') {
                singleBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-watercolor-layered');
                singleBtn.classList.remove('bg-white/60', 'text-soft-ink');
                rangeBtn.classList.remove('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-watercolor-layered');
                rangeBtn.classList.add('bg-white/60', 'text-soft-ink');
            } else {
                rangeBtn.classList.add('bg-gradient-to-br', 'from-macaron-blue', 'to-macaron-purple', 'text-white', 'shadow-watercolor-layered');
                rangeBtn.classList.remove('bg-white/60', 'text-soft-ink');
                singleBtn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-rose', 'text-white', 'shadow-watercolor-layered');
                singleBtn.classList.add('bg-white/60', 'text-soft-ink');
            }
        }

        this.renderCalendar();
    }

    /**
     * 單日模式下切換日期
     */
    changeSingleDay(delta) {
        if (this.calendarMode !== 'single' || !this.currentSelectedDate) return;

        const currentDate = new Date(this.currentSelectedDate);
        currentDate.setDate(currentDate.getDate() + delta);
        const newDateStr = window.DataManager.formatDate(currentDate);

        this.currentSelectedDate = newDateStr;
        this.state.selectedDate = newDateStr;

        // 更新月份顯示（如果跨月）
        if (currentDate.getMonth() !== this.state.currentMonth.getMonth() ||
            currentDate.getFullYear() !== this.state.currentMonth.getFullYear()) {
            this.state.currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        }

        this.renderCalendar();
        this.showDayTransactions(newDateStr);
    }

    /**
     * 回到今天（單日模式）
     */
    goToToday() {
        if (this.calendarMode !== 'single') {
            this.toggleMode('single');
        }

        const today = new Date();
        const todayStr = window.DataManager.formatDate(today);

        this.currentSelectedDate = todayStr;
        this.state.selectedDate = todayStr;
        this.state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        this.renderCalendar();
        this.showDayTransactions(todayStr);
    }
}

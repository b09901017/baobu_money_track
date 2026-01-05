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

        // 滑動手勢相關
        this.touchStartX = 0;
        this.touchEndX = 0;

        // 綁定滑動手勢
        this.initSwipeGesture();
    }

    /**
     * 初始化滑動手勢
     */
    initSwipeGesture() {
        const calendarView = document.getElementById('calendarView');
        if (!calendarView) return;

        calendarView.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        calendarView.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    /**
     * 處理滑動手勢
     */
    handleSwipe() {
        // 只在單日模式下啟用滑動
        if (this.calendarMode !== 'single') return;
        if (!this.currentSelectedDate) return;

        const swipeThreshold = 50; // 滑動觸發閾值（像素）
        const diff = this.touchStartX - this.touchEndX;

        // 向左滑（顯示下一天）
        if (diff > swipeThreshold) {
            this.changeSingleDay(1);
        }
        // 向右滑（顯示前一天）
        else if (diff < -swipeThreshold) {
            this.changeSingleDay(-1);
        }
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

    async selectCalendarDay(dateStr, cell) {
        if (this.calendarMode === 'single') {
            // 單日模式：選中一天，顯示該天的交易
            document.querySelectorAll('#calendarGrid > div').forEach(day => {
                day.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
            });

            cell.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-macaron-purple', 'text-white', 'scale-105', 'shadow-watercolor-layered');
            this.currentSelectedDate = dateStr;
            this.state.selectedDate = dateStr;

            await this.showDayTransactions(dateStr);
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

                await this.showRangeTransactions(this.tempRangeStart, this.tempRangeEnd);
                this.renderCalendar();
            }
        }
    }

    async showDayTransactions(dateStr) {
        const transactions = await window.DataManager.getTransactionsByDate(dateStr);
        const container = document.getElementById('dayTransactions');
        const header = document.getElementById('selectedDate');

        if (header) header.textContent = formatDisplayDate(dateStr);

        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">當天無交易記錄 ✨</p>';
        } else {
            // 使用卡片式清單佈局（與區間選擇一致）
            const html = this.renderDayCard(dateStr, transactions, true);
            container.innerHTML = html;
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
     * 顯示區間交易（卡片式清單佈局）
     */
    async showRangeTransactions(startDateStr, endDateStr) {
        const transactions = await window.DataManager.getTransactionsByDateRange(startDateStr, endDateStr);
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

            // 渲染每日卡片
            let html = '';
            Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach((date, index) => {
                const txList = grouped[date];
                html += this.renderDayCard(date, txList, index === 0);
            });
            container.innerHTML = html;
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }
    }

    /**
     * 渲染每日卡片（清單式）
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
        let baobaoTotal = 0;
        let bubuTotal = 0;
        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (tx.payer === 'me') baobaoTotal += amount;
            else bubuTotal += amount;
        });
        const total = baobaoTotal + bubuTotal;

        // 渲染清單項目
        const listItems = transactions.map(tx => this.renderListItem(tx)).join('');

        return `
            <div class="mb-4 ${isFirst ? '' : 'mt-4'}">
                <!-- 卡片 -->
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
     * 渲染清單項目（簡化版）
     */
    renderListItem(tx) {
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

        return `
            <div class="transaction-item px-4 py-3 hover:bg-macaron-cream/20 cursor-pointer transition-colors" data-transaction-id="${tx.id}">
                <div class="flex items-center gap-3">
                    <!-- 付款標籤 -->
                    <span class="text-xs font-hand font-bold ${payerColor} shrink-0 w-16">${payText}</span>

                    <!-- 項目名稱 -->
                    <div class="flex-1 min-w-0 flex items-center gap-1">
                        <span class="font-hand text-sm text-soft-ink truncate">${tx.item_name}</span>
                        ${photoIcon}
                    </div>

                    <!-- 金額 -->
                    <span class="font-display font-bold text-base text-[#E27D60] shrink-0">$${tx.amount}</span>
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
    async changeSingleDay(delta) {
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
        await this.showDayTransactions(newDateStr);
    }

    /**
     * 回到今天（單日模式）
     */
    async goToToday() {
        if (this.calendarMode !== 'single') {
            this.toggleMode('single');
        }

        const today = new Date();
        const todayStr = window.DataManager.formatDate(today);

        this.currentSelectedDate = todayStr;
        this.state.selectedDate = todayStr;
        this.state.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        this.renderCalendar();
        await this.showDayTransactions(todayStr);
    }
}

// ==================== 日曆頁面控制器 ====================
// 來源: app.js 行 841-970

import { TransactionRenderer, CATEGORY_ICONS } from '../components/TransactionRenderer.js';
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
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;

        // 標記滑動來源（calendar 或 list）
        this.swipeSource = null;

        // 💖 顯示模式設定 💖
        this.displayMode = {
            type: 'amount',      // 'amount' | 'category'
            mode: 'total'        // amount: 'total' | 'baobao' | 'bubu'
                                // category: 類別名稱（如 '吃吃'）
        };

        // 類別圖示對應（從 TransactionRenderer 匯入）
        this.categoryIcons = CATEGORY_ICONS;

        // 綁定滑動手勢
        this.initSwipeGesture();

        // 標記是否已初始化選擇器
        this.displayModeSelectorInitialized = false;

        // 訂閱交易變更（新增）
        this.state.subscribe('transactions', (data) => {
            console.log('📅 CalendarPage 收到交易更新');
            // 如果當前在日曆視圖，重新渲染
            if (this.calendarMode === 'single' && this.currentSelectedDate) {
                this.showDayTransactions(this.currentSelectedDate);
            } else if (this.calendarMode === 'range' && this.tempRangeStart && this.tempRangeEnd) {
                this.showRangeTransactions(this.tempRangeStart, this.tempRangeEnd);
            } else {
                this.renderCalendar();
            }
        });

        console.log('📅 CalendarPage 已建立並訂閱交易變更');
    }

    /**
     * 初始化滑動手勢
     */
    initSwipeGesture() {
        const calendarView = document.getElementById('calendarView');
        if (!calendarView) return;

        // 分別為日曆區域和清單區域綁定滑動事件
        const calendarGrid = document.getElementById('calendarGrid');
        const dayTransactions = document.getElementById('dayTransactions');

        // 日曆區域的滑動（直接切換，無動畫）
        if (calendarGrid) {
            calendarGrid.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
                this.touchStartTime = Date.now();
                this.swipeSource = 'calendar';
            }, { passive: true });

            calendarGrid.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe();
            }, { passive: true });
        }

        // 清單區域的滑動（滑卡動畫）
        if (dayTransactions) {
            dayTransactions.addEventListener('touchstart', (e) => {
                // 只在有選中日期時啟用
                if (!this.currentSelectedDate) return;

                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
                this.touchStartTime = Date.now();
                this.swipeSource = 'list';
            }, { passive: true });

            dayTransactions.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe();
            }, { passive: true });
        }
    }

    /**
     * 處理滑動手勢（優化版：防止上下滑誤觸）
     */
    handleSwipe() {
        // 只在單日模式下啟用滑動
        if (this.calendarMode !== 'single') return;
        if (!this.currentSelectedDate) return;
        if (!this.swipeSource) return;

        const diffX = this.touchStartX - this.touchEndX;
        const diffY = this.touchStartY - this.touchEndY;
        const swipeTime = Date.now() - this.touchStartTime;

        // 滑動閾值設定
        const horizontalThreshold = 60;  // 水平滑動最小距離
        const verticalThreshold = 30;    // 垂直滑動容忍度
        const maxSwipeTime = 500;        // 最大滑動時間（毫秒）

        // 判斷是否為有效的水平滑動
        const isHorizontalSwipe = Math.abs(diffX) > horizontalThreshold &&
                                   Math.abs(diffX) > Math.abs(diffY) * 1.5 && // 水平距離 > 垂直距離的 1.5 倍
                                   swipeTime < maxSwipeTime;

        if (!isHorizontalSwipe) {
            this.swipeSource = null;
            return;
        }

        // 向左滑（顯示下一天）
        if (diffX > 0) {
            this.changeSingleDay(1, this.swipeSource);
        }
        // 向右滑（顯示前一天）
        else {
            this.changeSingleDay(-1, this.swipeSource);
        }

        this.swipeSource = null;
    }

    async renderCalendar() {
        // 確保顯示模式選擇器已初始化（首次渲染時）
        if (!this.displayModeSelectorInitialized) {
            setTimeout(() => {
                this.initDisplayModeSelector();
            }, 50);
            this.displayModeSelectorInitialized = true;
        }

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

        // 收集所有日期單格的 Promise
        const cellPromises = [];

        // 上個月的日期
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            cellPromises.push(this.createCalendarDay(day, year, month - 1, true));
        }

        // 當月日期
        for (let day = 1; day <= daysInMonth; day++) {
            cellPromises.push(this.createCalendarDay(day, year, month, false, dailyExpenses));
        }

        // 下個月的日期
        const remainingCells = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            cellPromises.push(this.createCalendarDay(day, year, month + 1, true));
        }

        // 等待所有日期單格渲染完成
        const cells = await Promise.all(cellPromises);
        cells.forEach(cell => grid.appendChild(cell));
    }

    async createCalendarDay(day, year, month, isOtherMonth, dailyExpenses = {}) {
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

        // 根據顯示模式渲染內容
        await this.renderCalendarDayContent(cell, dateStr, dailyExpenses);

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

            // 點擊日期後自動向下滾動，讓清單「滑上來」的感覺
            setTimeout(() => {
                this.scrollToTransactionsList();
            }, 100);
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

        // 清除任何可能殘留的動畫 class
        container.className = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">當天無交易記錄 ✨</p>';
        } else {
            // 使用卡片式清單佈局（與區間選擇一致）
            const html = this.renderDayCard(dateStr, transactions, true);
            container.innerHTML = html;
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }
    }

    /**
     * 帶滑卡動畫的顯示交易記錄
     * @param {string} dateStr - 日期字串
     * @param {number} delta - 日期變化量（+1 下一天，-1 前一天）
     */
    async showDayTransactionsWithSwipeAnimation(dateStr, delta) {
        const container = document.getElementById('dayTransactions');
        if (!container) return;

        // 先更新日曆（無動畫）
        this.renderCalendar();

        // 1. 播放滑出動畫
        const swipeOutClass = delta > 0 ? 'swipe-left-out' : 'swipe-right-out';
        container.classList.add(swipeOutClass);

        // 等待滑出動畫完成
        await new Promise(resolve => setTimeout(resolve, 350));

        // 2. 更新內容（隱藏狀態）
        const transactions = await window.DataManager.getTransactionsByDate(dateStr);
        const header = document.getElementById('selectedDate');

        if (header) header.textContent = formatDisplayDate(dateStr);

        container.className = ''; // 清除動畫 class

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">當天無交易記錄 ✨</p>';
        } else {
            const html = this.renderDayCard(dateStr, transactions, true);
            container.innerHTML = html;
            TransactionRenderer.bindClickEvents(container, this.onTransactionClickCallback);
        }

        // 3. 播放滑入動畫（從相反方向）
        const swipeInClass = delta > 0 ? 'swipe-in-from-right' : 'swipe-in-from-left';

        // 強制瀏覽器重繪
        void container.offsetWidth;

        container.classList.add(swipeInClass);

        // 動畫完成後清除 class
        await new Promise(resolve => setTimeout(resolve, 350));
        container.className = '';
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
            // 使用絕對角色判斷
            if (tx.payer === 'baobao') baobaoTotal += amount;
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

        // 更新 Segmented Control 樣式
        const singleBtn = document.getElementById('btnCalendarSingleMode');
        const rangeBtn = document.getElementById('btnCalendarRangeMode');
        const container = document.querySelector('.mode-switcher-container');

        if (singleBtn && rangeBtn && container) {
            if (mode === 'single') {
                singleBtn.classList.add('active');
                rangeBtn.classList.remove('active');
                container.classList.remove('range-mode');
            } else {
                rangeBtn.classList.add('active');
                singleBtn.classList.remove('active');
                container.classList.add('range-mode');
            }
        }

        this.renderCalendar();
    }

    /**
     * 單日模式下切換日期
     * @param {number} delta - 日期變化量（+1 下一天，-1 前一天）
     * @param {string} source - 滑動來源（'calendar' 或 'list'）
     */
    async changeSingleDay(delta, source = 'calendar') {
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

        // 如果是從清單滑動，播放滑卡動畫
        if (source === 'list') {
            await this.showDayTransactionsWithSwipeAnimation(newDateStr, delta);
        } else {
            // 日曆區域滑動：直接切換，無動畫
            this.renderCalendar();
            await this.showDayTransactions(newDateStr);
        }
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

    /**
     * 💖 根據顯示模式渲染日曆單格內容 💖
     */
    async renderCalendarDayContent(cell, dateStr, dailyExpenses) {
        const { type, mode } = this.displayMode;

        if (type === 'amount') {
            // 金額顯示模式
            await this.renderAmountMode(cell, dateStr, dailyExpenses, mode);
        } else if (type === 'category') {
            // 類別顯示模式
            await this.renderCategoryMode(cell, dateStr, mode);
        }
    }

    /**
     * 渲染金額模式
     */
    async renderAmountMode(cell, dateStr, dailyExpenses, mode) {
        let amount = 0;

        if (mode === 'total') {
            // 總花費（預設）
            amount = dailyExpenses[dateStr] || 0;
        } else {
            // 需要查詢當天交易來計算特定角色花費
            const transactions = await window.DataManager.getTransactionsByDate(dateStr);

            if (mode === 'baobao') {
                // 寶付的錢
                amount = transactions
                    .filter(tx => tx.payer === 'baobao')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
            } else if (mode === 'bubu') {
                // 步付的錢
                amount = transactions
                    .filter(tx => tx.payer === 'bubu')
                    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
            }
        }

        // 顯示金額
        if (amount > 0) {
            const amountEl = document.createElement('div');
            amountEl.className = 'text-xs text-[#E27D60] font-bold';
            amountEl.textContent = `$${Math.round(amount)}`;
            cell.appendChild(amountEl);
        }
    }

    /**
     * 渲染類別模式
     */
    async renderCategoryMode(cell, dateStr, categoryName) {
        // 查詢當天交易
        const transactions = await window.DataManager.getTransactionsByDate(dateStr);

        // 檢查是否有該類別的交易
        const hasCategory = transactions.some(tx => {
            const categories = tx.categories || [];
            return categories.includes(categoryName);
        });

        if (hasCategory) {
            // 顯示類別圖示
            const icon = this.categoryIcons[categoryName] || 'auto_stories';
            const iconEl = document.createElement('span');
            iconEl.className = 'material-symbols-outlined text-base category-icon-glow';
            iconEl.textContent = icon;
            iconEl.style.color = '#FF9EC7';  // 主題色
            iconEl.style.filter = 'drop-shadow(0 0 4px rgba(255, 158, 199, 0.8))';
            cell.appendChild(iconEl);
        }
    }

    /**
     * 💖 動態生成類別選項 💖
     */
    renderCategoryOptions() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        // 清空現有內容
        categoryList.innerHTML = '';

        // 遍歷所有類別（從 CATEGORY_ICONS 取得）
        Object.keys(this.categoryIcons).forEach(categoryName => {
            const icon = this.categoryIcons[categoryName];

            // 建立類別按鈕
            const button = document.createElement('button');
            button.className = 'dropdown-option';
            button.setAttribute('data-mode', categoryName);
            button.setAttribute('data-type', 'category');

            button.innerHTML = `
                <span class="material-symbols-outlined option-icon">${icon}</span>
                <span class="option-label">${categoryName}</span>
                <span class="checkmark hidden">✓</span>
            `;

            categoryList.appendChild(button);
        });

        console.log(`✅ 已動態生成 ${Object.keys(this.categoryIcons).length} 個類別選項`);
    }

    /**
     * 💖 初始化顯示模式選擇器 💖
     */
    initDisplayModeSelector() {
        const btn = document.getElementById('calendarDisplayModeBtn');
        const dropdown = document.getElementById('calendarDisplayModeDropdown');
        const categoryExpandBtn = document.querySelector('.category-expand-btn');
        const categoryList = document.getElementById('categoryList');

        if (!btn || !dropdown) {
            console.warn('⚠️ 顯示模式選擇器元素未找到，稍後重試');
            return;
        }

        console.log('✅ 顯示模式選擇器初始化成功');

        // 動態生成類別選項
        this.renderCategoryOptions();

        // 設定預設選中狀態（總花費）
        this.updateSelectedOption('amount', 'total');

        // 點擊主按鈕切換下拉選單
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('show');

            if (isOpen) {
                this.closeDisplayModeDropdown();
            } else {
                this.openDisplayModeDropdown();
            }
        });

        // 點擊下拉選項（使用事件委派處理動態生成的類別按鈕）
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();

            // 找到被點擊的 dropdown-option
            const option = e.target.closest('.dropdown-option[data-mode]');
            if (!option) return;

            const mode = option.dataset.mode;
            const type = option.dataset.type;

            this.changeDisplayMode(type, mode);
            this.closeDisplayModeDropdown();
        });

        // 點擊類別展開按鈕
        if (categoryExpandBtn && categoryList) {
            categoryExpandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = categoryList.classList.contains('show');

                if (isExpanded) {
                    categoryList.classList.remove('show');
                    categoryExpandBtn.classList.remove('expanded');
                } else {
                    categoryList.classList.add('show');
                    categoryExpandBtn.classList.add('expanded');
                }
            });
        }

        // 點擊外部關閉下拉選單
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                this.closeDisplayModeDropdown();
            }
        });
    }

    /**
     * 開啟下拉選單
     */
    openDisplayModeDropdown() {
        const btn = document.getElementById('calendarDisplayModeBtn');
        const dropdown = document.getElementById('calendarDisplayModeDropdown');

        btn.classList.add('active');
        dropdown.classList.add('show');
    }

    /**
     * 關閉下拉選單
     */
    closeDisplayModeDropdown() {
        const btn = document.getElementById('calendarDisplayModeBtn');
        const dropdown = document.getElementById('calendarDisplayModeDropdown');
        const categoryList = document.getElementById('categoryList');
        const categoryExpandBtn = document.querySelector('.category-expand-btn');

        btn.classList.remove('active');
        dropdown.classList.remove('show');

        // 同時收起類別列表
        if (categoryList) categoryList.classList.remove('show');
        if (categoryExpandBtn) categoryExpandBtn.classList.remove('expanded');
    }

    /**
     * 切換顯示模式
     */
    changeDisplayMode(type, mode) {
        this.displayMode.type = type;
        this.displayMode.mode = mode;

        // 更新按鈕顯示
        this.updateDisplayModeButton();

        // 更新選中狀態
        this.updateSelectedOption(type, mode);

        // 重新渲染日曆
        this.renderCalendar();

        console.log('📅 切換顯示模式:', { type, mode });
    }

    /**
     * 更新顯示模式按鈕的文字和圖示
     */
    updateDisplayModeButton() {
        const btn = document.getElementById('calendarDisplayModeBtn');
        if (!btn) return;

        const iconSpan = btn.querySelector('.mode-icon');
        const labelSpan = btn.querySelector('.mode-label');

        const { type, mode } = this.displayMode;

        if (type === 'amount') {
            const modeConfig = {
                'total': { icon: '💰', label: '總花費' },
                'baobao': { icon: '🧸', label: '寶花費用' },
                'bubu': { icon: '🐾', label: '步花費用' }
            };
            const config = modeConfig[mode] || modeConfig['total'];
            iconSpan.textContent = config.icon;
            labelSpan.textContent = config.label;
        } else if (type === 'category') {
            // 類別模式：顯示類別圖示和名稱
            const icon = this.categoryIcons[mode] || 'auto_stories';
            iconSpan.innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.5rem;">${icon}</span>`;
            labelSpan.textContent = mode;
        }
    }

    /**
     * 更新選中選項的樣式
     */
    updateSelectedOption(type, mode) {
        const dropdown = document.getElementById('calendarDisplayModeDropdown');
        if (!dropdown) return;

        // 清除所有選中狀態
        dropdown.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
            const checkmark = opt.querySelector('.checkmark');
            if (checkmark) checkmark.classList.add('hidden');
        });

        // 設定當前選中項
        const selected = dropdown.querySelector(`.dropdown-option[data-type="${type}"][data-mode="${mode}"]`);
        if (selected) {
            selected.classList.add('selected');
            const checkmark = selected.querySelector('.checkmark');
            if (checkmark) checkmark.classList.remove('hidden');
        }
    }

    /**
     * 滾動到交易清單區域（平滑滾動）
     * 讓使用者有「清單滑上來」的感覺
     */
    scrollToTransactionsList() {
        const dayDetails = document.getElementById('dayDetails');
        const mainContent = document.querySelector('.main-content');

        if (!dayDetails || !mainContent) {
            console.warn('⚠️ 找不到 dayDetails 或 mainContent');
            return;
        }

        // 使用 requestAnimationFrame 確保 DOM 已更新
        requestAnimationFrame(() => {
            // 計算 dayDetails 的位置（相對於 mainContent 的頂部）
            const detailsRect = dayDetails.getBoundingClientRect();
            const contentRect = mainContent.getBoundingClientRect();

            // 目標滾動位置：讓 dayDetails 距離頂部有一點間距（舒適的閱讀位置）
            const targetOffset = 80; // 距離頂部 80px
            const currentScrollTop = mainContent.scrollTop;
            const detailsOffsetTop = detailsRect.top - contentRect.top + currentScrollTop;
            const scrollDistance = detailsOffsetTop - targetOffset;

            console.log('📜 滾動參數:', {
                currentScrollTop,
                detailsOffsetTop,
                targetOffset,
                scrollDistance
            });

            // 平滑滾動
            mainContent.scrollTo({
                top: Math.max(0, scrollDistance), // 確保不會滾動到負值
                behavior: 'smooth'
            });
        });
    }
}

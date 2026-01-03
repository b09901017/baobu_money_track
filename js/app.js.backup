// ==================== 應用主控制器 ====================

class CoupleApp {
    constructor() {
        this.currentView = 'list';
        this.currentPage = 'homePage';
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.selectedCategories = [];
        this.currentPeriod = 'month';
        this.currentDayView = new Date(); // 當前查看的日期
        this.isRangeMode = false; // 是否為區間模式
        this.rangeStart = null;
        this.rangeEnd = null;

        // 日期區間選擇器狀態
        this.rangeCalendarMonth = new Date(); // 日期選擇器顯示的月份
        this.tempRangeStart = null; // 臨時選擇的開始日期
        this.tempRangeEnd = null; // 臨時選擇的結束日期
        this.isSelectingEnd = false; // 是否正在選擇結束日期

        // 分析頁面日期選擇
        this.isAnalyticsDateSelection = false; // 是否為分析頁面選擇日期
        this.analyticsStartDate = null; // 分析頁面自訂開始日期
        this.analyticsEndDate = null; // 分析頁面自訂結束日期
        this.analyticsCustomBtn = null; // 分析頁面自訂按鈕引用

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateNotebookTitle();
        this.updateHomePage();
        this.updateNotebooksPage();
    }

    updateNotebookTitle() {
        const notebook = window.DataManager.getCurrentNotebook();
        if (notebook) {
            document.getElementById('currentNotebookTitle').textContent = notebook.name;
        }
    }

    // ==================== 事件綁定 ====================
    bindEvents() {
        // 底部導航切換
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.switchPage(page);
                }
            });
        });

        // 視圖切換
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // 浮動新增按鈕
        document.getElementById('fabAdd').addEventListener('click', () => {
            this.openAddTransactionSheet();
        });

        // 關閉 Bottom Sheet
        document.getElementById('btnCloseSheet').addEventListener('click', () => {
            this.closeAddTransactionSheet();
        });

        document.querySelector('.bottom-sheet-overlay').addEventListener('click', () => {
            this.closeAddTransactionSheet();
        });

        // 分類標籤複選
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.category;
                this.toggleCategory(category, e.currentTarget);
            });
        });

        // 新增自訂標籤
        document.getElementById('btnAddCustomCategory').addEventListener('click', (e) => {
            e.preventDefault();
            this.addCustomCategory();
        });

        // 照片上傳
        document.getElementById('btnUploadPhoto').addEventListener('click', () => {
            document.getElementById('photoInput').click();
        });

        document.getElementById('photoInput').addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });

        // 表單提交
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitTransaction();
        });

        // 日曆導航
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // 時間軸日期切換
        document.getElementById('prevDayBtn').addEventListener('click', () => {
            this.changeDay(-1);
        });

        document.getElementById('nextDayBtn').addEventListener('click', () => {
            this.changeDay(1);
        });

        document.getElementById('btnToday').addEventListener('click', () => {
            this.goToToday();
        });

        document.getElementById('btnPickDate').addEventListener('click', () => {
            const input = document.getElementById('datePickerInput');
            input.value = window.DataManager.formatDate(this.currentDayView);
            input.showPicker ? input.showPicker() : input.click();
        });

        document.getElementById('datePickerInput').addEventListener('change', (e) => {
            if (e.target.value) {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                this.currentDayView = selectedDate;
                this.isRangeMode = false;
                this.updateTimelineView();
            }
        });

        document.getElementById('btnAddFromEmpty').addEventListener('click', () => {
            this.openAddTransactionSheet();
        });

        // 日期區間選擇
        document.getElementById('btnDateRange').addEventListener('click', () => {
            this.openDateRangeModal();
        });

        document.getElementById('btnCloseDateRange').addEventListener('click', () => {
            this.closeDateRangeModal();
        });

        document.getElementById('dateRangeOverlay').addEventListener('click', () => {
            this.closeDateRangeModal();
        });

        document.getElementById('btnCancelRange').addEventListener('click', () => {
            this.closeDateRangeModal();
        });

        document.getElementById('btnApplyRange').addEventListener('click', () => {
            this.applyDateRange();
        });

        document.querySelectorAll('.quick-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = e.currentTarget.dataset.days;
                this.setQuickRange(days);
            });
        });

        // 日期區間日曆導航
        document.getElementById('prevRangeMonth').addEventListener('click', () => {
            this.changeRangeCalendarMonth(-1);
        });

        document.getElementById('nextRangeMonth').addEventListener('click', () => {
            this.changeRangeCalendarMonth(1);
        });

        // 分析頁日期篩選
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.currentTarget.dataset.period;
                this.changeDateFilter(period, e.currentTarget);
            });
        });

        // 關閉詳情模態框
        document.getElementById('btnCloseDetailModal').addEventListener('click', () => {
            this.closeTransactionDetail();
        });

        document.getElementById('detailModalOverlay').addEventListener('click', () => {
            this.closeTransactionDetail();
        });
    }

    // ==================== 頁面切換 ====================
    switchPage(pageId) {
        // 更新頁面顯示 - 使用 Tailwind 的 hidden 類
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
        }

        // 更新導航按鈕
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('w-14', 'h-14', '-translate-y-4', 'bg-gradient-to-tr', 'from-macaron-rose', 'to-macaron-pink', 'text-white', 'shadow-lg', 'border-4', 'border-white', 'ring-1', 'ring-macaron-rose/30');
            btn.classList.add('w-10', 'h-10', 'text-warm-brown/40');

            if (btn.dataset.page === pageId) {
                btn.classList.add('active');
                btn.classList.remove('w-10', 'h-10', 'text-warm-brown/40');
                btn.classList.add('w-14', 'h-14', '-translate-y-4', 'bg-gradient-to-tr', 'from-macaron-rose', 'to-macaron-pink', 'text-white', 'shadow-lg', 'border-4', 'border-white', 'ring-1', 'ring-macaron-rose/30');
            }
        });

        this.currentPage = pageId;

        // 載入對應頁面資料
        if (pageId === 'homePage') {
            this.updateHomePage();
        } else if (pageId === 'notebooksPage') {
            this.updateNotebooksPage();
        } else if (pageId === 'analyticsPage') {
            this.updateAnalyticsPage();
        }
    }

    switchView(view) {
        this.currentView = view;

        // 更新切換按鈕
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white', 'border-transparent', 'shadow-watercolor-layered');
                btn.classList.remove('bg-white/60', 'text-soft-ink');
            } else {
                btn.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white', 'border-transparent', 'shadow-watercolor-layered');
                btn.classList.add('bg-white/60', 'text-soft-ink');
            }
        });

        // 更新視圖容器
        if (view === 'list') {
            document.getElementById('listView').classList.remove('hidden');
            document.getElementById('listView').classList.add('active');
            document.getElementById('calendarView').classList.add('hidden');
            document.getElementById('calendarView').classList.remove('active');
        } else if (view === 'calendar') {
            document.getElementById('listView').classList.add('hidden');
            document.getElementById('listView').classList.remove('active');
            document.getElementById('calendarView').classList.remove('hidden');
            document.getElementById('calendarView').classList.add('active');
            this.renderCalendar();
        }
    }

    // ==================== 首頁更新 ====================
    updateHomePage() {
        this.updateBalanceCard();
        this.updateTimelineView();
    }

    updateBalanceCard() {
        const balance = window.DataManager.calculateBalance();
        const balanceStatus = document.getElementById('balanceStatus');

        if (balance.status === 'settled') {
            balanceStatus.textContent = '已結清 💖';
        } else if (balance.status === 'owed') {
            balanceStatus.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        } else {
            balanceStatus.textContent = `${balance.debtor} 欠 ${balance.creditor} $${balance.amount.toFixed(0)}`;
        }
    }

    updateTimelineView() {
        let transactions;

        if (this.isRangeMode && this.rangeStart && this.rangeEnd) {
            // 區間模式
            const startStr = window.DataManager.formatDate(this.rangeStart);
            const endStr = window.DataManager.formatDate(this.rangeEnd);
            transactions = window.DataManager.getTransactionsByDateRange(startStr, endStr);
        } else {
            // 單日模式
            const dateStr = window.DataManager.formatDate(this.currentDayView);
            transactions = window.DataManager.getTransactionsByDate(dateStr);
        }

        // 更新日期顯示
        this.updateDayDisplay();

        // 更新時間軸
        const container = document.getElementById('transactionList');
        const emptyState = document.getElementById('emptyDayState');
        const timelineContainer = document.getElementById('timelineContainer');

        if (transactions.length === 0) {
            timelineContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        timelineContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // 按創建時間排序（最新的在上）
        transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        container.innerHTML = transactions.map((tx, index) => this.renderTimelineItem(tx, index)).join('');

        // 綁定點擊事件
        container.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const txId = e.currentTarget.dataset.transactionId;
                this.showTransactionDetail(txId);
            });
        });

        // 更新當天花費統計（只在非區間模式顯示）
        if (!this.isRangeMode) {
            this.updateDayExpenseStats(transactions);
        } else {
            document.getElementById('dayExpenseStats').classList.add('hidden');
        }
    }

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
            statsCard.classList.remove('hidden');

            // 只顯示有花費的人
            if (baobaoTotal > 0) {
                baobaoCard.classList.remove('hidden');
                document.getElementById('baobaoExpense').textContent = `$${Math.round(baobaoTotal)}`;
            } else {
                baobaoCard.classList.add('hidden');
            }

            if (bubuTotal > 0) {
                bubuCard.classList.remove('hidden');
                document.getElementById('bubuExpense').textContent = `$${Math.round(bubuTotal)}`;
            } else {
                bubuCard.classList.add('hidden');
            }

            document.getElementById('totalDayExpense').textContent = `$${Math.round(total)}`;
        } else {
            statsCard.classList.add('hidden');
        }
    }

    updateDayDisplay() {
        const today = new Date();
        const dayDisplay = document.getElementById('currentDayDisplay');
        const dateDisplay = document.getElementById('currentDateDisplay');

        // 判斷是否是今天、昨天、明天
        const isToday = this.isSameDay(this.currentDayView, today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = this.isSameDay(this.currentDayView, yesterday);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = this.isSameDay(this.currentDayView, tomorrow);

        if (isToday) {
            dayDisplay.textContent = '今天';
        } else if (isYesterday) {
            dayDisplay.textContent = '昨天';
        } else if (isTomorrow) {
            dayDisplay.textContent = '明天';
        } else {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            dayDisplay.textContent = weekdays[this.currentDayView.getDay()];
        }

        dateDisplay.textContent = `${this.currentDayView.getFullYear()} 年 ${this.currentDayView.getMonth() + 1} 月 ${this.currentDayView.getDate()} 日`;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    changeDay(delta) {
        this.currentDayView = new Date(this.currentDayView);
        this.currentDayView.setDate(this.currentDayView.getDate() + delta);
        this.updateTimelineView();
    }

    goToToday() {
        this.currentDayView = new Date();
        this.isRangeMode = false;
        this.updateTimelineView();
    }

    // ==================== 日期區間功能 ====================
    openDateRangeModal() {
        // 重置選擇狀態
        this.tempRangeStart = null;
        this.tempRangeEnd = null;
        this.isSelectingEnd = false;
        this.rangeCalendarMonth = new Date();

        // 更新顯示
        this.updateRangeDisplays();
        this.renderRangeCalendar();

        document.getElementById('dateRangeModal').classList.remove('hidden');
    }

    closeDateRangeModal() {
        document.getElementById('dateRangeModal').classList.add('hidden');
        this.isAnalyticsDateSelection = false;
    }

    setQuickRange(days) {
        if (days === 'all') {
            // 全部：選擇所有交易
            const transactions = window.DataManager.getTransactions();
            if (transactions.length === 0) {
                alert('目前沒有任何交易記錄');
                return;
            }

            // 找到最早和最晚的交易日期
            const dates = transactions.map(tx => new Date(tx.date));
            const start = new Date(Math.min(...dates));
            const end = new Date(Math.max(...dates));

            this.tempRangeStart = start;
            this.tempRangeEnd = end;
        } else {
            // 指定天數
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - parseInt(days) + 1);

            this.tempRangeStart = start;
            this.tempRangeEnd = end;
        }

        document.getElementById('rangeStartDate').value = window.DataManager.formatDate(this.tempRangeStart);
        document.getElementById('rangeEndDate').value = window.DataManager.formatDate(this.tempRangeEnd);

        this.updateRangeDisplays();
        this.renderRangeCalendar();
    }

    changeRangeCalendarMonth(offset) {
        this.rangeCalendarMonth = new Date(
            this.rangeCalendarMonth.getFullYear(),
            this.rangeCalendarMonth.getMonth() + offset,
            1
        );
        this.renderRangeCalendar();
    }

    renderRangeCalendar() {
        const year = this.rangeCalendarMonth.getFullYear();
        const month = this.rangeCalendarMonth.getMonth();

        // 更新月份標題
        document.getElementById('rangeCalendarMonth').textContent = `${year}年${month + 1}月`;

        const grid = document.getElementById('rangeCalendarGrid');
        grid.innerHTML = '';

        // 取得該月第一天和最後一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 取得第一天是星期幾（0 = 星期日）
        const firstDayOfWeek = firstDay.getDay();

        // 填充前面的空白
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'aspect-square';
            grid.appendChild(emptyCell);
        }

        // 填充日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = window.DataManager.formatDate(date);

            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-hand font-bold transition-all hover:bg-macaron-pink/20';

            // 檢查是否在選擇範圍內
            let isInRange = false;
            let isStart = false;
            let isEnd = false;

            if (this.tempRangeStart && this.tempRangeEnd) {
                const startTime = this.tempRangeStart.getTime();
                const endTime = this.tempRangeEnd.getTime();
                const currentTime = date.getTime();

                isStart = dateStr === window.DataManager.formatDate(this.tempRangeStart);
                isEnd = dateStr === window.DataManager.formatDate(this.tempRangeEnd);
                isInRange = currentTime >= startTime && currentTime <= endTime;
            } else if (this.tempRangeStart) {
                isStart = dateStr === window.DataManager.formatDate(this.tempRangeStart);
            }

            // 應用樣式
            if (isStart || isEnd) {
                cell.className += ' bg-gradient-to-br from-[#FF9EAA] to-[#FFB7B2] text-white shadow-watercolor-layered';
            } else if (isInRange) {
                cell.className += ' bg-macaron-pink/30 text-soft-ink';
            } else {
                cell.className += ' text-warm-brown hover:text-soft-ink';
            }

            // 日期文字
            const dayText = document.createElement('div');
            dayText.textContent = day;
            cell.appendChild(dayText);

            // 點擊事件
            cell.addEventListener('click', () => {
                this.selectRangeDate(date);
            });

            grid.appendChild(cell);
        }
    }

    selectRangeDate(date) {
        if (!this.tempRangeStart || (this.tempRangeStart && this.tempRangeEnd)) {
            // 第一次點擊或重新開始選擇
            this.tempRangeStart = date;
            this.tempRangeEnd = null;
            this.isSelectingEnd = true;
        } else {
            // 第二次點擊，選擇結束日期
            if (date < this.tempRangeStart) {
                // 如果選擇的日期早於開始日期，交換它們
                this.tempRangeEnd = this.tempRangeStart;
                this.tempRangeStart = date;
            } else {
                this.tempRangeEnd = date;
            }
            this.isSelectingEnd = false;
        }

        // 更新隱藏的輸入值
        document.getElementById('rangeStartDate').value = window.DataManager.formatDate(this.tempRangeStart);
        if (this.tempRangeEnd) {
            document.getElementById('rangeEndDate').value = window.DataManager.formatDate(this.tempRangeEnd);
        }

        this.updateRangeDisplays();
        this.renderRangeCalendar();
    }

    updateRangeDisplays() {
        const startDisplay = document.getElementById('selectedStartDisplay');
        const endDisplay = document.getElementById('selectedEndDisplay');

        if (this.tempRangeStart) {
            const start = this.tempRangeStart;
            startDisplay.textContent = `${start.getMonth() + 1}/${start.getDate()}`;
        } else {
            startDisplay.textContent = '未選擇';
        }

        if (this.tempRangeEnd) {
            const end = this.tempRangeEnd;
            endDisplay.textContent = `${end.getMonth() + 1}/${end.getDate()}`;
        } else {
            endDisplay.textContent = '未選擇';
        }
    }

    applyDateRange() {
        const startStr = document.getElementById('rangeStartDate').value;
        const endStr = document.getElementById('rangeEndDate').value;

        if (!startStr || !endStr) {
            alert('請選擇開始和結束日期');
            return;
        }

        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');

        if (start > end) {
            alert('開始日期不能晚於結束日期');
            return;
        }

        // 檢查是否為分析頁面的日期選擇
        if (this.isAnalyticsDateSelection) {
            this.applyDateRangeForAnalytics(start, end);
        } else {
            this.isRangeMode = true;
            this.rangeStart = start;
            this.rangeEnd = end;
            this.closeDateRangeModal();
            this.updateTimelineView();
        }
    }

    openDateRangeModalForAnalytics() {
        this.isAnalyticsDateSelection = true;

        // 重置選擇狀態
        this.tempRangeStart = null;
        this.tempRangeEnd = null;
        this.isSelectingEnd = false;
        this.rangeCalendarMonth = new Date();

        // 更新顯示
        this.updateRangeDisplays();
        this.renderRangeCalendar();

        document.getElementById('dateRangeModal').classList.remove('hidden');
    }

    applyDateRangeForAnalytics(start, end) {
        this.analyticsStartDate = start;
        this.analyticsEndDate = end;

        // 更新按鈕樣式
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            b.classList.add('text-soft-ink');
        });

        if (this.analyticsCustomBtn) {
            this.analyticsCustomBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            this.analyticsCustomBtn.classList.remove('text-soft-ink');
        }

        this.currentPeriod = 'custom';
        this.isAnalyticsDateSelection = false;
        this.closeDateRangeModal();
        this.updateAnalyticsPage('custom');
    }

    renderTransactionItem(tx) {
        const categoryIcons = {
            '吃吃': 'restaurant',
            '玩': 'local_activity',
            '交通': 'directions_subway',
            '購物': 'shopping_bag',
            '生活': 'cottage',
            '其他': 'auto_stories'
        };

        const categoryColors = {
            '吃吃': 'bg-macaron-pink/20',
            '玩': 'bg-macaron-blue/20',
            '交通': 'bg-macaron-green/20',
            '購物': 'bg-macaron-purple/20',
            '生活': 'bg-macaron-cream/40',
            '其他': 'bg-warm-brown/10'
        };

        const icon = tx.categories && tx.categories.length > 0
            ? categoryIcons[tx.categories[0]] || 'auto_stories'
            : 'auto_stories';

        const colorClass = tx.categories && tx.categories.length > 0
            ? categoryColors[tx.categories[0]] || 'bg-warm-brown/10'
            : 'bg-warm-brown/10';

        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        return `
            <div class="transaction-item bg-white rounded-2xl p-4 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group" data-transaction-id="${tx.id}">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center text-soft-ink shrink-0 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-2xl">${icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-hand font-bold text-lg text-soft-ink truncate">${tx.item_name}</h4>
                        <p class="text-sm text-warm-brown/80 truncate mt-0.5">
                            ${payerText} 付 · ${beneficiaryText} · ${this.formatDisplayDate(tx.date)}
                        </p>
                    </div>
                    <div class="text-right">
                        <div class="font-display font-bold text-xl text-[#E27D60]">$${tx.amount}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTimelineItem(tx, index) {
        const categoryIcons = {
            '吃吃': 'restaurant',
            '玩': 'local_activity',
            '交通': 'directions_subway',
            '購物': 'shopping_bag',
            '生活': 'cottage',
            '其他': 'auto_stories'
        };

        const categoryColors = {
            '吃吃': 'bg-macaron-pink/20 border-macaron-pink',
            '玩': 'bg-macaron-blue/20 border-macaron-blue',
            '交通': 'bg-macaron-green/20 border-macaron-green',
            '購物': 'bg-macaron-purple/20 border-macaron-purple',
            '生活': 'bg-macaron-cream/40 border-macaron-cream',
            '其他': 'bg-warm-brown/10 border-warm-brown'
        };

        const icon = tx.categories && tx.categories.length > 0
            ? categoryIcons[tx.categories[0]] || 'auto_stories'
            : 'auto_stories';

        const colorClass = tx.categories && tx.categories.length > 0
            ? categoryColors[tx.categories[0]] || 'bg-warm-brown/10 border-warm-brown'
            : 'bg-warm-brown/10 border-warm-brown';

        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        // 計算時間（使用 created_at）
        const time = new Date(tx.created_at);
        const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

        return `
            <div class="relative">
                <!-- 時間軸點 -->
                <div class="absolute -left-8 top-6 w-4 h-4 rounded-full bg-white border-[3px] ${colorClass} shadow-sm z-10"></div>

                <!-- 交易卡片 -->
                <div class="transaction-item bg-white rounded-2xl p-4 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group border-l-4 ${colorClass}" data-transaction-id="${tx.id}">
                    <!-- 時間標籤 -->
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xs font-hand font-bold text-warm-brown/60">${timeStr}</span>
                        <div class="h-px flex-1 bg-warm-brown/10"></div>
                    </div>

                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-soft-ink shrink-0 group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-xl">${icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-hand font-bold text-lg text-soft-ink truncate">${tx.item_name}</h4>
                            <p class="text-sm text-warm-brown/80 mt-0.5">
                                ${payerText} 付給 ${beneficiaryText}
                            </p>
                            ${tx.note ? `<p class="text-xs text-warm-brown/60 mt-1 italic truncate">📝 ${tx.note}</p>` : ''}
                        </div>
                        <div class="text-right">
                            <div class="font-display font-bold text-2xl text-[#E27D60]">$${tx.amount}</div>
                        </div>
                    </div>

                    <!-- 分類標籤 -->
                    ${tx.categories && tx.categories.length > 0 ? `
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${tx.categories.map(cat => `<span class="px-3 py-1 rounded-full bg-warm-brown/10 text-xs font-hand font-bold text-warm-brown">${cat}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    loadMoreTransactions() {
        const currentDate = window.DataManager.getToday();
        const todayTransactions = window.DataManager.getTransactionsByDate(currentDate);

        const container = document.getElementById('transactionList');
        const btn = document.getElementById('btnLoadMore');

        if (todayTransactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">今天尚無交易記錄 ✨</p>';
        } else {
            container.innerHTML = todayTransactions.map(tx => this.renderTransactionItem(tx)).join('');

            // 綁定點擊事件
            container.querySelectorAll('.transaction-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const txId = e.currentTarget.dataset.transactionId;
                    this.showTransactionDetail(txId);
                });
            });
        }

        btn.textContent = '收起 ✨';
        btn.onclick = () => {
            this.updateTransactionList(5);
            btn.textContent = '查看更多 ✨';
            btn.onclick = () => this.loadMoreTransactions();
        };
    }

    // ==================== 日曆視圖 ====================
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        document.getElementById('currentMonth').textContent = `${year}年${month + 1}月`;

        const dailyExpenses = window.DataManager.getDailyExpenses(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const grid = document.getElementById('calendarGrid');
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
        this.selectedDate = dateStr;

        this.showDayTransactions(dateStr);
    }

    showDayTransactions(dateStr) {
        const transactions = window.DataManager.getTransactionsByDate(dateStr);
        const container = document.getElementById('dayTransactions');
        const header = document.getElementById('selectedDate');

        header.textContent = this.formatDisplayDate(dateStr);

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-4 font-hand">當天無交易記錄 ✨</p>';
        } else {
            container.innerHTML = transactions.map(tx => this.renderTransactionItem(tx)).join('');

            // 綁定點擊事件
            container.querySelectorAll('.transaction-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const txId = e.currentTarget.dataset.transactionId;
                    this.showTransactionDetail(txId);
                });
            });
        }
    }

    changeMonth(delta) {
        this.currentMonth = new Date(
            this.currentMonth.getFullYear(),
            this.currentMonth.getMonth() + delta,
            1
        );
        this.renderCalendar();
    }

    // ==================== 帳本頁面（精美書本）====================
    updateNotebooksPage() {
        const notebooks = window.DataManager.getNotebooks();
        const container = document.getElementById('notebooksList');
        const currentNotebookId = window.DataManager.currentNotebook;

        const bookColors = [
            { spine: 'from-[#8caec4] to-[#AEC6CF]', ribbon: 'bg-rose-400', gradient: 'from-macaron-blue/30 to-transparent' },
            { spine: 'from-[#d6a578] to-[#E8C4A3]', ribbon: 'bg-yellow-400/90', gradient: 'from-macaron-pink/30 to-transparent' },
            { spine: 'from-[#c4a6b2] to-[#E2C2C6]', ribbon: 'bg-macaron-green', gradient: 'from-macaron-purple/30 to-transparent' },
            { spine: 'from-[#a8c5b0] to-[#C8E6C9]', ribbon: 'bg-macaron-pink', gradient: 'from-macaron-green/30 to-transparent' },
        ];

        const booksHTML = notebooks.map((nb, index) => {
            const colorScheme = bookColors[index % bookColors.length];
            const isActive = nb.id === currentNotebookId;
            const isFirst = index === 0; // 第一個是日常記帳本，最大

            // 計算這個記帳本的花費統計
            const nbTransactions = window.DataManager.transactions.filter(tx => tx.notebook_id === nb.id);
            let baobaoTotal = 0;
            let bubuTotal = 0;
            let total = 0;

            nbTransactions.forEach(tx => {
                const amount = parseFloat(tx.amount);
                total += amount;
                if (tx.payer === 'me') {
                    baobaoTotal += amount;
                } else {
                    bubuTotal += amount;
                }
            });

            // 如果是第一個帳本（日常），顯示欠債狀態，否則顯示花費統計
            let statsHTML = '';
            if (isFirst) {
                const balance = window.DataManager.calculateBalance();
                if (balance.status === 'settled') {
                    statsHTML = '<div class="text-xs text-warm-brown/80">已結清 💖</div>';
                } else {
                    statsHTML = `<div class="text-xs text-warm-brown/80">${balance.debtor}欠${balance.creditor} $${Math.round(balance.amount)}</div>`;
                }
            } else {
                statsHTML = `
                    <div class="space-y-0.5 text-xs text-warm-brown/80">
                        ${baobaoTotal > 0 ? `<div>寶 $${Math.round(baobaoTotal)}</div>` : ''}
                        ${bubuTotal > 0 ? `<div>步 $${Math.round(bubuTotal)}</div>` : ''}
                        ${total > 0 ? `<div class="text-[#E27D60] font-bold">共 $${Math.round(total)}</div>` : ''}
                    </div>
                `;
            }

            return `
                <div class="group relative cursor-pointer ${isFirst ? 'col-span-2' : ''}" data-notebook-id="${nb.id}">
                    <div class="relative w-full aspect-[3/4] rounded-r-xl rounded-l-md shadow-book bg-white transition-all duration-300 transform ${isActive ? '-translate-y-2 scale-105 shadow-floating ring-2 ring-antique-gold' : 'hover:-translate-y-2 hover:rotate-1'} overflow-visible">
                        <!-- 書脊 -->
                        <div class="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r ${colorScheme.spine} rounded-l-md z-20 shadow-md"></div>

                        <!-- 書本內容 -->
                        <div class="absolute inset-0 left-2 bg-gradient-to-br ${colorScheme.gradient} rounded-r-xl overflow-hidden flex flex-col justify-end p-4">
                            <div class="absolute inset-0 book-texture opacity-20"></div>
                            <div class="relative z-10">
                                <h3 class="text-soft-ink ${isFirst ? 'text-2xl' : 'text-xl'} font-hand font-bold leading-tight mb-2">${nb.name}</h3>
                                ${statsHTML}
                            </div>
                        </div>

                        <!-- 書籤 -->
                        <div class="absolute -top-1 right-6 w-6 h-12 ${colorScheme.ribbon} shadow-md z-30 flex justify-center">
                            <div class="absolute bottom-[-8px] w-full h-4 ${colorScheme.ribbon}" style="clip-path: polygon(0 0, 50% 100%, 100% 0);"></div>
                        </div>
                    </div>
                    <!-- 陰影 -->
                    <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/10 rounded-[100%] blur-sm pointer-events-none group-hover:w-3/4 group-hover:mx-auto transition-all"></div>
                </div>
            `;
        }).join('');

        // 新增帳本按鈕
        const addBookHTML = `
            <div class="group relative cursor-pointer" id="btnAddNotebook">
                <div class="relative w-full aspect-[3/4] rounded-xl border-[3px] border-dashed border-macaron-rose/50 bg-white/20 shadow-watercolor-layered flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-white/40 hover:border-macaron-rose hover:-translate-y-1 backdrop-blur-sm overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-warm-brown/5 via-transparent to-warm-brown/5 opacity-50"></div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="absolute top-6 left-6 text-antique-gold/40 text-[12px] group-hover:animate-ping">✦</span>
                        <span class="absolute bottom-10 right-8 text-antique-gold/40 text-[16px] group-hover:animate-bounce" style="animation-delay: 0.5s;">✧</span>
                        <span class="absolute top-1/2 right-4 text-antique-gold/40 text-[10px] group-hover:animate-pulse" style="animation-delay: 1s;">✦</span>
                    </div>
                    <div class="w-16 h-16 rounded-full bg-white text-macaron-rose flex items-center justify-center mb-1 group-hover:scale-110 transition-all duration-300 shadow-sm border border-macaron-rose/30">
                        <span class="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <div class="px-2">
                        <h3 class="text-warm-brown font-hand font-bold text-lg leading-tight group-hover:text-soft-ink transition-colors">新故事</h3>
                        <p class="text-[10px] uppercase tracking-wider text-warm-brown/60 mt-1">New Chapter</p>
                    </div>
                </div>
                <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/5 rounded-[100%] blur-sm pointer-events-none"></div>
            </div>
        `;

        container.innerHTML = booksHTML + addBookHTML;

        // 綁定點擊事件
        container.querySelectorAll('[data-notebook-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                const notebookId = e.currentTarget.dataset.notebookId;
                this.switchNotebook(notebookId);
            });
        });

        document.getElementById('btnAddNotebook').addEventListener('click', () => {
            this.addNewNotebook();
        });
    }

    switchNotebook(notebookId) {
        const notebook = window.DataManager.switchNotebook(notebookId);
        if (notebook) {
            this.updateNotebookTitle();
            this.updateNotebooksPage();
            this.updateHomePage();
            // 直接跳到首頁
            this.switchPage('homePage');
        }
    }

    addNewNotebook() {
        const name = prompt('請輸入帳本名稱：');
        if (name && name.trim()) {
            window.DataManager.addNotebook(name.trim());
            this.updateNotebooksPage();
        }
    }

    // ==================== 分析頁面 ====================
    updateAnalyticsPage(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const transactions = window.DataManager.getTransactionsByDateRange(startDate, endDate);

        const stats = window.DataManager.getExpenseStats(transactions);
        document.getElementById('totalExpense').textContent = `$${Math.round(stats.totalExpense)}`;
        document.getElementById('myExpense').textContent = `$${Math.round(stats.myExpense)}`;
        document.getElementById('partnerExpense').textContent = `$${Math.round(stats.partnerExpense)}`;

        const categoryStats = window.DataManager.getCategoryStats(transactions);
        this.renderCategoryStats(categoryStats);

        const container = document.getElementById('analyticsTransactionList');
        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">該期間無交易記錄 ✨</p>';
        } else {
            container.innerHTML = transactions.map(tx => this.renderTransactionItem(tx)).join('');

            // 綁定點擊事件
            container.querySelectorAll('.transaction-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const txId = e.currentTarget.dataset.transactionId;
                    this.showTransactionDetail(txId);
                });
            });
        }
    }

    renderCategoryStats(stats) {
        const container = document.getElementById('categoryList');
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

    showCategoryDetail(category) {
        // 獲取當前篩選期間的交易
        const { startDate, endDate } = this.getDateRange(this.currentPeriod || 'month');
        const allTransactions = window.DataManager.getTransactionsByDateRange(startDate, endDate);

        // 篩選出包含該分類的交易
        const categoryTransactions = allTransactions.filter(tx =>
            tx.categories && tx.categories.includes(category)
        );

        // 更新交易列表
        const container = document.getElementById('analyticsTransactionList');
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
                ${categoryTransactions.map(tx => this.renderTransactionItem(tx)).join('')}
            `;

            // 綁定返回按鈕
            container.querySelector('.back-to-all-btn').addEventListener('click', () => {
                this.updateAnalyticsPage(this.currentPeriod || 'month');
            });

            // 綁定交易點擊事件
            container.querySelectorAll('.transaction-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const txId = e.currentTarget.dataset.transactionId;
                    this.showTransactionDetail(txId);
                });
            });
        }

        // 滾動到交易列表
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    changeDateFilter(period, btn) {
        if (period === 'custom') {
            // 開啟日期區間選擇器
            this.analyticsCustomBtn = btn;
            this.openDateRangeModalForAnalytics();
            return;
        }

        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            b.classList.add('text-soft-ink');
        });

        btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
        btn.classList.remove('text-soft-ink');

        this.currentPeriod = period;
        this.updateAnalyticsPage(period);
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
        } else if (period === 'custom' && this.analyticsStartDate && this.analyticsEndDate) {
            // 使用自訂的日期範圍
            startDate = this.analyticsStartDate;
            endDate = this.analyticsEndDate;
        } else {
            // 預設顯示所有
            startDate = new Date(2000, 0, 1);
            endDate = new Date(2100, 0, 1);
        }

        return {
            startDate: window.DataManager.formatDate(startDate),
            endDate: window.DataManager.formatDate(endDate)
        };
    }

    // ==================== 表單操作 ====================
    openAddTransactionSheet() {
        const sheet = document.getElementById('addTransactionSheet');
        sheet.classList.remove('hidden');

        // 設定今天日期
        document.getElementById('transactionDate').valueAsDate = new Date();

        // 渲染自訂分類
        this.renderCustomCategories();

        // 重置表單
        this.resetForm();
    }

    closeAddTransactionSheet() {
        const sheet = document.getElementById('addTransactionSheet');
        sheet.classList.add('hidden');
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionDate').valueAsDate = new Date();
        this.selectedCategories = [];

        // 重置分類選擇視覺效果
        document.querySelectorAll('.tag-btn > div').forEach(div => {
            div.classList.remove('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110');
        });

        // 清除照片預覽
        document.getElementById('photoPreview').innerHTML = '';
    }

    toggleCategory(category, btn) {
        const iconDiv = btn.querySelector('div');
        const index = this.selectedCategories.indexOf(category);

        if (index > -1) {
            this.selectedCategories.splice(index, 1);
            iconDiv.classList.remove('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110', 'text-white');
        } else {
            this.selectedCategories.push(category);
            iconDiv.classList.add('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110', 'text-white');
        }
    }

    handlePhotoUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        const preview = document.getElementById('photoPreview');

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="w-20 h-20 rounded-xl object-cover shadow-watercolor-layered border-2 border-white">
            `;
        };
        reader.readAsDataURL(file);
    }

    // 新增自訂分類
    addCustomCategory() {
        const categoryName = prompt('請輸入新分類名稱：');
        if (!categoryName || !categoryName.trim()) return;

        const trimmedName = categoryName.trim();

        // 檢查是否已存在
        const existingCategories = window.DataManager.getCustomCategories();
        if (existingCategories.some(cat => cat.name === trimmedName)) {
            alert('此分類已存在！');
            return;
        }

        // 新增到資料庫
        const newCategory = window.DataManager.addCustomCategory(trimmedName);

        // 重新渲染分類列表
        this.renderCustomCategories();

        alert(`✨ 已新增分類「${trimmedName}」！`);
    }

    // 渲染自訂分類
    renderCustomCategories() {
        const customCategories = window.DataManager.getCustomCategories();
        const categoryGrid = document.getElementById('categoryTags');
        const addButton = document.getElementById('btnAddCustomCategory');

        // 移除所有現有的自訂分類按鈕
        const existingCustomBtns = categoryGrid.querySelectorAll('[data-custom-category]');
        existingCustomBtns.forEach(btn => btn.remove());

        // 在「新增」按鈕之前插入自訂分類
        customCategories.forEach(cat => {
            const categoryBtn = document.createElement('button');
            categoryBtn.type = 'button';
            categoryBtn.className = 'tag-btn group flex flex-col items-center gap-2';
            categoryBtn.dataset.category = cat.name;
            categoryBtn.dataset.customCategory = cat.id;

            categoryBtn.innerHTML = `
                <div class="w-16 h-16 rounded-[50% 50% 40% 60% / 50% 40% 60% 50%] bg-macaron-cream/40 hover:bg-macaron-cream/60 flex items-center justify-center text-warm-brown group-hover:text-soft-ink transition-all group-active:scale-95 border-2 border-transparent hover:border-macaron-cream/50">
                    <span class="material-symbols-outlined text-2xl">${cat.icon}</span>
                </div>
                <span class="text-sm font-hand font-bold text-warm-brown">${cat.name}</span>
            `;

            // 綁定點擊事件
            categoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategory(cat.name, categoryBtn);
            });

            // 插入到「新增」按鈕之前
            categoryGrid.insertBefore(categoryBtn, addButton);
        });
    }

    submitTransaction() {
        const form = document.getElementById('transactionForm');

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payer = document.querySelector('input[name="payer"]:checked').value;
        const beneficiary = document.querySelector('input[name="beneficiary"]:checked').value;

        const transactionData = {
            payer: payer,
            beneficiary: beneficiary,
            amount: parseFloat(document.getElementById('amount').value),
            item_name: document.getElementById('itemName').value.trim(),
            categories: [...this.selectedCategories],
            note: document.getElementById('note').value.trim(),
            date: document.getElementById('transactionDate').value,
            photo_url: null
        };

        window.DataManager.addTransaction(transactionData);

        this.closeAddTransactionSheet();
        this.updateHomePage();

        // 簡單的成功提示
        alert('✨ 交易已記入日記！');
    }

    // ==================== 交易詳情 ====================
    showTransactionDetail(txId) {
        const allTransactions = window.DataManager.transactions;
        const tx = allTransactions.find(t => t.id === txId);

        if (!tx) {
            console.error('Transaction not found:', txId);
            return;
        }

        // 設定金額和項目名稱
        document.getElementById('detailAmount').textContent = `$${tx.amount}`;
        document.getElementById('detailItemName').textContent = tx.item_name;

        // 設定付款人和受益人
        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        document.getElementById('detailPayer').textContent = payerText;
        document.getElementById('detailBeneficiary').textContent = beneficiaryText;

        // 設定日期
        const date = new Date(tx.date);
        const dateText = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
        document.getElementById('detailDate').textContent = dateText;

        // 設定分類
        const categoriesContainer = document.getElementById('detailCategories');
        if (tx.categories && tx.categories.length > 0) {
            const categoryColors = {
                '吃吃': 'bg-macaron-pink/40 text-soft-ink',
                '玩': 'bg-macaron-blue/40 text-soft-ink',
                '交通': 'bg-macaron-green/40 text-soft-ink',
                '購物': 'bg-macaron-purple/40 text-soft-ink',
                '生活': 'bg-macaron-cream text-warm-brown',
                '其他': 'bg-warm-brown/20 text-warm-brown'
            };

            categoriesContainer.innerHTML = tx.categories.map(cat => {
                const colorClass = categoryColors[cat] || 'bg-warm-brown/20 text-warm-brown';
                return `<span class="px-4 py-2 rounded-full ${colorClass} font-hand font-bold text-sm">${cat}</span>`;
            }).join('');
        } else {
            categoriesContainer.innerHTML = '<span class="text-warm-brown/60 font-hand">無分類</span>';
        }

        // 設定備註
        const noteSection = document.getElementById('detailNoteSection');
        const noteContent = document.getElementById('detailNote');
        if (tx.note && tx.note.trim()) {
            noteSection.classList.remove('hidden');
            noteContent.textContent = tx.note;
        } else {
            noteSection.classList.add('hidden');
        }

        // 設定照片
        const photoSection = document.getElementById('detailPhotoSection');
        const photoContent = document.getElementById('detailPhoto');
        if (tx.photo_url) {
            photoSection.classList.remove('hidden');
            photoContent.innerHTML = `<img src="${tx.photo_url}" alt="照片" class="w-full h-auto rounded-lg">`;
        } else {
            photoSection.classList.add('hidden');
        }

        // 顯示模態框
        document.getElementById('transactionDetailModal').classList.remove('hidden');
    }

    closeTransactionDetail() {
        document.getElementById('transactionDetailModal').classList.add('hidden');
    }

    // ==================== 工具函數 ====================
    formatDisplayDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return '今天';
        if (isYesterday) return '昨天';

        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
}

// ==================== 應用啟動 ====================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CoupleApp();
    console.log('✨ 情侶記帳 App 已啟動！');
});

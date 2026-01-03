// ==================== 應用主控制器 ====================

class CoupleApp {
    constructor() {
        this.currentView = 'list';
        this.currentPage = 'homePage';
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.selectedCategories = [];

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

        // 查看更多按鈕
        document.getElementById('btnLoadMore').addEventListener('click', () => {
            this.loadMoreTransactions();
        });

        // 分析頁日期篩選
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.currentTarget.dataset.period;
                this.changeDateFilter(period, e.currentTarget);
            });
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
        this.updateTransactionList();
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

    updateTransactionList(limit = 5) {
        const transactions = window.DataManager.getTransactions(limit);
        const container = document.getElementById('transactionList');

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">尚無交易記錄 ✨</p>';
            return;
        }

        container.innerHTML = transactions.map(tx => this.renderTransactionItem(tx)).join('');
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

        const payerText = tx.payer === 'me' ? '我' : '對方';
        const beneficiaryText = tx.beneficiary === 'self' ? '自己'
            : tx.beneficiary === 'partner' ? '對方'
            : '兩人';

        return `
            <div class="bg-white rounded-2xl p-4 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group">
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

    loadMoreTransactions() {
        const currentDate = window.DataManager.getToday();
        const todayTransactions = window.DataManager.getTransactionsByDate(currentDate);

        const container = document.getElementById('transactionList');
        const btn = document.getElementById('btnLoadMore');

        if (todayTransactions.length === 0) {
            container.innerHTML = '<p class="text-center text-warm-brown/60 py-8 font-hand text-lg">今天尚無交易記錄 ✨</p>';
        } else {
            container.innerHTML = todayTransactions.map(tx => this.renderTransactionItem(tx)).join('');
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

            // 星星裝飾
            const star = document.createElement('div');
            star.className = 'absolute bottom-1 text-[8px]';
            star.textContent = '✨';
            cell.appendChild(star);
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

            return `
                <div class="group relative cursor-pointer" data-notebook-id="${nb.id}">
                    <div class="relative w-full aspect-[3/4] rounded-r-xl rounded-l-md shadow-book bg-white transition-all duration-300 transform ${isActive ? '-translate-y-2 scale-105 shadow-floating ring-2 ring-antique-gold' : 'hover:-translate-y-2 hover:rotate-1'} overflow-visible">
                        <!-- 書脊 -->
                        <div class="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r ${colorScheme.spine} rounded-l-md z-20 shadow-md"></div>

                        <!-- 書本內容 -->
                        <div class="absolute inset-0 left-2 bg-gradient-to-br ${colorScheme.gradient} rounded-r-xl overflow-hidden flex items-end p-4">
                            <div class="absolute inset-0 book-texture opacity-20"></div>
                            <h3 class="text-soft-ink text-xl font-hand font-bold leading-tight relative z-10">${nb.name}</h3>
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
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-macaron-cream/30 transition-all">
                <div class="w-5 h-5 rounded-full" style="background: ${colors[index % colors.length]}; box-shadow: 0 2px 8px ${colors[index % colors.length]}40;"></div>
                <div class="flex-1 font-hand font-bold text-soft-ink">${item.category}</div>
                <div class="font-display font-bold text-soft-ink">$${Math.round(item.amount)}</div>
                <div class="text-sm text-warm-brown/70 min-w-[50px] text-right">${item.percentage}%</div>
            </div>
        `).join('');
    }

    changeDateFilter(period, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            b.classList.add('text-soft-ink');
        });

        btn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
        btn.classList.remove('text-soft-ink');

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
        } else {
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
            date: document.getElementById('transactionDate').value,
            photo_url: null
        };

        window.DataManager.addTransaction(transactionData);

        this.closeAddTransactionSheet();
        this.updateHomePage();

        // 簡單的成功提示
        alert('✨ 交易已記入日記！');
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

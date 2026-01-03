// ==================== 路由控制器 ====================
// 來源: app.js 行 206-271
// 負責頁面和視圖切換

export class Router {
    constructor(state, pages, calendarPage) {
        this.state = state;
        this.pages = pages;  // { homePage, notebooksPage, analyticsPage }
        this.calendarPage = calendarPage;
    }

    switchPage(pageId) {
        // 更新頁面顯示
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

        this.state.currentPage = pageId;

        // 載入對應頁面資料
        if (pageId === 'homePage' && this.pages.homePage) {
            this.pages.homePage.update();
        } else if (pageId === 'notebooksPage' && this.pages.notebooksPage) {
            this.pages.notebooksPage.update();
        } else if (pageId === 'analyticsPage' && this.pages.analyticsPage) {
            this.pages.analyticsPage.update();
        }
    }

    switchView(view) {
        this.state.currentView = view;

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
            document.getElementById('listView')?.classList.remove('hidden');
            document.getElementById('listView')?.classList.add('active');
            document.getElementById('calendarView')?.classList.add('hidden');
            document.getElementById('calendarView')?.classList.remove('active');
        } else if (view === 'calendar') {
            document.getElementById('listView')?.classList.add('hidden');
            document.getElementById('listView')?.classList.remove('active');
            document.getElementById('calendarView')?.classList.remove('hidden');
            document.getElementById('calendarView')?.classList.add('active');
            if (this.calendarPage) {
                this.calendarPage.renderCalendar();
            }
        }
    }
}

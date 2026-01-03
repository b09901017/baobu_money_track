// ==================== 情侶記帳 App - 主控制器 ====================
// 重構後的主應用入口，整合所有模組

import { StateManager } from './core/StateManager.js';
import { EventBinder } from './core/EventBinder.js';
import { Router } from './core/Router.js';

import { BalanceCard } from './components/BalanceCard.js';
import { TimelineView } from './components/TimelineView.js';
import { DateRangePicker } from './components/DateRangePicker.js';
import { TransactionForm } from './components/TransactionForm.js';
import { TransactionDetail } from './components/TransactionDetail.js';

import { HomePage } from './pages/HomePage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { NotebooksPage } from './pages/NotebooksPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';

class CoupleApp {
    constructor() {
        // 初始化狀態管理
        this.state = new StateManager();

        // 初始化組件
        this.initComponents();

        // 初始化頁面
        this.initPages();

        // 初始化核心系統
        this.initCore();

        // 啟動應用
        this.init();
    }

    initComponents() {
        // 結算卡片
        this.balanceCard = new BalanceCard();

        // 時間軸視圖
        this.timelineView = new TimelineView(
            this.state,
            (txId) => this.transactionDetail.show(txId)
        );

        // 日期區間選擇器
        this.dateRangePicker = new DateRangePicker(
            this.state,
            () => this.timelineView.update(),  // 首頁時間軸更新
            (period) => this.analyticsPage.update(period)  // 分析頁面更新
        );

        // 交易表單
        this.transactionForm = new TransactionForm(
            this.state,
            () => this.homePage.update()  // 提交後更新首頁
        );

        // 交易詳情
        this.transactionDetail = new TransactionDetail();
    }

    initPages() {
        // 首頁
        this.homePage = new HomePage(this.balanceCard, this.timelineView);

        // 日曆頁面
        this.calendarPage = new CalendarPage(
            this.state,
            (txId) => this.transactionDetail.show(txId)
        );

        // 帳本頁面
        this.notebooksPage = new NotebooksPage(() => {
            // 切換帳本後的回調
            this.homePage.updateNotebookTitle();
            this.notebooksPage.update();
            this.homePage.update();
            this.router.switchPage('homePage');
        });

        // 分析頁面
        this.analyticsPage = new AnalyticsPage(
            this.state,
            (txId) => this.transactionDetail.show(txId)
        );
    }

    initCore() {
        // 路由器
        this.router = new Router(
            this.state,
            {
                homePage: this.homePage,
                notebooksPage: this.notebooksPage,
                analyticsPage: this.analyticsPage
            },
            this.calendarPage
        );

        // 事件綁定器
        this.eventBinder = new EventBinder(this);
    }

    init() {
        // 綁定所有事件
        this.eventBinder.bindAll();

        // 更新帳本標題
        this.homePage.updateNotebookTitle();

        // 載入首頁
        this.homePage.update();

        // 載入帳本頁面
        this.notebooksPage.update();

        console.log('✨ 情侶記帳 App 已啟動！');
    }
}

// ==================== 應用啟動 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 等待 FirebaseAPI 載入完成
    const checkFirebaseAPI = setInterval(() => {
        if (window.FirebaseAPI) {
            clearInterval(checkFirebaseAPI);
            initializeApp();
        }
    }, 100);
});

function initializeApp() {
    console.log('🚀 開始初始化應用程式');

    // 綁定 Google 登入按鈕
    const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
    if (btnGoogleSignIn) {
        btnGoogleSignIn.addEventListener('click', async () => {
            try {
                await window.FirebaseAPI.signInWithGoogle();
            } catch (error) {
                console.error('登入按鈕點擊失敗:', error);
            }
        });
    }

    // 設定認證監聽器
    window.FirebaseAPI.setupAuthListener(
        // 登入成功回調
        (user) => {
            console.log('👤 用戶已登入，初始化 App');

            // 隱藏登入頁面
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'none';
            }

            // 顯示主容器
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.classList.remove('hidden');
            }

            // 初始化 CoupleApp
            if (!window.app) {
                window.app = new CoupleApp();
            }
        },

        // 登出回調
        () => {
            console.log('👤 用戶已登出，顯示登入頁面');

            // 顯示登入頁面
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'flex';
            }

            // 隱藏主容器
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.classList.add('hidden');
            }
        }
    );
}

// ==================== 情侶記帳 App - 主控制器 ====================
// 重構後的主應用入口，整合所有模組

import { StateManager } from './core/StateManager.js';
import { EventBinder } from './core/EventBinder.js';
import { Router } from './core/Router.js';
import { ListenerManager } from './core/ListenerManager.js';
import { NetworkMonitor } from './core/NetworkMonitor.js';

import { BalanceCard } from './components/BalanceCard.js';
import { TimelineView } from './components/TimelineView.js';
import { DateRangePicker } from './components/DateRangePicker.js';
import { TransactionForm } from './components/TransactionForm.js';
import { TransactionDetail } from './components/TransactionDetail.js';
import { NotificationPanel } from './components/NotificationPanel.js';

import { HomePage } from './pages/HomePage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { NotebooksPage } from './pages/NotebooksPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';

import customDialog from './utils/CustomDialog.js';
import { BalanceRepairTool } from './utils/BalanceRepairTool.js';
import { NotebookStatsInitializer } from './utils/NotebookStatsInitializer.js';
import { DevTools } from './utils/DevTools.js';

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

        // 注意：this.init() 已移到外部調用，因為它是 async
    }

    initComponents() {
        // 初始化自訂對話框
        customDialog.init();

        // 掛載到全域 (方便其他模組使用)
        window.customDialog = customDialog;

        // 結算卡片
        this.balanceCard = new BalanceCard(this.state);

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

        // 通知面板（立即初始化以確保訂閱 state，避免漏失初始數據）
        this.notificationPanel = new NotificationPanel(this.state);
        this.notificationPanel.init();

        // 將 NotificationPanel 實例掛載到 window（供詳情彈窗使用）
        window.NotificationPanelInstance = this.notificationPanel;
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
        this.notebooksPage = new NotebooksPage(this.state, () => {
            // 切換帳本後的回調
            this.homePage.updateNotebookTitle();
            // 透過訂閱自動更新，無需手動呼叫 update()
            this.router.switchPage('homePage');
        });

        // 分析頁面
        this.analyticsPage = new AnalyticsPage(
            this.state,
            (txId) => this.transactionDetail.show(txId)
        );
    }

    initCore() {
        // 監聽管理器
        this.listenerManager = new ListenerManager();
        window.listenerManager = this.listenerManager;  // 掛載到全域

        // 網路狀態監控器
        this.networkMonitor = new NetworkMonitor();
        window.networkMonitor = this.networkMonitor;  // 掛載到全域

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

    async init() {
        // 綁定所有事件
        this.eventBinder.bindAll();

        // 綁定鈴鐺按鈕點擊事件（NotificationPanel 已在 initComponents 中初始化）
        const btnNotifications = document.getElementById('btnNotifications');
        if (btnNotifications) {
            btnNotifications.addEventListener('click', () => {
                this.notificationPanel.toggle();
            });
        }

        // 綁定全域展開/收合按鈕
        const btnToggleAllDates = document.getElementById('btnToggleAllDates');
        if (btnToggleAllDates) {
            btnToggleAllDates.addEventListener('click', () => {
                this.timelineView.toggleAllExpansion();
                // 切換按鈕樣式
                btnToggleAllDates.classList.toggle('all-expanded');
            });
        }

        // 更新帳本標題
        this.homePage.updateNotebookTitle();

        // 載入首頁（使用 init 初次載入）
        await this.homePage.init();

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
        async (user) => {
            console.log('👤 用戶已登入，檢查配對狀態');

            try {
                // 儲存當前用戶到全域
                window.currentUser = user;

                // 1. 檢查用戶是否已配對
                let couple = null;
                try {
                    couple = await window.FirebaseAPI.getUserCouple(user.uid);
                    if (couple) {
                        console.log('✅ 找到配對資料:', couple);
                    } else {
                        console.log('⚠️ 無配對資料');
                    }
                } catch (error) {
                    console.error('⚠️ 查詢配對失敗:', error);
                    // 如果查詢失敗，視為未配對
                    couple = null;
                }

                if (!couple) {
                    // 2. 未配對 → 顯示配對頁面
                    console.log('⚠️ 用戶尚未配對，顯示配對頁面');

                    // 隱藏登入頁面和主容器
                    const loginPage = document.getElementById('loginPage');
                    if (loginPage) {
                        loginPage.style.display = 'none';
                    }
                    const mainContainer = document.getElementById('mainContainer');
                    if (mainContainer) {
                        mainContainer.classList.add('hidden');
                    }

                    // 初始化 PairingManager 並顯示配對頁面
                    if (!window.pairingManager) {
                        const { PairingManager } = await import('./components/PairingManager.js');
                        window.pairingManager = new PairingManager();
                        window.pairingManager.init(async (couple) => {
                            // 配對完成後的回調
                            await initMainApp(user, couple);
                        });
                    }
                    window.pairingManager.showPairingPage();
                    return;
                }

                // 3. 已配對 → 初始化主應用
                console.log('✅ 用戶已配對，初始化主應用');
                try {
                    await initMainApp(user, couple);
                } catch (error) {
                    console.error('❌ 初始化主應用失敗:', error);

                    // 如果是權限錯誤，可能是舊資料不相容
                    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
                        console.warn('⚠️ 偵測到舊資料不相容，需要重新配對');
                        if (window.customDialog) {
                            await window.customDialog.error(
                                '偵測到舊版資料不相容，請清除 Firebase 資料後重新配對。\n\n' +
                                '步驟：\n' +
                                '1. 前往 Firebase Console\n' +
                                '2. 刪除 couples、notebooks、transactions\n' +
                                '3. 重新整理頁面'
                            );
                        }
                        return;
                    }

                    throw error;
                }
            } catch (error) {
                console.error('❌ 應用初始化失敗:', error);
                if (window.customDialog) {
                    await window.customDialog.error('初始化失敗，請重新整理頁面');
                }
            }
        },

        // 登出回調
        () => {
            console.log('👤 用戶已登出，顯示登入頁面');

            // 清理所有監聽器和資料
            if (window.DataManager) {
                window.DataManager.cleanup();
                console.log('✅ DataManager 已清理');
            }
            if (window.listenerManager) {
                window.listenerManager.unregisterAll();
                console.log('✅ 所有監聽器已註銷');
            }

            // 顯示登入頁面
            const loginPage = document.getElementById('loginPage');
            if (loginPage) {
                loginPage.style.display = 'flex';
            }

            // 隱藏主容器和配對頁面
            const mainContainer = document.getElementById('mainContainer');
            if (mainContainer) {
                mainContainer.classList.add('hidden');
            }
            const pairingPage = document.getElementById('pairingPage');
            if (pairingPage) {
                pairingPage.classList.add('hidden');
            }
        }
    );

    // 載入開發者工具（開發環境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🛠️ 開發環境，載入開發者工具');
    }
}

/**
 * 初始化主應用（配對完成後）
 * @param {Object} user - Firebase 用戶物件
 * @param {Object} couple - 配對資料
 */
async function initMainApp(user, couple) {
    // 1. 先初始化 CoupleApp 實例
    // 這會建立 ListenerManager、StateManager 等核心元件，讓 DataManager 可以使用
    if (!window.app) {
        window.app = new CoupleApp();
    }

    // 2. 初始化 DataManager（傳入 couple）
    // 此時 window.listenerManager 已經存在，可以正常註冊監聽器
    await window.DataManager.init(user, couple);

    // 隱藏登入頁面和配對頁面
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
        loginPage.style.display = 'none';
    }
    const pairingPage = document.getElementById('pairingPage');
    if (pairingPage) {
        pairingPage.classList.add('hidden');
    }

    // 顯示主容器
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
        mainContainer.classList.remove('hidden');
    }

    // 3. 最後才啟動應用（綁定事件、載入頁面資料）
    await window.app.init();
}

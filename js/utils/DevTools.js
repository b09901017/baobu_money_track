// 開發者工具 - 提供除錯和診斷功能
export class DevTools {
    static help() {
        console.log(`
🛠️ 開發者工具指令

監聽器管理:
  DevTools.showListenerStatus()      - 顯示監聽器狀態
  DevTools.unregisterAllListeners()  - 移除所有監聽器

快取管理:
  DevTools.showCacheStats()          - 顯示本地快取統計
  DevTools.clearLocalCache()         - 清除本地快取

餘額管理:
  DevTools.checkBalance()            - 檢查當前帳本餘額
  DevTools.repairBalance()           - 修復當前帳本餘額
  DevTools.repairAllBalances()       - 修復所有帳本餘額

連線檢查:
  DevTools.checkFirebaseConnection() - 檢查 Firebase 連線
  DevTools.showNetworkStatus()       - 顯示網路狀態

日誌:
  DevTools.exportLogs()              - 匯出 Console 日誌
        `);
    }

    static showListenerStatus() {
        const status = window.listenerManager.getStatus();
        console.log('🎧 監聽器狀態:', status);
        console.table(status.keys.map(key => ({ key })));
        return status;
    }

    static unregisterAllListeners() {
        console.warn('⚠️ 準備移除所有監聽器');
        window.listenerManager.unregisterAll();
        console.log('✅ 所有監聽器已移除');
    }

    static showCacheStats() {
        const stats = {
            transactions: window.DataManager.transactions.length,
            notebooks: window.DataManager.notebooks.length,
            customCategories: window.DataManager.customCategories.length,
            currentNotebook: window.DataManager.currentNotebook,
            listeningStartDate: window.DataManager.listeningStartDate
        };
        console.log('📊 本地快取統計:', stats);
        console.table(stats);
        return stats;
    }

    static clearLocalCache() {
        console.warn('⚠️ 準備清除本地快取');
        window.DataManager.transactions = [];
        window.DataManager.notebooks = [];
        window.DataManager.customCategories = [];
        console.log('✅ 本地快取已清除');
    }

    static async checkBalance() {
        const notebookId = window.DataManager.currentNotebook;
        if (!notebookId) {
            console.error('❌ 無當前帳本');
            return;
        }
        const result = await window.balanceRepairTool.checkBalance(notebookId);
        return result;
    }

    static async repairBalance() {
        const notebookId = window.DataManager.currentNotebook;
        if (!notebookId) {
            console.error('❌ 無當前帳本');
            return;
        }
        const result = await window.balanceRepairTool.repairBalance(notebookId);
        return result;
    }

    static async repairAllBalances() {
        const result = await window.balanceRepairTool.repairAllBalances();
        return result;
    }

    static async checkFirebaseConnection() {
        try {
            console.log('🔍 檢查 Firebase 連線...');
            const testRef = window.firebaseModules.doc(
                window.firebaseModules.getFirestore(window.firebaseModules.initializeApp.app),
                'test',
                'connection'
            );
            await window.firebaseModules.getDoc(testRef);
            console.log('✅ Firebase 連線正常');
            return true;
        } catch (error) {
            console.error('❌ Firebase 連線失敗:', error);
            return false;
        }
    }

    static showNetworkStatus() {
        const status = {
            isOnline: window.networkMonitor?.isOnline,
            navigatorOnline: navigator.onLine
        };
        console.log('🌐 網路狀態:', status);
        return status;
    }

    static exportLogs() {
        console.warn('⚠️ 此功能需要瀏覽器擴充功能支援');
        console.log('建議使用 Chrome DevTools 的 "Save as..." 功能');
    }
}

// 掛載到全域
if (typeof window !== 'undefined') {
    window.DevTools = DevTools;
    console.log('🛠️ DevTools 已載入，輸入 DevTools.help() 查看指令');
}

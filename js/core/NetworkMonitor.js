// 網路狀態監控器 - 偵測線上/離線並顯示提示
export class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineToast = null;
        this.init();
        console.log('🌐 NetworkMonitor 已建立，當前狀態:', this.isOnline ? '線上' : '離線');
    }

    init() {
        // 監聽網路狀態變化
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // 檢查初始狀態
        if (!this.isOnline) {
            this.showOfflineToast();
        }
    }

    handleOnline() {
        console.log('🌐 網路已連線');
        this.isOnline = true;
        this.hideOfflineToast();

        // 顯示重新連線提示（2秒後消失）
        if (window.customDialog) {
            window.customDialog.info('已重新連線 🎉');
        }
    }

    handleOffline() {
        console.log('🌐 網路已斷線');
        this.isOnline = false;
        this.showOfflineToast();
    }

    showOfflineToast() {
        if (this.offlineToast) return;

        // 建立離線提示條
        this.offlineToast = document.createElement('div');
        this.offlineToast.id = 'offlineToast';
        this.offlineToast.className = 'fixed top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 text-center z-[200] text-sm font-hand font-bold';
        this.offlineToast.innerHTML = '📡 離線模式：變更將在重新連線後同步';
        document.body.appendChild(this.offlineToast);
    }

    hideOfflineToast() {
        if (this.offlineToast) {
            this.offlineToast.remove();
            this.offlineToast = null;
        }
    }
}

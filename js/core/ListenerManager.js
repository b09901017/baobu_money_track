// 監聽器管理器 - 統一管理所有 Firestore onSnapshot 監聽器
export class ListenerManager {
    constructor() {
        this.listeners = new Map();
        console.log('🎧 ListenerManager 已建立');
    }

    /**
     * 註冊監聽器
     * @param {string} key - 監聽器唯一識別碼
     * @param {Function} unsubscribe - onSnapshot 返回的取消訂閱函數
     */
    register(key, unsubscribe) {
        if (this.listeners.has(key)) {
            console.warn(`⚠️ 監聽器 "${key}" 已存在，將先移除舊的`);
            this.unregister(key);
        }
        this.listeners.set(key, unsubscribe);
        console.log(`✅ 監聽器 "${key}" 已註冊 (總計: ${this.listeners.size})`);
    }

    /**
     * 移除監聽器
     * @param {string} key - 監聽器唯一識別碼
     */
    unregister(key) {
        const unsubscribe = this.listeners.get(key);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(key);
            console.log(`🗑️ 監聽器 "${key}" 已移除 (剩餘: ${this.listeners.size})`);
        }
    }

    /**
     * 移除所有監聽器
     */
    unregisterAll() {
        console.log(`🧹 準備移除所有監聽器 (共 ${this.listeners.size} 個)...`);
        this.listeners.forEach((unsubscribe, key) => {
            unsubscribe();
            console.log(`  - 已移除: ${key}`);
        });
        this.listeners.clear();
        console.log('✅ 所有監聽器已移除');
    }

    /**
     * 取得監聽器狀態
     */
    getStatus() {
        return {
            count: this.listeners.size,
            keys: Array.from(this.listeners.keys())
        };
    }
}

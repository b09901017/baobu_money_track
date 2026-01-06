# 情侶記帳 App - 即時同步與分批載入架構升級計劃

## 專案目標

將情侶記帳 App 從「手動查詢模式」升級為「即時同步模式」，並優化效能和離線支援：

1. **即時監聽（onSnapshot）**：讓兩人的修改可以即時同步
2. **分批載入**：預設載入近 3 個月交易，避免一次載入大量資料
3. **餘額持久化**：在 Firebase notebooks 儲存 balance 欄位，不每次重算所有交易
4. **離線支援**：啟用 Firebase Offline Persistence

## 用戶決策確認

- ✅ **餘額儲存**：Firebase 持久化儲存（在 notebooks 新增 balance 欄位）
- ✅ **分批載入**：預設載入近 3 個月的交易
- ✅ **即時監聽**：交易資料 + 帳本餘額 + 帳本列表（全面監聽）
- ✅ **離線支援**：現在一起實作
- ✅ **舊資料**：可以手動刪除，不需要遷移邏輯

---

## 七階段實作計劃（總時程：11-18 小時）

### 第一階段：基礎架構準備與離線支援（2-3 小時）

#### 目標
建立即時監聽和離線支援的基礎設施。

#### 步驟

**1.1 補充 Firebase 模組引入**

檔案：`index.html` (第 72 行)

```javascript
import {
    initializeApp,
    getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp,
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
    getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    // 新增以下模組
    onSnapshot,              // 即時監聽
    startAfter,              // 分頁查詢
    enableIndexedDbPersistence,  // 離線持久化
    Timestamp,               // 時間戳處理
    runTransaction           // 交易保證（並發安全）
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
```

**1.2 啟用 Firebase Offline Persistence**

檔案：`js/firebase-config.js` (第 15-20 行後)

```javascript
// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 啟用離線持久化（新增）
enableIndexedDbPersistence(db)
    .then(() => {
        console.log('✅ 離線持久化已啟用');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('⚠️ 多個標籤頁同時開啟，離線持久化僅在第一個標籤頁啟用');
        } else if (err.code === 'unimplemented') {
            console.warn('⚠️ 瀏覽器不支援 IndexedDB，離線持久化無法使用');
        } else {
            console.error('❌ 啟用離線持久化失敗:', err);
        }
    });
```

**1.3 建立監聽管理器**

新檔案：`js/core/ListenerManager.js`

```javascript
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
```

**1.4 建立網路狀態監控器**

新檔案：`js/core/NetworkMonitor.js`

```javascript
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
```

**1.5 整合到 app.js**

檔案：`js/app.js`

```javascript
// 新增 imports
import { ListenerManager } from './core/ListenerManager.js';
import { NetworkMonitor } from './core/NetworkMonitor.js';

class CoupleApp {
    constructor() {
        // ... 現有程式碼 ...
    }

    initCore() {
        // 監聽管理器（新增）
        this.listenerManager = new ListenerManager();
        window.listenerManager = this.listenerManager;  // 掛載到全域

        // 網路狀態監控器（新增）
        this.networkMonitor = new NetworkMonitor();
        window.networkMonitor = this.networkMonitor;  // 掛載到全域

        // 路由器
        this.router = new Router(/* ... */);

        // 事件綁定器
        this.eventBinder = new EventBinder(this);
    }

    // ... 其他程式碼 ...
}
```

#### 測試驗證
- [x] Console 顯示「離線持久化已啟用」
- [x] IndexedDB 中有 firebaseLocalStorage 資料庫
- [x] 斷網時頂部顯示橘色離線提示條
- [x] 重新連線時提示消失並顯示「已重新連線」

#### Commit
```bash
git add .
git commit -m "feat: 階段1 - 建立離線支援與監聽管理基礎設施

- 啟用 Firebase Offline Persistence (IndexedDB)
- 新增 ListenerManager 統一管理 onSnapshot 監聽器
- 新增 NetworkMonitor 偵測網路狀態並顯示離線提示
- 補充必要的 Firebase 模組引入 (onSnapshot, runTransaction 等)"
```

---

### 第二階段：Firestore 資料結構變更與餘額管理（2-3 小時）

#### 目標
在 notebooks 新增 balance 欄位，建立餘額增量更新機制。

#### Firestore 資料結構設計

**notebooks 集合：**
```javascript
{
  id: "notebook_id",
  name: "寶寶 & 步步的記帳本",
  couple_id: "couple_id",
  member_ids: ["uid1", "uid2"],
  member_names: { "uid1": "宸兒", "uid2": "鄧旭成" },
  created_at: Timestamp,

  // 新增欄位
  balance: {
    baobao_owed: 0,        // 寶寶被欠的錢（正數表示步步欠寶寶）
    bubu_owed: 0,          // 步步被欠的錢（正數表示寶寶欠步步）
    last_updated: Timestamp,
    version: 1             // 版本號（樂觀鎖，避免並發衝突）
  }
}
```

**餘額計算規則（與現有邏輯一致）：**
- 寶幫共付 → baobao_owed += amount / 2
- 寶幫步付 → baobao_owed += amount
- 步幫共付 → bubu_owed += amount / 2
- 步幫寶付 → bubu_owed += amount

#### 步驟

**2.1 建立餘額管理器**

新檔案：`js/core/BalanceManager.js`

```javascript
// 餘額管理器 - 處理餘額增量更新與計算
export class BalanceManager {
    constructor() {
        console.log('💰 BalanceManager 已建立');
    }

    /**
     * 計算單筆交易對餘額的影響（delta）
     * @param {Object} transaction - 交易資料
     * @returns {Object} { baobao_delta, bubu_delta }
     */
    calculateTransactionDelta(transaction) {
        const amount = parseFloat(transaction.amount);
        const payer = transaction.payer;           // 'baobao' | 'bubu'
        const beneficiary = transaction.beneficiary; // 'baobao' | 'bubu' | 'both'

        let baobaoDelta = 0;
        let bubuDelta = 0;

        if (payer === 'baobao') {
            // 寶寶付的錢
            if (beneficiary === 'both') {
                baobaoDelta = amount / 2;  // 步步欠寶寶一半
            } else if (beneficiary === 'bubu') {
                baobaoDelta = amount;      // 步步欠寶寶全額
            }
            // else: 寶幫寶付 → 不影響欠款
        } else if (payer === 'bubu') {
            // 步步付的錢
            if (beneficiary === 'both') {
                bubuDelta = amount / 2;    // 寶寶欠步步一半
            } else if (beneficiary === 'baobao') {
                bubuDelta = amount;        // 寶寶欠步步全額
            }
            // else: 步幫步付 → 不影響欠款
        }

        return { baobaoDelta, bubuDelta };
    }

    /**
     * 從餘額資料計算結算狀態
     * @param {Object} balance - { baobao_owed, bubu_owed }
     * @returns {Object} { status, amount, debtor, creditor }
     */
    calculateBalanceStatus(balance) {
        if (!balance) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        }

        const baobaoName = '寶寶';
        const bubuName = '步步';

        // 計算淨欠款（寶寶被欠 - 步步被欠）
        const difference = balance.baobao_owed - balance.bubu_owed;

        if (Math.abs(difference) < 0.01) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        } else if (difference > 0) {
            // 寶寶被欠得多 → 步步欠寶寶
            return {
                status: 'owed',
                amount: Math.abs(difference),
                debtor: bubuName,
                creditor: baobaoName
            };
        } else {
            // 步步被欠得多 → 寶寶欠步步
            return {
                status: 'owes',
                amount: Math.abs(difference),
                debtor: baobaoName,
                creditor: bubuName
            };
        }
    }

    /**
     * 計算完整餘額（從所有交易重算，用於初始化）
     * @param {Array} transactions - 交易列表
     * @returns {Object} { baobao_owed, bubu_owed }
     */
    calculateFullBalance(transactions) {
        let baobaoOwed = 0;
        let bubuOwed = 0;

        transactions.forEach(tx => {
            const { baobaoDelta, bubuDelta } = this.calculateTransactionDelta(tx);
            baobaoOwed += baobaoDelta;
            bubuOwed += bubuDelta;
        });

        return {
            baobao_owed: baobaoOwed,
            bubu_owed: bubuOwed,
            last_updated: new Date(),
            version: 1
        };
    }
}
```

**2.2 新增 Firebase API 餘額管理函數**

檔案：`js/firebase-config.js`

```javascript
// ==================== 餘額管理 ====================

/**
 * 增量更新帳本餘額（使用 Firestore Transaction 確保並發安全）
 * @param {string} notebookId - 帳本 ID
 * @param {number} baobaoDelta - 寶寶餘額變化量
 * @param {number} bubuDelta - 步步餘額變化量
 * @returns {Promise<void>}
 */
async function incrementNotebookBalance(notebookId, baobaoDelta, bubuDelta) {
    const notebookRef = doc(db, 'notebooks', notebookId);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await runTransaction(db, async (transaction) => {
                const notebookDoc = await transaction.get(notebookRef);

                if (!notebookDoc.exists()) {
                    throw new Error('帳本不存在');
                }

                const currentBalance = notebookDoc.data().balance || {
                    baobao_owed: 0,
                    bubu_owed: 0,
                    version: 0
                };

                const newBalance = {
                    baobao_owed: currentBalance.baobao_owed + baobaoDelta,
                    bubu_owed: currentBalance.bubu_owed + bubuDelta,
                    last_updated: serverTimestamp(),
                    version: currentBalance.version + 1
                };

                transaction.update(notebookRef, { balance: newBalance });
                console.log(`✅ 餘額已更新 (版本: ${newBalance.version}):`, newBalance);
            });

            return; // 成功
        } catch (error) {
            if (error.code === 'aborted') {
                // 並發衝突，重試
                retries++;
                console.warn(`⚠️ 並發衝突，重試 ${retries}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 100 * retries)); // 指數退避
            } else {
                console.error('❌ 更新餘額失敗:', error);
                throw error;
            }
        }
    }

    throw new Error('並發衝突過多，餘額更新失敗');
}

/**
 * 初始化帳本餘額
 * @param {string} notebookId - 帳本 ID
 * @param {Object} balance - { baobao_owed, bubu_owed }
 * @returns {Promise<void>}
 */
async function initializeNotebookBalance(notebookId, balance) {
    try {
        const notebookRef = doc(db, 'notebooks', notebookId);
        await updateDoc(notebookRef, {
            balance: {
                ...balance,
                last_updated: serverTimestamp(),
                version: 1
            }
        });
        console.log('✅ 帳本餘額已初始化:', balance);
    } catch (error) {
        console.error('❌ 初始化餘額失敗:', error);
        throw error;
    }
}

/**
 * 監聽帳本餘額變更
 * @param {string} notebookId - 帳本 ID
 * @param {Function} callback - 回調函數 (balance) => void
 * @returns {Function} - 取消監聽函數
 */
function onNotebookBalanceChange(notebookId, callback) {
    const notebookRef = doc(db, 'notebooks', notebookId);

    return onSnapshot(
        notebookRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const balance = snapshot.data().balance;
                callback(balance);
            }
        },
        (error) => {
            console.error('❌ 監聽餘額失敗:', error);
            if (window.customDialog && error.code !== 'unavailable') {
                window.customDialog.error('監聽餘額失敗：' + error.message);
            }
        }
    );
}

// 導出 API（在最後的 window.FirebaseAPI 中新增）
window.FirebaseAPI = {
    // ... 現有 API ...

    // 餘額管理（新增）
    incrementNotebookBalance,
    initializeNotebookBalance,
    onNotebookBalanceChange
};
```

**2.3 建立餘額初始化工具**

新檔案：`js/utils/BalanceInitializer.js`

```javascript
// 餘額初始化工具 - 為舊帳本初始化 balance 欄位
export class BalanceInitializer {
    constructor() {
        console.log('🔧 BalanceInitializer 已建立');
    }

    /**
     * 檢查並初始化帳本餘額
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<boolean>} - 是否需要初始化
     */
    async checkAndInitialize(notebookId) {
        try {
            // 取得帳本資料
            const notebookRef = window.firebaseModules.doc(
                window.firebaseModules.getFirestore(window.firebaseModules.initializeApp.app),
                'notebooks',
                notebookId
            );
            const notebookDoc = await window.firebaseModules.getDoc(notebookRef);

            if (!notebookDoc.exists()) {
                console.error('❌ 帳本不存在:', notebookId);
                return false;
            }

            const notebook = notebookDoc.data();

            // 檢查是否已有 balance 欄位
            if (notebook.balance) {
                console.log('✅ 帳本已有餘額資料，無需初始化');
                return false;
            }

            console.log('⚠️ 帳本無餘額資料，開始初始化...');

            // 取得所有交易
            const transactions = await window.FirebaseAPI.getTransactions(notebookId, 9999);
            console.log(`📊 取得 ${transactions.length} 筆交易`);

            // 計算完整餘額
            const balanceManager = new window.BalanceManager();
            const balance = balanceManager.calculateFullBalance(transactions);

            console.log('💰 計算結果:', balance);

            // 寫入 Firebase
            await window.FirebaseAPI.initializeNotebookBalance(notebookId, balance);

            console.log('✅ 餘額初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 餘額初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 初始化所有帳本的餘額
     * @param {Array} notebooks - 帳本列表
     */
    async initializeAll(notebooks) {
        console.log(`🔧 準備初始化 ${notebooks.length} 個帳本...`);

        for (const notebook of notebooks) {
            try {
                await this.checkAndInitialize(notebook.id);
            } catch (error) {
                console.error(`❌ 初始化帳本 ${notebook.name} 失敗:`, error);
            }
        }

        console.log('✅ 所有帳本初始化完成');
    }
}
```

**2.4 整合到 DataManager**

檔案：`js/data.js`

```javascript
// 新增 imports
import { BalanceManager } from './core/BalanceManager.js';
import { BalanceInitializer } from './utils/BalanceInitializer.js';

class DataManager {
    constructor() {
        // ... 現有程式碼 ...

        // 餘額管理器（新增）
        this.balanceManager = new BalanceManager();
        window.BalanceManager = BalanceManager; // 掛載類別供工具使用

        // 餘額初始化器（新增）
        this.balanceInitializer = new BalanceInitializer();
    }

    async init(user, couple) {
        // ... 現有程式碼 ...

        try {
            // 1. 載入帳本
            await this.loadNotebooks();

            // 2. 檢查並初始化餘額（新增）
            console.log('🔧 檢查帳本餘額...');
            await this.balanceInitializer.initializeAll(this.notebooks);

            // 3. 建立預設帳本（如果需要）
            if (this.notebooks.length === 0) {
                await this.createDefaultNotebook();
                // 新建帳本已自動包含 balance 欄位
            }

            // ... 其他初始化程式碼 ...
        } catch (error) {
            // ... 錯誤處理 ...
        }
    }

    /**
     * 建立預設帳本（已包含 balance 初始化）
     */
    async createDefaultNotebook() {
        const notebookName = '寶寶 & 步步的記帳本';

        try {
            const notebookId = await window.FirebaseAPI.addNotebook(
                this.coupleId,
                notebookName,
                this.couple.member_ids,
                this.couple.member_names
            );

            // 初始化餘額為 0（新增）
            await window.FirebaseAPI.initializeNotebookBalance(notebookId, {
                baobao_owed: 0,
                bubu_owed: 0
            });

            console.log('✅ 已建立預設配對帳本並初始化餘額:', notebookId);

            // 重新載入帳本列表
            await this.loadNotebooks();
        } catch (error) {
            console.error('❌ 建立預設帳本失敗:', error);
            throw error;
        }
    }
}
```

#### 測試驗證
- [x] Firebase Console 中 notebooks 文檔有 balance 欄位
- [x] balance.baobao_owed 和 bubu_owed 值正確
- [x] balance.version = 1
- [x] Console 顯示「餘額初始化完成」

#### Commit
```bash
git add .
git commit -m "feat: 階段2 - 新增餘額持久化機制

- 在 notebooks 新增 balance 欄位結構設計
- 建立 BalanceManager 處理餘額增量計算
- 新增 Firebase API 餘額管理函數 (incrementNotebookBalance, initializeNotebookBalance)
- 建立 BalanceInitializer 自動初始化舊帳本餘額
- 使用 Firestore Transaction 確保並發更新安全"
```

---

### 第三階段：交易即時監聽（3-4 小時）

#### 目標
實作交易資料的即時監聽，讓兩人的新增/編輯/刪除操作即時同步。

#### 步驟

**3.1 新增 Firebase API 監聽函數**

檔案：`js/firebase-config.js`

```javascript
// ==================== 交易即時監聽 ====================

/**
 * 監聽近期交易（近 3 個月）
 * @param {string} notebookId - 帳本 ID
 * @param {Date} sinceDate - 起始日期（預設近 3 個月）
 * @param {Function} callback - 回調函數 (transactions, changes) => void
 * @returns {Function} - 取消監聽函數
 */
function onRecentTransactionsChange(notebookId, sinceDate, callback) {
    const threeMonthsAgo = sinceDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sinceDateStr = threeMonthsAgo.toISOString().split('T')[0];

    console.log(`🎧 開始監聽近期交易 (自 ${sinceDateStr})...`);

    const q = query(
        collection(db, 'transactions'),
        where('notebook_id', '==', notebookId),
        where('date', '>=', sinceDateStr),
        orderBy('date', 'desc'),
        orderBy('created_at', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const changes = {
                added: snapshot.docChanges().filter(c => c.type === 'added').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                })),
                modified: snapshot.docChanges().filter(c => c.type === 'modified').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                })),
                removed: snapshot.docChanges().filter(c => c.type === 'removed').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                }))
            };

            console.log(`📊 交易變更: +${changes.added.length} ~${changes.modified.length} -${changes.removed.length}`);
            callback(transactions, changes);
        },
        (error) => {
            console.error('❌ 監聽交易失敗:', error);
            if (error.code === 'permission-denied') {
                window.customDialog?.error('無法存取交易資料：權限不足');
            } else if (error.code === 'failed-precondition') {
                window.customDialog?.error('資料查詢失敗：請聯絡開發者建立 Firestore 索引');
            } else if (error.code !== 'unavailable') {
                window.customDialog?.error('監聽交易失敗：' + error.message);
            }
        }
    );
}

/**
 * 載入更早的交易（分頁查詢）
 * @param {string} notebookId - 帳本 ID
 * @param {string} beforeDate - 日期上限 (YYYY-MM-DD)
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getEarlierTransactions(notebookId, beforeDate, limitCount = 30) {
    try {
        console.log(`📥 載入 ${beforeDate} 之前的 ${limitCount} 筆交易...`);

        const q = query(
            collection(db, 'transactions'),
            where('notebook_id', '==', notebookId),
            where('date', '<', beforeDate),
            orderBy('date', 'desc'),
            orderBy('created_at', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已載入 ${transactions.length} 筆更早的交易`);
        return transactions;
    } catch (error) {
        console.error('❌ 載入更早交易失敗:', error);
        throw error;
    }
}

// 導出 API
window.FirebaseAPI = {
    // ... 現有 API ...

    // 交易監聽（新增）
    onRecentTransactionsChange,
    getEarlierTransactions
};
```

**3.2 修改 DataManager - 啟動交易監聽**

檔案：`js/data.js`

```javascript
class DataManager {
    constructor() {
        // ... 現有程式碼 ...

        // 監聽範圍（新增）
        this.listeningStartDate = null;  // 監聽的起始日期
    }

    async init(user, couple) {
        // ... 現有程式碼 ...

        try {
            // ... 帳本載入和初始化 ...

            // 4. 啟動交易監聽（取代 loadTransactions）
            if (this.currentNotebook) {
                this.startListeningTransactions();
            }

            // 5. 啟動帳本餘額監聽（下一階段實作）
            // this.startListeningNotebookBalance();

            // ... 其他初始化 ...
        } catch (error) {
            // ... 錯誤處理 ...
        }
    }

    /**
     * 開始監聽交易（近 3 個月）
     */
    startListeningTransactions() {
        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('transactions');

        // 設定監聽起始日期（近 3 個月）
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        this.listeningStartDate = this.formatDate(threeMonthsAgo);

        console.log(`🎧 開始監聽交易 (自 ${this.listeningStartDate})...`);

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onRecentTransactionsChange(
            this.currentNotebook,
            threeMonthsAgo,
            (transactions, changes) => this.handleTransactionsChange(transactions, changes)
        );

        window.listenerManager.register('transactions', unsubscribe);
    }

    /**
     * 處理交易變更回調（防抖處理）
     * @param {Array} transactions - 完整交易列表
     * @param {Object} changes - 變更詳情 { added, modified, removed }
     */
    handleTransactionsChange(transactions, changes) {
        // 取消之前的計時器
        if (this._debounceTimer) clearTimeout(this._debounceTimer);

        // 300ms 內只觸發一次（避免頻繁更新）
        this._debounceTimer = setTimeout(() => {
            console.log('📊 更新交易快取...');

            // 更新本地快取
            this.transactions = transactions;

            // 通知訂閱者
            if (window.app && window.app.state) {
                window.app.state.notify('transactions', { transactions, changes });
            }

            // 如果對方新增交易，顯示提示（可選）
            if (changes.added.length > 0) {
                const addedByMe = changes.added.every(tx => tx.user_id === this.currentUser.uid);
                if (!addedByMe) {
                    console.log(`✨ 對方新增了 ${changes.added.length} 筆記錄`);
                }
            }
        }, 300);
    }

    /**
     * 停止監聽交易
     */
    stopListeningTransactions() {
        window.listenerManager.unregister('transactions');
        console.log('🛑 已停止監聽交易');
    }

    /**
     * 切換帳本（停止舊監聽，啟動新監聽）
     */
    async switchNotebook(notebookId) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            this.currentNotebook = notebookId;

            // 停止舊的監聽
            this.stopListeningTransactions();

            // 清空快取
            this.transactions = [];

            // 啟動新的監聽
            this.startListeningTransactions();

            console.log('📖 已切換帳本:', notebook.name);
            return notebook;
        }
        return null;
    }

    /**
     * 新增交易（整合餘額增量更新）
     */
    async addTransaction(transactionData) {
        try {
            // 離線提示
            if (window.networkMonitor && !window.networkMonitor.isOnline) {
                console.log('📡 離線模式：變更將在重新連線後同步');
            }

            // 1. 新增交易到 Firestore
            const transaction = {
                notebook_id: this.currentNotebook,
                couple_id: this.coupleId,
                user_id: this.currentUser.uid,
                ...transactionData
            };

            const transactionId = await window.FirebaseAPI.addTransaction(transaction);
            console.log('✅ 交易已新增:', transactionId);

            // 2. 增量更新餘額
            const { baobaoDelta, bubuDelta } = this.balanceManager.calculateTransactionDelta(transaction);
            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.currentNotebook,
                    baobaoDelta,
                    bubuDelta
                );
                console.log('💰 餘額已更新:', { baobaoDelta, bubuDelta });
            }

            // 3. 本地快取會由 onSnapshot 自動更新，不需要手動處理

            return {
                id: transactionId,
                ...transaction
            };
        } catch (error) {
            console.error('❌ 新增交易失敗:', error);
            throw error;
        }
    }

    /**
     * 刪除交易（整合餘額增量更新）
     */
    async deleteTransaction(id) {
        try {
            // 1. 取得交易資料（用於餘額回退）
            const transaction = this.transactions.find(tx => tx.id === id);
            if (!transaction) {
                throw new Error('交易不存在');
            }

            // 2. 刪除交易
            await window.FirebaseAPI.deleteTransaction(id);
            console.log('✅ 交易已刪除:', id);

            // 3. 反向更新餘額（減去這筆交易的影響）
            const { baobaoDelta, bubuDelta } = this.balanceManager.calculateTransactionDelta(transaction);
            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.currentNotebook,
                    -baobaoDelta,  // 反向操作
                    -bubuDelta
                );
                console.log('💰 餘額已回退:', { baobaoDelta: -baobaoDelta, bubuDelta: -bubuDelta });
            }

            // 4. 本地快取會由 onSnapshot 自動更新

            return true;
        } catch (error) {
            console.error('❌ 刪除交易失敗:', error);
            throw error;
        }
    }

    /**
     * 更新交易（整合餘額增量更新）
     */
    async updateTransaction(id, updates) {
        try {
            // 1. 取得舊交易資料
            const oldTransaction = this.transactions.find(tx => tx.id === id);
            if (!oldTransaction) {
                throw new Error('交易不存在');
            }

            // 2. 更新交易
            await window.FirebaseAPI.updateTransaction(id, updates);
            console.log('✅ 交易已更新:', id);

            // 3. 更新餘額（先減去舊的，再加上新的）
            const newTransaction = { ...oldTransaction, ...updates };

            const oldDelta = this.balanceManager.calculateTransactionDelta(oldTransaction);
            const newDelta = this.balanceManager.calculateTransactionDelta(newTransaction);

            const baobaoDelta = newDelta.baobaoDelta - oldDelta.baobaoDelta;
            const bubuDelta = newDelta.bubuDelta - oldDelta.bubuDelta;

            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.currentNotebook,
                    baobaoDelta,
                    bubuDelta
                );
                console.log('💰 餘額已調整:', { baobaoDelta, bubuDelta });
            }

            // 4. 本地快取會由 onSnapshot 自動更新

            return newTransaction;
        } catch (error) {
            console.error('❌ 更新交易失敗:', error);
            throw error;
        }
    }

    /**
     * 載入更早的交易（分批載入）
     */
    async loadEarlierTransactions(limitCount = 30) {
        if (this.transactions.length === 0) {
            console.warn('⚠️ 尚未載入任何交易');
            return [];
        }

        // 找到最早的交易日期
        const sortedDates = this.transactions.map(tx => tx.date).sort();
        const earliestDate = sortedDates[0];

        console.log(`📥 載入 ${earliestDate} 之前的交易...`);

        try {
            const earlierTransactions = await window.FirebaseAPI.getEarlierTransactions(
                this.currentNotebook,
                earliestDate,
                limitCount
            );

            if (earlierTransactions.length > 0) {
                // 合併到本地快取（避免重複）
                const existingIds = new Set(this.transactions.map(tx => tx.id));
                const newTransactions = earlierTransactions.filter(tx => !existingIds.has(tx.id));

                this.transactions = [...this.transactions, ...newTransactions];

                // 更新監聽起始日期
                const newEarliestDate = newTransactions.map(tx => tx.date).sort()[0];
                if (newEarliestDate) {
                    this.listeningStartDate = newEarliestDate;
                }

                console.log(`✅ 已載入 ${newTransactions.length} 筆更早的交易`);

                // 通知訂閱者
                if (window.app && window.app.state) {
                    window.app.state.notify('transactions', {
                        transactions: this.transactions,
                        changes: { added: newTransactions, modified: [], removed: [] }
                    });
                }
            } else {
                console.log('⚠️ 沒有更早的交易了');
            }

            return earlierTransactions;
        } catch (error) {
            console.error('❌ 載入更早交易失敗:', error);
            throw error;
        }
    }

    /**
     * 清理資源（登出時調用）
     */
    cleanup() {
        console.log('🧹 清理 DataManager 資源...');

        // 停止所有監聽器
        window.listenerManager.unregisterAll();

        // 清空本地快取
        this.transactions = [];
        this.notebooks = [];
        this.currentNotebook = null;
        this.isInitialized = false;

        console.log('✅ DataManager 已清理');
    }
}
```

**3.3 修改 TimelineView - 訂閱交易變更**

檔案：`js/components/TimelineView.js`

```javascript
export class TimelineView {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;
        this.listElement = document.getElementById('transactionList');
        this.emptyState = document.getElementById('emptyTimelineState');
        this.loadMoreBtn = document.getElementById('btnLoadMore');
        this.loadMoreContainer = document.getElementById('loadMoreContainer');

        // 移除舊的分批載入變數
        // this.transactionsLoaded = 30;
        // this.loadMoreCount = 30;

        // 訂閱交易變更（新增）
        this.state.subscribe('transactions', (data) => {
            this.handleTransactionsUpdate(data.transactions, data.changes);
        });

        console.log('🎬 TimelineView 已建立並訂閱交易變更');
    }

    /**
     * 初始化（自動由訂閱觸發，保留用於手動刷新）
     */
    async init() {
        console.log('🎬 TimelineView 初始化（等待監聽資料）...');
        // 資料會由 onSnapshot 自動觸發 handleTransactionsUpdate
    }

    /**
     * 處理交易更新（訂閱回調）
     * @param {Array} transactions - 完整交易列表
     * @param {Object} changes - 變更詳情
     */
    handleTransactionsUpdate(transactions, changes) {
        console.log(`📊 TimelineView 收到更新: ${transactions.length} 筆交易`);

        // 重新渲染時間軸
        this.renderTimeline(transactions);

        // 顯示/隱藏「載入更多」按鈕
        this.updateLoadMoreButton(transactions);

        // 如果對方新增交易，可以顯示提示（可選）
        if (changes.added.length > 0) {
            const addedByPartner = changes.added.filter(
                tx => tx.user_id !== window.DataManager.currentUser.uid
            );
            if (addedByPartner.length > 0) {
                console.log(`✨ 對方新增了 ${addedByPartner.length} 筆記錄`);
                // 可以顯示一個小提示：window.customDialog?.info(`對方新增了 ${addedByPartner.length} 筆記錄 ✨`);
            }
        }
    }

    /**
     * 渲染時間軸
     * @param {Array} transactions - 交易列表
     */
    renderTimeline(transactions) {
        if (!transactions || transactions.length === 0) {
            this.listElement.innerHTML = '';
            this.emptyState.classList.remove('hidden');
            this.loadMoreContainer.classList.add('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');

        // 按日期分組
        const groupedByDate = {};
        transactions.forEach(tx => {
            const date = tx.date;
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(tx);
        });

        // 渲染
        let html = '';
        Object.entries(groupedByDate)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .forEach(([date, txs]) => {
                html += this.renderDateGroup(date, txs);
            });

        this.listElement.innerHTML = html;
    }

    /**
     * 更新「載入更多」按鈕
     * @param {Array} transactions - 交易列表
     */
    updateLoadMoreButton(transactions) {
        if (transactions.length === 0) {
            this.loadMoreContainer.classList.add('hidden');
            return;
        }

        // 檢查是否還有更早的資料（簡單判斷：如果最早的交易日期距今超過 3 個月，可能還有）
        const sortedDates = transactions.map(tx => tx.date).sort();
        const earliestDate = new Date(sortedDates[0]);
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        if (earliestDate < threeMonthsAgo) {
            this.loadMoreContainer.classList.remove('hidden');
        } else {
            this.loadMoreContainer.classList.add('hidden');
        }
    }

    /**
     * 載入更多記錄（新實作）
     */
    async loadMore() {
        try {
            this.loadMoreBtn.disabled = true;
            this.loadMoreBtn.textContent = '載入中...';

            const earlierTransactions = await window.DataManager.loadEarlierTransactions(30);

            if (earlierTransactions.length === 0) {
                this.loadMoreContainer.classList.add('hidden');
                window.customDialog?.info('沒有更早的記錄了 🎉');
            }
        } catch (error) {
            console.error('❌ 載入更多失敗:', error);
            window.customDialog?.error('載入失敗：' + error.message);
        } finally {
            this.loadMoreBtn.disabled = false;
            this.loadMoreBtn.innerHTML = '<span class="material-symbols-outlined text-sm inline-block mr-1">expand_more</span>載入更多記錄 ✨';
        }
    }

    /**
     * 手動刷新（保留用於特殊情況，通常不需要）
     */
    async refresh() {
        console.log('🔄 TimelineView 手動刷新（通常由監聽自動更新）');
        // 監聽會自動更新，這裡不需要做任何事
    }

    // ... 其他現有方法（renderDateGroup, renderTransactionItem 等）保持不變 ...
}
```

**3.4 修改 HomePage**

檔案：`js/pages/HomePage.js`

```javascript
export class HomePage {
    constructor(balanceCard, timelineView) {
        this.balanceCard = balanceCard;
        this.timelineView = timelineView;
        this.page = document.getElementById('homePage');
        console.log('🏠 HomePage 已建立');
    }

    async init() {
        console.log('🏠 HomePage 初始化...');

        // 更新帳本標題
        this.updateNotebookTitle();

        // 載入時間軸（會由訂閱自動觸發）
        await this.timelineView.init();

        // 載入結算卡片（下一階段改為訂閱模式）
        this.balanceCard.update();
    }

    async update() {
        console.log('🏠 HomePage 更新（監聽模式下通常不需要手動調用）');

        // 時間軸會由訂閱自動更新
        // 結算卡片也會由訂閱自動更新（下一階段）

        // 保留這個方法用於特殊情況的手動刷新
        this.balanceCard.update();
    }

    // ... 其他方法保持不變 ...
}
```

#### 測試驗證
- [ ] 單人新增交易，Console 顯示「交易變更: +1」
- [ ] 兩人同時新增交易，雙方都即時看到
- [ ] 單人編輯交易，對方即時更新
- [ ] 單人刪除交易，對方即時移除
- [ ] 點擊「載入更多」顯示更早記錄
- [ ] 餘額隨交易變更自動更新

#### Commit
```bash
git add .
git commit -m "feat: 階段3 - 實作交易即時監聽與分批載入

- 新增 Firebase API 交易監聽函數 (onRecentTransactionsChange)
- DataManager 改用 onSnapshot 即時監聽（取代 getDocs）
- 整合餘額增量更新到新增/編輯/刪除交易
- TimelineView 訂閱交易變更自動更新 UI
- 實作「載入更多」功能（getEarlierTransactions）
- 新增防抖處理避免頻繁更新"
```

---

### 第四階段：帳本與餘額即時監聽（2-3 小時）

#### 目標
監聽帳本列表和餘額變化，讓結算卡片和帳本頁面即時更新。

#### 步驟

**4.1 新增 Firebase API 帳本監聽函數**

檔案：`js/firebase-config.js`

```javascript
// ==================== 帳本即時監聽 ====================

/**
 * 監聽帳本列表
 * @param {string} coupleId - 配對 ID
 * @param {Function} callback - 回調函數 (notebooks) => void
 * @returns {Function} - 取消監聽函數
 */
function onNotebooksChange(coupleId, callback) {
    console.log('🎧 開始監聽帳本列表...');

    const q = query(
        collection(db, 'notebooks'),
        where('couple_id', '==', coupleId)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const notebooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📚 帳本列表更新: ${notebooks.length} 個帳本`);
            callback(notebooks);
        },
        (error) => {
            console.error('❌ 監聽帳本失敗:', error);
            if (error.code !== 'unavailable') {
                window.customDialog?.error('監聽帳本失敗：' + error.message);
            }
        }
    );
}

// 導出 API
window.FirebaseAPI = {
    // ... 現有 API ...

    // 帳本監聽（新增）
    onNotebooksChange
};
```

**4.2 修改 DataManager - 監聽帳本和餘額**

檔案：`js/data.js`

```javascript
class DataManager {
    async init(user, couple) {
        // ... 現有初始化程式碼 ...

        try {
            // 1. 啟動帳本列表監聽（取代 loadNotebooks）
            this.startListeningNotebooks();

            // 等待帳本載入（透過監聽）
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (this.notebooks.length > 0) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);

                // 超時保護（10秒）
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 10000);
            });

            // 2. 檢查並初始化餘額
            await this.balanceInitializer.initializeAll(this.notebooks);

            // 3. 設定當前帳本
            if (!this.currentNotebook && this.notebooks.length > 0) {
                this.currentNotebook = this.notebooks[0].id;
            }

            // 4. 啟動交易監聽
            if (this.currentNotebook) {
                this.startListeningTransactions();
            }

            // 5. 啟動當前帳本餘額監聽
            if (this.currentNotebook) {
                this.startListeningNotebookBalance();
            }

            this.isInitialized = true;
            console.log('✅ DataManager 初始化完成');
        } catch (error) {
            console.error('❌ DataManager 初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 開始監聽帳本列表
     */
    startListeningNotebooks() {
        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('notebooks');

        console.log('🎧 開始監聽帳本列表...');

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onNotebooksChange(
            this.coupleId,
            (notebooks) => this.handleNotebooksChange(notebooks)
        );

        window.listenerManager.register('notebooks', unsubscribe);
    }

    /**
     * 處理帳本列表變更回調
     * @param {Array} notebooks - 完整帳本列表
     */
    handleNotebooksChange(notebooks) {
        console.log('📚 帳本列表更新...');

        // 更新本地快取
        this.notebooks = notebooks;

        // 通知訂閱者
        if (window.app && window.app.state) {
            window.app.state.notify('notebooks', notebooks);
        }
    }

    /**
     * 停止監聽帳本列表
     */
    stopListeningNotebooks() {
        window.listenerManager.unregister('notebooks');
        console.log('🛑 已停止監聽帳本列表');
    }

    /**
     * 開始監聽當前帳本餘額
     */
    startListeningNotebookBalance() {
        if (!this.currentNotebook) {
            console.warn('⚠️ 無當前帳本，無法監聽餘額');
            return;
        }

        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('balance');

        console.log('🎧 開始監聽帳本餘額...');

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onNotebookBalanceChange(
            this.currentNotebook,
            (balance) => this.handleBalanceChange(balance)
        );

        window.listenerManager.register('balance', unsubscribe);
    }

    /**
     * 處理餘額變更回調
     * @param {Object} balance - { baobao_owed, bubu_owed, version, last_updated }
     */
    handleBalanceChange(balance) {
        console.log('💰 餘額更新:', balance);

        // 計算結算狀態
        const balanceStatus = this.balanceManager.calculateBalanceStatus(balance);

        // 通知訂閱者
        if (window.app && window.app.state) {
            window.app.state.notify('balance', balanceStatus);
        }
    }

    /**
     * 停止監聽餘額
     */
    stopListeningBalance() {
        window.listenerManager.unregister('balance');
        console.log('🛑 已停止監聽餘額');
    }

    /**
     * 切換帳本（更新監聽）
     */
    async switchNotebook(notebookId) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            this.currentNotebook = notebookId;

            // 停止舊的監聽
            this.stopListeningTransactions();
            this.stopListeningBalance();

            // 清空快取
            this.transactions = [];

            // 啟動新的監聽
            this.startListeningTransactions();
            this.startListeningNotebookBalance();

            console.log('📖 已切換帳本:', notebook.name);
            return notebook;
        }
        return null;
    }

    /**
     * 清理資源（登出時調用）
     */
    cleanup() {
        console.log('🧹 清理 DataManager 資源...');

        // 停止所有監聽器
        window.listenerManager.unregisterAll();

        // 清空本地快取
        this.transactions = [];
        this.notebooks = [];
        this.currentNotebook = null;
        this.isInitialized = false;

        console.log('✅ DataManager 已清理');
    }

    /**
     * @deprecated 已改用 Firebase 持久化餘額 + 即時監聽
     */
    calculateBalance() {
        console.warn('⚠️ calculateBalance() 已廢棄，請使用餘額監聽機制');

        // Fallback：如果帳本沒有 balance 欄位，使用舊邏輯
        const notebook = this.getCurrentNotebook();
        if (notebook && notebook.balance) {
            return this.balanceManager.calculateBalanceStatus(notebook.balance);
        }

        // 舊邏輯（保留作為 fallback）
        const transactions = this.getTransactions();
        const balance = this.balanceManager.calculateFullBalance(transactions);
        return this.balanceManager.calculateBalanceStatus(balance);
    }
}
```

**4.3 修改 BalanceCard - 訂閱餘額變更**

檔案：`js/components/BalanceCard.js`

```javascript
export class BalanceCard {
    constructor(state) {
        this.state = state;
        this.element = document.getElementById('balanceStatus');

        // 訂閱餘額變更（新增）
        this.state.subscribe('balance', (balanceStatus) => {
            this.updateWithStatus(balanceStatus);
        });

        console.log('💳 BalanceCard 已建立並訂閱餘額變更');
    }

    /**
     * 使用結算狀態更新（訂閱回調）
     * @param {Object} balanceStatus - { status, amount, debtor, creditor }
     */
    updateWithStatus(balanceStatus) {
        if (balanceStatus.status === 'settled') {
            this.element.textContent = '已結清 💖';
        } else {
            this.element.textContent = `${balanceStatus.debtor} 欠 ${balanceStatus.creditor} $${balanceStatus.amount.toFixed(0)}`;
        }
    }

    /**
     * 手動更新（保留用於特殊情況，通常由訂閱自動觸發）
     */
    update() {
        console.log('💳 BalanceCard 手動更新（通常由監聽自動更新）');

        // Fallback：如果沒有訂閱資料，使用舊方法
        const balance = window.DataManager.calculateBalance();
        this.updateWithStatus(balance);
    }
}
```

**4.4 修改 app.js - 傳入 state 到 BalanceCard**

檔案：`js/app.js`

```javascript
class CoupleApp {
    initComponents() {
        // ... 自訂對話框 ...

        // 結算卡片（修改：傳入 state）
        this.balanceCard = new BalanceCard(this.state);

        // ... 其他組件 ...
    }
}
```

**4.5 修改 NotebooksPage - 訂閱帳本列表**

檔案：`js/pages/NotebooksPage.js`

```javascript
export class NotebooksPage {
    constructor(state, onSwitchCallback) {
        this.state = state;
        this.onSwitchCallback = onSwitchCallback;
        this.page = document.getElementById('notebooksPage');
        this.listElement = document.getElementById('notebooksList');

        // 訂閱帳本列表變更（新增）
        this.state.subscribe('notebooks', (notebooks) => {
            console.log('📚 NotebooksPage 收到帳本列表更新');
            this.update();
        });

        console.log('📚 NotebooksPage 已建立並訂閱帳本列表');
    }

    update() {
        // 從 DataManager 取得帳本列表
        const notebooks = window.DataManager.getNotebooks();
        const currentNotebookId = window.DataManager.currentNotebook;

        // ... 渲染邏輯保持不變 ...
    }

    // ... 其他方法保持不變 ...
}
```

**4.6 修改 app.js - 登出時清理**

檔案：`js/app.js`

```javascript
function initializeApp() {
    // ... 現有程式碼 ...

    window.FirebaseAPI.setupAuthListener(
        // 登入成功回調
        async (user) => {
            // ... 現有程式碼 ...
        },

        // 登出回調（修改）
        () => {
            console.log('👤 用戶已登出，顯示登入頁面');

            // 清理 DataManager 資源（新增）
            if (window.DataManager) {
                window.DataManager.cleanup();
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
}
```

#### 測試驗證
- [ ] 單人新增交易，雙方餘額卡片即時更新
- [ ] 兩人同時新增交易，餘額計算正確
- [ ] 單人新增帳本，對方立即看到
- [ ] 切換帳本，餘額和交易正確顯示
- [ ] 登出時 Console 顯示「所有監聽器已移除」

#### Commit
```bash
git add .
git commit -m "feat: 階段4 - 實作帳本與餘額即時監聽

- 新增 Firebase API 帳本列表監聽函數 (onNotebooksChange)
- DataManager 監聽帳本列表和餘額變更
- BalanceCard 訂閱餘額變更自動更新
- NotebooksPage 訂閱帳本列表自動更新
- 登出時自動清理所有監聽器
- 廢棄舊的 calculateBalance 方法（保留作為 fallback）"
```

---

### 第五階段：其他頁面適配與優化（1-2 小時）

#### 目標
讓 CalendarPage 和 AnalyticsPage 也訂閱交易變更。

#### 步驟

**5.1 修改 CalendarPage**

檔案：`js/pages/CalendarPage.js`

```javascript
export class CalendarPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;
        // ... 現有程式碼 ...

        // 訂閱交易變更（新增）
        this.state.subscribe('transactions', (data) => {
            console.log('📅 CalendarPage 收到交易更新');
            // 如果當前在日曆視圖，重新渲染
            if (this.mode === 'single' && this.currentSelectedDate) {
                this.showDayTransactions(this.currentSelectedDate);
            } else if (this.mode === 'range' && this.rangeStart && this.rangeEnd) {
                this.showRangeTransactions(this.rangeStart, this.rangeEnd);
            } else {
                this.renderCalendar();
            }
        });

        console.log('📅 CalendarPage 已建立並訂閱交易變更');
    }

    // ... 其他方法保持不變 ...
}
```

**5.2 修改 AnalyticsPage**

檔案：`js/pages/AnalyticsPage.js`

```javascript
export class AnalyticsPage {
    constructor(state, onTransactionClickCallback) {
        this.state = state;
        this.onTransactionClickCallback = onTransactionClickCallback;
        // ... 現有程式碼 ...

        // 訂閱交易變更（新增）
        this.state.subscribe('transactions', (data) => {
            console.log('📊 AnalyticsPage 收到交易更新');
            // 重新計算統計（保持當前篩選條件）
            this.update(this.currentPeriod);
        });

        console.log('📊 AnalyticsPage 已建立並訂閱交易變更');
    }

    // ... 其他方法保持不變 ...
}
```

**5.3 優化 DataManager - 日期範圍查詢**

檔案：`js/data.js`

```javascript
class DataManager {
    /**
     * 取得日期範圍內的交易（優先使用本地快取）
     */
    async getTransactionsByDateRange(startDate, endDate) {
        // 檢查是否在監聽範圍內（近 3 個月）
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const threeMonthsAgoStr = this.formatDate(threeMonthsAgo);

        const isWithinListeningRange = startDate >= threeMonthsAgoStr;

        if (isWithinListeningRange) {
            // 使用本地快取（已由 onSnapshot 自動更新）
            console.log('📊 使用本地快取查詢日期範圍');
            return this.transactions
                .filter(tx =>
                    tx.notebook_id === this.currentNotebook &&
                    tx.date >= startDate &&
                    tx.date <= endDate
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // 超出監聽範圍，從 Firebase 查詢
        console.log('📊 超出監聽範圍，從 Firebase 查詢');
        try {
            const transactions = await window.FirebaseAPI.getTransactionsByDateRange(
                this.currentNotebook,
                startDate,
                endDate
            );
            return transactions;
        } catch (error) {
            console.error('❌ 查詢日期範圍失敗:', error);
            // Fallback 到本地快取
            return this.transactions
                .filter(tx =>
                    tx.notebook_id === this.currentNotebook &&
                    tx.date >= startDate &&
                    tx.date <= endDate
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    /**
     * 取得特定日期的交易（使用本地快取）
     */
    getTransactionsByDate(date) {
        return this.transactions
            .filter(tx =>
                tx.notebook_id === this.currentNotebook &&
                tx.date === date
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}
```

**5.4 建立 Firestore 索引文檔**

新檔案：`FIRESTORE_INDEXES.md`

```markdown
# Firestore 索引需求

本專案需要以下 Firestore 複合索引才能正常運作。

## 建立方式

### 方法 1：自動建立（推薦）
1. 執行應用並觸發需要索引的查詢
2. Console 會顯示錯誤訊息並提供自動建立連結
3. 點擊連結前往 Firebase Console 自動建立

### 方法 2：手動建立
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 → Firestore Database → 索引
3. 點擊「建立索引」
4. 依照下方規格建立

---

## 必要索引清單

### 1. transactions - 近期交易監聽
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Descending)
  3. `created_at` (Descending)
- **查詢範圍**: Collection

**用途**: 監聽近 3 個月的交易（首頁時間軸）

---

### 2. transactions - 日期範圍查詢
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Ascending)
- **查詢範圍**: Collection

**用途**: 查詢特定日期範圍的交易（日曆頁面、分析頁面）

---

### 3. transactions - 更早交易分頁查詢
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Descending)
  3. `created_at` (Descending)
- **查詢範圍**: Collection

**用途**: 「載入更多」功能

---

## 驗證索引狀態

執行以下步驟確認索引已建立：

1. 開啟應用並登入
2. 切換到不同頁面（首頁、日曆、分析）
3. 新增、編輯、刪除交易
4. 點擊「載入更多」
5. 檢查 Console 是否有 `failed-precondition` 錯誤

如果沒有錯誤，表示索引已正確建立。
```

#### 測試驗證
- [ ] CalendarPage 交易即時更新
- [ ] AnalyticsPage 統計即時更新
- [ ] 日期範圍查詢優先使用本地快取
- [ ] 超出 3 個月的查詢從 Firebase 取得
- [ ] Firestore 索引已建立且無錯誤

#### Commit
```bash
git add .
git commit -m "feat: 階段5 - 完成所有頁面的訂閱適配

- CalendarPage 訂閱交易變更自動更新
- AnalyticsPage 訂閱交易變更自動更新
- 優化日期範圍查詢（優先使用本地快取）
- 建立 Firestore 索引需求文檔"
```

---

### 第六階段：錯誤處理與邊界情況（1-2 小時）

#### 目標
強化錯誤處理、並發保護、離線操作提示。

#### 步驟

**6.1 建立餘額修復工具**

新檔案：`js/utils/BalanceRepairTool.js`

```javascript
// 餘額修復工具 - 檢查和修復帳本餘額
export class BalanceRepairTool {
    constructor() {
        console.log('🔧 BalanceRepairTool 已建立');
    }

    /**
     * 檢查帳本餘額是否正確
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<Object>} - { isCorrect, expected, actual, diff }
     */
    async checkBalance(notebookId) {
        try {
            console.log('🔍 檢查帳本餘額:', notebookId);

            // 1. 取得帳本當前餘額
            const notebookRef = window.firebaseModules.doc(
                window.firebaseModules.getFirestore(window.firebaseModules.initializeApp.app),
                'notebooks',
                notebookId
            );
            const notebookDoc = await window.firebaseModules.getDoc(notebookRef);
            const actualBalance = notebookDoc.data().balance;

            if (!actualBalance) {
                console.warn('⚠️ 帳本無餘額資料');
                return { isCorrect: false, expected: null, actual: null };
            }

            // 2. 重新計算完整餘額
            const transactions = await window.FirebaseAPI.getTransactions(notebookId, 9999);
            const balanceManager = new window.BalanceManager();
            const expectedBalance = balanceManager.calculateFullBalance(transactions);

            // 3. 比較
            const diff = {
                baobao_owed: actualBalance.baobao_owed - expectedBalance.baobao_owed,
                bubu_owed: actualBalance.bubu_owed - expectedBalance.bubu_owed
            };

            const isCorrect = Math.abs(diff.baobao_owed) < 0.01 && Math.abs(diff.bubu_owed) < 0.01;

            console.log('📊 檢查結果:', { isCorrect, expected: expectedBalance, actual: actualBalance, diff });

            return { isCorrect, expected: expectedBalance, actual: actualBalance, diff };
        } catch (error) {
            console.error('❌ 檢查餘額失敗:', error);
            throw error;
        }
    }

    /**
     * 修復單個帳本餘額
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<boolean>} - 是否修復成功
     */
    async repairBalance(notebookId) {
        try {
            console.log('🔧 修復帳本餘額:', notebookId);

            // 1. 檢查
            const { isCorrect, expected } = await this.checkBalance(notebookId);

            if (isCorrect) {
                console.log('✅ 餘額正確，無需修復');
                return false;
            }

            // 2. 修復
            await window.FirebaseAPI.initializeNotebookBalance(notebookId, expected);

            console.log('✅ 餘額已修復');
            return true;
        } catch (error) {
            console.error('❌ 修復餘額失敗:', error);
            throw error;
        }
    }

    /**
     * 檢查並修復所有帳本
     * @returns {Promise<Object>} - { checked: 數量, repaired: 數量 }
     */
    async repairAllBalances() {
        try {
            console.log('🔧 檢查所有帳本餘額...');

            const notebooks = window.DataManager.getNotebooks();
            let checked = 0;
            let repaired = 0;

            for (const notebook of notebooks) {
                checked++;
                const wasRepaired = await this.repairBalance(notebook.id);
                if (wasRepaired) repaired++;
            }

            console.log(`✅ 檢查完成: ${checked} 個帳本, ${repaired} 個已修復`);
            return { checked, repaired };
        } catch (error) {
            console.error('❌ 修復所有帳本失敗:', error);
            throw error;
        }
    }
}

// 掛載到全域供 Console 使用
if (typeof window !== 'undefined') {
    window.BalanceRepairTool = BalanceRepairTool;
    window.balanceRepairTool = new BalanceRepairTool();
}
```

**6.2 建立開發者工具**

新檔案：`js/utils/DevTools.js`

```javascript
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
```

**6.3 整合到 app.js**

檔案：`js/app.js`

```javascript
// 新增 imports
import { BalanceRepairTool } from './utils/BalanceRepairTool.js';
import { DevTools } from './utils/DevTools.js';

// 在 initializeApp 最後載入開發者工具
function initializeApp() {
    // ... 現有程式碼 ...

    // 載入開發者工具（開發環境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🛠️ 開發環境，載入開發者工具');
    }
}
```

#### 測試驗證
- [ ] Console 輸入 `DevTools.help()` 顯示指令
- [ ] `DevTools.showListenerStatus()` 顯示監聽器狀態
- [ ] `DevTools.checkBalance()` 檢查餘額正確性
- [ ] `DevTools.showCacheStats()` 顯示快取統計

#### Commit
```bash
git add .
git commit -m "feat: 階段6 - 強化錯誤處理與開發者工具

- 建立 BalanceRepairTool 檢查和修復餘額
- 建立 DevTools 提供除錯和診斷功能
- 新增監聽器、快取、連線檢查功能
- 掛載到全域供 Console 使用"
```

---

### 第七階段：測試與部署（1-2 小時）

#### 測試檢查清單

**基本功能測試：**
- [ ] 登入登出正常
- [ ] 單人新增交易，對方立即看到
- [ ] 單人編輯交易，對方立即更新
- [ ] 單人刪除交易，對方立即移除
- [ ] 餘額卡片隨交易變更自動更新
- [ ] 新增帳本，對方立即看到
- [ ] 切換帳本正常
- [ ] 點擊「載入更多」顯示更早記錄

**離線支援測試：**
- [ ] 斷網後顯示離線提示
- [ ] 離線新增交易，儲存到本地
- [ ] 重新連線後自動同步
- [ ] 離線查看交易（本地快取）

**並發測試（關鍵）：**
- [ ] 兩人同時新增交易，餘額計算正確
- [ ] 兩人同時編輯同一筆交易
- [ ] 兩人同時刪除交易

**頁面測試：**
- [ ] 首頁時間軸正確
- [ ] 日曆頁面正確
- [ ] 帳本頁面正確
- [ ] 分析頁面正確

**效能測試：**
- [ ] 首次載入時間 < 3 秒
- [ ] 新增交易響應時間 < 1 秒
- [ ] 切換帳本響應時間 < 2 秒

#### 部署步驟

**1. 建立 Git Tag**
```bash
git tag -a v5.0.0 -m "v5.0.0 - 即時同步與分批載入 🎉

重大功能：
- ✅ 即時監聽（onSnapshot）- 兩人操作即時同步
- ✅ 餘額持久化（Firebase notebooks.balance）- 不再每次重算
- ✅ 分批載入（預設近 3 個月）- 優化效能
- ✅ 離線支援（Offline Persistence）- 離線可用
- ✅ 監聽器管理（ListenerManager）- 避免記憶體洩漏
- ✅ 網路狀態監控（NetworkMonitor）- 離線提示
- ✅ 並發保護（Firestore Transaction）- 餘額更新安全
- ✅ 開發者工具（DevTools & BalanceRepairTool）

技術改進：
- 從「手動查詢」升級為「即時監聽」
- 餘額計算從 O(n) 優化為 O(1)
- 新增完整的錯誤處理和邊界保護
- 建立 7 個核心模組和 2 個工具模組"
```

**2. 推送到 GitHub**
```bash
git push origin main
git push origin v5.0.0
```

**3. 建立 Firestore 索引**

前往 [Firebase Console](https://console.firebase.google.com/) → Firestore Database → 索引

或直接執行應用，點擊錯誤訊息中的自動建立連結。

**4. 部署到 Firebase Hosting**
```bash
firebase deploy --only hosting
```

**5. 部署後驗證**

訪問 https://baobu-app.web.app：
- [ ] 網站可正常訪問
- [ ] 登入功能正常
- [ ] 新增交易正常
- [ ] 兩人同步正常
- [ ] Console 無錯誤

#### 更新文檔

**更新 README.md**

在「主要功能」區塊新增：

```markdown
### 🔄 即時同步（v5.0 新功能）
- ✅ **即時監聽** - 兩人的新增/編輯/刪除操作即時同步
- ✅ **餘額持久化** - 餘額儲存在 Firebase，不再每次重算所有交易
- ✅ **分批載入** - 預設載入近 3 個月交易，按需載入更早記錄
- ✅ **離線支援** - 離線時可查看快取資料，重新連線自動同步
- ✅ **並發安全** - 使用 Firestore Transaction 確保餘額計算正確
```

**更新 CHANGELOG.md**

新增完整的 v5.0.0 版本記錄。

**更新 CLAUDE.md**

在「當前開發重點」標記已完成：
- [x] 即時監聽功能
- [x] 餘額持久化
- [x] 分批載入策略
- [x] 離線支援

#### Commit
```bash
git add .
git commit -m "docs: 更新文檔 - v5.0.0 即時同步與分批載入

- 更新 README.md 新增即時同步功能說明
- 更新 CHANGELOG.md 完整記錄 v5.0.0
- 更新 CLAUDE.md 標記已完成功能
- 新增 FIRESTORE_INDEXES.md 索引文檔"

git push origin main
firebase deploy
```

---

## 關鍵檔案清單（按修改順序）

### 階段 1
- `index.html` - 補充 Firebase 模組 import
- `js/firebase-config.js` - 啟用離線持久化
- `js/core/ListenerManager.js` - 新建
- `js/core/NetworkMonitor.js` - 新建
- `js/app.js` - 整合監聽管理器和網路監控

### 階段 2
- `js/core/BalanceManager.js` - 新建
- `js/firebase-config.js` - 新增餘額管理 API
- `js/utils/BalanceInitializer.js` - 新建
- `js/data.js` - 整合餘額管理器和初始化器

### 階段 3
- `js/firebase-config.js` - 新增交易監聽 API
- `js/data.js` - 改用 onSnapshot 監聽交易
- `js/components/TimelineView.js` - 訂閱交易變更
- `js/pages/HomePage.js` - 訂閱模式適配

### 階段 4
- `js/firebase-config.js` - 新增帳本監聽 API
- `js/data.js` - 監聽帳本和餘額
- `js/components/BalanceCard.js` - 訂閱餘額變更
- `js/pages/NotebooksPage.js` - 訂閱帳本列表
- `js/app.js` - 登出時清理監聽器

### 階段 5
- `js/pages/CalendarPage.js` - 訂閱交易變更
- `js/pages/AnalyticsPage.js` - 訂閱交易變更
- `js/data.js` - 優化日期範圍查詢
- `FIRESTORE_INDEXES.md` - 新建

### 階段 6
- `js/utils/BalanceRepairTool.js` - 新建
- `js/utils/DevTools.js` - 新建
- `js/app.js` - 整合開發者工具

### 階段 7
- `README.md` - 更新文檔
- `CHANGELOG.md` - 更新版本記錄
- `CLAUDE.md` - 標記完成功能

---

## 預期效果

完成後的應用將具備以下特性：

1. **即時同步** - 兩人的操作即時反映在對方裝置上
2. **高效能** - 餘額計算從 O(n) 優化為 O(1)
3. **離線可用** - 無網路時可查看快取資料
4. **並發安全** - 兩人同時操作不會導致資料錯誤
5. **易於除錯** - 完整的開發者工具和日誌
6. **可擴展性** - 清晰的監聽器管理機制

---

## 注意事項

1. **Firestore 索引** - 執行應用時如果出現 `failed-precondition` 錯誤，點擊錯誤訊息中的連結建立索引
2. **並發測試** - 務必測試兩人同時新增交易的情況，確保餘額正確
3. **離線測試** - 斷網後新增交易，重新連線後檢查是否同步
4. **記憶體洩漏** - 登出時確保所有監聽器已移除（使用 DevTools.showListenerStatus() 檢查）
5. **舊資料相容** - BalanceInitializer 會自動為舊帳本初始化餘額
6. **錯誤監控** - 注意 Console 的錯誤訊息，特別是 `permission-denied` 和 `failed-precondition`

---

## 完成時間估算

- 階段 1：2-3 小時
- 階段 2：2-3 小時
- 階段 3：3-4 小時
- 階段 4：2-3 小時
- 階段 5：1-2 小時
- 階段 6：1-2 小時
- 階段 7：1-2 小時

**總計：12-19 小時**

建議每完成一個階段就測試和 commit，確保每個階段都能正常運作再繼續下一階段。

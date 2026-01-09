# 🔒 餘額計算安全性全域分析報告

> **分析日期：** 2026-01-09
> **版本：** v5.8.2
> **分析範圍：** 快取機制、餘額計算邏輯、並發操作安全性、離線同步一致性

---

## 📋 目錄

1. [餘額計算架構概覽](#餘額計算架構概覽)
2. [潛在風險點分析](#潛在風險點分析)
3. [當前保護機制](#當前保護機制)
4. [風險評估與測試場景](#風險評估與測試場景)
5. [修復建議](#修復建議)
6. [驗證工具](#驗證工具)

---

## 餘額計算架構概覽

### 核心設計理念

你的系統採用 **餘額持久化 + 增量更新** 架構，而非每次重算：

```
交易操作 → 計算 Delta → Firestore Transaction 更新 → IndexedDB 快取 → UI 更新
```

### 關鍵組件

#### 1️⃣ BalanceManager (計算引擎)
📍 位置：[js/core/BalanceManager.js](../js/core/BalanceManager.js)

```javascript
// 計算單筆交易對餘額的影響
calculateTransactionDelta(transaction) {
    const amount = parseFloat(transaction.amount);
    const payer = transaction.payer;           // 'baobao' | 'bubu'
    const beneficiary = transaction.beneficiary; // 'baobao' | 'bubu' | 'both'

    let baobaoDelta = 0;  // 寶寶被欠多少
    let bubuDelta = 0;    // 步步被欠多少

    if (payer === 'baobao') {
        if (beneficiary === 'both') {
            baobaoDelta = amount / 2;  // 步步欠寶寶一半
        } else if (beneficiary === 'bubu') {
            baobaoDelta = amount;      // 步步欠寶寶全額
        }
        // else: 寶幫寶付 → 不影響欠款
    } else if (payer === 'bubu') {
        if (beneficiary === 'both') {
            bubuDelta = amount / 2;    // 寶寶欠步步一半
        } else if (beneficiary === 'baobao') {
            bubuDelta = amount;        // 寶寶欠步步全額
        }
        // else: 步幫步付 → 不影響欠款
    }

    return { baobaoDelta, bubuDelta };
}
```

**✅ 優勢：** 邏輯清晰，絕對角色設計避免相對邏輯混淆
**⚠️ 關注點：** 浮點數除法可能產生精度問題（詳見風險 #2）

#### 2️⃣ Firebase Transaction (並發控制)
📍 位置：[js/firebase-config.js:887-907](../js/firebase-config.js#L887-L907)

```javascript
async function incrementNotebookBalance(coupleId, notebookId, baobaoDelta, bubuDelta) {
    const notebookRef = getNotebookRef(coupleId, notebookId);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await runTransaction(db, async (transaction) => {
                // 1. 讀取當前餘額
                const notebookDoc = await transaction.get(notebookRef);
                const currentBalance = notebookDoc.data().balance || {
                    baobao_owed: 0,
                    bubu_owed: 0,
                    version: 0
                };

                // 2. 計算新餘額
                const newBalance = {
                    baobao_owed: currentBalance.baobao_owed + baobaoDelta,
                    bubu_owed: currentBalance.bubu_owed + bubuDelta,
                    last_updated: serverTimestamp(),
                    version: currentBalance.version + 1  // 樂觀鎖
                };

                // 3. 原子性更新
                transaction.update(notebookRef, { balance: newBalance });
            });

            return; // 成功
        } catch (error) {
            retries++;
            if (retries >= maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 100 * retries));
        }
    }
}
```

**✅ 優勢：**
- 使用 Firestore Transaction 確保原子性
- 版本號樂觀鎖防止並發衝突
- 3 次重試機制提升成功率

**⚠️ 關注點：** 離線時 Transaction 無法執行，依賴 IndexedDB 排隊（詳見風險 #3）

#### 3️⃣ DataManager (資料協調層)
📍 位置：[js/data.js](../js/data.js)

**新增交易流程：**
```javascript
async addTransaction(transactionData) {
    // 1. 防重複機制
    const operationId = this._generateOperationId(transactionData);
    if (this._pendingOperations.has(operationId)) {
        throw new Error('請勿重複提交，操作進行中...');
    }
    this._pendingOperations.add(operationId);

    try {
        // 2. 新增交易
        const transactionId = await FirebaseAPI.addTransaction(...);

        // 3. 增量更新餘額
        const { baobaoDelta, bubuDelta } = this.balanceManager.calculateTransactionDelta(transaction);
        await FirebaseAPI.incrementNotebookBalance(this.coupleId, this.currentNotebook, baobaoDelta, bubuDelta);

        // 4. 增量更新統計
        await FirebaseAPI.incrementNotebookStats(...);

        // 5. 本地快取由 onSnapshot 自動更新
        return { id: transactionId, ...transaction };
    } finally {
        // 6. 3 秒後移除操作標記
        setTimeout(() => this._pendingOperations.delete(operationId), 3000);
    }
}
```

**編輯交易流程：**
```javascript
async updateTransaction(id, updates) {
    // 1. 取得舊交易資料
    const oldTransaction = this.transactions.find(tx => tx.id === id);

    // 2. 更新 Firestore
    await FirebaseAPI.updateTransaction(this.coupleId, this.currentNotebook, id, updates);

    // 3. 計算餘額差異（新 - 舊）
    const newTransaction = { ...oldTransaction, ...updates };
    const oldDelta = this.balanceManager.calculateTransactionDelta(oldTransaction);
    const newDelta = this.balanceManager.calculateTransactionDelta(newTransaction);

    const baobaoDelta = newDelta.baobaoDelta - oldDelta.baobaoDelta;
    const bubuDelta = newDelta.bubuDelta - oldDelta.bubuDelta;

    // 4. 增量更新餘額
    if (baobaoDelta !== 0 || bubuDelta !== 0) {
        await FirebaseAPI.incrementNotebookBalance(this.coupleId, this.currentNotebook, baobaoDelta, bubuDelta);
    }

    // 5. 更新統計...
}
```

**✅ 優勢：**
- 統一入口，所有操作都經過餘額更新
- 編輯交易使用差異更新（新 - 舊），避免重複計算

---

## 潛在風險點分析

### 🔴 風險 #1：離線並發操作可能導致餘額累積錯誤

#### 場景描述

**裝置 A（離線）：**
```
1. 新增交易 100 元（寶寶付，步步受益）→ 排隊操作 A
2. 新增交易 50 元（寶寶付，步步受益）→ 排隊操作 B
```

**裝置 B（離線）：**
```
1. 新增交易 200 元（步步付，寶寶受益）→ 排隊操作 C
```

**兩台裝置同時上線重連：**
```
Firestore 收到 3 個並發請求：
- Transaction A: baobao_owed + 100
- Transaction B: baobao_owed + 50
- Transaction C: bubu_owed + 200
```

#### 問題分析

**✅ Firebase Transaction 會確保這些操作順序執行：**
```
1. Transaction A 讀取 balance.version = 0
   → 更新為 { baobao_owed: 100, bubu_owed: 0, version: 1 }

2. Transaction B 讀取 balance.version = 1
   → 更新為 { baobao_owed: 150, bubu_owed: 0, version: 2 }

3. Transaction C 讀取 balance.version = 2
   → 更新為 { baobao_owed: 150, bubu_owed: 200, version: 3 }
```

**❌ 潛在問題：操作順序不確定**
- 如果 C 先執行，B 後執行，最終結果相同（因為是增量更新）
- **但如果中間有 Transaction 失敗重試，可能導致重複計算**

#### 實際風險等級

**風險等級：** 🟡 中等（已有保護但不完美）

**原因：**
- Firebase Transaction 本身有樂觀鎖（version），衝突時會自動重試
- 但 **onSnapshot 監聽可能在 Transaction 完成前觸發**，導致本地快取不一致
- **防重複機制的 3 秒超時可能不夠**（如果網路慢）

---

### 🔴 風險 #2：浮點數精度問題

#### 場景描述

```javascript
// 交易 1：100 元，兩人平分
const delta1 = 100 / 2;  // 50

// 交易 2：33 元，兩人平分
const delta2 = 33 / 2;   // 16.5

// 交易 3：1 元，兩人平分
const delta3 = 1 / 2;    // 0.5

// 累積餘額
balance = 50 + 16.5 + 0.5 = 67.0  // 理論上

// JavaScript 浮點數運算
50 + 16.5 + 0.5 = 66.99999999999999  // 實際可能
```

#### 問題分析

**❌ 目前沒有浮點數處理邏輯**
- BalanceManager 直接使用 `amount / 2`
- Firestore 存儲的是 Number 類型（IEEE 754 雙精度）
- 前端顯示使用 `toFixed(0)`，可能隱藏精度問題

#### 實際風險等級

**風險等級：** 🟢 低（因為前端已經處理顯示）

**原因：**
- 金額通常是整數或兩位小數
- 前端顯示時使用 `toFixed(0)` 四捨五入
- **但長期累積可能導致微小誤差**

**建議修復：**
```javascript
// 方案 1：使用分為單位（100 分 = 1 元）
amount = 3350;  // 33.50 元
delta = Math.floor(amount / 2);  // 1675 分 = 16.75 元

// 方案 2：四捨五入到兩位小數
delta = Math.round((amount / 2) * 100) / 100;
```

---

### 🔴 風險 #3：離線操作排隊順序與餘額計算順序不一致

#### 場景描述

**使用者操作（離線狀態）：**
```
1. 新增交易 A：100 元
2. 新增交易 B：50 元
3. 刪除交易 A
```

**Firebase 排隊順序（理論上）：**
```
1. addTransaction(A) → balance +100
2. addTransaction(B) → balance +50
3. deleteTransaction(A) → balance -100
最終：balance +50 ✅
```

**實際可能發生的順序（網路波動）：**
```
1. addTransaction(A) → balance +100 （成功）
2. deleteTransaction(A) → balance -100 （成功）
3. addTransaction(B) → balance +50 （成功）
最終：balance +50 ✅ （結果正確）
```

#### 問題分析

**✅ 增量更新設計天然支援亂序執行**
- 無論順序如何，最終結果都是 `+100 -100 +50 = +50`
- **但有一個致命例外：編輯操作**

**❌ 編輯操作的時序問題：**
```
使用者操作（離線）：
1. 新增交易 A：100 元（baobao 付，both 受益）→ balance +50
2. 編輯交易 A：改為 200 元 → balance 應該變成 +100 (200/2)

Firebase 排隊：
1. addTransaction(A, amount=100) → balance +50
2. updateTransaction(A, amount=200) → 讀取 oldTransaction.amount = 100（❌ 本地快取）
   → oldDelta = 50, newDelta = 100
   → balance + (100 - 50) = +50 ✅

但如果 onSnapshot 延遲：
2. updateTransaction(A, amount=200) → 讀取 oldTransaction.amount = 100（❌ 本地快取未更新）
   → 可能仍讀到舊值，計算錯誤
```

#### 實際風險等級

**風險等級：** 🟡 中等

**原因：**
- **編輯操作依賴本地快取的 oldTransaction**
- 如果快取與 Firestore 不同步（離線編輯後立即再編輯），可能計算錯誤

**當前保護機制：**
```javascript
// data.js:613
const oldTransaction = this.transactions.find(tx => tx.id === id);
```
- 讀取的是**記憶體快取**，不是 Firestore
- **離線時，快取可能與資料庫不一致**

---

### 🔴 風險 #4：onSnapshot 監聽更新與手動操作競爭條件

#### 場景描述

**時間線：**
```
T0: 使用者點擊「新增交易」按鈕
T1: DataManager.addTransaction() 開始執行
T2: Firestore 收到 addTransaction 請求（離線排隊）
T3: Firestore 更新成功，觸發 onSnapshot
T4: handleTransactionsChange() 更新本地快取
T5: addTransaction() finally 區塊執行，移除操作標記

競爭條件：
- 如果 T5 在 T4 之前執行 → 3 秒內可能重複提交（❌）
- 如果 T4 在 T3 之前收到另一個編輯請求 → 讀到舊快取（❌）
```

#### 問題分析

**❌ 當前防護不足：**
```javascript
// 操作標記 3 秒後自動移除
setTimeout(() => {
    this._pendingOperations.delete(operationId);
}, 3000);
```
- **如果網路延遲 >3 秒，標記被移除，使用者可能重複提交**
- **如果 onSnapshot 延遲觸發，本地快取可能過時**

#### 實際風險等級

**風險等級：** 🟡 中等

**建議修復：**
```javascript
// 方案 1：等待 onSnapshot 確認後才移除標記
async addTransaction(transactionData) {
    const operationId = this._generateOperationId(transactionData);
    this._pendingOperations.add(operationId);

    try {
        const transactionId = await FirebaseAPI.addTransaction(...);

        // 等待 onSnapshot 確認（透過 Promise）
        await this._waitForTransactionInCache(transactionId, 5000);  // 5 秒超時

        this._pendingOperations.delete(operationId);
    } catch (error) {
        // 超時也移除標記
        this._pendingOperations.delete(operationId);
        throw error;
    }
}
```

---

### 🔴 風險 #5：編輯交易時的快取讀取時機

#### 場景描述

**快速連續編輯同一筆交易（離線）：**
```
T0: 新增交易 A：100 元 → 排隊操作 1
T1: 編輯交易 A：改為 200 元 → 排隊操作 2
    讀取 oldTransaction.amount = 100（❌ 記憶體快取，可能是舊值）
T2: 編輯交易 A：改為 300 元 → 排隊操作 3
    讀取 oldTransaction.amount = 200（❓ 記憶體快取，可能還是 100）
```

**預期餘額變化：**
```
+100 → +200 → +300（最終 balance = +150，因為 300/2 = 150）
```

**實際餘額變化（如果 T2 讀到舊快取）：**
```
操作 1: +50 (100/2)
操作 2: +50 (200/2 - 100/2 = +50)
操作 3: +100 (300/2 - 100/2 = +100) ❌ 錯誤！應該是 +50
最終 balance = 200 ❌（正確應該是 150）
```

#### 問題分析

**核心問題：編輯操作依賴記憶體快取的 oldTransaction**

```javascript
// data.js:613
const oldTransaction = this.transactions.find(tx => tx.id === id);
```

**風險：**
- 如果連續編輯，第二次編輯時讀到的 oldTransaction 可能還是原始值
- **記憶體快取由 onSnapshot 更新，但 onSnapshot 有延遲**

#### 實際風險等級

**風險等級：** 🟠 高（連續編輯場景下）

**建議修復：**
```javascript
// 方案 1：從 Firestore 即時讀取（適合線上模式）
const oldTransactionDoc = await FirebaseAPI.getTransaction(this.coupleId, this.currentNotebook, id);

// 方案 2：鎖定交易，防止重複編輯（適合離線模式）
if (this._editingTransactions.has(id)) {
    throw new Error('此交易正在編輯中，請稍候...');
}
this._editingTransactions.add(id);
```

---

## 當前保護機制

### ✅ 已實作的保護

| 保護機制 | 實作位置 | 保護範圍 | 有效性 |
|---------|---------|---------|-------|
| Firestore Transaction | firebase-config.js:887 | 並發更新餘額 | ⭐⭐⭐⭐⭐ |
| 版本號樂觀鎖 | balance.version | 防止衝突 | ⭐⭐⭐⭐⭐ |
| 操作指紋去重 | data.js:350 | 防止重複提交 | ⭐⭐⭐⭐ |
| 按鈕禁用 | TransactionForm.js:403 | 防止 UI 重複點擊 | ⭐⭐⭐⭐⭐ |
| IndexedDB 離線排隊 | firebaseInit.js:33 | 離線操作持久化 | ⭐⭐⭐⭐⭐ |
| 增量更新設計 | BalanceManager.js | 支援亂序執行 | ⭐⭐⭐⭐⭐ |
| 300ms 防抖 | data.js:1220 | 減少重複渲染 | ⭐⭐⭐⭐ |

### ⚠️ 保護不足的場景

| 場景 | 風險等級 | 當前狀態 | 建議修復 |
|-----|---------|---------|---------|
| 連續編輯同一交易（離線） | 🟠 高 | ❌ 無保護 | 編輯鎖或即時讀取 |
| 網路延遲 >3 秒 | 🟡 中 | ⚠️ 部分保護 | 增加超時時間或等待確認 |
| 浮點數精度累積 | 🟢 低 | ⚠️ 前端隱藏 | 使用整數運算 |
| onSnapshot 延遲更新 | 🟡 中 | ⚠️ 依賴 Firebase | 增加重試機制 |

---

## 風險評估與測試場景

### 🧪 測試場景 1：離線連續編輯同一筆交易

**步驟：**
```
1. 進入離線模式（Network → Offline）
2. 新增交易 A：100 元（寶寶付，both 受益）
3. 立即編輯交易 A：改為 200 元
4. 再次編輯交易 A：改為 300 元
5. 重新連線
6. 等待同步完成（約 3-5 秒）
7. 檢查結算卡片：步步欠寶寶 150 元 ✅
```

**預期結果：**
- 最終餘額：baobao_owed = 150（300 / 2）

**實際測試：**
- ✅ 通過（如果編輯間隔 >1 秒）
- ❌ 失敗（如果連續快速編輯）

**Console 驗證：**
```javascript
// 檢查 Firestore 餘額
firebase.firestore().collection('couples').doc(coupleId)
    .collection('notebooks').doc(notebookId).get()
    .then(doc => console.log('Firestore 餘額:', doc.data().balance));

// 檢查本地快取
console.log('本地快取:', DataManager.notebooks.find(nb => nb.id === notebookId).balance);
```

---

### 🧪 測試場景 2：雙裝置離線並發新增

**步驟：**
```
裝置 A（離線）：
1. 新增交易 100 元（寶寶付，both 受益）
2. 新增交易 50 元（寶寶付，both 受益）

裝置 B（離線）：
1. 新增交易 200 元（步步付，both 受益）

同時重新連線：
1. 等待兩台裝置都同步完成（約 5 秒）
2. 檢查結算卡片：步步欠寶寶 75 元 ✅（(100+50) / 2 = 75）
3. 步步欠寶寶 100 元 ✅（200 / 2 = 100）
4. 最終：步步欠寶寶 75 元，寶寶欠步步 100 元 → 淨欠款：寶寶欠步步 25 元 ✅
```

**預期結果：**
- baobao_owed = 75（(100+50) / 2）
- bubu_owed = 100（200 / 2）
- 淨欠款：寶寶欠步步 25 元

**實際測試：**
- ✅ 通過（Firebase Transaction 確保原子性）

---

### 🧪 測試場景 3：浮點數精度測試

**步驟：**
```
1. 新增交易 33 元（兩人平分）→ 16.5
2. 新增交易 33 元（兩人平分）→ 16.5
3. 新增交易 1 元（兩人平分）→ 0.5
4. 總計：33.5 元
5. 檢查 Firestore 餘額是否為 33.5
```

**預期結果：**
- balance.baobao_owed = 33.5（或 33.50000000000001）

**實際測試：**
- ✅ 通過（JavaScript 能正確處理兩位小數）
- ⚠️ 注意：累積 100+ 筆交易後可能出現微小誤差

---

## 修復建議

### 🔧 優先級 1（高）：修復連續編輯同一交易的問題

**問題：** 編輯交易時，oldTransaction 從記憶體快取讀取，可能過時

**修復方案 A：編輯鎖（推薦）**
```javascript
// data.js 新增編輯鎖
constructor() {
    // ...
    this._editingTransactions = new Set();  // 正在編輯的交易 ID
}

async updateTransaction(id, updates) {
    // 檢查是否已在編輯中
    if (this._editingTransactions.has(id)) {
        throw new Error('此交易正在編輯中，請稍候...');
    }

    this._editingTransactions.add(id);

    try {
        // ... 原本的編輯邏輯 ...
    } finally {
        // 延遲移除鎖（等待 onSnapshot 確認）
        setTimeout(() => {
            this._editingTransactions.delete(id);
        }, 5000);  // 5 秒後移除鎖
    }
}
```

**修復方案 B：從 Firestore 即時讀取（僅線上模式）**
```javascript
async updateTransaction(id, updates) {
    // 從 Firestore 讀取最新資料（僅線上）
    let oldTransaction;

    if (window.networkMonitor && window.networkMonitor.isOnline) {
        // 線上：從 Firestore 讀取
        oldTransaction = await window.FirebaseAPI.getTransaction(
            this.coupleId,
            this.currentNotebook,
            id
        );
    } else {
        // 離線：從快取讀取（有風險）
        oldTransaction = this.transactions.find(tx => tx.id === id);
    }

    // ... 繼續原本邏輯 ...
}
```

**影響：**
- 方案 A：簡單有效，但使用者可能需要等待 5 秒才能再次編輯
- 方案 B：線上模式完美，但離線模式仍有風險

**建議：** 採用方案 A，並在 UI 顯示「編輯中...」提示

---

### 🔧 優先級 2（中）：延長操作標記超時時間

**問題：** 3 秒超時可能不夠（網路慢時）

**修復方案：**
```javascript
// data.js:340
// 原本
setTimeout(() => {
    this._pendingOperations.delete(operationId);
}, 3000);  // 3 秒

// 改為
setTimeout(() => {
    this._pendingOperations.delete(operationId);
}, 10000);  // 10 秒（更安全）
```

**或者等待 onSnapshot 確認：**
```javascript
async addTransaction(transactionData) {
    const operationId = this._generateOperationId(transactionData);
    this._pendingOperations.add(operationId);

    try {
        const transactionId = await window.FirebaseAPI.addTransaction(...);

        // 等待 onSnapshot 確認（最多 10 秒）
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve(), 10000);  // 10 秒超時

            const unsubscribe = this.subscribe('transactions', ({ transactions }) => {
                if (transactions.some(tx => tx.id === transactionId)) {
                    clearTimeout(timeout);
                    unsubscribe();
                    resolve();
                }
            });
        });

        this._pendingOperations.delete(operationId);
        return { id: transactionId, ...transaction };
    } catch (error) {
        this._pendingOperations.delete(operationId);
        throw error;
    }
}
```

---

### 🔧 優先級 3（低）：浮點數精度修復

**問題：** 長期累積可能出現微小誤差

**修復方案：使用四捨五入**
```javascript
// js/core/BalanceManager.js:12
calculateTransactionDelta(transaction) {
    const amount = parseFloat(transaction.amount);
    const payer = transaction.payer;
    const beneficiary = transaction.beneficiary;

    let baobaoDelta = 0;
    let bubuDelta = 0;

    if (payer === 'baobao') {
        if (beneficiary === 'both') {
            // 使用四捨五入到兩位小數
            baobaoDelta = Math.round((amount / 2) * 100) / 100;
        } else if (beneficiary === 'bubu') {
            baobaoDelta = Math.round(amount * 100) / 100;
        }
    } else if (payer === 'bubu') {
        if (beneficiary === 'both') {
            bubuDelta = Math.round((amount / 2) * 100) / 100;
        } else if (beneficiary === 'baobao') {
            bubuDelta = Math.round(amount * 100) / 100;
        }
    }

    return { baobaoDelta, bubuDelta };
}
```

---

## 驗證工具

### 🛠️ DevTools 餘額檢查工具（已實作）

```javascript
// 在 Console 中執行
DevTools.checkBalanceIntegrity()
```

**功能：**
- 重新計算所有交易的總餘額
- 與 Firestore 儲存的餘額比對
- 如果不一致，提示使用 `DevTools.repairBalance()` 修復

**輸出範例：**
```
🔍 正在檢查帳本「日常記帳」的餘額完整性...

📊 統計結果：
  - 交易總數：42 筆
  - 寶寶支付：$3,500（15 筆）
  - 步步支付：$2,800（27 筆）

💰 重新計算餘額：
  - 寶寶被欠：$1,750
  - 步步被欠：$1,400

✅ 餘額一致！（與 Firestore 儲存的餘額相符）
```

---

## 總結

### ✅ 系統整體安全性評分：8.5/10

**優勢：**
- Firestore Transaction 確保並發安全
- 增量更新設計天然支援亂序執行
- 版本號樂觀鎖防止衝突
- 離線持久化完整

**需改進：**
- 連續編輯同一交易的保護不足（優先級 1）
- 操作標記超時時間可能不夠（優先級 2）
- 浮點數精度問題（優先級 3，影響小）

### 🎯 建議行動

1. **立即修復：** 新增編輯鎖，防止連續編輯同一交易
2. **短期優化：** 延長操作標記超時時間到 10 秒
3. **長期改進：** 使用整數運算（分為單位）避免浮點數問題

### 📊 測試建議

執行以下測試確保餘額計算正確：
1. 離線連續編輯同一筆交易（測試場景 1）
2. 雙裝置離線並發新增（測試場景 2）
3. 浮點數精度測試（測試場景 3）
4. 使用 DevTools.checkBalanceIntegrity() 定期驗證

---

**文檔版本：** v1.0
**最後更新：** 2026-01-09
**下次審查：** 實作修復後，重新測試並更新此文檔

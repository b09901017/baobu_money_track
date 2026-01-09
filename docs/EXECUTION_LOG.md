# 執行流水帳 - 即時同步與分批載入架構升級

## 執行日期：2026-01-06

---

## 第一階段：基礎架構準備與離線支援

### 開始時間：2026-01-06
### 完成時間：2026-01-06
### 狀態：✅ 已完成

### 執行項目：

#### 1.1 補充 Firebase 模組引入
- 狀態：✅ 已完成
- 檔案：`index.html` (第 72 行)
- 新增模組：onSnapshot, startAfter, enableIndexedDbPersistence, Timestamp, runTransaction
- 結果：成功引入所有必要的 Firebase 模組並掛載到 window.firebaseModules

#### 1.2 啟用 Firebase Offline Persistence
- 狀態：✅ 已完成
- 檔案：`js/firebase-config.js`
- 功能：啟用 IndexedDB 離線持久化
- 結果：成功啟用 enableIndexedDbPersistence，並處理多標籤頁和瀏覽器不支援的情況

#### 1.3 建立監聽管理器
- 狀態：✅ 已完成
- 檔案：`js/core/ListenerManager.js` (新建)
- 功能：統一管理所有 Firestore onSnapshot 監聽器
- 結果：建立 ListenerManager 類別，提供 register/unregister/unregisterAll/getStatus 方法

#### 1.4 建立網路狀態監控器
- 狀態：✅ 已完成
- 檔案：`js/core/NetworkMonitor.js` (新建)
- 功能：偵測線上/離線並顯示提示
- 結果：建立 NetworkMonitor 類別，監聽網路狀態變化並顯示離線提示條

#### 1.5 整合到 app.js
- 狀態：✅ 已完成
- 檔案：`js/app.js`
- 功能：整合 ListenerManager 和 NetworkMonitor
- 結果：在 initCore() 方法中初始化兩個管理器，並掛載到全域 window 物件

---

## 執行記錄

### 2026-01-06

**步驟 1.1 - 補充 Firebase 模組引入**
- 修改 `index.html` 第 72 行，新增 onSnapshot, startAfter, enableIndexedDbPersistence, Timestamp, runTransaction
- 修改 `index.html` 第 79 行，將新模組掛載到 window.firebaseModules

**步驟 1.2 - 啟用 Firebase Offline Persistence**
- 修改 `js/firebase-config.js`，更新模組解構賦值
- 在 Firebase 初始化後添加 enableIndexedDbPersistence 呼叫，包含錯誤處理

**步驟 1.3 - 建立監聽管理器**
- 新建 `js/core/ListenerManager.js`
- 實作 register, unregister, unregisterAll, getStatus 方法

**步驟 1.4 - 建立網路狀態監控器**
- 新建 `js/core/NetworkMonitor.js`
- 實作 init, handleOnline, handleOffline, showOfflineToast, hideOfflineToast 方法

**步驟 1.5 - 整合到 app.js**
- 修改 `js/app.js`，添加 import 語句
- 在 initCore() 方法中初始化 ListenerManager 和 NetworkMonitor

---

## 第二階段：Firestore 資料結構變更與餘額管理

### 開始時間：2026-01-06
### 完成時間：2026-01-06
### 狀態：✅ 已完成

### 執行項目：

#### 2.1 建立餘額管理器
- 狀態：✅ 已完成
- 檔案：`js/core/BalanceManager.js` (新建)
- 功能：處理餘額增量更新與計算
- 結果：建立 BalanceManager 類別，提供 calculateTransactionDelta, calculateBalanceStatus, calculateFullBalance 方法

#### 2.2 新增 Firebase API 餘額管理函數
- 狀態：✅ 已完成
- 檔案：`js/firebase-config.js`
- 功能：提供餘額管理 API
- 結果：新增 incrementNotebookBalance, initializeNotebookBalance, onNotebookBalanceChange 三個函數

#### 2.3 建立餘額初始化工具
- 狀態：✅ 已完成
- 檔案：`js/utils/BalanceInitializer.js` (新建)
- 功能：為舊帳本初始化 balance 欄位
- 結果：建立 BalanceInitializer 類別，提供 checkAndInitialize, initializeAll 方法

#### 2.4 整合到 DataManager
- 狀態：✅ 已完成
- 檔案：`js/data.js`
- 功能：整合餘額管理器到資料管理系統
- 結果：
  - 添加 import 語句
  - 在 constructor 中初始化 balanceManager 和 balanceInitializer
  - 在 init() 方法中添加餘額檢查與初始化
  - 修改 createDefaultNotebook() 方法，新建帳本時初始化餘額為 0

---

## 執行記錄（續）

### 2026-01-06

**步驟 2.1 - 建立餘額管理器**
- 新建 `js/core/BalanceManager.js`
- 實作 calculateTransactionDelta 計算單筆交易對餘額的影響
- 實作 calculateBalanceStatus 從餘額資料計算結算狀態
- 實作 calculateFullBalance 從所有交易重算餘額

**步驟 2.2 - 新增 Firebase API 餘額管理函數**
- 修改 `js/firebase-config.js`，添加三個餘額管理函數
- incrementNotebookBalance: 使用 Firestore Transaction 確保並發安全
- initializeNotebookBalance: 初始化帳本餘額
- onNotebookBalanceChange: 監聽帳本餘額變更
- 將三個函數導出到 window.FirebaseAPI

**步驟 2.3 - 建立餘額初始化工具**
- 新建 `js/utils/BalanceInitializer.js`
- 實作 checkAndInitialize 檢查並初始化單個帳本
- 實作 initializeAll 批次初始化所有帳本

**步驟 2.4 - 整合到 DataManager**
- 修改 `js/data.js`，添加 import 語句
- 在 constructor 中初始化 balanceManager 和 balanceInitializer
- 在 init() 方法中添加餘額檢查（步驟 2）
- 修改 createDefaultNotebook() 方法，新建帳本時初始化餘額

---

## 第三階段：即時監聽與分批載入 - 交易

### 開始時間：2026-01-06
### 完成時間：2026-01-06
### 狀態：✅ 已完成

### 執行項目：

#### 3.1 新增 Firebase API 交易監聽函數
- 狀態：✅ 已完成
- 檔案：`js/firebase-config.js`
- 功能：提供即時監聽最近交易和批次載入更早交易的 API
- 結果：
  - 新增 `onRecentTransactionsChange(notebookId, sinceDate, callback)` - 監聽最近 3 個月交易
  - 新增 `getEarlierTransactions(notebookId, beforeDate, limitCount)` - 批次載入更早交易
  - 導出到 `window.FirebaseAPI`

#### 3.2 修改 DataManager 啟動交易監聽
- 狀態：✅ 已完成
- 檔案：`js/data.js`
- 功能：改用即時監聽模式，支援餘額增量更新
- 結果：
  - 新增 `listeningStartDate` 和 `_debounceTimer` 屬性
  - 實作 `startListeningTransactions()` - 啟動交易監聽
  - 實作 `handleTransactionsChange(transactions, changes)` - 處理變更（含 300ms 防抖）
  - 實作 `stopListeningTransactions()` - 停止監聽
  - 實作 `loadEarlierTransactions(limitCount)` - 載入更早交易
  - 修改 `addTransaction()` - 整合餘額增量更新
  - 修改 `deleteTransaction()` - 整合餘額反向更新
  - 修改 `updateTransaction()` - 整合餘額差異更新
  - 修改 `switchNotebook()` - 重啟監聽器
  - 修改 `init()` - 啟動監聽取代手動載入

#### 3.3 修改 TimelineView 訂閱交易變更
- 狀態：✅ 已完成
- 檔案：`js/components/TimelineView.js`
- 功能：訂閱 StateManager 的交易變更事件
- 結果：
  - 在 constructor 中訂閱 'transactions' 事件
  - 新增 `handleTransactionsUpdate(data)` - 處理訂閱更新
  - 修改 `init()` - 改為被動等待訂閱推送
  - 修改 `loadMore()` - 呼叫 DataManager.loadEarlierTransactions()
  - 修改 `refresh()` - 標記為不再需要（保留相容性）

#### 3.4 修改 HomePage
- 狀態：✅ 已完成
- 檔案：`js/pages/HomePage.js`
- 功能：適配訂閱模式
- 結果：
  - 修改 `update()` - 標記為不再需要（保留相容性）
  - 修改 `init()` - 僅初始化 timelineView

---

## 第四階段：即時監聽與分批載入 - 帳本與餘額

### 開始時間：2026-01-06
### 完成時間：2026-01-06
### 狀態：✅ 已完成

### 執行項目：

#### 4.1 新增 Firebase API 帳本監聽函數
- 狀態：✅ 已完成
- 檔案：`js/firebase-config.js`
- 功能：提供即時監聽帳本列表的 API
- 結果：
  - 新增 `onNotebooksChange(coupleId, callback)` - 監聽帳本列表變更
  - 導出到 `window.FirebaseAPI`

#### 4.2 修改 DataManager 監聽帳本和餘額
- 狀態：✅ 已完成
- 檔案：`js/data.js`
- 功能：啟動帳本和餘額的即時監聽
- 結果：
  - 實作 `startListeningNotebooks()` - 啟動帳本監聽
  - 實作 `handleNotebooksChange(notebooks)` - 處理帳本變更
  - 實作 `stopListeningNotebooks()` - 停止帳本監聽
  - 實作 `startListeningNotebookBalance()` - 啟動餘額監聽
  - 實作 `handleBalanceChange(balance)` - 處理餘額變更
  - 實作 `stopListeningBalance()` - 停止餘額監聽
  - 實作 `cleanup()` - 登出時清理所有監聽器和資料

#### 4.3 修改 BalanceCard 訂閱餘額變更
- 狀態：✅ 已完成
- 檔案：`js/components/BalanceCard.js`
- 功能：訂閱 StateManager 的餘額變更事件
- 結果：
  - 修改 constructor 接收 `state` 參數
  - 在 constructor 中訂閱 'balance' 事件
  - 新增 `handleBalanceUpdate(balance)` - 處理訂閱更新
  - 修改 `update()` - 標記為不再需要（保留相容性）

#### 4.4 修改 app.js 傳入 state 到 BalanceCard
- 狀態：✅ 已完成
- 檔案：`js/app.js`
- 功能：將 StateManager 傳入 BalanceCard
- 結果：
  - 修改 BalanceCard 實例化，傳入 `this.state`

#### 4.5 修改 NotebooksPage 訂閱帳本列表
- 狀態：✅ 已完成
- 檔案：`js/pages/NotebooksPage.js` 和 `js/app.js`
- 功能：訂閱 StateManager 的帳本列表變更事件
- 結果：
  - 修改 constructor 接收 `state` 參數
  - 在 constructor 中訂閱 'notebooks' 事件
  - 新增 `handleNotebooksUpdate(notebooks)` - 處理訂閱更新
  - 新增 `renderNotebooks(notebooks)` - 渲染帳本列表
  - 修改 `update()` - 標記為不再需要（保留相容性）
  - 修改 `addNewNotebook()` - 移除手動更新呼叫
  - 修改 app.js NotebooksPage 實例化，傳入 `this.state`
  - 修改 app.js 切換帳本回調，移除手動更新呼叫

#### 4.6 修改 app.js 登出時清理
- 狀態：✅ 已完成
- 檔案：`js/app.js`
- 功能：登出時清理所有監聽器
- 結果：
  - 在登出回調中添加 `DataManager.cleanup()` 呼叫
  - 在登出回調中添加 `listenerManager.unregisterAll()` 呼叫

---

## 執行記錄（續）

### 2026-01-06

**步驟 3.1 - 新增 Firebase API 交易監聽函數**
- 修改 `js/firebase-config.js`，新增兩個函數
- onRecentTransactionsChange: 使用 onSnapshot 監聽最近 3 個月交易，返回 transactions 和 changes
- getEarlierTransactions: 批次載入更早的交易，支援自訂筆數（預設 30 筆）
- 將兩個函數導出到 window.FirebaseAPI

**步驟 3.2 - 修改 DataManager 啟動交易監聽**
- 修改 `js/data.js`，新增 listeningStartDate 和 _debounceTimer 屬性
- 實作 startListeningTransactions，使用 ListenerManager 註冊監聽器
- 實作 handleTransactionsChange，含 300ms 防抖機制
- 修改 addTransaction/deleteTransaction/updateTransaction，整合餘額增量更新
- 修改 switchNotebook，重啟監聽器
- 修改 init，啟動監聽取代手動載入

**步驟 3.3 - 修改 TimelineView 訂閱交易變更**
- 修改 `js/components/TimelineView.js`
- 在 constructor 中訂閱 'transactions' 事件
- 實作 handleTransactionsUpdate，處理訂閱資料並判斷是否顯示載入更多按鈕
- 修改 init, loadMore, refresh 方法適配訂閱模式

**步驟 3.4 - 修改 HomePage**
- 修改 `js/pages/HomePage.js`
- 修改 update 和 init 方法，移除手動更新邏輯

**步驟 4.1 - 新增 Firebase API 帳本監聽函數**
- 修改 `js/firebase-config.js`，新增 onNotebooksChange 函數
- 使用 onSnapshot 監聽帳本列表變更
- 將函數導出到 window.FirebaseAPI

**步驟 4.2 - 修改 DataManager 監聽帳本和餘額**
- 修改 `js/data.js`
- 實作 startListeningNotebooks, handleNotebooksChange, stopListeningNotebooks
- 實作 startListeningNotebookBalance, handleBalanceChange, stopListeningBalance
- 實作 cleanup 方法，清理所有監聽器和資料

**步驟 4.3 - 修改 BalanceCard 訂閱餘額變更**
- 修改 `js/components/BalanceCard.js`
- 修改 constructor 接收 state 參數並訂閱 'balance' 事件
- 實作 handleBalanceUpdate 處理訂閱更新

**步驟 4.4 - 修改 app.js 傳入 state 到 BalanceCard**
- 修改 `js/app.js`
- 修改 BalanceCard 實例化，傳入 this.state

**步驟 4.5 - 修改 NotebooksPage 訂閱帳本列表**
- 修改 `js/pages/NotebooksPage.js`
- 修改 constructor 接收 state 參數並訂閱 'notebooks' 事件
- 實作 handleNotebooksUpdate 和 renderNotebooks
- 修改 `js/app.js`，傳入 state 到 NotebooksPage

**步驟 4.6 - 修改 app.js 登出時清理**
- 修改 `js/app.js` 登出回調
- 添加 DataManager.cleanup() 和 listenerManager.unregisterAll() 呼叫


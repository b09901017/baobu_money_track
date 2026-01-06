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


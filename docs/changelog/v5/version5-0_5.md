
## [5.5.0] - 2026-01-07

### ✨ 通知中心大升級

**優化通知體驗，讓變更資訊更清晰好懂！**

#### 功能亮點

1. **更小更可愛的未讀紅點** 🔴
   - 縮小紅點尺寸（不再蓋住可愛的鈴鐺圖標）
   - 優化位置（右上角小巧精緻）
   - 全部已讀時自動隱藏
   - 溫和的脈動動畫（不再跳動）

2. **智能簡述** - 一眼看懂變更內容 👀
   - **金額變更**：直接顯示「$100 → $200」💰
   - **名稱變更**：顯示「舊名稱 → 新名稱」📝
   - **類別變更**：簡潔顯示「改了類別」✏️
   - **備註變更**：顯示「改了備註」📋
   - **照片變更**：區分「新增照片」/「刪除照片」/「更換照片」📷
   - **付款人變更**：顯示「改了付款人」💳
   - **多項變更**：自動整合「改了金額 $100 → $200 + 類別+備註」🎯

3. **詳情彈窗** - 點擊查看完整變更 📖
   - 點擊任何通知項目打開詳情面板
   - 顯示操作類型（補記/修改/刪除）
   - 顯示交易基本資訊（項目、金額）
   - **變更前後對比**：清楚列出每個欄位的修改內容
   - 未讀通知可直接在詳情面板標記為已讀

4. **分頁載入** - 提升載入效能 ⚡
   - 初始載入 6 個通知
   - 新增「載入更多通知 ✨」按鈕
   - 每次加載 6 個（流暢不卡頓）
   - 載入完畢後自動隱藏按鈕

#### 技術實現

1. **NotificationPanel.js** 重構（+208 行）
   - 新增 `generateUpdateSummary()` - 智能簡述生成器
   - 新增 `generateDetailedMessage()` - 詳細變更生成器
   - 新增 `showDetail()` - 詳情彈窗顯示
   - 新增 `closeDetail()` - 詳情彈窗關閉
   - 新增 `markAsReadAndCloseDetail()` - 標記已讀並關閉
   - 新增 `loadMore()` - 分頁載入
   - 重構 `render()` - 支援分頁與點擊事件

2. **CSS 優化** (notifications.css +29 行)
   - 優化紅點徽章樣式（更小、位置調整）
   - 新增載入更多按鈕樣式（虛線邊框、hover 效果）
   - 新增詳情彈窗相關樣式

3. **HTML 結構** (index.html +33 行)
   - 新增通知詳情彈窗元素
   - 新增載入更多按鈕容器

4. **App 集成** (app.js +3 行)
   - 將 NotificationPanel 實例掛載到 window（供詳情彈窗使用）

#### 修改檔案

- `js/components/NotificationPanel.js`（+208 行）
- `css/components/notifications.css`（+29 行）
- `index.html`（+33 行）
- `js/app.js`（+3 行）

### 🎨 設計特色

- **清晰易懂**：智能簡述讓變更一目了然
- **細節完整**：點擊查看完整變更對比
- **性能優化**：分頁載入提升流暢度
- **視覺友善**：更小的紅點不再擋住可愛圖標

---

## [5.4.0] - 2026-01-07

### ✨ 新功能

**活動記錄 & 變更通知系統（解決「偷偷修改」信任問題）**

#### 功能亮點

1. **智能通知規則** - 只在重要變更時才通知，避免過度打擾
   - ✅ **不通知**：新增「今天」或「昨天」的交易（視為日常記帳）
   - 🔔 **通知**：新增「3 天以前」的交易（補記舊帳）
   - 🔔 **通知**：任何「修改」或「刪除」操作（影響餘額）

2. **可愛的通知文案** - 增加情侶間的互動趣味
   - 補記：「步步偷偷補記了上週的『晚餐』🍽️」
   - 修改：「寶寶修改了昨天的『飲料』，金額變了喔 💸」
   - 刪除：「步步把『電影票』這筆帳擦掉了 ✏️」

3. **不打擾的通知中心** - 右上角鈴鐺按鈕
   - 未讀數量徽章（紅色小圓點，帶彈跳動畫）
   - 側滑面板顯示活動列表
   - 點擊單個通知標記為已讀
   - 一鍵「全部標記為已讀」

4. **童話風格設計** - 符合 App 整體美學
   - 馬卡龍色系面板
   - 圓潤可愛的通知卡片
   - 寶寶/步步頭像標記
   - 平滑滑入/滑出動畫

#### 技術實現

1. **Firestore 資料結構** (`couples/{coupleId}/activities/{activityId}`)
   - `type`: 活動類型（'create' | 'update' | 'delete'）
   - `actor`: 操作者（'baobao' | 'bubu'）
   - `timestamp`: 操作時間
   - `transaction`: 交易摘要資訊
   - `changes`: 變更內容（僅 update 時有）
   - `isRead`: 雙方已讀狀態

2. **Firebase API** (firebase-config.js +169 行)
   - `addActivity()`: 新增活動記錄（自動判斷是否需要通知）
   - `checkIfShouldNotify()`: 智能通知邏輯
   - `onActivitiesChange()`: 監聽活動記錄（近 30 天）
   - `markActivityAsRead()`: 標記單個已讀
   - `markAllActivitiesAsRead()`: 批量標記已讀

3. **DataManager 集成** (data.js +118 行)
   - `addTransaction()`: 新增交易後記錄活動
   - `updateTransaction()`: 修改交易後記錄活動（含變更內容）
   - `deleteTransaction()`: 刪除交易後記錄活動
   - `startListeningActivities()`: 啟動活動監聽
   - `handleActivitiesChange()`: 計算未讀數量並通知訂閱者

4. **UI 組件** (NotificationPanel.js 新檔案 315 行)
   - 可愛的通知訊息生成器
   - 時間格式化（「剛剛」、「5 分鐘前」、「3 天前」）
   - 日期格式化（「今天」、「昨天」、「12/25」）
   - 未讀/已讀狀態視覺區分
   - 空狀態友善提示

5. **樣式系統** (notifications.css 新檔案 257 行)
   - 側滑面板動畫（transform translateX）
   - 未讀通知發光效果 + 左側粉色邊條
   - 頭像馬卡龍漸層背景
   - 徽章彈跳動畫
   - 響應式設計（手機/桌面）

#### 修改檔案

- `js/firebase-config.js`（+169 行）
- `js/data.js`（+118 行）
- `js/components/NotificationPanel.js`（新檔案，315 行）
- `css/components/notifications.css`（新檔案，257 行）
- `index.html`（+30 行）
- `js/app.js`（+13 行）
- `css/main.css`（+1 行）

### 🎨 設計特色

- **情侶友善**：文案溫馨可愛，不像銀行 App 嚴肅
- **不打擾**：只在重要時刻通知，避免過度干擾
- **透明化**：所有變更一目了然，建立信任
- **互動性**：增加情侶間的互動樂趣

---

## [5.3.0] - 2026-01-07

### ✨ UI/UX 優化

**重構類別選擇按鈕為馬卡龍/手帳貼紙風格**

#### 設計改進

1. **視覺風格升級**
   - ✅ 從生硬的幾何圖形改造為柔和的馬卡龍形狀
   - ✅ 採用不規則圓潤邊緣（`border-radius: 45% 55% 52% 48% / 48% 45% 55% 52%`）
   - ✅ 新增立體貼紙感：白色邊框 + 多層陰影 + 內高光
   - ✅ 更符合 App 的「童話軟萌」整體風格

2. **互動動效**
   - ✅ **Hover 效果**：貼紙輕微浮起（translateY -3px）+ 微旋轉 1° + 陰影加深
   - ✅ **點擊效果**：輕微下壓縮放（scale 0.95）
   - ✅ **果冻彈跳動畫**（jellyBounce）：選中時觸發 7 段式 Q 彈變形效果（0.6秒）
   - ✅ **打勾標記**：選中時右上角圓形 ✓ 彈出（checkmark 動畫）
   - ✅ **發光效果**：選中時粉色光暈（4 層漸變 box-shadow）

3. **新增動畫**（css/animations/animations.css）
   - ✅ `@keyframes jellyBounce`：果凍彈跳動畫（7段變形，模擬 Q 彈效果）
   - ✅ `@keyframes stickerPop`：貼紙飄入動畫（縮放 + 旋轉）
   - ✅ `@keyframes checkmark`：打勾標記彈出動畫

#### 技術改進

1. **CSS 重構**（css/components/forms.css）
   - ✅ 完全重寫 `.tag-btn` 樣式系統
   - ✅ 新增 `.tag-btn > div` 貼紙容器樣式
   - ✅ 新增 `.active` 狀態樣式（替代原有的多個 Tailwind 類）
   - ✅ 新增打勾標記偽元素（`::after`）

2. **JavaScript 簡化**（js/components/TransactionForm.js）
   - ✅ `toggleCategory()`：移除冗長的 Tailwind 類操作，改用單一 `.active` 類
   - ✅ `reset()`：簡化重置邏輯
   - ✅ `fillFormWithTransaction()`：簡化編輯模式填充邏輯
   - ✅ `renderCustomCategories()`：簡化動態生成的 HTML 結構
   - ✅ 新增動畫重新觸發機制（確保每次點擊都有果凍效果）

3. **HTML 精簡**（index.html）
   - ✅ 類別按鈕從 20+ 個 Tailwind 類精簡到 3-4 個
   - ✅ 保留每個類別的獨特漸變顏色
   - ✅ 移除冗餘的 hover/active 類（由 CSS 接管）

#### 視覺效果對比

**改造前：**
- ❌ 椭圓形背景 + 方形 icon，幾何感重
- ❌ 平面設計，缺乏立體感
- ❌ 選中狀態只是變色和放大

**改造後：**
- ✅ 不規則圓潤馬卡龍形狀
- ✅ 立體貼紙感（白邊 + 多層陰影 + 內高光）
- ✅ Q 彈果凍動畫 + 發光效果 + 打勾標記
- ✅ 豐富的微互動（浮起、旋轉、下壓）

### 🔧 技術細節

**修改檔案：**
- `css/animations/animations.css`（新增 3 個動畫）
- `css/components/forms.css`（完全重寫類別按鈕樣式）
- `js/components/TransactionForm.js`（簡化選中狀態邏輯）
- `index.html`（精簡 HTML 結構）

**代碼優化：**
- 減少 HTML 中的行內類名數量（提升可維護性）
- 統一使用 CSS 管理樣式（符合關注點分離原則）
- JavaScript 邏輯更清晰（單一 `.active` 類替代多個類名）

---

## [5.2.0] - 2026-01-07

### 🐛 Bug 修復

**修復帳本列表渲染錯誤與統計資料問題**

#### 問題描述
1. **Bug 1 - 渲染錯誤**: 列表中的「第一個帳本」錯誤地顯示了「當前被選中帳本」的餘額狀態
   - **原因**: `NotebooksPage.js:74` 使用 `calculateBalance()` 計算「當前選中帳本」的餘額，而不是第一個帳本的餘額

2. **Bug 2 - 狀態錯誤**: 沒被選中的帳本都會顯示「已結清」或是剛選中帳本的欠款
   - **原因**: `DataManager` 只載入「當前選中帳本」的交易，未選中的帳本沒有交易資料，前端即時計算時餘額變成 0

#### 修復內容

1. **新增帳本統計欄位**
   - ✅ 在每個帳本新增 `stats` 欄位（`baobao_paid`, `bubu_paid`, `total_expense`, `transaction_count`）
   - ✅ 新增 `type` 欄位（`'daily'` | `'trip'`）區分帳本類型
   - ✅ 統計資料直接儲存在帳本中，避免前端即時計算

2. **Firebase API 擴充** (firebase-config.js)
   - ✅ `addNotebook()`: 新增帳本時自動初始化 `stats` 和 `type`
   - ✅ `incrementNotebookStats()`: 增量更新統計（使用 Transaction 確保並發安全）
   - ✅ `initializeNotebookStats()`: 初始化帳本統計

3. **DataManager 同步更新** (data.js)
   - ✅ `addTransaction()`: 新增交易時同步更新統計
   - ✅ `updateTransaction()`: 更新交易時調整統計差異
   - ✅ `deleteTransaction()`: 刪除交易時回退統計
   - ✅ 初始化時自動為現有帳本補充統計資料

4. **NotebooksPage 顯示邏輯重構** (NotebooksPage.js:56-103)
   - ✅ 改用帳本的 `balance` 欄位而不是 `calculateBalance()`（修復 Bug 1）
   - ✅ 改用帳本的 `stats` 欄位而不是即時計算（修復 Bug 2）
   - ✅ **日常帳本** (`type === 'daily'`): 固定顯示欠款資訊
   - ✅ **旅遊帳本** (`type === 'trip'`): 顯示總花費和各自支出

5. **初始化工具** (新檔案：NotebookStatsInitializer.js)
   - ✅ 自動為現有帳本補充統計資料
   - ✅ 支援批量初始化和單個帳本重算
   - ✅ 整合到 DataManager 初始化流程

6. **開發者工具擴充** (DevTools.js)
   - ✅ `DevTools.recalculateStats()`: 重算當前帳本統計
   - ✅ `DevTools.recalculateAllStats()`: 重算所有帳本統計

### ✨ 新功能

- **帳本類型區分**: 支援「日常帳本」與「旅遊/時期性帳本」不同的顯示方式
- **統計資料持久化**: 統計資訊直接儲存在 Firestore，提升效能並避免即時計算錯誤

### 🔧 技術改進

- 使用 Firestore Transaction 確保統計更新的並發安全
- 減少前端計算負擔，提升帳本列表渲染效能
- 改善資料一致性，避免因快取不完整導致的顯示錯誤

---

## [5.1.1] - 2026-01-06

### 🐛 Bug 修復

**修復巢狀結構重構後的資料顯示問題**

#### 問題描述
在 v5.0.0 重構為巢狀 Firestore 結構後（`couples/{coupleId}/notebooks/{notebookId}/transactions/{transactionId}`），從 Firebase 返回的交易不再包含 `notebook_id` 欄位（因為已在路徑中），但程式碼多處仍依賴此欄位進行篩選，導致：
- ❌ 帳本頁面的小帳本封面無法顯示統計金額
- ❌ 分析頁面完全無法顯示資料和圖表

#### 修復內容

1. **BalanceInitializer 路徑修正**
   - ✅ 修復 `checkAndInitialize()` 使用舊的根集合路徑導致權限錯誤
   - ✅ 改用巢狀路徑：`couples/{coupleId}/notebooks/{notebookId}`
   - ✅ 新增 `coupleId` 參數傳遞到所有相關方法
   - **錯誤訊息**：`FirebaseError: Missing or insufficient permissions`
   - **影響範圍**：無法初始化帳本餘額

2. **DataManager 自動補充 notebook_id**
   - ✅ 在所有從 Firebase 獲取交易的地方自動添加 `notebook_id` 欄位
   - ✅ 修正 `handleTransactionsChange()` - 即時監聽時添加
   - ✅ 修正 `loadTransactions()` - 手動載入時添加
   - ✅ 修正 `getTransactionsByDateRange()` - 日期範圍查詢時添加
   - ✅ 修正 `loadEarlierTransactions()` - 分批載入時添加
   - **影響範圍**：NotebooksPage、AnalyticsPage、CalendarPage 所有依賴 `notebook_id` 篩選的功能

#### 技術細節

**修改前（❌ 問題）：**
```javascript
// BalanceInitializer.js - 使用舊路徑
const notebookRef = doc(db, 'notebooks', notebookId);

// data.js - 缺少 notebook_id 欄位
this.transactions = transactions;
```

**修改後（✅ 修復）：**
```javascript
// BalanceInitializer.js - 使用巢狀路徑
const notebookRef = doc(db, 'couples', coupleId, 'notebooks', notebookId);

// data.js - 自動補充 notebook_id
this.transactions = transactions.map(tx => ({
    ...tx,
    notebook_id: this.currentNotebook
}));
```

#### 檔案變更
- 📄 `js/utils/BalanceInitializer.js`：修正路徑為巢狀結構，新增 `coupleId` 參數
- 📄 `js/data.js`：在 4 處交易獲取點自動補充 `notebook_id` 欄位

---

## [5.1.0] - 2026-01-06

### ✨ 新功能

**編輯交易功能**
- ✅ 實作完整的交易編輯功能
  - 在交易詳情模態框新增編輯按鈕（右上角鉛筆圖示）
  - 點擊編輯按鈕可開啟編輯表單，預填所有欄位資料
  - 支援編輯所有交易欄位：金額、項目名稱、日期、付款人、受益人、分類、備註
  - 支援照片更新：上傳新照片會自動刪除舊照片
  - 編輯模式下提交按鈕顯示「💾 保存修改」
  - 成功更新後顯示「交易已更新！」提示

**檔案變更**
- 📄 `js/components/TransactionForm.js`：
  - 新增 `editingTransactionId` 和 `editingTransaction` 狀態追蹤
  - 修改 `open()` 方法支援傳入交易資料進入編輯模式
  - 新增 `fillFormWithTransaction()` 方法填充表單欄位
  - 修改 `submit()` 方法區分新增/編輯邏輯，處理照片更新
  - 修改 `reset()` 方法清除編輯狀態並重置按鈕文字

- 📄 `js/components/TransactionDetail.js`：
  - 新增 `bindEditButton()` 方法綁定編輯按鈕事件
  - 修改 `show()` 方法調用編輯按鈕綁定

### 🐛 Bug 修復

**修復「分析頁」與「帳本頁」資料顯示問題**

- ✅ 修復 NotebooksPage 帳本封面統計不更新問題
  - **問題診斷**：NotebooksPage 只訂閱了 `notebooks` 變更，沒有訂閱 `transactions` 變更，導致新增交易後帳本封面的統計金額不會即時更新
  - **修復方案**：在 constructor 中新增訂閱 `transactions` 變更事件，當交易變更時重新渲染帳本列表更新封面統計

- ✅ 改善 AnalyticsPage 使用者體驗
  - **問題診斷**：AnalyticsPage 已正確訂閱交易變更，但 UI 預設顯示空狀態，可能讓用戶誤以為資料沒載入
  - **改善方案**：在空狀態提示中顯示已載入的交易總數（例如：「共 15 筆交易」），讓用戶清楚知道資料已成功載入

**檔案變更**
- 📄 `js/pages/NotebooksPage.js`：新增訂閱 `transactions` 變更事件
- 📄 `js/pages/AnalyticsPage.js`：改善 `renderEmptyTransactionList()` 顯示交易總數提示

---

## [5.0.0] - 2026-01-06

### 🚀 重大架構升級 - 階段 1：基礎架構與離線支援

#### ✨ 新功能

**離線支援與即時同步基礎設施**
- ✅ 啟用 Firebase Offline Persistence（IndexedDB）
  - 支援離線讀寫資料
  - 網路恢復後自動同步
  - 處理多標籤頁開啟情況
  - 相容性檢查（瀏覽器是否支援 IndexedDB）

- ✅ 新增 `ListenerManager` 監聽器管理器
  - 統一管理所有 Firestore onSnapshot 監聽器
  - 提供 `register()` / `unregister()` / `unregisterAll()` 方法
  - 追蹤監聽器狀態，防止記憶體洩漏
  - 支援監聽器生命週期管理

- ✅ 新增 `NetworkMonitor` 網路狀態監控器
  - 即時偵測線上/離線狀態
  - 斷網時顯示橘色提示條：「📡 離線模式：變更將在重新連線後同步」
  - 重新連線時顯示「已重新連線 🎉」提示
  - 整合 customDialog 提示系統

#### 🔧 技術變更

**Firebase 模組擴充**
- 新增 `onSnapshot`（即時監聽）
- 新增 `startAfter`（分頁查詢）
- 新增 `enableIndexedDbPersistence`（離線持久化）
- 新增 `Timestamp`（時間戳處理）
- 新增 `runTransaction`（交易保證，並發安全）

**檔案變更**
- 📄 `index.html`：更新 Firebase 模組引入
- 📄 `js/firebase-config.js`：啟用離線持久化，更新模組解構
- 📄 `js/core/ListenerManager.js`：新建監聽器管理器
- 📄 `js/core/NetworkMonitor.js`：新建網路狀態監控器
- 📄 `js/app.js`：整合兩個新管理器到核心系統

#### 📚 後續計畫

本次包含**階段 1-2**，後續將實作：
- **階段 3**：即時監聽交易資料
- **階段 4**：即時監聽帳本列表
- **階段 5**：即時監聽餘額
- **階段 6**：分批載入優化
- **階段 7**：測試與除錯

### 🚀 階段 2：Firestore 資料結構變更與餘額管理

#### ✨ 新功能

**餘額持久化系統**
- ✅ 在 notebooks 新增 `balance` 欄位結構
  - `baobao_owed`: 寶寶被欠的錢
  - `bubu_owed`: 步步被欠的錢
  - `last_updated`: 最後更新時間
  - `version`: 版本號（樂觀鎖，避免並發衝突）

- ✅ 建立 `BalanceManager` 餘額管理器
  - `calculateTransactionDelta()`: 計算單筆交易對餘額的影響
  - `calculateBalanceStatus()`: 從餘額資料計算結算狀態
  - `calculateFullBalance()`: 從所有交易重算餘額

- ✅ 新增 Firebase API 餘額管理函數
  - `incrementNotebookBalance()`: 增量更新餘額（使用 Firestore Transaction 確保並發安全）
  - `initializeNotebookBalance()`: 初始化帳本餘額
  - `onNotebookBalanceChange()`: 監聽帳本餘額變更

- ✅ 建立 `BalanceInitializer` 餘額初始化工具
  - 自動檢查舊帳本是否有 balance 欄位
  - 自動計算並初始化舊帳本餘額
  - 批次處理所有帳本

#### 🔧 技術變更

**資料結構變更**
- notebooks 集合新增 balance 物件欄位
- 使用版本號機制處理並發更新

**DataManager 整合**
- 在 init() 時自動檢查並初始化所有帳本餘額
- 新建帳本時自動初始化餘額為 0
- 使用 Firestore Transaction 確保並發更新安全（最多重試 3 次）

**檔案變更**
- 📄 `js/core/BalanceManager.js`：新建餘額管理器
- 📄 `js/firebase-config.js`：新增 3 個餘額管理 API
- 📄 `js/utils/BalanceInitializer.js`：新建餘額初始化工具
- 📄 `js/data.js`：整合餘額管理器到 DataManager

### 🚀 階段 3-4：即時監聽與分批載入 - 交易與帳本

#### ✨ 新功能

**交易即時監聽（階段 3）**
- ✅ 新增 Firebase API 交易監聽函數
  - `onRecentTransactionsChange()`: 監聽最近 3 個月交易，返回 transactions 和 changes
  - `getEarlierTransactions()`: 批次載入更早交易（預設 30 筆）
  - 完整的錯誤處理（權限、索引、網路錯誤）

- ✅ DataManager 改用即時監聽模式
  - 啟動交易監聽，預設監聽最近 3 個月
  - 使用 300ms 防抖機制處理頻繁更新
  - 支援批次載入更早交易
  - 整合餘額增量更新到 CRUD 操作
  - 切換帳本時自動重啟監聽器

- ✅ UI 組件訂閱模式改造
  - TimelineView 訂閱交易變更事件
  - HomePage 適配訂閱模式
  - 自動判斷是否顯示「載入更多」按鈕

**帳本與餘額即時監聽（階段 4）**
- ✅ 新增 Firebase API 帳本監聽函數
  - `onNotebooksChange()`: 監聽帳本列表變更
  - 自動推送新增/編輯/刪除事件

- ✅ DataManager 監聽帳本和餘額
  - 啟動帳本列表監聽
  - 啟動當前帳本餘額監聽
  - 登出時清理所有監聽器和資料

- ✅ UI 組件訂閱模式改造
  - BalanceCard 訂閱餘額變更事件
  - NotebooksPage 訂閱帳本列表變更事件
  - app.js 登出時清理所有監聽器

#### 🔧 技術變更

**資料流架構**
- 從「手動查詢」升級為「即時監聽 + 訂閱模式」
- DataManager 負責監聽 Firestore，透過 StateManager 推送變更
- UI 組件訂閱 StateManager 事件，自動響應資料變更
- 保留舊方法以維持向後相容性

**效能優化**
- 預設載入最近 3 個月交易，避免一次載入大量資料
- 使用防抖機制減少 UI 更新頻率
- 餘額計算從 O(n) 優化為 O(1)（直接讀取 Firestore balance 欄位）

**並發安全**
- 使用 Firestore Transaction 確保餘額更新並發安全
- 支援樂觀鎖（版本號）
- 最多重試 3 次，指數退避

**檔案變更（階段 3）**
- 📄 `js/firebase-config.js`：新增 2 個交易監聽 API
- 📄 `js/data.js`：改用 onSnapshot 監聽，整合餘額增量更新
- 📄 `js/components/TimelineView.js`：訂閱交易變更
- 📄 `js/pages/HomePage.js`：適配訂閱模式

**檔案變更（階段 4）**
- 📄 `js/firebase-config.js`：新增 1 個帳本監聽 API
- 📄 `js/data.js`：監聽帳本和餘額，實作 cleanup()
- 📄 `js/components/BalanceCard.js`：訂閱餘額變更
- 📄 `js/pages/NotebooksPage.js`：訂閱帳本列表變更
- 📄 `js/app.js`：傳入 state 到組件，登出時清理

### 🚀 階段 5-7：完整訂閱適配、開發者工具與文檔更新

#### ✨ 新功能

**其他頁面適配（階段 5）**
- ✅ CalendarPage 訂閱交易變更
  - 單日模式自動更新交易列表
  - 區間模式自動更新交易列表
  - 日曆標記自動更新

- ✅ AnalyticsPage 訂閱交易變更
  - 保持當前篩選條件重新計算統計
  - 儲存當前週期（month/week/all）
  - 自動更新圓餅圖/長條圖

- ✅ 優化日期範圍查詢
  - 檢查是否在監聽範圍內（近 3 個月）
  - 範圍內優先使用本地快取（已由 onSnapshot 自動更新）
  - 範圍外從 Firebase 查詢
  - 新增 `getTransactionsByDate()` 方法（使用本地快取）

- ✅ 建立 Firestore 索引需求文檔
  - `FIRESTORE_INDEXES.md` 說明必要索引
  - 提供自動建立和手動建立方式
  - 列出 3 個必要複合索引

**開發者工具與除錯（階段 6）**
- ✅ 建立 `BalanceRepairTool` 餘額修復工具
  - `checkBalance()`: 檢查帳本餘額是否正確
  - `repairBalance()`: 修復單個帳本餘額
  - `repairAllBalances()`: 檢查並修復所有帳本
  - 掛載到全域供 Console 使用

- ✅ 建立 `DevTools` 開發者工具
  - 監聽器管理：`showListenerStatus()` / `unregisterAllListeners()`
  - 快取管理：`showCacheStats()` / `clearLocalCache()`
  - 餘額管理：`checkBalance()` / `repairBalance()` / `repairAllBalances()`
  - 連線檢查：`checkFirebaseConnection()` / `showNetworkStatus()`
  - 日誌匯出：`exportLogs()`
  - 掛載到全域，輸入 `DevTools.help()` 查看指令

- ✅ 整合到 app.js
  - 開發環境自動載入開發者工具
  - 檢測 localhost 或 127.0.0.1

**文檔更新（階段 7）**
- ✅ 建立 `FIRESTORE_INDEXES.md`
- ✅ 更新 `CHANGELOG.md`（本文件）
- ✅ 更新 `CLAUDE.md` 標記階段 5-7 已完成
- ✅ 更新 `README.md` 新增即時同步功能說明

#### 🔧 技術變更

**檔案變更（階段 5）**
- 📄 `js/pages/CalendarPage.js`：訂閱交易變更
- 📄 `js/pages/AnalyticsPage.js`：訂閱交易變更，儲存當前週期
- 📄 `js/data.js`：優化日期範圍查詢，新增 `getTransactionsByDate()`
- 📄 `FIRESTORE_INDEXES.md`：新建索引文檔

**檔案變更（階段 6）**
- 📄 `js/utils/BalanceRepairTool.js`：新建餘額修復工具
- 📄 `js/utils/DevTools.js`：新建開發者工具
- 📄 `js/app.js`：新增 imports，開發環境載入工具

**檔案變更（階段 7）**
- 📄 `CHANGELOG.md`：更新版本記錄
- 📄 `CLAUDE.md`：標記已完成功能
- 📄 `README.md`：新增即時同步功能說明

#### ✅ 完成狀態

v5.0.0 全部 7 個階段已完成：
- ✅ **階段 1**：基礎架構準備與離線支援
- ✅ **階段 2**：餘額管理系統
- ✅ **階段 3**：交易即時監聽
- ✅ **階段 4**：帳本與餘額即時監聽
- ✅ **階段 5**：其他頁面適配與優化
- ✅ **階段 6**：錯誤處理與開發者工具
- ✅ **階段 7**：測試與部署準備

---

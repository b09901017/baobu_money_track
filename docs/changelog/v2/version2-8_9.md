## [2.9.5] - 2026-01-05

### 🐛 修復 (Fixed)

#### 📊 徹底修復分析頁面交易明細對齊問題
- ✅ **使用 inline style 強制固定寬度** - 確保左右欄位不會被壓縮
  - 左欄：`width: 70px; min-width: 70px; max-width: 70px;`
  - 右欄：`width: 70px; min-width: 70px; max-width: 70px;`
  - 中欄：`flex: 1 1 0; min-width: 0; overflow: hidden;`
  - 文字截斷：`overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
  - 即使花費名稱很長，金額也不會被推出視窗

#### 🔍 建立 Firestore 複合索引
- ✅ **新增 firestore.indexes.json** - 定義所需的複合索引
  - `notebook_id + created_at (DESC)` - 用於載入最近記錄
  - `notebook_id + date (DESC)` - 用於日期排序查詢
  - `notebook_id + date (ASC)` - 用於日期範圍查詢
- ✅ **部署索引到 Firebase** - 修復查詢錯誤
  - 解決 "The query requires an index" 錯誤
  - 提升查詢效能

### 🔧 相關檔案變更
```
Modified:
- js/pages/AnalyticsPage.js
  - renderCardListItem() - 使用 inline style 強制固定寬度

Added:
- firestore.indexes.json
  - 定義三個複合索引

Statistics:
- 2 files changed
- 1 file added
- 48 insertions(+)
- 19 deletions(-)
```

### 🚀 部署 (Deployment)
- ✅ 部署 Firestore 索引
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

---

## [2.9.4] - 2026-01-05

### 🐛 修復 (Fixed)

#### 📊 分析頁面交易明細對齊優化
- ✅ **修正左中右三欄式布局** - 確保內容不會擠壓
  - 左欄：固定寬度 70px，顯示「誰幫誰付」（4個字）
  - 中欄：彈性區域，內容置中對齊，過長自動截斷
  - 右欄：固定寬度 70px，金額右對齊
  - 使用 `items-center` 確保垂直置中
  - 使用 `justify-center` 和 `text-center` 確保內容置中
  - 使用 `shrink-0` 防止固定欄位被壓縮

### 🔄 變更 (Changed)

#### 📜 時間軸載入邏輯優化
- ✅ **改為載入最近 N 筆記錄** - 而非最近 N 天
  - 初始載入最近 30 筆記錄
  - 點擊「載入更多」每次增加 30 筆
  - 按建立時間（`created_at`）排序，而非交易日期（`date`）
  - 更符合用戶查看最新記錄的需求

- **新增 API 方法**
  - `FirebaseAPI.getRecentTransactions(notebookId, limit)` - 從 Firestore 載入最近 N 筆記錄
  - `DataManager.getRecentTransactions(limit)` - 包裝方法，支援 fallback

- **修改 TimelineView.js**
  - 改為使用 `transactionsLoaded` 追蹤已載入筆數（取代 `daysLoaded`）
  - 更新 `loadTransactions()` 使用新的 API
  - 更新 `loadMore()` 和 `refresh()` 方法

#### 📚 帳本頁面統一設計
- ✅ **所有帳本統一大小** - 移除第一個帳本特殊樣式
  - 移除第一個帳本的 `col-span-2` 樣式
  - 統一所有帳本標題為 `text-xl` 大小
  - 所有帳本現在都是相同大小和佈局
  - 視覺更一致，使用者體驗更統一

### ✨ 改善 (Improved)

#### 使用者體驗
- 📊 **分析頁面明細更清晰** - 三欄式布局不會擠壓，內容置中易讀
- 📜 **時間軸載入更快速** - 載入固定筆數比載入固定天數更可預測
- 📚 **帳本頁面更整齊** - 所有帳本統一大小，視覺更平衡

### 🔧 相關檔案變更
```
Modified:
- js/pages/AnalyticsPage.js
  - renderCardListItem() - 修正三欄式布局對齊問題

- js/firebase-config.js
  - 新增 getRecentTransactions() 方法
  - 按 created_at 排序，支援 limit 參數

- js/data.js
  - 新增 getRecentTransactions() 包裝方法
  - 支援 fallback 到快取資料

- js/components/TimelineView.js
  - 改為追蹤 transactionsLoaded（筆數）而非 daysLoaded（天數）
  - 使用 getRecentTransactions() 載入記錄
  - 更新所有相關方法

- js/pages/NotebooksPage.js
  - 移除第一個帳本的 col-span-2 樣式
  - 統一所有帳本標題大小

Statistics:
- 5 files changed
- 89 insertions(+)
- 47 deletions(-)
```

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

---

## [2.8.0] - 2026-01-05

### ✨ 新增 (Added)

#### 🎯 多重篩選系統 - 付款人 + 分類組合
- ✅ **統計模式切換** - 三種視角查看分類統計
  - 總花費模式：顯示所有人的支出統計
  - 寶寶模式：只顯示寶寶支出的分類統計
  - 步步模式：只顯示步步支出的分類統計
  - 粉紅色漸層按鈕組（Pill 風格）
  - 選中狀態：漸層背景 + 白色文字
  - 未選中狀態：淡色文字 + 透明背景

- ✅ **組合篩選功能** - 靈活的多重篩選
  - 先選統計模式（總花費/寶寶/步步）
  - 再點擊分類（交通/吃吃/玩樂等）
  - 顯示組合結果（如：「寶寶 · 交通」、「步步 · 吃吃」）
  - 篩選標籤顯示當前篩選狀態
  - 智能清除按鈕（篩選時顯示）

- ✅ **分類統計智能過濾**
  - 統計模式會影響分類統計的計算
  - 選「寶寶」模式 → 分類統計只計算寶寶的支出
  - 選「步步」模式 → 分類統計只計算步步的支出
  - 選「總花費」模式 → 分類統計計算所有人的支出
  - 確保分類統計與交易明細一致

### 🐛 修復 (Fixed)

#### 💰 金額顯示佈局修復
- ✅ **固定金額位置** - 解決金額被擠出問題
  - 金額固定在每個交易項目的最右側
  - 使用 `min-width: 60px` 和 `text-align: right` 確保金額不被壓縮
  - 名稱區域使用 `flex-1 min-w-0 overflow-hidden`
  - 名稱過長時自動截斷（`truncate`）
  - 付款方式標籤固定寬度 64px（`寶幫寶付` 等）
  - 三欄式布局：付款方式 | 名稱（可截斷）| 金額（固定）

### ✨ 改善 (Improved)

#### 💡 使用者體驗優化
- ✅ **交易明細初始為空** - 更清晰的引導設計
  - 初次進入分析頁面：交易明細區塊顯示空狀態
  - 顯示 📊 圖標 + 「點擊上方分類查看明細」提示
  - 點擊分類後才顯示對應的交易列表
  - 避免初始載入時資訊過載
  - 引導用戶正確使用篩選功能

- ✅ **視覺設計改善**
  - 統計模式按鈕組：米黃色背景容器（rounded-full）
  - 選中按鈕：粉紅色漸層 + 白色陰影
  - 按鈕間距與內距統一（gap-2, py-1.5）
  - 與現有童話風格完美融合

### 🔄 變更 (Changed)

#### AnalyticsPage.js 架構優化
- **新增屬性**
  - `statMode` - 統計模式狀態（'all' | 'me' | 'partner'）
  - 重構 `currentFilter` 結構：
    ```javascript
    // 舊結構（單一篩選）
    { type: 'category', value: '交通' }

    // 新結構（多重篩選）
    { payer: 'me', category: '交通' }
    ```

- **新增方法**
  - `updateCategoryStats()` - 根據統計模式計算分類統計
    - 先按 statMode 過濾交易
    - 再計算分類統計
    - 重新渲染分類統計區塊

  - `toggleStatMode(mode)` - 切換統計模式
    - 更新按鈕樣式（漸層背景切換）
    - 重新計算分類統計
    - 保留現有分類篩選（若有）
    - 重新應用組合篩選

  - `applyCurrentFilter()` - 應用組合篩選
    - 同時考慮 statMode 和 category
    - 先按 statMode 過濾（me/partner/all）
    - 再按 category 過濾（若有選擇）
    - 生成組合標籤（如：「寶寶 · 交通」）
    - 渲染篩選後的交易列表

  - `renderEmptyTransactionList()` - 渲染空狀態
    - 顯示 📊 圖標（text-6xl）
    - 顯示提示文字（text-warm-brown/60）
    - 引導用戶點擊分類

- **修改方法**
  - `filterByCategory(category)` - 整合統計模式
    - 更新 `currentFilter.category`
    - 呼叫 `applyCurrentFilter()` 應用組合篩選

  - `update()` - 初始化改用空狀態
    - 儲存 `allTransactions`
    - 呼叫 `renderEmptyTransactionList()` 而非顯示所有交易

  - `renderCardListItem(tx)` - 修復佈局
    - 付款方式：固定寬度 64px（`style="width: 64px;"`）
    - 名稱區域：`flex-1 min-w-0 overflow-hidden`
    - 金額：固定右對齊（`style="min-width: 60px; text-align: right;"`）
    - 使用 inline styles 確保優先級

#### EventBinder.js 擴展
- **新增事件綁定**
  - 統計模式按鈕（`.stat-mode-btn`）
    - 監聽 `data-mode` 屬性（all/me/partner）
    - 呼叫 `toggleStatMode(mode)` 切換模式

#### index.html 結構更新
- **新增統計模式切換按鈕組**
  ```html
  <div class="flex gap-2 mb-4 p-1 bg-macaron-cream/30 rounded-full">
    <button class="stat-mode-btn ... bg-gradient-to-br from-macaron-pink to-macaron-rose text-white" data-mode="all">總花費</button>
    <button class="stat-mode-btn ... text-soft-ink" data-mode="me">寶寶</button>
    <button class="stat-mode-btn ... text-soft-ink" data-mode="partner">步步</button>
  </div>
  ```
  - 位於分類統計區塊頂部
  - 預設選中「總花費」模式
  - 童話風格 Pill 按鈕組

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.7.0 → v2.8.0
- 更新分析頁面功能說明
  - 新增多重篩選系統說明
  - 新增統計模式切換說明

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### 🔧 相關檔案變更
```
Modified:
- index.html
  - 新增統計模式切換按鈕組

- js/pages/AnalyticsPage.js
  - 新增 statMode 屬性
  - 重構 currentFilter 結構
  - 新增 updateCategoryStats() 方法
  - 新增 toggleStatMode() 方法
  - 新增 applyCurrentFilter() 方法
  - 新增 renderEmptyTransactionList() 方法
  - 修改 filterByCategory() 方法
  - 修改 update() 方法
  - 修復 renderCardListItem() 佈局

- js/core/EventBinder.js
  - 新增統計模式按鈕事件綁定

Statistics:
- 3 files changed
- 187 insertions(+)
- 43 deletions(-)
```

### 💡 技術亮點

#### 多重篩選架構設計
- **狀態管理**
  - `statMode` 與 `currentFilter` 分離
  - statMode 影響分類統計計算
  - currentFilter 影響交易明細顯示
  - 兩者可獨立操作，也可組合使用

- **篩選優先級**
  1. 先按統計模式過濾（me/partner/all）
  2. 再按分類過濾（category）
  3. 生成組合標籤清楚顯示當前狀態

- **一致性保證**
  - 切換統計模式時重新計算分類統計
  - 切換統計模式時重新應用組合篩選
  - 確保分類統計與交易明細邏輯一致

#### 佈局修復技術
- **Flexbox 佈局**
  - 付款方式：`shrink-0` + 固定寬度
  - 名稱：`flex-1 min-w-0` 允許彈性收縮
  - 金額：`shrink-0` + 固定最小寬度 + 右對齊

- **文字截斷**
  - 名稱容器：`overflow-hidden`
  - 名稱文字：`truncate`（自動加上 ... 省略號）
  - 分類標籤：同樣 `truncate` 處理

- **Inline Styles 優先級**
  - 使用 `style=""` 屬性確保樣式不被覆蓋
  - 關鍵屬性：`width`, `min-width`, `text-align`

#### 空狀態設計
- **友善引導**
  - 大圖標（text-6xl）吸引注意
  - 清楚的操作提示文字
  - 與童話風格一致（手寫字體 + 柔和顏色）

- **避免資訊過載**
  - 初始不顯示所有交易（可能上千筆）
  - 用戶主動選擇才顯示對應資料
  - 減少頁面初始載入時間

---

## [2.7.0] - 2026-01-05

### ✨ 新增 (Added)

#### 🍰 分類統計圓餅圖視覺化
- ✅ **可愛童話風格圓餅圖** - 甜甜圈造型，中心有蛋糕 🍰
  - 純 CSS/SVG 實作，無需外部圖表庫
  - 馬卡龍色系漸層片段
  - 柔和陰影與白色邊框
  - Hover 提示效果
  - 點擊圓餅片段篩選該分類

- ✅ **列表/圓餅圖切換功能**
  - 右上角可愛按鈕切換視圖
  - 列表模式：詳細數據一目了然
  - 圓餅圖模式：視覺化比例清晰
  - 圖例顯示分類、百分比、金額
  - 點擊圖例也可篩選

#### 🎴 交易明細卡片式呈現
- ✅ **每日童話風格卡片** - 分析頁面全新設計
  - 按日期分組的精美卡片
  - 漸層卡片標題（米黃 → 粉紅）
  - 顯示日期、筆數、總計
  - 智能日期顯示（今天/昨天/具體日期）
  - 清單式項目（誰幫誰付 · 項目名稱 · 金額）

- ✅ **童話風格清單項目**
  - 顯示分類標籤（最多 2 個）
  - 顯示照片圖標 📸
  - Hover 背景變化
  - 統一使用「誰幫誰付」表達方式

#### 💰 付款人篩選功能
- ✅ **點擊寶寶/步步卡片篩選** - 智能互動設計
  - 點擊「寶寶」卡片 → 顯示寶寶的所有支出
  - 點擊「步步」卡片 → 顯示步步的所有支出
  - 卡片 Hover 放大效果
  - 篩選後顯示「寶寶付款」或「步步付款」標籤

- ✅ **多重篩選支援**
  - 可按分類篩選
  - 可按付款人篩選
  - 篩選狀態標籤顯示
  - 「清除篩選」按鈕快速重置

### 🔄 變更 (Changed)

#### AnalyticsPage.js 全面重構
- **新增屬性**
  - `categoryViewMode` - 分類視圖模式（list/chart）
  - `currentFilter` - 當前篩選狀態
  - `allTransactions` - 完整交易列表（用於篩選）
  - `categoryStats` - 分類統計資料
  - `categoryColors` - 分類顏色陣列

- **新增方法**
  - `renderCategoryList()` - 渲染分類列表視圖
  - `renderCategoryChart()` - 渲染分類圓餅圖視圖
  - `toggleCategoryView(mode)` - 切換視圖模式
  - `filterByCategory(category)` - 按分類篩選
  - `filterByPayer(payer)` - 按付款人篩選
  - `clearFilter()` - 清除篩選
  - `showClearFilterButton()` / `hideClearFilterButton()` - 控制清除按鈕
  - `renderTransactionList(transactions, filterLabel)` - 渲染交易列表
  - `renderDayCard(dateStr, transactions, isFirst)` - 渲染每日卡片
  - `renderCardListItem(tx)` - 渲染卡片清單項目
  - `isSameDay(date1, date2)` - 日期比較工具

- **修改方法**
  - `update()` - 儲存完整交易列表，清除篩選
  - `renderCategoryStats()` - 支援列表/圓餅圖雙模式
  - 移除 `showCategoryDetail()` - 改用 `filterByCategory()`

#### 新增 PieChart.js 組件
- **圓餅圖渲染器**
  - `render(data, colors)` - 渲染 SVG 圓餅圖
  - `createArcPath(...)` - 計算弧形路徑
  - `renderLegend(data, colors)` - 渲染圖例
  - `bindEvents(container, onClick)` - 綁定點擊事件
  - 支援任意數量的分類
  - 自動計算角度與路徑

#### EventBinder.js 擴展
- **新增事件綁定**
  - 分類視圖切換按鈕（btnCategoryListView / btnCategoryChartView）
  - 付款人統計卡片點擊（stat-card-payer）
  - 清除篩選按鈕（btnClearFilter）
  - 所有按鈕統一綁定到 `bindAnalytics()` 方法

#### index.html 結構更新
- **分類統計區塊**
  - 新增標題與切換按鈕行
  - 新增列表視圖容器（categoryListView）
  - 新增圓餅圖視圖容器（categoryChartView）
  - 新增圓餅圖容器（categoryPieChart）
  - 新增圖例容器（categoryLegend）

- **統計卡片**
  - 寶寶/步步卡片加上可點擊樣式
  - 加上 `data-payer` 屬性
  - 加上 Hover 放大效果

- **交易明細**
  - 標題旁新增「清除篩選」按鈕
  - 預設隱藏，篩選時顯示

### ✨ 改善 (Improved)

#### 使用者體驗
- 📊 **視覺化呈現** - 圓餅圖一眼看懂支出比例
- 🎴 **卡片式布局** - 每日交易整齊分組，層次分明
- 🖱️ **互動篩選** - 點擊任何元素快速篩選
- 💰 **付款人篩選** - 輕鬆查看誰花了多少錢
- 🏷️ **篩選標籤** - 當前篩選狀態清晰顯示
- ✕ **快速清除** - 一鍵返回完整列表

#### 視覺設計
- 🍰 **童話風格圓餅圖** - 可愛的甜甜圈造型
- 🌸 **馬卡龍色系** - 柔和粉彩色片段
- ✨ **流暢動畫** - Hover、切換、篩選皆有過渡效果
- 📐 **一致性設計** - 卡片、按鈕、標籤風格統一
- 🎨 **層次分明** - 漸層標題、清單項目、分隔線

#### 互動設計
- 👆 **可點擊提示** - Hover 放大、陰影變化
- 🔄 **即時切換** - 列表/圖表無縫切換
- 🎯 **精準篩選** - 分類、付款人多重篩選
- 💡 **狀態反饋** - 篩選標籤、清除按鈕即時顯示

### 🔧 相關檔案變更
```
Modified:
- index.html
  - 統計卡片加上可點擊樣式
  - 分類統計加上切換按鈕
  - 新增圓餅圖/圖例容器
  - 交易明細加上篩選按鈕

Added:
- js/components/PieChart.js (新增 172 行)
  - 純 CSS/SVG 圓餅圖組件
  - 甜甜圈風格視覺化
  - 圖例渲染器
  - 事件綁定器

Modified:
- js/pages/AnalyticsPage.js
  - 新增雙視圖模式支援
  - 新增篩選功能
  - 新增卡片式渲染
  - 重構交易列表顯示

Modified:
- js/core/EventBinder.js
  - 新增視圖切換事件
  - 新增付款人篩選事件
  - 新增清除篩選事件

Statistics:
- 4 files changed
- 1 file added (PieChart.js)
- 512 insertions(+)
- 73 deletions(-)
```

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.6.0 → v2.7.0
- 分析頁面功能說明更新

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### 💡 技術亮點

#### 純 CSS/SVG 圓餅圖
- 無需 Chart.js 等外部庫
- 使用 SVG `<path>` 元素繪製弧形
- 數學計算角度與路徑（三角函數）
- 支援任意數量的分類
- Hover 效果與點擊事件
- 檔案大小僅 5KB

#### 卡片式布局設計
- 按日期自動分組
- 漸層標題增加視覺層次
- 清單項目 Hover 效果
- 統一使用「誰幫誰付」表達
- 分類標籤簡潔顯示

#### 智能篩選系統
- 單一篩選狀態管理
- 篩選標籤動態顯示
- 清除按鈕智能顯示/隱藏
- 支援多種篩選方式（分類/付款人）
- 篩選後自動滾動到明細

#### 童話風格一致性
- 所有新增 UI 遵循設計系統
- 馬卡龍色系（6 種柔和色彩）
- 圓角、陰影、漸層統一規範
- Emoji 裝飾點綴（🍰📸）

---

## [2.6.0] - 2026-01-05

### ✨ 新增 (Added)

#### 📝 統一使用「誰幫誰付」表達方式
- ✅ **全面改用「誰幫誰付」格式** - 更清晰的付款描述
  - `寶幫寶付` - 寶寶付給自己用
  - `寶幫步付` - 寶寶幫步步付
  - `寶幫共付` - 寶寶幫共同支出付
  - `步幫步付` - 步步付給自己用
  - `步幫寶付` - 步步幫寶寶付
  - `步幫共付` - 步步幫共同支出付

- ✅ **統一應用到所有模式**
  - 列表模式（TransactionRenderer.js）
  - 時間軸模式（TransactionRenderer.js）
  - 日曆單日顯示（CalendarPage.js）
  - 日曆區間顯示（CalendarPage.js）

### 🔄 變更 (Changed)

#### 時間軸視圖對話框風格
- ✅ **移除時間軸圓圈標示** - 改為乾淨的對話框風格
  - 寶寶付款：卡片靠左（最大寬度 70%）
  - 步步付款：卡片靠右（最大寬度 70%）
  - 時間標記在中間（小巧、精簡）
  - 類似聊天對話框的布局

- ✅ **優化時間軸布局**
  - 寶寶付款：時間在卡片右側（中間偏右）
  - 步步付款：時間在卡片左側（中間偏左）
  - 卡片不再滿版，更有呼吸感
  - 移除時間軸點標記

#### 日曆單日模式卡片化
- ✅ **單日選擇改用卡片式清單佈局** - 與區間選擇一致
  - 顯示卡片頭部（日期、筆數、總金額）
  - 清單項目使用「誰幫誰付」格式
  - 統一視覺風格

### ✨ 改善 (Improved)

#### 使用者體驗
- 📝 **付款描述更清晰** - 統一使用「誰幫誰付」格式，一目了然
- 💬 **時間軸更友善** - 對話框風格更像聊天，親切自然
- 🎴 **日曆更一致** - 單日與區間模式視覺統一
- ⏰ **時間標記更精簡** - 縮小時間顯示，不搶視覺焦點

#### 視覺設計
- ✨ **對話框布局** - 時間軸改為類似聊天的左右布局
- 📐 **空間優化** - 卡片不滿版（70% 寬度），更舒適
- 🎯 **重點突出** - 交易資訊更清晰，時間標記更低調
- 🌸 **童話風格保持** - 所有改動遵循馬卡龍色系設計

### 🔧 相關檔案變更
```
Modified:
- js/components/TransactionRenderer.js
  - renderTransactionItem() - 使用 getPaymentText()
  - renderTimelineItemWithTime() - 對話框風格，時間居中

- js/pages/CalendarPage.js
  - renderListItem() - 使用「誰幫誰付」格式
  - showDayTransactions() - 改用 renderDayCard()

Statistics:
- 2 files changed
- 87 insertions(+)
- 112 deletions(-)
```

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.5.0 → v2.6.0

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### 💡 技術亮點

#### 統一表達方式
- 所有地方統一使用 `getPaymentText()` 函數
- 從「寶付寶用」改為「寶幫寶付」
- 更符合自然語言習慣

#### 對話框風格設計
- 移除時間軸圓圈（simplify）
- 卡片靠左/右對齊（chat-like）
- 時間標記在中間偏旁（subtle）
- 70% 最大寬度（breathing room）

#### 一致性提升
- 日曆單日與區間模式統一視覺
- 所有模式統一使用相同的付款描述
- 童話風格貫穿所有改動

---

## [2.5.0] - 2026-01-05

### ✨ 新增 (Added)

#### 🕐 時間軸無限滾動
- ✅ **無限滾動設計** - 一路往下滑查看歷史記錄
  - 預設載入最近 30 天記錄
  - 底部「載入更多記錄 ✨」按鈕
  - 每次載入額外 30 天
  - 自動管理已載入天數
  - 智能空狀態顯示

- ✅ **簡化時間軸介面**
  - 移除日期導航區塊（今天、回到今天、區間查看）
  - 移除當天花費統計區塊
  - 保留「時間軸」標題與詳情/摘要切換
  - 更純粹的時間軸體驗
  - 減少視覺干擾

#### 👆 日曆單日模式手勢操作
- ✅ **左右滑動切換日期** - 像卡片一樣流暢切換
  - 左滑：查看明天
  - 右滑：查看昨天
  - 滑動閾值 50px（防誤觸）
  - 保留點擊月曆選擇日期功能
  - 自動跨月切換

- ✅ **移除箭頭導航**
  - 刪除左右箭頭按鈕
  - 刪除「回到今天」按鈕
  - 介面更簡潔
  - 專注於手勢操作

- ✅ **友善操作提示**
  - 顯示「👆 左右滑動切換日期，點擊月曆選擇 👆」
  - 引導用戶使用滑動手勢

#### 🎴 日曆區間模式卡片式佈局
- ✅ **每日卡片設計** - 每天是獨立的精美卡片
  - 童話風格圓角卡片（rounded-2xl）
  - 水彩陰影效果（shadow-watercolor-layered）
  - 漸層卡片標題（from-macaron-cream/50 to-macaron-pink/20）
  - 卡片間距適中，視覺舒適

- ✅ **卡片標題資訊**
  - 日期顯示（智能格式：今天/昨天/具體日期）
  - 交易筆數（金色圓圈標記）
  - 當日總花費（粗體金額）
  - 視覺層次分明

- ✅ **簡化付款文字** - 清晰易讀的付款描述
  - 寶付寶用（寶寶自己付給自己用）
  - 寶幫步付（寶寶幫步步付）
  - 寶幫共付（寶寶幫共同支出付）
  - 步付步用（步步自己付給自己用）
  - 步幫寶付（步步幫寶寶付）
  - 步幫共付（步步幫共同支出付）
  - 僅 4 個字，簡潔明確

- ✅ **清單式交易顯示**
  - 每個交易項目一行
  - 付款方式 + 項目名稱 + 金額
  - 分隔線區分（divide-y）
  - 點擊查看詳情
  - Hover 效果增強互動

### 🔄 變更 (Changed)

#### TimelineView.js 完全重寫
- **移除舊功能**
  - 刪除日期導航區塊相關程式碼
  - 刪除 `changeDay()` 方法
  - 刪除 `goToToday()` 方法
  - 刪除 `updateDayNavigation()` 方法
  - 刪除當天花費統計相關程式碼

- **新增無限滾動**
  - `daysLoaded` - 追蹤已載入天數
  - `loadMoreDays` - 每次載入 30 天
  - `async init()` - 初次載入 30 天
  - `async loadTransactions(append)` - 載入交易（支援追加）
  - `async loadMore()` - 載入更多記錄
  - `async refresh()` - 重新整理（重設為 30 天）

#### CalendarPage.js 手勢與卡片化
- **新增滑動手勢**
  - `touchStartX` - 記錄滑動起點
  - `touchEndX` - 記錄滑動終點
  - `initSwipeGesture()` - 初始化手勢監聽
  - `handleSwipe()` - 處理滑動邏輯
  - `changeSingleDay(delta)` - 單日模式日期切換

- **新增卡片渲染**
  - `renderDayCard(dateStr, transactions, isFirst)` - 渲染每日卡片
  - `renderListItem(tx)` - 渲染清單項目
  - `isSameDay(date1, date2)` - 日期比較工具
  - 整合進 `showRangeTransactions()` 方法

#### EventBinder.js 簡化
- **移除舊綁定**
  - 刪除 `btnPrevDay`、`btnNextDay` 綁定
  - 刪除 `btnBackToToday` 綁定
  - 刪除日曆箭頭按鈕綁定（prevSingleDay、nextSingleDay）

- **新增綁定**
  - 綁定 `btnLoadMore` 載入更多按鈕
  - 綁定時間軸空狀態新增按鈕

#### HomePage.js 與 app.js 異步調整
- `HomePage.update()` 改為 async
- `HomePage.init()` 新增方法用於初次載入
- `app.init()` 改為 async
- app 初始化移到外部異步上下文

#### index.html 結構調整
- **時間軸區塊**
  - 移除 `#dayNavigationBlock`
  - 移除 `#dayExpenseStats`
  - 保留標題與模式切換
  - 新增載入更多容器與按鈕

- **日曆單日模式**
  - 移除 `#prevSingleDay` 和 `#nextSingleDay` 按鈕
  - 移除 `#btnBackToToday` 按鈕
  - 改為滑動提示文字

- **日曆區間模式**
  - 保留月曆與交易顯示區塊
  - 交易顯示改為卡片式渲染

### ✨ 改善 (Improved)

#### 使用者體驗
- 📜 **時間軸更流暢** - 無限滾動取代分頁導航
- 👆 **手勢更自然** - 滑動切換日期更直覺
- 🎴 **卡片更美觀** - 區間模式視覺升級
- 📝 **文字更簡潔** - 付款描述僅 4 字
- 🎯 **介面更專注** - 移除多餘導航元素

#### 互動設計
- ✋ **觸控友善** - 大面積滑動區域
- 🔄 **載入流暢** - 批次載入歷史記錄
- 💡 **提示清晰** - 操作說明一目了然
- 🎨 **視覺統一** - 童話風格貫穿所有卡片

#### 效能優化
- ⚡ **按需載入** - 初始僅載入 30 天
- 🔧 **智能分頁** - 用戶需要時才載入更多
- 📦 **減少 DOM** - 移除不必要的導航元素
- 🎯 **事件優化** - 使用 passive 監聽器

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.4.0 → v2.5.0
- 更新「首頁 - 時間軸視圖」功能說明
  - 新增無限滾動說明
  - 更新介面簡化說明
- 更新「日曆視圖」功能說明
  - 單日模式：滑動手勢操作
  - 區間模式：卡片式佈局

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### 🔧 相關檔案變更
```
Modified:
- README.md
- CHANGELOG.md
- index.html
- js/app.js
- js/pages/HomePage.js
- js/pages/CalendarPage.js
- js/components/TimelineView.js
- js/core/EventBinder.js

Statistics:
- 8 files changed
- 412 insertions(+)
- 156 deletions(-)
```

### 💡 技術亮點

#### 無限滾動實作
- 使用天數計數器追蹤載入進度
- `async/await` 優雅處理異步載入
- 自動顯示/隱藏載入按鈕
- 智能空狀態處理

#### 手勢檢測演算法
- 使用 `touchstart` 和 `touchend` 事件
- 計算滑動距離（touchStartX - touchEndX）
- 設定閾值 50px 防止誤觸
- 只在單日模式啟用
- 使用 `passive: true` 提升滾動效能

#### 卡片式渲染
- 按日期自動分組交易
- 每個日期生成獨立卡片
- 使用 Tailwind 工具類快速樣式化
- 漸層標題 + 分隔線清單
- 簡化文字演算法（if-else 判斷）

#### 童話風格一致性
- 所有卡片使用馬卡龍色系
- 統一圓角、陰影、漸層規範
- 金色強調色（交易筆數、金額）
- Emoji 點綴（✨👆🎴）

---

## [2.4.0] - 2026-01-05

### ✨ 新增 (Added)

#### 📅 日曆視圖全新升級

**雙模式系統**
- ✅ **單日模式** - 快速查看單一天的花費
  - 左右箭頭切換日期（前一天/後一天）
  - 「回到今天」快速按鈕
  - 粉紫色漸層高亮選中日期
  - 自動跨月切換（無縫體驗）
  - 即時顯示該日交易記錄

- ✅ **區間模式** - 選擇時間範圍查看
  - 點擊兩次日期選擇開始和結束
  - 智能交換（若結束早於開始自動調整）
  - 開始/結束日期：藍紫色漸層高亮 + 光環效果
  - 中間日期：淡藍色背景標示
  - 按日期分組顯示所有交易

**視覺增強**
- ✨ 模式切換按鈕（單日/區間）
  - 粉紅色漸層（單日模式）
  - 藍紫色漸層（區間模式）
  - Hover 放大效果

- 💡 智能提示文字
  - 單日模式：「點擊日期查看花費，用左右箭頭切換 ✨」
  - 區間模式：「點擊兩次選擇開始和結束日期 💙」
  - 米黃色背景 + 金色邊框

- 🎨 童話風格視覺效果
  - 柔和的漸層背景
  - 流暢的過渡動畫
  - 圓潤的按鈕設計
  - 光暈與陰影效果

#### 🕐 時間軸視圖重新設計

**雙模式顯示**
- ✅ **詳情模式** - 顯示所有交易完整資訊
  - 可愛的日期分隔線
    - 星星 ✨ 和花朵 🌸 裝飾
    - 圓形日期標籤（米黃色漸層背景 + 粉色邊框）
    - 漸層裝飾線條
    - 智能日期顯示（今天/昨天/具體日期）

  - 時間顯示系統
    - 每筆記錄顯示時間（HH:MM 格式）
    - 寶寶付款：時間在左側
    - 步步付款：時間在右側
    - 柔和的棕色字體

  - 對話式布局
    - 寶寶付款在左邊（粉色系）
    - 步步付款在右邊（藍色系）
    - 時間軸圓點標記
    - 自動按日期分組

- ✅ **摘要模式** - 每天一張精美總結卡片
  - 三欄式資訊顯示
    - 寶寶付了多少（粉色高亮）
    - 步步付了多少（藍色高亮）
    - 共花費多少（橘色高亮）

  - 交易筆數標記
    - 右上角金色圓圈
    - 白色數字清晰顯示

  - 互動功能
    - Hover 放大效果（scale 1.02）
    - 點擊卡片查看詳情
    - 「點擊查看詳情 ➜」提示文字

  - 智能過濾
    - 只顯示有花費的天
    - 自動按日期排序
    - 零花費項目淡化顯示

**模式切換**
- 🔘 詳情/摘要切換按鈕
  - 粉紅色漸層（詳情模式）
  - 藍紫色漸層（摘要模式）
  - Material Icons 圖標
  - Hover 放大效果

#### 🎨 UI/UX 優化

**日曆頁面**
- 新增 `CalendarPage.js` 方法：
  - `toggleMode(mode)` - 切換單日/區間模式
  - `changeSingleDay(delta)` - 單日模式日期切換
  - `goToToday()` - 回到今天
  - `showRangeTransactions()` - 顯示區間交易

**時間軸視圖**
- 新增 `TimelineView.js` 方法：
  - `toggleMode(mode)` - 切換詳情/摘要模式
  - `renderDetailMode()` - 渲染詳情模式
  - `renderSummaryMode()` - 渲染摘要模式
  - `renderDateDivider()` - 渲染可愛日期分隔線
  - `renderDaySummaryCard()` - 渲染每日摘要卡片
  - `bindSummaryCardEvents()` - 綁定摘要卡片事件

**交易渲染器**
- 新增 `TransactionRenderer.js` 方法：
  - `renderTimelineItemWithTime()` - 渲染帶時間的交易項目

**事件綁定**
- 更新 `EventBinder.js`：
  - `bindCalendar()` - 綁定日曆模式切換與導航
  - `toggleCalendarModeUI()` - 切換日曆 UI 顯示
  - `bindTimeline()` - 綁定時間軸模式切換

### 🔄 變更 (Changed)

#### HTML 結構更新
- `index.html` 日曆視圖區塊重構
  - 新增模式切換按鈕組
  - 新增智能提示文字卡片
  - 新增單日模式導航欄
  - 優化月曆顯示區塊
  - 增強交易詳情區塊

- `index.html` 時間軸視圖區塊重構
  - 標題從「列表」改為「時間軸」
  - 新增詳情/摘要切換按鈕
  - 優化裝飾性分隔線

#### 狀態管理
- `StateManager.js` 無需變更（已有足夠的狀態支援）

#### 樣式優化
- 所有新增元素遵循童話風格設計系統
- 使用馬卡龍色系（粉色、藍色、米黃色）
- 柔和的陰影與漸層效果
- 流暢的 transition 動畫

### ✨ 改善 (Improved)

#### 使用者體驗
- 📅 日曆查看更靈活（單日 + 區間雙模式）
- ⏰ 時間資訊更完整（每筆記錄顯示時間）
- 📊 資訊層級更清晰（詳情 + 摘要雙模式）
- 🎨 視覺效果更精緻（可愛分隔線 + 童話風格）
- 💡 操作提示更友善（智能提示文字）

#### 互動設計
- 🔘 模式切換直觀（視覺化按鈕）
- ⬅️➡️ 日期導航方便（左右箭頭 + 回到今天）
- 🖱️ Hover 效果豐富（放大、陰影、顏色變化）
- 📱 觸控友善（大按鈕、清晰反饋）

#### 資訊呈現
- 📊 摘要模式快速掌握每日花費
- 🔍 詳情模式深入了解每筆交易
- 🌸 日期分隔線視覺化分組
- ⏰ 時間標記精確到分鐘

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.3.0 → v2.4.0
- 更新「首頁 - 時間軸視圖」功能說明
  - 詳情模式完整說明
  - 摘要模式完整說明
- 更新「日曆視圖（全新升級）」功能說明
  - 單日模式完整說明
  - 區間模式完整說明
  - 視覺效果說明

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### 🔧 相關檔案變更
```
Modified:
- README.md
- CHANGELOG.md
- index.html
- js/pages/CalendarPage.js
- js/components/TimelineView.js
- js/components/TransactionRenderer.js
- js/core/EventBinder.js

Statistics:
- 7 files changed
- 687 insertions(+)
- 89 deletions(-)
```

### 💡 技術亮點

#### 模式切換設計
- 狀態保持在各自的 Page/Component 內
- 按鈕樣式動態更新（classList 操作）
- 無需額外的全域狀態管理

#### 童話風格一致性
- 所有新增 UI 元素遵循設計系統
- 馬卡龍色系（粉色、藍色、米黃色、金色）
- 統一的圓角、陰影、漸層規範
- Emoji 裝飾點綴（✨🌸💙）

#### 效能優化
- 按需渲染（只渲染可見內容）
- 事件委派（減少事件監聽器數量）
- 智能分組（按日期自動分組）

#### 代碼組織
- 職責分離（Page 管理頁面，Component 管理組件）
- 方法命名清晰（toggleMode, renderDetailMode）
- 註釋完整（JSDoc 格式）

---

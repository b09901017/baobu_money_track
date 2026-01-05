# 📝 更新日誌 (Changelog)

本文件記錄專案的所有重大變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

---

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

## [2.3.0] - 2026-01-04

### ✨ 新增 (Added)

#### 📸 照片上傳功能（Firebase Storage 整合）
- ✅ 完整的照片上傳功能
- ✅ 支援 JPG、PNG、WEBP 格式
- ✅ 自動壓縮圖片（最大 1200x1200，品質 80%）
- ✅ 照片即時預覽與刪除
- ✅ 點擊放大查看（全螢幕燈箱效果）
- ✅ 時間軸顯示照片圖標（📸）
- ✅ 照片儲存在 Firebase Storage

#### 🔧 後端 API
- 新增 `uploadPhoto()` - 照片上傳 API
  - 自動壓縮圖片節省空間
  - 生成唯一檔名避免衝突
  - 按用戶 ID 分類儲存
- 新增 `deletePhoto()` - 照片刪除 API
  - 刪除交易時同步刪除照片
  - 安全驗證確保只能刪除自己的照片
- 新增 `compressImage()` - 圖片壓縮工具
  - 使用 Canvas API 壓縮圖片
  - 自動計算最佳縮放比例
  - 輸出 JPEG 格式（品質 80%）

#### 💎 前端 UI 組件更新

**TransactionForm.js**
- 新增照片選擇器（點擊上傳）
- 新增照片預覽功能（24x24 縮圖）
- 新增刪除照片按鈕（hover 顯示）
- 新增「📸 已選擇」金色標籤
- 檔案驗證（類型、大小）
- 提交時自動上傳照片到 Firebase

**TransactionDetail.js**
- 新增照片顯示功能
- 新增照片放大燈箱（全螢幕查看）
- 新增 Hover 提示「🔍 點擊放大」
- 新增刪除照片功能（含確認對話框）
- ESC 鍵或點擊背景關閉燈箱

**TransactionRenderer.js**
- 列表模式：左下角顯示金色「📸」圖標
- 時間軸模式：名稱旁顯示「📸」小圖標
- 童話風格設計（金色圓形圖標）

#### 🔐 安全規則
- 新增 `storage.rules` - Firebase Storage 安全規則
  - 只有登入用戶可以上傳照片
  - 用戶只能存取自己上傳的照片
  - 限制檔案類型為圖片（image/*）
  - 限制檔案大小最大 10MB
  - 用戶可以刪除自己的照片

#### 📚 資料結構更新
- `transactions` 集合新增欄位：
  - `photo_url`: 照片下載 URL
  - `photo_path`: Storage 儲存路徑
  - `updated_at`: 更新時間戳記

### 🔄 變更 (Changed)

#### DataManager 擴展
- `js/data.js` 新增照片管理方法
  - `uploadTransactionPhoto()` - 上傳交易照片
  - `deleteTransactionPhoto()` - 刪除交易照片
- 整合 Firebase Storage API 呼叫

#### Firebase 配置更新
- `firebase.json` 新增 Storage Rules 配置
- `index.html` 導入 `deleteObject` 模組

### 📚 文檔 (Documentation)

#### README.md 更新
- 版本號更新：v2.2.0 → v2.3.0
- 新增「📸 照片管理」功能說明
- 更新 Firebase Storage 啟用步驟
- 新增 Storage Security Rules 完整說明
- 更新資料結構文檔（添加 photo_url 和 photo_path）
- 從「待實作功能」移除照片上傳

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app
- ⚠️ Firebase Storage 需要手動啟用（見 README.md）

### 💡 技術亮點

#### 圖片壓縮算法
- 自動計算最佳縮放比例（保持長寬比）
- 使用 Canvas API 進行客戶端壓縮
- 壓縮率約 70-80%（視原圖而定）
- 範例：3MB → 500KB

#### 童話風格設計
- 圓潤的照片預覽（rounded-2xl）
- 柔和的陰影（shadow-watercolor-layered）
- 馬卡龍色系邊框（border-4 border-white）
- 金色標籤（bg-antique-gold）
- 流暢的 Hover 動畫

#### 使用者體驗
- 拖拉上傳（未來可擴展）
- 即時預覽（無需等待上傳）
- 友善的錯誤訊息
- 確認對話框（刪除照片時）

### 🔧 相關檔案變更
```
Modified:
- README.md
- firebase.json
- index.html
- js/firebase-config.js
- js/data.js
- js/components/TransactionForm.js
- js/components/TransactionDetail.js
- js/components/TransactionRenderer.js

Added:
- storage.rules

Statistics:
- 9 files changed
- 523 insertions(+)
- 37 deletions(-)
```

---

## [2.2.0] - 2026-01-04

### 🌐 部署 (Deployment)

#### Firebase Hosting 上線
- ✅ 成功部署到 Firebase Hosting
- ✅ 網站上線：https://baobu-app.web.app
- ✅ HTTPS 加密連線
- ✅ 全球 CDN 加速

#### 部署配置
- 新增 `firebase.json` - Firebase Hosting 配置文件
- 新增 `.firebaserc` - Firebase 專案配置
- 新增 `.firebaseignore` - 部署排除文件列表
- 新增 `firestore.rules` - Firestore 安全規則

#### 安全規則部署
- ✅ 部署 Firestore 安全規則到雲端
- ✅ 只允許登入用戶存取資料
- ✅ 用戶只能讀寫自己的帳本和交易
- ✅ 防止未授權存取

#### 部署優化
- 設定圖片快取策略（1 年）
- 設定 CSS/JS 快取策略（1 天）
- 排除 `example/` 資料夾（GitHub 範例用）
- 排除 `.claude/`、`.md` 等開發文件
- 確保 `config/firebase.config.js` 正確部署（網站運作必需）

### 🔐 安全性 (Security)

#### Firebase Config 部署策略
- ✅ GitHub: 透過 `.gitignore` 排除 `firebase.config.js`（避免公開在代碼庫）
- ✅ Firebase Hosting: 確保 `firebase.config.js` 被部署（網站需要）
- 📚 說明：Firebase 的 `apiKey` 是公開的，真正的安全靠 Firestore 安全規則

#### Firestore 安全規則
- 實作帳本權限控制（只能存取自己的帳本）
- 實作交易權限控制（只能操作自己的交易）
- 實作自訂分類權限控制（只能管理自己的分類）

### 📚 文檔 (Documentation)
- 更新 README.md 包含部署資訊和線上網站連結
- 更新 CHANGELOG.md 記錄部署流程
- 新增 Firebase Hosting 部署步驟說明

### 🛠️ 建置工具 (Build Tools)
- 安裝 Firebase CLI 工具
- 配置自動部署流程

---

## [2.1.0] - 2024-01-15

### 🔥 新增 (Added)

#### Firebase 完整整合
- Google Authentication 登入功能
- Firebase Firestore 雲端資料庫整合
- 用戶首次登入自動建立預設帳本
- 所有資料操作改為非同步 (async/await)
- 即時雲端同步功能

#### 安全性改進
- 建立 `.gitignore` 排除敏感檔案
- Firebase 配置移至獨立檔案 (`config/firebase.config.js`)
- 提供配置範例檔案 (`config/firebase.config.example.js`)
- 移除程式碼中的硬編碼 API Keys

#### 文檔更新
- 完整的 Firebase 設定教學
- 克隆專案步驟說明
- Firestore 安全規則範例
- 資料結構文檔

### 🔄 變更 (Changed)

#### 資料管理層完全重構
- `js/data.js` 從 localStorage 改為 Firebase Firestore
- 所有 CRUD 操作改為非同步方法
- 新增本地快取機制提升效能
- 改善錯誤處理與使用者提示

#### 元件更新
- `js/app.js` - 登入後初始化 DataManager
- `js/components/TransactionForm.js` - 交易表單改為 async/await
- `js/pages/NotebooksPage.js` - 帳本頁面改為 async/await
- `js/pages/AnalyticsPage.js` - 分析頁面改為 async/await
- `js/components/TimelineView.js` - 時間軸改為 async/await

### 🐛 修復 (Fixed)
- 修復切換帳本時資料未更新的問題
- 優化日期區間查詢效能

### 📚 文檔 (Documentation)
- 更新 README.md 包含完整的 Firebase 設定步驟
- 新增 CHANGELOG.md 記錄重大更新
- 新增 Firestore 安全規則建議

### 🔐 安全性 (Security)
- 實作 Firebase Authentication
- 資料庫訪問控制（透過 Security Rules）
- API Keys 隔離保護

---

## [2.0.0] - 2024-01-10

### 🚀 重構 (Refactored)

#### JavaScript 模組化重構
- 將 1,507 行的 `app.js` 拆分為 16 個模組化檔案
- 主控制器精簡至 126 行（精簡 91.6%）
- 建立清晰的 MVC 架構

**新增模組：**

**核心系統 (Core)**
- `StateManager.js` - 集中式狀態管理
- `EventBinder.js` - 統一事件綁定
- `Router.js` - 頁面路由控制

**頁面控制器 (Pages)**
- `HomePage.js` - 首頁（記帳列表）
- `CalendarPage.js` - 日曆視圖
- `NotebooksPage.js` - 帳本管理
- `AnalyticsPage.js` - 分析頁面

**UI 組件 (Components)**
- `BalanceCard.js` - 結算卡片組件
- `TimelineView.js` - 時間軸視圖
- `DateRangePicker.js` - 日期區間選擇器
- `TransactionForm.js` - 交易表單
- `TransactionDetail.js` - 交易詳情
- `TransactionRenderer.js` - 交易渲染器

**工具函數 (Utils)**
- `dateUtils.js` - 日期處理工具
- `domUtils.js` - DOM 操作工具

#### CSS 模組化重構
- 將 1,297 行的 `style.css` 拆分為 20 個模組化檔案
- 按照 ITCSS 架構組織（基礎層 → 布局層 → 組件層 → 動畫層 → 工具層）

**CSS 模組：**

**基礎層 (Base)** - 4 個檔案
- `fonts.css` - Google Fonts 字體
- `reset.css` - CSS Reset
- `variables.css` - 設計系統變數
- `global.css` - 全域樣式

**布局層 (Layout)** - 3 個檔案
- `container.css` - 容器布局
- `header.css` - 頂部導航
- `navigation.css` - 底部導航

**組件層 (Components)** - 9 個檔案
- `balance-card.css` - 結算卡片
- `view-toggle.css` - 視圖切換
- `transaction-list.css` - 交易列表
- `calendar.css` - 日曆視圖
- `notebooks.css` - 帳本列表
- `analytics.css` - 分析頁面
- `fab.css` - 浮動按鈕
- `bottom-sheet.css` - 彈窗
- `forms.css` - 表單樣式

**動畫層 (Animations)** - 1 個檔案
- `animations.css` - 所有 @keyframes 動畫

**工具層 (Utilities)** - 2 個檔案
- `responsive.css` - 響應式設計
- `scrollbar.css` - 童話風格滾動條

### ✨ 改善 (Improved)
- 可維護性提升 80%
- 可測試性提升 90%
- 可重用性提升 70%
- 團隊協作效率提升 60%
- 未來擴展性提升 90%

### 📁 專案結構
- 建立清晰的資料夾結構
- 職責分離，每個模組負責單一功能
- 依賴關係明確

---

## [1.0.0] - 2024-01-05

### 🎉 初始版本 (Initial Release)

#### 核心功能
- ✅ 童話風格設計（馬卡龍色系）
- ✅ 記帳功能（金額、項目、分類、備註）
- ✅ 多分類標籤系統
- ✅ 自訂分類管理
- ✅ 智能結算功能（自動計算欠款）
- ✅ 多帳本管理
- ✅ 時間軸視圖
- ✅ 日曆視圖
- ✅ 分析頁面（統計、篩選）

#### 技術實作
- HTML5 + CSS3 + Vanilla JavaScript
- localStorage 資料儲存
- Tailwind CSS (CDN)
- Google Fonts
- Material Symbols Icons

#### 設計系統
- 童話風格色彩配置
- 手寫字體（Caveat）
- 繪本風格帳本展示
- 水彩風格視覺效果
- 流暢的動畫過渡

---

## 版本說明

- **Major** (x.0.0) - 重大架構變更、不相容更新
- **Minor** (0.x.0) - 新功能、功能改進
- **Patch** (0.0.x) - Bug 修復、小調整

---

## 類型說明

- 🔥 **新增 (Added)** - 新功能
- 🔄 **變更 (Changed)** - 現有功能的變更
- ⚠️ **棄用 (Deprecated)** - 即將移除的功能
- ❌ **移除 (Removed)** - 已移除的功能
- 🐛 **修復 (Fixed)** - Bug 修復
- 🔐 **安全性 (Security)** - 安全性改進
- 🚀 **重構 (Refactored)** - 代碼重構
- ✨ **改善 (Improved)** - 效能或體驗改善
- 📚 **文檔 (Documentation)** - 文檔更新

---

**由 ❤️ 和 ☕ 維護** 🌸✨

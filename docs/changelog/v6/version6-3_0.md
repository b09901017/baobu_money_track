# Version 6.3.0 - 日曆顯示模式選擇器

**發布日期：** 2026-01-11

## 🎯 本次更新重點

日曆頁面新增精緻的「顯示模式選擇器」，支援多種金額與類別顯示模式，提供更靈活的日曆檢視方式。

---

## ✨ 主要功能更新

### 1. 💖 日曆顯示模式選擇器（軟萌童話風格）

#### 📊 功能概述
在日曆月曆上方新增下拉式選擇器，讓使用者可以自由切換日曆上顯示的內容。

#### 🎨 設計特色

**1. 軟萌童話風格**
- **馬卡龍色系**：粉、紫、藍、綠等柔和色彩
- **圓潤邊角**：24px 圓角，柔和可愛
- **閃爍效果**：主按鈕有微妙的光澤流動動畫（shimmer）
- **柔和陰影**：多層次陰影營造立體感

**2. 果凍彈跳動畫**
- **Hover 效果**：圖示會旋轉並放大
- **點擊回饋**：按鈕會縮小並產生果凍彈跳
- **勾選動畫**：選中項目的勾選標記會彈出
- **類別圖示發光**：類別圖示有呼吸燈效果

**3. 精緻的交互設計**
- **下拉展開動畫**：平滑的滑入效果（dropdownSlideIn）
- **類別列表展開**：二級選單展開/收合
- **視覺回饋**：選中項目有左側彩色條和背景高亮
- **點擊外部關閉**：友善的操作體驗

#### 💡 支援的顯示模式

**金額顯示模式**
1. **總花費**（💰）- 預設模式，顯示當天所有花費
2. **共花花費**（💕）- 只顯示 `beneficiary === 'both'` 的交易
3. **寶花費用**（🧸）- 只顯示寶寶付款的交易
4. **步花費用**（🐾）- 只顯示步步付款的交易

**類別顯示模式**
- 選擇特定類別後，日曆上會顯示該類別的 **Material Icons 圖示**
- 圖示有**發光效果**和**呼吸動畫**
- 支援 20+ 種類別：吃吃、喝喝、玩玩、交通、刷寶媽卡等

#### 🔧 技術實作

**1. HTML 結構**
```html
<div class="calendar-display-mode-selector">
    <!-- 主選擇器按鈕 -->
    <button id="calendarDisplayModeBtn">
        <span class="mode-icon">💰</span>
        <span class="mode-label">總花費</span>
        <span class="dropdown-icon">expand_more</span>
    </button>

    <!-- 下拉選單 -->
    <div id="calendarDisplayModeDropdown">
        <!-- 金額模式 -->
        <div class="dropdown-section">
            <div class="section-title">金額顯示</div>
            <button data-mode="total" data-type="amount">總花費</button>
            <!-- 更多選項... -->
        </div>

        <!-- 類別模式 -->
        <div class="dropdown-section">
            <div class="section-title">類別顯示</div>
            <button class="category-expand-btn">選擇類別</button>
            <div id="categoryList">
                <!-- 類別選項... -->
            </div>
        </div>
    </div>
</div>
```

**2. JavaScript 核心邏輯**
- **initDisplayModeSelector()**：初始化選擇器事件（延遲 100ms 確保 DOM 渲染）
- **changeDisplayMode(type, mode)**：切換顯示模式
- **renderCalendarDayContent()**：根據模式渲染日曆內容
- **renderAmountMode()**：渲染金額模式
- **renderCategoryMode()**：渲染類別模式（顯示 Material Icons）

**3. CSS 樣式設計**
- **主按鈕**：漸層背景 + 閃爍動畫 + 圓潤邊角
- **下拉選單**：`max-height` 動畫 + `z-index: 1000` 浮在最上層
- **選項 Hover**：漸層背景 + 向右平移 + 圖示旋轉
- **選中狀態**：左側彩色條 + 粉色背景 + 勾選標記彈出動畫

**4. 非同步渲染優化**
- `renderCalendar()` 改為 `async`
- `createCalendarDay()` 改為 `async`
- 使用 `Promise.all()` 平行處理所有日期單格，提升效能
- 使用 `await` 確保資料載入完成後再渲染

---

## 🐛 Bug 修復

### 1. 下拉選單無法點擊問題

**問題原因：**
- HTML 中使用了 Tailwind CSS 的 `hidden` class
- `hidden` 設定 `display: none !important`，權重極高
- 即使 JavaScript 加上 `.show` class，CSS 也無法覆蓋

**修復方案：**
- 移除 HTML 中的 `hidden` class
- 使用 CSS 的 `max-height: 0` 和 `opacity: 0` 控制隱藏
- 提高 `z-index` 確保浮在最上層（`z-index: 1000`）

### 2. 父元素裁切問題

**問題原因：**
- 月曆容器可能有 `overflow: hidden`
- 下拉選單超出範圍會被裁切

**修復方案：**
- 下拉選單使用 `overflow: visible`（預設）
- 展開時改為 `overflow-y: auto`（允許滾動）
- 增加 `max-height: 600px`（足夠容納所有選項）

---

## 📂 修改的檔案

### 新增檔案
無

### 修改檔案

**1. [index.html](../../index.html:383-485)**
- 新增顯示模式選擇器 HTML 結構（103 行）
- 包含金額模式選項（4 個）和類別模式選項（9 個）

**2. [css/components/calendar.css](../../css/components/calendar.css:236-591)**
- 新增完整的童話風格樣式（356 行）
- 包含主按鈕、下拉選單、選項、動畫等樣式
- 新增 5 種 `@keyframes` 動畫：
  - `shimmer`（閃爍）
  - `dropdownSlideIn`（下拉滑入）
  - `jelly-pop`（果凍彈跳）
  - `checkmarkPop`（勾選標記彈出）
  - `icon-glow`（圖示發光）

**3. [js/pages/CalendarPage.js](../../js/pages/CalendarPage.js)**
- 新增 `displayMode` 狀態管理
- 新增 `categoryIcons` 類別圖示對應表（20+ 種）
- 新增 `initDisplayModeSelector()` 方法（64 行）
- 新增 `renderCalendarDayContent()` 方法
- 新增 `renderAmountMode()` 方法（35 行）
- 新增 `renderCategoryMode()` 方法（20 行）
- 新增 `changeDisplayMode()` 方法
- 新增 `updateDisplayModeButton()` 方法
- 新增 `updateSelectedOption()` 方法
- 修改 `renderCalendar()` 為 `async`
- 修改 `createCalendarDay()` 為 `async`

---

## 🔮 已知問題與修復（v6.3.1）

### 1. 下拉選單初始化時序問題 ✅ 已修復
**問題：** 點擊主按鈕時，下拉選單偶爾不會展開

**根本原因：**
- 日曆頁面初始載入時為隱藏狀態（`display: none`）
- Constructor 中的 `setTimeout` 在頁面未顯示時執行，DOM 元素查詢失敗
- Router 切換到日曆視圖時才顯示，但此時事件未綁定

**解決方案：**
- 移除 Constructor 中的初始化邏輯
- 在 `renderCalendar()` 首次執行時才初始化選擇器
- 使用 `displayModeSelectorInitialized` 標記，確保只初始化一次
```javascript
async renderCalendar() {
    // 確保顯示模式選擇器已初始化（首次渲染時）
    if (!this.displayModeSelectorInitialized) {
        setTimeout(() => {
            this.initDisplayModeSelector();
        }, 50);
        this.displayModeSelectorInitialized = true;
    }
    // ...
}
```

**狀態：** ✅ 已修復（2026-01-11）

### 2. 下拉選單滾動優化 ✅ 已修復
**問題：** 下拉選單展開時，類別列表可能被卡住無法滾動

**根本原因：**
- `overflow: visible` 導致初始狀態無法正確隱藏
- `max-height: 600px` 過大，可能超出視窗範圍
- 缺少移動端滾動優化

**解決方案：**
- 初始狀態改為 `overflow: hidden`
- 展開時改為 `overflow-y: auto`
- 降低 `max-height` 至 `500px`（更合理的高度）
- 新增 iOS 平滑滾動：`-webkit-overflow-scrolling: touch`
- 新增滾動穿透防護：`overscroll-behavior: contain`
```css
.calendar-display-mode-dropdown {
    overflow: hidden; /* 初始狀態隱藏溢出 */
    max-height: 0;
}

.calendar-display-mode-dropdown.show {
    max-height: 500px; /* 設定固定最大高度，確保可滾動 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* iOS 平滑滾動 */
    overscroll-behavior: contain; /* 防止滾動穿透 */
}
```

**狀態：** ✅ 已修復（2026-01-11）

---

## 📊 統計資料

- **新增程式碼行數**：約 450+ 行（HTML + CSS + JS）
- **新增 CSS 選擇器**：20+ 個
- **新增 JavaScript 方法**：8 個
- **新增動畫**：5 個
- **開發時間**：約 2 小時

---

## 🎉 使用方式

1. **開啟日曆頁面**
2. **點擊「總花費」按鈕**，會彈出下拉選單
3. **選擇金額模式**：
   - 點擊「總花費」/「共花花費」/「寶花費用」/「步花費用」
   - 日曆會立即更新，顯示對應的金額
4. **選擇類別模式**：
   - 點擊「選擇類別」展開類別列表
   - 點擊任一類別（如「吃吃」）
   - 日曆會顯示該類別的圖示（如 🍴）

---

## 📝 版本資訊

- **版本號**：v6.3.0
- **發布日期**：2026-01-11
- **上一版本**：v6.2.0（趨勢分析 UI/UX 全面優化）
- **下一版本**：v6.3.1（預計修復下拉選單問題）

---

## 👥 開發人員

- **實作者**：Claude Sonnet 4.5
- **協作者**：使用者（需求定義與測試）

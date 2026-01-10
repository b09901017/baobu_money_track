# Version 6.3.3 - 日曆頁面滑動交互全面優化

**發布日期：** 2026-01-11

## 🎯 本次更新重點

全面優化日曆頁面的滑動交互體驗，修復左右滾動問題，實現智能手勢識別與滑卡動畫效果。

---

## 🐛 Bug 修復

### 1. 日曆頁面左右滾動問題

**問題描述**：
- 日曆頁面可以左右滾動，導致內容錯位
- 原因：CSS 中定義的 `.calendar-container` 在 HTML 中不存在

**解決方式**：
- 直接對 `#calendarView` 應用 `overflow-x: hidden !important`
- 為所有可能導致溢出的元素添加防護措施：
  - `.calendar-grid` - 日曆格子容器
  - `.calendar-mode-switcher` - 模式切換器
  - 月曆容器（inline style）

**修改檔案**：
- `css/components/calendar.css` - 新增 `#calendarView` 樣式規則
- `index.html` - 月曆容器改為 `overflow-y: visible; overflow-x: hidden; max-width: 100%`

---

## ✨ 功能改進

### 1. 智能手勢識別（防止上下滑誤觸）

**問題描述**：
- 上下滾動清單時，容易被誤判為左右滑動而切換日期
- 影響正常閱讀體驗

**優化方案**：

**新增滑動判斷邏輯**：
```javascript
// 記錄觸碰起點與終點（X 和 Y 軸）
this.touchStartX, this.touchStartY
this.touchEndX, this.touchEndY
this.touchStartTime

// 判斷條件（三重驗證）
const isHorizontalSwipe =
    Math.abs(diffX) > 60 &&                      // 1. 水平距離 > 60px
    Math.abs(diffX) > Math.abs(diffY) * 1.5 &&   // 2. 水平距離 > 垂直距離的 1.5 倍
    swipeTime < 500;                             // 3. 滑動時間 < 500ms（快速滑動）
```

**效果**：
- ✅ 只有明確的水平滑動才會觸發日期切換
- ✅ 上下滾動時不會誤觸切換
- ✅ 提升滾動閱讀體驗

**修改檔案**：
- `js/pages/CalendarPage.js` - `handleSwipe()` 重寫

---

### 2. 清單區域滑卡動畫（交友軟體風格）

**功能說明**：
- 在下方交易清單區域左右滑動時，播放滑卡動畫
- 類似 Tinder 的滑卡效果，增加趣味性與互動性

**技術實現**：

**1. CSS 動畫定義**（4 種動畫）：
```css
/* 向左滑出（下一天） */
.swipe-left-out {
    animation: swipeLeftOut 0.35s forwards;
    transform: translateX(-120%) scale(0.8);
}

/* 向右滑出（前一天） */
.swipe-right-out {
    animation: swipeRightOut 0.35s forwards;
    transform: translateX(120%) scale(0.8);
}

/* 從左側滑入 */
.swipe-in-from-left {
    animation: swipeInFromLeft 0.35s forwards;
}

/* 從右側滑入 */
.swipe-in-from-right {
    animation: swipeInFromRight 0.35s forwards;
}
```

**2. 動畫播放流程**：
```javascript
async showDayTransactionsWithSwipeAnimation(dateStr, delta) {
    // 1. 播放滑出動畫（350ms）
    container.classList.add(delta > 0 ? 'swipe-left-out' : 'swipe-right-out');
    await new Promise(resolve => setTimeout(resolve, 350));

    // 2. 更新內容（隱藏狀態）
    container.innerHTML = html;
    container.className = ''; // 清除動畫 class

    // 3. 從相反方向滑入（350ms）
    container.classList.add(delta > 0 ? 'swipe-in-from-right' : 'swipe-in-from-left');
    await new Promise(resolve => setTimeout(resolve, 350));
    container.className = ''; // 清除動畫 class
}
```

**效果**：
- ✅ 向左滑 → 卡片向左飛出 + 縮小 → 新卡片從右邊滑入
- ✅ 向右滑 → 卡片向右飛出 + 縮小 → 新卡片從左邊滑入
- ✅ 帶有 scale 縮放效果，更有層次感

**修改檔案**：
- `css/components/calendar.css` - 新增滑卡動畫 keyframes
- `js/pages/CalendarPage.js` - 新增 `showDayTransactionsWithSwipeAnimation()`

---

### 3. 雙區域滑動模式（日曆 vs 清單）

**設計理念**：
- **日曆區域滑動** = 快速切換（無動畫，立即響應）
- **清單區域滑動** = 滑卡動畫（有趣且直觀）

**技術實現**：

**1. 分別綁定兩個區域的滑動事件**：
```javascript
// 日曆區域（calendarGrid）
calendarGrid.addEventListener('touchstart', (e) => {
    this.swipeSource = 'calendar';  // 標記來源
});

// 清單區域（dayTransactions）
dayTransactions.addEventListener('touchstart', (e) => {
    this.swipeSource = 'list';  // 標記來源
});
```

**2. 根據來源決定行為**：
```javascript
if (source === 'list') {
    await this.showDayTransactionsWithSwipeAnimation(newDateStr, delta);  // 播放動畫
} else {
    await this.showDayTransactions(newDateStr);  // 直接切換
}
```

**效果**：
- ✅ 在日曆格子滑動 → 日期直接切換（快）
- ✅ 在清單區域滑動 → 播放滑卡動畫（炫）
- ✅ 雙重交互模式，適應不同使用場景

**修改檔案**：
- `js/pages/CalendarPage.js` - `initSwipeGesture()` 與 `changeSingleDay()`

---

### 4. 點擊日期後自動滾動

**功能說明**：
- 點選日曆日期後，頁面自動向下滾動
- 讓交易清單「滑上來」到舒適的閱讀位置

**技術實現**：

**1. 觸發時機**：
```javascript
async selectCalendarDay(dateStr, cell) {
    await this.showDayTransactions(dateStr);

    // 點擊日期後自動向下滾動
    setTimeout(() => {
        this.scrollToTransactionsList();
    }, 100);
}
```

**2. 滾動邏輯**（修正版）：
```javascript
scrollToTransactionsList() {
    // 使用 requestAnimationFrame 確保 DOM 已更新
    requestAnimationFrame(() => {
        const currentScrollTop = mainContent.scrollTop;
        const detailsOffsetTop = detailsRect.top - contentRect.top + currentScrollTop;
        const targetOffset = 80; // 距離頂部 80px
        const scrollDistance = detailsOffsetTop - targetOffset;

        mainContent.scrollTo({
            top: Math.max(0, scrollDistance),  // 確保不會滾動到負值
            behavior: 'smooth'
        });
    });
}
```

**效果**：
- ✅ 點擊日期 → 平滑滾動到清單
- ✅ 自動聚焦，引導使用者視線
- ✅ 清單距離頂部 80px，舒適的閱讀位置

**修改檔案**：
- `js/pages/CalendarPage.js` - `scrollToTransactionsList()` 優化

---

## 🎨 設計亮點

### 雙重交互模式
- **日曆區域** = 快速切換（無動畫，效率優先）
- **清單區域** = 滑卡動畫（趣味性，體驗優先）

### 智能手勢識別
- 水平距離必須 > 垂直距離 1.5 倍
- 避免上下滾動時誤觸
- 滑動時間限制 500ms 內（快速滑動）

### 平滑體驗
- 所有動畫使用 `cubic-bezier(0.4, 0, 0.2, 1)` 緩動
- 350ms 動畫時長（不會太快也不會太慢）
- 點擊日期後自動滾動，引導使用者視線

---

## 📁 修改檔案清單

1. ✅ `css/components/calendar.css` - 修正左右滾動、新增滑卡動畫
2. ✅ `index.html` - 修正月曆容器 overflow 設定
3. ✅ `js/pages/CalendarPage.js` - 手勢識別、滑卡動畫、自動滾動

**程式碼統計**：
- 新增 CSS 動畫：68 行（4 個 @keyframes）
- 新增 JS 方法：1 個（`showDayTransactionsWithSwipeAnimation`）
- 優化 JS 方法：3 個（`initSwipeGesture`, `handleSwipe`, `scrollToTransactionsList`）

---

## 🔍 測試建議

1. **左右滾動測試**：
   - 進入日曆頁面
   - 嘗試左右滑動頁面
   - 確認頁面不會左右滾動

2. **手勢識別測試**：
   - 在日曆格子區域上下滑動
   - 確認不會觸發日期切換
   - 在清單區域上下滑動
   - 確認不會觸發日期切換

3. **滑卡動畫測試**：
   - 選擇一個日期
   - 在下方清單區域左右滑動
   - 確認播放滑卡動畫（卡片飛出 + 新卡片滑入）

4. **雙區域模式測試**：
   - 在日曆格子區域左右滑動
   - 確認日期直接切換（無動畫）
   - 在清單區域左右滑動
   - 確認播放滑卡動畫

5. **自動滾動測試**：
   - 點擊日曆日期
   - 確認頁面自動平滑滾動到清單區域
   - 確認清單距離頂部約 80px

---

## 💡 技術細節

### 滑動手勢判斷邏輯

**三重驗證機制**：
1. **距離驗證**：`Math.abs(diffX) > 60` - 水平滑動至少 60px
2. **方向驗證**：`Math.abs(diffX) > Math.abs(diffY) * 1.5` - 水平距離 > 垂直距離的 1.5 倍
3. **速度驗證**：`swipeTime < 500` - 滑動時間小於 500ms（快速滑動）

### 滑卡動畫參數

- **動畫時長**：350ms（快速但不急促）
- **滑出距離**：120%（完全移出視野）
- **縮放比例**：0.8（營造層次感）
- **緩動函數**：`cubic-bezier(0.4, 0, 0.2, 1)`（流暢自然）

### 自動滾動計算

```javascript
// 計算公式
scrollDistance = detailsOffsetTop - targetOffset

// detailsOffsetTop = 元素相對於容器頂部的距離
// targetOffset = 80px（目標距離頂部的間距）
```

---

## 🎯 未來擴展

1. **滑動手勢增強**：
   - 可考慮加入滑動距離提示（如：滑動 50% 時顯示箭頭）
   - 可加入觸覺反饋（haptic feedback）

2. **動畫效果擴展**：
   - 可加入更多滑卡動畫變化（如：旋轉、淡入淡出）
   - 可根據滑動速度調整動畫時長

3. **手勢識別優化**：
   - 可加入斜向滑動支援（如：左上、右下等 8 個方向）
   - 可根據用戶習慣動態調整閾值

---

**版本更新：** v6.3.2 → v6.3.3
**核心改進：** 滑動交互 + 手勢識別 + 滑卡動畫
**使用者體驗：** ⭐⭐⭐⭐⭐ 大幅提升！

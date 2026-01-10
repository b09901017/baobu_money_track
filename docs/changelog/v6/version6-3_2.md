# Version 6.3.2 - 日曆顯示模式選擇器優化

**發布日期：** 2026-01-11

## 🎯 本次更新重點

修正日曆顯示模式選擇器的 UI/UX 問題，並改為動態生成類別選項，實現統一配置管理。

---

## 🐛 Bug 修復

### 1. 下拉選單被裁切問題

**問題描述**：
- 顯示模式下拉選單展開時，類別列表被父容器裁切，無法看到完整內容

**解決方式**：
- 月曆容器加上 `overflow: visible` 樣式
- 為選擇器增加底部邊距（16px），避免與日曆重疊

**修改檔案**：
- `index.html` - 月曆容器新增 `style="overflow: visible;"`
- `css/components/calendar.css` - `.calendar-display-mode-selector` 新增 `margin-bottom: 16px`

### 2. 移除重複的「共花花費」選項

**問題描述**：
- 「總花費」和「共花花費」邏輯相同，造成混淆

**解決方式**：
- 移除 HTML 中的「共花花費」選項
- 移除 CalendarPage.js 中 `shared` 模式的邏輯
- 更新 `displayMode` 註解，僅保留 `total` | `baobao` | `bubu`

**修改檔案**：
- `index.html` - 移除「共花花費」按鈕
- `js/pages/CalendarPage.js` - 移除 `shared` 模式相關程式碼

### 3. 類別列表滾動問題

**問題描述**：
- 類別列表只顯示 9 個選項，無法滾動查看更多類別（實際有 22 個）

**解決方式**：
- 增加整個下拉選單高度：`max-height: 500px` → `700px`
- 增加類別列表高度：`max-height: 400px` → `600px`
- 新增 `overflow-y: auto` 允許垂直滾動
- 新增 `-webkit-overflow-scrolling: touch` 支援 iOS 平滑滾動

**修改檔案**：
- `css/components/calendar.css` - 更新 `.calendar-display-mode-dropdown.show` 和 `.category-list.show`

---

## ✨ 功能改進

### 動態生成類別選項

**改進目標**：
- 讓類別選項自動同步 `TransactionRenderer.CATEGORY_ICONS` 的配置
- 當新增類別時，日曆選擇器會自動顯示新類別
- 統一管理所有類別配置，避免重複維護

**技術實現**：

1. **統一類別配置來源**
   - 將 `TransactionRenderer.js` 的 `CATEGORY_ICONS` 匯出為公開常數
   ```javascript
   // 原本：const CATEGORY_ICONS = { ... }
   // 修改後：export const CATEGORY_ICONS = { ... }
   ```

2. **CalendarPage 引用統一配置**
   - 匯入 `CATEGORY_ICONS` 從 `TransactionRenderer`
   - 移除本地重複的類別圖示定義（節省 30 行程式碼）
   - 新增 `renderCategoryOptions()` 方法動態生成類別選項
   ```javascript
   import { TransactionRenderer, CATEGORY_ICONS } from '../components/TransactionRenderer.js';
   this.categoryIcons = CATEGORY_ICONS;
   ```

3. **使用事件委派處理動態元素**
   - 改用 `dropdown.addEventListener('click', ...)` 監聽整個下拉選單
   - 使用 `e.target.closest('.dropdown-option[data-mode]')` 找到被點擊的選項
   - 支援動態生成的類別按鈕點擊事件

4. **HTML 簡化為容器**
   - 移除所有寫死的類別按鈕（47 行）
   - 改為空容器等待動態生成
   ```html
   <div id="categoryList" class="category-list">
       <!-- 類別選項將由 CalendarPage.js 動態生成 -->
   </div>
   ```

**效果**：
- ✅ 所有 22 個類別自動顯示
- ✅ 新增類別時自動同步更新
- ✅ 統一管理，只需在 `TransactionRenderer.js` 一處修改
- ✅ 程式碼更簡潔，HTML 和 JS 都更乾淨

---

## 📁 修改檔案清單

1. ✅ `css/components/calendar.css` - 修正 overflow 與滾動問題
2. ✅ `index.html` - 移除「共花花費」、移除硬編碼類別按鈕、修正容器 overflow
3. ✅ `js/components/TransactionRenderer.js` - 匯出 `CATEGORY_ICONS`
4. ✅ `js/pages/CalendarPage.js` - 動態生成類別選項、移除 `shared` 模式

---

## 💡 未來擴展

如果需要新增類別，只需：
1. 在 `js/components/TransactionRenderer.js` 的 `CATEGORY_ICONS` 中新增一項
2. 對應更新 `CATEGORY_COLORS` 和 `TIMELINE_COLORS`（如需要）
3. 在 `index.html` 的新增交易表單中加入對應按鈕（如需要）

日曆頁面會自動讀取並顯示新類別！🎊

---

## 🔍 測試建議

1. 前往日曆頁面
2. 點擊顯示模式選擇器
3. 確認下拉選單不被裁切
4. 點擊「選擇類別」展開
5. 向下滾動確認能看到所有 22 個類別
6. 選擇不同類別，確認日曆正確顯示該類別的交易

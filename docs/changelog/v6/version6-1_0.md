# v6.1.0 - 智能階層式折疊與三階段切換

**發布日期：** 2026-01-11
**版本類型：** 功能更新（Feature Update）

---

## 🎯 版本摘要

實作智能階層式折疊系統與三階段展開切換，大幅提升時間軸使用體驗。使用者可根據需求快速切換不同的展開層級，預設模式下自動折疊歷史記錄，僅展開最近兩天的花費對話。

**核心亮點：**
- ✨ 智能折疊：預設展開今天與昨天，其他自動摘要
- 🎯 三階段切換：預設 → 半開(3個月) → 全開(半年)
- 🎀 童話泡泡提示：可愛的模式切換回饋
- 🔄 直觀圖示：○ / ◇ / ◆ 清楚表達展開程度

---

## ✨ 主要功能

### 1. **智能階層式折疊**

實作基於時間距離的智能折疊規則：

**預設展開邏輯：**
- **今天和昨天**：展開到花費對話（可看到完整交易記錄）
- **當週其他天**：顯示當天摘要卡片（收合）
- **當月其他週**：顯示當週摘要卡片（收合）
- **當年其他月**：顯示當月摘要卡片（收合）
- **其他年份**：顯示年摘要卡片（收合）

**設計理念：**
- 優先顯示最相關的資訊（近期交易）
- 自動隱藏歷史記錄，避免頁面過長
- 保持清晰的時間軸結構（年 > 月 > 週 > 日）

### 2. **三階段展開切換**

點擊時間軸頂部的切換按鈕，循環切換三個展開模式：

| 模式 | 圖示 | 展開範圍 | 顏色 | 泡泡提示 |
|------|------|---------|------|---------|
| **預設** | ○ | 今天+昨天 | 粉色 🌸 | ✨ 展開兩天 |
| **半開** | ◇ | 最近3個月 | 橙色 🍊 | 🌟 展開3個月 |
| **全開** | ◆ | 最近半年 | 綠色 🍃 | 💫 展開半年 |

**切換循環：**
```
預設模式 → 半開模式 → 全開模式 → 預設模式 → ...
```

**使用場景：**
- **預設模式**：日常查看，專注最近記錄
- **半開模式**：回顧本季開銷，準備季度總結
- **全開模式**：查看半年趨勢，年中檢視

### 3. **童話風格泡泡提示**

每次切換模式時，按鈕右側飄出可愛的泡泡提示：

**視覺特色：**
- 🎨 馬卡龍粉色漸層背景
- 🎀 左側小三角形指向按鈕
- 🌸 果凍彈跳進入動畫
- 💫 柔和飄浮循環效果
- ⏱️ 顯示2秒後自動淡出

**提示內容：**
- 預設：`✨ 展開兩天`
- 半開：`🌟 展開3個月`
- 全開：`💫 展開半年`

### 4. **直觀圖示符號**

改用簡單明確的 Unicode 符號，不依賴外部圖示庫：

**圖示演變：**
- ○ (空心圓) → 最小展開
- ◇ (空心菱形) → 中等展開
- ◆ (實心菱形) → 最大展開

**設計優勢：**
- 無需載入 Material Icons
- 清楚表達「展開程度」的視覺差異
- 符合童話風格的圓潤美感

---

## 🔧 技術實現

### 核心檔案修改

#### 1. **TimelineView.js** - 時間軸視圖組件
```javascript
// 新增三階段展開模式狀態
this.expansionMode = 'default'; // 'default' | 'half' | 'full'

// 智能折疊初始化（只展開今天和昨天）
initializeDefaultExpansion(transactions) {
    const today = this.formatDate(now);
    const yesterday = this.formatDate(new Date(now - 24*60*60*1000));

    this.expandedDays.add(today);
    this.expandedDays.add(yesterday);
    // 其他日期自動收合顯示摘要
}

// 三階段切換方法
toggleAllExpansion() {
    if (this.expansionMode === 'default') {
        this.setExpansionMode('half'); // 展開3個月
    } else if (this.expansionMode === 'half') {
        this.setExpansionMode('full'); // 展開6個月
    } else {
        this.setExpansionMode('default'); // 回到預設
    }
    return this.expansionMode;
}

// 展開指定月份範圍
expandRecentMonths(monthsCount, currentYear, currentMonth) {
    // 計算需要展開的月份（處理跨年）
    // 遍歷階層快取，展開對應的年/月/週/日
}
```

#### 2. **app.js** - 應用主控制器
```javascript
// 更新切換按鈕圖示
updateToggleButtonIcon(button, mode) {
    const icon = button.querySelector('.timeline-icon-text');

    if (mode === 'default') {
        icon.textContent = '○';
        button.classList.add('mode-default');
        bubbleText = '✨ 展開兩天';
    } else if (mode === 'half') {
        icon.textContent = '◇';
        button.classList.add('mode-half');
        bubbleText = '🌟 展開3個月';
    } else if (mode === 'full') {
        icon.textContent = '◆';
        button.classList.add('mode-full');
        bubbleText = '💫 展開半年';
    }

    this.showModeBubble(button, bubbleText);
}

// 顯示童話泡泡提示
showModeBubble(button, text) {
    const bubble = document.createElement('div');
    bubble.className = 'mode-bubble';
    bubble.textContent = text;

    // 定位在按鈕右側
    const rect = button.getBoundingClientRect();
    bubble.style.left = `${rect.right + 12}px`;
    bubble.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add('show'));

    // 2秒後淡出移除
    setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => bubble.remove(), 300);
    }, 2000);
}
```

#### 3. **transaction-list.css** - 樣式檔案
```css
/* 自定義圖示文字 */
.timeline-icon-text {
    font-size: 1.1rem;
    font-weight: bold;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 三階段模式視覺樣式 */
.timeline-toggle-btn.mode-default {
    background: linear-gradient(135deg, #FFF5F0, white);
    border-color: var(--macaron-pink);
}

.timeline-toggle-btn.mode-half {
    background: linear-gradient(135deg, #FFF8E1, #FFFAEB);
    border-color: var(--macaron-orange);
}

.timeline-toggle-btn.mode-full {
    background: linear-gradient(135deg, #E8F5E9, #F1F8F4);
    border-color: var(--macaron-green);
}

/* 童話泡泡提示 */
.mode-bubble {
    position: fixed;
    background: linear-gradient(135deg, #FFFAF5 0%, #FFF0E5 100%);
    border: 2px solid var(--macaron-pink);
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(255, 158, 199, 0.3);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 小三角形指向按鈕 */
.mode-bubble::before,
.mode-bubble::after {
    content: '';
    position: absolute;
    border-style: solid;
    /* 雙層三角形營造立體感 */
}

/* 泡泡飄浮動畫 */
@keyframes bubbleFloat {
    0%, 100% { transform: translateY(-50%) scale(1); }
    50% { transform: translateY(-50%) scale(1.02); }
}
```

#### 4. **index.html** - HTML 結構
```html
<!-- 切換按鈕 -->
<button id="btnToggleAllDates" class="timeline-toggle-btn mode-default" title="預設模式">
    <span class="timeline-icon-text">○</span>
</button>
```

### 關鍵技術亮點

1. **跨年月份計算**
   ```javascript
   // 處理從1月往前推3個月到去年10月的情況
   while (month <= 0) {
       month += 12;
       year -= 1;
   }
   ```

2. **階層快取重用**
   - 利用已生成的 `hierarchyCache` 避免重複計算
   - 展開邏輯統一在 `expandRecentMonths()` 方法

3. **動態泡泡定位**
   ```javascript
   const rect = button.getBoundingClientRect();
   bubble.style.left = `${rect.right + 12}px`;
   bubble.style.top = `${rect.top + rect.height / 2}px`;
   ```

4. **自動清理機制**
   - 2秒後移除泡泡 DOM 元素，避免記憶體洩漏
   - 切換模式前先移除舊泡泡，避免重疊

---

## 📝 修改檔案清單

| 檔案 | 類型 | 說明 |
|------|------|------|
| `js/components/TimelineView.js` | 修改 | 新增智能折疊與三階段切換邏輯 |
| `js/app.js` | 修改 | 更新按鈕圖示與泡泡提示方法 |
| `index.html` | 修改 | 切換按鈕改用自定義圖示 |
| `css/components/transaction-list.css` | 修改 | 新增三階段樣式與泡泡提示 CSS |

**程式碼統計：**
- 新增程式碼：約 150 行
- 修改程式碼：約 30 行
- CSS 新增：約 80 行

---

## 🎨 使用者體驗改進

### 視覺回饋

**顏色語言：**
- 粉色：溫柔、最近、專注
- 橙色：活力、季度、回顧
- 綠色：完整、半年、全局

**動畫節奏：**
- 按鈕切換：0.3s（快速反應）
- 泡泡彈出：0.3s cubic-bezier (果凍彈跳)
- 泡泡飄浮：2s ease-in-out（柔和循環）

### 操作流程優化

**之前的問題：**
- 時間軸預設全部展開，頁面很長
- 查看歷史記錄需要大量滾動
- 沒有快速切換展開範圍的方法

**現在的改進：**
- 預設只展開兩天，頁面簡潔
- 需要時一鍵展開3個月或半年
- 清楚的視覺回饋（圖示+顏色+泡泡）

---

## 🐛 已知問題

**無明顯 Bug**，功能運作正常。

---

## 🚀 下一步計劃

### 可能的優化方向

1. **記憶展開模式**
   - 使用 localStorage 記住使用者選擇
   - 下次開啟自動載入上次模式

2. **自定義月份範圍**
   - 允許使用者自訂半開/全開的月份數
   - 設定頁面新增偏好選項

3. **快捷鍵支援**
   - 鍵盤 `Space` 切換展開模式
   - `1`/`2`/`3` 直接跳到對應模式

4. **手勢支援**
   - 雙指縮放控制展開程度
   - 左右滑動切換模式

---

## 📚 相關文檔

- [CLAUDE.md](../../../CLAUDE.md) - 專案開發指南
- [DESIGN.md](../../../DESIGN.md) - 童話風格設計規範
- [TimelineView.js](../../../js/components/TimelineView.js) - 時間軸視圖組件

---

## 💡 開發筆記

### 設計決策

**為什麼選擇○/◇/◆符號？**
1. 視覺層級清晰：空心→半實心→實心
2. Unicode 原生支援，無需載入字體
3. 符合童話風格的圓潤美感

**為什麼是2天/3個月/6個月？**
1. 2天：涵蓋今天+昨天，最常查看
2. 3個月：一個季度，適合季度回顧
3. 6個月：半年，適合中長期分析

**為什麼泡泡提示只顯示2秒？**
1. 足夠使用者看清提示內容
2. 不會長期遮擋其他元素
3. 符合一般 Toast 提示的時長慣例

### 開發挑戰

**跨年月份計算**
- 初版使用簡單的 `month - i` 導致負數
- 改用 `while` 迴圈處理月份歸零，正確處理跨年

**泡泡定位**
- 使用 `fixed` 定位需要計算 `getBoundingClientRect()`
- 確保按鈕位置變化時泡泡也正確定位

**動畫衝突**
- 泡泡的 `.show` 類別同時定義了 `transition` 和 `animation`
- 分離為兩個屬性避免衝突

---

**版本維護者：** Claude Sonnet 4.5
**完成日期：** 2026-01-11

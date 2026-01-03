---
name: frontend
description: 前端開發技能 - 使用 HTML/CSS/JavaScript 建立使用者介面。當需要開發網頁、建立 UI、實作互動功能時使用。目前使用 Mock Data,預留 Firebase 串接點。
---

# 前端開發技能 (Frontend Developer Skill)

你是**前端工程師**,使用純 HTML/CSS/JavaScript 建立精美的介面。

## 核心原則

### 1. 使用 Mock Data
目前所有資料都用假資料,不串接後端:
```javascript
// ✅ 現在這樣做
import { mockExpenses } from './mock-data.js';
const expenses = mockExpenses;

// ⏰ 之後再改成
// const expenses = await firebase.getExpenses();
```

### 2. 預留串接點
在需要後端的地方加上註解:
```javascript
// TODO: Firebase - 新增記帳
const addExpense = async (expense) => {
  // 目前加到 localStorage 或記憶體
  expenses.push(expense);
  
  // 之後改成:
  // await firebase.addExpense(expense);
};
```

### 3. 童話風格
遵循可愛、溫馨的設計:
- 粉色系配色
- 圓潤的邊角
- 柔和的動畫
- 友善的提示

## 開發規範

### HTML
```html
<!-- ✅ 語意化、乾淨 -->
<article class="expense-card" data-id="exp_001">
  <div class="expense-card__icon">🍜</div>
  <div class="expense-card__content">
    <h3 class="expense-card__title">午餐</h3>
    <p class="expense-card__amount">$150</p>
  </div>
  <button class="expense-card__delete" aria-label="刪除">×</button>
</article>
```

### CSS
```css
/* ✅ 使用 CSS Variables,BEM 命名 */
.expense-card {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.expense-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### JavaScript
```javascript
// ✅ ES6+, 模組化, 清楚命名
const renderExpenseCard = (expense) => {
  const card = document.createElement('article');
  card.className = 'expense-card';
  card.dataset.id = expense.id;
  card.innerHTML = `
    <div class="expense-card__icon">${getCategoryIcon(expense.category)}</div>
    <div class="expense-card__content">
      <h3>${expense.item}</h3>
      <p>$${expense.amount}</p>
    </div>
  `;
  return card;
};
```

## 常用模式

### DOM 操作
```javascript
// 選取元素
const container = document.querySelector('[data-expense-list]');

// 建立元素
const createCard = (data) => {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `...`;
  return el;
};

// 插入元素
container.appendChild(createCard(data));
```

### 事件處理
```javascript
// 事件委託
container.addEventListener('click', (e) => {
  if (e.target.matches('.btn-delete')) {
    const id = e.target.closest('[data-id]').dataset.id;
    deleteExpense(id);
  }
});
```

### Mock Data 管理
```javascript
// src/js/mock-data.js
export const mockExpenses = [
  {
    id: 'exp_001',
    date: '2026-01-03',
    item: '午餐',
    amount: 150,
    payer: 'person_a',
    beneficiaries: { person_a: 75, person_b: 75 },
    category: '吃',
    tags: ['午餐']
  }
];

// src/js/services/data.js
import { mockExpenses } from '../mock-data.js';

export const getExpenses = () => {
  // TODO: Firebase - 之後改成真實 API
  return mockExpenses;
};

export const addExpense = (expense) => {
  // TODO: Firebase
  mockExpenses.push({ ...expense, id: Date.now() });
  return expense;
};
```

### 簡單狀態管理
```javascript
// src/js/state.js
let currentBook = 'book_daily';
let expenses = [];

export const state = {
  getCurrentBook: () => currentBook,
  setCurrentBook: (id) => { currentBook = id; },
  getExpenses: () => expenses,
  setExpenses: (data) => { expenses = data; }
};
```

## 頁面開發流程

### 1. 建立 HTML 結構
```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>情侶記帳 App</title>
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>
  <main class="container">
    <!-- 主要內容 -->
  </main>
  
  <!-- 底部浮動按鈕 -->
  <nav class="bottom-nav">
    <button class="nav-btn" data-page="books">📖</button>
    <button class="nav-btn nav-btn--active" data-page="expenses">💰</button>
    <button class="nav-btn" data-page="analysis">📊</button>
  </nav>
  
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

### 2. 撰寫樣式
```css
/* src/css/variables.css */
:root {
  --color-primary: #FF6B9D;
  --color-secondary: #98D8C8;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(255, 107, 157, 0.1);
}
```

### 3. 實作邏輯
```javascript
// src/js/app.js
import { getExpenses } from './services/data.js';
import { renderExpenseList } from './components/expense-list.js';

const init = () => {
  const expenses = getExpenses();
  renderExpenseList(expenses);
  setupEventListeners();
};

init();
```

## 童話風格元素

### 色彩
```css
:root {
  --fairy-pink: #FFB6C1;
  --fairy-mint: #B0E0E6;
  --fairy-lavender: #E6E6FA;
}
```

### 動畫
```css
.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 可愛元素
```javascript
// 分類圖示
const categoryIcons = {
  '吃': '🍜',
  '玩': '🎮',
  '行': '🚗',
  '住': '🏠'
};
```

## 注意事項

✅ **要做的:**
- 保持程式碼簡潔
- 使用語意化命名
- 加上適當註解
- 預留 Firebase 串接點
- 考慮手機版體驗

❌ **避免:**
- 不要用 jQuery
- 避免行內樣式
- 不要全域變數
- 不要忽略錯誤處理

## 測試重點

開發時確認:
- [ ] 手機版顯示正常
- [ ] 按鈕有 hover 效果
- [ ] 動畫流暢
- [ ] 空狀態顯示
- [ ] 錯誤提示清楚

---

**記住**: 先用 Mock Data 完成功能,預留 Firebase 串接點!

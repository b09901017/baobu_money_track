---
name: frontend
description: 前端開發技能 - 使用 HTML/CSS/JavaScript 建立使用者介面。當需要開發網頁、建立 UI、實作互動功能時使用。目前使用 Mock Data,預留 Firebase 串接點。
---

# 前端開發技能 (Frontend Developer Skill)

你是**前端工程師**,使用純 HTML/CSS/JavaScript 建立精美的介面。

## 核心原則

### 1. 維護模組化架構
專案已完成重構，使用清晰的模組化架構:
```javascript
// ✅ 目前架構
// Core: StateManager, Router, EventBinder
// Pages: HomePage, CalendarPage, NotebooksPage, AnalyticsPage
// Components: BalanceCard, TransactionForm, TimelineView, etc.
// Utils: dateUtils, domUtils

// 使用 DataManager 管理資料
window.DataManager.addTransaction(transactionData);
window.DataManager.getTransactions(notebookId);

// ⏰ 未來改成 Firebase
// await firebase.addTransaction(transactionData);
```

### 2. 遵循現有模式
在開發新功能或修改時:
- 了解現有架構（16 個 JS 模組 + 20 個 CSS 模組）
- 遵循相同的模組化模式
- 使用 DataManager 進行資料操作
- 透過 EventBinder 綁定事件
- 透過 StateManager 管理狀態

### 3. 預留 Firebase 串接點
在需要後端的地方已加上註解:
```javascript
// js/data.js - DataManager
class DataManager {
  addTransaction(transactionData) {
    // 目前使用 localStorage
    this.transactions.push(transactionData);
    this.saveToLocalStorage();

    // TODO: Firebase - 未來改成
    // await firebase.addTransaction(transactionData);
  }
}
```

### 4. 童話風格設計
遵循馬卡龍色系的童話風格:
- 馬卡龍粉彩色系（粉、紫、藍、綠、奶油）
- 金色系（古金、閃金）
- 圓潤的邊角（12px - 32px）
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

### DataManager 資料管理
```javascript
// js/data.js - 目前使用的資料管理系統
class DataManager {
  constructor() {
    this.currentUser = { id: 'user1', name: '寶寶' };
    this.partner = { id: 'user2', name: '步步' };
    this.currentNotebook = null;
    this.notebooks = [];
    this.transactions = [];
    this.customCategories = [];
  }

  // 從 localStorage 載入資料
  init() {
    const savedData = localStorage.getItem('coupleAppData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.notebooks = data.notebooks || [];
      this.transactions = data.transactions || [];
      this.currentNotebook = data.currentNotebook || null;
    }
  }

  // 取得交易記錄
  getTransactions(notebookId) {
    return this.transactions.filter(t => t.notebook_id === notebookId);
  }

  // 新增交易
  addTransaction(transactionData) {
    const transaction = { ...transactionData, id: Date.now().toString() };
    this.transactions.push(transaction);
    this.saveToLocalStorage();
    return transaction;
  }

  // 儲存到 localStorage
  saveToLocalStorage() {
    localStorage.setItem('coupleAppData', JSON.stringify({
      notebooks: this.notebooks,
      transactions: this.transactions,
      currentNotebook: this.currentNotebook,
      customCategories: this.customCategories
    }));
  }
}

// 全域使用
window.DataManager = new DataManager();
```

### 狀態管理系統
```javascript
// js/core/StateManager.js
class StateManager {
  constructor() {
    this.state = {
      currentPage: 'home',
      currentNotebook: null,
      viewMode: 'single',    // 'single' or 'range'
      selectedDate: new Date(),
      dateRange: { start: null, end: null }
    };
    this.listeners = {};
  }

  // 設定狀態並通知監聽者
  setState(updates) {
    Object.assign(this.state, updates);
    this.notifyListeners(Object.keys(updates));
  }

  // 取得狀態
  getState(key) {
    return key ? this.state[key] : this.state;
  }
}
```

## 修改現有功能流程

### 1. 了解現有架構
```javascript
// js/app.js - 主控制器（126 行）
import StateManager from './core/StateManager.js';
import Router from './core/Router.js';
import EventBinder from './core/EventBinder.js';

import HomePage from './pages/HomePage.js';
import CalendarPage from './pages/CalendarPage.js';
import NotebooksPage from './pages/NotebooksPage.js';
import AnalyticsPage from './pages/AnalyticsPage.js';

// 初始化
const stateManager = new StateManager();
const router = new Router(stateManager);
const eventBinder = new EventBinder(stateManager, router);

// 註冊頁面
router.registerPage('home', HomePage);
router.registerPage('calendar', CalendarPage);
router.registerPage('notebooks', NotebooksPage);
router.registerPage('analytics', AnalyticsPage);
```

### 2. 修改或新增頁面
```javascript
// js/pages/HomePage.js - 頁面範例
export default class HomePage {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  render() {
    const container = document.getElementById('main-content');

    // 使用 DataManager 取得資料
    const currentNotebook = window.DataManager.currentNotebook;
    const transactions = window.DataManager.getTransactions(currentNotebook);

    // 渲染頁面
    container.innerHTML = `
      <div class="home-page">
        <!-- 頁面內容 -->
      </div>
    `;
  }
}
```

### 3. 使用現有 CSS 變數
```css
/* css/base/variables.css - 馬卡龍色系 */
:root {
  /* 馬卡龍色系 */
  --macaron-pink: #FFDFD3;
  --macaron-rose: #E2C2C6;
  --macaron-blue: #C4E0E5;
  --macaron-green: #D4E6B5;
  --macaron-purple: #E6CEE3;
  --macaron-cream: #FFF9EE;

  /* 金色系 */
  --antique-gold: #D4AF37;
  --shimmer-gold: #F9E59E;

  /* 間距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 4. 透過 EventBinder 綁定事件
```javascript
// js/core/EventBinder.js - 事件管理
class EventBinder {
  bindFabClick() {
    const fab = document.getElementById('fab');
    fab?.addEventListener('click', () => {
      // 打開新增交易表單
      TransactionForm.show();
    });
  }

  bindNavigationClick() {
    document.querySelectorAll('.bottom-nav__item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.router.navigateTo(page);
      });
    });
  }
}
```

## 童話風格元素

### 色彩（馬卡龍色系）
```css
:root {
  /* 馬卡龍色系 - 主要色彩 */
  --macaron-pink: #FFDFD3;     /* 粉色 */
  --macaron-rose: #E2C2C6;     /* 玫瑰 */
  --macaron-blue: #C4E0E5;     /* 天藍 */
  --macaron-green: #D4E6B5;    /* 薄荷綠 */
  --macaron-purple: #E6CEE3;   /* 薰衣草 */
  --macaron-cream: #FFF9EE;    /* 奶油 */

  /* 金色系 - 強調色 */
  --antique-gold: #D4AF37;     /* 古金 */
  --shimmer-gold: #F9E59E;     /* 閃金 */

  /* 中性色 */
  --warm-brown: #8D7B68;       /* 溫暖棕 */
  --soft-ink: #5D576B;         /* 柔墨 */
  --paper: #FFFDF7;            /* 紙張 */
  --parchment: #F2E8D5;        /* 羊皮紙 */
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
- 遵循現有模組化架構
- 使用 DataManager 進行資料操作
- 透過 StateManager 管理狀態
- 透過 EventBinder 綁定事件
- 保持程式碼簡潔清晰
- 使用語意化命名
- 加上適當註解
- 考慮手機版體驗（響應式設計）
- 維持童話風格一致性（馬卡龍色系）

❌ **避免:**
- 不要破壞現有架構
- 不要直接操作 localStorage（使用 DataManager）
- 不要使用 jQuery 或其他框架
- 避免行內樣式
- 不要使用全域變數（除了 window.DataManager）
- 不要忽略錯誤處理
- 不要忘記 Firebase 預留接口

## 測試重點

開發或修改時確認:
- [ ] 手機版顯示正常
- [ ] 所有互動有視覺回饋（hover、active）
- [ ] 動畫流暢不卡頓
- [ ] 空狀態顯示清楚
- [ ] 錯誤提示友善
- [ ] 資料正確儲存到 localStorage
- [ ] 頁面切換正常
- [ ] 不同帳本切換正常

---

**記住**:
- 專案已完成模組化重構，遵循現有架構！
- 使用 DataManager 管理資料，已預留 Firebase 串接點！
- 保持童話風格一致性（馬卡龍色系）！

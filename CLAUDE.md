# 情侶記帳 App - Couple Expense Tracker

## 專案簡介
一個童話風格的情侶共同記帳應用,支援多帳本管理、彈性付款記錄、智能結算功能。

## 專案目標
- 幫助情侶輕鬆記錄共同開銷
- 自動計算誰欠誰多少錢
- 提供溫馨可愛的使用體驗
- 支援多個獨立帳本(日常、旅遊等)

## 開發策略

### 🎯 當前階段: 前端優先開發
1. **先用假資料完成所有前端功能**
   - 使用 Mock Data 模擬資料
   - 在程式碼中預留 Firebase 串接點
   - 確保 UI/UX 完整可用

2. **後續再串接 Firebase**
   - 替換 Mock Data 為真實 Firebase 呼叫
   - 不需要大幅修改邏輯
   - 平滑過渡到後端整合

### 📱 頁面構想 (初步,可調整)
- **底部三個浮動按鈕**: 📖 帳本總覽 | 💰 記帳 | 📊 分析
- **預設顯示**: 日常記帳頁面
- **可切換帳本**: 在不同帳本間切換
- **記帳功能**: 記錄誰付、幫誰付、金額、標籤、照片
- **分析功能**: 欠款狀態、日期分布、分類統計

> 💡 **注意**: 頁面設計保持彈性,細節會在對話中逐步調整和優化

## 技術棧

### 前端
- **核心**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **無框架**: 純原生 JS,輕量快速
- **樣式**: CSS3 + CSS Variables (童話風格)
- **模組化**: ES6 Modules

### 後端 (之後整合)
- **BaaS**: Firebase
  - Firestore (資料庫)
  - Storage (圖片儲存)
  - Hosting (部署)

## 專案結構

```
couple-expense-tracker/
├── docs/                    # 📄 專案文件 (可選)
│   ├── PRD.md              # 產品需求
│   ├── mock-data.md        # 假資料結構
│   └── pages-structure.md  # 頁面架構
│
├── src/
│   ├── index.html          # 主頁面
│   │
│   ├── css/
│   │   ├── variables.css   # CSS 變數 (設計系統)
│   │   ├── global.css      # 全域樣式
│   │   └── components.css  # 組件樣式
│   │
│   ├── js/
│   │   ├── app.js          # 主程式
│   │   ├── mock-data.js    # 假資料 (目前使用)
│   │   ├── components/     # UI 組件
│   │   ├── utils/          # 工具函數
│   │   │   └── calculator.js  # 結算計算
│   │   └── services/       # 服務層 (預留 Firebase)
│   │       └── data.js     # 資料操作 (目前用 mock)
│   │
│   └── assets/
│       ├── images/
│       └── icons/
│
└── firebase/               # Firebase 配置 (之後使用)
    └── firestore.rules
```

## 開發流程

### 1️⃣ 釐清需求 (可選)
使用 `/skill project-manager`:
- 整理功能需求
- 定義 Mock Data 結構
- 規劃頁面架構

### 2️⃣ 前端開發 ⭐ (當前重點)
使用 `/skill frontend`:
- 建立 HTML 頁面
- 撰寫 CSS 樣式
- 實作 JavaScript 邏輯
- 使用 Mock Data

**預留 Firebase 串接點範例:**
```javascript
// src/js/services/data.js
// TODO: Firebase - 之後替換成真實 Firebase 呼叫

import { mockExpenses } from '../mock-data.js';

export const getExpenses = async (bookId) => {
  // 目前回傳假資料
  return mockExpenses.filter(e => e.bookId === bookId);
  
  // 之後改成:
  // return await firebase.getExpenses(bookId);
};
```

### 3️⃣ 設計調整 (隨時)
使用 `/skill designer`:
- 優化童話風格
- 調整色彩和動畫
- 改善使用者體驗

### 4️⃣ 後端整合 (之後)
使用 `/skill backend`:
- 設定 Firebase
- 替換 Mock Data
- 整合真實資料庫

## 程式碼規範

### JavaScript
- 使用 ES6+ 語法
- `const` > `let` > 避免 `var`
- 使用 arrow functions
- 命名規則:
  - 變數/函數: `camelCase`
  - Class: `PascalCase`
  - 常數: `UPPER_SNAKE_CASE`
  - 檔案: `kebab-case.js`

### HTML
- 語意化標籤
- `data-*` 屬性用於 JS 選取
- 無障礙屬性 (ARIA)

### CSS
- 使用 CSS Variables
- BEM 命名: `.block__element--modifier`
- Mobile-first 響應式
- Flexbox/Grid 優先

### Git Commit
- 格式: `<type>: <description>`
- Types: `feat`, `fix`, `style`, `refactor`, `docs`
- 範例: `feat: 新增記帳表單`

## 設計原則

### 童話風格
- 溫暖柔和的粉彩色系
- 圓潤可愛的設計元素
- 流暢的動畫效果
- 友善的互動提示

### 使用者體驗
- 操作簡單直覺
- 快速記帳 (3 步內完成)
- 清楚的視覺回饋
- 適當的空狀態提示

## 如何開始

### 推薦流程:

```bash
# 1. 整理需求 (可選)
/skill project-manager
請幫我整理頁面架構和功能需求

# 2. 開始開發前端
/skill frontend
請建立主頁面,包含底部三個浮動按鈕

# 3. 調整設計 (需要時)
/skill designer
請優化童話風格的色彩配置
```

## 當前開發重點

✅ **現在做:**
- [ ] 建立主頁面結構
- [ ] 實作底部浮動按鈕切換
- [ ] 建立記帳列表顯示
- [ ] 實作新增記帳功能
- [ ] 建立分析頁面
- [ ] 使用 Mock Data 模擬所有功能

⏰ **之後做:**
- [ ] Firebase 設定
- [ ] 串接真實資料庫
- [ ] 圖片上傳功能
- [ ] 部署上線

---

💡 **記住**: 
- 保持彈性,細節在對話中調整
- 先完成前端,預留後端介接點
- 一次專注一個功能
- 有問題隨時使用對應的 skill!

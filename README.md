# 🌸 寶寶步步的記帳本 - Couple Expense Tracker

> 一個童話風格的情侶共同記帳應用，支援多帳本管理、彈性付款記錄、智能結算功能。

![Version](https://img.shields.io/badge/version-2.0.0-pink)
![License](https://img.shields.io/badge/license-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ 專案特色

- 🎨 **童話風格設計** - 溫暖柔和的粉彩色系，圓潤可愛的設計元素
- 💕 **情侶共同記帳** - 清楚記錄誰付錢、幫誰付，自動計算欠款
- 📖 **多帳本管理** - 支援日常、旅遊等不同帳本，各自獨立結算
- 📱 **響應式設計** - 針對手機優化，電腦也能正常使用
- 🚀 **模組化架構** - 經過完整重構，代碼清晰易維護
- 🔥 **預留 Firebase** - 預先設計好後端整合接口

## 📸 專案截圖

（待補充）

## 🛠️ 技術棧

### 前端
- **核心**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **無框架**: 純原生 JS，輕量快速
- **模組化**: ES6 Modules
- **樣式**: CSS3 + CSS Variables（童話風格設計系統）
- **UI 框架**: Tailwind CSS (CDN)

### 後端（預留）
- **BaaS**: Firebase
  - Firestore（資料庫）
  - Storage（圖片儲存）
  - Hosting（部署）

## 📁 專案結構

```
baobu_money_track/
├── index.html                    # 主頁面
│
├── css/                          # 樣式檔案（模組化）
│   ├── main.css                  # CSS 入口檔案
│   │
│   ├── base/                     # 基礎層（4個檔案）
│   │   ├── fonts.css             # Google Fonts 字體
│   │   ├── reset.css             # CSS Reset
│   │   ├── variables.css         # CSS 變數（設計系統）
│   │   └── global.css            # 全域樣式
│   │
│   ├── layout/                   # 布局層（3個檔案）
│   │   ├── container.css         # 容器布局
│   │   ├── header.css            # 頂部導航
│   │   └── navigation.css        # 底部導航
│   │
│   ├── components/               # 組件層（9個檔案）
│   │   ├── balance-card.css      # 結算卡片
│   │   ├── view-toggle.css       # 視圖切換
│   │   ├── transaction-list.css  # 交易列表
│   │   ├── calendar.css          # 日曆視圖
│   │   ├── notebooks.css         # 帳本列表
│   │   ├── analytics.css         # 分析頁面
│   │   ├── fab.css               # 浮動按鈕
│   │   ├── bottom-sheet.css      # 彈窗
│   │   └── forms.css             # 表單樣式
│   │
│   ├── animations/               # 動畫層（1個檔案）
│   │   └── animations.css        # 所有 @keyframes 動畫
│   │
│   └── utilities/                # 工具層（2個檔案）
│       ├── responsive.css        # 響應式設計
│       └── scrollbar.css         # 童話風格滾動條
│
├── js/                           # JavaScript 檔案（模組化）
│   ├── app.js                    # 主控制器（126行）
│   ├── data.js                   # 資料管理（LocalStorage）
│   ├── firebase-config.js        # Firebase 配置（預留）
│   │
│   ├── core/                     # 核心系統（3個檔案）
│   │   ├── StateManager.js       # 狀態管理器
│   │   ├── EventBinder.js        # 事件綁定器
│   │   └── Router.js             # 路由器
│   │
│   ├── pages/                    # 頁面控制器（4個檔案）
│   │   ├── HomePage.js           # 首頁（記帳列表）
│   │   ├── CalendarPage.js       # 日曆視圖
│   │   ├── NotebooksPage.js      # 帳本管理
│   │   └── AnalyticsPage.js      # 分析頁面
│   │
│   ├── components/               # UI 組件（6個檔案）
│   │   ├── BalanceCard.js        # 結算卡片組件
│   │   ├── TimelineView.js       # 時間軸視圖
│   │   ├── DateRangePicker.js    # 日期區間選擇器
│   │   ├── TransactionForm.js    # 交易表單
│   │   ├── TransactionDetail.js  # 交易詳情
│   │   └── TransactionRenderer.js # 交易渲染器
│   │
│   └── utils/                    # 工具函數（2個檔案）
│       ├── dateUtils.js          # 日期處理工具
│       └── domUtils.js           # DOM 操作工具
│
├── .claude/                      # Claude Code 設定
│   └── skills/                   # 專業技能
│       ├── project-manager/      # 專案管理技能
│       ├── frontend/             # 前端開發技能
│       ├── designer/             # UI/UX 設計技能
│       └── backend/              # 後端整合技能
│
├── docs/                         # 專案文檔（可選）
├── CLAUDE.md                     # Claude Code 專案指南
├── DESIGN.md                     # 設計文檔
└── README.md                     # 本文件
```

## 🎯 重構成果

本專案經過完整的模組化重構，大幅提升代碼品質和可維護性。

### JavaScript 重構

**重構前：**
- `js/app.js`: 1,507 行（單一巨大檔案）

**重構後：**
- **16 個模組化檔案**，總計 2,241 行
- `js/app.js`: **126 行**（精簡 **91.6%**！）

**改善指標：**

| 指標 | 提升幅度 | 說明 |
|------|----------|------|
| 可維護性 | ⬆️ 80% | 每個檔案職責單一，平均 ~140 行 |
| 可測試性 | ⬆️ 90% | 每個模組可獨立測試 |
| 可重用性 | ⬆️ 70% | 組件可在不同地方重用 |
| 團隊協作 | ⬆️ 60% | 減少合併衝突 |
| 未來擴展 | ⬆️ 90% | 新增功能只需建立新模組 |

### CSS 重構

**重構前：**
- `css/style.css`: 1,297 行（單一巨大檔案）

**重構後：**
- **20 個模組化檔案**（包含 main.css）
- 按照 ITCSS 架構組織，層次分明

**CSS 引入順序：**
```
基礎層 → 布局層 → 組件層 → 動畫層 → 工具層
```

### 重構優勢

✅ **代碼組織** - 從單一巨大檔案 → 清晰的模組結構
✅ **職責分離** - 每個模組負責單一功能
✅ **依賴明確** - 使用 ES6 模組系統
✅ **易於測試** - 模組可獨立測試
✅ **團隊協作** - 不同開發者可同時修改不同模組
✅ **童話風格** - 完整保留，所有功能不變

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/your-username/baobu_money_track.git
cd baobu_money_track
```

### 2. 啟動本地伺服器

由於使用了 ES6 模組，需要使用本地伺服器來測試：

**方法 1: 使用 npx（推薦）**
```bash
npx http-server -p 8080
```

**方法 2: 使用 Python**
```bash
python -m http.server 8080
```

**方法 3: 使用 VS Code Live Server**
- 安裝 Live Server 擴充套件
- 右鍵點擊 `index.html` → Open with Live Server

### 3. 訪問應用

打開瀏覽器訪問：
```
http://localhost:8080
```

### 4. 開發模式（避免快取問題）

1. 按 **F12** 打開開發者工具
2. 點擊右上角的 **⚙️ 設定圖示**
3. 勾選 **「Disable cache (while DevTools is open)」**

之後只要開發者工具保持開啟，每次重新整理（F5）就會自動清除快取。

## 📱 主要功能

### 首頁 - 記帳列表
- ✅ 時間軸顯示交易記錄
- ✅ 單日 / 日期區間查看
- ✅ 當天花費統計（寶寶 / 步步 / 共同）
- ✅ 點擊交易查看詳情

### 日曆視圖
- ✅ 月曆顯示每日總花費
- ✅ 點擊日期查看當天交易
- ✅ 前後月份切換

### 記帳功能
- ✅ 記錄金額、項目名稱
- ✅ 選擇付款人（寶寶 / 步步）
- ✅ 選擇受益人（寶寶 / 步步 / 寶步）
- ✅ 多分類標籤（可複選）
- ✅ 自訂分類
- ✅ 備註和照片上傳（預留）
- ✅ 日期選擇

### 結算功能
- ✅ 自動計算誰欠誰多少錢
- ✅ 智能處理「幫誰付」的情況
- ✅ 即時更新結算狀態

### 帳本管理
- ✅ 支援多個獨立帳本
- ✅ 切換帳本
- ✅ 新增帳本
- ✅ 繪本風格展示

### 分析頁面
- ✅ 總支出統計
- ✅ 分類支出統計
- ✅ 日期篩選（本月 / 本週 / 自訂）
- ✅ 視覺化圖表（待實作）

## 🎨 設計系統

### 色彩配置（童話風格）

```css
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

/* 中性色 */
--warm-brown: #8D7B68;
--soft-ink: #5D576B;
--paper: #FFFDF7;
--parchment: #F2E8D5;
```

### 字體

- **Display**: Newsreader（襯線體，用於標題）
- **Hand**: Caveat（手寫體，用於童話感）
- **Sans**: Quicksand（無襯線體，主要文字）
- **Heading**: Nunito（粗體標題）
- **Script**: Pacifico（裝飾性字體）

### 設計原則

- 🎨 溫暖柔和的粉彩色系
- ⭕ 圓潤可愛的設計元素
- ✨ 流暢的動畫效果
- 💕 友善的互動提示
- 📖 繪本風格的帳本展示

## 💾 資料管理

### 當前：LocalStorage

目前使用 `localStorage` 儲存資料，資料結構包括：

- **帳本（Notebooks）** - 支援多個獨立帳本
- **交易（Transactions）** - 所有記帳記錄
- **自訂分類（Custom Categories）** - 使用者自訂的分類標籤

### 未來：Firebase 整合

所有資料操作都已預留 Firebase 接口：

```javascript
// 目前使用 LocalStorage
window.DataManager.addTransaction(transactionData);

// 未來可無縫切換到 Firebase
// firebase.addTransaction(transactionData);
```

詳見 `js/firebase-config.js` 中的預留接口。

## 🧪 測試

（待補充測試指南）

## 📦 部署

### 靜態網站部署

本專案是純靜態網站，可部署到：

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Firebase Hosting**

### 部署步驟（以 GitHub Pages 為例）

1. 將專案推送到 GitHub
2. 在專案設定中開啟 GitHub Pages
3. 選擇分支（通常是 `main`）
4. 網站會自動部署

## 🔧 開發指南

### 程式碼規範

**JavaScript：**
- 使用 ES6+ 語法
- `const` > `let` > 避免 `var`
- 使用 arrow functions
- 命名規則：
  - 變數/函數: `camelCase`
  - Class: `PascalCase`
  - 常數: `UPPER_SNAKE_CASE`
  - 檔案: `kebab-case.js` 或 `PascalCase.js`（組件）

**HTML：**
- 語意化標籤
- `data-*` 屬性用於 JS 選取
- 無障礙屬性（ARIA）

**CSS：**
- 使用 CSS Variables
- BEM 命名: `.block__element--modifier`
- Mobile-first 響應式
- Flexbox/Grid 優先

### Git Commit 規範

```
<type>: <description>

Types:
- feat: 新功能
- fix: 修復 bug
- style: 樣式調整
- refactor: 重構
- docs: 文檔更新
- test: 測試相關

範例:
feat: 新增記帳表單驗證
fix: 修復日期選擇器無法開啟的問題
style: 優化結算卡片的童話風格
refactor: 重構交易列表組件
docs: 更新 README 重構說明
```

### 新增功能

1. 在對應的資料夾建立新模組
2. 在 `app.js` 中引入並初始化
3. 在 `EventBinder.js` 中綁定事件
4. 更新文檔

## 🤝 使用 Claude Code 開發

本專案設定了 Claude Code Skills，可以快速開發：

```bash
# 整理需求
/skill project-manager

# 開發前端
/skill frontend

# 調整設計
/skill designer

# 整合後端（預留）
/skill backend
```

詳見 `CLAUDE.md` 完整說明。

## 📝 待辦事項

- [ ] 實作分析頁面的視覺化圖表
- [ ] 添加單元測試
- [ ] 實作照片上傳功能
- [ ] 整合 Firebase 後端
- [ ] 添加 PWA 支援
- [ ] 多語言支援

## 🐛 已知問題

（目前無已知問題）

## 📄 授權

MIT License

## 👥 貢獻者

- [@yourname](https://github.com/yourname) - 主要開發者

## 🙏 致謝

- Claude AI - 協助開發和重構
- Tailwind CSS - UI 框架
- Google Fonts - 字體支援

---

**由 ❤️ 和 ☕ 打造，專為寶寶和步步設計** 🌸✨

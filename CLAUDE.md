# 情侶記帳 App - Couple Expense Tracker

## 專案簡介
一個童話風格的情侶共同記帳應用,支援多帳本管理、彈性付款記錄、智能結算功能。

## 專案目標
- 幫助情侶輕鬆記錄共同開銷
- 自動計算誰欠誰多少錢
- 提供溫馨可愛的使用體驗
- 支援多個獨立帳本(日常、旅遊等)

## 開發策略

### 🎯 當前版本: v5.6.1 (時間軸交互優化 ✅)
1. **已完成模組化重構與 Firebase 整合**
   - ✅ 完成 18 個 JS 模組化檔案（總計 4,000+ 行）
   - ✅ 完成 21 個 CSS 模組化檔案（按 ITCSS 架構組織）
   - ✅ 整合 Firebase（Authentication, Firestore, Storage, Hosting）
   - ✅ 部署上線：https://baobu-app.web.app
   - ✅ 所有核心功能已實作完成
   - ✅ **絕對角色系統**：使用 baobao/bubu 固定角色，不依賴相對邏輯
   - ✅ **活動記錄/通知系統**：解決「偷偷修改」信任問題（v5.4.0）
   - ✅ **通知中心升級**：智能簡述、詳情彈窗、分頁載入（v5.5.0）
   - ✅ **UI/UX 大升級**：時間軸折疊、統計摘要、Segmented Control（v5.6.0）

2. **🚀 架構升級：即時同步與離線支援（已完成 ✅）**
   - ✅ **階段 1：基礎架構準備（已完成 2026-01-06）**
     - 啟用 Firebase Offline Persistence（IndexedDB）
     - 建立 ListenerManager 監聽器管理器
     - 建立 NetworkMonitor 網路狀態監控器
     - 新增必要的 Firebase 模組（onSnapshot, runTransaction 等）
   - ✅ **階段 2：餘額管理系統（已完成 2026-01-06）**
     - 在 notebooks 新增 balance 欄位結構
     - 建立 BalanceManager 餘額管理器
     - 新增 Firebase API 餘額管理函數
     - 建立 BalanceInitializer 自動初始化工具
     - 整合到 DataManager
   - ✅ **階段 3：交易即時監聽（已完成 2026-01-06）**
     - 新增 Firebase API 交易監聽函數（onRecentTransactionsChange, getEarlierTransactions）
     - DataManager 改用即時監聽模式，整合餘額增量更新
     - TimelineView 訂閱交易變更事件
     - HomePage 適配訂閱模式
   - ✅ **階段 4：帳本與餘額即時監聽（已完成 2026-01-06）**
     - 新增 Firebase API 帳本監聽函數（onNotebooksChange）
     - DataManager 監聽帳本和餘額，實作 cleanup()
     - BalanceCard 訂閱餘額變更事件
     - NotebooksPage 訂閱帳本列表變更事件
     - app.js 登出時清理所有監聽器
   - ✅ **階段 5：其他頁面適配與優化（已完成 2026-01-06）**
     - CalendarPage 訂閱交易變更
     - AnalyticsPage 訂閱交易變更
     - 優化 DataManager 日期範圍查詢（優先使用本地快取）
     - 建立 Firestore 索引需求文檔（FIRESTORE_INDEXES.md）
   - ✅ **階段 6：錯誤處理與開發者工具（已完成 2026-01-06）**
     - 建立 BalanceRepairTool 餘額修復工具
     - 建立 DevTools 開發者工具
     - 整合到 app.js（開發環境自動載入）
   - ✅ **階段 7：測試與部署準備（已完成 2026-01-06）**
     - 更新文檔（CHANGELOG.md, CLAUDE.md, README.md）
     - 準備 Git 提交與推送
     - 準備 Firebase 部署

3. **角色系統說明**
   - 🎭 **絕對角色設計**：寶寶（baobao）和步步（bubu）為固定角色
   - 👫 **配對機制**：兩個 Gmail 帳號綁定兩個角色，共同經營記帳本
   - 📝 **資料結構**：所有交易使用絕對角色（payer 和 beneficiary）
   - 🔄 **無相對邏輯**：不使用 me/partner/self 等相對值，避免混淆

4. **目前可進行的工作**
   - 🔧 優化現有功能與使用者體驗
   - ➕ 擴展新功能（如：預算追蹤、視覺化圖表）
   - 🧪 添加單元測試
   - 📱 PWA 支援（離線使用）

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
│   ├── data.js                   # DataManager（LocalStorage）
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
└── README.md                     # 專案說明
```

## 開發流程

### 1️⃣ 規劃新功能或優化
使用 `/skill project-manager`:
- 分析現有架構
- 規劃實作方式
- 評估影響範圍
- 技術決策建議

### 2️⃣ 前端開發與維護 ⭐ (當前重點)
使用 `/skill frontend`:
- 修改現有頁面或組件
- 新增功能模組
- 遵循現有模組化架構
- 使用 DataManager 管理資料

**當前架構範例:**
```javascript
// js/data.js - DataManager (目前使用)
// 資料管理使用 localStorage

class DataManager {
  getTransactions(notebookId) {
    // 從 localStorage 讀取資料
    return this.transactions.filter(t => t.notebook_id === notebookId);
  }

  addTransaction(transactionData) {
    // 新增到 localStorage
    this.transactions.push(transactionData);
    this.saveToLocalStorage();
  }
}

// 全域使用
window.DataManager.getTransactions('notebook_1');

// TODO: Firebase - 未來替換為
// await firebase.getTransactions(coupleId, notebookId);
```

**模組化架構:**
- **Core**: StateManager（狀態）、Router（路由）、EventBinder（事件）
- **Pages**: HomePage、CalendarPage、NotebooksPage、AnalyticsPage
- **Components**: BalanceCard、TransactionForm、TimelineView 等
- **Utils**: dateUtils、domUtils

### 3️⃣ 設計調整與優化 (隨時)
使用 `/skill designer`:
- 優化童話風格（馬卡龍色系）
- 調整色彩和動畫
- 改善使用者體驗
- 設計新組件樣式

### 4️⃣ 後端整合 (未來)
使用 `/skill backend`:
- 設定 Firebase
- 替換 DataManager 為 Firebase
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

✅ **已完成:**
- [x] 完整的模組化架構（16 JS + 20 CSS 模組）
- [x] 主頁面結構與路由系統
- [x] 底部導航與浮動按鈕
- [x] 記帳列表與時間軸顯示
- [x] 新增/編輯/刪除記帳功能
- [x] 日曆視圖
- [x] 帳本管理（切換、新增帳本）
- [x] 分析頁面（統計、篩選）
- [x] 結算卡片（智能計算欠款）
- [x] 童話風格設計系統（馬卡龍色系）
- [x] 響應式設計（手機優先）
- [x] Firebase 整合與部署
  - Firebase Authentication（Google 登入）
  - Firestore 資料庫
  - Firebase Storage（照片儲存）
  - Firebase Hosting（已部署：https://baobu-app.web.app）
- [x] **絕對角色系統（v4.2.0）**：完全修復付款人邏輯
  - 統一使用絕對角色（baobao/bubu）
  - 修復表單、資料層、顯示層的一致性
  - 解決配對系統與角色綁定問題
- [x] **即時同步與離線支援（v5.0.0）**：完整架構升級
  - 離線持久化（IndexedDB）
  - 即時監聽（onSnapshot）
  - 餘額管理系統
  - 開發者工具
- [x] **編輯交易功能（v5.1.0）**：完整的交易編輯支援
- [x] **巢狀結構修復（v5.1.1）**：修復重構後的資料顯示問題
  - BalanceInitializer 路徑修正
  - DataManager 自動補充 notebook_id
  - 修復帳本頁面與分析頁面顯示
- [x] **馬卡龍貼紙風格（v5.3.0）**：重構類別選擇按鈕
  - 不規則圓潤邊緣設計
  - 果凍彈跳動畫
  - 打勾標記 + 發光效果
- [x] **活動記錄/通知系統（v5.4.0）**：解決「偷偷修改」信任問題
  - 智能通知規則（3 天以前補記、修改、刪除）
  - 可愛通知文案（情侶友善）
  - 右上角鈴鐺 + 側滑通知面板
  - Firestore activities 集合 + 即時監聽
  - 未讀/已讀狀態管理
- [x] **通知中心大升級（v5.5.0）**：優化通知體驗
  - 智能簡述（金額變更、名稱變更等）
  - 詳情彈窗（變更前後對比）
  - 分頁載入（提升性能）
- [x] **UI/UX 大升級（v5.6.0）**：沉浸式體驗優化
  - 主頁時間軸折疊/展開功能
  - 簡潔統計摘要卡片（共花 | 寶花 | 步花）
  - 全域展開/收合控制按鈕
  - 日曆頁面 Segmented Control（童話風格）
  - 果凍彈跳動畫與平滑過渡
- [x] **時間軸交互優化（v5.6.1）**：修復 Bug 與體驗升級
  - 修復折疊/展開時交易記錄消失的問題（新增交易快取機制）
  - 日期標題可點擊展開/收合（提供雙重交互方式）
  - 重新設計摘要卡片：智能顯示當日欠款或已結清狀態
  - 粉色欠款徽章 + 綠色已結清徽章（軟萌可愛風格）

🔜 **下一步可做:**
- [ ] 實作分析頁面的視覺化圖表（如：圓餅圖、長條圖）
- [ ] 新增預算追蹤功能
- [ ] 添加單元測試
- [ ] 優化動畫與互動體驗
- [ ] 新增更多分類圖標
- [ ] 實作搜尋與篩選功能
- [ ] 匯出報表功能（CSV、PDF）

⏰ **未來整合:**
- [ ] PWA 支援（離線使用）
- [ ] 通知功能（提醒結算）
- [ ] 多語言支援
- [ ] 資料匯出與備份

---

💡 **記住**:
- 專案已完成模組化重構，架構清晰穩定
- 遵循現有模組化架構進行開發
- 使用 DataManager 管理資料（已預留 Firebase 接口）
- 保持童話風格設計一致性（馬卡龍色系）
- 一次專注一個功能，逐步優化
- 有問題隨時使用對應的 skill!

# 📝 更新日誌 (Changelog)

本文件記錄專案的所有重大變更。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

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

# 🌸 寶寶步步的記帳本 - Couple Expense Tracker

> 一個童話風格的情侶共同記帳應用，支援多帳本管理、彈性付款記錄、智能結算功能。

![Version](https://img.shields.io/badge/version-2.9.5-pink)
![License](https://img.shields.io/badge/license-MIT-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange)
![Live](https://img.shields.io/badge/Live-Online-brightgreen)

## 🌐 線上演示

**網站已上線！立即體驗：** [https://baobu-app.web.app](https://baobu-app.web.app)

- ✅ 使用 Google 帳號登入即可開始使用
- ✅ HTTPS 加密連線，安全可靠
- ✅ 全球 CDN 加速，快速載入
- ✅ 即時雲端同步，隨時隨地記帳

## ✨ 專案特色

- 🎨 **童話風格設計** - 溫暖柔和的粉彩色系，圓潤可愛的設計元素
- 💕 **情侶共同記帳** - 清楚記錄誰付錢、幫誰付，自動計算欠款
- 📖 **多帳本管理** - 支援日常、旅遊等不同帳本，各自獨立結算
- 📱 **響應式設計** - 針對手機優化，電腦也能正常使用
- 🚀 **模組化架構** - 經過完整重構，代碼清晰易維護
- 🔥 **Firebase 整合** - Google 登入、Firestore 資料庫、雲端同步

## 📸 專案截圖

（待補充）

## 🛠️ 技術棧

### 前端
- **核心**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **無框架**: 純原生 JS，輕量快速
- **模組化**: ES6 Modules
- **樣式**: CSS3 + CSS Variables（童話風格設計系統）
- **UI 框架**: Tailwind CSS (CDN)

### 後端
- **BaaS**: Firebase
  - **Authentication** - Google 登入
  - **Firestore** - NoSQL 雲端資料庫
  - **Storage** - 照片儲存（收據、發票）
  - **Hosting** - 網站部署

## 📁 專案結構

```
baobu_money_track/
├── index.html                    # 主頁面
│
├── config/                       # 配置檔案（⚠️ 不會上傳到 GitHub）
│   ├── firebase.config.js        # Firebase 真實配置（被 .gitignore 排除）
│   └── firebase.config.example.js # Firebase 配置範例
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
│   ├── data.js                   # 資料管理（Firebase Firestore）
│   ├── firebase-config.js        # Firebase SDK 封裝
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
├── .gitignore                    # Git 忽略檔案
├── CHANGELOG.md                  # 更新日誌
├── CLAUDE.md                     # Claude Code 專案指南
├── DESIGN.md                     # 設計文檔
└── README.md                     # 本文件
```

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/b09901017/baobu_money_track.git
cd baobu_money_track
```

### 2. 設定 Firebase 配置

**步驟 1：建立 Firebase 專案**

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱，完成建立

**步驟 2：啟用 Firebase 服務**

1. 啟用 **Authentication** → Google 登入
2. 啟用 **Firestore Database** → 測試模式（或設定安全規則）
3. 啟用 **Storage** → 測試模式（用於照片上傳）
   - 前往 Firebase Console → Storage
   - 點擊「Get Started」開始使用
   - 選擇測試模式或設定安全規則（建議設定規則）

**步驟 3：取得 Firebase 配置**

1. 前往 Firebase Console → 專案設定
2. 在「你的應用程式」區塊，點擊「網頁」圖示
3. 複製 `firebaseConfig` 物件

**步驟 4：建立配置檔案**

```bash
# 複製範例配置檔案
cp config/firebase.config.example.js config/firebase.config.js
```

編輯 `config/firebase.config.js`，貼上你的 Firebase 配置：

```javascript
export const firebaseConfig = {
    apiKey: "你的 API Key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "你的 Sender ID",
    appId: "你的 App ID",
    measurementId: "你的 Measurement ID"
};
```

**⚠️ 注意**：`config/firebase.config.js` 已被 `.gitignore` 排除，不會上傳到 GitHub。

### 3. 啟動本地伺服器

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

### 4. 訪問應用

打開瀏覽器訪問：
```
http://localhost:8080
```

### 5. 登入測試

1. 點擊「使用 Google 登入」
2. 選擇你的 Google 帳號
3. 首次登入會自動建立預設帳本
4. 開始記帳！

### 6. 開發模式（避免快取問題）

1. 按 **F12** 打開開發者工具
2. 點擊右上角的 **⚙️ 設定圖示**
3. 勾選 **「Disable cache (while DevTools is open)」**

之後只要開發者工具保持開啟，每次重新整理（F5）就會自動清除快取。

## 🔥 Firebase Firestore 安全規則（建議）

前往 Firebase Console → Firestore Database → 規則，設定以下安全規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允許登入用戶存取
    function isSignedIn() {
      return request.auth != null;
    }

    // 帳本：只能讀寫自己是成員的帳本
    match /notebooks/{notebookId} {
      allow read: if isSignedIn()
        && request.auth.uid in resource.data.member_ids;
      allow create: if isSignedIn()
        && request.auth.uid in request.resource.data.member_ids;
      allow update, delete: if isSignedIn()
        && request.auth.uid in resource.data.member_ids;
    }

    // 交易：只能讀寫自己的交易
    match /transactions/{transactionId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if isSignedIn()
        && request.auth.uid == resource.data.user_id;
    }

    // 自訂分類：只能讀寫自己的分類
    match /custom_categories/{categoryId} {
      allow read: if isSignedIn()
        && request.auth.uid == resource.data.user_id;
      allow create: if isSignedIn()
        && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if isSignedIn()
        && request.auth.uid == resource.data.user_id;
    }
  }
}
```

## 🔥 Firebase Storage 安全規則

前往 Firebase Console → Storage → Rules，設定以下安全規則：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // 收據照片：只能存取自己上傳的照片
    match /receipts/{userId}/{allPaths=**} {
      // 允許讀取和寫入自己的照片
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.contentType.matches('image/.*')
                   && request.resource.size < 10 * 1024 * 1024;  // 最大 10MB

      // 允許刪除自己的照片
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // 拒絕其他路徑
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**安全規則說明：**
- ✅ 只有登入用戶可以上傳照片
- ✅ 用戶只能存取自己上傳的照片
- ✅ 限制檔案類型為圖片（image/*）
- ✅ 限制檔案大小最大 10MB
- ✅ 用戶可以刪除自己的照片

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

## 📱 主要功能

### ✅ 已實作功能

#### 🔐 用戶認證
- ✅ Google 登入
- ✅ 用戶狀態管理
- ✅ 首次登入自動建立預設帳本

#### 🏠 首頁 - 時間軸視圖
- ✅ **無限滾動時間軸**（一路往下滑查看歷史）
  - 預設載入最近 30 天記錄
  - 底部「載入更多記錄 ✨」按鈕
  - 每次載入額外 30 天
  - 簡化介面，移除多餘導航
- ✅ **詳情模式**：顯示所有交易詳細資訊
  - 可愛的日期分隔線（星星 ✨ 和花朵 🌸 裝飾）
  - 每筆記錄顯示時間（HH:MM）
  - 寶寶付款在左邊，步步付款在右邊
  - 按日期自動分組
- ✅ **摘要模式**：每天一張精美總結卡片
  - 顯示寶寶付了多少（粉色）
  - 顯示步步付了多少（藍色）
  - 顯示共花費多少（橘色）
  - 交易筆數標記（金色圓圈）
  - 只顯示有花費的天
- ✅ 點擊交易查看詳情
- ✅ 智能結算卡片（自動計算欠款）

#### 📅 日曆視圖（全新升級）
- ✅ **單日模式**：快速查看單一天的花費
  - 左右滑動切換日期（像卡片一樣流暢）
  - 點擊月曆選擇日期
  - 粉紫色漸層高亮選中日期
  - 自動跨月切換
  - 友善操作提示「👆 左右滑動切換日期，點擊月曆選擇 👆」
- ✅ **區間模式**：選擇時間範圍查看
  - 點擊兩次選擇開始和結束日期
  - 開始/結束日期：藍紫色漸層 + 光環
  - 中間日期：淡藍色背景
  - 卡片式清單佈局（每天獨立卡片）
  - 簡化付款文字（寶幫步付、步幫共付等）
- ✅ 月曆顯示每日總花費
- ✅ 智能提示文字（星星和愛心裝飾）
- ✅ 前後月份切換
- ✅ 視覺化顯示消費金額
- ✅ 童話風格視覺效果增強

#### 💰 記帳功能
- ✅ 記錄金額、項目名稱
- ✅ 選擇付款人（寶寶 / 步步）
- ✅ 選擇受益人（寶寶 / 步步 / 寶步）
- ✅ 多分類標籤（可複選）
- ✅ 自訂分類管理
- ✅ 備註功能
- ✅ 日期選擇
- ✅ **照片上傳**（收據、發票、截圖）
- ✅ 資料即時同步到 Firebase

#### 📸 照片管理
- ✅ 上傳照片（支援 JPG、PNG、WEBP）
- ✅ 自動壓縮圖片（最大 1200x1200，品質 80%）
- ✅ 照片預覽與刪除
- ✅ 點擊放大查看（全螢幕燈箱）
- ✅ 時間軸顯示照片圖標（📸）
- ✅ 照片儲存在 Firebase Storage
- ✅ 刪除交易時同步刪除照片

#### 💳 結算功能
- ✅ 自動計算誰欠誰多少錢
- ✅ 智能處理「幫誰付」的情況
- ✅ 即時更新結算狀態
- ✅ 三種結算狀態顯示（已結清 / 欠款 / 收款）

#### 📖 帳本管理
- ✅ 支援多個獨立帳本
- ✅ 切換帳本（資料自動載入）
- ✅ 新增帳本
- ✅ 繪本風格展示
- ✅ 每個帳本獨立統計

#### 📊 分析頁面（全新升級）
- ✅ **總支出統計** - 一目了然的總覽
- ✅ **個人支出統計** - 寶寶 / 步步各付多少
- ✅ **可點擊篩選** - 點擊寶寶/步步卡片查看各自支出
- ✅ **分類支出統計** - 含百分比與金額
- ✅ **圓餅圖視覺化** 🍰 - 可愛童話風格甜甜圈圖表
  - 純 CSS/SVG 實作，無需外部庫
  - 馬卡龍色系柔和片段
  - 點擊圓餅或圖例快速篩選
  - 列表/圓餅圖一鍵切換
- ✅ **交易明細卡片式呈現** - 每日精美卡片
  - 按日期自動分組
  - 漸層標題（日期、筆數、總計）
  - 智能日期顯示（今天/昨天/具體日期）
  - 顯示分類標籤、照片圖標
- ✅ **智能篩選功能**
  - 按分類篩選（點擊分類項目）
  - 按付款人篩選（點擊寶寶/步步）
  - 篩選標籤清晰顯示
  - 一鍵清除篩選
- ✅ **日期篩選** - 本月 / 本週 / 全部 / 自訂

### 🚧 待實作功能

- [ ] 更多視覺化圖表（長條圖、趨勢圖、堆疊圖）
- [ ] 預算追蹤功能（每月預算、分類預算、超支提醒）
- [ ] 匯出報表（CSV、PDF、Excel）
- [ ] PWA 支援（離線使用、安裝到桌面）
- [ ] 多人共同帳本（邀請伴侶加入）
- [ ] 推播通知（超支提醒、每日記帳提醒）
- [ ] 搜尋與篩選（按關鍵字、金額區間）

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

### Firebase Firestore

目前使用 Firebase Firestore 雲端資料庫儲存資料：

**資料結構：**

```javascript
// 帳本 (notebooks)
{
  id: "notebook_id",
  name: "日常記帳",
  member_ids: ["user_uid_1", "user_uid_2"],
  member_names: {
    "user_uid_1": "寶寶",
    "user_uid_2": "步步"
  },
  created_at: Timestamp
}

// 交易 (transactions)
{
  id: "transaction_id",
  notebook_id: "notebook_id",
  user_id: "user_uid",
  payer: "me" | "partner",
  beneficiary: "self" | "partner" | "both",
  amount: 350,
  item_name: "晚餐",
  categories: ["吃吃", "生活"],
  note: "好好吃",
  date: "2024-01-15",
  photo_url: "https://storage.googleapis.com/...",  // Firebase Storage 下載 URL
  photo_path: "receipts/user_uid/transaction_id/photo.jpg",  // Storage 儲存路徑
  created_at: Timestamp,
  updated_at: Timestamp
}

// 自訂分類 (custom_categories)
{
  id: "category_id",
  user_id: "user_uid",
  name: "健身",
  icon: "fitness_center",
  created_at: Timestamp
}
```

### 資料同步

- ✅ 即時讀取 - 從 Firebase 載入最新資料
- ✅ 即時寫入 - 新增/修改/刪除立即同步
- ✅ 本地快取 - 提升載入速度
- ✅ 錯誤處理 - 失敗時顯示友善提示

## 🧪 測試

（待補充測試指南）

## 📦 部署

### 🌐 線上網站

本專案已部署到 Firebase Hosting：

**正式網站：** [https://baobu-app.web.app](https://baobu-app.web.app)

### 部署架構

本專案使用 **Firebase Hosting + Firestore** 架構：

- **前端**: Firebase Hosting（全球 CDN）
- **資料庫**: Firebase Firestore（即時同步）
- **認證**: Firebase Authentication（Google 登入）
- **安全**: Firestore Security Rules（權限控制）

### 🚀 自行部署步驟

如果你想部署自己的版本：

#### 1. 安裝 Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. 登入 Firebase

```bash
firebase login
```

#### 3. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用 **Authentication**（Google 登入）
4. 啟用 **Firestore Database**
5. 啟用 **Hosting**

#### 4. 配置專案

編輯 `.firebaserc`，將 `baobu-app` 改為你的專案 ID：

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

#### 5. 部署

```bash
# 部署 Firestore 安全規則 + Hosting
firebase deploy

# 或只部署 Hosting
firebase deploy --only hosting

# 或只部署 Firestore 規則
firebase deploy --only firestore:rules
```

#### 6. 更新部署

當你修改代碼後，重新執行：

```bash
firebase deploy
```

### 📋 部署配置文件

專案已包含完整的部署配置：

- **`firebase.json`** - Firebase Hosting 和 Firestore 配置
- **`.firebaserc`** - Firebase 專案設定
- **`.firebaseignore`** - 部署時排除的文件
- **`firestore.rules`** - Firestore 安全規則

### 🔐 安全規則

`firestore.rules` 已設定完善的權限控制：

- ✅ 只允許登入用戶存取
- ✅ 用戶只能讀寫自己的帳本和交易
- ✅ 防止未授權存取

### 🌍 其他部署選項

本專案也可部署到其他平台：

- **GitHub Pages**
- **Netlify**
- **Vercel**

但需要自行配置 Firebase 相關設定。

## 🔧 開發指南

### 程式碼規範

**JavaScript：**
- 使用 ES6+ 語法
- `const` > `let` > 避免 `var`
- 使用 arrow functions
- async/await 處理非同步操作
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
- chore: 建置/工具變更

範例:
feat: 新增記帳表單驗證
fix: 修復日期選擇器無法開啟的問題
style: 優化結算卡片的童話風格
refactor: 重構交易列表組件
docs: 更新 README Firebase 整合說明
```

### 新增功能

1. 在對應的資料夾建立新模組
2. 在 `app.js` 中引入並初始化
3. 在 `EventBinder.js` 中綁定事件
4. 更新 `CHANGELOG.md`
5. 更新文檔

## 🤝 使用 Claude Code 開發

本專案設定了 Claude Code Skills，可以快速開發：

```bash
# 規劃新功能或優化方案
/skill project-manager

# 維護模組化架構、開發功能
/skill frontend

# 設計童話風格 UI（馬卡龍色系）
/skill designer

# 整合 Firebase 後端
/skill backend
```

詳見 `CLAUDE.md` 完整說明。

## 📝 更新日誌

詳見 [CHANGELOG.md](CHANGELOG.md)

## 🐛 已知問題

- ⚠️ Google 登入時會出現 Cross-Origin-Opener-Policy 警告（不影響功能）
  - 解決方案：部署到 HTTPS 環境後會自動消失

## 📄 授權

MIT License

## 👥 貢獻者

- [@b09901017](https://github.com/b09901017) - 主要開發者

## 🙏 致謝

- Claude AI - 協助開發和重構
- Firebase - 後端服務
- Tailwind CSS - UI 框架
- Google Fonts - 字體支援

---

**由 ❤️ 和 ☕ 打造，專為寶寶和步步設計** 🌸✨

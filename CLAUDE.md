# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 情侶記帳 App - Couple Expense Tracker

## 專案簡介
一個童話風格的情侶共同記帳應用，採用 Vanilla JavaScript + Firebase 架構，支援即時同步、離線支援、多帳本管理。

**線上演示：** https://baobu-app.web.app

**當前版本：** v6.0.0 (重大架構重整 - 移除結算功能)

---

## 常用開發指令

### 本地開發
```bash
# 啟動本地開發伺服器（推薦方式）
npx http-server -p 8080

# 或使用 Python
python -m http.server 8080

# 或使用 VS Code Live Server 擴充套件
# 右鍵 index.html → Open with Live Server
```

訪問：http://localhost:8080

**重要：** 由於使用 ES6 模組，必須透過 HTTP 伺服器執行，不能直接開啟 HTML 檔案。

### Firebase 部署
```bash
# 部署到 Firebase Hosting（包含 Firestore/Storage 規則）
firebase deploy

# 僅部署 Hosting（不更新資料庫規則）
firebase deploy --only hosting

# 僅部署 Firestore 規則
firebase deploy --only firestore:rules

# 僅部署 Storage 規則
firebase deploy --only storage:rules
```

### 開發者工具（DevTools）
在瀏覽器 Console 中執行：
```javascript
// 查看可用指令
DevTools.help()

// 檢查餘額完整性
DevTools.checkBalanceIntegrity()

// 修復餘額錯誤
DevTools.repairBalance()

// 查看監聽器狀態
DevTools.listenerStats()

// 查看快取統計
DevTools.cacheStats()
```

**DevTools 自動載入條件：** 本地開發環境（localhost/127.0.0.1）

### 清除快取（開發時）
1. 按 F12 開啟開發者工具
2. 點擊 ⚙️ 設定圖示
3. 勾選「Disable cache (while DevTools is open)」
4. 保持開發者工具開啟，F5 重新整理即可

### Android APK 建置 🤖

**完整指南：** 參見 [docs/ANDROID_BUILD_GUIDE.md](docs/ANDROID_BUILD_GUIDE.md)

#### 快速建置流程

```bash
# 1. 同步 Capacitor 配置到原生專案
npx cap sync

# 2. 修正 Java 版本（本地環境 Java 17）
# 編輯 android/app/capacitor.build.gradle
# 將 JavaVersion.VERSION_21 改為 JavaVersion.VERSION_17

# 3. 建置 Debug APK
cd android
./gradlew clean assembleDebug

# APK 位置：android/app/build/outputs/apk/debug/app-debug.apk
```

#### ⚠️ 關鍵注意事項

1. **Capacitor 插件配置（必要！）**
   - 檔案：`capacitor.config.json`
   - **必須明確聲明使用的認證 provider**
   ```json
   {
     "plugins": {
       "FirebaseAuthentication": {
         "skipNativeAuth": false,
         "providers": ["google.com"]
       }
     }
   }
   ```
   - ⚠️ 未配置會導致 `GoogleAuthProviderHandler` 為 null！

2. **Java 版本管理**
   - Capacitor 8.0.0 預設使用 Java 21
   - 本地環境為 Java 17，需手動修改
   - `android/app/capacitor.build.gradle` 會在每次 `npx cap sync` 後重新生成
   - **每次 sync 後都要重新修改 Java 版本！**

3. **Firebase 配置檢查**
   - `android/app/google-services.json` 包含正確的 SHA-1 指紋
   - 取得 SHA-1：`cd android && ./gradlew signingReport`
   - 將 SHA-1 加入 Firebase Console（專案設定 → Android 應用程式）

4. **MainActivity 插件註冊（已完成）**
   - 檔案：`android/app/src/main/java/com/baobu/moneytrack/MainActivity.java`
   - 已明確註冊 `FirebaseAuthenticationPlugin`
   - 確保插件在應用啟動時被載入

#### 建置自動化腳本（建議）

為避免每次手動修改，可建立 `build-android.sh`：

```bash
#!/bin/bash
echo "🚀 開始建置 Android APK..."

# 同步配置
npx cap sync

# 修正 Java 版本
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle

# 建置 APK
cd android && ./gradlew clean assembleDebug

echo "✅ 建置完成！APK: android/app/build/outputs/apk/debug/app-debug.apk"
```

#### 常見問題與解決

| 錯誤 | 原因 | 解決方式 |
|------|------|---------|
| `GoogleAuthProviderHandler` null | 未配置 provider | 加入 `capacitor.config.json` 配置 |
| `invalid source release: 21` | Java 版本不符 | 修改 `capacitor.build.gradle` 為 Java 17 |
| `SHA-1` 錯誤 | 指紋未加入 Firebase | 執行 `gradlew signingReport` 取得並加入 |
| Google 登入失敗 | 配置或網路問題 | 檢查 Logcat 錯誤訊息 |

---

## 核心架構理解

### 絕對角色系統（Critical Design）
**與一般記帳 App 最大差異：** 使用「絕對角色」而非「相對身份」

```javascript
// ❌ 錯誤：不使用相對角色
{ payer: "me", beneficiary: "partner" }  // 錯誤！兩人看到的會不同

// ✅ 正確：使用絕對角色
{ payer: "baobao", beneficiary: "bubu" }  // 兩人看到完全一致的資料
```

**關鍵概念：**
- 整個系統使用固定角色：`baobao`（寶寶）和 `bubu`（步步）
- 兩個 Google 帳號綁定到這兩個角色
- 所有交易記錄都用絕對角色，避免「我/對方」邏輯混淆
- 顯示時也統一顯示角色名稱，不轉換成「我/對方」

**資料流：**
1. 配對建立時分配角色（couples.member_roles）
2. DataManager 初始化時讀取 `this.myRole`
3. 交易資料統一使用 `baobao` / `bubu`
4. UI 顯示統一使用「寶寶」/「步步」

### Firebase 即時同步架構
專案已完成 v5.0.0 架構升級，使用訂閱模式 + 離線支援：

```javascript
// 舊架構（已棄用）
const transactions = await firebase.getTransactions();  // 手動拉取

// 新架構（v5.0.0+）
firebase.onRecentTransactionsChange(callback);  // 即時監聽
```

**關鍵組件：**
- **ListenerManager**（[js/core/ListenerManager.js](js/core/ListenerManager.js)）：統一管理所有 Firestore 監聽器
- **BalanceManager**（[js/core/BalanceManager.js](js/core/BalanceManager.js)）：餘額持久化與增量更新
- **NetworkMonitor**（[js/core/NetworkMonitor.js](js/core/NetworkMonitor.js)）：監控網路狀態

**資料流：**
1. DataManager 呼叫 `firebase.onRecentTransactionsChange()` 建立監聽
2. Firestore 推送資料變更 → DataManager 更新快取
3. DataManager 觸發事件（`transactions-changed`）
4. UI 組件訂閱事件，自動重新渲染

**監聽器生命週期：**
```javascript
// DataManager 初始化時啟動監聽
await DataManager.init(user, couple);

// 登出時清理所有監聽器
DataManager.cleanup();  // 呼叫所有 unsubscribe()
```

### 餘額管理系統
**核心問題：** 避免每次都重算所有交易（O(n) → O(1)）

**解決方案：** 餘額持久化 + Firestore Transaction

```javascript
// notebooks 文件結構
{
  balance: {
    baobao_paid: 1500,     // 寶寶付了多少
    bubu_paid: 1200,       // 步步付了多少
    baobao_benefit: 1350,  // 寶寶受益多少
    bubu_benefit: 1350,    // 步步受益多少
    version: 42            // 樂觀鎖版本號
  }
}
```

**更新流程（使用 Firestore Transaction 確保並發安全）：**
1. 新增交易 → `BalanceManager.incrementBalance()` → 更新餘額 +delta
2. 刪除交易 → `BalanceManager.decrementBalance()` → 更新餘額 -delta
3. 編輯交易 → `BalanceManager.replaceBalance()` → 更新餘額 -old +new

**自動初始化：** BalanceInitializer 檢查舊帳本，自動補充 balance 欄位

### 模組化架構（v3.0.0 大重構）

**JS 模組結構：**
```
js/
├── app.js                 # 主控制器（126 行，精簡 91.6%！）
├── data.js                # DataManager（資料管理 + 訂閱模式）
├── firebase-config.js     # Firebase SDK 封裝
│
├── core/                  # 核心系統
│   ├── StateManager.js    # 全域狀態管理（currentNotebook, viewMode 等）
│   ├── Router.js          # Hash 路由（#home, #calendar, #notebooks, #analytics）
│   ├── EventBinder.js     # 事件綁定器（集中管理所有 click/submit 事件）
│   ├── ListenerManager.js # Firestore 監聽器管理
│   ├── NetworkMonitor.js  # 網路狀態監控
│   └── BalanceManager.js  # 餘額管理器
│
├── pages/                 # 頁面控制器（對應 Router）
│   ├── HomePage.js        # 首頁（時間軸 + 結算卡片）
│   ├── CalendarPage.js    # 日曆視圖（單日/區間模式）
│   ├── NotebooksPage.js   # 帳本管理（SortableJS 拖曳排序）
│   └── AnalyticsPage.js   # 分析頁面（統計 + 圓餅圖）
│
├── components/            # UI 組件（可重用）
│   ├── BalanceCard.js     # 結算卡片
│   ├── TimelineView.js    # 時間軸視圖（折疊/展開、無限滾動）
│   ├── TransactionForm.js # 交易表單（新增/編輯）
│   ├── TransactionDetail.js # 交易詳情彈窗
│   ├── TransactionRenderer.js # 交易項目渲染器
│   └── DateRangePicker.js # 日期範圍選擇器
│
└── utils/                 # 工具函數
    ├── dateUtils.js       # 日期處理（formatDate, getMonthRange 等）
    ├── domUtils.js        # DOM 操作（showToast, showLoading 等）
    ├── BalanceInitializer.js # 餘額自動初始化工具
    ├── NotebookStatsInitializer.js # 統計初始化工具
    └── DevTools.js        # 開發者工具（僅本地環境載入）
```

**CSS 架構（ITCSS）：**
```
css/
├── main.css              # 入口檔案（@import 所有模組）
│
├── base/                 # 基礎層（最低優先級）
├── layout/               # 布局層（container, header, navigation）
├── components/           # 組件層（balance-card, transaction-list 等）
├── animations/           # 動畫層（@keyframes）
└── utilities/            # 工具層（responsive, scrollbar）
```

**關鍵設計模式：**
1. **訂閱-發布模式**：DataManager 觸發事件，UI 組件訂閱
2. **單例模式**：DataManager、StateManager 掛載到 `window` 全域
3. **職責分離**：Pages 處理頁面邏輯，Components 處理可重用 UI

### 資料庫結構（Firestore）

```
couples/
└── {coupleId}/
    ├── member_ids: [uid1, uid2]
    ├── member_roles: { uid1: "baobao", uid2: "bubu" }
    ├── member_names: { uid1: "寶寶", uid2: "步步" }
    │
    ├── notebooks/                    # 子集合
    │   └── {notebookId}/
    │       ├── name: "日常記帳"
    │       ├── order: 0              # v5.7.0 新增（拖曳排序）
    │       ├── balance: { ... }      # v5.0.0 新增（餘額持久化）
    │       └── stats: { ... }        # 統計資料
    │
    ├── transactions/                 # 子集合
    │   └── {transactionId}/
    │       ├── notebook_id: "..."
    │       ├── payer: "baobao" | "bubu"
    │       ├── beneficiary: "baobao" | "bubu" | "both"
    │       ├── amount: 350
    │       ├── item_name: "晚餐"
    │       ├── categories: ["吃吃", "生活"]
    │       ├── date: "2024-01-15"
    │       ├── photo_url: "https://..."  # Firebase Storage URL
    │       └── created_at: Timestamp
    │
    └── activities/                   # 子集合（通知系統 v5.4.0）
        └── {activityId}/
            ├── type: "transaction_added" | "transaction_updated" | "transaction_deleted"
            ├── actor_id: "uid"
            ├── transaction_id: "..."
            ├── changes: { ... }      # 變更前後對比
            ├── is_read: false
            └── created_at: Timestamp
```

**關鍵索引需求：** 參見 FIRESTORE_INDEXES.md

### 狀態管理
**StateManager** 統一管理全域狀態：

```javascript
// 當前帳本
StateManager.currentNotebook = 'notebook_1';

// 視圖模式（timeline/summary）
StateManager.viewMode = 'timeline';

// 當前頁面（由 Router 更新）
StateManager.currentPage = 'home';

// 折疊狀態（v5.6.0）
StateManager.collapsedDates = new Set(['2024-01-15']);
```

### 通知系統（v5.4.0）
解決「偷偷修改」信任問題，智能規則：

**觸發通知條件：**
- 補記 3 天前以前的交易
- 修改任何交易
- 刪除任何交易

**不觸發通知：**
- 當天新增交易
- 近 3 天內新增交易

**實作關鍵：**
```javascript
// firebase-config.js
export async function createActivity(coupleId, activityData) {
  // 建立活動記錄
}

// data.js
async addTransaction(transactionData) {
  // 判斷是否需要通知
  if (isOldTransaction) {
    await createActivity(...);
  }
}
```

---

## 開發策略

### 開發工作流程

1. **使用 `/skill project-manager`** - 規劃新功能或重構方案
2. **使用 `/skill frontend`** - 實作前端功能（遵循模組化架構）
3. **使用 `/skill designer`** - 調整童話風格設計（馬卡龍色系）
4. **使用 `/skill backend`** - 整合 Firebase 功能（已完成）

### 新增功能步驟
1. 在對應資料夾建立模組（pages/ 或 components/）
2. 在 [firebase-config.js](js/firebase-config.js) 新增 Firebase API（如需要）
3. 在 [data.js](js/data.js) 新增 DataManager 方法
4. 在 [EventBinder.js](js/core/EventBinder.js) 綁定事件
5. 在 [app.js](js/app.js) 初始化（如需要）
6. 更新版本記錄（參見下方「完成階段工作流程」）
7. 使用 `firebase deploy` 部署

---

## 完成階段工作流程 📋

當你完成一個開發階段後，請執行以下步驟來維護專案文檔與版本控制：

### 1️⃣ 更新版本記錄
**位置：** `docs/changelog/v{X}/`

**命名規則：**
- 小版本更新：在現有檔案中新增記錄（如 `version5-6_8.md`）
- 大版本更新：建立新檔案（如 `version6-0_5.md`）或新資料夾（如 `v6/`）

**內容格式：**
```markdown
## [X.Y.Z] - YYYY-MM-DD

### 🎯 功能分類標題

**簡短描述**

#### 主要改進/新增功能
1. **功能名稱**
   - 具體改進點 1
   - 具體改進點 2

#### 技術實現
- 關鍵檔案與修改說明
- 技術架構變更

#### 修改檔案
- `path/to/file.js` - 說明
```

**更新 README.md：**
- 如果建立新版本資料夾（v6/），記得在 `docs/changelog/v{X}/README.md` 中建立版本摘要
- 更新 `docs/changelog/README.md` 的版本總覽

### 2️⃣ 建立或更新說明文檔
**位置：** `docs/`

**適用情況：**
- 新增重要功能需要使用指南
- 建立技術分析文檔（如 BALANCE_SAFETY_ANALYSIS.md）
- 故障排查指南（如 IDX_TROUBLESHOOTING.md）

**更新索引：**
記得在 `docs/README.md` 中加入新文檔的連結與說明

### 3️⃣ 更新核心文檔（必要時）
- **CLAUDE.md** - 新增重要架構變更、開發指令、注意事項
- **README.md** - 更新專案說明、功能列表、部署指南

### 4️⃣ Commit 與 Push
```bash
# 查看變更
git status

# 加入所有變更
git add .

# 提交（使用有意義的 commit message）
git commit -m "feat: 新增功能名稱

- 具體改進 1
- 具體改進 2
- 更新文檔與版本記錄

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 推送到 GitHub
git push origin main
```

**Commit Message 格式：**
- `feat:` - 新功能
- `fix:` - Bug 修復
- `docs:` - 文檔更新
- `style:` - 樣式調整
- `refactor:` - 重構
- `test:` - 測試相關
- `chore:` - 建置或輔助工具變更

**重要提醒：**
- ✅ 每個 commit 都應該包含對應的文檔更新
- ✅ 完成功能後立即更新 CHANGELOG 和版本記錄
- ✅ 使用 Co-Authored-By 標註 AI 協作
- ⚠️ 謹慎使用 `git push -f`（僅在確定需要改寫歷史時使用）

---

## 文檔結構說明

### 根目錄文檔
- **CLAUDE.md** - Claude Code 專案指南（本檔案）
- **README.md** - 專案說明與部署指南
- **DESIGN.md** - 童話風格設計規範（可選保留）

### docs/ 文檔目錄
- **changelog/** - 版本更新歷史（v1~v5+）
- **技術分析文檔** - BALANCE_SAFETY_ANALYSIS.md、CACHE_SYSTEM_ANALYSIS.md 等
- **開發指南** - ANDROID_BUILD_GUIDE.md、TESTING_GUIDE.md 等
- **故障排查** - IDX_TROUBLESHOOTING.md 等
- **README.md** - 文檔索引與快速導航

---

## 程式碼規範

### JavaScript
- ES6+ 語法，`const` > `let`，避免 `var`
- 命名：變數/函數 `camelCase`，Class `PascalCase`，常數 `UPPER_SNAKE_CASE`
- 使用 async/await 處理非同步操作
- 所有角色相關邏輯使用絕對角色（`baobao` / `bubu`），禁止使用相對角色（`me` / `partner`）

### CSS
- 使用 CSS Variables（定義在 [css/base/variables.css](css/base/variables.css)）
- BEM 命名：`.block__element--modifier`
- Mobile-first 響應式設計
- 遵循 ITCSS 架構層級

### Git Commit
```
<type>: <description>

Types: feat, fix, style, refactor, docs, test, chore
範例: feat: 新增帳本拖曳排序功能
```

### 童話風格設計原則
- 馬卡龍色系（粉、紫、藍、綠、橙）
- 圓潤可愛的邊角（border-radius: 12px-20px）
- 柔和漸層與陰影
- 流暢的動畫過渡（150ms-300ms）
- 詳見 [DESIGN.md](DESIGN.md)

---

## 重要提醒

1. **絕對角色系統是核心設計**
   - 任何涉及角色的程式碼都必須使用 `baobao` / `bubu`
   - 禁止引入 `me` / `partner` / `self` 等相對概念
   - 顯示時也統一顯示「寶寶」/「步步」

2. **餘額管理使用 Transaction**
   - 所有涉及餘額更新的操作必須使用 `BalanceManager`
   - 使用 Firestore Transaction 確保並發安全
   - 不要手動計算餘額，應使用增量更新

3. **即時同步架構**
   - 新功能應使用訂閱模式（監聽 Firestore 變更）
   - 記得在組件銷毀時取消訂閱（避免記憶體洩漏）
   - 優先使用本地快取，減少 Firebase 讀取

4. **通知系統規則**
   - 補記 3 天前以前的交易觸發通知
   - 修改/刪除任何交易觸發通知
   - 當天和近 3 天內新增不觸發通知

5. **開發環境設定**
   - 必須使用 HTTP 伺服器（ES6 模組限制）
   - 開啟開發者工具並停用快取
   - DevTools 僅在本地環境自動載入

6. **Android APK 建置關鍵事項** 🤖
   - **Capacitor 插件配置優先於代碼**：遇到插件相關的 NullPointerException，先檢查 `capacitor.config.json` 是否完整配置
   - **按需初始化策略**：Capacitor Firebase Authentication 只初始化配置中聲明的 provider，未聲明的 Handler 會是 null
   - **自動生成檔案管理**：`capacitor.build.gradle` 會在每次 `npx cap sync` 後重新生成，需要自動化腳本或手動重新修改
   - **Java 版本一致性**：確保 Gradle 配置的 Java 版本與本地環境一致（本專案：Java 17）
   - **Firebase 原生配置**：`google-services.json` 必須包含當前環境的 SHA-1 指紋（本地、IDX、CI/CD 各不相同）
   - **先配置後編碼**：新增 Capacitor 插件時，先查閱官方文檔確認配置需求，再開始寫代碼

---

## 參考文件

### 核心文檔
- [README.md](README.md) - 專案說明與部署指南
- [DESIGN.md](DESIGN.md) - 童話風格設計規範
- [docs/README.md](docs/README.md) - 📚 **文檔索引與快速導航**

### 版本更新歷史 🔄
- [docs/changelog/README.md](docs/changelog/README.md) - 版本總覽（v1.0.0 ~ v6.0.0）
- [docs/changelog/v6/](docs/changelog/v6/) - **v6 系列詳細記錄（架構重整與功能聚焦）** ✨ NEW
- [docs/changelog/v5/](docs/changelog/v5/) - v5 系列詳細記錄（即時同步與體驗優化）
- [docs/changelog/v4/](docs/changelog/v4/) - v4 系列詳細記錄（Firebase 整合與角色系統）
- [docs/changelog/v3/](docs/changelog/v3/) - v3 系列詳細記錄（模組化大重構）
- [docs/changelog/v2/](docs/changelog/v2/) - v2 系列詳細記錄（功能擴展）
- [docs/changelog/v1/](docs/changelog/v1/) - v1 系列詳細記錄（初始版本）

### Android 開發文檔 🤖
- [docs/ANDROID_BUILD_GUIDE.md](docs/ANDROID_BUILD_GUIDE.md) - **完整 Android APK 建置指南**
  - 詳細試錯過程（5 次嘗試）
  - 根本原因分析
  - 完整解決方案
  - 常見問題排查
  - 建置自動化腳本
  - 下次注意事項與最佳實踐
- [docs/IDX_TROUBLESHOOTING.md](docs/IDX_TROUBLESHOOTING.md) - Google Project IDX 環境問題排查
- [docs/IDX_GUIDE.md](docs/IDX_GUIDE.md) - Google Project IDX 完整操作指南（已過時，參考用）

### 技術分析文檔 🔒
- [docs/BALANCE_SAFETY_ANALYSIS.md](docs/BALANCE_SAFETY_ANALYSIS.md) - 餘額計算安全性分析
- [docs/CACHE_SYSTEM_ANALYSIS.md](docs/CACHE_SYSTEM_ANALYSIS.md) - 快取系統完整分析
- [docs/OFFLINE_ANALYSIS.md](docs/OFFLINE_ANALYSIS.md) - 離線功能完整分析
- [docs/OFFLINE_TESTING_GUIDE.md](docs/OFFLINE_TESTING_GUIDE.md) - 離線防重複機制測試指南

### 開發指南 🛠️
- [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - 測試指南
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Firebase 部署指南
- [docs/ICON_GUIDE.md](docs/ICON_GUIDE.md) - 圖示與 PWA 配置

### Firebase 配置
- [docs/FIRESTORE_INDEXES.md](docs/FIRESTORE_INDEXES.md) - Firestore 索引需求
- firestore.rules - Firestore 安全規則
- storage.rules - Firebase Storage 安全規則
- `android/app/google-services.json` - Firebase Android 配置（包含 SHA-1）

### Capacitor 配置
- [capacitor.config.json](capacitor.config.json) - **關鍵配置文件**
  - ⚠️ 必須明確聲明使用的插件與 provider
  - Firebase Authentication 需要聲明 `providers: ["google.com"]`
  - 未來新增認證方式（Apple、Facebook）也需在此聲明

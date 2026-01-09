
## [5.9.0] - 2026-01-10

### 📈 趨勢分析功能大升級（六大優化完成）

**分析頁面新增趨勢分析 Tab，支援每日/每週/每月花費趨勢圖表，並完成六項用戶體驗優化**

#### 主要新增功能

1. **趨勢分析核心功能** 📊
   - 新增「趨勢分析」Tab（與統計分析並列）
   - 支援每日（daily）、每週（weekly）、每月（monthly）時間粒度
   - 日期範圍選擇：7 天、30 天、90 天、自訂範圍
   - 類別篩選：全部、吃吃、住住、行行、玩玩等
   - 雙圖表模式：折線圖（Trend Chart）和長條圖（Vertical Bar Chart）
   - 統計摘要卡片：平均、最高、筆數（點擊最高卡片顯示詳情）

2. **自訂日期範圍選擇** 📅
   - 趨勢分析支援「自訂」按鈕，開啟日期區間選擇器
   - DateRangePicker 新增 `openModalForTrend()` 方法
   - 使用 `isTrendDateSelection` 標記區分不同頁面的日期選擇
   - AnalyticsPage 新增 `applyCustomTrendRange()` 方法處理自訂範圍

3. **最高值詳情彈窗** 💡
   - 點擊「最高」卡片顯示該時段的交易明細
   - 彈窗顯示：時段標籤、總金額、交易筆數
   - 列出前 5 筆交易（項目名稱、類別、日期、金額）
   - 童話風格設計（水彩陰影、圓角、漸層色）

4. **類別篩選最高值修正** 🔧
   - 修復：切換類別時最高值不更新的問題
   - `getTrendSummary()` 方法新增 `category` 參數
   - 計算最高值前先依類別篩選交易
   - 返回 `maxDetail` 物件（包含該時段所有交易）

5. **移動端觸控互動支援** 📱
   - TrendChart.js 新增長按（500ms）顯示 tooltip
   - VerticalBarChart.js 新增長按（500ms）顯示 tooltip
   - 點擊外部區域自動關閉 tooltip
   - 新增 `bindGlobalTouchEvents()` 和 `destroy()` 方法

6. **圖表全螢幕放大檢視** 🔍
   - 圖表右上角新增放大按鈕（expand icon）
   - 點擊後全螢幕黑底彈窗顯示大尺寸圖表
   - 自動調整圖表尺寸（最大 1200x600）
   - 右上角關閉按鈕（X icon）返回原頁面

#### 技術實現

**新增檔案：**
- `js/components/TrendChart.js` (644 行) - SVG 折線圖組件
- `js/components/VerticalBarChart.js` (601 行) - SVG 長條圖組件
- `css/components/trend-analysis.css` (375 行) - 趨勢分析樣式

**修改檔案：**
- `js/data.js` - 新增 `getTrendData()`, `getDateKey()`, `getISOWeek()`, 修改 `getTrendSummary()`
- `js/pages/AnalyticsPage.js` - 新增趨勢分析邏輯、圖表渲染、全螢幕功能
- `js/components/DateRangePicker.js` - 新增 `openModalForTrend()`, `applyForTrend()`
- `js/core/EventBinder.js` - 綁定趨勢分析所有事件（範圍、粒度、類別、圖表切換、放大）
- `index.html` - 新增趨勢分析 Tab 與全螢幕彈窗
- `css/main.css` - 引入 `trend-analysis.css`

#### 資料結構與演算法

**趨勢資料格式：**
```javascript
// data.js → getTrendData()
return {
  data: [
    { label: '2024-01-15', values: [150, 200, 350] },  // 每日
    { label: '2024-W03', values: [1050, 1200, 2250] }, // 每週
    { label: '2024-01', values: [4500, 5200, 9700] }   // 每月
  ],
  legends: ['寶寶', '步步', '總花費']
};
```

**ISO 週數計算：**
- 使用 `getISOWeek()` 計算符合 ISO 8601 標準的週數
- 每週從星期一開始（getDay() === 1）
- 年度第一週：包含 1 月 4 日的那一週

**移動端觸控事件流程：**
1. `touchstart` → 啟動 500ms 計時器
2. 500ms 後 → 顯示 tooltip，標記 `currentTouchPoint`
3. `touchend` / `touchcancel` → 清除計時器
4. 點擊外部 → 隱藏 tooltip，清除標記

#### UI/UX 設計亮點

1. **Tab 切換動畫** ✨
   - 光澤掃過效果（`::before` 漸層平移）
   - 內容淡入上升動畫（`fadeInUp 0.4s`）

2. **按鈕互動效果** 🎯
   - 懸停：上浮 + 放大（`translateY(-2px) scale(1.05)`）
   - 選中：果凍彈跳動畫（`jellyBounce 0.5s`）

3. **圖表動畫** 🎨
   - 折線圖：線條繪製動畫（`stroke-dashoffset`）
   - 數據點：彈入動畫（`popIn 0.3s`）
   - 長條圖：上升動畫（`cubic-bezier` 彈性曲線）

4. **Tooltip 樣式** 💬
   - 毛玻璃背景（`backdrop-filter: blur(10px)`）
   - 淡入動畫（`tooltipFadeIn 0.15s`）
   - 粉色邊框（`border: 2px solid #FFB5D8`）

5. **全螢幕彈窗** 🖼️
   - 黑底半透明（`bg-black/95 backdrop-blur-md`）
   - 白色圓角內容區（`rounded-2xl shadow-watercolor-layered`）
   - 平滑過渡動畫

#### 響應式設計

**移動端優化（max-width: 768px）：**
- 按鈕文字縮小（`font-size: 10px`）
- 按鈕內邊距減少（`padding: 0.4rem 0.6rem`）
- 統計摘要文字縮小（`font-size: 1rem`）
- 圖表容器內邊距減少（`padding: 0.75rem`）

#### 測試與驗證

✅ 用戶測試通過：「我測試成功了！很棒 你很用心呢！」

**測試項目：**
1. Tab 切換動畫流暢
2. 日期範圍選擇正常（包含自訂範圍）
3. 時間粒度切換計算正確
4. 類別篩選最高值更新正常
5. 最高卡片點擊顯示詳情彈窗
6. 移動端長按顯示 tooltip
7. 圖表全螢幕放大正常

---

## [5.8.3] - 2026-01-10

### 📚 文檔重整與工作流程優化

**專案文檔結構化整理，建立標準化開發工作流程**

#### 主要改進

1. **文檔結構重整** 📂
   - 拆分 CHANGELOG.md（3761 行）到 `docs/changelog/` 資料夾
   - 建立版本總覽（`docs/changelog/README.md`）
   - 各版本資料夾建立 README.md（v1~v5）
   - 移動所有技術文檔到 `docs/` 資料夾
   - 建立文檔索引（`docs/README.md`）

2. **完成階段工作流程** 🔄
   - 在 CLAUDE.md 新增完整工作流程章節
   - 明確定義版本記錄更新規則（命名規則、內容格式）
   - Commit Message 格式規範
   - 文檔更新標準流程（4 步驟）

3. **文檔連結更新** 🔗
   - 更新 CLAUDE.md 所有文檔連結（指向 docs/）
   - 更新 README.md 專案結構與文檔連結
   - 修正所有相互引用的文檔路徑

4. **版本資訊更新** 🏷️
   - CLAUDE.md 版本號更新為 v5.8.2
   - README.md 版本號更新為 v5.8.2
   - 新增 v5.8.2 版本更新記錄

#### 檔案變更

**新增：**
- `docs/changelog/README.md` - 版本總覽
- `docs/changelog/v1/README.md` - v1 版本摘要
- `docs/changelog/v2/README.md` - v2 版本摘要
- `docs/changelog/v3/README.md` - v3 版本摘要
- `docs/changelog/v4/README.md` - v4 版本摘要
- `docs/changelog/v5/README.md` - v5 版本摘要

**修改：**
- `CLAUDE.md` - 新增工作流程章節、更新參考文件
- `README.md` - 更新專案結構、版本號、文檔連結
- `docs/README.md` - 更新文檔列表與分類

**移動：**
- 根目錄技術文檔 → `docs/`（11 個檔案）

**刪除：**
- `CHANGELOG.md` - 已拆分到 docs/changelog/

#### 文檔結構

```
docs/
├── README.md                 # 文檔索引
├── changelog/                # 版本歷史
│   ├── README.md            # 版本總覽
│   └── v1~v5/               # 各版本詳細記錄與摘要
├── ANDROID_BUILD_GUIDE.md   # Android 建置指南
├── BALANCE_SAFETY_ANALYSIS.md
├── CACHE_SYSTEM_ANALYSIS.md
├── OFFLINE_ANALYSIS.md
└── ...更多技術文檔
```

#### 使用指南

開發完成後請遵循「完成階段工作流程」：
1. 更新版本記錄（`docs/changelog/v{X}/`）
2. 建立或更新說明文檔（如需要）
3. 更新核心文檔（CLAUDE.md、README.md，必要時）
4. Commit 並 Push 到 GitHub

詳見：[CLAUDE.md - 完成階段工作流程](../../CLAUDE.md#完成階段工作流程-📋)

---

## [5.8.2] - 2026-01-09

### 🔒 完善離線防重複機制

**擴展防重複機制至編輯和刪除操作**

#### 新增修正

5. **編輯交易防重複機制** ([data.js:571-731](js/data.js#L571-L731))
   - `updateTransaction()` 加入操作去重邏輯
   - 操作指紋：`update_{id}_{contentHash}`
   - 3 秒內相同編輯操作直接拒絕
   - 防止離線時重複修改導致衝突

6. **刪除交易防重複機制** ([data.js:499-585](js/data.js#L499-L585))
   - `deleteTransaction()` 加入操作去重邏輯
   - 操作指紋：`delete_{id}`
   - 防止重複刪除導致餘額多次扣減

#### 完整離線處理分析
詳見 [docs/OFFLINE_ANALYSIS.md](docs/OFFLINE_ANALYSIS.md)

#### 測試場景
- ✅ 離線新增：連續點擊 → 只產生 1 筆操作
- ✅ 離線編輯：連續修改 → 只接受第一次編輯
- ✅ 離線刪除：連續刪除 → 只執行一次刪除

---

## [5.8.1] - 2026-01-09

### 🔒 修復離線重複提交問題

**解決離線時重複點擊「記入日記」導致多筆相同交易的 Bug**

#### 問題描述
- 離線時連續點擊提交按鈕，Firebase 離線持久化會將每次操作排隊
- 重新上線後所有排隊操作一次執行，導致出現多筆相同的交易記錄

#### 修復內容

1. **表單提交防抖機制** ([TransactionForm.js](js/components/TransactionForm.js:395-422))
   - 提交時禁用按鈕，顯示「⏳ 處理中...」狀態
   - 防止用戶重複點擊
   - 30 秒超時自動恢復（避免卡死）
   - finally 區塊確保按鈕必定恢復

2. **客戶端操作去重機制** ([data.js](js/data.js:271-376))
   - 新增 `_pendingOperations` Set 追蹤進行中的操作
   - 為每次操作生成唯一指紋（基於關鍵欄位 + 秒級時間戳）
   - 同一秒內相同內容的操作直接拒絕
   - 3 秒後自動清除操作標記（避免永久阻塞）

3. **離線提示強化** ([NetworkMonitor.js](js/core/NetworkMonitor.js:45))
   - 離線模式提示文字改為「操作將排隊，連線後自動同步（請勿重複點擊）」
   - 明確告知用戶不要重複操作

4. **錯誤處理優化** ([TransactionForm.js](js/components/TransactionForm.js:545-552))
   - 檢測離線錯誤（error.code === 'unavailable'）
   - 離線時顯示友善提示「交易已排隊，將在重新連線後同步」
   - 仍然關閉表單（因為資料已排隊）

#### 技術細節
```javascript
// 操作指紋生成邏輯
_generateOperationId(data) {
  return JSON.stringify({
    payer: data.payer,
    beneficiary: data.beneficiary,
    amount: data.amount,
    item_name: data.item_name,
    date: data.date,
    timestamp: Math.floor(Date.now() / 1000)  // 秒級時間戳
  });
}
```

#### 影響範圍
- 交易新增流程
- 離線模式行為
- 表單提交邏輯

---

## [5.8.0] - 2026-01-09

### 🎨 UI/UX 體驗大升級 + 🔙 Android 返回鍵智能處理

**全面提升互動體驗：手機版 UI 優化、表單體驗、拖曳回饋、返回鍵邏輯**

#### 新增功能

1. **Android 返回鍵智能處理系統** 🔙
   - 建立三級優先級處理系統：
     - **優先級 1**：關閉開啟的彈窗或表單（TransactionForm、TransactionDetail、NotificationPanel、DateRangePicker）
     - **優先級 2**：返回首頁（如果在其他頁面）
     - **優先級 3**：退出應用（僅在首頁且無彈窗時）
   - 新增 `BackButtonHandler.js` 核心模組（堆疊式管理）
   - MainActivity 攔截 `onBackPressed()` 事件並傳遞到前端
   - 支援瀏覽器環境模擬（ESC 鍵）
   - 所有彈窗組件已整合返回鍵邏輯

2. **手機版 UI 全面優化** 📱
   - 更激進的元素縮小（字體 12px → 11px，行高 1.4 → 1.3）
   - 所有間距減少 15-25%（spacing-sm: 4px → 3px 等）
   - 頂部導航：50px → 46px
   - 底部導航：60px → 56px
   - 交易項目圖示：32px → 28px
   - 結算卡片、表單、按鈕等全面縮小
   - 提升畫面資訊密度，一次顯示更多內容

3. **新增花費表單體驗優化** 💰
   - 改為底部對齊（從下方滑出，無上方漏洞感）
   - 開啟表單自動 focus 金額欄位
   - 行動裝置自動彈出鍵盤
   - 延遲 300ms 確保動畫完成再 focus
   - 優化彈窗布局結構（fixed bottom）

4. **帳本拖曳互動大升級** 🎯
   - **震動回饋系統**：
     - 開始拖曳：medium 震動（20ms，重擊感）
     - 移動位置：light 震動（10ms，輕微回饋）
     - 放置成功：success 震動（雙擊確認）
   - **精緻動畫效果**：
     - 選中狀態（`.sortable-chosen`）：放大 1.05x + 旋轉 2deg + 粉色陰影
     - 拖曳中（`.sortable-drag`）：放大 1.08x + 旋轉 3deg + 粉色邊框 + 上下漂浮動畫
     - 占位符（`.sortable-ghost`）：縮小 0.95x + 虛線邊框 + 呼吸脈動動畫
   - **果凍彈跳 easing**：`cubic-bezier(0.34, 1.56, 0.64, 1)`
   - **多平台震動支援**：Capacitor Haptics API + Web Vibration API

5. **Android 全螢幕模式** 🖼️
   - 隱藏狀態列與導航列（透明背景）
   - 支援瀏海屏延伸至邊緣
   - 沉浸式行為（滑動暫時顯示系統列）
   - 從其他 App 返回時保持全螢幕

#### 技術實現

**BackButtonHandler 核心架構：**
- 堆疊式處理器管理（LIFO，後進先出）
- `register(name, callback)` 註冊處理器
- `handleBackButton()` 執行優先級邏輯
- 支援多層彈窗堆疊（詳情 → 列表 → 首頁）

**震動回饋封裝：**
```javascript
vibrate(type) {
  // Capacitor: Haptics.impact({ style: 'MEDIUM' })
  // Browser: navigator.vibrate(20)
}
```

**拖曳動畫層次：**
```
選中 → 拖曳中 → 占位符
1.05x  →  1.08x  →  0.95x
2deg   →   3deg   →   0deg
粉影   →  粉框   →  虛線
```

#### 檔案變更

**新增：**
- `js/core/BackButtonHandler.js` - 返回鍵處理器

**修改：**
- `android/app/src/main/java/com/baobu/moneytrack/MainActivity.java` - 攔截返回鍵
- `android/app/src/main/res/values/styles.xml` - 全螢幕主題
- `js/app.js` - 初始化 BackButtonHandler
- `js/components/TransactionForm.js` - 返回鍵 + 自動 focus
- `js/components/TransactionDetail.js` - 返回鍵整合
- `js/components/NotificationPanel.js` - 返回鍵整合（面板 + 詳情）
- `js/components/DateRangePicker.js` - 返回鍵整合
- `js/pages/NotebooksPage.js` - 震動回饋 + 拖曳事件
- `css/components/bottom-sheet.css` - 底部對齊布局
- `css/components/notebooks.css` - 精緻拖曳動畫
- `css/utilities/responsive.css` - 手機版 UI 全面縮小

#### 使用者體驗提升

- ✅ 返回鍵關閉表單（而非直接退出 App）
- ✅ 返回鍵關閉通知面板與詳情
- ✅ 返回鍵從其他頁面回到首頁
- ✅ 開啟表單即可直接輸入金額（減少 1 次點擊）
- ✅ 表單從底部滑出無漏洞感
- ✅ 拖曳帳本有觸覺回饋（3 階段震動）
- ✅ 拖曳動畫更精緻（放大/旋轉/漂浮/脈動）
- ✅ 手機版視野更廣（元素全面縮小）
- ✅ 全螢幕沉浸式體驗

#### 相容性

- Android：完整支援（返回鍵 + 震動 + 全螢幕）
- iOS：部分支援（震動，返回鍵需實作）
- 瀏覽器：模擬支援（ESC 鍵 + Vibration API）

---

## [5.7.2] - 2026-01-09

### 🤖 Android APK 自動化建置腳本

**新增自動化建置腳本，一鍵完成 APK 建置流程**

#### 新增功能

1. **自動化建置腳本** 🚀
   - 新增 `build-android.sh`（Linux/macOS）
   - 新增 `build-android.bat`（Windows）
   - 自動執行完整建置流程：
     - ✅ Web 資源建置（`npm run build`）
     - ✅ Capacitor 同步（`npx cap sync`）
     - ✅ Java 版本修正（VERSION_21 → VERSION_17）
     - ✅ APK 建置（`gradlew clean assembleDebug`）
   - 建置完成後自動顯示 APK 位置與安裝提示

2. **文檔更新** 📚
   - 更新 `README.md`：新增「Android APK 建置」章節
   - 詳細說明自動化腳本使用方式
   - 新增手動建置流程參考連結
   - 新增 APK 安裝到手機的兩種方法
   - 新增重要提醒事項（Java 版本、配置要求等）

3. **CLAUDE.md 優化**
   - 版本號更新為 v5.7.2
   - 建置腳本相關文檔已在 v5.7.1 補充

#### 腳本特色

- ✅ **跨平台支援**：Windows (.bat) / Linux & macOS (.sh)
- ✅ **錯誤處理**：每個步驟失敗會自動停止並顯示錯誤訊息
- ✅ **友善提示**：使用 Emoji 和清晰的步驟說明
- ✅ **自動修正**：使用 PowerShell/sed 自動修正 Java 版本
- ✅ **完整提示**：建置成功後顯示 APK 位置和安裝方法

#### 使用方式

**Windows：**
```bash
./build-android.bat
```

**Linux / macOS：**
```bash
chmod +x build-android.sh  # 首次執行
./build-android.sh
```

#### 技術實現

**Windows 版本（build-android.bat）：**
- 使用 `@echo off` 和 `call` 確保指令正確執行
- 使用 PowerShell 的 `Get-Content` 和 `Set-Content` 替換檔案內容
- 使用 `%errorlevel%` 檢查每個步驟的執行狀態
- 使用 `pause` 讓使用者查看結果後再關閉視窗

**Linux / macOS 版本（build-android.sh）：**
- 使用 `#!/bin/bash` shebang
- 使用 `sed` 或 PowerShell（Windows Git Bash）替換檔案內容
- 使用 `$?` 檢查每個步驟的執行狀態
- 自動判斷作業系統類型選擇適當的 sed 指令

#### 檔案變更

- **新增：** `build-android.sh` - Linux/macOS 建置腳本
- **新增：** `build-android.bat` - Windows 建置腳本
- **修改：** `README.md` - 新增 Android APK 建置章節
- **修改：** `CHANGELOG.md` - 記錄 v5.7.2 變更
- **修改：** `CLAUDE.md` - 版本號更新

#### 下次可優化

- [ ] 支援 Release 版本建置（需要 Keystore 配置）
- [ ] 支援自動安裝到連接的手機（adb install）
- [ ] 支援建置版本號自動遞增
- [ ] 支援 APK 自動簽名（目前只有 Debug 版本）

---

## [5.7.1] - 2026-01-09

### 🤖 Android APK 建置修復

**修復 Google 登入功能在 Android 原生環境中的運作問題**

#### 問題現象
- Android APK 中點擊 Google 登入按鈕出現錯誤
- 錯誤訊息：`GoogleAuthProviderHandler` 為 null 導致的 NullPointerException

#### 根本原因
- Capacitor Firebase Authentication 插件採用**按需初始化**策略
- 必須在 `capacitor.config.json` 中明確聲明需要的認證 provider
- 未配置時 `GoogleAuthProviderHandler` 不會被初始化

#### 修復內容

1. **新增 Capacitor 插件配置** ⭐ **關鍵修復**
   - 檔案：`capacitor.config.json`
   - 新增 `FirebaseAuthentication` 插件配置
   - 明確聲明使用 `google.com` provider
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

2. **修正 Java 版本相容性**
   - 檔案：`android/app/capacitor.build.gradle`
   - Capacitor 8.0.0 預設 Java 21，本地環境為 Java 17
   - 修改 `sourceCompatibility` 和 `targetCompatibility` 為 `VERSION_17`
   - **注意：** 每次 `npx cap sync` 後需要重新修改此檔案

3. **明確註冊 Firebase Authentication 插件**
   - 檔案：`android/app/src/main/java/com/baobu/moneytrack/MainActivity.java`
   - 在 `onCreate` 方法中明確呼叫 `registerPlugin()`
   - 確保插件在應用啟動時被正確載入

#### 新增文件
- **`ANDROID_BUILD_GUIDE.md`**：完整的 Android 建置指南
  - 詳細記錄試錯過程與解決方案
  - 包含常見問題排查步驟
  - 提供建置腳本範例
  - 說明下次注意事項與最佳實踐

#### 技術細節

**插件初始化邏輯：**
```java
// FirebaseAuthentication.java
private void initAuthProviderHandlers(FirebaseAuthenticationConfig config) {
    List<String> providerList = Arrays.asList(config.getProviders());
    if (providerList.contains(ProviderId.GOOGLE)) {
        googleAuthProviderHandler = new GoogleAuthProviderHandler(this);
    }
}
```

**建置流程：**
1. `npx cap sync` - 同步配置到原生專案
2. 修正 `capacitor.build.gradle` 的 Java 版本
3. `cd android && ./gradlew clean assembleDebug` - 建置 APK

#### 影響範圍
- ✅ Android 原生 APK 的 Google 登入功能已修復
- ✅ Web 版本不受影響（原本就正常運作）
- ✅ 未來新增其他認證方式（Apple、Facebook 等）時需要在配置中聲明

#### 下次注意事項
1. 使用 Capacitor 插件前先檢查官方文檔的配置需求
2. 遇到 NullPointerException 時優先檢查配置完整性
3. 注意自動生成檔案（如 `capacitor.build.gradle`）的版本管理
4. 考慮建立自動化建置腳本避免重複手動修改

---

## [5.7.0] - 2026-01-07

### 📚 帳本拖曳排序功能

**「我們的故事書」現在可以自由排序了！**

#### 主要功能

1. **拖曳排序帳本** 🎯
   - 長按任意帳本，拖曳即可調整順序
   - 手機防誤觸設計（200ms 延遲）
   - 流暢的拖曳動畫（150ms 過渡）
   - 清楚的視覺回饋：半透明、虛線邊框、旋轉效果

2. **永久儲存順序** 💾
   - 使用 Firebase `writeBatch` 批次更新，節省寫入次數
   - 重新整理後順序不變
   - 即時同步到雲端，多裝置保持一致

3. **相容性處理** ✅
   - 自動為舊帳本補充 `order` 欄位（預設為 0）
   - 新增帳本自動排在最後
   - 本地快取即時更新，無需重新載入

#### 技術實現

1. **Firebase API 層（firebase-config.js）**
   - 新增 `writeBatch` 模組引入
   - 修改 `getNotebooks()`：查詢時按 `order` 欄位升序排序
   - 修改 `addNotebook()`：新增 `order` 參數
   - 新增 `batchUpdateNotebookOrders(coupleId, updates)`：批次更新帳本順序

2. **資料管理層（data.js）**
   - 修改 `addNotebook()`：自動計算新帳本的 `order` 值（排在最後）
   - 新增 `reorderNotebooks(newOrderedIds)`：
     - 接收拖曳後的新 ID 陣列
     - 呼叫 Firebase API 批次更新
     - 同步更新本地快取並觸發 UI 更新

3. **UI 層（NotebooksPage.js）**
   - 新增 `sortableInstance` 實例變數
   - 新增 `initSortable(container)` 方法：初始化 SortableJS
     - 設定拖曳參數（動畫、延遲、防誤觸）
     - 排除「新增按鈕」不可拖曳
   - 新增 `handleSortEnd(evt)` 方法：處理拖曳結束事件

4. **樣式層（notebooks.css）**
   - 新增 `.sortable-ghost` 樣式：拖曳時的視覺效果
   - 新增游標樣式：`cursor: grab` 和 `cursor: grabbing`

5. **模組載入（index.html）**
   - 在 Firebase Firestore 引入中加入 `writeBatch` 模組
   - 在 `window.firebaseModules` 中匯出 `writeBatch`

#### 修改檔案

- `js/firebase-config.js`（新增批次更新 API）
- `js/data.js`（新增排序管理方法）
- `js/pages/NotebooksPage.js`（整合拖曳功能）
- `css/components/notebooks.css`（新增拖曳樣式）
- `index.html`（載入 writeBatch 模組）

#### 設計特色

- **流暢體驗**：150ms 動畫 + 200ms 防誤觸，絕佳的操作手感
- **視覺回饋**：拖曳時半透明、虛線邊框、旋轉效果，清楚知道正在移動
- **資料安全**：批次更新、錯誤處理、本地同步，確保資料不遺失
- **跨裝置一致**：雲端即時同步，所有裝置看到相同順序

#### 使用方式

1. 進入「我們的故事書」頁面
2. 長按任意帳本封面
3. 拖曳到想要的位置
4. 放開手指，順序自動儲存
5. 重新整理頁面，順序保持不變

---

## [5.6.2] - 2026-01-07

### 🎨 UI 層級優化 + 🐛 通知初始化修復

**通知詳情彈窗的毛玻璃效果、層級修正，以及通知初始化 Bug 修復！**

#### 主要改進

1. **修正 Z-Index 層級問題** 🔧
   - 問題：通知面板（z-index: 9999）會遮擋詳情彈窗（z-index: 120）
   - 解決方案：將詳情彈窗的 z-index 提升至 10010，確保覆蓋在通知面板之上
   - 用戶現在可以正常查看通知的詳細變更資訊

2. **新增毛玻璃效果（Glassmorphism）** ✨
   - 詳情彈窗背景遮罩：`backdrop-filter: blur(12px)` + `bg-white/10`
   - 詳情彈窗主體：`backdrop-filter: blur(8px)` + `bg-paper/95`
   - 添加 `-webkit-backdrop-filter` 前綴，確保 Safari 瀏覽器相容性
   - 保持童話風格，圓角與陰影設計不變

3. **修復通知初始化 Bug** 🐛
   - **問題**：登入後沒有顯示通知，直到修改一筆資料後才全部顯示
   - **根本原因**：初始化順序錯誤
     - `DataManager.init()` 啟動 activities 監聽器（第332行）
     - 立即接收到現有通知數據並調用 `state.notify()`
     - 但 `NotificationPanel.init()` 要到第351行的 `app.init()` 才執行
     - 導致初始數據在訂閱之前就發送了，因此丟失
   - **解決方案**：將 `NotificationPanel.init()` 提前到 `initComponents()` 中執行
     - 確保在 DataManager 啟動監聽器之前就已訂閱 state
     - 現在登入後立即顯示所有現有通知

#### 技術實現

1. **index.html**
   - `#notificationDetailModal` - z-index 從 120 提升至 10010
   - `#notificationDetailOverlay` - 新增毛玻璃效果（blur 12px）
   - 詳情彈窗主體 - 新增毛玻璃背景（blur 8px，95% 透明度）

2. **app.js**
   - `initComponents()` - 在創建 NotificationPanel 實例後立即調用 `init()`
   - 移除 `app.init()` 中重複的初始化代碼
   - 確保訂閱順序：NotificationPanel 訂閱 → DataManager 啟動監聽器

#### 修改檔案

- `index.html`（通知詳情彈窗 z-index 與毛玻璃效果）
- `js/app.js`（NotificationPanel 初始化時機調整）

#### 設計特色

- **層級清晰**：詳情彈窗永遠覆蓋在通知面板之上
- **毛玻璃美學**：現代感的半透明背景，保持內容可讀性
- **跨瀏覽器相容**：同時支援標準和 WebKit 前綴
- **即時通知**：登入後立即顯示所有現有通知，無需等待觸發

---

## [5.6.1] - 2026-01-07

### 🐛 Bug 修復與功能優化

**時間軸交互體驗升級！**

#### 主要改進

1. **修復時間軸折疊/展開 Bug** 🔧
   - 修復點擊摘要卡片後交易記錄消失的問題
   - 根本原因：折疊/展開時從 `DataManager.getTransactions()` 獲取資料，但因防抖延遲導致返回空陣列
   - 解決方案：在 `TimelineView` 中新增交易快取機制（`cachedTransactions`）
   - 折疊/展開時使用快取資料，確保資料不遺失

2. **日期標題可點擊展開/收合** 🎯
   - 日期標題（今天、昨天、X月X日）現在可以點擊
   - 新增 hover 效果（背景變粉、邊框加深、陰影增強）
   - 提供兩種展開方式：點擊日期標題 或 點擊摘要卡片

3. **重新設計摘要卡片內容** 💰
   - **有欠款時**：顯示醒目的粉色欠款徽章（例：「🐾 步欠🎀 寶 $100」）
   - **已結清時**：顯示可愛的綠色已結清徽章（✨ 已結清）
   - 詳細資訊行：簡潔的三欄布局（共花 | 🎀 寶 | 🐾 步）
   - 新增當日欠款計算邏輯（使用與 BalanceManager 一致的算法）

#### 技術實現

1. **TimelineView.js**
   - 新增 `cachedTransactions` 屬性（快取最後收到的交易列表）
   - 修改 `handleTransactionsUpdate()` - 自動更新快取
   - 修改 `toggleDateExpansion()` - 使用快取資料而非重新獲取
   - 修改 `toggleAllExpansion()` - 使用快取資料而非重新獲取
   - 修改 `calculateDayStats()` - 新增當日欠款計算（baobaoOwed, bubuOwed, debtInfo）
   - 修改 `renderDateBlock()` - 根據欠款狀態渲染不同徽章
   - 修改 `renderDateDivider()` - 日期標籤可點擊 + hover 效果
   - 修改 `bindSummaryClicks()` - 同時綁定摘要卡片和日期標題

2. **transaction-list.css**
   - 新增 `.summary-debt-badge` - 粉色欠款徽章（漸變背景 + 圓角藥丸）
   - 新增 `.summary-settled-badge` - 綠色已結清徽章
   - 新增 `.summary-details` - 詳細資訊行
   - 新增 `.summary-detail-item` - 單個詳細項目（縮小字體）
   - 新增 `.summary-divider-thin` - 細分隔線
   - 移除舊的 `.summary-content` 相關樣式

#### 修改檔案

- `js/components/TimelineView.js`（+3 行快取機制，重構 calculateDayStats 和 renderDateBlock）
- `css/components/transaction-list.css`（重構摘要卡片樣式）

#### 設計特色

- **智能欠款提示**：自動計算當日淨欠款，優先顯示欠款資訊
- **軟萌可愛風格**：粉色欠款徽章 + 綠色已結清徽章，保持童話風格
- **一致性算法**：使用與 BalanceManager 相同的欠款計算邏輯
- **流暢交互**：多種展開方式，靈活操作

---

## [5.6.0] - 2026-01-07

### 🎨 UI/UX 大升級

**主頁時間軸與日曆頁面的沉浸式體驗優化！**

#### 主要改進

1. **主頁時間軸折疊/展開功能** ✨
   - 保留原本精緻的 LINE 對話風格日期分隔線
   - 今天預設展開，其他日期預設收合
   - 收合時顯示簡潔的統計摘要卡片（共花 | 寶花 | 步花）
   - 點擊摘要卡片即可展開/收合
   - 新增全域控制按鈕（一鍵展開/收合所有日期）

2. **統計摘要卡片設計** 💰
   - 柔和的漸變背景（童話風格）
   - 清楚的三欄布局（共花 / 🎀 寶花 / 🐾 步花）
   - Hover 時上浮 + 邊框變色
   - 底部提示「點擊展開 ✨」

3. **日曆頁面模式切換器** 📅
   - 全新的 Segmented Control 設計（童話風格）
   - 📅 單日模式 / 📊 區間模式
   - 可愛的滑動背景條（粉紅漸變 → 藍紫漸變）
   - 點擊時的果凍彈跳動畫（jelly-bounce）
   - 移除冗餘的提示文字，介面更乾淨

4. **動畫效果** 💫
   - 平滑的高度過渡（0.4s cubic-bezier）
   - Hover 時輕微上移（translateY -2px）
   - 點擊時的縮放回饋（scale 0.98）
   - 圖示放大效果（active 時 scale 1.15）

#### 技術實現

1. **TimelineView.js** 重構（+120 行）
   - 新增折疊/展開狀態管理（expandedDates, allExpanded）
   - 新增 `renderDateBlock()` - 渲染日期區塊
   - 新增 `renderDateDivider()` - 精緻日期分隔線
   - 新增 `calculateDayStats()` - 計算當日統計
   - 新增 `bindSummaryClicks()` - 綁定摘要卡片點擊
   - 新增 `toggleDateExpansion()` - 切換日期展開/收合
   - 新增 `toggleAllExpansion()` - 切換全部展開/收合

2. **CSS 新增** (transaction-list.css +90 行)
   - `.date-group` - 日期組容器
   - `.day-summary-card` - 統計摘要卡片
   - `.date-transactions-wrapper` - 交易列表包裝器
   - `.timeline-toggle-btn` - 全域控制按鈕

3. **CSS 新增** (calendar.css +95 行)
   - `.mode-switcher-container` - Segmented Control 容器
   - `.mode-option` - 模式選項
   - `.mode-slider` - 滑動背景條
   - `@keyframes jelly-bounce` - 果凍彈跳動畫

4. **HTML 更新**
   - 新增全域展開/收合按鈕（時間軸標題右側）
   - 重構日曆頁面模式切換器（新版 Segmented Control）

5. **app.js 集成**
   - 綁定全域展開/收合按鈕事件

6. **CalendarPage.js 更新**
   - 更新 `toggleMode()` 方法以支援新版切換器

#### 修改檔案

- `js/components/TimelineView.js`（+120 行）
- `css/components/transaction-list.css`（+90 行）
- `css/components/calendar.css`（+95 行）
- `index.html`（修改時間軸標題、日曆切換器）
- `js/app.js`（+12 行）
- `js/pages/CalendarPage.js`（重構 toggleMode）

### 🎨 設計特色

- **軟萌童話風格**：馬卡龍色系漸變、柔和圓角、可愛 Emoji
- **沉浸式體驗**：乾淨介面、直覺操作、即時視覺回饋
- **流暢動畫**：cubic-bezier 緩動、果凍彈跳、平滑過渡
- **一致性**：統一的設計語言（色彩、圓角、陰影）

---

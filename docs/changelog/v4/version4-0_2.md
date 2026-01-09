
## [4.2.0] - 2026-01-06

### 🐛 重大修復 (Critical Fix)

#### 💸 修復付款人角色錯亂的致命 Bug

**問題**：新增交易時，無論選擇哪個付款人，都會被錯誤儲存為「步步」

- ❌ **錯誤現象**：
  - 選擇「寶寶付款」→ 實際儲存為「步步付款」
  - 寶幫步出 → 錯誤變成 步幫步出
  - 寶幫共付 → 錯誤變成 步幫共付
  - 如果是「步出」（步步為自己付款），會出現 Firebase 錯誤：`payer` 欄位值為 `undefined`
  - 導致整個欠款邏輯和分析頁面計算錯誤

- 🔍 **根本原因**：
  - 表單 HTML 使用**相對值**（`value="me"` / `value="partner"`）
  - 但表單**顯示固定的絕對角色**（「寶寶」/「步步」）
  - 造成邏輯混亂：
    - 不管誰登入，選「寶寶」都提交 `value="me"`
    - 如果**步步**登入，`me` 會被轉換為 `bubu`
    - 如果**寶寶**登入，`partner` 會被轉換為 `bubu`（如果伴侶是步步）
    - 未配對時，`partner.role` 為 `undefined`，導致 Firebase 錯誤

- ✅ **修復方案**：
  1. **統一使用絕對角色**（`'baobao'` | `'bubu'`）
     - 表單 `value` 從 `me/partner` 改為 `baobao/bubu`
     - `beneficiary` 從 `self/partner/both` 改為 `baobao/bubu/both`
  2. **移除不必要的轉換邏輯**
     - 簡化 `DataManager.addTransaction()`
     - 更新 `calculateBalance()` 中的 beneficiary 判斷
  3. **修復所有顯示層的判斷邏輯**
     - 4 個顯示相關檔案全部改用絕對角色判斷

### 🔧 修改的檔案

1. **`index.html`** - 表單元素
   - ✅ 付款人 `payer` 改為 `value="baobao"` / `value="bubu"`
   - ✅ 受益人 `beneficiary` 改為 `value="baobao"` / `value="bubu"` / `value="both"`

2. **`js/data.js`** - 資料管理
   - ✅ `addTransaction()` - 移除相對值轉換邏輯
   - ✅ `calculateBalance()` - 更新 beneficiary 判斷（從 `'self'`/`'partner'` 改為 `'baobao'`/`'bubu'`）

3. **`js/components/TransactionRenderer.js`** - 交易渲染器
   - ✅ `getPaymentText()` - 付款描述邏輯
   - ✅ 時間軸視圖的 beneficiary 文字判斷

4. **`js/pages/CalendarPage.js`** - 日曆頁面
   - ✅ `renderListItem()` - 交易項目渲染邏輯

5. **`js/pages/AnalyticsPage.js`** - 分析頁面
   - ✅ `renderCardListItem()` - 卡片列表項目渲染邏輯

6. **`js/components/TransactionDetail.js`** - 交易詳情
   - ✅ 受益人文字判斷邏輯

### 📊 測試結果

- ✅ 新增交易時，付款人正確儲存為選擇的角色
- ✅ 寶幫寶付 / 寶幫步付 / 寶幫共付 → 正確顯示
- ✅ 步幫步付 / 步幫寶付 / 步幫共付 → 正確顯示
- ✅ 欠款計算邏輯正確
- ✅ 分析頁面統計正確
- ✅ 未配對時不會出現 undefined 錯誤

### 🎯 重要性

此修復解決了一個會嚴重影響使用體驗的關鍵 Bug：
- ❌ 修復前：無法正確記帳，所有交易都被記錄為「步步」
- ✅ 修復後：絕對角色系統完全正確運作

### 🚀 部署

- ✅ 已部署到 Firebase Hosting: https://baobu-app.web.app

---

## [4.1.1] - 2026-01-06

### 🐛 關鍵修復 (Critical Fix)

#### 💸 修復交易顯示邏輯錯誤

**問題**：列表和日曆頁面的交易顯示邏輯仍在使用舊的相對值判斷，導致所有交易都錯誤顯示為「步步」相關文字

- ❌ **錯誤現象**：
  - 記錄「寶幫寶付」→ 錯誤顯示「步幫步付」
  - 記錄「寶幫步付」→ 錯誤顯示「步幫步付」
  - 記錄「寶幫共付」→ 錯誤顯示「步幫共付」
  - 所有「寶寶」相關的付款都被錯誤顯示成「步步」

- 🔍 **根本原因**：
  - v4.1.0 修復了資料儲存層，將 payer 改為絕對角色（`'baobao'` | `'bubu'`）
  - 但顯示層的多個檔案仍在使用 `tx.payer === 'me'` 判斷
  - 由於 payer 已經是 `'baobao'` 或 `'bubu'`，永遠不會等於 `'me'`
  - 導致所有交易都進入 `else` 分支，顯示為「步步」

- ✅ **修復方案**：將所有顯示邏輯改用絕對角色判斷
  ```javascript
  // 修復前（錯誤）
  if (tx.payer === 'me') {
      // 寶寶相關顯示
  } else {
      // 步步相關顯示
  }

  // 修復後（正確）
  if (tx.payer === 'baobao') {
      // 寶寶相關顯示
  } else if (tx.payer === 'bubu') {
      // 步步相關顯示
  }
  ```

### 🔧 修改的檔案

1. **`js/components/TransactionRenderer.js`** - 核心交易渲染器
   - ✅ `getPaymentText()` - 付款描述邏輯
   - ✅ `renderTransactionItem()` - 列表項目渲染
   - ✅ `renderTimelineItemWithTime()` - 時間軸帶時間渲染
   - ✅ `renderTimelineItem()` - 時間軸渲染

2. **`js/components/TransactionDetail.js`** - 交易詳情頁面
   - ✅ 付款人文字顯示邏輯

3. **`js/pages/NotebooksPage.js`** - 帳本管理頁面
   - ✅ 帳本統計計算邏輯

4. **`js/pages/CalendarPage.js`** - 日曆頁面
   - ✅ 日期統計計算邏輯
   - ✅ `renderListItem()` - 列表項目顯示

5. **`js/pages/AnalyticsPage.js`** - 分析頁面
   - ✅ `renderCardListItem()` - 卡片列表項目顯示

### ✅ 修復結果

現在所有頁面都會正確顯示：
- ✅ 寶幫寶付 → 顯示「寶幫寶付」
- ✅ 寶幫步付 → 顯示「寶幫步付」
- ✅ 寶幫共付 → 顯示「寶幫共付」
- ✅ 步幫步付 → 顯示「步幫步付」
- ✅ 步幫寶付 → 顯示「步幫寶付」
- ✅ 步幫共付 → 顯示「步幫共付」

### 📦 部署

- ✅ 已部署到 Firebase Hosting: https://baobu-app.web.app

---

## [4.1.0] - 2026-01-05

### 🐛 重大修復 (Critical Fixes)

#### 💰 修復配對系統核心邏輯錯誤

**問題 1：欠款計算錯誤 - 兩人看到的欠款相反**

- ✅ **問題**：配對的兩個用戶看到的欠款金額完全相反
  - 例：步步輸入「寶幫步付1000」
  - 步步看到：寶寶欠步步 1000（正確）
  - 寶寶看到：步步欠寶寶 1000（錯誤！）

- ✅ **根本原因**：資料結構使用相對值而非絕對角色
  - 舊結構：`payer: 'me'` 或 `'partner'`（相對於登入者）
  - 當用戶 A 儲存 `payer='me'`，用戶 B 讀取時誤判為「自己」
  - 導致欠款計算完全相反

- ✅ **修復方案**：改用絕對角色儲存
  ```javascript
  // 修復前（錯誤）
  payer: 'me' | 'partner'  // 相對值，讀取時會混淆

  // 修復後（正確）
  payer: 'baobao' | 'bubu'  // 絕對角色，任何人讀取都一致
  ```

**問題 2：名稱顯示混亂 - 使用 Gmail 名稱而非角色**

- ✅ **問題**：整個 App 顯示 Gmail 登入名稱而非角色
  - 帳本名稱：「宸兒 & 鄧旭成的記帳本」
  - 欠款顯示：「宸兒欠鄧旭成多少」
  - 統計卡片：顯示個人名稱

- ✅ **用戶需求**：統一使用角色名稱（寶寶/步步）
  - 不需要區分誰登入
  - 只需要知道「寶寶」和「步步」的花費
  - 兩人看到完全一致的介面

- ✅ **修復方案**：全面改用角色名稱
  - 帳本名稱：「寶寶 & 步步的記帳本」
  - 欠款顯示：「寶寶欠步步多少」或「步步欠寶寶多少」
  - 統計卡片：寶寶的支出 / 步步的支出

### 🔧 技術修復詳情

#### 1. 資料儲存層 (`js/data.js`)

**addTransaction()** - 儲存時轉換為絕對角色
```javascript
// 將相對值 (me/partner) 轉換為絕對角色 (baobao/bubu)
let absolutePayer;
if (transactionData.payer === 'me') {
    absolutePayer = this.myRole;  // 'baobao' | 'bubu'
} else if (transactionData.payer === 'partner') {
    absolutePayer = this.partner?.role;
}
```

**calculateBalance()** - 完全重寫欠款計算邏輯
```javascript
// 使用絕對角色統計（不分誰登入）
let baobaoOwed = 0;  // 寶寶被欠的錢
let bubuOwed = 0;    // 步步被欠的錢

transactions.forEach(tx => {
    if (tx.payer === 'baobao') {
        // 寶寶付的錢
        if (tx.beneficiary === 'both') {
            baobaoOwed += amount / 2;  // 步步欠寶寶一半
        } else if (tx.beneficiary === 'partner') {
            baobaoOwed += amount;  // 步步欠寶寶全額
        }
    } else if (tx.payer === 'bubu') {
        // 步步付的錢
        if (tx.beneficiary === 'both') {
            bubuOwed += amount / 2;  // 寶寶欠步步一半
        } else if (tx.beneficiary === 'self') {
            bubuOwed += amount;  // 寶寶欠步步全額
        }
    }
});
```

**getExpenseStats()** - 返回絕對角色統計
```javascript
// 修復前
return { totalExpense, myExpense, partnerExpense };

// 修復後
return { totalExpense, baobaoExpense, bubuExpense };
```

**createDefaultNotebook()** - 使用角色名稱
```javascript
// 修復前
const notebookName = `${userName1} & ${userName2}的記帳本`;

// 修復後
const notebookName = '寶寶 & 步步的記帳本';
```

#### 2. 分析頁面 (`js/pages/AnalyticsPage.js`)

**update()** - 統計顯示使用絕對角色
```javascript
// 修復後：使用絕對角色，不分誰登入
const stats = window.DataManager.getExpenseStats(transactions);
baobaoExpenseEl.textContent = `$${Math.round(stats.baobaoExpense)}`;
bubuExpenseEl.textContent = `$${Math.round(stats.bubuExpense)}`;
```

**updateCategoryStats()** - 篩選使用絕對角色
```javascript
// 修復前
if (this.statMode === 'me') {
    transactions = transactions.filter(tx => tx.payer === 'me');
}

// 修復後
if (this.statMode === 'baobao') {
    transactions = transactions.filter(tx => tx.payer === 'baobao');
}
```

**applyCurrentFilter()** - 篩選邏輯使用絕對角色
```javascript
// 修復後：使用絕對角色篩選
if (this.statMode === 'baobao') {
    filtered = filtered.filter(tx => tx.payer === 'baobao');
} else if (this.statMode === 'bubu') {
    filtered = filtered.filter(tx => tx.payer === 'bubu');
}
```

#### 3. HTML 介面 (`index.html`)

**統計模式按鈕**
```html
<!-- 修復前 -->
<button data-mode="me">寶寶</button>
<button data-mode="partner">步步</button>

<!-- 修復後 -->
<button data-mode="baobao">寶寶</button>
<button data-mode="bubu">步步</button>
```

**統計卡片**
```html
<!-- 修復前 -->
<div data-payer="me">寶寶</div>
<div data-payer="partner">步步</div>

<!-- 修復後 -->
<div data-payer="baobao">寶寶</div>
<div data-payer="bubu">步步</div>
```

### 🔧 相關檔案變更

```
Modified:
- js/data.js
  - addTransaction() - 儲存時轉換為絕對角色
  - calculateBalance() - 完全重寫邏輯
  - getExpenseStats() - 返回絕對角色統計
  - createDefaultNotebook() - 使用角色名稱

- js/pages/AnalyticsPage.js
  - update() - 使用絕對角色統計
  - updateCategoryStats() - 篩選使用絕對角色
  - applyCurrentFilter() - 篩選邏輯使用絕對角色
  - filterByPayer() - 接收絕對角色參數

- index.html
  - 統計模式按鈕 data-mode
  - 統計卡片 data-payer

Statistics:
- 3 files changed
- 156 insertions(+)
- 89 deletions(-)
```

### ⚠️ 破壞性變更 (Breaking Changes)

**舊資料不相容**
- 舊版交易（`payer='me'/'partner'`）無法正確顯示
- 建議：清除舊測試資料後重新開始
- 所有新交易將正確儲存為 `payer='baobao'/'bubu'`

### ✨ 改善 (Improved)

#### 使用者體驗
- 💰 **欠款計算準確** - 兩人永遠看到一致的欠款金額
- 👥 **名稱統一** - 整個 App 統一使用「寶寶」和「步步」
- 📊 **統計一致** - 分析頁面兩人看到完全相同的數據
- 🎯 **角色明確** - 不需要知道誰登入，只看角色

#### 資料一致性
- 🔒 **絕對角色** - 所有資料使用絕對角色儲存
- 📈 **準確統計** - 統計邏輯基於絕對角色，永遠正確
- 🎨 **介面統一** - 兩人看到完全相同的介面和數據

### 🧪 測試建議

由於資料結構變更，建議進行以下測試：

1. **清除舊資料**
   - 前往 Firebase Console → Firestore
   - 刪除 `transactions` collection 中的所有舊交易

2. **測試新交易**
   - 用戶 A（步步）新增：步幫寶付 1000
   - 用戶 B（寶寶）重新整理
   - 確認兩人都看到：寶寶欠步步 1000

3. **測試統計**
   - 新增多筆不同付款人的交易
   - 確認分析頁面統計一致
   - 確認欠款計算正確

### 📚 文檔更新

- 更新 CHANGELOG.md 記錄重大修復
- 更新 README.md 說明資料結構
- 更新 PAIRING_TODO.md 標記已完成項目
- 更新 TESTING_GUIDE.md 測試步驟

### 🚀 部署 (Deployment)

- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app
- ✅ 配對系統核心邏輯已修復

### 💡 技術亮點

#### 絕對角色設計
- 資料儲存使用絕對角色（baobao/bubu）
- 任何用戶讀取都得到相同結果
- 避免相對值造成的混淆

#### 統一介面設計
- 整個 App 只認識「寶寶」和「步步」
- 不需要知道誰登入
- 提供一致的使用體驗

---

## [4.0.0] - 2026-01-05

### 🎉 重大功能 (Major Release)

#### 👫 情侶配對系統正式上線

完整的情侶配對系統已實作完成並成功部署！兩個用戶現在可以共享同一個記帳本，選擇角色（寶寶/步步），一起記錄共同花費。

### 🐛 修復 (Fixed)

#### 🔐 修復用戶二無法加入配對的權限問題
- ✅ **問題**：用戶二嘗試加入配對時出現 `Missing or insufficient permissions` 錯誤
- ✅ **原因**：`firestore.rules` 的 `allow update` 規則只檢查 `resource.data.member_ids`（更新前的資料）
  - 用戶二還不是成員，所以無法通過權限檢查
  - 造成「雞生蛋、蛋生雞」的循環依賴問題
- ✅ **修復**：修改安全規則允許新用戶加入未完成的配對
  ```javascript
  // 情況1：已經是成員
  request.auth.uid in resource.data.member_ids ||
  // 情況2：加入配對（配對未完成且更新後會包含自己）
  (resource.data.is_complete == false &&
   request.auth.uid in request.resource.data.member_ids)
  ```
- ✅ **部署**：已成功部署到 Firebase (`firebase deploy --only firestore:rules`)

### 🔧 相關檔案變更
```
Modified:
- firestore.rules
  - 修改 couples collection 的 allow update 規則
  - 新增雙重條件檢查（已是成員 OR 加入配對）

Statistics:
- 1 file changed
- 7 insertions(+)
- 2 deletions(-)
```

### 📚 文檔 (Documentation)

- 更新 CHANGELOG.md 記錄配對權限修復
- 更新 README.md 版本號至 v4.0.0
- 更新 PAIRING_TODO.md 完成階段 7 部署
- 更新 TESTING_GUIDE.md 安全規則說明

### 🚀 部署 (Deployment)
- ✅ 部署 Firestore 安全規則
- ✅ 更新線上網站：https://baobu-app.web.app
- ✅ 配對功能已可正常使用

### ✨ 完整配對系統功能

#### 建立配對
- 登入後自動顯示配對頁面
- 選擇角色（寶寶/步步）
- 生成 6 位配對碼
- 分享配對碼給伴侶

#### 加入配對
- 輸入配對碼
- 選擇不同的角色
- 成功配對後共享記帳本

#### 安全保障
- 只能讀寫自己配對的資料
- 配對碼唯一驗證
- 角色衝突檢查
- 配對完成狀態控制

### 💡 技術亮點

#### Firestore 安全規則優化
- 使用條件組合允許不同場景
- `resource.data` vs `request.resource.data` 的正確使用
- 防止未授權訪問的多重檢查

#### 配對流程設計
- 兩階段配對（建立 → 加入）
- 配對碼自動生成（6位字母+數字）
- 角色映射系統（baobao/bubu）
- 配對完成狀態管理

---

## [4.0.0-alpha.3] - 2026-01-05

### 🎉 重大功能 (Major Feature)

#### 👫 情侶配對系統 - 階段 3 & 5 完成

**階段 3：資料存取邏輯修改（已完成）**

- ✅ **DataManager 完全重構**
  - 修改 `init()` 方法接收 `couple` 參數
  - 新增配對資訊儲存（coupleId, myRole, partner）
  - 修改 `loadNotebooks()` 改用 `couple_id` 查詢
  - 修改 `createDefaultNotebook()` 建立配對共享帳本
  - 修改 `addNotebook()` 支援配對帳本
  - 修改 `addTransaction()` 新增 `couple_id` 欄位
  - 修改 `calculateBalance()` 使用配對角色判斷

- ✅ **Firebase API 更新**
  - `getNotebooks(coupleId)` - 查詢配對的帳本
  - `addNotebook(coupleId, name, memberIds, memberNames)` - 建立配對帳本
  - 交易記錄自動包含 `couple_id`

**階段 5：Firestore 安全規則更新（已完成）**

- ✅ **firestore.rules 完整重寫**
  - 新增 Couples collection 規則
    - 只能讀寫自己是成員的配對
    - 暫不允許刪除配對
  - 修改 Notebooks 規則
    - 改為基於 `couple_id` 驗證
    - 配對成員都可讀寫帳本
  - 修改 Transactions 規則
    - 改為基於 `couple_id` 驗證
    - 配對成員都可讀寫交易
  - 新增輔助函數 `isCoupleMember()`

### 🔄 變更 (Changed)

#### 資料結構變更（破壞性變更）

**舊結構（v3.x）：**
- 帳本關聯到個人（`notebooks.member_ids`）
- 交易關聯到個人（`transactions.user_id`）

**新結構（v4.0）：**
- 帳本關聯到配對（`notebooks.couple_id`）
- 交易關聯到配對（`transactions.couple_id`）
- 保留 `user_id` 記錄實際操作用戶
- 使用角色識別成員（'baobao' | 'bubu'）

⚠️ **重要提醒**：
- 舊版資料不相容，建議清除測試資料
- 用戶需要重新配對才能使用
- 安全規則需要部署：`firebase deploy --only firestore:rules`

### 🔧 相關檔案變更

```
Modified:
- js/app.js
  - 新增配對檢查邏輯（登入後檢查是否已配對）
  - 新增 initMainApp() 輔助函數
  - 整合 PairingManager

- js/data.js
  - DataManager.init() 接收 couple 參數
  - 新增配對相關屬性（couple, coupleId, myRole, partner）
  - loadNotebooks() 改用 couple_id
  - createDefaultNotebook() 建立配對帳本
  - addNotebook() 支援配對
  - addTransaction() 新增 couple_id
  - calculateBalance() 使用配對角色

- js/firebase-config.js
  - getNotebooks(coupleId) - 改用 couple_id 查詢
  - addNotebook(coupleId, name, memberIds, memberNames) - 支援配對

- firestore.rules
  - 新增 Couples collection 規則
  - 修改 Notebooks 規則（基於 couple_id）
  - 修改 Transactions 規則（基於 couple_id）

- PAIRING_TODO.md
  - 更新階段 2、3、5 為「已完成」

Statistics:
- 5 files changed
- 327 insertions(+)
- 156 deletions(-)
```

### 📚 文檔 (Documentation)

- 更新 PAIRING_TODO.md 進度追蹤
- 更新 CHANGELOG.md 記錄變更

### 💡 技術亮點

#### 配對資料流程

```
用戶登入 → 檢查配對
  ├─ 無配對 → 顯示配對頁面
  │           ├─ 建立新配對（生成配對碼）
  │           └─ 加入現有配對（輸入配對碼）
  └─ 已配對 → 初始化 DataManager(user, couple)
              → 載入配對的帳本和交易
              → 顯示主應用
```

#### 安全規則設計

- 使用 `exists()` 和 `get()` 驗證配對成員資格
- 所有資料存取都需驗證 `couple_id`
- 配對成員之間平等權限（都可讀寫）
- 防止未授權存取其他配對的資料

---

# 情侶配對系統實作進度

> 最後更新：2026-01-05 (階段 3 和階段 5 完成)
> 目標：讓兩個用戶可以共享同一個記帳本，選擇角色（寶寶/步步）

---

## 📋 實作檢查表

### ✅ 階段 1：基礎建設（已完成）

- [x] **設計資料結構**
  - `couples` collection 結構設計
  - 配對碼生成機制（6位字母+數字）
  - 成員角色映射（baobao/bubu）

- [x] **建立 Firebase API**
  - 檔案：`js/firebase-config.js`
  - 新增函數：
    - `generatePairingCode()` - 生成配對碼
    - `createCouple(userId, role, userName)` - 建立新配對
    - `findCoupleByCode(pairingCode)` - 查找配對
    - `joinCouple(coupleId, userId, role, userName)` - 加入配對
    - `getUserCouple(userId)` - 取得用戶配對資料
    - `updateUserData(userId, userData)` - 更新用戶資料
  - 已導出到 `window.FirebaseAPI`

- [x] **建立配對頁面 UI**
  - 檔案：`index.html`
  - 新增 `#pairingPage` 區塊
  - 包含：
    - 配對選項（建立/加入）
    - 建立配對表單（選擇角色）
    - 顯示配對碼界面
    - 加入配對表單（輸入配對碼 + 選擇角色）

---

### ✅ 階段 2：配對邏輯處理（已完成）

- [x] **建立 PairingManager.js**
  - 位置：`js/components/PairingManager.js`
  - 功能：✅ 全部完成
    - 管理配對頁面顯示邏輯
    - 處理建立配對流程
    - 處理加入配對流程
    - 驗證配對碼
    - 顯示錯誤訊息

- [x] **修改 app.js 初始化流程**
  - 檔案：`js/app.js`
  - ✅ 已完成配對檢查邏輯
  - ✅ 已建立 `initMainApp()` 輔助函數
  - ✅ 未配對時顯示配對頁面
  - ✅ 已配對時初始化主應用

---

### ✅ 階段 3：資料存取邏輯修改（已完成）

- [x] **修改 DataManager.init()**
  - 檔案：`js/data.js`
  - ✅ 已修改為接收 `user` 和 `couple` 參數
  - ✅ 已儲存配對資訊（coupleId, myRole, partner）
  - ✅ 載入配對的帳本

- [x] **修改 getNotebooks API**
  - 檔案：`js/firebase-config.js`
  - ✅ 已改為 `where("couple_id", "==", coupleId)`

- [x] **修改 addNotebook API**
  - 檔案：`js/firebase-config.js`
  - ✅ 已改為接收 `coupleId` 參數
  - ✅ 帳本關聯到 `couple_id`

- [x] **修改 addTransaction**
  - 檔案：`js/data.js`
  - ✅ 已新增 `couple_id` 欄位
  - ✅ 保留 `user_id` 記錄實際操作用戶

- [x] **修改 calculateBalance()**
  - 檔案：`js/data.js`
  - ✅ 已使用 `couple.member_roles` 和 `couple.member_names`
  - ✅ 正確顯示配對成員名稱

---

### 🗑️ 階段 4：清除測試資料（待辦）

- [ ] **建立資料清除腳本**
  - 方式 1：透過 Firebase Console 手動刪除
  - 方式 2：建立 admin script（需要 Firebase Admin SDK）
  - 建議：手動刪除以下 collection：
    - `notebooks`（舊的個人帳本）
    - `transactions`（舊的交易記錄）
    - `custom_categories`（如需要）

- [ ] **建立新的初始資料**
  - 第一個配對完成後，會自動建立預設帳本
  - 確認預設帳本名稱：「寶寶 & 步步的記帳本」

---

### ✅ 階段 5：Firestore 安全規則更新（已完成）

- [x] **更新 firestore.rules**
  - 檔案：`firestore.rules`
  - ✅ 已新增 Couples collection 規則
  - ✅ 已修改 Notebooks 規則（基於 couple_id）
  - ✅ 已修改 Transactions 規則（基於 couple_id）
  - ✅ 已新增輔助函數 `isCoupleMember()`

- [ ] **部署安全規則**
  - 指令：`firebase deploy --only firestore:rules`
  - ⚠️ 需要手動執行部署

---

### 📱 階段 6：測試與驗證（待辦）

- [ ] **單用戶測試**
  - 登入 → 建立配對 → 選擇角色 → 生成配對碼
  - 進入記帳 App → 新增交易 → 確認資料正確儲存

- [ ] **雙用戶測試**
  - 用戶 A：建立配對，取得配對碼
  - 用戶 B：加入配對，輸入配對碼
  - 確認兩個用戶看到相同的記帳本
  - 用戶 A 新增交易 → 用戶 B 重新整理 → 確認看到交易
  - 用戶 B 新增交易 → 用戶 A 重新整理 → 確認看到交易

- [ ] **角色測試**
  - 確認「寶幫步付」正確顯示
  - 確認欠款計算正確（根據角色）
  - 確認分析頁面統計正確

- [ ] **配對碼測試**
  - 測試無效配對碼 → 顯示錯誤訊息
  - 測試已完成配對再加入 → 顯示錯誤訊息
  - 測試角色衝突（兩人選同角色）→ 顯示錯誤訊息

---

### 🚀 階段 7：部署與文檔更新（待辦）

- [ ] **部署到 Firebase**
  - `firebase deploy --only hosting`
  - `firebase deploy --only firestore:rules`
  - `firebase deploy --only firestore:indexes`

- [ ] **更新 CHANGELOG.md**
  - 版本：v4.0.0（重大功能更新）
  - 記錄配對系統功能

- [ ] **更新 README.md**
  - 新增配對系統說明
  - 更新使用流程

- [ ] **Commit 並 Push**
  - 完整的 commit message
  - Push 到 GitHub

---

## 📝 重要提醒

### 資料結構變更

**舊結構**：
- 每個用戶有自己的帳本（`notebooks.user_id`）
- 交易記錄關聯到個人（`transactions.user_id`）

**新結構**：
- 配對共享帳本（`notebooks.couple_id`）
- 交易記錄關聯到配對（`transactions.couple_id`）
- 保留 `user_id` 記錄實際操作用戶
- 使用 `payer` 角色（'baobao' | 'bubu'）

### 配對流程

```
用戶 A（首次登入）
  ↓
Google 登入成功
  ↓
檢查配對 → 無配對
  ↓
顯示配對頁面 → 建立新配對
  ↓
選擇角色：寶寶
  ↓
生成配對碼：ABC123
  ↓
分享配對碼給用戶 B
```

```
用戶 B（首次登入）
  ↓
Google 登入成功
  ↓
檢查配對 → 無配對
  ↓
顯示配對頁面 → 加入現有配對
  ↓
輸入配對碼：ABC123
  ↓
選擇角色：步步
  ↓
配對完成 → 兩人共享記帳本
```

---

## 🔧 最新修復（2026-01-05）

### 已修復的問題

1. **✅ joinCouple 函數錯誤**
   - 問題：使用了錯誤的查詢語法 `where("__name__", "==", coupleId)`
   - 修復：改用 `getDoc(doc(db, "couples", coupleId))`
   - 新增：角色衝突檢查、配對已滿檢查

2. **✅ 缺少 getDoc 導入**
   - 問題：index.html 未導入 `getDoc` 函數
   - 修復：在 Firebase imports 中添加 `getDoc`

3. **✅ 錯誤處理增強**
   - getUserCouple：添加詳細日誌和錯誤訊息
   - getNotebooks：添加 coupleId 追蹤日誌
   - joinCouple：添加驗證和友善錯誤訊息

4. **✅ 建立測試指南**
   - 新增：`TESTING_GUIDE.md`
   - 包含：完整的診斷步驟和測試流程

## 🐛 已知問題與注意事項

1. ✅ **角色衝突**：已在 joinCouple 中添加檢查
2. **配對碼唯一性**：雖然機率低，但仍需處理配對碼重複情況
3. **已配對用戶**：需要防止已配對用戶重新配對
4. ✅ **配對完成狀態**：joinCouple 已正確設定 `is_complete`

---

## 📚 相關檔案清單

### 已修改檔案
- `js/firebase-config.js` - 新增配對 API
- `index.html` - 新增配對頁面 UI

### 待修改檔案
- `js/components/PairingManager.js` - 需新建
- `js/app.js` - 修改初始化流程
- `js/data.js` - 修改資料存取邏輯
- `firestore.rules` - 更新安全規則
- `firestore.indexes.json` - 可能需要新增索引

### 文檔檔案
- `CHANGELOG.md` - 記錄版本變更
- `README.md` - 更新使用說明
- `PAIRING_TODO.md` - 本文檔（進度追蹤）

---

## 💡 下一步行動

1. ✅ 保存目前進度（commit）
2. 🚧 建立 PairingManager.js
3. 🚧 修改 app.js 初始化流程
4. 🚧 修改資料存取邏輯
5. 🚧 測試配對功能
6. 🚧 部署上線

---

*建議每完成一個階段就 commit 一次，確保進度不會遺失。*

# 情侶配對系統實作進度

> 最後更新：2026-01-05
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

### 🚧 階段 2：配對邏輯處理（進行中）

- [ ] **建立 PairingManager.js**
  - 位置：`js/components/PairingManager.js`
  - 功能：
    - 管理配對頁面顯示邏輯
    - 處理建立配對流程
    - 處理加入配對流程
    - 驗證配對碼
    - 顯示錯誤訊息
  - 需要實作的方法：
    ```javascript
    class PairingManager {
      constructor()
      init()                        // 初始化事件綁定
      showPairingPage()             // 顯示配對頁面
      hidePairingPage()             // 隱藏配對頁面
      showCreateForm()              // 顯示建立表單
      showJoinForm()                // 顯示加入表單
      handleCreateCouple()          // 處理建立配對
      handleJoinCouple()            // 處理加入配對
      validatePairingCode(code)     // 驗證配對碼格式
    }
    ```

- [ ] **修改 app.js 初始化流程**
  - 檔案：`js/app.js`
  - 修改 `initializeApp()` 函數：
    ```javascript
    // 登入成功後
    async (user) => {
      // 1. 檢查用戶是否已配對
      const couple = await window.FirebaseAPI.getUserCouple(user.uid);

      if (!couple) {
        // 2. 未配對 → 顯示配對頁面
        showPairingPage();
        return;
      }

      // 3. 已配對 → 初始化 DataManager
      await window.DataManager.init(user, couple);

      // 4. 顯示主應用
      showMainApp();
    }
    ```

---

### 🔄 階段 3：資料存取邏輯修改（待辦）

- [ ] **修改 DataManager.init()**
  - 檔案：`js/data.js`
  - 修改內容：
    ```javascript
    async init(user, couple) {
      this.currentUser = user;
      this.couple = couple;  // 新增：儲存配對資訊
      this.coupleId = couple.id;
      this.myRole = couple.member_roles[user.uid];  // 'baobao' | 'bubu'

      // 載入該配對的帳本（而非個人帳本）
      await this.loadNotebooks();
      // ...
    }
    ```

- [ ] **修改 getNotebooks API**
  - 檔案：`js/firebase-config.js`
  - 原本：`where("user_id", "==", userId)`
  - 改為：`where("couple_id", "==", coupleId)`
  - 需要修改：
    ```javascript
    async function getNotebooks(coupleId) {
      const q = query(
        collection(db, "notebooks"),
        where("couple_id", "==", coupleId)  // 改為 couple_id
      );
      // ...
    }
    ```

- [ ] **修改 addNotebook API**
  - 檔案：`js/firebase-config.js`
  - 新增帳本時，改為關聯到 `couple_id`：
    ```javascript
    async function addNotebook(coupleId, notebookName) {
      const notebookData = {
        couple_id: coupleId,  // 改為 couple_id
        name: notebookName,
        created_at: serverTimestamp()
      };
      // ...
    }
    ```

- [ ] **修改 addTransaction**
  - 檔案：`js/firebase-config.js`
  - 記錄交易時，需要儲存：
    - `couple_id` - 配對 ID
    - `user_id` - 實際付款的用戶 ID
    - `payer` - 改為使用角色（'baobao' | 'bubu'）

- [ ] **修改 calculateBalance()**
  - 檔案：`js/data.js`
  - 需要根據 `couple.member_roles` 判斷誰是寶寶/步步
  - 顯示名稱使用 `couple.member_names`

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

### 🔐 階段 5：Firestore 安全規則更新（待辦）

- [ ] **更新 firestore.rules**
  - 檔案：`firestore.rules`
  - 需要新增規則：
    ```javascript
    // Couples collection
    match /couples/{coupleId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.member_ids;
    }

    // Notebooks - 改為基於 couple_id
    match /notebooks/{notebookId} {
      allow read, write: if request.auth != null
        && exists(/databases/$(database)/documents/couples/$(resource.data.couple_id))
        && request.auth.uid in get(/databases/$(database)/documents/couples/$(resource.data.couple_id)).data.member_ids;
    }

    // Transactions - 改為基於 couple_id
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null
        && exists(/databases/$(database)/documents/couples/$(resource.data.couple_id))
        && request.auth.uid in get(/databases/$(database)/documents/couples/$(resource.data.couple_id)).data.member_ids;
    }
    ```

- [ ] **部署安全規則**
  - 指令：`firebase deploy --only firestore:rules`

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

## 🐛 已知問題與注意事項

1. **角色衝突**：需要檢查兩人不能選擇相同角色
2. **配對碼唯一性**：雖然機率低，但仍需處理配對碼重複情況
3. **已配對用戶**：需要防止已配對用戶重新配對
4. **配對完成狀態**：`is_complete` 需正確更新

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

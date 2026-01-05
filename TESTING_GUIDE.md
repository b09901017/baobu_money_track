# 配對系統測試指南

> 最後更新：2026-01-05
> 目的：幫助診斷和測試配對系統的問題

---

## 🔍 問題診斷步驟

### 步驟 1：檢查 Firestore 規則部署狀態

1. 開啟 Firebase Console
2. 前往 **Firestore Database** → **規則**
3. 確認最新的規則已經發布
4. 檢查發布時間是否為最近

**預期規則內容**：
```javascript
match /couples/{coupleId} {
  allow read: if isSignedIn();

  // 更新：允許成員更新，或允許新用戶加入未完成的配對
  allow update: if isSignedIn() && (
    // 情況1：已經是成員
    request.auth.uid in resource.data.member_ids ||
    // 情況2：加入配對（配對未完成且更新後會包含自己）
    (resource.data.is_complete == false &&
     request.auth.uid in request.resource.data.member_ids)
  );
}

match /notebooks/{notebookId} {
  allow read: if isSignedIn();
  // ...
}
```

**重要提醒（2026-01-05 更新）**：
- ✅ 已修復用戶二無法加入配對的權限問題
- ✅ 安全規則已部署到 Firebase
- ✅ 配對功能現在可正常使用

---

### 步驟 2：完全清除 Firestore 資料

**重要**：必須清除所有舊資料，因為舊資料結構可能不相容。

1. 開啟 Firebase Console
2. 前往 **Firestore Database** → **資料**
3. 刪除以下 collections（點擊三個點 → 刪除集合）：
   - ✅ `couples`
   - ✅ `notebooks`
   - ✅ `transactions`
   - ✅ `custom_categories`（如果有）

**確認方式**：重新整理頁面，確認所有 collections 都消失了。

---

### 步驟 3：清除瀏覽器快取並重新載入

1. **完全登出**：
   - 如果已登入，先點擊登出按鈕
   - 確認看到 Google 登入頁面

2. **清除快取**：
   - 按下 `Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）
   - 或者：
     - 開啟開發者工具（F12）
     - 右鍵點擊重新整理按鈕
     - 選擇「清空快取並強制重新整理」

3. **清除 LocalStorage**：
   - 開啟開發者工具（F12）
   - 前往 **Application** → **Local Storage**
   - 刪除所有項目

---

### 步驟 4：檢查瀏覽器控制台日誌

1. 開啟開發者工具（F12）
2. 前往 **Console** 分頁
3. 清除所有舊日誌（點擊 🚫 清除圖示）
4. 重新登入並觀察日誌

**預期的成功日誌流程**：
```
✅ Firebase 已初始化
📦 專案 ID: [你的專案ID]
✅ FirebaseAPI 已掛載到 window
🚀 開始初始化應用程式
👤 用戶已登入: [你的名字]
👤 用戶已登入，檢查配對狀態
🔍 查詢用戶配對，userId: [你的UID]
⚠️ 未找到配對資料
⚠️ 用戶尚未配對，顯示配對頁面
```

**如果看到錯誤**：
- 記錄完整的錯誤訊息
- 特別注意 `錯誤代碼` 和 `錯誤訊息`
- 檢查是哪個函數拋出錯誤

---

### 步驟 5：測試配對流程

#### 5.1 單用戶測試（建立配對）

1. **登入**：
   - 點擊「使用 Google 登入」
   - 選擇帳號並授權

2. **建立配對**：
   - 應該自動顯示配對頁面
   - 點擊「建立新配對」
   - 選擇角色（寶寶 or 步步）
   - 點擊「建立配對」

3. **檢查配對碼**：
   - 應該看到 6 位配對碼（例如：ABC123）
   - 複製配對碼（用於第二個用戶加入）

4. **檢查 Console 日誌**：
   ```
   ✅ 已建立配對: [配對ID] 配對碼: [配對碼]
   🔍 查詢用戶配對，userId: [你的UID]
   ✅ 找到配對資料: { id: ..., member_ids: [...], is_complete: false }
   ```

5. **檢查 Firestore**：
   - 前往 Firebase Console → Firestore
   - 應該看到新的 `couples` collection
   - 點開文檔，確認：
     - `member_ids`: 陣列包含你的 UID
     - `member_roles`: 物件包含你的角色
     - `member_names`: 物件包含你的名稱
     - `pairing_code`: 6 位配對碼
     - `is_complete`: false

---

#### 5.2 雙用戶測試（加入配對）

**注意**：需要使用不同的 Google 帳號或無痕模式。

1. **第二個用戶登入**：
   - 開啟無痕視窗（Ctrl + Shift + N）
   - 前往應用網址
   - 使用不同的 Google 帳號登入

2. **加入配對**：
   - 應該自動顯示配對頁面
   - 點擊「加入現有配對」
   - 輸入第一個用戶的配對碼
   - 選擇**不同的角色**（如果第一個選寶寶，這裡選步步）
   - 點擊「加入配對」

3. **檢查 Console 日誌**：
   ```
   ✅ 已加入配對: [配對ID]
   🔍 查詢用戶配對，userId: [第二個用戶UID]
   ✅ 找到配對資料: { id: ..., member_ids: [...], is_complete: true }
   ```

4. **檢查 Firestore**：
   - `member_ids`: 陣列現在包含兩個 UID
   - `member_roles`: 物件包含兩個角色
   - `member_names`: 物件包含兩個名稱
   - `is_complete`: true

5. **測試共享功能**：
   - 第一個用戶新增交易
   - 第二個用戶重新整理頁面
   - 應該看到第一個用戶新增的交易

---

## ⚠️ 常見錯誤與解決方式

### 錯誤 1：`Missing or insufficient permissions`

**可能原因**：
1. Firestore 規則尚未部署或生效
2. 用戶未登入或 token 過期
3. 查詢條件不符合安全規則

**解決方式**：
1. 確認已執行 `firebase deploy --only firestore:rules`
2. 等待 1-2 分鐘讓規則生效
3. 完全登出並重新登入
4. 檢查 Console 確認用戶已登入（有 UID）

---

### 錯誤 2：`配對不存在` 或 `找不到配對碼`

**可能原因**：
1. 配對碼輸入錯誤
2. 配對已被刪除
3. 網路延遲導致資料未同步

**解決方式**：
1. 確認配對碼正確（6 位大寫字母+數字）
2. 檢查 Firestore 中是否存在該配對
3. 重新建立配對

---

### 錯誤 3：`此角色已被選擇`

**可能原因**：
兩個用戶選擇了相同的角色

**解決方式**：
選擇不同的角色（一個選寶寶，一個選步步）

---

### 錯誤 4：載入帳本失敗

**可能原因**：
1. couple_id 不正確
2. 安全規則阻擋查詢
3. 資料結構不相容

**解決方式**：
1. 檢查 Console 日誌中的 coupleId 值
2. 確認 Firestore 規則允許查詢
3. 清除舊資料並重新配對

---

## 📊 檢查清單

在報告問題前，請確認以下項目：

- [ ] Firestore 規則已部署（執行 `firebase deploy --only firestore:rules`）
- [ ] 已刪除所有舊的 Firestore collections
- [ ] 已清除瀏覽器快取（Ctrl + Shift + R）
- [ ] 已清除 LocalStorage
- [ ] 已完全登出並重新登入
- [ ] 檢查了完整的 Console 日誌
- [ ] 記錄了錯誤代碼和錯誤訊息
- [ ] 確認 Firebase 專案 ID 正確

---

## 🐛 報告問題時請提供

如果問題仍然存在，請提供以下資訊：

1. **完整的 Console 日誌**（從登入開始）
2. **錯誤截圖**（包含錯誤訊息）
3. **Firestore 資料截圖**（couples collection）
4. **已執行的步驟**（參考上面的檢查清單）
5. **Firebase 專案 ID**

---

## 📝 成功配對後的下一步

配對成功後，你應該：

1. **建立第一個帳本**：
   - 應該會自動建立預設帳本
   - 確認帳本顯示在「帳本頁面」

2. **新增第一筆交易**：
   - 點擊「+」按鈕
   - 填寫交易資訊
   - 確認交易顯示在時間軸

3. **測試結算功能**：
   - 新增多筆交易（不同付款人）
   - 確認結算卡片正確計算欠款

4. **測試切換帳本**：
   - 前往帳本頁面
   - 新增另一個帳本
   - 切換帳本並新增交易

---

💡 **提示**：測試時建議使用開發者工具的 Console 分頁，隨時觀察日誌輸出，這樣可以更快定位問題！

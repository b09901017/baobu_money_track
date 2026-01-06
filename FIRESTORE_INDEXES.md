# Firestore 索引需求

本專案需要以下 Firestore 複合索引才能正常運作。

## 建立方式

### 方法 1：自動建立（推薦）
1. 執行應用並觸發需要索引的查詢
2. Console 會顯示錯誤訊息並提供自動建立連結
3. 點擊連結前往 Firebase Console 自動建立

### 方法 2：手動建立
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 → Firestore Database → 索引
3. 點擊「建立索引」
4. 依照下方規格建立

---

## 必要索引清單

### 1. transactions - 近期交易監聽與分頁查詢
- **集合**: `transactions`
- **集合群組**: ✅ **是**（子集合需要啟用 Collection Group）
- **欄位**:
  1. `date` (Descending)
  2. `created_at` (Descending)
- **查詢範圍**: Collection group

**用途**:
- 監聽近 3 個月的交易（首頁時間軸）
- 「載入更多」功能（更早交易分頁查詢）

---

### 2. transactions - 日期範圍查詢
- **集合**: `transactions`
- **集合群組**: ✅ **是**（子集合需要啟用 Collection Group）
- **欄位**:
  1. `date` (Ascending)
- **查詢範圍**: Collection group

**用途**: 查詢特定日期範圍的交易（日曆頁面、分析頁面）

---

## 資料結構變更說明（v5.0.0）

**舊結構（並列根集合）**:
```
transactions/  (root collection)
  └─ 需要索引: notebook_id + date + created_at
```

**新結構（巢狀子集合）**:
```
couples/{coupleId}/notebooks/{notebookId}/transactions/ (subcollection)
  └─ 不需要 notebook_id 索引（路徑已包含）
  └─ 使用 Collection Group 索引允許跨帳本查詢
```

---

## 索引建立指南

### Firebase Console 手動建立步驟

#### 索引 1：近期交易與分頁查詢

1. 前往 Firestore Database → 索引 → 複合索引
2. 點擊「建立索引」
3. 填寫以下資訊：
   - **集合 ID**: `transactions`
   - **集合群組**: ✅ 勾選「集合群組」
   - **欄位**:
     - 欄位 1: `date` → **遞減** (Descending)
     - 欄位 2: `created_at` → **遞減** (Descending)
4. 點擊「建立」

#### 索引 2：日期範圍查詢

1. 前往 Firestore Database → 索引 → 複合索引
2. 點擊「建立索引」
3. 填寫以下資訊：
   - **集合 ID**: `transactions`
   - **集合群組**: ✅ 勾選「集合群組」
   - **欄位**:
     - 欄位 1: `date` → **遞增** (Ascending)
4. 點擊「建立」

---

## 驗證索引狀態

執行以下步驟確認索引已建立：

1. 開啟應用並登入
2. 切換到不同頁面（首頁、日曆、分析）
3. 新增、編輯、刪除交易
4. 點擊「載入更多」
5. 檢查 Console 是否有 `failed-precondition` 錯誤

如果沒有錯誤，表示索引已正確建立。

---

## 索引建立時間

- 索引建立可能需要 **5-15 分鐘**
- 在索引建立期間，相關查詢會失敗
- 索引完成後，應用將自動恢復正常

---

## 注意事項

1. **Collection Group 必須啟用**：由於 transactions 現在是子集合，必須勾選「集合群組」才能建立索引
2. **舊索引可以刪除**：包含 `notebook_id` 的舊索引已不再需要，可以從 Firebase Console 刪除以節省配額
3. **本地開發**：如果使用 Firebase Emulator，索引會自動建立，不需要手動配置

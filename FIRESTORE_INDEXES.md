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

### 1. transactions - 近期交易監聽
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Descending)
  3. `created_at` (Descending)
- **查詢範圍**: Collection

**用途**: 監聽近 3 個月的交易（首頁時間軸）

---

### 2. transactions - 日期範圍查詢
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Ascending)
- **查詢範圍**: Collection

**用途**: 查詢特定日期範圍的交易（日曆頁面、分析頁面）

---

### 3. transactions - 更早交易分頁查詢
- **集合**: `transactions`
- **欄位**:
  1. `notebook_id` (Ascending)
  2. `date` (Descending)
  3. `created_at` (Descending)
- **查詢範圍**: Collection

**用途**: 「載入更多」功能

---

## 驗證索引狀態

執行以下步驟確認索引已建立：

1. 開啟應用並登入
2. 切換到不同頁面（首頁、日曆、分析）
3. 新增、編輯、刪除交易
4. 點擊「載入更多」
5. 檢查 Console 是否有 `failed-precondition` 錯誤

如果沒有錯誤，表示索引已正確建立。

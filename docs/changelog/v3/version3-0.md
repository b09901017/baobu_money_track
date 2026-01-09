
## [3.0.0] - 2026-01-05

### 🐛 重大修復 (Critical Fixes)

#### ⏰ 修復時間軸時間顯示問題
- ✅ **解決 NaN:NaN 顯示問題** - 正確處理 Firebase Timestamp
  - 檢查 `created_at` 是否為 Firebase Timestamp 物件
  - 使用 `.toDate()` 方法轉換為 JavaScript Date
  - Fallback 到一般日期字串處理
  - 確保時間正確顯示為 HH:MM 格式

#### 💰 **修正記帳與欠款核心邏輯** - 最重要的修復
- ✅ **重寫 calculateBalance 邏輯** - 確保欠款計算正確

  **舊邏輯的問題**：
  - 當對方幫自己付時，錯誤地計算為欠款
  - 例：步幫步付100，系統錯誤認為寶欠步100

  **新邏輯（正確）**：
  ```javascript
  if (isPaidByMe) {
      // 我付的錢
      if (beneficiary === 'both') → 對方欠我一半
      else if (beneficiary === 'partner') → 對方欠我全額
      else → 不影響欠款 (我幫我付)
  } else {
      // 對方付的錢
      if (beneficiary === 'both') → 我欠對方一半
      else if (beneficiary === 'self') → 我欠對方全額
      else → 不影響欠款 (對方幫對方付)
  }
  ```

  **驗證例子**：
  1. 步幫步付100咖啡 → 步花的+100，欠款不變 ✅
  2. 寶幫共付100晚餐 → 寶花的+100，步欠寶50 ✅
  3. 寶幫步付100電影 → 寶花的+100，步欠寶100 ✅

- ✅ **統計邏輯已驗證正確** - getExpenseStats
  - 共同花費 = 所有交易金額總和（不論誰付、幫誰付）
  - 個人花費 = 該人付的所有金額
  - 邏輯符合用戶需求

### ✨ 改善 (Improved)

#### 🎨 優化時間軸日期分隔線
- ✅ **更細緻軟萌的設計** - 降低視覺干擾
  - 文字大小：從 `text-base` 改為 `text-xs`
  - 不透明度：使用 `opacity-70` 降低突兀感
  - 裝飾線：從 40-60% 降低到 20-30% 透明度
  - 移除浮誇的 emoji 裝飾（✨🌸）
  - 背景：改為 `bg-white/80` 半透明，更柔和
  - 間距：減少 margin（mt-6 mb-4 取代 mt-8 mb-6）
  - 整體更輕盈、不佔空間

### 🔧 相關檔案變更
```
Modified:
- js/components/TransactionRenderer.js
  - 修正時間計算邏輯，處理 Firebase Timestamp
  - renderTimelineItemWithTime() 和 renderTimelineItem() 都已修復

- js/components/TimelineView.js
  - renderDateDivider() - 優化日期分隔線樣式

- js/data.js
  - calculateBalance() - 重寫欠款計算邏輯（重大修復）
  - 正確處理「誰幫誰付」的所有情況

Statistics:
- 3 files changed
- 68 insertions(+)
- 32 deletions(-)
```

### 🚀 部署 (Deployment)
- ✅ 部署到 Firebase Hosting
- ✅ 更新線上網站：https://baobu-app.web.app

### ⚠️ 版本號說明
- 從 2.9.5 跳到 3.0.0 因為修正了核心欠款邏輯（破壞性變更）
- 舊版本計算的欠款可能不正確，建議重新檢查

---

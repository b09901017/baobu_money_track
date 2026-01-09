# 📚 技術文檔目錄

本資料夾包含專案的技術分析與測試指南文檔。

---

## 📄 文檔列表

### 🔒 [BALANCE_SAFETY_ANALYSIS.md](BALANCE_SAFETY_ANALYSIS.md)
餘額計算安全性全域分析報告
- 餘額計算架構解析（Firestore Transaction + 增量更新）
- 5 個潛在風險點分析（離線編輯、並發操作、浮點數精度等）
- 測試場景與驗證方法
- 完整修復方案與程式碼範例

### 💾 [CACHE_SYSTEM_ANALYSIS.md](CACHE_SYSTEM_ANALYSIS.md)
快取系統完整分析報告
- 三層快取架構詳解（Memory → Firebase → IndexedDB）
- 記憶體使用量估算（~15-20MB）
- 5 個優化建議（時間戳精度、歷史資料監聽等）
- 性能指標與最佳實踐

### 📡 [OFFLINE_ANALYSIS.md](OFFLINE_ANALYSIS.md)
離線功能完整分析
- 7 個已實現的離線功能
- 6 個未覆蓋的問題
- 優先級排序的優化建議
- 技術實作細節

### 🧪 [OFFLINE_TESTING_GUIDE.md](OFFLINE_TESTING_GUIDE.md)
離線防重複機制測試指南
- 5 個詳細測試場景（新增、編輯、刪除、按鈕狀態、錯誤提示）
- 預期結果與失敗現象對比
- Console 日誌驗證方法
- 測試報告範本

---

## 🎯 快速導航

- **想了解餘額計算是否安全？** → [BALANCE_SAFETY_ANALYSIS.md](BALANCE_SAFETY_ANALYSIS.md)
- **想了解快取機制如何運作？** → [CACHE_SYSTEM_ANALYSIS.md](CACHE_SYSTEM_ANALYSIS.md)
- **想了解離線功能有哪些？** → [OFFLINE_ANALYSIS.md](OFFLINE_ANALYSIS.md)
- **想測試離線防重複機制？** → [OFFLINE_TESTING_GUIDE.md](OFFLINE_TESTING_GUIDE.md)

---

**最後更新：** 2026-01-09 (v5.8.2)

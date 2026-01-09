# 📚 技術文檔目錄

本資料夾包含專案的完整技術文檔、開發指南、測試文件與版本歷史。

---

## 📂 文檔分類

### 🔄 版本更新歷史
- **[changelog/](changelog/)** - 完整版本更新記錄（v1.0.0 ~ v5.8.2）
  - 極簡版本總覽
  - 各版本詳細更新記錄
  - 技術實現與改進說明

### 🤖 Android 開發
- **[ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)** - Android APK 完整建置指南
  - 試錯過程與根本原因分析
  - Capacitor 插件配置詳解
  - 常見問題排查與解決方案
  - 建置自動化腳本

### 🚀 部署與配置
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Firebase 部署指南
- **[FIRESTORE_INDEXES.md](FIRESTORE_INDEXES.md)** - Firestore 索引需求
- **[ICON_GUIDE.md](ICON_GUIDE.md)** - 圖示與 PWA 配置

### 🔒 安全性與效能分析
- **[BALANCE_SAFETY_ANALYSIS.md](BALANCE_SAFETY_ANALYSIS.md)** - 餘額計算安全性分析
  - 餘額計算架構解析
  - 潛在風險點分析（離線編輯、並發操作等）
  - 完整修復方案
- **[CACHE_SYSTEM_ANALYSIS.md](CACHE_SYSTEM_ANALYSIS.md)** - 快取系統完整分析
  - 三層快取架構詳解
  - 記憶體使用量估算
  - 性能優化建議

### 📡 離線功能
- **[OFFLINE_ANALYSIS.md](OFFLINE_ANALYSIS.md)** - 離線功能完整分析
  - 已實現的離線功能
  - 未覆蓋的問題與優化建議
- **[OFFLINE_TESTING_GUIDE.md](OFFLINE_TESTING_GUIDE.md)** - 離線防重複機制測試指南
  - 詳細測試場景
  - 預期結果與驗證方法

### 🧪 測試與開發
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - 測試指南
- **[EXECUTION_LOG.md](EXECUTION_LOG.md)** - 執行記錄
- **[PAIRING_TODO.md](PAIRING_TODO.md)** - 配對功能待辦事項

### 🛠️ 遷移與故障排查
- **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - 遷移摘要
- **[IDX_GUIDE.md](IDX_GUIDE.md)** - Google Project IDX 操作指南
- **[IDX_TROUBLESHOOTING.md](IDX_TROUBLESHOOTING.md)** - IDX 環境問題排查

### 📝 其他文檔
- **[twinkly-mixing-conway.md](twinkly-mixing-conway.md)** - Claude 自動生成的 plan 檔案

---

## 🎯 快速導航

### 我想了解...
- **版本歷史？** → [changelog/README.md](changelog/README.md)
- **如何建置 Android APK？** → [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)
- **餘額計算是否安全？** → [BALANCE_SAFETY_ANALYSIS.md](BALANCE_SAFETY_ANALYSIS.md)
- **快取機制如何運作？** → [CACHE_SYSTEM_ANALYSIS.md](CACHE_SYSTEM_ANALYSIS.md)
- **離線功能有哪些？** → [OFFLINE_ANALYSIS.md](OFFLINE_ANALYSIS.md)
- **如何測試離線功能？** → [OFFLINE_TESTING_GUIDE.md](OFFLINE_TESTING_GUIDE.md)
- **如何部署到 Firebase？** → [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**最後更新:** 2026-01-10

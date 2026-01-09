# v3 系列 - 模組化大重構

**時間:** 2025-01-04

---

## 📌 版本概述

專案歷史上最大規模的架構重構。將單一檔案拆分為 18 個 JS 模組與 21 個 CSS 模組，建立清晰的職責分離與可維護性。程式碼從 1500 行 monolith 重構為模組化架構。

---

## 🎯 主要改進

### JavaScript 模組化（18 個檔案，4000+ 行）
- **核心系統:** StateManager、Router、EventBinder
- **頁面控制器:** HomePage、CalendarPage、NotebooksPage、AnalyticsPage
- **UI 組件:** BalanceCard、TimelineView、TransactionForm 等
- **工具函數:** dateUtils、domUtils

### CSS 模組化（21 個檔案，ITCSS 架構）
- **base/** - 基礎層（fonts, reset, variables, global）
- **layout/** - 布局層（container, header, navigation）
- **components/** - 組件層（9 個組件樣式）
- **animations/** - 動畫層
- **utilities/** - 工具層（responsive, scrollbar）

### 架構優化
- ES6 Modules 導入
- 職責清晰分離
- app.js 精簡 91.6%（從 1500 行 → 126 行）
- 全域狀態管理
- 統一事件綁定

---

## 🛠️ 技術架構

- **模式:** 訂閱-發布模式、單例模式
- **模組系統:** ES6 Modules + IIFE 混合
- **CSS 架構:** ITCSS（Inverted Triangle CSS）
- **命名規範:** BEM（Block Element Modifier）

---

## 📝 詳細更新記錄

參見 [version3-0.md](version3-0.md)

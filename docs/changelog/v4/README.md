# v4 系列 - Firebase 整合與角色系統

**時間:** 2026-01-06

---

## 📌 版本概述

將專案從 localStorage 升級到 Firebase 雲端資料庫，實現情侶配對與即時同步。修復關鍵的角色邏輯 Bug，建立穩固的絕對角色系統。

---

## 🎯 主要功能

### v4.0.0 Firebase 正式上線
- Firebase Authentication（Google 登入）
- Firestore 資料庫整合
- Firebase Storage（照片儲存）
- Firebase Hosting 部署
- 線上演示：https://baobu-app.web.app

### v4.1.0 配對系統
- 情侶配對機制（兩個 Google 帳號綁定）
- 角色分配（baobao / bubu）
- 共同經營記帳本
- 配對碼生成與驗證

### v4.2.0 絕對角色系統修復 ⭐ 關鍵修復
- **問題:** 新增交易時付款人錯誤儲存為 "步步"
- **原因:** 表單使用相對值（me/partner）但顯示絕對角色
- **解決:** 統一使用絕對角色（baobao/bubu）
- **影響:** 修復 4 個檔案的邏輯錯誤

---

## 🛠️ 技術架構

### Firebase 整合
- Authentication（Google 登入）
- Firestore（資料庫）
- Storage（照片儲存）
- Hosting（部署）

### 資料結構
```
couples/
  └── {coupleId}/
      ├── member_ids
      ├── member_roles: { uid: "baobao" | "bubu" }
      ├── notebooks/
      └── transactions/
```

### 絕對角色設計
- 使用固定角色：baobao（寶寶）和 bubu（步步）
- 避免相對邏輯（me/partner）導致的混淆
- 兩個 Google 帳號綁定到固定角色

---

## 📝 詳細更新記錄

參見 [version4-0_2.md](version4-0_2.md)

---
name: backend
description: 後端開發技能 (Firebase) - 設定 Firebase、串接資料庫、替換 Mock Data。目前不使用,之後需要整合 Firebase 時再使用此技能。
---

# 後端開發技能 (Backend - Firebase)

你是**後端工程師**,專門處理 Firebase 整合。

> ⚠️ **注意**: 目前專案使用 Mock Data,還不需要 Firebase。此技能保留給之後串接時使用。

## 核心職責

### 1. Firebase 設定
- 初始化 Firebase 專案
- 設定環境變數
- 配置 SDK

### 2. 替換 DataManager
- 找到所有使用 DataManager 的地方
- 替換成真實 Firebase 呼叫
- 保持介面一致（盡量不修改前端邏輯）

### 3. 資料庫操作
- Firestore CRUD
- 即時資料監聽
- 查詢優化

### 4. 檔案處理
- 圖片上傳到 Storage
- 取得下載 URL
- 檔案管理

## 之後要做的事

### Firebase 初始化
```javascript
// src/js/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... 其他配置
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 替換資料層
```javascript
// 原本（DataManager + localStorage）
// js/data.js
class DataManager {
  getTransactions(notebookId) {
    // 從 localStorage 讀取
    return this.transactions.filter(t => t.notebook_id === notebookId);
  }

  addTransaction(transactionData) {
    const transaction = { ...transactionData, id: Date.now().toString() };
    this.transactions.push(transaction);
    this.saveToLocalStorage();
    return transaction;
  }

  saveToLocalStorage() {
    localStorage.setItem('coupleAppData', JSON.stringify({
      notebooks: this.notebooks,
      transactions: this.transactions,
      currentNotebook: this.currentNotebook
    }));
  }
}

// 改成（Firebase）
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config.js';

class DataManager {
  async getTransactions(coupleId, notebookId) {
    const ref = collection(db, 'couples', coupleId, 'notebooks', notebookId, 'transactions');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addTransaction(coupleId, notebookId, transactionData) {
    const ref = collection(db, 'couples', coupleId, 'notebooks', notebookId, 'transactions');
    const docRef = await addDoc(ref, {
      ...transactionData,
      created_at: Timestamp.now()
    });
    return { id: docRef.id, ...transactionData };
  }

  // 不再需要 saveToLocalStorage
}
```

### 資料庫結構
```
firestore/
├── couples/{coupleId}/
│   ├── members: [
│   │   { id: 'user1', name: '寶寶' },
│   │   { id: 'user2', name: '步步' }
│   │ ]
│   ├── notebooks/{notebookId}/
│   │   ├── name: "寶寶步步的日常"
│   │   ├── created_at: Timestamp
│   │   ├── budget: 10000                      # 預算（可選）
│   │   └── transactions/{transactionId}/
│   │       ├── date: Timestamp
│   │       ├── item: "午餐"
│   │       ├── amount: 150
│   │       ├── payer: "user1"
│   │       ├── for_whom: "both"               # user1, user2, both
│   │       ├── category: "餐飲"
│   │       ├── tags: ["午餐", "便當"]
│   │       ├── note: "吃得好飽"
│   │       ├── photo_url: ""                  # Firebase Storage URL
│   │       └── created_at: Timestamp
│
└── customCategories/{categoryId}/              # 自訂分類（全域）
    ├── coupleId: "couple_123"
    ├── name: "特殊分類"
    └── icon: "🎁"
```

## 工作方式

### 當需要串接 Firebase 時:

1. **設定環境**
   - 建立 Firebase 專案（Firestore + Storage + Hosting）
   - 安裝 Firebase SDK
   - 設定環境變數（.env 或 firebase-config.js）
   - 設定 Security Rules

2. **找出所有 DataManager 使用處**
   - 搜尋 `window.DataManager`
   - 找到所有 `TODO: Firebase` 註解
   - 檢查所有頁面和組件的資料操作

3. **逐步替換**
   - 第1步：替換基本 CRUD（新增、讀取、更新、刪除）
   - 第2步：替換帳本管理
   - 第3步：替換自訂分類
   - 第4步：整合圖片上傳（Storage）
   - 每步完成後測試確認正常

4. **保持介面一致**
   - 前端盡量不修改（或最小修改）
   - DataManager 方法改為 async/await
   - 只改資料來源（localStorage → Firestore）
   - 完善錯誤處理與 loading 狀態

5. **處理非同步**
   - 所有資料方法改為 async
   - 前端加上 loading 提示
   - 處理網路錯誤與離線狀態

## Firestore 常用操作

### 讀取
```javascript
import { collection, getDocs, query, where } from 'firebase/firestore';

// 取得所有
const snapshot = await getDocs(collection(db, 'expenses'));

// 條件查詢
const q = query(
  collection(db, 'expenses'),
  where('category', '==', '吃')
);
const results = await getDocs(q);
```

### 新增
```javascript
import { collection, addDoc } from 'firebase/firestore';

await addDoc(collection(db, 'expenses'), {
  item: '午餐',
  amount: 150,
  date: new Date()
});
```

### 更新
```javascript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'expenses', expenseId), {
  amount: 200
});
```

### 刪除
```javascript
import { doc, deleteDoc } from 'firebase/firestore';

await deleteDoc(doc(db, 'expenses', expenseId));
```

## Storage 檔案上傳

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config.js';

const uploadPhoto = async (file, expenseId) => {
  const storageRef = ref(storage, `receipts/${expenseId}.jpg`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};
```

## Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /couples/{coupleId} {
      allow read, write: if request.auth != null;
      
      match /books/{bookId}/expenses/{expenseId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## 注意事項

✅ **要做的:**
- 設定環境變數保護 API Key
- 設定 Security Rules
- 處理錯誤狀態
- 加上 loading 提示

❌ **避免:**
- 不要直接寫死 API Key
- 不要忘記 Security Rules
- 不要同時改太多地方
- 不要忽略錯誤處理

## 當前狀態

🟡 **目前**: 還不需要使用此技能
- 專案使用 DataManager + localStorage
- 所有功能已正常運作
- 已預留 Firebase 串接點（TODO 註解）

🟢 **之後**: 當需要多裝置同步或雲端儲存時，使用此技能串接 Firebase
- 替換 DataManager 為 Firebase
- 整合圖片上傳（Storage）
- 部署到 Firebase Hosting

---

**記住**:
- 專案已完成前端開發，架構穩定
- 已預留好串接點，替換會很順利
- 保持 DataManager 介面一致，前端不需大改！

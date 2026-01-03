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

### 2. 替換 Mock Data
- 找到所有使用 Mock Data 的地方
- 替換成真實 Firebase 呼叫
- 保持介面一致

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
// 原本 (Mock Data)
// src/js/services/data.js
import { mockExpenses } from '../mock-data.js';

export const getExpenses = () => {
  return mockExpenses;
};

// 改成 (Firebase)
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config.js';

export const getExpenses = async (coupleId, bookId) => {
  const ref = collection(db, 'couples', coupleId, 'books', bookId, 'expenses');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### 資料庫結構
```
firestore/
├── couples/{coupleId}/
│   ├── members: [userId1, userId2]
│   ├── books/{bookId}/
│   │   ├── name: "日常記帳"
│   │   ├── icon: "💰"
│   │   └── expenses/{expenseId}/
│   │       ├── date: Timestamp
│   │       ├── item: "午餐"
│   │       ├── amount: 150
│   │       ├── payer: "person_a"
│   │       └── ...
```

## 工作方式

### 當需要串接 Firebase 時:

1. **設定環境**
   - 建立 Firebase 專案
   - 安裝 SDK
   - 設定環境變數

2. **找出所有 Mock Data 使用處**
   - 搜尋 `import.*mock-data`
   - 找到所有 `TODO: Firebase` 註解

3. **逐步替換**
   - 一次替換一個功能
   - 測試確認正常
   - 再進行下一個

4. **保持介面一致**
   - 前端不需要大改
   - 只改資料來源
   - 錯誤處理要完善

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

🟢 **之後**: 前端完成後,再使用此技能串接 Firebase

---

**記住**: 現在專注前端,保留好串接點,之後串接會很順利!

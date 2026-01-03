// ==================== Firebase 配置 ====================
// 此文件預留 Firebase 接口，未來可直接整合雲端資料庫

/*
Firebase 初始化配置範例：

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
*/

// ==================== 資料結構設計 ====================

/**
 * 用戶 (Users Collection)
 * {
 *   user_id: {
 *     name: string,
 *     email: string,
 *     avatar_url: string,
 *     created_at: timestamp
 *   }
 * }
 */

/**
 * 帳本 (Notebooks Collection)
 * {
 *   notebook_id: {
 *     name: string,
 *     members: [user_id1, user_id2],
 *     created_by: user_id,
 *     created_at: timestamp,
 *     updated_at: timestamp
 *   }
 * }
 */

/**
 * 交易 (Transactions Collection)
 * {
 *   transaction_id: {
 *     notebook_id: string,
 *     payer: string,  // "me" or "partner" or user_id
 *     beneficiary: string,  // "self", "partner", "both"
 *     amount: number,
 *     item_name: string,
 *     categories: [string],  // 可複選分類
 *     photo_url: string,  // 照片 URL
 *     date: string,  // "YYYY-MM-DD"
 *     created_at: timestamp,
 *     updated_at: timestamp
 *   }
 * }
 */

// ==================== Firebase 操作接口（預留） ====================

/**
 * 新增交易
 * @param {Object} transactionData - 交易資料
 * @returns {Promise<string>} - 交易 ID
 */
async function addTransaction(transactionData) {
    // 未來實作：
    // const docRef = await addDoc(collection(db, "transactions"), transactionData);
    // return docRef.id;

    console.log('Firebase 接口預留：addTransaction', transactionData);
    return Promise.resolve('temp_id_' + Date.now());
}

/**
 * 取得交易列表
 * @param {string} notebookId - 帳本 ID
 * @param {number} limit - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getTransactions(notebookId, limit = 50) {
    // 未來實作：
    // const q = query(
    //     collection(db, "transactions"),
    //     where("notebook_id", "==", notebookId),
    //     orderBy("date", "desc"),
    //     limit(limit)
    // );
    // const querySnapshot = await getDocs(q);
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('Firebase 接口預留：getTransactions', notebookId, limit);
    return Promise.resolve([]);
}

/**
 * 更新交易
 * @param {string} transactionId - 交易 ID
 * @param {Object} updates - 更新資料
 */
async function updateTransaction(transactionId, updates) {
    // 未來實作：
    // const docRef = doc(db, "transactions", transactionId);
    // await updateDoc(docRef, { ...updates, updated_at: serverTimestamp() });

    console.log('Firebase 接口預留：updateTransaction', transactionId, updates);
    return Promise.resolve();
}

/**
 * 刪除交易
 * @param {string} transactionId - 交易 ID
 */
async function deleteTransaction(transactionId) {
    // 未來實作：
    // await deleteDoc(doc(db, "transactions", transactionId));

    console.log('Firebase 接口預留：deleteTransaction', transactionId);
    return Promise.resolve();
}

/**
 * 上傳照片
 * @param {File} file - 圖片檔案
 * @returns {Promise<string>} - 圖片 URL
 */
async function uploadPhoto(file) {
    // 未來實作：
    // const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
    // await uploadBytes(storageRef, file);
    // const url = await getDownloadURL(storageRef);
    // return url;

    console.log('Firebase 接口預留：uploadPhoto', file.name);
    return Promise.resolve('temp_photo_url');
}

/**
 * 取得帳本列表
 * @param {string} userId - 用戶 ID
 * @returns {Promise<Array>} - 帳本列表
 */
async function getNotebooks(userId) {
    // 未來實作：
    // const q = query(
    //     collection(db, "notebooks"),
    //     where("members", "array-contains", userId)
    // );
    // const querySnapshot = await getDocs(q);
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log('Firebase 接口預留：getNotebooks', userId);
    return Promise.resolve([]);
}

/**
 * 新增帳本
 * @param {Object} notebookData - 帳本資料
 * @returns {Promise<string>} - 帳本 ID
 */
async function addNotebook(notebookData) {
    // 未來實作：
    // const docRef = await addDoc(collection(db, "notebooks"), notebookData);
    // return docRef.id;

    console.log('Firebase 接口預留：addNotebook', notebookData);
    return Promise.resolve('temp_notebook_id_' + Date.now());
}

// 導出函數供其他模組使用
if (typeof window !== 'undefined') {
    window.FirebaseAPI = {
        addTransaction,
        getTransactions,
        updateTransaction,
        deleteTransaction,
        uploadPhoto,
        getNotebooks,
        addNotebook
    };
}

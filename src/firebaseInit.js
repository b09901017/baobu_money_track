// ==================== Firebase 初始化模組 ====================
// 此檔案負責初始化 Firebase，並將必要的模組掛載到 window（過渡期）
// 未來所有模組都改用 import 後，可以移除 window 掛載

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, doc, query, where, orderBy,
  limit, serverTimestamp, onSnapshot, startAfter,
  enableIndexedDbPersistence, Timestamp, runTransaction, writeBatch
} from 'firebase/firestore';
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signOut, onAuthStateChanged
} from 'firebase/auth';

// 載入 Firebase 配置
import { firebaseConfig } from '../config/firebase.config.js';

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

console.log('✅ Firebase 已初始化 (via Vite)');
console.log('📦 專案 ID:', firebaseConfig.projectId);

// 啟用離線持久化
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ 離線持久化已啟用');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ 多個標籤頁同時開啟，離線持久化僅在第一個標籤頁啟用');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ 瀏覽器不支援 IndexedDB，離線持久化無法使用');
    } else {
      console.error('❌ 啟用離線持久化失敗:', err);
    }
  });

// 過渡期：掛載到 window 供舊程式碼使用
// TODO: 階段 2 完成後，所有模組改用 import，然後移除這些掛載
window.firebaseModules = {
  initializeApp,
  getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp, onSnapshot, startAfter, enableIndexedDbPersistence, Timestamp, runTransaction, writeBatch,
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
};

window.firebaseConfig = firebaseConfig;

// 匯出供未來的 ES Module 使用
export {
  app, db, storage, auth,
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp, onSnapshot, startAfter, Timestamp, runTransaction, writeBatch,
  ref, uploadBytes, getDownloadURL, deleteObject,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
};

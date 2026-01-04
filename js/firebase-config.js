// ==================== Firebase 配置與初始化 ====================

// 從 index.html 中載入的 Firebase 模組
const {
    initializeApp,
    getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp,
    getStorage, ref, uploadBytes, getDownloadURL,
    getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} = window.firebaseModules;

// 從配置檔案載入 Firebase 設定（已從 index.html 注入）
const firebaseConfig = window.firebaseConfig;

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

console.log('✅ Firebase 已初始化');
console.log('📦 專案 ID:', firebaseConfig.projectId);

// ==================== 認證相關 ====================

/**
 * Google 登入
 * @returns {Promise<User>} - Firebase 用戶物件
 */
async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log('✅ 登入成功');
        console.log('👤 用戶:', user.displayName);
        console.log('📧 Email:', user.email);

        window.currentUser = user;
        return user;
    } catch (error) {
        console.error('❌ 登入失敗:', error);
        // 使用自訂對話框或降級到原生 alert
        if (window.customDialog) {
            await window.customDialog.error('登入失敗：' + error.message);
        } else {
            alert('登入失敗：' + error.message);
        }
        throw error;
    }
}

/**
 * 登出
 */
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('✅ 已登出');
        window.currentUser = null;
    } catch (error) {
        console.error('❌ 登出失敗:', error);
        throw error;
    }
}

/**
 * 監聽認證狀態變化
 * @param {Function} onUserSignedIn - 用戶登入時的回調
 * @param {Function} onUserSignedOut - 用戶登出時的回調
 */
function setupAuthListener(onUserSignedIn, onUserSignedOut) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('👤 用戶已登入:', user.displayName || user.email);
            window.currentUser = user;
            if (onUserSignedIn) onUserSignedIn(user);
        } else {
            console.log('👤 用戶未登入');
            window.currentUser = null;
            if (onUserSignedOut) onUserSignedOut();
        }
    });
}

// ==================== Firestore CRUD（Phase 2 將完整實作）====================

/**
 * 新增交易
 * @param {Object} transactionData - 交易資料
 * @returns {Promise<string>} - 交易 ID
 */
async function addTransaction(transactionData) {
    try {
        const docRef = await addDoc(collection(db, "transactions"), {
            ...transactionData,
            created_at: serverTimestamp()
        });
        console.log('✅ 交易已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 新增交易失敗:', error);
        throw error;
    }
}

/**
 * 取得交易列表
 * @param {string} notebookId - 帳本 ID
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getTransactions(notebookId, limitCount = 50) {
    try {
        const q = query(
            collection(db, "transactions"),
            where("notebook_id", "==", notebookId),
            orderBy("date", "desc"),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得 ${transactions.length} 筆交易`);
        return transactions;
    } catch (error) {
        console.error('❌ 取得交易失敗:', error);
        throw error;
    }
}

/**
 * 取得日期範圍內的交易
 * @param {string} notebookId - 帳本 ID
 * @param {string} startDate - 開始日期 (YYYY-MM-DD)
 * @param {string} endDate - 結束日期 (YYYY-MM-DD)
 * @returns {Promise<Array>} - 交易列表
 */
async function getTransactionsByDateRange(notebookId, startDate, endDate) {
    try {
        const q = query(
            collection(db, "transactions"),
            where("notebook_id", "==", notebookId),
            where("date", ">=", startDate),
            where("date", "<=", endDate),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得日期範圍 ${transactions.length} 筆交易`);
        return transactions;
    } catch (error) {
        console.error('❌ 取得日期範圍交易失敗:', error);
        throw error;
    }
}

/**
 * 更新交易
 * @param {string} transactionId - 交易 ID
 * @param {Object} updates - 更新資料
 */
async function updateTransaction(transactionId, updates) {
    try {
        const docRef = doc(db, "transactions", transactionId);
        await updateDoc(docRef, {
            ...updates,
            updated_at: serverTimestamp()
        });
        console.log('✅ 交易已更新:', transactionId);
    } catch (error) {
        console.error('❌ 更新交易失敗:', error);
        throw error;
    }
}

/**
 * 刪除交易
 * @param {string} transactionId - 交易 ID
 */
async function deleteTransaction(transactionId) {
    try {
        await deleteDoc(doc(db, "transactions", transactionId));
        console.log('✅ 交易已刪除:', transactionId);
    } catch (error) {
        console.error('❌ 刪除交易失敗:', error);
        throw error;
    }
}

/**
 * 取得帳本列表
 * @param {string} userId - 用戶 ID
 * @returns {Promise<Array>} - 帳本列表
 */
async function getNotebooks(userId) {
    try {
        const q = query(
            collection(db, "notebooks"),
            where("member_ids", "array-contains", userId)
        );
        const querySnapshot = await getDocs(q);
        const notebooks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得 ${notebooks.length} 個帳本`);
        return notebooks;
    } catch (error) {
        console.error('❌ 取得帳本失敗:', error);
        throw error;
    }
}

/**
 * 新增帳本
 * @param {Object} notebookData - 帳本資料
 * @returns {Promise<string>} - 帳本 ID
 */
async function addNotebook(notebookData) {
    try {
        const docRef = await addDoc(collection(db, "notebooks"), {
            ...notebookData,
            created_at: serverTimestamp()
        });
        console.log('✅ 帳本已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 新增帳本失敗:', error);
        throw error;
    }
}

/**
 * 新增自訂分類
 * @param {string} userId - 用戶 ID
 * @param {Object} categoryData - 分類資料
 * @returns {Promise<string>} - 分類 ID
 */
async function addCustomCategory(userId, categoryData) {
    try {
        const docRef = await addDoc(collection(db, "custom_categories"), {
            user_id: userId,
            ...categoryData,
            created_at: serverTimestamp()
        });
        console.log('✅ 自訂分類已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 新增自訂分類失敗:', error);
        throw error;
    }
}

/**
 * 取得自訂分類
 * @param {string} userId - 用戶 ID
 * @returns {Promise<Array>} - 分類列表
 */
async function getCustomCategories(userId) {
    try {
        const q = query(
            collection(db, "custom_categories"),
            where("user_id", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得 ${categories.length} 個自訂分類`);
        return categories;
    } catch (error) {
        console.error('❌ 取得自訂分類失敗:', error);
        throw error;
    }
}

/**
 * 刪除自訂分類
 * @param {string} categoryId - 分類 ID
 */
async function deleteCustomCategory(categoryId) {
    try {
        await deleteDoc(doc(db, "custom_categories", categoryId));
        console.log('✅ 自訂分類已刪除:', categoryId);
    } catch (error) {
        console.error('❌ 刪除自訂分類失敗:', error);
        throw error;
    }
}

// ==================== Storage（Phase 3 將實作）====================

/**
 * 上傳照片（Phase 3 實作）
 * @param {File} file - 圖片檔案
 * @param {string} userId - 用戶 ID
 * @returns {Promise<string>} - 圖片 URL
 */
async function uploadPhoto(file, userId) {
    // Phase 3 將實作完整上傳邏輯
    console.log('📸 uploadPhoto 預留（Phase 3 實作）:', file.name);
    return Promise.resolve(null);
}

// ==================== 導出 API ====================

window.FirebaseAPI = {
    // 認證
    signInWithGoogle,
    signOutUser,
    setupAuthListener,

    // Firestore
    addTransaction,
    getTransactions,
    getTransactionsByDateRange,
    updateTransaction,
    deleteTransaction,
    getNotebooks,
    addNotebook,
    addCustomCategory,
    getCustomCategories,
    deleteCustomCategory,

    // Storage
    uploadPhoto
};

console.log('✅ FirebaseAPI 已掛載到 window');

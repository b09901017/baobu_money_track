// ==================== Firebase 配置與初始化 ====================

// 從 index.html 中載入的 Firebase 模組
const {
    initializeApp,
    getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp,
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
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
 * 取得最近的交易記錄（按建立時間排序）
 * @param {string} notebookId - 帳本 ID
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getRecentTransactions(notebookId, limitCount = 30) {
    try {
        const q = query(
            collection(db, "transactions"),
            where("notebook_id", "==", notebookId),
            orderBy("created_at", "desc"),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得最近 ${transactions.length} 筆交易`);
        return transactions;
    } catch (error) {
        console.error('❌ 取得最近交易失敗:', error);
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
 * 取得配對的帳本列表
 * @param {string} coupleId - 配對 ID
 * @returns {Promise<Array>} - 帳本列表
 */
async function getNotebooks(coupleId) {
    try {
        const q = query(
            collection(db, "notebooks"),
            where("couple_id", "==", coupleId)
        );
        const querySnapshot = await getDocs(q);
        const notebooks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已取得 ${notebooks.length} 個配對帳本`);
        return notebooks;
    } catch (error) {
        console.error('❌ 取得帳本失敗:', error);
        throw error;
    }
}

/**
 * 新增配對帳本
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookName - 帳本名稱
 * @param {Array} memberIds - 成員 ID 列表（可選）
 * @param {Object} memberNames - 成員名稱映射（可選）
 * @returns {Promise<string>} - 帳本 ID
 */
async function addNotebook(coupleId, notebookName, memberIds = [], memberNames = {}) {
    try {
        const docRef = await addDoc(collection(db, "notebooks"), {
            name: notebookName,
            couple_id: coupleId,
            member_ids: memberIds,
            member_names: memberNames,
            created_at: serverTimestamp()
        });
        console.log('✅ 配對帳本已新增:', docRef.id);
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

// ==================== Storage ====================

/**
 * 壓縮圖片
 * @param {File} file - 原始圖片檔案
 * @param {number} maxWidth - 最大寬度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 壓縮品質 (0-1)
 * @returns {Promise<Blob>} - 壓縮後的圖片 Blob
 */
async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 計算縮放比例
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log(`✅ 圖片已壓縮: ${(file.size / 1024).toFixed(2)}KB → ${(blob.size / 1024).toFixed(2)}KB`);
                            resolve(blob);
                        } else {
                            reject(new Error('圖片壓縮失敗'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('圖片載入失敗'));
        };
        reader.onerror = () => reject(new Error('檔案讀取失敗'));
    });
}

/**
 * 上傳照片
 * @param {File} file - 圖片檔案
 * @param {string} userId - 用戶 ID
 * @param {string} transactionId - 交易 ID（可選）
 * @returns {Promise<Object>} - { url: 下載 URL, path: 儲存路徑 }
 */
async function uploadPhoto(file, userId, transactionId = null) {
    try {
        console.log('📸 開始上傳照片:', file.name);

        // 1. 驗證檔案類型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            throw new Error('不支援的圖片格式，請使用 JPG、PNG 或 WEBP');
        }

        // 2. 驗證檔案大小（最大 10MB）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('圖片大小超過 10MB，請選擇較小的圖片');
        }

        // 3. 壓縮圖片
        const compressedBlob = await compressImage(file);

        // 4. 生成唯一檔名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}_${randomStr}.jpg`;

        // 5. 設定儲存路徑（按用戶 ID 分類）
        const storagePath = transactionId
            ? `receipts/${userId}/${transactionId}/${fileName}`
            : `receipts/${userId}/${fileName}`;

        // 6. 上傳到 Firebase Storage
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, compressedBlob);

        // 7. 取得下載 URL
        const downloadURL = await getDownloadURL(storageRef);

        console.log('✅ 照片上傳成功:', downloadURL);
        return {
            url: downloadURL,
            path: storagePath,
            fileName: fileName
        };
    } catch (error) {
        console.error('❌ 照片上傳失敗:', error);
        throw error;
    }
}

/**
 * 刪除照片
 * @param {string} storagePath - 儲存路徑
 * @returns {Promise<void>}
 */
async function deletePhoto(storagePath) {
    try {
        console.log('🗑️ 刪除照片:', storagePath);
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
        console.log('✅ 照片已刪除');
    } catch (error) {
        // 如果檔案不存在，忽略錯誤
        if (error.code === 'storage/object-not-found') {
            console.warn('⚠️ 照片不存在，已忽略');
            return;
        }
        console.error('❌ 刪除照片失敗:', error);
        throw error;
    }
}

// ==================== 配對系統 (Couples) ====================

/**
 * 生成配對碼（6位大寫字母+數字）
 * @returns {string} - 配對碼
 */
function generatePairingCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符 (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * 建立新配對
 * @param {string} userId - 用戶 ID
 * @param {string} role - 角色 ('baobao' | 'bubu')
 * @param {string} userName - 用戶名稱
 * @returns {Promise<Object>} - 配對資料
 */
async function createCouple(userId, role, userName) {
    try {
        const pairingCode = generatePairingCode();

        const coupleData = {
            member_ids: [userId],
            member_roles: {
                [userId]: role
            },
            member_names: {
                [userId]: userName
            },
            created_at: serverTimestamp(),
            pairing_code: pairingCode,
            is_complete: false  // 是否已完成配對（兩人都加入）
        };

        const docRef = await addDoc(collection(db, "couples"), coupleData);
        console.log('✅ 已建立配對:', docRef.id, '配對碼:', pairingCode);

        return {
            id: docRef.id,
            pairing_code: pairingCode,
            ...coupleData
        };
    } catch (error) {
        console.error('❌ 建立配對失敗:', error);
        throw error;
    }
}

/**
 * 透過配對碼查找配對
 * @param {string} pairingCode - 配對碼
 * @returns {Promise<Object|null>} - 配對資料
 */
async function findCoupleByCode(pairingCode) {
    try {
        const q = query(
            collection(db, "couples"),
            where("pairing_code", "==", pairingCode.toUpperCase())
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ 查找配對失敗:', error);
        throw error;
    }
}

/**
 * 加入現有配對
 * @param {string} coupleId - 配對 ID
 * @param {string} userId - 用戶 ID
 * @param {string} role - 角色 ('baobao' | 'bubu')
 * @param {string} userName - 用戶名稱
 * @returns {Promise<void>}
 */
async function joinCouple(coupleId, userId, role, userName) {
    try {
        const coupleRef = doc(db, "couples", coupleId);

        await updateDoc(coupleRef, {
            member_ids: [userId, ...[]],  // 會被 Firebase 合併
            [`member_roles.${userId}`]: role,
            [`member_names.${userId}`]: userName,
            is_complete: true,
            updated_at: serverTimestamp()
        });

        // 需要先取得現有資料再更新
        const coupleDoc = await getDocs(query(collection(db, "couples"), where("__name__", "==", coupleId)));
        if (!coupleDoc.empty) {
            const currentData = coupleDoc.docs[0].data();
            const updatedMemberIds = [...new Set([...currentData.member_ids, userId])];

            await updateDoc(coupleRef, {
                member_ids: updatedMemberIds
            });
        }

        console.log('✅ 已加入配對:', coupleId);
    } catch (error) {
        console.error('❌ 加入配對失敗:', error);
        throw error;
    }
}

/**
 * 取得用戶的配對資料
 * @param {string} userId - 用戶 ID
 * @returns {Promise<Object|null>} - 配對資料
 */
async function getUserCouple(userId) {
    try {
        const q = query(
            collection(db, "couples"),
            where("member_ids", "array-contains", userId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('❌ 取得配對資料失敗:', error);
        throw error;
    }
}

/**
 * 更新用戶資料
 * @param {string} userId - 用戶 ID
 * @param {Object} userData - 用戶資料
 * @returns {Promise<void>}
 */
async function updateUserData(userId, userData) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            ...userData,
            updated_at: serverTimestamp()
        });
        console.log('✅ 用戶資料已更新');
    } catch (error) {
        // 如果文檔不存在，建立新文檔
        if (error.code === 'not-found') {
            const userRef = doc(db, "users", userId);
            await addDoc(collection(db, "users"), {
                uid: userId,
                ...userData,
                created_at: serverTimestamp()
            });
            console.log('✅ 用戶資料已建立');
        } else {
            console.error('❌ 更新用戶資料失敗:', error);
            throw error;
        }
    }
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
    getRecentTransactions,
    getTransactionsByDateRange,
    updateTransaction,
    deleteTransaction,
    getNotebooks,
    addNotebook,
    addCustomCategory,
    getCustomCategories,
    deleteCustomCategory,

    // Storage
    uploadPhoto,
    deletePhoto,

    // 配對系統
    createCouple,
    findCoupleByCode,
    joinCouple,
    getUserCouple,
    updateUserData
};

console.log('✅ FirebaseAPI 已掛載到 window');

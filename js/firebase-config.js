// ==================== Firebase API 封裝層 ====================
// 此檔案封裝所有 Firebase 操作，提供統一的 API 介面
//
// 注意：Firebase 初始化已在 src/firebaseInit.js 完成
// 此檔案直接從 window.firebaseModules 讀取（過渡期）
// TODO: 未來可改為直接 import from 'firebase/*'

// 過渡期：從 window 讀取 Firebase 模組（由 src/firebaseInit.js 提供）
const {
    getFirestore, collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp, onSnapshot, startAfter, Timestamp, runTransaction, writeBatch,
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject,
    getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged
} = window.firebaseModules;

// 從 window 讀取已初始化的 Firebase 實例
const app = window.firebaseApp || null;  // 備用，通常不需要
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

// Capacitor 相關模組（動態載入）
let Capacitor = null;
let FirebaseAuthentication = null;

// 檢測是否為 Native 環境
async function initCapacitor() {
    try {
        if (window.Capacitor) {
            Capacitor = window.Capacitor;
            FirebaseAuthentication = (await import('@capacitor-firebase/authentication')).FirebaseAuthentication;
            console.log('📱 Capacitor 已載入 (Native 環境)');
        } else {
            console.log('🌐 Web 環境');
        }
    } catch (error) {
        console.log('🌐 Web 環境 (Capacitor 未安裝)');
    }
}

// 初始化 Capacitor（非同步）
initCapacitor();

// ==================== 路徑工具函數 ====================

/**
 * 取得帳本集合引用（子集合）
 * @param {string} coupleId - 配對 ID
 * @returns {CollectionReference}
 */
function getNotebooksRef(coupleId) {
    return collection(db, 'couples', coupleId, 'notebooks');
}

/**
 * 取得單一帳本文件引用
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @returns {DocumentReference}
 */
function getNotebookRef(coupleId, notebookId) {
    return doc(db, 'couples', coupleId, 'notebooks', notebookId);
}

/**
 * 取得交易集合引用（子集合）
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @returns {CollectionReference}
 */
function getTransactionsRef(coupleId, notebookId) {
    return collection(db, 'couples', coupleId, 'notebooks', notebookId, 'transactions');
}

/**
 * 取得單一交易文件引用
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {string} transactionId - 交易 ID
 * @returns {DocumentReference}
 */
function getTransactionRef(coupleId, notebookId, transactionId) {
    return doc(db, 'couples', coupleId, 'notebooks', notebookId, 'transactions', transactionId);
}

/**
 * 取得活動記錄集合引用（子集合）
 * @param {string} coupleId - 配對 ID
 * @returns {CollectionReference}
 */
function getActivitiesRef(coupleId) {
    return collection(db, 'couples', coupleId, 'activities');
}

/**
 * 取得單一活動記錄文件引用
 * @param {string} coupleId - 配對 ID
 * @param {string} activityId - 活動 ID
 * @returns {DocumentReference}
 */
function getActivityRef(coupleId, activityId) {
    return doc(db, 'couples', coupleId, 'activities', activityId);
}

// ==================== 認證相關 ====================

/**
 * Google 登入（支援 Web 與 Native 雙平台）
 * @returns {Promise<User>} - Firebase 用戶物件
 */
async function signInWithGoogle() {
    try {
        // 檢測平台
        const isNative = Capacitor && Capacitor.isNativePlatform();

        if (isNative && FirebaseAuthentication) {
            // ==================== Native 登入流程 ====================
            console.log('📱 使用 Native Google 登入');

            // 1. 使用 Capacitor Firebase Authentication 插件登入
            const result = await FirebaseAuthentication.signInWithGoogle();

            // 2. 取得 idToken
            const idToken = result.credential?.idToken;
            if (!idToken) {
                throw new Error('無法取得 ID Token');
            }

            // 3. 使用 idToken 登入 Firebase
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            console.log('✅ Native 登入成功');
            console.log('👤 用戶:', user.displayName);
            console.log('📧 Email:', user.email);

            window.currentUser = user;
            return user;
        } else {
            // ==================== Web 登入流程 ====================
            console.log('🌐 使用 Web Google 登入');

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log('✅ Web 登入成功');
            console.log('👤 用戶:', user.displayName);
            console.log('📧 Email:', user.email);

            window.currentUser = user;
            return user;
        }
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {Object} transactionData - 交易資料
 * @returns {Promise<string>} - 交易 ID
 */
async function addTransaction(coupleId, notebookId, transactionData) {
    try {
        // 清理不需要的欄位（路徑已包含）
        const cleanedData = { ...transactionData };
        delete cleanedData.couple_id;
        delete cleanedData.notebook_id;

        // 使用子集合路徑
        const transactionsRef = getTransactionsRef(coupleId, notebookId);
        const docRef = await addDoc(transactionsRef, {
            ...cleanedData,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getTransactions(coupleId, notebookId, limitCount = 50) {
    try {
        // 使用子集合路徑，不需要 where() 過濾
        const transactionsRef = getTransactionsRef(coupleId, notebookId);
        const q = query(
            transactionsRef,
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getRecentTransactions(coupleId, notebookId, limitCount = 30) {
    try {
        // 使用子集合路徑，不需要 where() 過濾
        const transactionsRef = getTransactionsRef(coupleId, notebookId);
        const q = query(
            transactionsRef,
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {string} startDate - 開始日期 (YYYY-MM-DD)
 * @param {string} endDate - 結束日期 (YYYY-MM-DD)
 * @returns {Promise<Array>} - 交易列表
 */
async function getTransactionsByDateRange(coupleId, notebookId, startDate, endDate) {
    try {
        // 使用子集合路徑，不需要 where('notebook_id') 過濾
        const transactionsRef = getTransactionsRef(coupleId, notebookId);
        const q = query(
            transactionsRef,
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {string} transactionId - 交易 ID
 * @param {Object} updates - 更新資料
 */
async function updateTransaction(coupleId, notebookId, transactionId, updates) {
    try {
        const docRef = getTransactionRef(coupleId, notebookId, transactionId);
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
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {string} transactionId - 交易 ID
 */
async function deleteTransaction(coupleId, notebookId, transactionId) {
    try {
        const docRef = getTransactionRef(coupleId, notebookId, transactionId);
        await deleteDoc(docRef);
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
        console.log('🔍 查詢配對帳本，coupleId:', coupleId);

        // 使用子集合路徑，不使用 orderBy（避免過濾掉沒有 order 欄位的舊帳本）
        const notebooksRef = getNotebooksRef(coupleId);
        const querySnapshot = await getDocs(notebooksRef);
        const notebooks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 在客戶端排序：有 order 的按 order，沒有的按 created_at
        notebooks.sort((a, b) => {
            // 如果兩者都有 order，按 order 排序
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            // 如果只有 a 有 order，a 排前面
            if (a.order !== undefined) return -1;
            // 如果只有 b 有 order，b 排前面
            if (b.order !== undefined) return 1;
            // 如果都沒有 order，按 created_at 排序
            const dateA = a.created_at ? new Date(a.created_at.seconds ? a.created_at.seconds * 1000 : a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at.seconds ? b.created_at.seconds * 1000 : b.created_at) : new Date(0);
            return dateA - dateB;
        });

        console.log(`✅ 已取得 ${notebooks.length} 個配對帳本`);
        return notebooks;
    } catch (error) {
        console.error('❌ 取得帳本失敗:', error);
        console.error('   錯誤代碼:', error.code);
        console.error('   錯誤訊息:', error.message);
        console.error('   coupleId:', coupleId);
        throw error;
    }
}

/**
 * 新增配對帳本
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookName - 帳本名稱
 * @param {Array} memberIds - 成員 ID 列表（可選，已棄用）
 * @param {Object} memberNames - 成員名稱映射（可選，已棄用）
 * @param {string} type - 帳本類型（'daily' | 'trip'），預設為 'daily'
 * @param {number} order - 排序值（預設為 0，呼叫端應計算正確的值）
 * @returns {Promise<string>} - 帳本 ID
 */
async function addNotebook(coupleId, notebookName, memberIds = [], memberNames = {}, type = 'daily', order = 0) {
    try {
        // 使用子集合路徑，不需要 couple_id, member_ids, member_names 欄位（路徑已包含）
        const notebooksRef = getNotebooksRef(coupleId);
        const docRef = await addDoc(notebooksRef, {
            name: notebookName,
            type: type,
            order: order,
            created_at: serverTimestamp(),
            balance: {
                baobao_owed: 0,
                bubu_owed: 0,
                version: 0,
                last_updated: serverTimestamp()
            },
            stats: {
                baobao_paid: 0,
                bubu_paid: 0,
                total_expense: 0,
                transaction_count: 0,
                last_updated: serverTimestamp()
            }
        });
        console.log('✅ 配對帳本已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 新增帳本失敗:', error);
        throw error;
    }
}

/**
 * 批次更新帳本順序
 * @param {string} coupleId - 配對 ID
 * @param {Array<{id: string, order: number}>} updates - 更新列表
 * @returns {Promise<void>}
 */
async function batchUpdateNotebookOrders(coupleId, updates) {
    try {
        console.log('📝 批次更新帳本順序...', updates);

        const batch = writeBatch(db);

        updates.forEach(({ id, order }) => {
            const notebookRef = getNotebookRef(coupleId, id);
            batch.update(notebookRef, { order: order });
        });

        await batch.commit();
        console.log('✅ 帳本順序已批次更新');
    } catch (error) {
        console.error('❌ 批次更新帳本順序失敗:', error);
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

        // 先取得現有配對資料
        const coupleSnap = await getDoc(coupleRef);
        if (!coupleSnap.exists()) {
            throw new Error('配對不存在');
        }

        const currentData = coupleSnap.data();

        // 檢查配對是否已完成
        if (currentData.is_complete) {
            throw new Error('此配對已滿，無法加入');
        }

        // 檢查角色是否衝突
        const existingRoles = Object.values(currentData.member_roles);
        if (existingRoles.includes(role)) {
            throw new Error('此角色已被選擇，請選擇其他角色');
        }

        // 更新配對資料
        const updatedMemberIds = [...new Set([...currentData.member_ids, userId])];

        await updateDoc(coupleRef, {
            member_ids: updatedMemberIds,
            [`member_roles.${userId}`]: role,
            [`member_names.${userId}`]: userName,
            is_complete: true,
            updated_at: serverTimestamp()
        });

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
        console.log('🔍 查詢用戶配對，userId:', userId);

        const q = query(
            collection(db, "couples"),
            where("member_ids", "array-contains", userId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('⚠️ 未找到配對資料');
            return null;
        }

        const doc = querySnapshot.docs[0];
        const coupleData = {
            id: doc.id,
            ...doc.data()
        };

        console.log('✅ 找到配對資料:', {
            id: coupleData.id,
            member_ids: coupleData.member_ids,
            is_complete: coupleData.is_complete
        });

        return coupleData;
    } catch (error) {
        console.error('❌ 取得配對資料失敗:', error);
        console.error('   錯誤代碼:', error.code);
        console.error('   錯誤訊息:', error.message);
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

// ==================== 餘額管理 ====================

/**
 * 增量更新帳本餘額（使用 Firestore Transaction 確保並發安全）
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {number} baobaoDelta - 寶寶餘額變化量
 * @param {number} bubuDelta - 步步餘額變化量
 * @returns {Promise<void>}
 */
async function incrementNotebookBalance(coupleId, notebookId, baobaoDelta, bubuDelta) {
    const notebookRef = getNotebookRef(coupleId, notebookId);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await runTransaction(db, async (transaction) => {
                const notebookDoc = await transaction.get(notebookRef);

                if (!notebookDoc.exists()) {
                    throw new Error('帳本不存在');
                }

                const currentBalance = notebookDoc.data().balance || {
                    baobao_owed: 0,
                    bubu_owed: 0,
                    version: 0
                };

                const newBalance = {
                    baobao_owed: currentBalance.baobao_owed + baobaoDelta,
                    bubu_owed: currentBalance.bubu_owed + bubuDelta,
                    last_updated: serverTimestamp(),
                    version: currentBalance.version + 1
                };

                transaction.update(notebookRef, { balance: newBalance });
                console.log(`✅ 餘額已更新 (版本: ${newBalance.version}):`, newBalance);
            });

            return; // 成功
        } catch (error) {
            if (error.code === 'aborted') {
                // 並發衝突，重試
                retries++;
                console.warn(`⚠️ 並發衝突，重試 ${retries}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 100 * retries)); // 指數退避
            } else {
                console.error('❌ 更新餘額失敗:', error);
                throw error;
            }
        }
    }

    throw new Error('並發衝突過多，餘額更新失敗');
}

/**
 * 初始化帳本餘額
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {Object} balance - { baobao_owed, bubu_owed }
 * @returns {Promise<void>}
 */
async function initializeNotebookBalance(coupleId, notebookId, balance) {
    try {
        const notebookRef = getNotebookRef(coupleId, notebookId);
        await updateDoc(notebookRef, {
            balance: {
                ...balance,
                last_updated: serverTimestamp(),
                version: 1
            }
        });
        console.log('✅ 帳本餘額已初始化:', balance);
    } catch (error) {
        console.error('❌ 初始化餘額失敗:', error);
        throw error;
    }
}

/**
 * 增量更新帳本統計（使用 Firestore Transaction 確保並發安全）
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {number} baobaoPaidDelta - 寶寶支出變化量
 * @param {number} bubuPaidDelta - 步步支出變化量
 * @param {number} transactionCountDelta - 交易筆數變化量（新增 +1, 刪除 -1）
 * @returns {Promise<void>}
 */
async function incrementNotebookStats(coupleId, notebookId, baobaoPaidDelta, bubuPaidDelta, transactionCountDelta) {
    const notebookRef = getNotebookRef(coupleId, notebookId);
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await runTransaction(db, async (transaction) => {
                const notebookDoc = await transaction.get(notebookRef);

                if (!notebookDoc.exists()) {
                    throw new Error('帳本不存在');
                }

                const currentStats = notebookDoc.data().stats || {
                    baobao_paid: 0,
                    bubu_paid: 0,
                    total_expense: 0,
                    transaction_count: 0
                };

                const newStats = {
                    baobao_paid: currentStats.baobao_paid + baobaoPaidDelta,
                    bubu_paid: currentStats.bubu_paid + bubuPaidDelta,
                    total_expense: currentStats.total_expense + baobaoPaidDelta + bubuPaidDelta,
                    transaction_count: currentStats.transaction_count + transactionCountDelta,
                    last_updated: serverTimestamp()
                };

                transaction.update(notebookRef, { stats: newStats });
                console.log(`✅ 統計已更新:`, newStats);
            });

            return; // 成功
        } catch (error) {
            if (error.code === 'aborted') {
                // 並發衝突，重試
                retries++;
                console.warn(`⚠️ 並發衝突，重試 ${retries}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, 100 * retries)); // 指數退避
            } else {
                console.error('❌ 更新統計失敗:', error);
                throw error;
            }
        }
    }

    throw new Error('並發衝突過多，統計更新失敗');
}

/**
 * 初始化帳本統計
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {Object} stats - { baobao_paid, bubu_paid, total_expense, transaction_count }
 * @returns {Promise<void>}
 */
async function initializeNotebookStats(coupleId, notebookId, stats) {
    try {
        const notebookRef = getNotebookRef(coupleId, notebookId);
        await updateDoc(notebookRef, {
            stats: {
                ...stats,
                last_updated: serverTimestamp()
            }
        });
        console.log('✅ 帳本統計已初始化:', stats);
    } catch (error) {
        console.error('❌ 初始化統計失敗:', error);
        throw error;
    }
}

/**
 * 監聽帳本餘額變更
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {Function} callback - 回調函數 (balance) => void
 * @returns {Function} - 取消監聽函數
 */
function onNotebookBalanceChange(coupleId, notebookId, callback) {
    const notebookRef = getNotebookRef(coupleId, notebookId);

    return onSnapshot(
        notebookRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const balance = snapshot.data().balance;
                callback(balance);
            }
        },
        (error) => {
            console.error('❌ 監聽餘額失敗:', error);
            if (window.customDialog && error.code !== 'unavailable') {
                window.customDialog.error('監聽餘額失敗：' + error.message);
            }
        }
    );
}

// ==================== 交易即時監聽 ====================

/**
 * 監聽近期交易（近 3 個月）
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {Date} sinceDate - 起始日期（預設近 3 個月）
 * @param {Function} callback - 回調函數 (transactions, changes) => void
 * @returns {Function} - 取消監聽函數
 */
function onRecentTransactionsChange(coupleId, notebookId, sinceDate, callback) {
    const threeMonthsAgo = sinceDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sinceDateStr = threeMonthsAgo.toISOString().split('T')[0];

    console.log(`🎧 開始監聽近期交易 (自 ${sinceDateStr})...`);

    // 使用子集合路徑，不需要 where('notebook_id') 過濾
    const transactionsRef = getTransactionsRef(coupleId, notebookId);
    const q = query(
        transactionsRef,
        where('date', '>=', sinceDateStr),
        orderBy('date', 'desc'),
        orderBy('created_at', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const changes = {
                added: snapshot.docChanges().filter(c => c.type === 'added').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                })),
                modified: snapshot.docChanges().filter(c => c.type === 'modified').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                })),
                removed: snapshot.docChanges().filter(c => c.type === 'removed').map(c => ({
                    id: c.doc.id,
                    ...c.doc.data()
                }))
            };

            console.log(`📊 交易變更: +${changes.added.length} ~${changes.modified.length} -${changes.removed.length}`);
            callback(transactions, changes);
        },
        (error) => {
            console.error('❌ 監聽交易失敗:', error);
            if (error.code === 'permission-denied') {
                window.customDialog?.error('無法存取交易資料：權限不足');
            } else if (error.code === 'failed-precondition') {
                window.customDialog?.error('資料查詢失敗：請聯絡開發者建立 Firestore 索引');
            } else if (error.code !== 'unavailable') {
                window.customDialog?.error('監聽交易失敗：' + error.message);
            }
        }
    );
}

/**
 * 載入更早的交易（分頁查詢）
 * @param {string} coupleId - 配對 ID
 * @param {string} notebookId - 帳本 ID
 * @param {string} beforeDate - 日期上限 (YYYY-MM-DD)
 * @param {number} limitCount - 限制筆數
 * @returns {Promise<Array>} - 交易列表
 */
async function getEarlierTransactions(coupleId, notebookId, beforeDate, limitCount = 30) {
    try {
        console.log(`📥 載入 ${beforeDate} 之前的 ${limitCount} 筆交易...`);

        // 使用子集合路徑，不需要 where('notebook_id') 過濾
        const transactionsRef = getTransactionsRef(coupleId, notebookId);
        const q = query(
            transactionsRef,
            where('date', '<', beforeDate),
            orderBy('date', 'desc'),
            orderBy('created_at', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ 已載入 ${transactions.length} 筆更早的交易`);
        return transactions;
    } catch (error) {
        console.error('❌ 載入更早交易失敗:', error);
        throw error;
    }
}

// ==================== 帳本即時監聽 ====================

/**
 * 監聽帳本列表
 * @param {string} coupleId - 配對 ID
 * @param {Function} callback - 回調函數 (notebooks) => void
 * @returns {Function} - 取消監聽函數
 */
function onNotebooksChange(coupleId, callback) {
    console.log('🎧 開始監聽帳本列表...');

    // 使用子集合路徑，不需要 where('couple_id') 過濾
    const notebooksRef = getNotebooksRef(coupleId);

    return onSnapshot(
        notebooksRef,
        (snapshot) => {
            const notebooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 在客戶端排序：有 order 的按 order，沒有的按 created_at
            notebooks.sort((a, b) => {
                // 如果兩者都有 order，按 order 排序
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                // 如果只有 a 有 order，a 排前面
                if (a.order !== undefined) return -1;
                // 如果只有 b 有 order，b 排前面
                if (b.order !== undefined) return 1;
                // 如果都沒有 order，按 created_at 排序
                const dateA = a.created_at ? new Date(a.created_at.seconds ? a.created_at.seconds * 1000 : a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at.seconds ? b.created_at.seconds * 1000 : b.created_at) : new Date(0);
                return dateA - dateB;
            });

            console.log(`📚 帳本列表更新: ${notebooks.length} 個帳本`);
            callback(notebooks);
        },
        (error) => {
            console.error('❌ 監聽帳本失敗:', error);
            if (error.code !== 'unavailable') {
                window.customDialog?.error('監聽帳本失敗：' + error.message);
            }
        }
    );
}

// ==================== 活動記錄（通知系統）====================

/**
 * 新增活動記錄
 * @param {string} coupleId - 配對 ID
 * @param {Object} activityData - 活動資料
 * @param {string} activityData.type - 活動類型 ('create' | 'update' | 'delete')
 * @param {string} activityData.actor - 操作者角色 ('baobao' | 'bubu')
 * @param {Object} activityData.transaction - 交易資訊
 * @param {Object} [activityData.changes] - 變更內容（僅 update 時有）
 * @returns {Promise<string>} - 活動 ID
 */
async function addActivity(coupleId, activityData) {
    try {
        const activitiesRef = getActivitiesRef(coupleId);

        // 決定是否需要通知（根據業務邏輯）
        const shouldNotify = checkIfShouldNotify(activityData);

        if (!shouldNotify) {
            console.log('📝 活動不需要通知，跳過記錄');
            return null;
        }

        const activity = {
            type: activityData.type,
            actor: activityData.actor,
            timestamp: serverTimestamp(),
            transaction: {
                id: activityData.transaction.id,
                date: activityData.transaction.date,
                item_name: activityData.transaction.item_name,
                amount: activityData.transaction.amount,
                categories: activityData.transaction.categories || [],
                notebook_id: activityData.transaction.notebook_id
            },
            changes: activityData.changes || null,
            isRead: {
                baobao: activityData.actor === 'baobao', // 操作者自己標記為已讀
                bubu: activityData.actor === 'bubu'
            }
        };

        const docRef = await addDoc(activitiesRef, activity);
        console.log('✅ 活動記錄已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ 新增活動記錄失敗:', error);
        // 活動記錄失敗不應影響主功能，僅記錄錯誤
        return null;
    }
}

/**
 * 判斷是否需要通知
 * @param {Object} activityData - 活動資料
 * @returns {boolean}
 */
function checkIfShouldNotify(activityData) {
    const { type, transaction } = activityData;

    // 修改或刪除操作 -> 一律通知
    if (type === 'update' || type === 'delete') {
        return true;
    }

    // 新增操作 -> 檢查日期
    if (type === 'create') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        // 如果交易日期是「3 天以前」-> 通知（補記舊帳）
        if (transactionDate < threeDaysAgo) {
            console.log('📝 偵測到補記舊帳，產生通知');
            return true;
        }

        // 今天或昨天的新增 -> 不通知（日常記帳）
        console.log('📝 日常記帳，不產生通知');
        return false;
    }

    return false;
}

/**
 * 監聽活動記錄（近 30 天）
 * @param {string} coupleId - 配對 ID
 * @param {Function} callback - 回調函數 (activities) => void
 * @returns {Function} - 取消監聽函數
 */
function onActivitiesChange(coupleId, callback) {
    console.log('🎧 開始監聽活動記錄...');

    // 只監聽近 30 天的活動
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activitiesRef = getActivitiesRef(coupleId);
    const q = query(
        activitiesRef,
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const activities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`🔔 活動記錄更新: ${activities.length} 筆`);
            callback(activities);
        },
        (error) => {
            console.error('❌ 監聽活動記錄失敗:', error);
            // 活動記錄失敗不應中斷主功能
        }
    );
}

/**
 * 標記活動為已讀
 * @param {string} coupleId - 配對 ID
 * @param {string} activityId - 活動 ID
 * @param {string} role - 用戶角色 ('baobao' | 'bubu')
 * @returns {Promise<void>}
 */
async function markActivityAsRead(coupleId, activityId, role) {
    try {
        const activityRef = getActivityRef(coupleId, activityId);
        await updateDoc(activityRef, {
            [`isRead.${role}`]: true
        });
        console.log(`✅ 活動 ${activityId} 已標記為已讀（${role}）`);
    } catch (error) {
        console.error('❌ 標記已讀失敗:', error);
        // 標記失敗不應影響使用
    }
}

/**
 * 標記所有活動為已讀
 * @param {string} coupleId - 配對 ID
 * @param {string} role - 用戶角色 ('baobao' | 'bubu')
 * @param {Array<string>} activityIds - 活動 ID 列表
 * @returns {Promise<void>}
 */
async function markAllActivitiesAsRead(coupleId, role, activityIds) {
    try {
        const promises = activityIds.map(id => markActivityAsRead(coupleId, id, role));
        await Promise.all(promises);
        console.log(`✅ 所有活動已標記為已讀（${role}）`);
    } catch (error) {
        console.error('❌ 批量標記已讀失敗:', error);
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
    batchUpdateNotebookOrders,
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
    updateUserData,

    // 餘額管理
    incrementNotebookBalance,
    initializeNotebookBalance,
    onNotebookBalanceChange,

    // 統計管理
    incrementNotebookStats,
    initializeNotebookStats,

    // 交易監聽
    onRecentTransactionsChange,
    getEarlierTransactions,

    // 帳本監聽
    onNotebooksChange,

    // 活動記錄（通知系統）
    addActivity,
    onActivitiesChange,
    markActivityAsRead,
    markAllActivitiesAsRead
};

console.log('✅ FirebaseAPI 已掛載到 window');

// ==================== 資料管理模組 (Firebase 版本) ====================
// 此模組負責管理應用的資料狀態，使用 Firebase Firestore

class DataManager {
    constructor() {
        this.currentUser = null;  // Firebase 用戶物件
        this.couple = null;  // 配對資訊
        this.coupleId = null;  // 配對 ID
        this.myRole = null;  // 我的角色 ('baobao' | 'bubu')
        this.partner = null;  // 伴侶資訊（從配對推斷）
        this.currentNotebook = null;  // 當前帳本 ID
        this.notebooks = [];  // 帳本列表（快取）
        this.transactions = [];  // 交易列表（快取）
        this.customCategories = [];  // 自訂分類（快取）
        this.isInitialized = false;  // 是否已初始化
    }

    // ==================== 初始化 ====================

    /**
     * 初始化資料管理器
     * @param {Object} user - Firebase 用戶物件
     * @param {Object} couple - 配對資料
     */
    async init(user, couple) {
        if (!user) {
            throw new Error('用戶物件不能為空');
        }
        if (!couple) {
            throw new Error('配對資料不能為空');
        }

        console.log('📊 開始初始化 DataManager...');
        this.currentUser = user;
        this.couple = couple;  // 儲存配對資訊
        this.coupleId = couple.id;
        this.myRole = couple.member_roles[user.uid];  // 'baobao' | 'bubu'

        // 推斷伴侶資訊
        const partnerIds = couple.member_ids.filter(id => id !== user.uid);
        if (partnerIds.length > 0) {
            const partnerId = partnerIds[0];
            this.partner = {
                id: partnerId,
                name: couple.member_names[partnerId],
                role: couple.member_roles[partnerId]
            };
        }

        console.log('👫 配對資訊:', {
            coupleId: this.coupleId,
            myRole: this.myRole,
            partner: this.partner
        });

        try {
            // 1. 載入該配對的帳本（而非個人帳本）
            await this.loadNotebooks();

            // 2. 如果沒有帳本，建立預設帳本
            if (this.notebooks.length === 0) {
                console.log('📝 首次配對，建立預設帳本...');
                await this.createDefaultNotebook();
            }

            // 3. 設定當前帳本
            if (!this.currentNotebook && this.notebooks.length > 0) {
                this.currentNotebook = this.notebooks[0].id;
                console.log('📖 當前帳本:', this.notebooks[0].name);
            }

            // 4. 載入當前帳本的交易
            if (this.currentNotebook) {
                await this.loadTransactions();
            }

            // 5. 載入自訂分類
            await this.loadCustomCategories();

            this.isInitialized = true;
            console.log('✅ DataManager 初始化完成');
        } catch (error) {
            console.error('❌ DataManager 初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 載入配對的帳本
     */
    async loadNotebooks() {
        try {
            this.notebooks = await window.FirebaseAPI.getNotebooks(this.coupleId);
            console.log(`📚 已載入 ${this.notebooks.length} 個配對帳本`);
        } catch (error) {
            console.error('❌ 載入帳本失敗:', error);
            this.notebooks = [];
        }
    }

    /**
     * 載入當前帳本的交易
     */
    async loadTransactions() {
        try {
            this.transactions = await window.FirebaseAPI.getTransactions(this.currentNotebook);
            console.log(`💰 已載入 ${this.transactions.length} 筆交易`);
        } catch (error) {
            console.error('❌ 載入交易失敗:', error);
            this.transactions = [];
        }
    }

    /**
     * 載入自訂分類
     */
    async loadCustomCategories() {
        try {
            this.customCategories = await window.FirebaseAPI.getCustomCategories(this.currentUser.uid);
            console.log(`🏷️ 已載入 ${this.customCategories.length} 個自訂分類`);
        } catch (error) {
            console.error('❌ 載入自訂分類失敗:', error);
            this.customCategories = [];
        }
    }

    /**
     * 建立預設帳本（首次配對時）
     */
    async createDefaultNotebook() {
        // 取得兩人的角色名稱
        const baobaoName = this.myRole === 'baobao'
            ? (this.currentUser.displayName || '我')
            : (this.partner?.name || '伴侶');
        const bubuName = this.myRole === 'bubu'
            ? (this.currentUser.displayName || '我')
            : (this.partner?.name || '伴侶');

        const notebookName = `${baobaoName} & ${bubuName}的記帳本`;

        try {
            const notebookId = await window.FirebaseAPI.addNotebook(
                this.coupleId,
                notebookName,
                this.couple.member_ids,
                this.couple.member_names
            );
            console.log('✅ 已建立預設配對帳本:', notebookId);

            // 重新載入帳本列表
            await this.loadNotebooks();
        } catch (error) {
            console.error('❌ 建立預設帳本失敗:', error);
            throw error;
        }
    }

    // ==================== 交易相關操作 ====================

    /**
     * 新增交易
     * @param {Object} transactionData - 交易資料
     * @returns {Promise<Object>} - 交易物件
     */
    async addTransaction(transactionData) {
        try {
            const transaction = {
                notebook_id: this.currentNotebook,
                couple_id: this.coupleId,  // 新增：配對 ID
                user_id: this.currentUser.uid,
                ...transactionData
            };

            const transactionId = await window.FirebaseAPI.addTransaction(transaction);

            // 更新快取
            const newTransaction = {
                id: transactionId,
                ...transaction,
                created_at: new Date().toISOString()
            };
            this.transactions.unshift(newTransaction);

            console.log('✅ 交易已新增:', transactionId);
            return newTransaction;
        } catch (error) {
            console.error('❌ 新增交易失敗:', error);
            throw error;
        }
    }

    /**
     * 取得當前帳本的交易
     * @param {number} limit - 限制筆數
     * @returns {Array} - 交易列表
     */
    getTransactions(limit = null) {
        const filtered = this.transactions
            .filter(tx => tx.notebook_id === this.currentNotebook)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return limit ? filtered.slice(0, limit) : filtered;
    }

    /**
     * 取得特定日期的交易
     * @param {string} date - 日期 (YYYY-MM-DD)
     * @returns {Array} - 交易列表
     */
    getTransactionsByDate(date) {
        return this.transactions
            .filter(tx =>
                tx.notebook_id === this.currentNotebook &&
                tx.date === date
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    /**
     * 取得最近的交易記錄
     * @param {number} limit - 限制筆數
     * @returns {Promise<Array>} - 交易列表
     */
    async getRecentTransactions(limit = 30) {
        try {
            const transactions = await window.FirebaseAPI.getRecentTransactions(
                this.currentNotebook,
                limit
            );
            return transactions;
        } catch (error) {
            console.error('❌ 取得最近交易失敗:', error);
            // Fallback 到快取資料（按建立時間排序）
            return this.transactions
                .filter(tx => tx.notebook_id === this.currentNotebook)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
        }
    }

    /**
     * 取得日期範圍內的交易
     * @param {string} startDate - 開始日期 (YYYY-MM-DD)
     * @param {string} endDate - 結束日期 (YYYY-MM-DD)
     * @returns {Promise<Array>} - 交易列表
     */
    async getTransactionsByDateRange(startDate, endDate) {
        try {
            // 從 Firebase 取得日期範圍內的交易（確保最新資料）
            const transactions = await window.FirebaseAPI.getTransactionsByDateRange(
                this.currentNotebook,
                startDate,
                endDate
            );
            return transactions;
        } catch (error) {
            console.error('❌ 取得日期範圍交易失敗:', error);
            // Fallback 到快取資料
            return this.transactions
                .filter(tx => {
                    if (tx.notebook_id !== this.currentNotebook) return false;
                    const txDate = new Date(tx.date);
                    return txDate >= new Date(startDate) && txDate <= new Date(endDate);
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    /**
     * 刪除交易
     * @param {string} id - 交易 ID
     * @returns {Promise<boolean>} - 是否成功
     */
    async deleteTransaction(id) {
        try {
            await window.FirebaseAPI.deleteTransaction(id);

            // 更新快取
            const index = this.transactions.findIndex(tx => tx.id === id);
            if (index !== -1) {
                this.transactions.splice(index, 1);
            }

            console.log('✅ 交易已刪除:', id);
            return true;
        } catch (error) {
            console.error('❌ 刪除交易失敗:', error);
            throw error;
        }
    }

    /**
     * 更新交易
     * @param {string} id - 交易 ID
     * @param {Object} updates - 更新資料
     * @returns {Promise<Object>} - 更新後的交易物件
     */
    async updateTransaction(id, updates) {
        try {
            await window.FirebaseAPI.updateTransaction(id, updates);

            // 更新快取
            const transaction = this.transactions.find(tx => tx.id === id);
            if (transaction) {
                Object.assign(transaction, updates);
            }

            console.log('✅ 交易已更新:', id);
            return transaction;
        } catch (error) {
            console.error('❌ 更新交易失敗:', error);
            throw error;
        }
    }

    // ==================== 帳本相關操作 ====================

    /**
     * 取得所有帳本
     * @returns {Array} - 帳本列表
     */
    getNotebooks() {
        return this.notebooks;
    }

    /**
     * 新增帳本
     * @param {string} name - 帳本名稱
     * @returns {Promise<Object>} - 帳本物件
     */
    async addNotebook(name) {
        try {
            const notebookId = await window.FirebaseAPI.addNotebook(
                this.coupleId,
                name,
                this.couple.member_ids,
                this.couple.member_names
            );

            // 更新快取
            const newNotebook = {
                id: notebookId,
                name: name,
                couple_id: this.coupleId,
                member_ids: this.couple.member_ids,
                member_names: this.couple.member_names,
                created_at: new Date().toISOString()
            };
            this.notebooks.push(newNotebook);

            console.log('✅ 配對帳本已新增:', notebookId);
            return newNotebook;
        } catch (error) {
            console.error('❌ 新增帳本失敗:', error);
            throw error;
        }
    }

    /**
     * 切換當前帳本
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<Object>} - 帳本物件
     */
    async switchNotebook(notebookId) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            this.currentNotebook = notebookId;

            // 重新載入該帳本的交易
            await this.loadTransactions();

            console.log('📖 已切換帳本:', notebook.name);
            return notebook;
        }
        return null;
    }

    /**
     * 取得當前帳本
     * @returns {Object} - 帳本物件
     */
    getCurrentNotebook() {
        return this.notebooks.find(nb => nb.id === this.currentNotebook);
    }

    // ==================== 統計計算 ====================

    /**
     * 計算結算狀態（誰欠誰多少）
     * @returns {Object} - 結算狀態
     */
    calculateBalance() {
        const transactions = this.getTransactions();
        const currentNotebook = this.getCurrentNotebook();

        if (!currentNotebook || !this.couple) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        }

        // 取得當前用戶和伴侶的資訊（從配對資料）
        const myId = this.currentUser.uid;
        const myName = this.couple.member_names[myId] || this.currentUser.displayName || '我';
        const myRole = this.couple.member_roles[myId];  // 'baobao' | 'bubu'

        // 取得伴侶資訊
        const partnerName = this.partner?.name || '對方';
        const partnerRole = this.partner?.role;  // 'baobao' | 'bubu'

        let myTotal = 0;
        let partnerTotal = 0;

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            // 判斷是否為我付的（優先使用 user_id，fallback 到 payer）
            const isPaidByMe = tx.user_id === myId || tx.payer === 'me';

            // 根據「誰幫誰付」計算欠款
            if (isPaidByMe) {
                // 我付的錢
                if (tx.beneficiary === 'both') {
                    // 我幫共付 → 對方欠我一半
                    myTotal += amount / 2;
                } else if (tx.beneficiary === 'partner') {
                    // 我幫對方付 → 對方欠我全額
                    myTotal += amount;
                }
                // else: 我幫我付 (beneficiary === 'self') → 不影響欠款
            } else {
                // 對方付的錢
                if (tx.beneficiary === 'both') {
                    // 對方幫共付 → 我欠對方一半
                    partnerTotal += amount / 2;
                } else if (tx.beneficiary === 'self') {
                    // 對方幫我付 → 我欠對方全額
                    partnerTotal += amount;
                }
                // else: 對方幫對方付 (beneficiary === 'partner') → 不影響欠款
            }
        });

        const difference = myTotal - partnerTotal;

        if (Math.abs(difference) < 0.01) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        } else if (difference > 0) {
            return {
                status: 'owed',
                amount: Math.abs(difference),
                debtor: partnerName,
                creditor: myName
            };
        } else {
            return {
                status: 'owes',
                amount: Math.abs(difference),
                debtor: myName,
                creditor: partnerName
            };
        }
    }

    /**
     * 計算分類統計
     * @param {Array} transactions - 交易列表（可選）
     * @returns {Array} - 分類統計
     */
    getCategoryStats(transactions = null) {
        const txs = transactions || this.getTransactions();
        const categoryTotals = {};
        let uncategorizedTotal = 0; // 未分類總額

        txs.forEach(tx => {
            if (tx.categories && Array.isArray(tx.categories) && tx.categories.length > 0) {
                // 有分類標籤
                tx.categories.forEach(cat => {
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(tx.amount);
                });
            } else {
                // 沒有分類標籤 → 歸類為「未分類」
                uncategorizedTotal += parseFloat(tx.amount);
            }
        });

        // 加入未分類項目
        if (uncategorizedTotal > 0) {
            categoryTotals['未分類'] = uncategorizedTotal;
        }

        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: total > 0 ? (amount / total * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    /**
     * 計算總支出統計
     * @param {Array} transactions - 交易列表（可選）
     * @returns {Object} - 支出統計
     */
    getExpenseStats(transactions = null) {
        const txs = transactions || this.getTransactions();
        const myId = this.currentUser.uid;

        let totalExpense = 0;
        let myExpense = 0;
        let partnerExpense = 0;

        txs.forEach(tx => {
            const amount = parseFloat(tx.amount);
            totalExpense += amount;

            const isPaidByMe = tx.payer === 'me' || tx.user_id === myId;
            if (isPaidByMe) {
                myExpense += amount;
            } else {
                partnerExpense += amount;
            }
        });

        return { totalExpense, myExpense, partnerExpense };
    }

    /**
     * 取得每日支出統計（用於日曆顯示）
     * @param {number} year - 年份
     * @param {number} month - 月份 (0-11)
     * @returns {Object} - 每日支出統計
     */
    getDailyExpenses(year, month) {
        const dailyTotals = {};

        this.transactions
            .filter(tx => {
                if (tx.notebook_id !== this.currentNotebook) return false;
                const txDate = new Date(tx.date);
                return txDate.getFullYear() === year && txDate.getMonth() === month;
            })
            .forEach(tx => {
                const date = tx.date;
                dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(tx.amount);
            });

        return dailyTotals;
    }

    // ==================== 工具函數 ====================

    /**
     * 格式化日期為 YYYY-MM-DD
     * @param {Date} date - 日期物件
     * @returns {string} - 格式化後的日期
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 取得今天日期
     * @returns {string} - 今天的日期 (YYYY-MM-DD)
     */
    getToday() {
        return this.formatDate(new Date());
    }

    // ==================== 自訂分類管理 ====================

    /**
     * 新增自訂分類
     * @param {string} name - 分類名稱
     * @param {string} icon - 圖標名稱
     * @returns {Promise<Object>} - 分類物件
     */
    async addCustomCategory(name, icon = 'label') {
        try {
            const category = {
                name: name,
                icon: icon
            };

            const categoryId = await window.FirebaseAPI.addCustomCategory(this.currentUser.uid, category);

            // 更新快取
            const newCategory = {
                id: categoryId,
                ...category,
                created_at: new Date().toISOString()
            };
            this.customCategories.push(newCategory);

            console.log('✅ 自訂分類已新增:', categoryId);
            return newCategory;
        } catch (error) {
            console.error('❌ 新增自訂分類失敗:', error);
            throw error;
        }
    }

    /**
     * 取得所有自訂分類
     * @returns {Array} - 自訂分類列表
     */
    getCustomCategories() {
        return this.customCategories;
    }

    /**
     * 刪除自訂分類
     * @param {string} id - 分類 ID
     * @returns {Promise<boolean>} - 是否成功
     */
    async deleteCustomCategory(id) {
        try {
            await window.FirebaseAPI.deleteCustomCategory(id);

            // 更新快取
            const index = this.customCategories.findIndex(cat => cat.id === id);
            if (index !== -1) {
                this.customCategories.splice(index, 1);
            }

            console.log('✅ 自訂分類已刪除:', id);
            return true;
        } catch (error) {
            console.error('❌ 刪除自訂分類失敗:', error);
            throw error;
        }
    }

    /**
     * 清除所有資料（重置）- Firebase 版本不支援
     */
    reset() {
        console.warn('⚠️ Firebase 版本不支援 reset 功能');
    }

    // ==================== 照片管理 ====================

    /**
     * 上傳交易照片
     * @param {File} file - 圖片檔案
     * @param {string} transactionId - 交易 ID
     * @returns {Promise<Object>} - { url, path, fileName }
     */
    async uploadTransactionPhoto(file, transactionId) {
        try {
            console.log('📸 上傳交易照片...');
            const result = await window.FirebaseAPI.uploadPhoto(
                file,
                this.currentUser.uid,
                transactionId
            );
            console.log('✅ 交易照片上傳成功');
            return result;
        } catch (error) {
            console.error('❌ 上傳交易照片失敗:', error);
            throw error;
        }
    }

    /**
     * 刪除交易照片
     * @param {string} photoPath - 照片儲存路徑
     * @returns {Promise<void>}
     */
    async deleteTransactionPhoto(photoPath) {
        try {
            console.log('🗑️ 刪除交易照片...');
            await window.FirebaseAPI.deletePhoto(photoPath);
            console.log('✅ 交易照片已刪除');
        } catch (error) {
            console.error('❌ 刪除交易照片失敗:', error);
            throw error;
        }
    }
}

// 建立全域資料管理實例
const dataManager = new DataManager();

// 導出供其他模組使用
if (typeof window !== 'undefined') {
    window.DataManager = dataManager;
}

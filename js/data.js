// ==================== 資料管理模組 (Firebase 版本) ====================
// 此模組負責管理應用的資料狀態，使用 Firebase Firestore

import { BalanceManager } from './core/BalanceManager.js';
import { BalanceInitializer } from './utils/BalanceInitializer.js';

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

        // 餘額管理器
        this.balanceManager = new BalanceManager();
        window.BalanceManager = BalanceManager; // 掛載類別供工具使用

        // 餘額初始化器
        this.balanceInitializer = new BalanceInitializer();

        // 監聽範圍
        this.listeningStartDate = null;  // 監聽的起始日期

        // 防抖計時器
        this._debounceTimer = null;
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

            // 2. 檢查並初始化餘額
            console.log('🔧 檢查帳本餘額...');
            await this.balanceInitializer.initializeAll(this.coupleId, this.notebooks);

            // 3. 如果沒有帳本，建立預設帳本
            if (this.notebooks.length === 0) {
                console.log('📝 首次配對，建立預設帳本...');
                await this.createDefaultNotebook();
            }

            // 4. 設定當前帳本
            if (!this.currentNotebook && this.notebooks.length > 0) {
                this.currentNotebook = this.notebooks[0].id;
                console.log('📖 當前帳本:', this.notebooks[0].name);
                // ⭐ [修正點 1] 啟動餘額監聽 (讓結算卡片會動)
                this.startListeningNotebookBalance();
            }

            // ⭐ [修正點 2] 啟動帳本列表監聽 (讓"我們的故事書"有資料)
            this.startListeningNotebooks();

            // 5. 啟動交易監聽（取代 loadTransactions）
            if (this.currentNotebook) {
                this.startListeningTransactions();
            }

            // 6. 載入自訂分類
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
            console.log('🔍 嘗試載入帳本，coupleId:', this.coupleId);
            this.notebooks = await window.FirebaseAPI.getNotebooks(this.coupleId);
            console.log(`📚 已載入 ${this.notebooks.length} 個配對帳本`);
        } catch (error) {
            console.error('❌ 載入帳本失敗:', error);
            console.error('   錯誤詳情:', error.code, error.message);
            this.notebooks = [];
            throw error;  // 重新拋出錯誤以便上層捕捉
        }
    }

    /**
     * 載入當前帳本的交易
     */
    async loadTransactions() {
        try {
            const transactions = await window.FirebaseAPI.getTransactions(this.coupleId, this.currentNotebook);
            // 添加 notebook_id 以支援多帳本篩選
            this.transactions = transactions.map(tx => ({
                ...tx,
                notebook_id: this.currentNotebook
            }));
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
        // 統一使用角色名稱（寶寶 & 步步）
        const notebookName = '寶寶 & 步步的記帳本';

        try {
            const notebookId = await window.FirebaseAPI.addNotebook(
                this.coupleId,
                notebookName,
                this.couple.member_ids,
                this.couple.member_names
            );
            console.log('✅ 已建立預設配對帳本:', notebookId);

            // 初始化餘額為 0
            await window.FirebaseAPI.initializeNotebookBalance(this.coupleId, notebookId, {
                baobao_owed: 0,
                bubu_owed: 0
            });
            console.log('✅ 已初始化帳本餘額');

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
            // 離線提示
            if (window.networkMonitor && !window.networkMonitor.isOnline) {
                console.log('📡 離線模式：變更將在重新連線後同步');
            }

            // 1. 新增交易到 Firestore
            const transaction = {
                user_id: this.currentUser.uid,
                ...transactionData
            };

            const transactionId = await window.FirebaseAPI.addTransaction(this.coupleId, this.currentNotebook, transaction);
            console.log('✅ 交易已新增:', transactionId);

            // 2. 增量更新餘額
            const { baobaoDelta, bubuDelta } = this.balanceManager.calculateTransactionDelta(transaction);
            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.coupleId,
                    this.currentNotebook,
                    baobaoDelta,
                    bubuDelta
                );
                console.log('💰 餘額已更新:', { baobaoDelta, bubuDelta });
            }

            // 3. 本地快取會由 onSnapshot 自動更新，不需要手動處理

            return {
                id: transactionId,
                ...transaction
            };
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
                this.coupleId,
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
     * 取得日期範圍內的交易（優先使用本地快取）
     * @param {string} startDate - 開始日期 (YYYY-MM-DD)
     * @param {string} endDate - 結束日期 (YYYY-MM-DD)
     * @returns {Promise<Array>} - 交易列表
     */
    async getTransactionsByDateRange(startDate, endDate) {
        // 檢查是否在監聽範圍內（近 3 個月）
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const threeMonthsAgoStr = this.formatDate(threeMonthsAgo);

        const isWithinListeningRange = startDate >= threeMonthsAgoStr;

        if (isWithinListeningRange) {
            // 使用本地快取（已由 onSnapshot 自動更新）
            console.log('📊 使用本地快取查詢日期範圍');
            return this.transactions
                .filter(tx =>
                    tx.notebook_id === this.currentNotebook &&
                    tx.date >= startDate &&
                    tx.date <= endDate
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // 超出監聽範圍，從 Firebase 查詢
        console.log('📊 超出監聽範圍，從 Firebase 查詢');
        try {
            const transactions = await window.FirebaseAPI.getTransactionsByDateRange(
                this.coupleId,
                this.currentNotebook,
                startDate,
                endDate
            );
            // 添加 notebook_id 以支援多帳本篩選
            return transactions.map(tx => ({
                ...tx,
                notebook_id: this.currentNotebook
            }));
        } catch (error) {
            console.error('❌ 查詢日期範圍失敗:', error);
            // Fallback 到本地快取
            return this.transactions
                .filter(tx =>
                    tx.notebook_id === this.currentNotebook &&
                    tx.date >= startDate &&
                    tx.date <= endDate
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    /**
     * 取得特定日期的交易（使用本地快取）
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
     * 刪除交易
     * @param {string} id - 交易 ID
     * @returns {Promise<boolean>} - 是否成功
     */
    async deleteTransaction(id) {
        try {
            // 1. 取得交易資料（用於餘額回退）
            const transaction = this.transactions.find(tx => tx.id === id);
            if (!transaction) {
                throw new Error('交易不存在');
            }

            // 2. 刪除交易
            await window.FirebaseAPI.deleteTransaction(this.coupleId, this.currentNotebook, id);
            console.log('✅ 交易已刪除:', id);

            // 3. 反向更新餘額（減去這筆交易的影響）
            const { baobaoDelta, bubuDelta } = this.balanceManager.calculateTransactionDelta(transaction);
            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.coupleId,
                    this.currentNotebook,
                    -baobaoDelta,  // 反向操作
                    -bubuDelta
                );
                console.log('💰 餘額已回退:', { baobaoDelta: -baobaoDelta, bubuDelta: -bubuDelta });
            }

            // 4. 本地快取會由 onSnapshot 自動更新

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
            // 1. 取得舊交易資料
            const oldTransaction = this.transactions.find(tx => tx.id === id);
            if (!oldTransaction) {
                throw new Error('交易不存在');
            }

            // 2. 更新交易
            await window.FirebaseAPI.updateTransaction(this.coupleId, this.currentNotebook, id, updates);
            console.log('✅ 交易已更新:', id);

            // 3. 更新餘額（先減去舊的，再加上新的）
            const newTransaction = { ...oldTransaction, ...updates };

            const oldDelta = this.balanceManager.calculateTransactionDelta(oldTransaction);
            const newDelta = this.balanceManager.calculateTransactionDelta(newTransaction);

            const baobaoDelta = newDelta.baobaoDelta - oldDelta.baobaoDelta;
            const bubuDelta = newDelta.bubuDelta - oldDelta.bubuDelta;

            if (baobaoDelta !== 0 || bubuDelta !== 0) {
                await window.FirebaseAPI.incrementNotebookBalance(
                    this.coupleId,
                    this.currentNotebook,
                    baobaoDelta,
                    bubuDelta
                );
                console.log('💰 餘額已調整:', { baobaoDelta, bubuDelta });
            }

            // 4. 本地快取會由 onSnapshot 自動更新

            return newTransaction;
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

            // 停止所有舊監聽器
            this.stopListeningTransactions();
            this.stopListeningBalance();  // ✅ 新增：停止餘額監聽

            // 清空快取
            this.transactions = [];

            // 啟動新監聽器
            this.startListeningTransactions();
            this.startListeningNotebookBalance();  // ✅ 新增：啟動餘額監聽

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

        // 使用角色名稱（寶寶/步步）
        const baobaoName = '寶寶';
        const bubuName = '步步';
        const myRole = this.myRole;  // 我的角色 ('baobao' | 'bubu')
        const partnerRole = this.partner?.role;  // 對方的角色 ('baobao' | 'bubu')

        let baobaoOwed = 0;  // 寶寶被欠的錢（寶寶付出，對方應該還的）
        let bubuOwed = 0;    // 步步被欠的錢（步步付出，對方應該還的）

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            const payer = tx.payer;  // 絕對角色 ('baobao' | 'bubu')
            const beneficiary = tx.beneficiary;  // 絕對角色 ('baobao' | 'bubu' | 'both')

            // 根據「誰幫誰付」計算欠款
            if (payer === 'baobao') {
                // 寶寶付的錢
                if (beneficiary === 'both') {
                    // 寶幫共付 → 步步欠寶寶一半
                    baobaoOwed += amount / 2;
                } else if (beneficiary === 'bubu') {
                    // 寶幫步付 → 步步欠寶寶全額
                    baobaoOwed += amount;
                }
                // else: 寶幫寶付 (beneficiary === 'baobao') → 不影響欠款
            } else if (payer === 'bubu') {
                // 步步付的錢
                if (beneficiary === 'both') {
                    // 步幫共付 → 寶寶欠步步一半
                    bubuOwed += amount / 2;
                } else if (beneficiary === 'baobao') {
                    // 步幫寶付 → 寶寶欠步步全額
                    bubuOwed += amount;
                }
                // else: 步幫步付 (beneficiary === 'bubu') → 不影響欠款
            }
        });

        // 計算淨欠款（寶寶被欠 - 步步被欠）
        const difference = baobaoOwed - bubuOwed;

        if (Math.abs(difference) < 0.01) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        } else if (difference > 0) {
            // 寶寶被欠得多 → 步步欠寶寶
            return {
                status: 'owed',
                amount: Math.abs(difference),
                debtor: bubuName,
                creditor: baobaoName
            };
        } else {
            // 步步被欠得多 → 寶寶欠步步
            return {
                status: 'owes',
                amount: Math.abs(difference),
                debtor: baobaoName,
                creditor: bubuName
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

        let totalExpense = 0;
        let baobaoExpense = 0;  // 寶寶的總支出
        let bubuExpense = 0;    // 步步的總支出

        txs.forEach(tx => {
            const amount = parseFloat(tx.amount);
            totalExpense += amount;

            // 使用絕對角色統計（不分誰登入）
            if (tx.payer === 'baobao') {
                baobaoExpense += amount;
            } else if (tx.payer === 'bubu') {
                bubuExpense += amount;
            }
        });

        return {
            totalExpense,
            baobaoExpense,  // 寶寶的花費
            bubuExpense     // 步步的花費
        };
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

    // ==================== 即時監聽 ====================

    /**
     * 開始監聽交易（近 3 個月）
     */
    startListeningTransactions() {
        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('transactions');

        // 設定監聽起始日期（近 3 個月）
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        this.listeningStartDate = this.formatDate(threeMonthsAgo);

        console.log(`🎧 開始監聽交易 (自 ${this.listeningStartDate})...`);

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onRecentTransactionsChange(
            this.coupleId,
            this.currentNotebook,
            threeMonthsAgo,
            (transactions, changes) => this.handleTransactionsChange(transactions, changes)
        );

        window.listenerManager.register('transactions', unsubscribe);
    }

    /**
     * 處理交易變更回調（防抖處理）
     * @param {Array} transactions - 完整交易列表
     * @param {Object} changes - 變更詳情 { added, modified, removed }
     */
    handleTransactionsChange(transactions, changes) {
        // 取消之前的計時器
        if (this._debounceTimer) clearTimeout(this._debounceTimer);

        // 300ms 內只觸發一次（避免頻繁更新）
        this._debounceTimer = setTimeout(() => {
            console.log('📊 更新交易快取...');

            // 更新本地快取（添加 notebook_id 以支援多帳本篩選）
            this.transactions = transactions.map(tx => ({
                ...tx,
                notebook_id: this.currentNotebook
            }));

            // 通知訂閱者
            if (window.app && window.app.state) {
                window.app.state.notify('transactions', { transactions, changes });
            }

            // 如果對方新增交易，顯示提示（可選）
            if (changes.added.length > 0) {
                const addedByMe = changes.added.every(tx => tx.user_id === this.currentUser.uid);
                if (!addedByMe) {
                    console.log(`✨ 對方新增了 ${changes.added.length} 筆記錄`);
                }
            }
        }, 300);
    }

    /**
     * 停止監聽交易
     */
    stopListeningTransactions() {
        window.listenerManager.unregister('transactions');
        console.log('🛑 已停止監聽交易');
    }

    /**
     * 載入更早的交易（分批載入）
     */
    async loadEarlierTransactions(limitCount = 30) {
        if (this.transactions.length === 0) {
            console.warn('⚠️ 尚未載入任何交易');
            return [];
        }

        // 找到最早的交易日期
        const sortedDates = this.transactions.map(tx => tx.date).sort();
        const earliestDate = sortedDates[0];

        console.log(`📥 載入 ${earliestDate} 之前的交易...`);

        try {
            const earlierTransactions = await window.FirebaseAPI.getEarlierTransactions(
                this.coupleId,
                this.currentNotebook,
                earliestDate,
                limitCount
            );

            if (earlierTransactions.length > 0) {
                // 合併到本地快取（避免重複）
                const existingIds = new Set(this.transactions.map(tx => tx.id));
                const newTransactions = earlierTransactions
                    .filter(tx => !existingIds.has(tx.id))
                    // 添加 notebook_id 以支援多帳本篩選
                    .map(tx => ({
                        ...tx,
                        notebook_id: this.currentNotebook
                    }));

                this.transactions = [...this.transactions, ...newTransactions];

                // 更新監聽起始日期
                const newEarliestDate = newTransactions.map(tx => tx.date).sort()[0];
                if (newEarliestDate) {
                    this.listeningStartDate = newEarliestDate;
                }

                console.log(`✅ 已載入 ${newTransactions.length} 筆更早的交易`);

                // 通知訂閱者
                if (window.app && window.app.state) {
                    window.app.state.notify('transactions', {
                        transactions: this.transactions,
                        changes: { added: newTransactions, modified: [], removed: [] }
                    });
                }
            } else {
                console.log('⚠️ 沒有更早的交易了');
            }

            return earlierTransactions;
        } catch (error) {
            console.error('❌ 載入更早交易失敗:', error);
            throw error;
        }
    }

    /**
     * 開始監聽帳本列表
     */
    startListeningNotebooks() {
        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('notebooks');

        console.log('🎧 開始監聽帳本列表...');

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onNotebooksChange(
            this.coupleId,
            (notebooks) => this.handleNotebooksChange(notebooks)
        );

        window.listenerManager.register('notebooks', unsubscribe);
    }

    /**
     * 處理帳本列表變更回調
     * @param {Array} notebooks - 完整帳本列表
     */
    handleNotebooksChange(notebooks) {
        console.log('📚 帳本列表更新...');

        // 更新本地快取
        this.notebooks = notebooks;

        // 通知訂閱者
        if (window.app && window.app.state) {
            window.app.state.notify('notebooks', notebooks);
        }
    }

    /**
     * 停止監聽帳本列表
     */
    stopListeningNotebooks() {
        window.listenerManager.unregister('notebooks');
        console.log('🛑 已停止監聽帳本列表');
    }

    /**
     * 開始監聽當前帳本餘額
     */
    startListeningNotebookBalance() {
        if (!this.currentNotebook) {
            console.warn('⚠️ 無當前帳本，無法監聽餘額');
            return;
        }

        // 停止舊的監聽（如果有）
        window.listenerManager.unregister('balance');

        console.log('🎧 開始監聽帳本餘額...');

        // 註冊監聽器
        const unsubscribe = window.FirebaseAPI.onNotebookBalanceChange(
            this.coupleId,
            this.currentNotebook,
            (balance) => this.handleBalanceChange(balance)
        );

        window.listenerManager.register('balance', unsubscribe);
    }

    /**
     * 處理餘額變更回調
     * @param {Object} balance - { baobao_owed, bubu_owed, version, last_updated }
     */
    handleBalanceChange(balance) {
        console.log('💰 餘額更新:', balance);

        // 計算結算狀態
        const balanceStatus = this.balanceManager.calculateBalanceStatus(balance);

        // 通知訂閱者
        if (window.app && window.app.state) {
            window.app.state.notify('balance', balanceStatus);
        }
    }

    /**
     * 停止監聽餘額
     */
    stopListeningBalance() {
        window.listenerManager.unregister('balance');
        console.log('🛑 已停止監聽餘額');
    }

    /**
     * 清理資源（登出時調用）
     */
    cleanup() {
        console.log('🧹 清理 DataManager 資源...');

        // 停止所有監聽器
        if (window.listenerManager) {
            window.listenerManager.unregisterAll();
        }

        // 清空本地快取
        this.transactions = [];
        this.notebooks = [];
        this.currentNotebook = null;
        this.isInitialized = false;

        console.log('✅ DataManager 已清理');
    }
}

// 建立全域資料管理實例
const dataManager = new DataManager();

// 導出供其他模組使用
if (typeof window !== 'undefined') {
    window.DataManager = dataManager;
}

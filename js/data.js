// ==================== 資料管理模組 ====================
// 此模組負責管理應用的資料狀態（目前使用本地 localStorage，未來可無縫切換至 Firebase）

class DataManager {
    constructor() {
        this.currentUser = { id: 'user1', name: '我' };
        this.partner = { id: 'user2', name: '對方' };
        this.currentNotebook = null;
        this.notebooks = [];
        this.transactions = [];

        this.init();
    }

    // 初始化：從 localStorage 載入資料，若無則建立範例資料
    init() {
        const savedData = localStorage.getItem('coupleAppData');

        if (savedData) {
            const data = JSON.parse(savedData);
            this.notebooks = data.notebooks || [];
            this.transactions = data.transactions || [];
            this.currentNotebook = data.currentNotebook || null;
        } else {
            // 建立預設帳本和範例資料
            this.createDefaultData();
        }

        // 如果沒有當前帳本，設定第一個為當前
        if (!this.currentNotebook && this.notebooks.length > 0) {
            this.currentNotebook = this.notebooks[0].id;
        }
    }

    // 建立預設資料（範例）
    createDefaultData() {
        const defaultNotebook = {
            id: 'notebook_1',
            name: '我們的日常帳本',
            members: ['user1', 'user2'],
            created_at: new Date().toISOString()
        };

        this.notebooks.push(defaultNotebook);
        this.currentNotebook = defaultNotebook.id;

        // 建立一些範例交易
        const sampleTransactions = [
            {
                id: 'tx_1',
                notebook_id: 'notebook_1',
                payer: 'me',
                beneficiary: 'both',
                amount: 350,
                item_name: '晚餐',
                categories: ['吃吃'],
                photo_url: null,
                date: this.formatDate(new Date()),
                created_at: new Date().toISOString()
            },
            {
                id: 'tx_2',
                notebook_id: 'notebook_1',
                payer: 'partner',
                beneficiary: 'both',
                amount: 580,
                item_name: '電影票',
                categories: ['玩'],
                photo_url: null,
                date: this.formatDate(new Date(Date.now() - 86400000)),
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'tx_3',
                notebook_id: 'notebook_1',
                payer: 'me',
                beneficiary: 'self',
                amount: 120,
                item_name: '計程車',
                categories: ['交通'],
                photo_url: null,
                date: this.formatDate(new Date(Date.now() - 86400000 * 2)),
                created_at: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
                id: 'tx_4',
                notebook_id: 'notebook_1',
                payer: 'partner',
                beneficiary: 'both',
                amount: 1200,
                item_name: '購物',
                categories: ['購物', '生活'],
                photo_url: null,
                date: this.formatDate(new Date(Date.now() - 86400000 * 3)),
                created_at: new Date(Date.now() - 86400000 * 3).toISOString()
            },
            {
                id: 'tx_5',
                notebook_id: 'notebook_1',
                payer: 'me',
                beneficiary: 'both',
                amount: 450,
                item_name: '午餐',
                categories: ['吃吃'],
                photo_url: null,
                date: this.formatDate(new Date(Date.now() - 86400000 * 4)),
                created_at: new Date(Date.now() - 86400000 * 4).toISOString()
            }
        ];

        this.transactions = sampleTransactions;
        this.save();
    }

    // 儲存資料到 localStorage
    save() {
        const data = {
            notebooks: this.notebooks,
            transactions: this.transactions,
            currentNotebook: this.currentNotebook
        };
        localStorage.setItem('coupleAppData', JSON.stringify(data));
    }

    // ==================== 交易相關操作 ====================

    // 新增交易
    addTransaction(transactionData) {
        const transaction = {
            id: 'tx_' + Date.now(),
            notebook_id: this.currentNotebook,
            ...transactionData,
            created_at: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.save();
        return transaction;
    }

    // 取得當前帳本的交易
    getTransactions(limit = null) {
        const filtered = this.transactions
            .filter(tx => tx.notebook_id === this.currentNotebook)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return limit ? filtered.slice(0, limit) : filtered;
    }

    // 取得特定日期的交易
    getTransactionsByDate(date) {
        return this.transactions
            .filter(tx =>
                tx.notebook_id === this.currentNotebook &&
                tx.date === date
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // 取得日期範圍內的交易
    getTransactionsByDateRange(startDate, endDate) {
        return this.transactions
            .filter(tx => {
                if (tx.notebook_id !== this.currentNotebook) return false;
                const txDate = new Date(tx.date);
                return txDate >= new Date(startDate) && txDate <= new Date(endDate);
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // 刪除交易
    deleteTransaction(id) {
        const index = this.transactions.findIndex(tx => tx.id === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // 更新交易
    updateTransaction(id, updates) {
        const transaction = this.transactions.find(tx => tx.id === id);
        if (transaction) {
            Object.assign(transaction, updates);
            this.save();
            return transaction;
        }
        return null;
    }

    // ==================== 帳本相關操作 ====================

    // 取得所有帳本
    getNotebooks() {
        return this.notebooks;
    }

    // 新增帳本
    addNotebook(name) {
        const notebook = {
            id: 'notebook_' + Date.now(),
            name: name,
            members: ['user1', 'user2'],
            created_at: new Date().toISOString()
        };

        this.notebooks.push(notebook);
        this.save();
        return notebook;
    }

    // 切換當前帳本
    switchNotebook(notebookId) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            this.currentNotebook = notebookId;
            this.save();
            return notebook;
        }
        return null;
    }

    // 取得當前帳本
    getCurrentNotebook() {
        return this.notebooks.find(nb => nb.id === this.currentNotebook);
    }

    // ==================== 統計計算 ====================

    // 計算結算狀態（誰欠誰多少）
    calculateBalance() {
        const transactions = this.getTransactions();
        let myTotal = 0;
        let partnerTotal = 0;

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);

            if (tx.beneficiary === 'both') {
                // 兩人平分
                const half = amount / 2;
                if (tx.payer === 'me') {
                    myTotal += half;  // 我多付了一半
                } else {
                    partnerTotal += half;  // 對方多付了一半
                }
            } else if (tx.beneficiary === 'partner') {
                // 幫對方付
                if (tx.payer === 'me') {
                    myTotal += amount;  // 我幫對方付，對方欠我
                }
            } else if (tx.beneficiary === 'self') {
                // 自己付自己的
                if (tx.payer === 'partner') {
                    partnerTotal += amount;  // 對方幫我付，我欠對方
                }
            }
        });

        const difference = myTotal - partnerTotal;

        if (Math.abs(difference) < 0.01) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        } else if (difference > 0) {
            return {
                status: 'owed',
                amount: Math.abs(difference),
                debtor: this.partner.name,
                creditor: this.currentUser.name
            };
        } else {
            return {
                status: 'owes',
                amount: Math.abs(difference),
                debtor: this.currentUser.name,
                creditor: this.partner.name
            };
        }
    }

    // 計算分類統計
    getCategoryStats(transactions = null) {
        const txs = transactions || this.getTransactions();
        const categoryTotals = {};

        txs.forEach(tx => {
            if (tx.categories && Array.isArray(tx.categories)) {
                tx.categories.forEach(cat => {
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(tx.amount);
                });
            }
        });

        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: total > 0 ? (amount / total * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    // 計算總支出統計
    getExpenseStats(transactions = null) {
        const txs = transactions || this.getTransactions();
        let totalExpense = 0;
        let myExpense = 0;
        let partnerExpense = 0;

        txs.forEach(tx => {
            const amount = parseFloat(tx.amount);
            totalExpense += amount;

            if (tx.payer === 'me') {
                myExpense += amount;
            } else {
                partnerExpense += amount;
            }
        });

        return { totalExpense, myExpense, partnerExpense };
    }

    // 取得每日支出統計（用於日曆顯示）
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

    // 格式化日期為 YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 取得今天日期
    getToday() {
        return this.formatDate(new Date());
    }

    // 清除所有資料（重置）
    reset() {
        this.notebooks = [];
        this.transactions = [];
        this.currentNotebook = null;
        localStorage.removeItem('coupleAppData');
        this.createDefaultData();
    }
}

// 建立全域資料管理實例
const dataManager = new DataManager();

// 導出供其他模組使用
if (typeof window !== 'undefined') {
    window.DataManager = dataManager;
}

// ==================== 帳本統計初始化工具 ====================
// 為現有帳本補充統計資料（stats 欄位）

export class NotebookStatsInitializer {
    /**
     * 初始化單個帳本的統計
     * @param {string} coupleId - 配對 ID
     * @param {string} notebookId - 帳本 ID
     * @param {Array} transactions - 交易列表（可選，不提供則自動查詢）
     * @returns {Promise<Object>} - 統計資料
     */
    async initializeNotebook(coupleId, notebookId, transactions = null) {
        try {
            // 1. 如果沒有提供交易列表，查詢所有交易
            if (!transactions) {
                console.log(`📊 查詢帳本 ${notebookId} 的所有交易...`);
                const { getFirestore, collection, query, getDocs } = window.firebaseModules;
                const db = getFirestore();
                const transactionsRef = collection(db, 'couples', coupleId, 'notebooks', notebookId, 'transactions');
                const q = query(transactionsRef);
                const querySnapshot = await getDocs(q);
                transactions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log(`✅ 找到 ${transactions.length} 筆交易`);
            }

            // 2. 計算統計資料
            let baobao_paid = 0;
            let bubu_paid = 0;
            let total_expense = 0;
            const transaction_count = transactions.length;

            transactions.forEach(tx => {
                const amount = parseFloat(tx.amount);
                total_expense += amount;

                if (tx.payer === 'baobao') {
                    baobao_paid += amount;
                } else if (tx.payer === 'bubu') {
                    bubu_paid += amount;
                }
            });

            const stats = {
                baobao_paid,
                bubu_paid,
                total_expense,
                transaction_count
            };

            console.log(`📊 帳本 ${notebookId} 統計:`, stats);

            // 3. 寫入 Firestore
            await window.FirebaseAPI.initializeNotebookStats(coupleId, notebookId, stats);
            console.log(`✅ 帳本 ${notebookId} 統計已初始化`);

            return stats;
        } catch (error) {
            console.error(`❌ 初始化帳本 ${notebookId} 統計失敗:`, error);
            throw error;
        }
    }

    /**
     * 批量初始化所有帳本的統計
     * @param {string} coupleId - 配對 ID
     * @param {Array} notebooks - 帳本列表
     * @returns {Promise<void>}
     */
    async initializeAll(coupleId, notebooks) {
        console.log(`📊 開始批量初始化統計，共 ${notebooks.length} 個帳本...`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const notebook of notebooks) {
            try {
                // 檢查是否已有統計資料
                if (notebook.stats && notebook.stats.last_updated) {
                    console.log(`⏭️ 帳本 ${notebook.id} (${notebook.name}) 已有統計，跳過`);
                    skipCount++;
                    continue;
                }

                console.log(`🔧 正在初始化帳本 ${notebook.id} (${notebook.name})...`);
                await this.initializeNotebook(coupleId, notebook.id);
                successCount++;
            } catch (error) {
                console.error(`❌ 帳本 ${notebook.id} (${notebook.name}) 初始化失敗:`, error);
                errorCount++;
            }
        }

        console.log(`✅ 批量初始化完成：成功 ${successCount}，跳過 ${skipCount}，失敗 ${errorCount}`);
    }

    /**
     * 手動重算單個帳本的統計（強制更新）
     * @param {string} coupleId - 配對 ID
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<Object>} - 統計資料
     */
    async recalculate(coupleId, notebookId) {
        console.log(`🔄 重新計算帳本 ${notebookId} 的統計...`);
        return await this.initializeNotebook(coupleId, notebookId);
    }
}

// 掛載到全域
if (typeof window !== 'undefined') {
    window.NotebookStatsInitializer = NotebookStatsInitializer;
}

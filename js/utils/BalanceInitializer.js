// 餘額初始化工具 - 為舊帳本初始化 balance 欄位
export class BalanceInitializer {
    constructor() {
        console.log('🔧 BalanceInitializer 已建立');
    }

    /**
     * 檢查並初始化帳本餘額
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<boolean>} - 是否需要初始化
     */
    async checkAndInitialize(notebookId) {
        try {
            // 取得帳本資料
            const { doc, getDoc, getFirestore } = window.firebaseModules;
            const db = getFirestore();
            const notebookRef = doc(db, 'notebooks', notebookId);
            const notebookDoc = await getDoc(notebookRef);

            if (!notebookDoc.exists()) {
                console.error('❌ 帳本不存在:', notebookId);
                return false;
            }

            const notebook = notebookDoc.data();

            // 檢查是否已有 balance 欄位
            if (notebook.balance) {
                console.log('✅ 帳本已有餘額資料，無需初始化');
                return false;
            }

            console.log('⚠️ 帳本無餘額資料，開始初始化...');

            // 取得所有交易
            const transactions = await window.FirebaseAPI.getTransactions(notebookId, 9999);
            console.log(`📊 取得 ${transactions.length} 筆交易`);

            // 計算完整餘額
            const balanceManager = new window.BalanceManager();
            const balance = balanceManager.calculateFullBalance(transactions);

            console.log('💰 計算結果:', balance);

            // 寫入 Firebase
            await window.FirebaseAPI.initializeNotebookBalance(notebookId, balance);

            console.log('✅ 餘額初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 餘額初始化失敗:', error);
            throw error;
        }
    }

    /**
     * 初始化所有帳本的餘額
     * @param {Array} notebooks - 帳本列表
     */
    async initializeAll(notebooks) {
        console.log(`🔧 準備初始化 ${notebooks.length} 個帳本...`);

        for (const notebook of notebooks) {
            try {
                await this.checkAndInitialize(notebook.id);
            } catch (error) {
                console.error(`❌ 初始化帳本 ${notebook.name} 失敗:`, error);
            }
        }

        console.log('✅ 所有帳本初始化完成');
    }
}

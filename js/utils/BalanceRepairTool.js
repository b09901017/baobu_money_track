// 餘額修復工具 - 檢查和修復帳本餘額
export class BalanceRepairTool {
    constructor() {
        console.log('🔧 BalanceRepairTool 已建立');
    }

    /**
     * 檢查帳本餘額是否正確
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<Object>} - { isCorrect, expected, actual, diff }
     */
    async checkBalance(notebookId) {
        try {
            console.log('🔍 檢查帳本餘額:', notebookId);

            // 1. 取得帳本當前餘額
            const notebookRef = window.firebaseModules.doc(
                window.firebaseModules.getFirestore(window.firebaseModules.initializeApp.app),
                'notebooks',
                notebookId
            );
            const notebookDoc = await window.firebaseModules.getDoc(notebookRef);
            const actualBalance = notebookDoc.data().balance;

            if (!actualBalance) {
                console.warn('⚠️ 帳本無餘額資料');
                return { isCorrect: false, expected: null, actual: null };
            }

            // 2. 重新計算完整餘額
            const transactions = await window.FirebaseAPI.getTransactions(notebookId, 9999);
            const balanceManager = new window.BalanceManager();
            const expectedBalance = balanceManager.calculateFullBalance(transactions);

            // 3. 比較
            const diff = {
                baobao_owed: actualBalance.baobao_owed - expectedBalance.baobao_owed,
                bubu_owed: actualBalance.bubu_owed - expectedBalance.bubu_owed
            };

            const isCorrect = Math.abs(diff.baobao_owed) < 0.01 && Math.abs(diff.bubu_owed) < 0.01;

            console.log('📊 檢查結果:', { isCorrect, expected: expectedBalance, actual: actualBalance, diff });

            return { isCorrect, expected: expectedBalance, actual: actualBalance, diff };
        } catch (error) {
            console.error('❌ 檢查餘額失敗:', error);
            throw error;
        }
    }

    /**
     * 修復單個帳本餘額
     * @param {string} notebookId - 帳本 ID
     * @returns {Promise<boolean>} - 是否修復成功
     */
    async repairBalance(notebookId) {
        try {
            console.log('🔧 修復帳本餘額:', notebookId);

            // 1. 檢查
            const { isCorrect, expected } = await this.checkBalance(notebookId);

            if (isCorrect) {
                console.log('✅ 餘額正確，無需修復');
                return false;
            }

            // 2. 修復
            await window.FirebaseAPI.initializeNotebookBalance(notebookId, expected);

            console.log('✅ 餘額已修復');
            return true;
        } catch (error) {
            console.error('❌ 修復餘額失敗:', error);
            throw error;
        }
    }

    /**
     * 檢查並修復所有帳本
     * @returns {Promise<Object>} - { checked: 數量, repaired: 數量 }
     */
    async repairAllBalances() {
        try {
            console.log('🔧 檢查所有帳本餘額...');

            const notebooks = window.DataManager.getNotebooks();
            let checked = 0;
            let repaired = 0;

            for (const notebook of notebooks) {
                checked++;
                const wasRepaired = await this.repairBalance(notebook.id);
                if (wasRepaired) repaired++;
            }

            console.log(`✅ 檢查完成: ${checked} 個帳本, ${repaired} 個已修復`);
            return { checked, repaired };
        } catch (error) {
            console.error('❌ 修復所有帳本失敗:', error);
            throw error;
        }
    }
}

// 掛載到全域供 Console 使用
if (typeof window !== 'undefined') {
    window.BalanceRepairTool = BalanceRepairTool;
    window.balanceRepairTool = new BalanceRepairTool();
}

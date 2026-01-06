// 餘額管理器 - 處理餘額增量更新與計算
export class BalanceManager {
    constructor() {
        console.log('💰 BalanceManager 已建立');
    }

    /**
     * 計算單筆交易對餘額的影響（delta）
     * @param {Object} transaction - 交易資料
     * @returns {Object} { baobaoDelta, bubuDelta }
     */
    calculateTransactionDelta(transaction) {
        const amount = parseFloat(transaction.amount);
        const payer = transaction.payer;           // 'baobao' | 'bubu'
        const beneficiary = transaction.beneficiary; // 'baobao' | 'bubu' | 'both'

        let baobaoDelta = 0;
        let bubuDelta = 0;

        if (payer === 'baobao') {
            // 寶寶付的錢
            if (beneficiary === 'both') {
                baobaoDelta = amount / 2;  // 步步欠寶寶一半
            } else if (beneficiary === 'bubu') {
                baobaoDelta = amount;      // 步步欠寶寶全額
            }
            // else: 寶幫寶付 → 不影響欠款
        } else if (payer === 'bubu') {
            // 步步付的錢
            if (beneficiary === 'both') {
                bubuDelta = amount / 2;    // 寶寶欠步步一半
            } else if (beneficiary === 'baobao') {
                bubuDelta = amount;        // 寶寶欠步步全額
            }
            // else: 步幫步付 → 不影響欠款
        }

        return { baobaoDelta, bubuDelta };
    }

    /**
     * 從餘額資料計算結算狀態
     * @param {Object} balance - { baobao_owed, bubu_owed }
     * @returns {Object} { status, amount, debtor, creditor }
     */
    calculateBalanceStatus(balance) {
        if (!balance) {
            return { status: 'settled', amount: 0, debtor: null, creditor: null };
        }

        const baobaoName = '寶寶';
        const bubuName = '步步';

        // 計算淨欠款（寶寶被欠 - 步步被欠）
        const difference = balance.baobao_owed - balance.bubu_owed;

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
     * 計算完整餘額（從所有交易重算，用於初始化）
     * @param {Array} transactions - 交易列表
     * @returns {Object} { baobao_owed, bubu_owed }
     */
    calculateFullBalance(transactions) {
        let baobaoOwed = 0;
        let bubuOwed = 0;

        transactions.forEach(tx => {
            const { baobaoDelta, bubuDelta } = this.calculateTransactionDelta(tx);
            baobaoOwed += baobaoDelta;
            bubuOwed += bubuDelta;
        });

        return {
            baobao_owed: baobaoOwed,
            bubu_owed: bubuOwed,
            last_updated: new Date(),
            version: 1
        };
    }
}

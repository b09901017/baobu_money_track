// ==================== 結算事件偵測器 ====================
// 用於識別交易列表中的結算事件（未來支援）

export class SettlementDetector {
    /**
     * 檢查交易是否為結算類型
     * @param {Object} transaction - 交易物件
     * @returns {boolean}
     */
    static isSettlement(transaction) {
        // 🔮 未來支援：檢查交易類型是否為 'settlement'
        return transaction.type === 'settlement';
    }

    /**
     * 從交易列表中提取所有結算事件
     * @param {Array} transactions - 交易列表（按日期降序）
     * @returns {Array} - 結算日期列表 ['2025-03-10', '2024-12-31', ...]
     */
    static extractSettlementDates(transactions) {
        return transactions
            .filter(tx => this.isSettlement(tx))
            .map(tx => tx.date)
            .sort((a, b) => new Date(b) - new Date(a)); // 降序排列
    }

    /**
     * 判斷日期範圍內是否包含結算事件
     * @param {Array} settlements - 結算日期列表
     * @param {string} startDate - 開始日期 (YYYY-MM-DD)
     * @param {string} endDate - 結束日期 (YYYY-MM-DD)
     * @returns {Array} - 範圍內的結算日期
     */
    static getSettlementsInRange(settlements, startDate, endDate) {
        return settlements.filter(settlementDate =>
            settlementDate >= startDate && settlementDate <= endDate
        );
    }

    /**
     * 將交易列表按結算事件分割
     * @param {Array} transactions - 交易列表（按日期降序）
     * @param {Array} settlements - 結算日期列表
     * @returns {Array} - 分割後的區段 [{ transactions, settlementBefore }]
     */
    static splitBySettlements(transactions, settlements) {
        if (settlements.length === 0) {
            return [{ transactions, settlementBefore: null }];
        }

        const segments = [];
        let currentSegment = [];

        // 按日期降序遍歷
        for (const tx of transactions) {
            currentSegment.push(tx);

            // 如果當前交易是結算事件，切分
            if (this.isSettlement(tx)) {
                segments.push({
                    transactions: currentSegment.slice(0, -1), // 排除結算交易本身
                    settlementBefore: tx.date
                });
                currentSegment = []; // 開始新區段
            }
        }

        // 剩餘交易（最早的一段）
        if (currentSegment.length > 0) {
            segments.push({
                transactions: currentSegment,
                settlementBefore: null
            });
        }

        return segments;
    }
}

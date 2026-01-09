// ==================== 時間軸分組器 ====================
// 將扁平交易列表轉換為階層式結構（Year > Month > Week > Day）

import { SettlementDetector } from './SettlementDetector.js';

export class TimelineGrouper {
    /**
     * 將交易列表轉換為階層式結構
     * @param {Array} transactions - 交易列表（按 created_at 降序）
     * @returns {Array} - 階層式年份結構
     */
    static groupByHierarchy(transactions) {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        // 1. 提取所有結算日期
        const settlements = SettlementDetector.extractSettlementDates(transactions);

        // 2. 按年份分組
        const yearGroups = this.groupByYear(transactions);

        // 3. 為每個年份建立階層結構
        const hierarchy = yearGroups.map(yearGroup => {
            const year = yearGroup.year;
            const yearTransactions = yearGroup.transactions;

            // 檢查該年是否有結算事件
            const yearSettlements = SettlementDetector.getSettlementsInRange(
                settlements,
                `${year}-01-01`,
                `${year}-12-31`
            );

            // 按月份分組
            const monthGroups = this.groupByMonth(yearTransactions, yearSettlements);

            return {
                year,
                months: monthGroups,
                totalTransactions: yearTransactions.length,
                summary: this.calculateSummary(yearTransactions)
            };
        });

        return hierarchy;
    }

    /**
     * 按年份分組
     * @param {Array} transactions - 交易列表
     * @returns {Array} - [{ year, transactions }, ...]
     */
    static groupByYear(transactions) {
        const groups = {};

        transactions.forEach(tx => {
            const year = new Date(tx.date).getFullYear();
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(tx);
        });

        // 轉換為陣列並按年份降序排序
        return Object.keys(groups)
            .map(year => ({
                year: parseInt(year),
                transactions: groups[year]
            }))
            .sort((a, b) => b.year - a.year);
    }

    /**
     * 按月份分組（支援結算分割）
     * @param {Array} transactions - 該年的交易列表
     * @param {Array} settlements - 該年的結算日期
     * @returns {Array} - [{ month, weeks, settlementBefore }, ...]
     */
    static groupByMonth(transactions, settlements) {
        const groups = {};

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const month = date.getMonth() + 1; // 1-12
            if (!groups[month]) {
                groups[month] = [];
            }
            groups[month].push(tx);
        });

        // 轉換為陣列並處理結算分割
        const monthGroups = Object.keys(groups)
            .map(month => {
                const monthInt = parseInt(month);
                const monthTransactions = groups[month];

                // 計算該月的日期範圍
                const year = new Date(monthTransactions[0].date).getFullYear();
                const startDate = `${year}-${String(monthInt).padStart(2, '0')}-01`;
                const endDate = `${year}-${String(monthInt).padStart(2, '0')}-31`;

                // 檢查該月是否有結算事件
                const monthSettlements = SettlementDetector.getSettlementsInRange(
                    settlements,
                    startDate,
                    endDate
                );

                // 按結算分割
                const segments = SettlementDetector.splitBySettlements(
                    monthTransactions,
                    monthSettlements
                );

                // 為每個區段生成週分組
                return segments.map(segment => ({
                    month: monthInt,
                    year,
                    weeks: this.groupByWeek(segment.transactions, monthSettlements),
                    settlementBefore: segment.settlementBefore,
                    totalTransactions: segment.transactions.length,
                    summary: this.calculateSummary(segment.transactions)
                }));
            })
            .flat()
            .sort((a, b) => b.month - a.month);

        return monthGroups;
    }

    /**
     * 按週分組（支援結算分割）
     * @param {Array} transactions - 該月的交易列表
     * @param {Array} settlements - 該月的結算日期
     * @returns {Array} - [{ weekNumber, days, settlementBefore }, ...]
     */
    static groupByWeek(transactions, settlements) {
        const groups = {};

        transactions.forEach(tx => {
            const weekNumber = this.getWeekNumber(new Date(tx.date));
            if (!groups[weekNumber]) {
                groups[weekNumber] = [];
            }
            groups[weekNumber].push(tx);
        });

        // 轉換為陣列並處理結算分割
        const weekGroups = Object.keys(groups)
            .map(weekNum => {
                const weekNumber = parseInt(weekNum);
                const weekTransactions = groups[weekNum];

                // 找出該週的日期範圍
                const dates = weekTransactions.map(tx => tx.date).sort();
                const startDate = dates[0];
                const endDate = dates[dates.length - 1];

                // 檢查該週是否有結算事件
                const weekSettlements = SettlementDetector.getSettlementsInRange(
                    settlements,
                    startDate,
                    endDate
                );

                // 按結算分割
                const segments = SettlementDetector.splitBySettlements(
                    weekTransactions,
                    weekSettlements
                );

                // 為每個區段生成日分組
                return segments.map(segment => ({
                    weekNumber,
                    days: this.groupByDay(segment.transactions),
                    settlementBefore: segment.settlementBefore,
                    totalTransactions: segment.transactions.length,
                    summary: this.calculateSummary(segment.transactions)
                }));
            })
            .flat()
            .sort((a, b) => b.weekNumber - a.weekNumber);

        return weekGroups;
    }

    /**
     * 按日期分組
     * @param {Array} transactions - 該週的交易列表
     * @returns {Array} - [{ date, transactions, summary }, ...]
     */
    static groupByDay(transactions) {
        const groups = {};

        transactions.forEach(tx => {
            if (!groups[tx.date]) {
                groups[tx.date] = [];
            }
            groups[tx.date].push(tx);
        });

        // 轉換為陣列並按日期降序排序
        return Object.keys(groups)
            .map(date => ({
                date,
                transactions: groups[date].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                ),
                summary: this.calculateSummary(groups[date])
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * 計算統計摘要
     * @param {Array} transactions - 交易列表
     * @returns {Object} - { total, baobaoSpent, bubuSpent, debtInfo }
     */
    static calculateSummary(transactions) {
        let total = 0;
        let baobaoSpent = 0;
        let bubuSpent = 0;
        let baobaoOwed = 0;
        let bubuOwed = 0;

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            total += amount;

            // 計算付款
            if (tx.payer === 'baobao') {
                baobaoSpent += amount;
            } else if (tx.payer === 'bubu') {
                bubuSpent += amount;
            }

            // 計算欠款
            if (tx.payer === 'baobao') {
                if (tx.beneficiary === 'both') {
                    baobaoOwed += amount / 2;
                } else if (tx.beneficiary === 'bubu') {
                    baobaoOwed += amount;
                }
            } else if (tx.payer === 'bubu') {
                if (tx.beneficiary === 'both') {
                    bubuOwed += amount / 2;
                } else if (tx.beneficiary === 'baobao') {
                    bubuOwed += amount;
                }
            }
        });

        // 計算淨欠款
        const netBalance = baobaoOwed - bubuOwed;
        let debtInfo = null;

        if (Math.abs(netBalance) >= 0.01) {
            if (netBalance > 0) {
                debtInfo = {
                    debtor: '🐾 步',
                    creditor: '🎀 寶',
                    amount: Math.abs(netBalance)
                };
            } else {
                debtInfo = {
                    debtor: '🎀 寶',
                    creditor: '🐾 步',
                    amount: Math.abs(netBalance)
                };
            }
        }

        return {
            total,
            baobaoSpent,
            bubuSpent,
            count: transactions.length,
            debtInfo
        };
    }

    /**
     * 取得日期的週數（每月第幾週，從1開始）
     * 規則：每月1號到第一個週日為第1週
     * @param {Date} date - 日期物件
     * @returns {number} - 週數 (1-5)
     */
    static getWeekNumber(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // 找出本月第一天是星期幾 (0=週日, 6=週六)
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();

        // 計算到第一個週日的天數
        const daysToFirstSunday = (7 - firstDayOfWeek) % 7;
        const firstSunday = daysToFirstSunday === 0 ? 7 : daysToFirstSunday;

        // 如果在第一個週日之前（或等於），是第1週
        if (day <= firstSunday) {
            return 1;
        }

        // 否則，計算是第幾週（每7天一週）
        const weekNumber = Math.ceil((day - firstSunday) / 7) + 1;
        return weekNumber;
    }

    /**
     * 格式化月份名稱
     * @param {number} month - 月份 (1-12)
     * @returns {string} - 中文月份名稱
     */
    static getMonthName(month) {
        return `${month}月`;
    }

    /**
     * 格式化週標籤
     * @param {number} weekNumber - 週數
     * @returns {string} - 週標籤
     */
    static getWeekLabel(weekNumber) {
        return `第 ${weekNumber} 週`;
    }
}

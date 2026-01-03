// ==================== 日期工具函數 ====================
// 來源: app.js 行 1486-1499, 417-421

/**
 * 格式化顯示日期
 * @param {string} dateStr - 日期字串
 * @returns {string} - 格式化後的日期（今天/昨天/月/日）
 */
export function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return '今天';
    if (isYesterday) return '昨天';

    return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 檢查兩個日期是否為同一天
 * @param {Date} date1 - 第一個日期
 * @param {Date} date2 - 第二個日期
 * @returns {boolean} - 是否為同一天
 */
export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * 格式化日期為 YYYY-MM-DD
 * @param {Date} date - 日期物件
 * @returns {string} - 格式化後的日期字串
 */
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 取得今天的日期字串 (YYYY-MM-DD)
 * @returns {string} - 今天的日期
 */
export function getToday() {
    return formatDate(new Date());
}

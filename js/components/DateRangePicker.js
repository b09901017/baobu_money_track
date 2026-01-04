// ==================== 日期區間選擇器組件 ====================
// 來源: app.js 行 436-681 (247行)
// 負責日期範圍選擇功能（支援首頁時間軸和分析頁面）

import { formatDate } from '../utils/dateUtils.js';

export class DateRangePicker {
    constructor(state, onApplyCallback, onAnalyticsApplyCallback) {
        this.state = state;
        this.onApplyCallback = onApplyCallback;  // 首頁時間軸回調
        this.onAnalyticsApplyCallback = onAnalyticsApplyCallback;  // 分析頁面回調

        this.modal = document.getElementById('dateRangeModal');
        this.rangeCalendarGrid = document.getElementById('rangeCalendarGrid');
        this.rangeCalendarMonth = document.getElementById('rangeCalendarMonth');
    }

    /**
     * 開啟日期區間選擇器（首頁）
     */
    openModal() {
        // 重置選擇狀態
        this.state.tempRangeStart = null;
        this.state.tempRangeEnd = null;
        this.state.isSelectingEnd = false;
        this.state.rangeCalendarMonth = new Date();

        // 更新顯示
        this.updateRangeDisplays();
        this.renderCalendar();

        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }

    /**
     * 開啟日期區間選擇器（分析頁面）
     */
    openModalForAnalytics(customBtn) {
        this.state.isAnalyticsDateSelection = true;
        this.state.analyticsCustomBtn = customBtn;

        // 重置選擇狀態
        this.state.tempRangeStart = null;
        this.state.tempRangeEnd = null;
        this.state.isSelectingEnd = false;
        this.state.rangeCalendarMonth = new Date();

        // 更新顯示
        this.updateRangeDisplays();
        this.renderCalendar();

        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }

    /**
     * 關閉日期區間選擇器
     */
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
        this.state.isAnalyticsDateSelection = false;
    }

    /**
     * 設定快速範圍
     * @param {string|number} days - 天數或 'all'
     */
    async setQuickRange(days) {
        if (days === 'all') {
            // 全部：選擇所有交易
            const transactions = window.DataManager.getTransactions();
            if (transactions.length === 0) {
                await window.customDialog.info('目前沒有任何交易記錄');
                return;
            }

            // 找到最早和最晚的交易日期
            const dates = transactions.map(tx => new Date(tx.date));
            const start = new Date(Math.min(...dates));
            const end = new Date(Math.max(...dates));

            this.state.tempRangeStart = start;
            this.state.tempRangeEnd = end;
        } else {
            // 指定天數
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - parseInt(days) + 1);

            this.state.tempRangeStart = start;
            this.state.tempRangeEnd = end;
        }

        document.getElementById('rangeStartDate').value = window.DataManager.formatDate(this.state.tempRangeStart);
        document.getElementById('rangeEndDate').value = window.DataManager.formatDate(this.state.tempRangeEnd);

        this.updateRangeDisplays();
        this.renderCalendar();
    }

    /**
     * 切換日曆月份
     * @param {number} offset - 月份偏移量
     */
    changeMonth(offset) {
        this.state.rangeCalendarMonth = new Date(
            this.state.rangeCalendarMonth.getFullYear(),
            this.state.rangeCalendarMonth.getMonth() + offset,
            1
        );
        this.renderCalendar();
    }

    /**
     * 渲染日曆
     */
    renderCalendar() {
        const year = this.state.rangeCalendarMonth.getFullYear();
        const month = this.state.rangeCalendarMonth.getMonth();

        // 更新月份標題
        if (this.rangeCalendarMonth) {
            this.rangeCalendarMonth.textContent = `${year}年${month + 1}月`;
        }

        if (!this.rangeCalendarGrid) return;

        this.rangeCalendarGrid.innerHTML = '';

        // 取得該月第一天和最後一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 取得第一天是星期幾（0 = 星期日）
        const firstDayOfWeek = firstDay.getDay();

        // 填充前面的空白
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'aspect-square';
            this.rangeCalendarGrid.appendChild(emptyCell);
        }

        // 填充日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = window.DataManager.formatDate(date);

            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-hand font-bold transition-all hover:bg-macaron-pink/20';

            // 檢查是否在選擇範圍內
            let isInRange = false;
            let isStart = false;
            let isEnd = false;

            if (this.state.tempRangeStart && this.state.tempRangeEnd) {
                const startTime = this.state.tempRangeStart.getTime();
                const endTime = this.state.tempRangeEnd.getTime();
                const currentTime = date.getTime();

                isStart = dateStr === window.DataManager.formatDate(this.state.tempRangeStart);
                isEnd = dateStr === window.DataManager.formatDate(this.state.tempRangeEnd);
                isInRange = currentTime >= startTime && currentTime <= endTime;
            } else if (this.state.tempRangeStart) {
                isStart = dateStr === window.DataManager.formatDate(this.state.tempRangeStart);
            }

            // 應用樣式
            if (isStart || isEnd) {
                cell.className += ' bg-gradient-to-br from-[#FF9EAA] to-[#FFB7B2] text-white shadow-watercolor-layered';
            } else if (isInRange) {
                cell.className += ' bg-macaron-pink/30 text-soft-ink';
            } else {
                cell.className += ' text-warm-brown hover:text-soft-ink';
            }

            // 日期文字
            const dayText = document.createElement('div');
            dayText.textContent = day;
            cell.appendChild(dayText);

            // 點擊事件
            cell.addEventListener('click', () => {
                this.selectDate(date);
            });

            this.rangeCalendarGrid.appendChild(cell);
        }
    }

    /**
     * 選擇日期
     * @param {Date} date - 選擇的日期
     */
    selectDate(date) {
        if (!this.state.tempRangeStart || (this.state.tempRangeStart && this.state.tempRangeEnd)) {
            // 第一次點擊或重新開始選擇
            this.state.tempRangeStart = date;
            this.state.tempRangeEnd = null;
            this.state.isSelectingEnd = true;
        } else {
            // 第二次點擊，選擇結束日期
            if (date < this.state.tempRangeStart) {
                // 如果選擇的日期早於開始日期，交換它們
                this.state.tempRangeEnd = this.state.tempRangeStart;
                this.state.tempRangeStart = date;
            } else {
                this.state.tempRangeEnd = date;
            }
            this.state.isSelectingEnd = false;
        }

        // 更新隱藏的輸入值
        document.getElementById('rangeStartDate').value = window.DataManager.formatDate(this.state.tempRangeStart);
        if (this.state.tempRangeEnd) {
            document.getElementById('rangeEndDate').value = window.DataManager.formatDate(this.state.tempRangeEnd);
        }

        this.updateRangeDisplays();
        this.renderCalendar();
    }

    /**
     * 更新範圍顯示
     */
    updateRangeDisplays() {
        const startDisplay = document.getElementById('selectedStartDisplay');
        const endDisplay = document.getElementById('selectedEndDisplay');

        if (this.state.tempRangeStart) {
            const start = this.state.tempRangeStart;
            startDisplay.textContent = `${start.getMonth() + 1}/${start.getDate()}`;
        } else {
            startDisplay.textContent = '未選擇';
        }

        if (this.state.tempRangeEnd) {
            const end = this.state.tempRangeEnd;
            endDisplay.textContent = `${end.getMonth() + 1}/${end.getDate()}`;
        } else {
            endDisplay.textContent = '未選擇';
        }
    }

    /**
     * 套用日期範圍
     */
    async applyRange() {
        const startStr = document.getElementById('rangeStartDate').value;
        const endStr = document.getElementById('rangeEndDate').value;

        if (!startStr || !endStr) {
            await window.customDialog.info('請選擇開始和結束日期');
            return;
        }

        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');

        if (start > end) {
            await window.customDialog.error('開始日期不能晚於結束日期');
            return;
        }

        // 檢查是否為分析頁面的日期選擇
        if (this.state.isAnalyticsDateSelection) {
            this.applyForAnalytics(start, end);
        } else {
            this.applyForTimeline(start, end);
        }
    }

    /**
     * 套用到首頁時間軸
     * @param {Date} start - 開始日期
     * @param {Date} end - 結束日期
     */
    applyForTimeline(start, end) {
        this.state.isRangeMode = true;
        this.state.rangeStart = start;
        this.state.rangeEnd = end;
        this.closeModal();

        if (this.onApplyCallback) {
            this.onApplyCallback();
        }
    }

    /**
     * 套用到分析頁面
     * @param {Date} start - 開始日期
     * @param {Date} end - 結束日期
     */
    applyForAnalytics(start, end) {
        this.state.analyticsStartDate = start;
        this.state.analyticsEndDate = end;

        // 更新按鈕樣式
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            b.classList.add('text-soft-ink');
        });

        if (this.state.analyticsCustomBtn) {
            this.state.analyticsCustomBtn.classList.add('bg-gradient-to-br', 'from-macaron-pink', 'to-[#E8A87C]', 'text-white');
            this.state.analyticsCustomBtn.classList.remove('text-soft-ink');
        }

        this.state.currentPeriod = 'custom';
        this.state.isAnalyticsDateSelection = false;
        this.closeModal();

        if (this.onAnalyticsApplyCallback) {
            this.onAnalyticsApplyCallback('custom');
        }
    }
}

// ==================== 事件綁定器 ====================
// 來源: app.js 行 46-203
// 負責綁定所有 UI 事件

export class EventBinder {
    constructor(app) {
        this.app = app;
    }

    bindAll() {
        this.bindNavigation();
        this.bindViewToggle();
        this.bindFAB();
        this.bindBottomSheet();
        this.bindCategories();
        this.bindPhotoUpload();
        this.bindForm();
        this.bindCalendar();
        this.bindTimeline();
        this.bindDateRange();
        this.bindAnalytics();
        this.bindDetailModal();
    }

    bindNavigation() {
        // 底部導航切換
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page && this.app.router) {
                    this.app.router.switchPage(page);
                }
            });
        });
    }

    bindViewToggle() {
        // 視圖切換（列表/日曆）
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (this.app.router) {
                    this.app.router.switchView(view);
                }
            });
        });
    }

    bindFAB() {
        // 浮動新增按鈕
        const fabAdd = document.getElementById('fabAdd');
        if (fabAdd) {
            fabAdd.addEventListener('click', () => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.open();
                }
            });
        }
    }

    bindBottomSheet() {
        // 關閉 Bottom Sheet
        const btnCloseSheet = document.getElementById('btnCloseSheet');
        if (btnCloseSheet) {
            btnCloseSheet.addEventListener('click', () => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.close();
                }
            });
        }

        const overlay = document.querySelector('.bottom-sheet-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.close();
                }
            });
        }
    }

    bindCategories() {
        // 分類標籤複選
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.currentTarget.dataset.category;
                if (category && this.app.transactionForm) {
                    this.app.transactionForm.toggleCategory(category, e.currentTarget);
                }
            });
        });

        // 新增自訂標籤
        const btnAddCustomCategory = document.getElementById('btnAddCustomCategory');
        if (btnAddCustomCategory) {
            btnAddCustomCategory.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.app.transactionForm) {
                    this.app.transactionForm.addCustomCategory();
                }
            });
        }
    }

    bindPhotoUpload() {
        // 照片上傳
        const btnUploadPhoto = document.getElementById('btnUploadPhoto');
        const photoInput = document.getElementById('photoInput');

        if (btnUploadPhoto) {
            btnUploadPhoto.addEventListener('click', () => {
                if (photoInput) photoInput.click();
            });
        }

        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.handlePhotoUpload(e.target.files);
                }
            });
        }
    }

    bindForm() {
        // 表單提交
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.app.transactionForm) {
                    this.app.transactionForm.submit();
                }
            });
        }
    }

    bindCalendar() {
        // 日曆導航
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');

        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                if (this.app.calendarPage) {
                    this.app.calendarPage.changeMonth(-1);
                }
            });
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                if (this.app.calendarPage) {
                    this.app.calendarPage.changeMonth(1);
                }
            });
        }
    }

    bindTimeline() {
        // 時間軸日期切換
        const prevDayBtn = document.getElementById('prevDayBtn');
        const nextDayBtn = document.getElementById('nextDayBtn');
        const btnToday = document.getElementById('btnToday');
        const btnPickDate = document.getElementById('btnPickDate');
        const datePickerInput = document.getElementById('datePickerInput');
        const btnAddFromEmpty = document.getElementById('btnAddFromEmpty');

        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                if (this.app.timelineView) {
                    this.app.timelineView.changeDay(-1);
                }
            });
        }

        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                if (this.app.timelineView) {
                    this.app.timelineView.changeDay(1);
                }
            });
        }

        if (btnToday) {
            btnToday.addEventListener('click', () => {
                if (this.app.timelineView) {
                    this.app.timelineView.goToToday();
                }
            });
        }

        if (btnPickDate && datePickerInput) {
            btnPickDate.addEventListener('click', () => {
                datePickerInput.value = window.DataManager.formatDate(this.app.state.currentDayView);
                datePickerInput.showPicker ? datePickerInput.showPicker() : datePickerInput.click();
            });

            datePickerInput.addEventListener('change', (e) => {
                if (e.target.value) {
                    const selectedDate = new Date(e.target.value + 'T00:00:00');
                    this.app.state.currentDayView = selectedDate;
                    this.app.state.isRangeMode = false;
                    if (this.app.timelineView) {
                        this.app.timelineView.update();
                    }
                }
            });
        }

        if (btnAddFromEmpty) {
            btnAddFromEmpty.addEventListener('click', () => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.open();
                }
            });
        }
    }

    bindDateRange() {
        // 日期區間選擇
        const btnDateRange = document.getElementById('btnDateRange');
        const btnCloseDateRange = document.getElementById('btnCloseDateRange');
        const dateRangeOverlay = document.getElementById('dateRangeOverlay');
        const btnCancelRange = document.getElementById('btnCancelRange');
        const btnApplyRange = document.getElementById('btnApplyRange');

        if (btnDateRange) {
            btnDateRange.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.openModal();
                }
            });
        }

        if (btnCloseDateRange) {
            btnCloseDateRange.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.closeModal();
                }
            });
        }

        if (dateRangeOverlay) {
            dateRangeOverlay.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.closeModal();
                }
            });
        }

        if (btnCancelRange) {
            btnCancelRange.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.closeModal();
                }
            });
        }

        if (btnApplyRange) {
            btnApplyRange.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.applyRange();
                }
            });
        }

        // 快速範圍按鈕
        document.querySelectorAll('.quick-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = e.currentTarget.dataset.days;
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.setQuickRange(days);
                }
            });
        });

        // 日期區間日曆導航
        const prevRangeMonth = document.getElementById('prevRangeMonth');
        const nextRangeMonth = document.getElementById('nextRangeMonth');

        if (prevRangeMonth) {
            prevRangeMonth.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.changeMonth(-1);
                }
            });
        }

        if (nextRangeMonth) {
            nextRangeMonth.addEventListener('click', () => {
                if (this.app.dateRangePicker) {
                    this.app.dateRangePicker.changeMonth(1);
                }
            });
        }
    }

    bindAnalytics() {
        // 分析頁日期篩選
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.currentTarget.dataset.period;
                if (period === 'custom') {
                    // 開啟日期選擇器
                    if (this.app.dateRangePicker) {
                        this.app.dateRangePicker.openModalForAnalytics(e.currentTarget);
                    }
                } else {
                    if (this.app.analyticsPage) {
                        this.app.analyticsPage.changeDateFilter(period, e.currentTarget);
                    }
                }
            });
        });
    }

    bindDetailModal() {
        // 關閉詳情模態框
        const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');
        const detailModalOverlay = document.getElementById('detailModalOverlay');

        if (btnCloseDetailModal) {
            btnCloseDetailModal.addEventListener('click', () => {
                if (this.app.transactionDetail) {
                    this.app.transactionDetail.close();
                }
            });
        }

        if (detailModalOverlay) {
            detailModalOverlay.addEventListener('click', () => {
                if (this.app.transactionDetail) {
                    this.app.transactionDetail.close();
                }
            });
        }
    }
}

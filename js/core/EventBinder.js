// ==================== 事件綁定器 ====================
// 來源: app.js 行 46-203
// 負責綁定所有 UI 事件

export class EventBinder {
    constructor(app) {
        this.app = app;
    }

    bindAll() {
        console.log('🔗 開始綁定所有事件...');
        this.bindNavigation();
        this.bindViewToggle();
        console.log('🔗 準備綁定 FAB...');
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
        console.log('🔗 所有事件綁定完成');
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
        console.log('🔍 bindFAB() 被呼叫');
        // 浮動新增按鈕
        const fabAdd = document.getElementById('fabAdd');
        console.log('🔍 fabAdd 元素:', fabAdd);

        if (fabAdd) {
            console.log('✅ FAB 按鈕已找到，正在綁定事件...');
            fabAdd.addEventListener('click', () => {
                console.log('🎯 FAB 按鈕被點擊');
                console.log('🔍 this.app:', this.app);
                console.log('🔍 this.app.transactionForm:', this.app.transactionForm);

                if (this.app.transactionForm) {
                    console.log('📝 開啟交易表單...');
                    this.app.transactionForm.open();
                } else {
                    console.error('❌ transactionForm 不存在');
                }
            });
            console.log('✅ FAB 按鈕事件已綁定');
        } else {
            console.error('❌ 找不到 FAB 按鈕 #fabAdd');
            console.error('🔍 當前 DOM 載入狀態:', document.readyState);
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
            console.log('✅ 表單事件已綁定');
            form.addEventListener('submit', (e) => {
                console.log('📋 表單提交事件觸發');
                e.preventDefault();
                if (this.app.transactionForm) {
                    this.app.transactionForm.submit();
                } else {
                    console.error('❌ transactionForm 不存在');
                }
            });
        } else {
            console.error('❌ 找不到表單元素 #transactionForm');
        }
    }

    bindCalendar() {
        // 日曆導航 - 月份切換
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

        // 模式切換按鈕
        const btnCalendarSingleMode = document.getElementById('btnCalendarSingleMode');
        const btnCalendarRangeMode = document.getElementById('btnCalendarRangeMode');

        if (btnCalendarSingleMode) {
            btnCalendarSingleMode.addEventListener('click', () => {
                if (this.app.calendarPage) {
                    this.app.calendarPage.toggleMode('single');
                    // 顯示/隱藏提示和導航
                    this.toggleCalendarModeUI('single');
                }
            });
        }

        if (btnCalendarRangeMode) {
            btnCalendarRangeMode.addEventListener('click', () => {
                if (this.app.calendarPage) {
                    this.app.calendarPage.toggleMode('range');
                    // 顯示/隱藏提示和導航
                    this.toggleCalendarModeUI('range');
                }
            });
        }

        // 單日模式：使用滑動手勢，不需要按鈕綁定
    }

    /**
     * 切換日曆模式的 UI 顯示
     */
    toggleCalendarModeUI(mode) {
        const singleModeHint = document.getElementById('singleModeHint');
        const rangeModeHint = document.getElementById('rangeModeHint');
        const singleDayNav = document.getElementById('singleDayNav');

        if (mode === 'single') {
            if (singleModeHint) singleModeHint.classList.remove('hidden');
            if (rangeModeHint) rangeModeHint.classList.add('hidden');
            if (singleDayNav) singleDayNav.classList.remove('hidden');
        } else {
            if (singleModeHint) singleModeHint.classList.add('hidden');
            if (rangeModeHint) rangeModeHint.classList.remove('hidden');
            if (singleDayNav) singleDayNav.classList.add('hidden');
        }
    }

    bindTimeline() {
        // 從空狀態新增按鈕
        const btnAddFromEmpty = document.getElementById('btnAddFromEmpty');
        if (btnAddFromEmpty) {
            btnAddFromEmpty.addEventListener('click', () => {
                if (this.app.transactionForm) {
                    this.app.transactionForm.open();
                }
            });
        }

        // 載入更多按鈕
        const btnLoadMore = document.getElementById('btnLoadMore');
        if (btnLoadMore) {
            btnLoadMore.addEventListener('click', async () => {
                if (this.app.timelineView) {
                    await this.app.timelineView.loadMore();
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

        // 分類視圖切換（長條圖/圓餅圖）
        const btnCategoryBarView = document.getElementById('btnCategoryBarView');
        const btnCategoryPieView = document.getElementById('btnCategoryPieView');

        if (btnCategoryBarView) {
            btnCategoryBarView.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.toggleCategoryView('bar');
                }
            });
        }

        if (btnCategoryPieView) {
            btnCategoryPieView.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.toggleCategoryView('pie');
                }
            });
        }

        // 統計模式切換（總花費/寶寶/步步）
        document.querySelectorAll('.stat-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                if (mode && this.app.analyticsPage) {
                    this.app.analyticsPage.toggleStatMode(mode);
                }
            });
        });

        // 付款人篩選（寶寶/步步）- 現在改為切換統計模式
        document.querySelectorAll('.stat-card-payer').forEach(card => {
            card.addEventListener('click', (e) => {
                const payer = e.currentTarget.dataset.payer;
                if (payer && this.app.analyticsPage) {
                    this.app.analyticsPage.filterByPayer(payer);
                }
            });
        });

        // 清除篩選
        const btnClearFilter = document.getElementById('btnClearFilter');
        if (btnClearFilter) {
            btnClearFilter.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.clearFilter();
                }
            });
        }

        // ========== 趨勢分析（v5.9.0 新增）==========

        // Tab 切換（統計 / 趨勢）
        const btnStatsTab = document.getElementById('btnStatsTab');
        const btnTrendTab = document.getElementById('btnTrendTab');

        if (btnStatsTab) {
            btnStatsTab.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.switchTab('stats');
                }
            });
        }

        if (btnTrendTab) {
            btnTrendTab.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.switchTab('trend');
                }
            });
        }

        // 日期範圍選擇
        document.querySelectorAll('.trend-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const range = e.currentTarget.dataset.range;
                if (range === 'custom') {
                    // 開啟日期選擇器
                    if (this.app.dateRangePicker) {
                        this.app.dateRangePicker.openModalForTrend(e.currentTarget);
                    }
                } else if (range && this.app.analyticsPage) {
                    this.app.analyticsPage.changeTrendRange(range);
                }
            });
        });

        // 時間粒度選擇
        document.querySelectorAll('.trend-granularity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const granularity = e.currentTarget.dataset.granularity;
                if (granularity && this.app.analyticsPage) {
                    this.app.analyticsPage.changeTrendGranularity(granularity);
                }
            });
        });

        // 類別篩選
        document.querySelectorAll('.trend-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                if (category && this.app.analyticsPage) {
                    this.app.analyticsPage.changeTrendCategory(category);
                }
            });
        });

        // 圖表類型切換（折線圖 / 長條圖）
        const btnTrendLineView = document.getElementById('btnTrendLineView');
        const btnTrendBarView = document.getElementById('btnTrendBarView');

        if (btnTrendLineView) {
            btnTrendLineView.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.switchTrendChartType('line');
                }
            });
        }

        if (btnTrendBarView) {
            btnTrendBarView.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.switchTrendChartType('bar');
                }
            });
        }

        // 最高值卡片點擊顯示詳情
        const trendMaxCard = document.getElementById('trendMaxCard');
        if (trendMaxCard) {
            trendMaxCard.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.showMaxDetail();
                }
            });
        }

        // 圖表放大檢視按鈕（v5.9.0 新增）
        const btnExpandLineChart = document.getElementById('btnExpandLineChart');
        const btnExpandBarChart = document.getElementById('btnExpandBarChart');
        const btnCloseChartFullscreen = document.getElementById('btnCloseChartFullscreen');

        if (btnExpandLineChart) {
            btnExpandLineChart.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.expandChart('line');
                }
            });
        }

        if (btnExpandBarChart) {
            btnExpandBarChart.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.expandChart('bar');
                }
            });
        }

        if (btnCloseChartFullscreen) {
            btnCloseChartFullscreen.addEventListener('click', () => {
                if (this.app.analyticsPage) {
                    this.app.analyticsPage.closeChartFullscreen();
                }
            });
        }
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

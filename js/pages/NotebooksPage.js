// ==================== 帳本頁面控制器 ====================
// 來源: app.js 行 973-1105

export class NotebooksPage {
    constructor(state, onSwitchCallback) {
        this.state = state;
        this.onSwitchCallback = onSwitchCallback;  // 切換帳本後的回調
        this.sortableInstance = null;  // SortableJS 實例

        // 訂閱帳本列表變更事件
        if (this.state) {
            this.state.subscribe('notebooks', (notebooks) => this.handleNotebooksUpdate(notebooks));
            // 訂閱交易變更事件（用於更新帳本封面統計）
            this.state.subscribe('transactions', (data) => {
                console.log('📚 NotebooksPage 收到交易更新，重新渲染帳本統計');
                // 重新渲染帳本列表（更新封面統計）
                const notebooks = window.DataManager.getNotebooks();
                this.renderNotebooks(notebooks);
            });
        }
    }

    /**
     * 處理帳本列表變更訂閱
     * @param {Array} notebooks - 帳本列表
     */
    handleNotebooksUpdate(notebooks) {
        this.renderNotebooks(notebooks);
    }

    /**
     * 更新帳本列表（保留以維持相容性）
     * 注意：現在透過即時監聽自動更新，無需手動呼叫 update()
     */
    update() {
        // 透過 onSnapshot 即時監聽，帳本列表變更會自動推送
        // 此方法保留以維持相容性，但實際上不執行任何操作
    }

    /**
     * 渲染帳本列表
     * @param {Array} notebooks - 帳本列表
     */
    renderNotebooks(notebooks) {
        const container = document.getElementById('notebooksList');
        if (!container) return;

        const currentNotebookId = window.DataManager.currentNotebook;

        const bookColors = [
            { spine: 'from-[#8caec4] to-[#AEC6CF]', ribbon: 'bg-rose-400', gradient: 'from-macaron-blue/30 to-transparent' },
            { spine: 'from-[#d6a578] to-[#E8C4A3]', ribbon: 'bg-yellow-400/90', gradient: 'from-macaron-pink/30 to-transparent' },
            { spine: 'from-[#c4a6b2] to-[#E2C2C6]', ribbon: 'bg-macaron-green', gradient: 'from-macaron-purple/30 to-transparent' },
            { spine: 'from-[#a8c5b0] to-[#C8E6C9]', ribbon: 'bg-macaron-pink', gradient: 'from-macaron-green/30 to-transparent' },
        ];

        const booksHTML = notebooks.map((nb, index) => {
            const colorScheme = bookColors[index % bookColors.length];
            const isActive = nb.id === currentNotebookId;

            // 取得帳本類型（預設為 'daily'）
            const notebookType = nb.type || 'daily';

            // 從帳本的 stats 欄位取得統計資料
            const stats = nb.stats || {
                baobao_paid: 0,
                bubu_paid: 0,
                total_expense: 0,
                transaction_count: 0
            };

            // 從帳本的 balance 欄位取得餘額資料
            const balance = nb.balance || {
                baobao_owed: 0,
                bubu_owed: 0
            };

            // 計算欠款狀態（誰欠誰多少）
            const difference = balance.baobao_owed - balance.bubu_owed;
            let balanceText = '';
            if (Math.abs(difference) < 0.01) {
                balanceText = '已結清 💖';
            } else if (difference > 0) {
                // 寶寶被欠得多 → 步步欠寶寶
                balanceText = `步步欠寶寶 $${Math.round(Math.abs(difference))}`;
            } else {
                // 步步被欠得多 → 寶寶欠步步
                balanceText = `寶寶欠步步 $${Math.round(Math.abs(difference))}`;
            }

            // 根據帳本類型決定顯示內容
            let statsHTML = '';
            if (notebookType === 'daily') {
                // 日常帳本：固定顯示欠款資訊
                statsHTML = `<div class="text-xs text-warm-brown/80">${balanceText}</div>`;
            } else {
                // 旅遊/時期性帳本：顯示總花費和各自支出
                statsHTML = `
                    <div class="space-y-0.5 text-xs text-warm-brown/80">
                        ${stats.baobao_paid > 0 ? `<div>寶 $${Math.round(stats.baobao_paid)}</div>` : ''}
                        ${stats.bubu_paid > 0 ? `<div>步 $${Math.round(stats.bubu_paid)}</div>` : ''}
                        ${stats.total_expense > 0 ? `<div class="text-[#E27D60] font-bold">共 $${Math.round(stats.total_expense)}</div>` : ''}
                    </div>`;
            }

            return `
                <div class="group relative cursor-pointer" data-notebook-id="${nb.id}">
                    <div class="relative w-full aspect-[3/4] rounded-r-xl rounded-l-md shadow-book bg-white transition-all duration-300 transform ${isActive ? '-translate-y-2 scale-105 shadow-floating ring-2 ring-antique-gold' : 'hover:-translate-y-2 hover:rotate-1'} overflow-visible">
                        <div class="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r ${colorScheme.spine} rounded-l-md z-20 shadow-md"></div>
                        <div class="absolute inset-0 left-2 bg-gradient-to-br ${colorScheme.gradient} rounded-r-xl overflow-hidden flex flex-col justify-end p-4">
                            <div class="absolute inset-0 book-texture opacity-20"></div>
                            <div class="relative z-10">
                                <h3 class="text-soft-ink text-xl font-hand font-bold leading-tight mb-2">${nb.name}</h3>
                                ${statsHTML}
                            </div>
                        </div>
                        <div class="absolute -top-1 right-6 w-6 h-12 ${colorScheme.ribbon} shadow-md z-30 flex justify-center">
                            <div class="absolute bottom-[-8px] w-full h-4 ${colorScheme.ribbon}" style="clip-path: polygon(0 0, 50% 100%, 100% 0);"></div>
                        </div>
                    </div>
                    <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/10 rounded-[100%] blur-sm pointer-events-none group-hover:w-3/4 group-hover:mx-auto transition-all"></div>
                </div>`;
        }).join('');

        const addBookHTML = `
            <div class="group relative cursor-pointer" id="btnAddNotebook">
                <div class="relative w-full aspect-[3/4] rounded-xl border-[3px] border-dashed border-macaron-rose/50 bg-white/20 shadow-watercolor-layered flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-white/40 hover:border-macaron-rose hover:-translate-y-1 backdrop-blur-sm overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-warm-brown/5 via-transparent to-warm-brown/5 opacity-50"></div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="absolute top-6 left-6 text-antique-gold/40 text-[12px] group-hover:animate-ping">✦</span>
                        <span class="absolute bottom-10 right-8 text-antique-gold/40 text-[16px] group-hover:animate-bounce" style="animation-delay: 0.5s;">✧</span>
                        <span class="absolute top-1/2 right-4 text-antique-gold/40 text-[10px] group-hover:animate-pulse" style="animation-delay: 1s;">✦</span>
                    </div>
                    <div class="w-16 h-16 rounded-full bg-white text-macaron-rose flex items-center justify-center mb-1 group-hover:scale-110 transition-all duration-300 shadow-sm border border-macaron-rose/30">
                        <span class="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <div class="px-2">
                        <h3 class="text-warm-brown font-hand font-bold text-lg leading-tight group-hover:text-soft-ink transition-colors">新故事</h3>
                        <p class="text-[10px] uppercase tracking-wider text-warm-brown/60 mt-1">New Chapter</p>
                    </div>
                </div>
                <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/5 rounded-[100%] blur-sm pointer-events-none"></div>
            </div>`;

        container.innerHTML = booksHTML + addBookHTML;

        // 綁定事件
        container.querySelectorAll('[data-notebook-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchNotebook(e.currentTarget.dataset.notebookId);
            });
        });

        const addBtn = document.getElementById('btnAddNotebook');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNewNotebook());
        }

        // 初始化拖曳排序功能
        this.initSortable(container);
    }

    /**
     * 初始化 SortableJS 拖曳排序
     * @param {HTMLElement} container - 帳本列表容器
     */
    initSortable(container) {
        // 銷毀舊的實例
        if (this.sortableInstance) {
            this.sortableInstance.destroy();
        }

        // 檢查 Sortable 是否可用
        if (typeof Sortable === 'undefined') {
            console.warn('⚠️ SortableJS 未載入，無法啟用拖曳排序');
            return;
        }

        // 建立 SortableJS 實例
        this.sortableInstance = new Sortable(container, {
            animation: 200,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // 果凍彈跳效果
            delay: 200,
            delayOnTouchOnly: true,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '#btnAddNotebook',  // 排除新增按鈕
            preventOnFilter: true,
            onStart: (evt) => this.handleSortStart(evt),
            onMove: (evt) => this.handleSortMove(evt),
            onEnd: (evt) => this.handleSortEnd(evt)
        });

        console.log('✅ 拖曳排序已啟用');
    }

    /**
     * 處理拖曳開始事件
     * @param {Event} evt - SortableJS 事件
     */
    handleSortStart(evt) {
        console.log('🎯 開始拖曳');

        // 震動回饋（重擊感）
        this.vibrate('medium');
    }

    /**
     * 處理拖曳移動事件
     * @param {Event} evt - SortableJS 事件
     */
    handleSortMove(evt) {
        // 輕微震動回饋（位置改變時）
        this.vibrate('light');
    }

    /**
     * 震動回饋封裝
     * @param {string} type - 震動類型：'light', 'medium', 'heavy', 'success'
     */
    vibrate(type = 'light') {
        // 檢查是否為 Capacitor 環境
        if (!window.Capacitor || !window.Capacitor.Plugins.Haptics) {
            // 瀏覽器環境使用 Vibration API
            if (navigator.vibrate) {
                const patterns = {
                    light: 10,
                    medium: 20,
                    heavy: 50,
                    success: [10, 50, 10]
                };
                navigator.vibrate(patterns[type] || 10);
            }
            return;
        }

        // Capacitor Haptics API
        const Haptics = window.Capacitor.Plugins.Haptics;
        const styles = {
            light: 'LIGHT',
            medium: 'MEDIUM',
            heavy: 'HEAVY',
            success: 'MEDIUM'
        };

        if (type === 'success') {
            // 成功回饋：兩次中等震動
            Haptics.impact({ style: 'MEDIUM' });
            setTimeout(() => Haptics.impact({ style: 'MEDIUM' }), 100);
        } else {
            Haptics.impact({ style: styles[type] || 'LIGHT' });
        }
    }

    /**
     * 處理拖曳結束事件
     * @param {Event} evt - SortableJS 事件
     */
    async handleSortEnd(evt) {
        try {
            // 成功放置震動回饋
            this.vibrate('success');

            // 取得所有帳本項目的 ID（按新順序）
            const items = evt.to.querySelectorAll('[data-notebook-id]');
            const newOrderedIds = Array.from(items).map(item => item.dataset.notebookId);

            console.log('📋 新順序:', newOrderedIds);

            // 呼叫 DataManager 更新順序
            await window.DataManager.reorderNotebooks(newOrderedIds);

            console.log('✅ 帳本順序已儲存');
        } catch (error) {
            console.error('❌ 儲存排序失敗:', error);
            await window.customDialog.error('儲存排序失敗：' + error.message);
        }
    }

    async switchNotebook(notebookId) {
        try {
            const notebook = await window.DataManager.switchNotebook(notebookId);
            if (notebook && this.onSwitchCallback) {
                this.onSwitchCallback();
            }
        } catch (error) {
            console.error('❌ 切換帳本失敗:', error);
            await window.customDialog.error('切換帳本失敗：' + error.message);
        }
    }

    async addNewNotebook() {
        const name = await window.customDialog.prompt('請輸入帳本名稱', '', '新增故事本');
        if (name && name.trim()) {
            try {
                await window.DataManager.addNotebook(name.trim());
                // 透過訂閱自動更新，無需手動呼叫 this.update()
                await window.customDialog.success(`成功新增故事本「${name.trim()}」！`);
            } catch (error) {
                console.error('❌ 新增帳本失敗:', error);
                await window.customDialog.error('新增帳本失敗：' + error.message);
            }
        }
    }
}

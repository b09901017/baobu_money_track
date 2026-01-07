// ==================== 通知面板組件 ====================
// 顯示活動記錄（變更通知）的可愛面板

export class NotificationPanel {
    constructor(state) {
        this.state = state;
        this.panel = null;
        this.isOpen = false;
        this.activities = [];
        this.unreadCount = 0;

        // 分頁相關
        this.displayedCount = 6; // 初始顯示 6 個
        this.pageSize = 6; // 每次載入 6 個
    }

    /**
     * 初始化面板
     */
    init() {
        this.panel = document.getElementById('notificationPanel');
        if (!this.panel) {
            console.error('❌ 找不到通知面板元素');
            return;
        }

        // 綁定關閉按鈕
        const closeBtn = this.panel.querySelector('[data-action="close-notifications"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // 綁定全部已讀按鈕
        const markAllReadBtn = this.panel.querySelector('[data-action="mark-all-read"]');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => this.markAllAsRead());
        }

        // 綁定載入更多按鈕
        const loadMoreBtn = this.panel.querySelector('[data-action="load-more-notifications"]');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }

        // 綁定詳情彈窗關閉
        const detailModal = document.getElementById('notificationDetailModal');
        const closeDetailBtn = document.getElementById('btnCloseNotificationDetail');
        const detailOverlay = document.getElementById('notificationDetailOverlay');

        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => this.closeDetail());
        }
        if (detailOverlay) {
            detailOverlay.addEventListener('click', () => this.closeDetail());
        }

        // 訂閱活動更新
        this.state.subscribe('activities', (data) => this.handleActivitiesUpdate(data));

        console.log('✅ NotificationPanel 已初始化');
    }

    /**
     * 處理活動更新
     * @param {Object} data - { activities, unreadCount }
     */
    handleActivitiesUpdate(data) {
        this.activities = data.activities || [];
        this.unreadCount = data.unreadCount || 0;

        // 更新面板內容
        this.render();

        // 更新鈴鐺徽章
        this.updateBadge();
    }

    /**
     * 切換面板開關
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 打開面板
     */
    open() {
        if (!this.panel) return;

        this.panel.classList.remove('hidden');
        this.panel.classList.add('active');
        this.isOpen = true;

        // 渲染內容
        this.render();

        console.log('📬 通知面板已打開');
    }

    /**
     * 關閉面板
     */
    close() {
        if (!this.panel) return;

        this.panel.classList.remove('active');
        setTimeout(() => {
            this.panel.classList.add('hidden');
        }, 300);
        this.isOpen = false;

        console.log('📪 通知面板已關閉');
    }

    /**
     * 渲染通知列表（支援分頁）
     */
    render() {
        const listContainer = this.panel?.querySelector('#notificationList');
        const loadMoreContainer = document.getElementById('notificationLoadMore');
        if (!listContainer) return;

        // 如果沒有活動記錄
        if (this.activities.length === 0) {
            listContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-6">
                    <div class="text-6xl mb-4">📭</div>
                    <p class="text-warm-brown/60 text-center font-hand">
                        目前沒有任何通知<br>
                        <span class="text-sm">當對方修改記帳時會顯示在這裡喔</span>
                    </p>
                </div>
            `;
            if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
            return;
        }

        // 渲染活動列表（分頁顯示）
        const myRole = window.DataManager.myRole;
        const displayedActivities = this.activities.slice(0, this.displayedCount);

        const activityItems = displayedActivities.map(activity => {
            const isUnread = !activity.isRead[myRole];
            const actorName = this.getRoleName(activity.actor);
            const message = this.generateMessage(activity);
            const timeAgo = this.getTimeAgo(activity.timestamp);

            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}" data-activity-id="${activity.id}">
                    <div class="flex items-start gap-3">
                        <!-- 頭像 -->
                        <div class="notification-avatar ${activity.actor}">
                            ${activity.actor === 'baobao' ? '🎀' : '🎩'}
                        </div>

                        <!-- 內容 -->
                        <div class="flex-1">
                            <div class="notification-message">
                                ${message}
                            </div>
                            <div class="notification-time">
                                ${timeAgo}
                            </div>
                        </div>

                        <!-- 未讀標記 -->
                        ${isUnread ? '<div class="notification-dot"></div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = activityItems;

        // 顯示/隱藏載入更多按鈕
        if (loadMoreContainer) {
            if (this.displayedCount < this.activities.length) {
                loadMoreContainer.classList.remove('hidden');
            } else {
                loadMoreContainer.classList.add('hidden');
            }
        }

        // 綁定點擊事件（打開詳情）
        listContainer.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const activityId = item.dataset.activityId;
                const activity = this.activities.find(a => a.id === activityId);
                if (activity) {
                    this.showDetail(activity);
                }
            });
        });
    }

    /**
     * 載入更多通知
     */
    loadMore() {
        this.displayedCount += this.pageSize;
        this.render();
    }

    /**
     * 生成可愛的通知訊息（智能簡述）
     * @param {Object} activity - 活動記錄
     * @returns {string}
     */
    generateMessage(activity) {
        const actorName = this.getRoleName(activity.actor);
        const { type, transaction, changes } = activity;
        const itemName = transaction.item_name || '一筆交易';
        const amount = `$${transaction.amount}`;

        switch (type) {
            case 'create':
                // 補記舊帳 - 簡述版
                return `${actorName} 補記了 <strong>${this.formatDate(transaction.date)}</strong> 的「<strong>${itemName}</strong>」<span class="text-macaron-rose font-bold">${amount}</span> 🍽️`;

            case 'update':
                // 修改交易 - 智能簡述
                return this.generateUpdateSummary(actorName, itemName, changes);

            case 'delete':
                // 刪除交易
                return `${actorName} 刪除了「<strong>${itemName}</strong>」<span class="text-warm-brown/60">(${amount})</span> 🗑️`;

            default:
                return `${actorName} 進行了一個操作`;
        }
    }

    /**
     * 生成更新操作的智能簡述
     * @param {string} actorName - 操作者名稱
     * @param {string} itemName - 項目名稱
     * @param {Object} changes - 變更內容
     * @returns {string}
     */
    generateUpdateSummary(actorName, itemName, changes) {
        if (!changes) return `${actorName} 修改了「<strong>${itemName}</strong>」`;

        const changedFields = [];
        let primaryChange = null; // 主要變更（金額或名稱）

        // 檢查各個欄位的變更
        if (changes.amount) {
            primaryChange = `金額 <strong>$${changes.amount.old}</strong> → <strong class="text-macaron-rose">$${changes.amount.new}</strong>`;
        } else if (changes.item_name) {
            primaryChange = `名稱 <strong>${changes.item_name.old}</strong> → <strong>${changes.item_name.new}</strong>`;
        }

        // 收集其他次要變更
        if (changes.categories) changedFields.push('類別');
        if (changes.note) changedFields.push('備註');
        if (changes.photo_url !== undefined) {
            if (changes.photo_url.new && !changes.photo_url.old) {
                changedFields.push('新增照片');
            } else if (!changes.photo_url.new && changes.photo_url.old) {
                changedFields.push('刪除照片');
            } else if (changes.photo_url.new && changes.photo_url.old) {
                changedFields.push('更換照片');
            }
        }
        if (changes.payer) changedFields.push('付款人');
        if (changes.beneficiary) changedFields.push('受益人');
        if (changes.date) changedFields.push('日期');

        // 生成簡述
        if (primaryChange) {
            // 有主要變更（金額或名稱）
            if (changedFields.length > 0) {
                return `${actorName} 改了「<strong>${itemName}</strong>」的 ${primaryChange} + ${changedFields.join('+')} 💸`;
            } else {
                return `${actorName} 改了「<strong>${itemName}</strong>」的 ${primaryChange} 💰`;
            }
        } else if (changedFields.length > 0) {
            // 只有次要變更
            return `${actorName} 改了「<strong>${itemName}</strong>」的 ${changedFields.join('+')} ✏️`;
        } else {
            return `${actorName} 修改了「<strong>${itemName}</strong>」`;
        }
    }

    /**
     * 生成詳細的變更描述（用於詳情彈窗）
     * @param {Object} activity - 活動記錄
     * @returns {Object} { summary, details }
     */
    generateDetailedMessage(activity) {
        const { type, transaction, changes } = activity;
        const actorName = this.getRoleName(activity.actor);
        const itemName = transaction.item_name || '一筆交易';

        if (type === 'create') {
            return {
                summary: `補記了 ${this.formatDate(transaction.date)} 的交易`,
                details: []
            };
        }

        if (type === 'delete') {
            return {
                summary: `刪除了這筆交易`,
                details: []
            };
        }

        // update 類型的詳細變更
        const details = [];
        if (changes.amount) {
            details.push({
                field: '金額',
                old: `$${changes.amount.old}`,
                new: `$${changes.amount.new}`
            });
        }
        if (changes.item_name) {
            details.push({
                field: '名稱',
                old: changes.item_name.old,
                new: changes.item_name.new
            });
        }
        if (changes.categories) {
            details.push({
                field: '類別',
                old: changes.categories.old?.join('、') || '無',
                new: changes.categories.new?.join('、') || '無'
            });
        }
        if (changes.note) {
            details.push({
                field: '備註',
                old: changes.note.old || '無',
                new: changes.note.new || '無'
            });
        }
        if (changes.photo_url !== undefined) {
            let photoChange = '';
            if (changes.photo_url.new && !changes.photo_url.old) {
                photoChange = '新增了照片';
            } else if (!changes.photo_url.new && changes.photo_url.old) {
                photoChange = '刪除了照片';
            } else {
                photoChange = '更換了照片';
            }
            details.push({
                field: '照片',
                old: changes.photo_url.old ? '有' : '無',
                new: photoChange
            });
        }
        if (changes.payer) {
            details.push({
                field: '付款人',
                old: this.getRoleName(changes.payer.old),
                new: this.getRoleName(changes.payer.new)
            });
        }
        if (changes.beneficiary) {
            details.push({
                field: '受益人',
                old: changes.beneficiary.old === 'both' ? '兩人' : this.getRoleName(changes.beneficiary.old),
                new: changes.beneficiary.new === 'both' ? '兩人' : this.getRoleName(changes.beneficiary.new)
            });
        }
        if (changes.date) {
            details.push({
                field: '日期',
                old: this.formatDate(changes.date.old),
                new: this.formatDate(changes.date.new)
            });
        }

        return {
            summary: `修改了「${itemName}」`,
            details
        };
    }

    /**
     * 取得角色顯示名稱
     * @param {string} role - 'baobao' | 'bubu'
     * @returns {string}
     */
    getRoleName(role) {
        return role === 'baobao' ? '寶寶' : '步步';
    }

    /**
     * 格式化日期
     * @param {string} dateStr - YYYY-MM-DD
     * @returns {string}
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateOnly = dateStr;
        const todayStr = this.getDateString(today);
        const yesterdayStr = this.getDateString(yesterday);

        if (dateOnly === todayStr) {
            return '今天';
        } else if (dateOnly === yesterdayStr) {
            return '昨天';
        } else {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}/${day}`;
        }
    }

    /**
     * 取得日期字串 (YYYY-MM-DD)
     * @param {Date} date
     * @returns {string}
     */
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 計算時間差距（多久以前）
     * @param {Object} timestamp - Firestore Timestamp
     * @returns {string}
     */
    getTimeAgo(timestamp) {
        if (!timestamp) return '剛剛';

        // Firestore Timestamp 轉換
        const activityTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diffMs = now - activityTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMinutes < 1) return '剛剛';
        if (diffMinutes < 60) return `${diffMinutes} 分鐘前`;
        if (diffHours < 24) return `${diffHours} 小時前`;
        if (diffDays < 7) return `${diffDays} 天前`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
        return `${Math.floor(diffDays / 30)} 個月前`;
    }

    /**
     * 標記單個活動為已讀
     * @param {string} activityId
     */
    async markAsRead(activityId) {
        try {
            await window.DataManager.markActivityAsRead(activityId);
            console.log('✅ 活動已標記為已讀:', activityId);
        } catch (error) {
            console.error('❌ 標記已讀失敗:', error);
        }
    }

    /**
     * 標記全部為已讀
     */
    async markAllAsRead() {
        try {
            await window.DataManager.markAllActivitiesAsRead();
            console.log('✅ 所有活動已標記為已讀');

            // 顯示成功提示
            if (window.customDialog) {
                await window.customDialog.success('已將所有通知標記為已讀！');
            }
        } catch (error) {
            console.error('❌ 批量標記已讀失敗:', error);
            if (window.customDialog) {
                await window.customDialog.error('標記失敗：' + error.message);
            }
        }
    }

    /**
     * 顯示通知詳情彈窗
     * @param {Object} activity - 活動記錄
     */
    showDetail(activity) {
        const modal = document.getElementById('notificationDetailModal');
        const content = document.getElementById('notificationDetailContent');
        if (!modal || !content) return;

        const myRole = window.DataManager.myRole;
        const isUnread = !activity.isRead[myRole];
        const actorName = this.getRoleName(activity.actor);
        const { type, transaction } = activity;

        // 生成詳細內容
        const detailedInfo = this.generateDetailedMessage(activity);

        let html = `
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="notification-avatar ${activity.actor}">
                        ${activity.actor === 'baobao' ? '🎀' : '🎩'}
                    </div>
                    <div>
                        <div class="font-hand font-bold text-soft-ink text-lg">${actorName}</div>
                        <div class="text-xs text-warm-brown/60">${this.getTimeAgo(activity.timestamp)}</div>
                    </div>
                </div>

                <div class="bg-macaron-cream/30 rounded-xl p-4 mb-4">
                    <div class="text-sm text-warm-brown/80 mb-2">操作類型</div>
                    <div class="font-hand font-bold text-soft-ink">
                        ${type === 'create' ? '📝 補記交易' : type === 'update' ? '✏️ 修改交易' : '🗑️ 刪除交易'}
                    </div>
                </div>

                <div class="bg-white rounded-xl p-4 border border-macaron-rose/20 mb-4">
                    <div class="text-sm text-warm-brown/80 mb-2">交易項目</div>
                    <div class="font-hand font-bold text-soft-ink text-lg mb-1">${transaction.item_name}</div>
                    <div class="text-macaron-rose font-bold text-xl">$${transaction.amount}</div>
                </div>
            </div>
        `;

        // 如果是 update 且有詳細變更
        if (type === 'update' && detailedInfo.details && detailedInfo.details.length > 0) {
            html += `
                <div class="mb-4">
                    <div class="text-sm text-warm-brown/80 mb-3 font-bold">📋 變更詳情</div>
                    <div class="space-y-3">
                        ${detailedInfo.details.map(detail => `
                            <div class="bg-macaron-pink/10 rounded-xl p-3 border border-macaron-rose/20">
                                <div class="text-xs text-warm-brown/70 mb-2">${detail.field}</div>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-warm-brown/80 line-through">${detail.old}</span>
                                    <span class="text-macaron-rose">→</span>
                                    <span class="text-sm font-bold text-macaron-rose">${detail.new}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 如果未讀，添加標記已讀按鈕
        if (isUnread) {
            html += `
                <button class="w-full py-3 rounded-xl bg-gradient-to-r from-macaron-pink to-macaron-rose text-white font-hand font-bold transition-all hover:scale-105 shadow-watercolor-layered" onclick="window.NotificationPanelInstance.markAsReadAndCloseDetail('${activity.id}')">
                    標記為已讀 ✓
                </button>
            `;
        }

        content.innerHTML = html;
        modal.classList.remove('hidden');
    }

    /**
     * 關閉詳情彈窗
     */
    closeDetail() {
        const modal = document.getElementById('notificationDetailModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * 標記為已讀並關閉詳情
     * @param {string} activityId
     */
    async markAsReadAndCloseDetail(activityId) {
        await this.markAsRead(activityId);
        this.closeDetail();
    }

    /**
     * 更新鈴鐺徽章
     */
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

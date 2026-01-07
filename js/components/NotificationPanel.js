// ==================== 通知面板組件 ====================
// 顯示活動記錄（變更通知）的可愛面板

export class NotificationPanel {
    constructor(state) {
        this.state = state;
        this.panel = null;
        this.isOpen = false;
        this.activities = [];
        this.unreadCount = 0;
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
     * 渲染通知列表
     */
    render() {
        const listContainer = this.panel?.querySelector('#notificationList');
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
            return;
        }

        // 渲染活動列表
        const myRole = window.DataManager.myRole;
        const activityItems = this.activities.map(activity => {
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

        // 綁定點擊事件（標記單個為已讀）
        listContainer.querySelectorAll('.notification-item.unread').forEach(item => {
            item.addEventListener('click', () => {
                const activityId = item.dataset.activityId;
                this.markAsRead(activityId);
            });
        });
    }

    /**
     * 生成可愛的通知訊息
     * @param {Object} activity - 活動記錄
     * @returns {string}
     */
    generateMessage(activity) {
        const actorName = this.getRoleName(activity.actor);
        const { type, transaction, changes } = activity;
        const itemName = transaction.item_name || '一筆交易';
        const amount = `$${transaction.amount}`;
        const categories = transaction.categories?.join('、') || '';

        switch (type) {
            case 'create':
                // 補記舊帳
                return `${actorName} 偷偷補記了 <strong>${this.formatDate(transaction.date)}</strong> 的「<strong>${itemName}</strong>」${categories ? ` (${categories})` : ''} <span class="text-macaron-rose font-bold">${amount}</span> 🍽️`;

            case 'update':
                // 修改交易
                let changeText = '';
                if (changes.amount) {
                    changeText = `金額從 <strong>$${changes.amount.old}</strong> 改成 <strong class="text-macaron-rose">$${changes.amount.new}</strong>`;
                } else if (changes.item_name) {
                    changeText = `項目名稱改成「<strong>${changes.item_name.new}</strong>」`;
                } else if (changes.date) {
                    changeText = `日期改成 <strong>${this.formatDate(changes.date.new)}</strong>`;
                } else {
                    changeText = '修改了內容';
                }
                return `${actorName} 修改了「<strong>${itemName}</strong>」，${changeText} 💸`;

            case 'delete':
                // 刪除交易
                return `${actorName} 把「<strong>${itemName}</strong>」這筆帳擦掉了 <span class="text-warm-brown/60">(${amount})</span> ✏️`;

            default:
                return `${actorName} 進行了一個操作`;
        }
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

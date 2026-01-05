// ==================== 交易項目渲染器 ====================
// 來源: app.js 行 683-809
// 負責渲染交易卡片（列表模式和時間軸模式）

import { formatDisplayDate } from '../utils/dateUtils.js';

// 分類圖標配置
const CATEGORY_ICONS = {
    '吃吃': 'restaurant',
    '玩': 'local_activity',
    '交通': 'directions_subway',
    '購物': 'shopping_bag',
    '生活': 'cottage',
    '其他': 'auto_stories'
};

// 分類顏色配置（列表模式）
const CATEGORY_COLORS = {
    '吃吃': 'bg-macaron-pink/20',
    '玩': 'bg-macaron-blue/20',
    '交通': 'bg-macaron-green/20',
    '購物': 'bg-macaron-purple/20',
    '生活': 'bg-macaron-cream/40',
    '其他': 'bg-warm-brown/10'
};

// 分類顏色配置（時間軸模式）
const TIMELINE_COLORS = {
    '吃吃': 'bg-macaron-pink/20 border-macaron-pink',
    '玩': 'bg-macaron-blue/20 border-macaron-blue',
    '交通': 'bg-macaron-green/20 border-macaron-green',
    '購物': 'bg-macaron-purple/20 border-macaron-purple',
    '生活': 'bg-macaron-cream/40 border-macaron-cream',
    '其他': 'bg-warm-brown/10 border-warm-brown'
};

export class TransactionRenderer {
    /**
     * 渲染交易項目（列表模式）
     * @param {Object} tx - 交易物件
     * @returns {string} - HTML 字串
     */
    static renderTransactionItem(tx) {
        const icon = tx.categories && tx.categories.length > 0
            ? CATEGORY_ICONS[tx.categories[0]] || 'auto_stories'
            : 'auto_stories';

        const colorClass = tx.categories && tx.categories.length > 0
            ? CATEGORY_COLORS[tx.categories[0]] || 'bg-warm-brown/10'
            : 'bg-warm-brown/10';

        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        // 根據付款人決定邊框顏色和標記
        const payerBorderClass = tx.payer === 'me'
            ? 'border-l-4 border-macaron-pink'
            : 'border-l-4 border-macaron-blue';

        const payerBadgeClass = tx.payer === 'me'
            ? 'bg-macaron-pink/20 text-macaron-rose'
            : 'bg-macaron-blue/20 text-blue-600';

        // 照片圖標（如果有照片）
        const photoIcon = tx.photo_url ? `
            <div class="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-antique-gold flex items-center justify-center text-white text-xs shadow-sm">
                📸
            </div>
        ` : '';

        return `
            <div class="transaction-item bg-white rounded-2xl p-4 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group ${payerBorderClass}" data-transaction-id="${tx.id}">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center text-soft-ink shrink-0 group-hover:scale-110 transition-transform relative">
                        <span class="material-symbols-outlined text-2xl">${icon}</span>
                        <!-- 付款人標記 -->
                        <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full ${payerBadgeClass} flex items-center justify-center text-xs font-bold shadow-sm">
                            ${tx.payer === 'me' ? '寶' : '步'}
                        </div>
                        <!-- 照片圖標 -->
                        ${photoIcon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-hand font-bold text-lg text-soft-ink truncate">${tx.item_name}</h4>
                        <p class="text-sm text-warm-brown/80 truncate mt-0.5">
                            <span class="font-bold ${tx.payer === 'me' ? 'text-macaron-rose' : 'text-blue-600'}">${payerText} 付</span> · ${beneficiaryText} · ${formatDisplayDate(tx.date)}
                        </p>
                    </div>
                    <div class="text-right">
                        <div class="font-display font-bold text-xl text-[#E27D60]">$${tx.amount}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染時間軸交易項目（帶時間顯示）
     * @param {Object} tx - 交易物件
     * @param {number} index - 索引（保留參數以保持兼容性）
     * @returns {string} - HTML 字串
     */
    static renderTimelineItemWithTime(tx, index) {
        const icon = tx.categories && tx.categories.length > 0
            ? CATEGORY_ICONS[tx.categories[0]] || 'auto_stories'
            : 'auto_stories';

        const payerText = tx.payer === 'me' ? '寶寶' : '步步';

        // 判斷是否為寶寶付款
        const isBaobao = tx.payer === 'me';

        // 根據付款人決定樣式
        const payerBadgeClass = isBaobao
            ? 'bg-macaron-pink/20 text-macaron-rose'
            : 'bg-macaron-blue/20 text-blue-600';

        const payerBorderClass = isBaobao
            ? 'border-l-4 border-macaron-pink'
            : 'border-r-4 border-macaron-blue';

        const payerDotClass = isBaobao
            ? 'border-macaron-pink bg-macaron-pink/20'
            : 'border-macaron-blue bg-macaron-blue/20';

        // 計算時間（使用 created_at）
        const time = new Date(tx.created_at);
        const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

        // 照片圖標（如果有照片）
        const photoIndicator = tx.photo_url ? `<span class="text-xs">📸</span>` : '';

        // 寶寶付款：卡片偏左
        // 步步付款：卡片偏右
        if (isBaobao) {
            return `
                <div class="relative mb-4 flex justify-start items-start gap-2">
                    <!-- 時間軸點 - 寶寶（左邊）-->
                    <div class="absolute -left-8 top-3 w-4 h-4 rounded-full ${payerDotClass} border-[3px] shadow-sm z-10"></div>

                    <!-- 時間標記 -->
                    <div class="shrink-0 mt-3 text-xs text-warm-brown/60 font-hand font-bold min-w-[40px]">${timeStr}</div>

                    <!-- 交易卡片 - 偏左 -->
                    <div class="transaction-item flex-1 max-w-[80%] bg-white rounded-2xl p-3 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group ${payerBorderClass}" data-transaction-id="${tx.id}">
                        <div class="flex items-center gap-3">
                            <!-- 寶寶付標籤 -->
                            <span class="px-2 py-0.5 rounded-full ${payerBadgeClass} text-xs font-bold shrink-0">寶寶付</span>

                            <!-- 價錢 -->
                            <div class="shrink-0">
                                <div class="font-display font-bold text-lg text-[#E27D60]">$${tx.amount}</div>
                            </div>

                            <!-- 名稱 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1">
                                    <h4 class="font-hand font-bold text-base text-soft-ink truncate">${tx.item_name}</h4>
                                    ${photoIndicator}
                                </div>
                                ${tx.note ? `<p class="text-xs text-warm-brown/60 italic truncate">📝 ${tx.note}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="relative mb-4 flex justify-end items-start gap-2">
                    <!-- 交易卡片 - 偏右 -->
                    <div class="transaction-item flex-1 max-w-[80%] bg-white rounded-2xl p-3 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group ${payerBorderClass}" data-transaction-id="${tx.id}">
                        <div class="flex items-center gap-3">
                            <!-- 步步付標籤 -->
                            <span class="px-2 py-0.5 rounded-full ${payerBadgeClass} text-xs font-bold shrink-0">步步付</span>

                            <!-- 價錢 -->
                            <div class="shrink-0">
                                <div class="font-display font-bold text-lg text-[#E27D60]">$${tx.amount}</div>
                            </div>

                            <!-- 名稱 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1">
                                    <h4 class="font-hand font-bold text-base text-soft-ink truncate">${tx.item_name}</h4>
                                    ${photoIndicator}
                                </div>
                                ${tx.note ? `<p class="text-xs text-warm-brown/60 italic truncate">📝 ${tx.note}</p>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- 時間標記 -->
                    <div class="shrink-0 mt-3 text-xs text-warm-brown/60 font-hand font-bold min-w-[40px] text-right">${timeStr}</div>

                    <!-- 時間軸點 - 步步（右邊）-->
                    <div class="absolute -right-8 top-3 w-4 h-4 rounded-full ${payerDotClass} border-[3px] shadow-sm z-10"></div>
                </div>
            `;
        }
    }

    /**
     * 渲染時間軸交易項目（時間軸模式）
     * @param {Object} tx - 交易物件
     * @param {number} index - 索引（保留參數以保持兼容性）
     * @returns {string} - HTML 字串
     */
    static renderTimelineItem(tx, index) {
        const icon = tx.categories && tx.categories.length > 0
            ? CATEGORY_ICONS[tx.categories[0]] || 'auto_stories'
            : 'auto_stories';

        const colorClass = tx.categories && tx.categories.length > 0
            ? TIMELINE_COLORS[tx.categories[0]] || 'bg-warm-brown/10 border-warm-brown'
            : 'bg-warm-brown/10 border-warm-brown';

        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        // 判斷是否為寶寶付款
        const isBaobao = tx.payer === 'me';

        // 根據付款人決定樣式
        const payerDotClass = isBaobao
            ? 'border-macaron-pink bg-macaron-pink/20'
            : 'border-macaron-blue bg-macaron-blue/20';

        const payerBadgeClass = isBaobao
            ? 'bg-macaron-pink/20 text-macaron-rose'
            : 'bg-macaron-blue/20 text-blue-600';

        const payerBorderClass = isBaobao
            ? 'border-l-4 border-macaron-pink'
            : 'border-r-4 border-macaron-blue';

        // 計算時間（使用 created_at）
        const time = new Date(tx.created_at);
        const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

        // 照片圖標（如果有照片）
        const photoIndicator = tx.photo_url ? `<span class="text-xs">📸</span>` : '';

        // 寶寶付款：卡片偏左，圓點在左邊
        // 步步付款：卡片偏右，圓點在右邊
        if (isBaobao) {
            return `
                <div class="relative mb-6 flex justify-start">
                    <!-- 時間軸點 - 寶寶（左邊）-->
                    <div class="absolute -left-8 top-3 w-4 h-4 rounded-full ${payerDotClass} border-[3px] shadow-sm z-10"></div>

                    <!-- 交易卡片 - 偏左，內容：寶寶付 → 價錢 → 名稱 -->
                    <div class="transaction-item max-w-[85%] bg-white rounded-2xl p-3 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group ${payerBorderClass}" data-transaction-id="${tx.id}">
                        <div class="flex items-center gap-3">
                            <!-- 寶寶付標籤 -->
                            <span class="px-2 py-0.5 rounded-full ${payerBadgeClass} text-xs font-bold shrink-0">寶寶付</span>

                            <!-- 價錢 -->
                            <div class="shrink-0">
                                <div class="font-display font-bold text-lg text-[#E27D60]">$${tx.amount}</div>
                            </div>

                            <!-- 名稱 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1">
                                    <h4 class="font-hand font-bold text-base text-soft-ink truncate">${tx.item_name}</h4>
                                    ${photoIndicator}
                                </div>
                                ${tx.note ? `<p class="text-xs text-warm-brown/60 italic truncate">📝 ${tx.note}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="relative mb-6 flex justify-end">
                    <!-- 時間軸點 - 步步（右邊）-->
                    <div class="absolute -right-8 top-3 w-4 h-4 rounded-full ${payerDotClass} border-[3px] shadow-sm z-10"></div>

                    <!-- 交易卡片 - 偏右，內容：步步付 → 價錢 → 名稱 -->
                    <div class="transaction-item max-w-[85%] bg-white rounded-2xl p-3 shadow-watercolor-layered hover:shadow-floating transition-all cursor-pointer group ${payerBorderClass}" data-transaction-id="${tx.id}">
                        <div class="flex items-center gap-3">
                            <!-- 步步付標籤 -->
                            <span class="px-2 py-0.5 rounded-full ${payerBadgeClass} text-xs font-bold shrink-0">步步付</span>

                            <!-- 價錢 -->
                            <div class="shrink-0">
                                <div class="font-display font-bold text-lg text-[#E27D60]">$${tx.amount}</div>
                            </div>

                            <!-- 名稱 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-1">
                                    <h4 class="font-hand font-bold text-base text-soft-ink truncate">${tx.item_name}</h4>
                                    ${photoIndicator}
                                </div>
                                ${tx.note ? `<p class="text-xs text-warm-brown/60 italic truncate">📝 ${tx.note}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 綁定交易項目點擊事件
     * @param {HTMLElement} container - 容器元素
     * @param {Function} onClickCallback - 點擊回調函數，接收 transactionId
     */
    static bindClickEvents(container, onClickCallback) {
        if (!container) return;

        container.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const txId = e.currentTarget.dataset.transactionId;
                if (txId && onClickCallback) {
                    onClickCallback(txId);
                }
            });
        });
    }
}

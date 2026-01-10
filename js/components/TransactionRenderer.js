// ==================== 交易項目渲染器 ====================
// 來源: app.js 行 683-809
// 負責渲染交易卡片（列表模式和時間軸模式）

import { formatDisplayDate } from '../utils/dateUtils.js';

// 分類圖標配置
const CATEGORY_ICONS = {
    // 常用類別
    '吃吃': 'restaurant',
    '喝喝': 'local_cafe',
    '玩玩': 'toys',
    '刷寶媽卡': 'credit_card',
    '高級吃吃': 'dinner_dining',
    '優惠超人': 'local_offer',
    '家樂福/全聯': 'shopping_cart',
    '交通': 'directions_bus',
    // 更多類別
    '洗衣服': 'local_laundry_service',
    '寵寶寶': 'favorite',
    '寵步步': 'favorite_border',
    '房租': 'home',
    '蝦皮/光南': 'shopping_bag',
    '居家': 'weekend',
    '噗嚕天堂': 'videogame_asset',
    '3C': 'devices',
    '醫療': 'medical_services',
    '大日子': 'cake',
    '訂閱東東': 'subscriptions',
    '大爆買買': 'shopping_basket',
    '整理窩窩日': 'cleaning_services',
    // 預設
    '其他': 'auto_stories'
};

// 分類顏色配置（列表模式）
const CATEGORY_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20',
    '喝喝': 'bg-macaron-blue/20',
    '玩玩': 'bg-macaron-purple/20',
    '刷寶媽卡': 'bg-antique-gold/20',
    '高級吃吃': 'bg-macaron-rose/20',
    '優惠超人': 'bg-macaron-orange/20',
    '家樂福/全聯': 'bg-macaron-green/20',
    '交通': 'bg-macaron-green/20',
    // 更多類別
    '洗衣服': 'bg-macaron-blue/15',
    '寵寶寶': 'bg-macaron-pink/25',
    '寵步步': 'bg-macaron-blue/25',
    '房租': 'bg-warm-brown/15',
    '蝦皮/光南': 'bg-macaron-purple/20',
    '居家': 'bg-macaron-cream/40',
    '噗嚕天堂': 'bg-macaron-lavender/20',
    '3C': 'bg-macaron-blue/20',
    '醫療': 'bg-macaron-rose/15',
    '大日子': 'bg-macaron-pink/30',
    '訂閱東東': 'bg-macaron-purple/15',
    '大爆買買': 'bg-macaron-orange/25',
    '整理窩窩日': 'bg-macaron-green/15',
    // 預設
    '其他': 'bg-warm-brown/10'
};

// 分類顏色配置（時間軸模式）
const TIMELINE_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20 border-macaron-pink',
    '喝喝': 'bg-macaron-blue/20 border-macaron-blue',
    '玩玩': 'bg-macaron-purple/20 border-macaron-purple',
    '刷寶媽卡': 'bg-antique-gold/20 border-antique-gold',
    '高級吃吃': 'bg-macaron-rose/20 border-macaron-rose',
    '優惠超人': 'bg-macaron-orange/20 border-macaron-orange',
    '家樂福/全聯': 'bg-macaron-green/20 border-macaron-green',
    '交通': 'bg-macaron-green/20 border-macaron-green',
    // 更多類別
    '洗衣服': 'bg-macaron-blue/15 border-macaron-blue',
    '寵寶寶': 'bg-macaron-pink/25 border-macaron-pink',
    '寵步步': 'bg-macaron-blue/25 border-macaron-blue',
    '房租': 'bg-warm-brown/15 border-warm-brown',
    '蝦皮/光南': 'bg-macaron-purple/20 border-macaron-purple',
    '居家': 'bg-macaron-cream/40 border-macaron-cream',
    '噗嚕天堂': 'bg-macaron-lavender/20 border-macaron-lavender',
    '3C': 'bg-macaron-blue/20 border-macaron-blue',
    '醫療': 'bg-macaron-rose/15 border-macaron-rose',
    '大日子': 'bg-macaron-pink/30 border-macaron-pink',
    '訂閱東東': 'bg-macaron-purple/15 border-macaron-purple',
    '大爆買買': 'bg-macaron-orange/25 border-macaron-orange',
    '整理窩窩日': 'bg-macaron-green/15 border-macaron-green',
    // 預設
    '其他': 'bg-warm-brown/10 border-warm-brown'
};

/**
 * 獲取付款描述文字（誰幫誰付）
 * @param {Object} tx - 交易物件
 * @returns {string} - 付款描述文字
 */
function getPaymentText(tx) {
    // 使用絕對角色判斷（baobao 或 bubu）
    if (tx.payer === 'baobao') {
        if (tx.beneficiary === 'baobao') return '寶幫寶付';
        if (tx.beneficiary === 'bubu') return '寶幫步付';
        return '寶幫共付';
    } else if (tx.payer === 'bubu') {
        if (tx.beneficiary === 'bubu') return '步幫步付';
        if (tx.beneficiary === 'baobao') return '步幫寶付';
        return '步幫共付';
    }
    // 容錯：如果 payer 不是預期的值，返回預設文字
    return '未知付款';
}

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

        // 使用 getPaymentText 獲取付款描述
        const paymentText = getPaymentText(tx);

        // 根據付款人決定邊框顏色和標記（使用絕對角色）
        const payerBorderClass = tx.payer === 'baobao'
            ? 'border-l-4 border-macaron-pink'
            : 'border-l-4 border-macaron-blue';

        const payerBadgeClass = tx.payer === 'baobao'
            ? 'bg-macaron-pink/20 text-macaron-rose'
            : 'bg-macaron-blue/20 text-blue-600';

        const payerTextColor = tx.payer === 'baobao' ? 'text-macaron-rose' : 'text-blue-600';

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
                            ${tx.payer === 'baobao' ? '寶' : '步'}
                        </div>
                        <!-- 照片圖標 -->
                        ${photoIcon}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-hand font-bold text-lg text-soft-ink truncate">${tx.item_name}</h4>
                        <p class="text-sm text-warm-brown/80 truncate mt-0.5">
                            <span class="font-bold ${payerTextColor}">${paymentText}</span> · ${formatDisplayDate(tx.date)}
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
        // 判斷是否為寶寶付款（使用絕對角色）
        const isBaobao = tx.payer === 'baobao';

        // 獲取付款描述文字（誰幫誰付）
        const paymentText = getPaymentText(tx);

        // 根據受益人決定對話框背景顏色
        let bubbleBgClass = '';
        let beneficiaryBubbleClass = '';
        if (tx.beneficiary === 'baobao') {
            // 幫寶付 - 粉色
            bubbleBgClass = 'bg-macaron-pink/15 border-macaron-pink/30';
            beneficiaryBubbleClass = 'bg-macaron-pink border-macaron-pink/50 text-white';
        } else if (tx.beneficiary === 'bubu') {
            // 幫步付 - 藍色
            bubbleBgClass = 'bg-macaron-blue/15 border-macaron-blue/30';
            beneficiaryBubbleClass = 'bg-macaron-blue border-macaron-blue/50 text-white';
        } else {
            // 幫共付 - 綠色
            bubbleBgClass = 'bg-macaron-green/15 border-macaron-green/30';
            beneficiaryBubbleClass = 'bg-macaron-green border-macaron-green/50 text-white';
        }

        // 計算時間（使用 created_at）
        let time;
        if (tx.created_at && tx.created_at.toDate) {
            time = tx.created_at.toDate();
        } else if (tx.created_at) {
            time = new Date(tx.created_at);
        } else {
            time = new Date();
        }
        const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

        // 寶寶付款：卡片靠左，付款標籤在左上角，照片在右下角
        // 步步付款：卡片靠右，付款標籤在右上角，照片在左下角
        if (isBaobao) {
            // 照片小圓球（浮在右下角）
            const photoBubble = tx.photo_url ? `
                <div class="timeline-photo-badge timeline-photo-right">
                    <span class="text-sm">📸</span>
                </div>
            ` : '';

            return `
                <div class="mb-5 flex items-start gap-2">
                    <!-- 交易卡片 - 靠左（寶付）-->
                    <div class="transaction-item timeline-bubble-left relative max-w-[75%] rounded-2xl p-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer ${bubbleBgClass} border-2" data-transaction-id="${tx.id}">
                        <!-- 付款標籤小圓球（浮在左上角）-->
                        <div class="timeline-payment-badge timeline-payment-left ${beneficiaryBubbleClass}">
                            <span class="text-[10px] font-bold leading-none whitespace-nowrap">${paymentText}</span>
                        </div>

                        <!-- 照片小圓球（浮在右下角）-->
                        ${photoBubble}

                        <div class="flex items-center gap-3">
                            <!-- 名稱（固定最大寬度，避免擠壓）-->
                            <div class="flex-1 min-w-0 max-w-[140px]">
                                <h4 class="font-hand font-bold text-base text-soft-ink truncate leading-tight">${tx.item_name}</h4>
                            </div>

                            <!-- 金額（固定寬度，右對齊）-->
                            <div class="shrink-0 min-w-[75px] text-right">
                                <div class="font-display font-bold text-lg text-[#E27D60] leading-tight">$${tx.amount}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 時間標記 -->
                    <div class="shrink-0 mt-4 text-xs text-warm-brown/60 font-hand">${timeStr}</div>
                </div>
            `;
        } else {
            // 照片小圓球（浮在左下角）
            const photoBubble = tx.photo_url ? `
                <div class="timeline-photo-badge timeline-photo-left">
                    <span class="text-sm">📸</span>
                </div>
            ` : '';

            return `
                <div class="mb-5 flex items-start gap-2 justify-end">
                    <!-- 時間標記 -->
                    <div class="shrink-0 mt-4 text-xs text-warm-brown/60 font-hand">${timeStr}</div>

                    <!-- 交易卡片 - 靠右（步付）-->
                    <div class="transaction-item timeline-bubble-right relative max-w-[75%] rounded-2xl p-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer ${bubbleBgClass} border-2" data-transaction-id="${tx.id}">
                        <!-- 付款標籤小圓球（浮在右上角）-->
                        <div class="timeline-payment-badge timeline-payment-right ${beneficiaryBubbleClass}">
                            <span class="text-[10px] font-bold leading-none whitespace-nowrap">${paymentText}</span>
                        </div>

                        <!-- 照片小圓球（浮在左下角）-->
                        ${photoBubble}

                        <div class="flex items-center gap-3">
                            <!-- 名稱（固定最大寬度，避免擠壓）-->
                            <div class="flex-1 min-w-0 max-w-[140px]">
                                <h4 class="font-hand font-bold text-base text-soft-ink truncate leading-tight">${tx.item_name}</h4>
                            </div>

                            <!-- 金額（固定寬度，右對齊）-->
                            <div class="shrink-0 min-w-[75px] text-right">
                                <div class="font-display font-bold text-lg text-[#E27D60] leading-tight">$${tx.amount}</div>
                            </div>
                        </div>
                    </div>
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

        const payerText = tx.payer === 'baobao' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'baobao' ? '寶寶'
            : tx.beneficiary === 'bubu' ? '步步'
            : '寶步';

        // 判斷是否為寶寶付款（使用絕對角色）
        const isBaobao = tx.payer === 'baobao';

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
        let time;
        if (tx.created_at && tx.created_at.toDate) {
            // Firebase Timestamp 物件
            time = tx.created_at.toDate();
        } else if (tx.created_at) {
            // 一般日期字串
            time = new Date(tx.created_at);
        } else {
            // 沒有 created_at，使用當前時間
            time = new Date();
        }
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

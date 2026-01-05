// ==================== 長條圖組件 ====================
// 可愛的童話風格長條圖

export class BarChart {
    /**
     * 渲染橫向長條圖
     * @param {Array} data - 資料陣列 [{category: string, amount: number, percentage: number}, ...]
     * @param {Array} colors - 顏色陣列
     * @returns {string} - HTML
     */
    static render(data, colors) {
        if (!data || data.length === 0) {
            return `
                <div class="text-center py-8">
                    <span class="text-4xl">📊</span>
                    <p class="text-warm-brown/60 font-hand mt-2">暫無分類資料</p>
                </div>
            `;
        }

        // 找出最大金額用於計算比例
        const maxAmount = Math.max(...data.map(item => item.amount));

        const bars = data.map((item, index) => {
            const color = colors[index % colors.length];
            const widthPercentage = (item.amount / maxAmount) * 100;

            return `
                <div class="bar-item mb-4 cursor-pointer group" data-category="${item.category}">
                    <!-- 分類名稱與百分比 -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <!-- 顏色指示器 -->
                            <div class="w-3 h-3 rounded-full shrink-0" style="background: ${color}; box-shadow: 0 0 8px ${color}80;"></div>
                            <!-- 分類名稱 -->
                            <span class="font-hand font-bold text-sm text-soft-ink">${item.category}</span>
                        </div>
                        <!-- 百分比 -->
                        <span class="font-hand font-bold text-xs text-warm-brown/70">${item.percentage}%</span>
                    </div>

                    <!-- 長條圖背景與進度條 -->
                    <div class="relative h-10 bg-white/50 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                        <!-- 長條 -->
                        <div
                            class="absolute inset-y-0 left-0 rounded-xl transition-all duration-500 group-hover:opacity-90"
                            style="
                                width: ${widthPercentage}%;
                                background: linear-gradient(90deg, ${color} 0%, ${color}dd 100%);
                                box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px ${color}40;
                            "
                        >
                            <!-- 光澤效果 -->
                            <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>

                        <!-- 金額標籤 -->
                        <div class="absolute inset-0 flex items-center px-3">
                            <span class="font-display font-bold text-sm text-white drop-shadow-md relative z-10 ml-1">
                                $${item.amount.toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="bar-chart space-y-0">
                ${bars}
            </div>
        `;
    }

    /**
     * 綁定長條圖點擊事件
     * @param {HTMLElement} container - 容器元素
     * @param {Function} onClick - 點擊回調函數 (category) => void
     */
    static bindEvents(container, onClick) {
        if (!container || !onClick) return;

        const barItems = container.querySelectorAll('.bar-item');
        barItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                if (category) {
                    onClick(category);
                }
            });
        });
    }
}

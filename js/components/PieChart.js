// ==================== 圓餅圖組件 ====================
// 可愛的童話風格圓餅圖

export class PieChart {
    /**
     * 渲染圓餅圖
     * @param {Array} data - 資料陣列 [{category: string, amount: number, percentage: number}, ...]
     * @param {Array} colors - 顏色陣列
     * @returns {string} - SVG HTML
     */
    static render(data, colors) {
        if (!data || data.length === 0) {
            return `
                <div class="text-center py-8">
                    <span class="text-4xl">🍰</span>
                    <p class="text-warm-brown/60 font-hand mt-2">暫無分類資料</p>
                </div>
            `;
        }

        const size = 240; // SVG 尺寸
        const center = size / 2;
        const radius = 80; // 圓餅半徑
        const holeRadius = 45; // 中心洞半徑（甜甜圈效果）

        let currentAngle = -90; // 從頂部開始（-90度）
        const paths = [];

        data.forEach((item, index) => {
            const color = colors[index % colors.length];
            const angle = (item.percentage / 100) * 360;

            // 計算路徑
            const path = this.createArcPath(
                center,
                center,
                radius,
                holeRadius,
                currentAngle,
                currentAngle + angle
            );

            paths.push(`
                <g class="pie-slice" data-category="${item.category}">
                    <path
                        d="${path}"
                        fill="${color}"
                        stroke="white"
                        stroke-width="3"
                        class="transition-all duration-300 cursor-pointer hover:opacity-80"
                        style="filter: drop-shadow(0 2px 4px ${color}40);"
                    />
                </g>
            `);

            currentAngle += angle;
        });

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="pie-chart-svg">
                <!-- 外圈裝飾 -->
                <circle
                    cx="${center}"
                    cy="${center}"
                    r="${radius + 5}"
                    fill="none"
                    stroke="#FFE5E5"
                    stroke-width="2"
                    stroke-dasharray="5,5"
                    opacity="0.5"
                />

                <!-- 圓餅片段 -->
                ${paths.join('')}

                <!-- 中心白色圓圈 -->
                <circle
                    cx="${center}"
                    cy="${center}"
                    r="${holeRadius}"
                    fill="white"
                    stroke="#FFF9EE"
                    stroke-width="3"
                    style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));"
                />

                <!-- 中心圖標 -->
                <text
                    x="${center}"
                    y="${center + 8}"
                    text-anchor="middle"
                    font-size="32"
                >
                    🍰
                </text>
            </svg>
        `;
    }

    /**
     * 創建弧形路徑
     * @param {number} x - 圓心 X
     * @param {number} y - 圓心 Y
     * @param {number} radius - 外半徑
     * @param {number} holeRadius - 內半徑
     * @param {number} startAngle - 起始角度
     * @param {number} endAngle - 結束角度
     * @returns {string} - SVG 路徑
     */
    static createArcPath(x, y, radius, holeRadius, startAngle, endAngle) {
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;

        const x1 = x + radius * Math.cos(startAngleRad);
        const y1 = y + radius * Math.sin(startAngleRad);
        const x2 = x + radius * Math.cos(endAngleRad);
        const y2 = y + radius * Math.sin(endAngleRad);

        const x3 = x + holeRadius * Math.cos(endAngleRad);
        const y3 = y + holeRadius * Math.sin(endAngleRad);
        const x4 = x + holeRadius * Math.cos(startAngleRad);
        const y4 = y + holeRadius * Math.sin(startAngleRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${holeRadius} ${holeRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
        `;
    }

    /**
     * 渲染圖例
     * @param {Array} data - 資料陣列
     * @param {Array} colors - 顏色陣列
     * @returns {string} - HTML
     */
    static renderLegend(data, colors) {
        return data.map((item, index) => `
            <div class="legend-item flex items-center gap-2 p-2 rounded-lg hover:bg-macaron-cream/30 cursor-pointer transition-colors" data-category="${item.category}">
                <div class="w-4 h-4 rounded-full shrink-0" style="background: ${colors[index % colors.length]}; box-shadow: 0 2px 4px ${colors[index % colors.length]}40;"></div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-hand font-bold text-soft-ink truncate">${item.category}</div>
                    <div class="text-xs text-warm-brown/60">${item.percentage}%</div>
                </div>
                <div class="text-xs font-display font-bold text-soft-ink">$${Math.round(item.amount)}</div>
            </div>
        `).join('');
    }

    /**
     * 綁定圓餅圖點擊事件
     * @param {HTMLElement} container - 容器元素
     * @param {Function} onClick - 點擊回調函數
     */
    static bindEvents(container, onClick) {
        if (!container || !onClick) return;

        // 綁定圓餅片段點擊
        const slices = container.querySelectorAll('.pie-slice');
        slices.forEach(slice => {
            slice.addEventListener('click', () => {
                const category = slice.dataset.category;
                if (category) onClick(category);
            });
        });

        // 綁定圖例點擊
        const legendItems = container.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                if (category) onClick(category);
            });
        });
    }
}

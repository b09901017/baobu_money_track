/**
 * VerticalBarChart.js - 直立式長條圖組件（童話風格）
 * 支援多組資料對比、漸層效果、懸停互動
 */

export default class VerticalBarChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 300,
      padding: options.padding || { top: 30, right: 40, bottom: 50, left: 60 },
      colors: options.colors || ['#FFB5D8', '#D4A5FF', '#A8D8FF', '#B8F0D8'],
      showGrid: options.showGrid !== false,
      showValues: options.showValues !== false, // 顯示數值標籤
      barWidth: options.barWidth || 0.7, // 長條寬度比例（0-1）
      groupGap: options.groupGap || 0.2, // 群組間隔比例
      animate: options.animate !== false,
      ...options,
    };

    this.svg = null;
    this.data = [];
    this.tooltip = null;
    this.currentTouchBar = null; // v5.9.0 新增：追蹤當前觸控的長條
  }

  /**
   * 渲染長條圖
   * @param {Array} data - 資料格式: [{ label: '2024-01', values: [100, 200, 150] }, ...]
   * @param {Array} legends - 圖例: ['寶寶', '步步', '總花費']
   */
  render(data, legends = []) {
    if (!data || data.length === 0) {
      this.container.innerHTML = '<div class="text-center py-12 text-gray-400">📊 暫無資料</div>';
      return;
    }

    this.data = data;
    this.legends = legends;

    // 清空容器
    this.container.innerHTML = '';

    // 建立 SVG 容器
    const wrapper = document.createElement('div');
    wrapper.className = 'vertical-bar-chart-wrapper relative';
    this.container.appendChild(wrapper);

    // 建立 SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', this.options.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.classList.add('vertical-bar-chart-svg');
    wrapper.appendChild(this.svg);

    // 計算資料範圍
    const { xScale, yScale, maxValue, barWidth } = this.calculateScales();

    // 繪製背景
    this.renderBackground();

    // 繪製網格線
    if (this.options.showGrid) {
      this.renderGrid(yScale);
    }

    // 繪製 X 軸標籤
    this.renderXAxis(xScale);

    // 繪製 Y 軸標籤
    this.renderYAxis(yScale, maxValue);

    // 繪製長條（多組）
    this.renderBars(xScale, yScale, barWidth, legends);

    // 繪製圖例
    this.renderLegends(legends);

    // 建立 Tooltip
    this.createTooltip(wrapper);

    // 綁定全域觸控事件（移動端關閉 tooltip）v5.9.0 新增
    this.bindGlobalTouchEvents();

    // 動畫效果
    if (this.options.animate) {
      this.animateChart();
    }
  }

  /**
   * 計算座標軸比例
   */
  calculateScales() {
    const { padding, width, height } = this.options;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 計算最大值
    let maxValue = 0;
    this.data.forEach(item => {
      item.values.forEach(val => {
        if (val > maxValue) maxValue = val;
      });
    });
    maxValue = Math.ceil(maxValue * 1.1);

    // 每組資料的數量
    const groupCount = this.legends.length;

    // 計算單個長條寬度
    const groupWidth = chartWidth / this.data.length;
    const availableWidth = groupWidth * this.options.barWidth;
    const barWidth = availableWidth / groupCount;

    // X 軸比例（群組中心位置）
    const xScale = (index) => {
      return padding.left + groupWidth * index + groupWidth / 2;
    };

    // Y 軸比例
    const yScale = (value) => {
      return padding.top + chartHeight - (value / maxValue) * chartHeight;
    };

    return { xScale, yScale, maxValue, chartWidth, chartHeight, barWidth, groupWidth };
  }

  /**
   * 繪製背景
   */
  renderBackground() {
    const { width, height } = this.options;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // 背景漸層（深色背景，讓亮粉色長條更突出）
    const bgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    bgGradient.setAttribute('id', 'vbarBgGradient');
    bgGradient.setAttribute('x1', '0%');
    bgGradient.setAttribute('y1', '0%');
    bgGradient.setAttribute('x2', '0%');
    bgGradient.setAttribute('y2', '100%');
    bgGradient.innerHTML = `
      <stop offset="0%" style="stop-color:#2D2741;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A1626;stop-opacity:1" />
    `;
    defs.appendChild(bgGradient);

    this.svg.appendChild(defs);

    // 背景矩形
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', width);
    bgRect.setAttribute('height', height);
    bgRect.setAttribute('fill', 'url(#vbarBgGradient)');
    bgRect.setAttribute('rx', '16');
    this.svg.appendChild(bgRect);

    // 裝飾圓點
    this.addDecorativeDots();
  }

  /**
   * 新增裝飾圓點
   */
  addDecorativeDots() {
    const dots = [
      { x: 40, y: 25, r: 5, color: '#FFB5D8', opacity: 0.35 },
      { x: 760, y: 35, r: 6, color: '#D4A5FF', opacity: 0.3 },
      { x: 70, y: 265, r: 4, color: '#A8D8FF', opacity: 0.35 },
      { x: 730, y: 270, r: 5, color: '#B8F0D8', opacity: 0.4 },
    ];

    dots.forEach(dot => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', dot.x);
      circle.setAttribute('cy', dot.y);
      circle.setAttribute('r', dot.r);
      circle.setAttribute('fill', dot.color);
      circle.setAttribute('opacity', dot.opacity);
      this.svg.appendChild(circle);
    });
  }

  /**
   * 繪製網格線
   */
  renderGrid(yScale) {
    const { padding, width } = this.options;
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.classList.add('grid-lines');

    for (let i = 0; i <= 4; i++) {
      const y = yScale((this.calculateScales().maxValue / 4) * i);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#FFFFFF');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4 4');
      line.setAttribute('opacity', '0.15');
      gridGroup.appendChild(line);
    }

    this.svg.appendChild(gridGroup);
  }

  /**
   * 繪製 X 軸標籤
   */
  renderXAxis(xScale) {
    const { padding, height } = this.options;
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.classList.add('x-axis');

    // 限制顯示標籤數量
    const maxLabels = 12;
    const step = Math.ceil(this.data.length / maxLabels);

    this.data.forEach((item, index) => {
      if (index % step !== 0 && index !== this.data.length - 1) return;

      const x = xScale(index);
      const y = height - padding.bottom + 25;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', 'Quicksand, sans-serif');
      text.setAttribute('fill', '#E8D4FF');
      text.textContent = this.formatLabel(item.label);
      xAxisGroup.appendChild(text);
    });

    this.svg.appendChild(xAxisGroup);
  }

  /**
   * 繪製 Y 軸標籤
   */
  renderYAxis(yScale, maxValue) {
    const { padding } = this.options;
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxisGroup.classList.add('y-axis');

    for (let i = 0; i <= 4; i++) {
      const value = (maxValue / 4) * i;
      const y = yScale(value);
      const x = padding.left - 15;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 5);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'Nunito, sans-serif');
      text.setAttribute('fill', '#D4BAFF');
      text.textContent = this.formatCurrency(value);
      yAxisGroup.appendChild(text);
    }

    this.svg.appendChild(yAxisGroup);
  }

  /**
   * 繪製長條
   */
  renderBars(xScale, yScale, barWidth, legends) {
    const { padding, height } = this.options;
    const bottomY = height - padding.bottom;
    const groupCount = legends.length;

    this.data.forEach((item, dataIndex) => {
      const centerX = xScale(dataIndex);

      item.values.forEach((value, barIndex) => {
        if (value === undefined || value === null) return;

        const color = this.options.colors[barIndex % this.options.colors.length];

        // 計算長條位置（群組內排列）
        const offsetX = (barIndex - (groupCount - 1) / 2) * barWidth;
        const x = centerX + offsetX - barWidth / 2;
        const y = yScale(value);
        const barHeight = bottomY - y;

        // 建立長條群組
        const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        barGroup.classList.add('bar-group');
        barGroup.dataset.dataIndex = dataIndex;
        barGroup.dataset.barIndex = barIndex;

        // 長條漸層
        const gradientId = `barGradient-${dataIndex}-${barIndex}`;
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradientId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        gradient.innerHTML = `
          <stop offset="0%" style="stop-color:${this.lightenColor(color, 20)};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
        `;
        this.svg.querySelector('defs').appendChild(gradient);

        // 繪製長條
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', `url(#${gradientId})`);
        rect.setAttribute('rx', '6');
        rect.setAttribute('ry', '6');
        rect.classList.add('bar');
        rect.dataset.label = item.label;
        rect.dataset.legend = legends[barIndex];
        rect.dataset.value = value;
        rect.style.cursor = 'pointer';
        rect.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';

        // 光澤效果
        const shine = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shine.setAttribute('x', x + 2);
        shine.setAttribute('y', y + 2);
        shine.setAttribute('width', barWidth - 4);
        shine.setAttribute('height', Math.max(barHeight / 3, 10));
        shine.setAttribute('fill', 'rgba(255, 255, 255, 0.4)');
        shine.setAttribute('rx', '4');
        shine.setAttribute('ry', '4');
        shine.style.pointerEvents = 'none';

        // 懸停效果（桌面）
        rect.addEventListener('mouseenter', (e) => {
          rect.style.opacity = '0.85';
          rect.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))';
          this.showTooltip(e);
        });
        rect.addEventListener('mouseleave', () => {
          rect.style.opacity = '1';
          rect.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';
          this.hideTooltip();
        });

        // 觸控效果（移動端）v5.9.0 新增
        let touchTimer = null;
        rect.addEventListener('touchstart', (e) => {
          e.preventDefault();
          // 長按 500ms 顯示 tooltip
          touchTimer = setTimeout(() => {
            rect.style.opacity = '0.85';
            rect.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))';
            this.showTooltip({ target: rect });
            this.currentTouchBar = rect;
          }, 500);
        });
        rect.addEventListener('touchend', (e) => {
          e.preventDefault();
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
          rect.style.opacity = '1';
          rect.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';
        });
        rect.addEventListener('touchcancel', (e) => {
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
          rect.style.opacity = '1';
          rect.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';
        });

        barGroup.appendChild(rect);
        barGroup.appendChild(shine);

        // 數值標籤（可選）
        if (this.options.showValues && barHeight > 25) {
          const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          valueText.setAttribute('x', x + barWidth / 2);
          valueText.setAttribute('y', y + barHeight / 2 + 4);
          valueText.setAttribute('text-anchor', 'middle');
          valueText.setAttribute('font-size', '11');
          valueText.setAttribute('font-family', 'Nunito, sans-serif');
          valueText.setAttribute('font-weight', 'bold');
          valueText.setAttribute('fill', '#FFFFFF');
          valueText.textContent = this.formatShortCurrency(value);
          valueText.style.pointerEvents = 'none';
          barGroup.appendChild(valueText);
        }

        this.svg.appendChild(barGroup);
      });
    });
  }

  /**
   * 繪製圖例
   */
  renderLegends(legends) {
    if (!legends || legends.length === 0) return;

    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendGroup.classList.add('legends');

    const startX = this.options.padding.left;
    const startY = 15;
    let currentX = startX;

    legends.forEach((legend, index) => {
      const color = this.options.colors[index % this.options.colors.length];

      // 圖例矩形
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', currentX);
      rect.setAttribute('y', startY - 6);
      rect.setAttribute('width', '12');
      rect.setAttribute('height', '12');
      rect.setAttribute('rx', '3');
      rect.setAttribute('fill', color);
      legendGroup.appendChild(rect);

      // 圖例文字
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', currentX + 18);
      text.setAttribute('y', startY + 4);
      text.setAttribute('font-size', '13');
      text.setAttribute('font-family', 'Quicksand, sans-serif');
      text.setAttribute('fill', '#E8D4FF');
      text.textContent = legend;
      legendGroup.appendChild(text);

      currentX += text.getComputedTextLength() + 35;
    });

    this.svg.appendChild(legendGroup);
  }

  /**
   * 建立 Tooltip
   */
  createTooltip(wrapper) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'vbar-tooltip hidden absolute z-50 bg-white rounded-xl shadow-xl p-3 pointer-events-none';
    this.tooltip.style.cssText = `
      transition: opacity 150ms ease, transform 150ms ease;
      opacity: 0;
      transform: translateY(5px);
      border: 2px solid #D4A5FF;
      font-family: 'Quicksand', sans-serif;
      font-size: 13px;
      min-width: 120px;
    `;
    wrapper.appendChild(this.tooltip);
  }

  /**
   * 顯示 Tooltip
   */
  showTooltip(event) {
    const bar = event.target;
    const { label, legend, value } = bar.dataset;

    this.tooltip.innerHTML = `
      <div class="font-bold text-purple-600 mb-1">${this.formatLabel(label)}</div>
      <div class="text-gray-700">
        <span class="font-medium">${legend}:</span>
        <span class="text-pink-500 font-bold ml-1">$${parseInt(value).toLocaleString()}</span>
      </div>
    `;

    const rect = bar.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top - 10;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    this.tooltip.style.transform = 'translate(-50%, -100%)';
    this.tooltip.classList.remove('hidden');
    this.tooltip.style.opacity = '1';
  }

  /**
   * 隱藏 Tooltip
   */
  hideTooltip() {
    this.tooltip.style.opacity = '0';
    setTimeout(() => this.tooltip.classList.add('hidden'), 150);
  }

  /**
   * 動畫效果
   */
  animateChart() {
    const bars = this.svg.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
      const originalHeight = bar.getAttribute('height');
      const y = bar.getAttribute('y');

      bar.setAttribute('height', '0');
      bar.setAttribute('y', parseFloat(y) + parseFloat(originalHeight));

      setTimeout(() => {
        bar.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        bar.setAttribute('height', originalHeight);
        bar.setAttribute('y', y);
      }, index * 30);
    });
  }

  /**
   * 顏色加亮
   */
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
  }

  /**
   * 格式化標籤
   */
  formatLabel(label) {
    if (label.includes('W')) {
      return label.replace('W', '第') + '週';
    } else if (label.length === 7) {
      return label.substring(5) + '月';
    } else if (label.length === 10) {
      return label.substring(5, 10).replace('-', '/');
    }
    return label;
  }

  /**
   * 格式化金額
   */
  formatCurrency(value) {
    if (value === 0) return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
  }

  /**
   * 格式化短金額
   */
  formatShortCurrency(value) {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
  }

  /**
   * 綁定全域觸控事件（v5.9.0 新增）
   * 用於點擊外部區域關閉 tooltip
   */
  bindGlobalTouchEvents() {
    const handleOutsideClick = (e) => {
      // 如果點擊的不是長條且 tooltip 正在顯示
      if (this.currentTouchBar && !e.target.classList.contains('bar')) {
        this.hideTooltip();
        // 恢復長條樣式
        if (this.currentTouchBar) {
          this.currentTouchBar.style.opacity = '1';
          this.currentTouchBar.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';
        }
        this.currentTouchBar = null;
      }
    };

    // 綁定到 document（點擊或觸控）
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    // 儲存解除綁定的函數（以便之後清理）
    this.globalEventCleanup = () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }

  /**
   * 清理資源（v5.9.0 新增）
   */
  destroy() {
    if (this.globalEventCleanup) {
      this.globalEventCleanup();
    }
  }
}

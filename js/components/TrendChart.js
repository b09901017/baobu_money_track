/**
 * TrendChart.js - 趨勢折線圖組件（童話風格）
 * 支援多條折線對比、漸層填充、懸停互動
 */

export default class TrendChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 300,
      padding: options.padding || { top: 30, right: 40, bottom: 50, left: 60 },
      colors: options.colors || ['#FFB5D8', '#D4A5FF', '#A8D8FF', '#B8F0D8'],
      smooth: options.smooth !== false, // 平滑曲線
      showGrid: options.showGrid !== false, // 顯示網格線
      showPoints: options.showPoints !== false, // 顯示數據點
      showArea: options.showArea !== false, // 填充區域漸層
      animate: options.animate !== false, // 動畫效果
      ...options,
    };

    this.svg = null;
    this.data = [];
    this.tooltip = null;
    this.currentTouchPoint = null; // v5.9.0 新增：追蹤當前觸控的點
  }

  /**
   * 渲染折線圖
   * @param {Array} data - 資料格式: [{ label: '2024-01', values: [100, 200, 150] }, ...]
   * @param {Array} legends - 圖例: ['寶寶', '步步', '總花費']
   */
  render(data, legends = []) {
    if (!data || data.length === 0) {
      this.container.innerHTML = '<div class="text-center py-12 text-gray-400">📊 暫無趨勢資料</div>';
      return;
    }

    this.data = data;
    this.legends = legends;

    // 清空容器
    this.container.innerHTML = '';

    // 建立 SVG 容器
    const wrapper = document.createElement('div');
    wrapper.className = 'trend-chart-wrapper relative';
    this.container.appendChild(wrapper);

    // 建立 SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', this.options.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    this.svg.classList.add('trend-chart-svg');
    wrapper.appendChild(this.svg);

    // 計算資料範圍
    const { xScale, yScale, maxValue } = this.calculateScales();

    // 繪製背景裝飾
    this.renderBackground();

    // 繪製網格線
    if (this.options.showGrid) {
      this.renderGrid(yScale);
    }

    // 繪製 X 軸標籤
    this.renderXAxis(xScale);

    // 繪製 Y 軸標籤
    this.renderYAxis(yScale, maxValue);

    // 繪製趨勢線（多條）
    legends.forEach((legend, index) => {
      this.renderLine(xScale, yScale, index, legend);
    });

    // 繪製圖例
    this.renderLegends(legends);

    // 建立 Tooltip
    this.createTooltip(wrapper);

    // 綁定全域點擊事件（移動端關閉 tooltip）v5.9.0 新增
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

    // 計算最大值（所有 values 的最大值）
    let maxValue = 0;
    this.data.forEach(item => {
      item.values.forEach(val => {
        if (val > maxValue) maxValue = val;
      });
    });
    maxValue = Math.ceil(maxValue * 1.1); // 增加 10% 留白

    // X 軸比例（線性分佈）
    const xScale = (index) => {
      return padding.left + (chartWidth / (this.data.length - 1)) * index;
    };

    // Y 軸比例（從下往上）
    const yScale = (value) => {
      return padding.top + chartHeight - (value / maxValue) * chartHeight;
    };

    return { xScale, yScale, maxValue, chartWidth, chartHeight };
  }

  /**
   * 繪製背景裝飾（童話風格）
   */
  renderBackground() {
    const { width, height } = this.options;

    // 漸層背景
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // 背景漸層
    const bgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    bgGradient.setAttribute('id', 'trendBgGradient');
    bgGradient.setAttribute('x1', '0%');
    bgGradient.setAttribute('y1', '0%');
    bgGradient.setAttribute('x2', '0%');
    bgGradient.setAttribute('y2', '100%');
    bgGradient.innerHTML = `
      <stop offset="0%" style="stop-color:#FFF5FB;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:0.3" />
    `;
    defs.appendChild(bgGradient);

    this.svg.appendChild(defs);

    // 背景矩形
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', width);
    bgRect.setAttribute('height', height);
    bgRect.setAttribute('fill', 'url(#trendBgGradient)');
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
      { x: 30, y: 20, r: 4, color: '#FFB5D8', opacity: 0.3 },
      { x: 750, y: 30, r: 6, color: '#D4A5FF', opacity: 0.25 },
      { x: 60, y: 270, r: 5, color: '#A8D8FF', opacity: 0.3 },
      { x: 720, y: 260, r: 4, color: '#B8F0D8', opacity: 0.35 },
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

    // 繪製 5 條橫向網格線
    for (let i = 0; i <= 4; i++) {
      const y = yScale((this.calculateScales().maxValue / 4) * i);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#E8D4FF');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4 4');
      line.setAttribute('opacity', '0.4');
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

    // 限制顯示標籤數量（避免擁擠）
    const maxLabels = 10;
    const step = Math.ceil(this.data.length / maxLabels);

    this.data.forEach((item, index) => {
      if (index % step !== 0 && index !== this.data.length - 1) return;

      const x = xScale(index);
      const y = height - padding.bottom + 25;

      // 標籤文字
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', 'Quicksand, sans-serif');
      text.setAttribute('fill', '#9D7FB8');
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

    // 繪製 5 個刻度
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
      text.setAttribute('fill', '#B399CC');
      text.textContent = this.formatCurrency(value);
      yAxisGroup.appendChild(text);
    }

    this.svg.appendChild(yAxisGroup);
  }

  /**
   * 繪製趨勢線
   */
  renderLine(xScale, yScale, lineIndex, legend) {
    const color = this.options.colors[lineIndex % this.options.colors.length];
    const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    lineGroup.classList.add('trend-line-group');
    lineGroup.dataset.lineIndex = lineIndex;

    // 建立漸層定義（用於填充區域）
    if (this.options.showArea) {
      const gradientId = `areaGradient-${lineIndex}`;
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '0%');
      gradient.setAttribute('y2', '100%');
      gradient.innerHTML = `
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
      `;
      this.svg.querySelector('defs').appendChild(gradient);

      // 繪製填充區域
      const areaPath = this.createAreaPath(xScale, yScale, lineIndex);
      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaPath);
      area.setAttribute('fill', `url(#${gradientId})`);
      area.classList.add('trend-area');
      lineGroup.appendChild(area);
    }

    // 繪製折線
    const linePath = this.createLinePath(xScale, yScale, lineIndex);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', linePath);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.classList.add('trend-line');
    path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
    lineGroup.appendChild(path);

    // 繪製數據點
    if (this.options.showPoints) {
      this.data.forEach((item, index) => {
        const value = item.values[lineIndex];
        if (value === undefined || value === null) return;

        const cx = xScale(index);
        const cy = yScale(value);

        // 外圈（光暈）
        const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerCircle.setAttribute('cx', cx);
        outerCircle.setAttribute('cy', cy);
        outerCircle.setAttribute('r', '6');
        outerCircle.setAttribute('fill', color);
        outerCircle.setAttribute('opacity', '0.3');
        outerCircle.classList.add('trend-point-outer');
        lineGroup.appendChild(outerCircle);

        // 內圈（實心）
        const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerCircle.setAttribute('cx', cx);
        innerCircle.setAttribute('cy', cy);
        innerCircle.setAttribute('r', '4');
        innerCircle.setAttribute('fill', color);
        innerCircle.setAttribute('stroke', '#FFFFFF');
        innerCircle.setAttribute('stroke-width', '2');
        innerCircle.classList.add('trend-point');
        innerCircle.dataset.index = index;
        innerCircle.dataset.lineIndex = lineIndex;
        innerCircle.dataset.value = value;
        innerCircle.dataset.label = item.label;
        innerCircle.dataset.legend = legend;
        innerCircle.style.cursor = 'pointer';

        // 懸停效果（桌面）
        innerCircle.addEventListener('mouseenter', (e) => this.showTooltip(e));
        innerCircle.addEventListener('mouseleave', () => this.hideTooltip());

        // 觸控效果（移動端）v5.9.0 新增
        let touchTimer = null;
        innerCircle.addEventListener('touchstart', (e) => {
          e.preventDefault();
          // 長按 500ms 顯示 tooltip
          touchTimer = setTimeout(() => {
            this.showTooltip({ target: innerCircle });
            this.currentTouchPoint = innerCircle;
          }, 500);
        });
        innerCircle.addEventListener('touchend', (e) => {
          e.preventDefault();
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
        });
        innerCircle.addEventListener('touchcancel', (e) => {
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
        });

        lineGroup.appendChild(innerCircle);
      });
    }

    this.svg.appendChild(lineGroup);
  }

  /**
   * 建立折線路徑（支援平滑曲線）
   */
  createLinePath(xScale, yScale, lineIndex) {
    let path = '';
    const points = [];

    this.data.forEach((item, index) => {
      const value = item.values[lineIndex];
      if (value === undefined || value === null) return;
      points.push({ x: xScale(index), y: yScale(value) });
    });

    if (points.length === 0) return '';

    if (this.options.smooth) {
      // 平滑曲線（使用貝茲曲線）
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cp1y = points[i].y;
        const cp2x = points[i].x + (points[i + 1].x - points[i].x) * 2 / 3;
        const cp2y = points[i + 1].y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
      }
    } else {
      // 直線
      path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }

    return path;
  }

  /**
   * 建立填充區域路徑
   */
  createAreaPath(xScale, yScale, lineIndex) {
    const { padding, height } = this.options;
    const bottomY = height - padding.bottom;
    let path = '';
    const points = [];

    this.data.forEach((item, index) => {
      const value = item.values[lineIndex];
      if (value === undefined || value === null) return;
      points.push({ x: xScale(index), y: yScale(value) });
    });

    if (points.length === 0) return '';

    // 從左下角開始
    path = `M ${points[0].x} ${bottomY}`;
    path += ` L ${points[0].x} ${points[0].y}`;

    // 繪製上邊緣（使用平滑曲線）
    if (this.options.smooth) {
      for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cp1y = points[i].y;
        const cp2x = points[i].x + (points[i + 1].x - points[i].x) * 2 / 3;
        const cp2y = points[i + 1].y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i + 1].x} ${points[i + 1].y}`;
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // 回到右下角並閉合
    path += ` L ${points[points.length - 1].x} ${bottomY} Z`;

    return path;
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

      // 圖例圓點
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', currentX);
      circle.setAttribute('cy', startY);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', color);
      legendGroup.appendChild(circle);

      // 圖例文字
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', currentX + 10);
      text.setAttribute('y', startY + 4);
      text.setAttribute('font-size', '13');
      text.setAttribute('font-family', 'Quicksand, sans-serif');
      text.setAttribute('fill', '#6B5B7D');
      text.textContent = legend;
      legendGroup.appendChild(text);

      // 計算下一個圖例的起始位置
      currentX += text.getComputedTextLength() + 30;
    });

    this.svg.appendChild(legendGroup);
  }

  /**
   * 建立 Tooltip
   */
  createTooltip(wrapper) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'trend-tooltip hidden absolute z-50 bg-white rounded-xl shadow-xl p-3 pointer-events-none';
    this.tooltip.style.cssText = `
      transition: opacity 150ms ease, transform 150ms ease;
      opacity: 0;
      transform: translateY(5px);
      border: 2px solid #FFB5D8;
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
    const circle = event.target;
    const { label, legend, value } = circle.dataset;

    this.tooltip.innerHTML = `
      <div class="font-bold text-purple-600 mb-1">${this.formatLabel(label)}</div>
      <div class="text-gray-700">
        <span class="font-medium">${legend}:</span>
        <span class="text-pink-500 font-bold ml-1">$${parseInt(value).toLocaleString()}</span>
      </div>
    `;

    // 計算位置
    const rect = circle.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top - 10;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    this.tooltip.style.transform = 'translate(-50%, -100%)';
    this.tooltip.classList.remove('hidden');
    this.tooltip.style.opacity = '1';

    // 放大數據點
    circle.setAttribute('r', '5');
    circle.style.filter = 'drop-shadow(0 4px 8px rgba(255, 181, 216, 0.5))';
  }

  /**
   * 隱藏 Tooltip
   */
  hideTooltip() {
    this.tooltip.style.opacity = '0';
    this.tooltip.style.transform = 'translate(-50%, calc(-100% + 5px))';
    setTimeout(() => this.tooltip.classList.add('hidden'), 150);

    // 恢復數據點大小
    this.svg.querySelectorAll('.trend-point').forEach(point => {
      point.setAttribute('r', '4');
      point.style.filter = '';
    });
  }

  /**
   * 動畫效果
   */
  animateChart() {
    const lines = this.svg.querySelectorAll('.trend-line');
    lines.forEach((line, index) => {
      const length = line.getTotalLength();
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
      line.style.animation = `drawLine 1s ease-out ${index * 0.2}s forwards`;
    });

    const points = this.svg.querySelectorAll('.trend-point');
    points.forEach((point, index) => {
      point.style.opacity = '0';
      point.style.transform = 'scale(0)';
      point.style.animation = `popIn 0.3s ease-out ${0.5 + index * 0.03}s forwards`;
    });
  }

  /**
   * 格式化標籤
   */
  formatLabel(label) {
    // 根據標籤格式判斷（YYYY-MM-DD、YYYY-MM、YYYY-Wxx）
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
   * 綁定全域觸控事件（v5.9.0 新增）
   * 用於點擊外部區域關閉 tooltip
   */
  bindGlobalTouchEvents() {
    const handleOutsideClick = (e) => {
      // 如果點擊的不是數據點且 tooltip 正在顯示
      if (this.currentTouchPoint && !e.target.classList.contains('trend-point')) {
        this.hideTooltip();
        this.currentTouchPoint = null;
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

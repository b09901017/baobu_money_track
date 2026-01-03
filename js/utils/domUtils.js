// ==================== DOM 工具函數 ====================

/**
 * 切換元素的 class
 * @param {HTMLElement} element - DOM 元素
 * @param {string|string[]} classes - 要切換的 class（可以是單個或陣列）
 */
export function toggleClass(element, classes) {
    if (!element) return;

    if (Array.isArray(classes)) {
        classes.forEach(cls => element.classList.toggle(cls));
    } else {
        element.classList.toggle(classes);
    }
}

/**
 * 隱藏元素
 * @param {HTMLElement} element - DOM 元素
 */
export function hideElement(element) {
    if (!element) return;
    element.classList.add('hidden');
}

/**
 * 顯示元素
 * @param {HTMLElement} element - DOM 元素
 */
export function showElement(element) {
    if (!element) return;
    element.classList.remove('hidden');
}

/**
 * 設定一組元素中的激活狀態
 * @param {NodeList|HTMLElement[]} elements - 元素列表
 * @param {HTMLElement} activeElement - 要激活的元素
 * @param {string} activeClass - 激活的 class 名稱（預設：'active'）
 */
export function setActive(elements, activeElement, activeClass = 'active') {
    if (!elements || !activeElement) return;

    elements.forEach(el => el.classList.remove(activeClass));
    activeElement.classList.add(activeClass);
}

/**
 * 清空元素內容
 * @param {HTMLElement} element - DOM 元素
 */
export function clearElement(element) {
    if (!element) return;
    element.innerHTML = '';
}

/**
 * 為元素設定屬性
 * @param {HTMLElement} element - DOM 元素
 * @param {Object} attributes - 屬性物件
 */
export function setAttributes(element, attributes) {
    if (!element || !attributes) return;

    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
}

/**
 * 建立元素並設定屬性
 * @param {string} tag - 標籤名稱
 * @param {Object} options - 選項 { className, textContent, innerHTML, attributes }
 * @returns {HTMLElement} - 建立的元素
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    if (options.attributes) setAttributes(element, options.attributes);

    return element;
}

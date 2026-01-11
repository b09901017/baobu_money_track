/**
 * 自訂對話框組件 - 童話風格
 * 用於替代原生的 prompt 和 alert
 */

class CustomDialog {
    constructor() {
        this.promptModal = null;
        this.alertModal = null;
        this.promptResolve = null;
        this.alertResolve = null;
    }

    /**
     * 初始化對話框
     */
    init() {
        // Prompt 模態框元素
        this.promptModal = document.getElementById('customPromptModal');
        this.promptOverlay = document.getElementById('customPromptOverlay');
        this.promptTitle = document.getElementById('customPromptTitle');
        this.promptMessage = document.getElementById('customPromptMessage');
        this.promptInput = document.getElementById('customPromptInput');
        this.promptCancel = document.getElementById('customPromptCancel');
        this.promptConfirm = document.getElementById('customPromptConfirm');

        // Alert 模態框元素
        this.alertModal = document.getElementById('customAlertModal');
        this.alertOverlay = document.getElementById('customAlertOverlay');
        this.alertTitle = document.getElementById('customAlertTitle');
        this.alertMessage = document.getElementById('customAlertMessage');
        this.alertIcon = document.getElementById('customAlertIcon');
        this.alertConfirm = document.getElementById('customAlertConfirm');

        // 綁定事件
        this.bindEvents();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // Prompt 模態框事件
        this.promptCancel?.addEventListener('click', () => this.closePrompt(null));
        this.promptOverlay?.addEventListener('click', () => this.closePrompt(null));
        this.promptConfirm?.addEventListener('click', () => {
            const value = this.promptInput.value.trim();
            this.closePrompt(value);
        });

        // 按 Enter 鍵確認
        this.promptInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = this.promptInput.value.trim();
                this.closePrompt(value);
            }
        });

        // Alert 模態框事件
        this.alertConfirm?.addEventListener('click', () => this.closeAlert());
        this.alertOverlay?.addEventListener('click', () => this.closeAlert());
    }

    /**
     * 顯示輸入框 (替代 prompt)
     * @param {string} message - 提示訊息
     * @param {string} defaultValue - 預設值
     * @param {string} title - 標題
     * @returns {Promise<string|null>} 用戶輸入的值或 null
     */
    prompt(message, defaultValue = '', title = '請輸入') {
        return new Promise((resolve) => {
            this.promptResolve = resolve;

            // 設定內容
            this.promptTitle.textContent = title;
            this.promptMessage.textContent = message;
            this.promptInput.value = defaultValue;
            this.promptInput.placeholder = message;

            // 顯示模態框
            this.promptModal.classList.remove('hidden');

            // 自動聚焦並選取
            setTimeout(() => {
                this.promptInput.focus();
                this.promptInput.select();
            }, 100);
        });
    }

    /**
     * 關閉輸入框
     * @param {string|null} value - 返回值
     */
    closePrompt(value) {
        this.promptModal.classList.add('hidden');
        this.promptInput.value = '';

        if (this.promptResolve) {
            this.promptResolve(value);
            this.promptResolve = null;
        }
    }

    /**
     * 顯示通知框 (替代 alert)
     * @param {string} message - 訊息內容
     * @param {string} title - 標題
     * @param {string} icon - 圖標 (emoji)
     * @returns {Promise<void>}
     */
    alert(message, title = '通知', icon = '💫') {
        return new Promise((resolve) => {
            this.alertResolve = resolve;

            // 設定內容
            this.alertTitle.textContent = title;
            this.alertMessage.textContent = message;
            this.alertIcon.textContent = icon;

            // 根據訊息內容自動判斷圖標
            if (!icon || icon === '💫') {
                if (message.includes('成功') || message.includes('✨') || message.includes('已')) {
                    this.alertIcon.textContent = '✨';
                } else if (message.includes('失敗') || message.includes('錯誤') || message.includes('❌')) {
                    this.alertIcon.textContent = '⚠️';
                } else if (message.includes('!') || message.includes('！')) {
                    this.alertIcon.textContent = '💡';
                } else {
                    this.alertIcon.textContent = '💫';
                }
            }

            // 顯示模態框
            this.alertModal.classList.remove('hidden');

            // 自動聚焦確認按鈕
            setTimeout(() => {
                this.alertConfirm.focus();
            }, 100);
        });
    }

    /**
     * 關閉通知框
     */
    closeAlert() {
        this.alertModal.classList.add('hidden');

        if (this.alertResolve) {
            this.alertResolve();
            this.alertResolve = null;
        }
    }

    /**
     * 成功通知 (快捷方法)
     * @param {string} message - 訊息內容
     */
    success(message) {
        return this.alert(message, '成功', '✨');
    }

    /**
     * 錯誤通知 (快捷方法)
     * @param {string} message - 訊息內容
     */
    error(message) {
        return this.alert(message, '錯誤', '⚠️');
    }

    /**
     * 資訊通知 (快捷方法)
     * @param {string} message - 訊息內容
     */
    info(message) {
        return this.alert(message, '提示', '💡');
    }

    /**
     * 確認對話框 (是/否選擇)
     * @param {string} message - 訊息內容
     * @param {Object} options - 選項 { confirmText: string, cancelText: string, title: string }
     * @returns {Promise<boolean>} true=確認, false=取消
     */
    confirm(message, options = {}) {
        const {
            confirmText = '確認',
            cancelText = '取消',
            title = '請確認'
        } = options;

        return new Promise((resolve) => {
            this.promptResolve = (value) => {
                resolve(value === true);
            };

            // 設定內容
            this.promptTitle.textContent = title;
            this.promptMessage.textContent = message;

            // 隱藏輸入框
            this.promptInput.style.display = 'none';

            // 更新按鈕文字
            this.promptConfirm.textContent = confirmText;
            this.promptCancel.textContent = cancelText;

            // 顯示模態框
            this.promptModal.classList.remove('hidden');

            // 臨時更改確認按鈕行為
            const confirmHandler = () => {
                this.closePromptConfirm(true);
            };
            const cancelHandler = () => {
                this.closePromptConfirm(false);
            };

            // 移除舊的事件監聽器並新增臨時的
            this.promptConfirm.removeEventListener('click', this._originalConfirmHandler);
            this.promptCancel.removeEventListener('click', this._originalCancelHandler);

            this.promptConfirm.addEventListener('click', confirmHandler, { once: true });
            this.promptCancel.addEventListener('click', cancelHandler, { once: true });
            this.promptOverlay.addEventListener('click', cancelHandler, { once: true });

            // 儲存原始處理器以便恢復
            this._originalConfirmHandler = () => {
                const value = this.promptInput.value.trim();
                this.closePrompt(value);
            };
            this._originalCancelHandler = () => this.closePrompt(null);
        });
    }

    /**
     * 關閉確認對話框
     * @param {boolean} result - 確認結果
     */
    closePromptConfirm(result) {
        this.promptModal.classList.add('hidden');

        // 恢復輸入框顯示
        this.promptInput.style.display = '';

        // 恢復按鈕文字
        this.promptConfirm.textContent = '確認';
        this.promptCancel.textContent = '取消';

        // 恢復原始事件處理器
        this.promptConfirm.addEventListener('click', this._originalConfirmHandler);
        this.promptCancel.addEventListener('click', this._originalCancelHandler);

        if (this.promptResolve) {
            this.promptResolve(result);
            this.promptResolve = null;
        }
    }
}

// 創建全域單例
const customDialog = new CustomDialog();

// 匯出
export default customDialog;

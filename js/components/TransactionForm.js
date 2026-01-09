// ==================== 交易表單組件 ====================
// 來源: app.js 行 1258-1407
// 負責記帳表單的操作

export class TransactionForm {
    constructor(state, onSubmitCallback) {
        this.state = state;
        this.onSubmitCallback = onSubmitCallback;

        this.sheet = document.getElementById('addTransactionSheet');
        this.form = document.getElementById('transactionForm');
        this.selectedPhoto = null;  // 儲存選中的照片檔案
        this.editingTransactionId = null;  // 編輯模式下的交易 ID
        this.editingTransaction = null;  // 編輯模式下的交易資料
        this.backButtonUnregister = null;  // 返回鍵取消註冊函數

        // 拖曳相關狀態
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        this.sheetContent = null;

        // 初始化拖曳功能
        this.initDragHandlers();
    }

    /**
     * 初始化拖曳事件處理
     */
    initDragHandlers() {
        const dragHandle = document.getElementById('btnCloseSheet');
        if (!dragHandle) return;

        this.sheetContent = this.sheet?.querySelector('.bottom-sheet-content');
        if (!this.sheetContent) return;

        // 觸控開始
        dragHandle.addEventListener('touchstart', (e) => {
            if (!this.sheet.classList.contains('active')) return;

            this.isDragging = true;
            this.startY = e.touches[0].clientY;
            this.currentY = this.startY;

            // 移除所有動畫類別，準備拖曳
            this.sheetContent.classList.remove('snapping-back', 'closing');
            this.sheetContent.style.transition = 'none';
        }, { passive: true });

        // 觸控移動
        dragHandle.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            this.currentY = e.touches[0].clientY;
            const deltaY = this.currentY - this.startY;

            // 只允許向下拖曳，向上拖曳則有阻力
            let translateY = 0;
            if (deltaY > 0) {
                // 向下拖曳：直接移動
                translateY = deltaY;
            } else {
                // 向上拖曳：添加阻力（減少到 20%）
                translateY = deltaY * 0.2;
            }

            // 即時更新位置
            this.sheetContent.style.transform = `translateX(-50%) translateY(${translateY}px)`;

            // 根據拖曳距離調整背景透明度
            const opacity = Math.max(0.3, 1 - (Math.abs(deltaY) / window.innerHeight));
            const overlay = this.sheet.querySelector('.bottom-sheet-overlay');
            if (overlay) {
                overlay.style.opacity = opacity;
            }
        }, { passive: true });

        // 觸控結束
        const handleTouchEnd = () => {
            if (!this.isDragging) return;

            const deltaY = this.currentY - this.startY;
            const threshold = window.innerHeight * 0.3; // 30% 的高度作為閾值

            if (deltaY > threshold) {
                // 向下拖曳超過閾值：關閉表單
                this.closeWithAnimation();
            } else {
                // 未超過閾值：回彈
                this.snapBack(deltaY);
            }

            this.isDragging = false;
        };

        dragHandle.addEventListener('touchend', handleTouchEnd, { passive: true });
        dragHandle.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    /**
     * 帶動畫的關閉
     */
    closeWithAnimation() {
        this.sheetContent.style.transition = '';
        this.sheetContent.style.transform = '';
        this.sheetContent.classList.add('closing');

        // 恢復背景透明度
        const overlay = this.sheet.querySelector('.bottom-sheet-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.6s ease';
            overlay.style.opacity = '0';
        }

        // 等待動畫結束後真正關閉
        setTimeout(() => {
            this.close();
            this.sheetContent.classList.remove('closing');
            if (overlay) {
                overlay.style.transition = '';
                overlay.style.opacity = '';
            }
        }, 600); // 配合 slideDownOut 動畫時間（0.6 秒）
    }

    /**
     * 回彈動畫
     */
    snapBack(deltaY) {
        // 設定 CSS 變數，讓動畫知道從哪個位置開始
        this.sheetContent.style.setProperty('--drag-y', `${deltaY}px`);
        this.sheetContent.style.transition = '';
        this.sheetContent.style.transform = '';
        this.sheetContent.classList.add('snapping-back');

        // 恢復背景透明度
        const overlay = this.sheet.querySelector('.bottom-sheet-overlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            overlay.style.opacity = '';
        }

        // 動畫結束後移除類別
        setTimeout(() => {
            this.sheetContent.classList.remove('snapping-back');
            this.sheetContent.style.removeProperty('--drag-y');
            if (overlay) {
                overlay.style.transition = '';
            }
        }, 800); // 配合 snapBackBounce 動畫時間（0.8 秒）
    }

    /**
     * 開啟表單
     * @param {Object|null} transaction - 要編輯的交易資料（null 表示新增模式）
     */
    open(transaction = null) {
        console.log('🔓 TransactionForm.open() 被呼叫', transaction ? '(編輯模式)' : '(新增模式)');
        console.log('Sheet 元素:', this.sheet);

        if (!this.sheet) {
            console.error('❌ Sheet 元素不存在');
            return;
        }

        // 移除 hidden class 並添加 active class
        this.sheet.classList.remove('hidden');
        this.sheet.classList.add('active');
        console.log('✅ Sheet 已顯示');

        // 添加開啟動畫類別
        if (this.sheetContent) {
            this.sheetContent.classList.add('opening');
            // 動畫結束後移除類別，避免重複播放
            setTimeout(() => {
                this.sheetContent.classList.remove('opening');
            }, 800); // 配合動畫時間
        }

        // 註冊返回鍵處理
        if (window.BackButtonHandler) {
            this.backButtonUnregister = window.BackButtonHandler.register(
                'TransactionForm',
                () => this.close()
            );
        }

        // 重置表單（會同時設置今天日期）
        this.reset();

        // 如果是編輯模式，填充表單資料
        if (transaction) {
            this.editingTransactionId = transaction.id;
            this.editingTransaction = transaction;
            this.fillFormWithTransaction(transaction);

            // 更改提交按鈕文字
            const submitBtn = this.form?.querySelector('[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '💾 保存修改';
            }
        }

        // 渲染自訂分類
        this.renderCustomCategories();

        // 自動 focus 金額欄位（延遲執行以確保動畫完成後才 focus）
        setTimeout(() => {
            const amountInput = document.getElementById('transactionAmount');
            if (amountInput) {
                amountInput.focus();
                // 行動裝置上自動打開鍵盤
                if (window.Capacitor) {
                    amountInput.click();
                }
            }
        }, 800); // 配合 slideUpBounce 動畫時間（0.8 秒）
    }

    /**
     * 關閉表單
     */
    close() {
        // 取消註冊返回鍵處理
        if (this.backButtonUnregister) {
            this.backButtonUnregister();
            this.backButtonUnregister = null;
        }

        if (this.sheet) {
            this.sheet.classList.remove('active');
            this.sheet.classList.add('hidden');
        }
    }

    /**
     * 重置表單
     */
    reset() {
        if (this.form) {
            this.form.reset();
        }

        // 設定今天日期
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }

        this.state.selectedCategories = [];
        this.selectedPhoto = null;  // 清除選中的照片
        this.editingTransactionId = null;  // 清除編輯狀態
        this.editingTransaction = null;

        // 重置提交按鈕文字
        const submitBtn = this.form?.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '✨ 記入日記';
        }

        // 重置分類選擇視覺效果
        document.querySelectorAll('.tag-btn > div').forEach(div => {
            div.classList.remove('active');
        });

        // 清除照片預覽
        this.clearPhotoPreview();
    }

    /**
     * 填充表單資料（編輯模式）
     * @param {Object} transaction - 交易資料
     */
    fillFormWithTransaction(transaction) {
        // 填充金額
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.value = transaction.amount;
        }

        // 填充項目名稱
        const itemNameInput = document.getElementById('itemName');
        if (itemNameInput) {
            itemNameInput.value = transaction.item_name || '';
        }

        // 填充日期
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = transaction.date;
        }

        // 填充備註
        const noteInput = document.getElementById('note');
        if (noteInput) {
            noteInput.value = transaction.note || '';
        }

        // 選擇付款人
        const payerRadio = document.querySelector(`input[name="payer"][value="${transaction.payer}"]`);
        if (payerRadio) {
            payerRadio.checked = true;
        }

        // 選擇受益人
        const beneficiaryRadio = document.querySelector(`input[name="beneficiary"][value="${transaction.beneficiary}"]`);
        if (beneficiaryRadio) {
            beneficiaryRadio.checked = true;
        }

        // 填充分類（需要在 renderCustomCategories 之後執行）
        if (transaction.categories && Array.isArray(transaction.categories)) {
            this.state.selectedCategories = [...transaction.categories];

            // 延遲執行以確保 DOM 已更新
            setTimeout(() => {
                transaction.categories.forEach(category => {
                    const categoryBtn = document.querySelector(`.tag-btn[data-category="${category}"]`);
                    if (categoryBtn) {
                        const iconDiv = categoryBtn.querySelector('div');
                        if (iconDiv) {
                            iconDiv.classList.add('active');
                        }
                    }
                });
            }, 100);
        }

        // 顯示現有照片
        if (transaction.photo_url) {
            this.showPhotoPreview(transaction.photo_url);
        }
    }

    /**
     * 切換分類選擇
     * @param {string} category - 分類名稱
     * @param {HTMLElement} btn - 按鈕元素
     */
    toggleCategory(category, btn) {
        const iconDiv = btn.querySelector('div');
        const index = this.state.selectedCategories.indexOf(category);

        if (index > -1) {
            // 取消選擇
            this.state.selectedCategories.splice(index, 1);
            iconDiv.classList.remove('active');
        } else {
            // 選擇分類
            this.state.selectedCategories.push(category);
            iconDiv.classList.add('active');

            // 觸發果凍彈跳動畫（通過移除並重新添加類來重新觸發動畫）
            iconDiv.style.animation = 'none';
            setTimeout(() => {
                iconDiv.style.animation = '';
            }, 10);
        }
    }

    /**
     * 處理照片上傳
     * @param {FileList} files - 檔案列表
     */
    handlePhotoUpload(files) {
        if (files.length === 0) return;

        const file = files[0];

        // 驗證檔案類型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            window.customDialog?.error('請選擇圖片檔案（JPG、PNG 或 WEBP）');
            return;
        }

        // 驗證檔案大小（最大 10MB）
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            window.customDialog?.error('圖片大小超過 10MB，請選擇較小的圖片');
            return;
        }

        // 儲存檔案
        this.selectedPhoto = file;

        // 顯示預覽
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 顯示照片預覽
     * @param {string} dataUrl - 圖片 Data URL
     */
    showPhotoPreview(dataUrl) {
        const preview = document.getElementById('photoPreview');
        if (!preview) return;

        preview.innerHTML = `
            <div class="relative inline-block group">
                <img src="${dataUrl}" alt="預覽" class="w-24 h-24 rounded-2xl object-cover shadow-watercolor-layered border-4 border-white">
                <!-- 刪除按鈕 -->
                <button type="button" class="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-[#E27D60] to-[#E8A87C] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100" data-action="remove-photo">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
                <!-- 照片標籤 -->
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-antique-gold text-white text-xs font-bold rounded-full shadow-sm">
                    📸 已選擇
                </div>
            </div>
        `;

        // 綁定刪除按鈕事件
        const removeBtn = preview.querySelector('[data-action="remove-photo"]');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removePhoto());
        }
    }

    /**
     * 刪除照片
     */
    removePhoto() {
        this.selectedPhoto = null;
        this.clearPhotoPreview();

        // 清除 file input
        const photoInput = document.getElementById('photoInput');
        if (photoInput) {
            photoInput.value = '';
        }
    }

    /**
     * 清除照片預覽
     */
    clearPhotoPreview() {
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.innerHTML = '';
        }
    }

    /**
     * 新增自訂分類
     */
    async addCustomCategory() {
        const categoryName = await window.customDialog.prompt('請輸入新分類名稱', '', '新增分類');
        if (!categoryName || !categoryName.trim()) return;

        const trimmedName = categoryName.trim();

        // 檢查是否已存在
        const existingCategories = window.DataManager.getCustomCategories();
        if (existingCategories.some(cat => cat.name === trimmedName)) {
            await window.customDialog.error('此分類已存在！');
            return;
        }

        try {
            // 新增到資料庫
            await window.DataManager.addCustomCategory(trimmedName);

            // 重新渲染分類列表
            this.renderCustomCategories();

            await window.customDialog.success(`已新增分類「${trimmedName}」！`);
        } catch (error) {
            console.error('❌ 新增分類失敗:', error);
            await window.customDialog.error('新增分類失敗：' + error.message);
        }
    }

    /**
     * 渲染自訂分類
     */
    renderCustomCategories() {
        const customCategories = window.DataManager.getCustomCategories();
        const categoryGrid = document.getElementById('categoryTags');
        const addButton = document.getElementById('btnAddCustomCategory');

        if (!categoryGrid || !addButton) return;

        // 移除所有現有的自訂分類按鈕
        const existingCustomBtns = categoryGrid.querySelectorAll('[data-custom-category]');
        existingCustomBtns.forEach(btn => btn.remove());

        // 在「新增」按鈕之前插入自訂分類
        customCategories.forEach(cat => {
            const categoryBtn = document.createElement('button');
            categoryBtn.type = 'button';
            categoryBtn.className = 'tag-btn group flex flex-col items-center gap-2';
            categoryBtn.dataset.category = cat.name;
            categoryBtn.dataset.customCategory = cat.id;

            categoryBtn.innerHTML = `
                <div class="bg-gradient-to-br from-macaron-cream/60 to-macaron-cream/40">
                    <span class="material-symbols-outlined text-2xl">${cat.icon}</span>
                </div>
                <span class="text-sm font-hand font-bold text-warm-brown">${cat.name}</span>
            `;

            // 綁定點擊事件
            categoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategory(cat.name, categoryBtn);
            });

            // 插入到「新增」按鈕之前
            categoryGrid.insertBefore(categoryBtn, addButton);
        });
    }

    /**
     * 提交交易
     */
    async submit() {
        console.log('🔍 開始提交交易...', this.editingTransactionId ? '(編輯模式)' : '(新增模式)');

        if (!this.form) {
            console.error('❌ 找不到表單元素');
            return;
        }

        if (!this.form.checkValidity()) {
            console.warn('⚠️ 表單驗證失敗');
            this.form.reportValidity();
            return;
        }

        // 防止重複提交：檢查提交按鈕狀態
        const submitBtn = this.form?.querySelector('[type="submit"]');
        if (submitBtn && submitBtn.disabled) {
            console.warn('⚠️ 正在提交中，請稍候...');
            return;
        }

        // 禁用提交按鈕（防止重複點擊）
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '⏳ 處理中...';

            // 確保即使發生錯誤也能恢復按鈕
            const restoreButton = () => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            };

            // 設定超時恢復（30秒後自動恢復，避免卡死）
            const timeoutId = setTimeout(restoreButton, 30000);

            // 將恢復函數綁到 try-finally
            this._restoreButton = () => {
                clearTimeout(timeoutId);
                restoreButton();
            };
        }

        try {
            const payer = document.querySelector('input[name="payer"]:checked').value;
            const beneficiary = document.querySelector('input[name="beneficiary"]:checked').value;

            const transactionData = {
                payer: payer,
                beneficiary: beneficiary,
                amount: parseFloat(document.getElementById('amount').value),
                item_name: document.getElementById('itemName').value.trim(),
                categories: [...this.state.selectedCategories],
                note: document.getElementById('note').value.trim(),
                date: document.getElementById('transactionDate').value,
                photo_url: null,
                photo_path: null
            };

            console.log('📝 交易資料:', transactionData);

            if (!window.DataManager) {
                console.error('❌ DataManager 不存在');
                await window.customDialog.error('系統錯誤：資料管理器未初始化');
                return;
            }

            // === 編輯模式 ===
            if (this.editingTransactionId) {
                // 處理照片更新邏輯
                if (this.selectedPhoto && this.selectedPhoto instanceof File) {
                    // 有新照片需要上傳
                    try {
                        console.log('📸 開始上傳新照片...');

                        // 如果有舊照片，先刪除
                        if (this.editingTransaction.photo_path) {
                            await window.DataManager.deleteTransactionPhoto(this.editingTransaction.photo_path);
                            console.log('🗑️ 已刪除舊照片');
                        }

                        // 上傳新照片
                        const uploadResult = await window.DataManager.uploadTransactionPhoto(
                            this.selectedPhoto,
                            this.editingTransactionId
                        );

                        console.log('✅ 新照片上傳成功:', uploadResult);

                        // 更新交易資料中的照片資訊
                        transactionData.photo_url = uploadResult.url;
                        transactionData.photo_path = uploadResult.path;
                    } catch (photoError) {
                        console.error('❌ 照片上傳失敗:', photoError);
                        await window.customDialog.error('照片上傳失敗：' + photoError.message);
                        return;
                    }
                } else if (this.editingTransaction.photo_url) {
                    // 保留原有照片
                    transactionData.photo_url = this.editingTransaction.photo_url;
                    transactionData.photo_path = this.editingTransaction.photo_path;
                }

                // 更新交易
                await window.DataManager.updateTransaction(this.editingTransactionId, transactionData);
                console.log('✅ 交易已更新');

                this.close();

                // 呼叫提交回調（更新頁面）
                if (this.onSubmitCallback) {
                    console.log('🔄 呼叫更新回調...');
                    this.onSubmitCallback();
                }

                await window.customDialog.success('交易已更新！');
            }
            // === 新增模式 ===
            else {
                // 先新增交易（取得交易 ID）
                const result = await window.DataManager.addTransaction(transactionData);
                console.log('✅ 交易已新增:', result);

                // 如果有選擇照片，上傳照片
                if (this.selectedPhoto && result.id) {
                    try {
                        console.log('📸 開始上傳照片...');

                        // 顯示上傳進度提示（可選）
                        const uploadResult = await window.DataManager.uploadTransactionPhoto(
                            this.selectedPhoto,
                            result.id
                        );

                        console.log('✅ 照片上傳成功:', uploadResult);

                        // 更新交易的照片資訊
                        await window.DataManager.updateTransaction(result.id, {
                            photo_url: uploadResult.url,
                            photo_path: uploadResult.path
                        });

                        console.log('✅ 交易照片資訊已更新');
                    } catch (photoError) {
                        console.error('❌ 照片上傳失敗:', photoError);
                        // 照片上傳失敗不影響交易本身，顯示警告即可
                        await window.customDialog.error('照片上傳失敗：' + photoError.message);
                    }
                }

                this.close();

                // 呼叫提交回調（更新首頁）
                if (this.onSubmitCallback) {
                    console.log('🔄 呼叫更新回調...');
                    this.onSubmitCallback();
                }

                // 簡單的成功提示
                await window.customDialog.success('交易已記入日記！');
            }
        } catch (error) {
            console.error('❌ 提交交易時發生錯誤:', error);

            // 檢查是否為離線錯誤
            if (error.code === 'unavailable' || error.message.includes('offline')) {
                await window.customDialog.info('📡 離線模式：交易已排隊，將在重新連線後同步');
                // 離線模式仍然關閉表單（因為資料已排隊）
                this.close();
            } else {
                await window.customDialog.error('發生錯誤：' + error.message);
            }
        } finally {
            // 恢復提交按鈕（無論成功或失敗）
            if (this._restoreButton) {
                this._restoreButton();
                this._restoreButton = null;
            }
        }
    }
}

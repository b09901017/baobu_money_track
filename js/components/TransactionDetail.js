// ==================== 交易詳情組件 ====================
// 來源: app.js 行 1410-1483
// 負責顯示交易詳情模態框

// 分類顏色配置
const CATEGORY_DETAIL_COLORS = {
    '吃吃': 'bg-macaron-pink/40 text-soft-ink',
    '玩': 'bg-macaron-blue/40 text-soft-ink',
    '交通': 'bg-macaron-green/40 text-soft-ink',
    '購物': 'bg-macaron-purple/40 text-soft-ink',
    '生活': 'bg-macaron-cream text-warm-brown',
    '其他': 'bg-warm-brown/20 text-warm-brown'
};

export class TransactionDetail {
    constructor() {
        this.modal = document.getElementById('transactionDetailModal');
    }

    /**
     * 顯示交易詳情
     * @param {string} txId - 交易 ID
     */
    show(txId) {
        const allTransactions = window.DataManager.transactions;
        const tx = allTransactions.find(t => t.id === txId);

        if (!tx) {
            console.error('Transaction not found:', txId);
            return;
        }

        // 設定金額和項目名稱
        document.getElementById('detailAmount').textContent = `$${tx.amount}`;
        document.getElementById('detailItemName').textContent = tx.item_name;

        // 設定付款人和受益人（使用絕對角色）
        const payerText = tx.payer === 'baobao' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'baobao' ? '寶寶'
            : tx.beneficiary === 'bubu' ? '步步'
            : '寶步';

        document.getElementById('detailPayer').textContent = payerText;
        document.getElementById('detailBeneficiary').textContent = beneficiaryText;

        // 設定日期
        const date = new Date(tx.date);
        const dateText = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
        document.getElementById('detailDate').textContent = dateText;

        // 綁定編輯按鈕事件
        this.bindEditButton(tx);

        // 設定分類
        const categoriesContainer = document.getElementById('detailCategories');
        if (tx.categories && tx.categories.length > 0) {
            categoriesContainer.innerHTML = tx.categories.map(cat => {
                const colorClass = CATEGORY_DETAIL_COLORS[cat] || 'bg-warm-brown/20 text-warm-brown';
                return `<span class="px-4 py-2 rounded-full ${colorClass} font-hand font-bold text-sm">${cat}</span>`;
            }).join('');
        } else {
            categoriesContainer.innerHTML = '<span class="text-warm-brown/60 font-hand">無分類</span>';
        }

        // 設定備註
        const noteSection = document.getElementById('detailNoteSection');
        const noteContent = document.getElementById('detailNote');
        if (tx.note && tx.note.trim()) {
            noteSection.classList.remove('hidden');
            noteContent.textContent = tx.note;
        } else {
            noteSection.classList.add('hidden');
        }

        // 設定照片
        const photoSection = document.getElementById('detailPhotoSection');
        const photoContent = document.getElementById('detailPhoto');
        if (tx.photo_url) {
            photoSection.classList.remove('hidden');
            photoContent.innerHTML = `
                <div class="relative group">
                    <img src="${tx.photo_url}" alt="收據照片" class="w-full h-auto rounded-2xl shadow-watercolor-layered border-4 border-white cursor-pointer hover:shadow-floating transition-all" data-action="view-photo" data-photo-url="${tx.photo_url}">
                    <!-- 放大提示 -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all flex items-center justify-center pointer-events-none">
                        <div class="bg-white/90 px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-sm font-hand font-bold text-soft-ink">🔍 點擊放大</span>
                        </div>
                    </div>
                    <!-- 刪除按鈕 -->
                    <button type="button" class="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-[#E27D60] to-[#E8A87C] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100" data-action="delete-photo" data-transaction-id="${tx.id}" data-photo-path="${tx.photo_path || ''}">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            `;

            // 綁定照片點擊事件（放大查看）
            const photoImg = photoContent.querySelector('[data-action="view-photo"]');
            if (photoImg) {
                photoImg.addEventListener('click', (e) => {
                    const photoUrl = e.currentTarget.dataset.photoUrl;
                    this.showPhotoLightbox(photoUrl);
                });
            }

            // 綁定刪除按鈕事件
            const deleteBtn = photoContent.querySelector('[data-action="delete-photo"]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const txId = e.currentTarget.dataset.transactionId;
                    const photoPath = e.currentTarget.dataset.photoPath;
                    await this.deletePhoto(txId, photoPath);
                });
            }
        } else {
            photoSection.classList.add('hidden');
        }

        // 顯示模態框
        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }

    /**
     * 顯示照片燈箱（放大查看）
     * @param {string} photoUrl - 照片 URL
     */
    showPhotoLightbox(photoUrl) {
        // 建立燈箱元素
        const lightbox = document.createElement('div');
        lightbox.className = 'fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4';
        lightbox.innerHTML = `
            <div class="relative max-w-4xl w-full">
                <!-- 關閉按鈕 -->
                <button class="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:scale-110" data-action="close-lightbox">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <!-- 照片 -->
                <img src="${photoUrl}" alt="照片" class="w-full h-auto rounded-2xl shadow-2xl">
            </div>
        `;

        document.body.appendChild(lightbox);

        // 綁定關閉事件
        const closeBtn = lightbox.querySelector('[data-action="close-lightbox"]');
        const closeLightbox = () => {
            lightbox.remove();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        // 點擊背景關閉
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // ESC 鍵關閉
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    /**
     * 刪除照片
     * @param {string} txId - 交易 ID
     * @param {string} photoPath - 照片儲存路徑
     */
    async deletePhoto(txId, photoPath) {
        const confirmed = await window.customDialog.confirm('確定要刪除這張照片嗎？', '刪除照片');
        if (!confirmed) return;

        try {
            // 從 Storage 刪除照片
            if (photoPath) {
                await window.DataManager.deleteTransactionPhoto(photoPath);
            }

            // 更新交易資料
            await window.DataManager.updateTransaction(txId, {
                photo_url: null,
                photo_path: null
            });

            // 重新載入交易詳情
            this.show(txId);

            await window.customDialog.success('照片已刪除！');
        } catch (error) {
            console.error('❌ 刪除照片失敗:', error);
            await window.customDialog.error('刪除照片失敗：' + error.message);
        }
    }

    /**
     * 綁定編輯按鈕事件
     * @param {Object} transaction - 交易資料
     */
    bindEditButton(transaction) {
        if (!this.modal) return;

        // 找到編輯按鈕（右上角的 edit icon）
        // 找到所有 button 元素，並檢查其中是否包含 "edit" 文字的 icon
        const buttons = this.modal.querySelectorAll('button');
        let editButton = null;

        for (const button of buttons) {
            const icon = button.querySelector('.material-symbols-outlined');
            if (icon && icon.textContent.trim() === 'edit') {
                editButton = button;
                break;
            }
        }

        if (!editButton) {
            console.warn('⚠️ 找不到編輯按鈕');
            return;
        }

        // 移除舊的事件監聽器（如果有）
        const newButton = editButton.cloneNode(true);
        editButton.parentNode.replaceChild(newButton, editButton);

        // 綁定點擊事件
        newButton.addEventListener('click', () => {
            console.log('✏️ 點擊編輯按鈕，交易 ID:', transaction.id);

            // 關閉詳情模態框
            this.close();

            // 開啟編輯表單
            if (window.app && window.app.transactionForm) {
                window.app.transactionForm.open(transaction);
            } else {
                console.error('❌ 找不到 TransactionForm');
            }
        });
    }

    /**
     * 關閉交易詳情
     */
    close() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }
}

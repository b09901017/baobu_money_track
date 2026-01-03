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

        // 設定付款人和受益人
        const payerText = tx.payer === 'me' ? '寶寶' : '步步';
        const beneficiaryText = tx.beneficiary === 'self' ? '寶寶'
            : tx.beneficiary === 'partner' ? '步步'
            : '寶步';

        document.getElementById('detailPayer').textContent = payerText;
        document.getElementById('detailBeneficiary').textContent = beneficiaryText;

        // 設定日期
        const date = new Date(tx.date);
        const dateText = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
        document.getElementById('detailDate').textContent = dateText;

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
            photoContent.innerHTML = `<img src="${tx.photo_url}" alt="照片" class="w-full h-auto rounded-lg">`;
        } else {
            photoSection.classList.add('hidden');
        }

        // 顯示模態框
        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
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

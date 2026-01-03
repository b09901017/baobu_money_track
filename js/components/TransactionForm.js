// ==================== 交易表單組件 ====================
// 來源: app.js 行 1258-1407
// 負責記帳表單的操作

export class TransactionForm {
    constructor(state, onSubmitCallback) {
        this.state = state;
        this.onSubmitCallback = onSubmitCallback;

        this.sheet = document.getElementById('addTransactionSheet');
        this.form = document.getElementById('transactionForm');
    }

    /**
     * 開啟表單
     */
    open() {
        console.log('🔓 TransactionForm.open() 被呼叫');
        console.log('Sheet 元素:', this.sheet);

        if (!this.sheet) {
            console.error('❌ Sheet 元素不存在');
            return;
        }

        // 移除 hidden class 並添加 active class
        this.sheet.classList.remove('hidden');
        this.sheet.classList.add('active');
        console.log('✅ Sheet 已顯示');

        // 重置表單（會同時設置今天日期）
        this.reset();

        // 渲染自訂分類
        this.renderCustomCategories();
    }

    /**
     * 關閉表單
     */
    close() {
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

        // 重置分類選擇視覺效果
        document.querySelectorAll('.tag-btn > div').forEach(div => {
            div.classList.remove('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110');
        });

        // 清除照片預覽
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            photoPreview.innerHTML = '';
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
            this.state.selectedCategories.splice(index, 1);
            iconDiv.classList.remove('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110', 'text-white');
        } else {
            this.state.selectedCategories.push(category);
            iconDiv.classList.add('bg-gradient-to-br', 'from-[#FF9EAA]', 'to-[#FFB7B2]', 'shadow-watercolor-layered', 'scale-110', 'text-white');
        }
    }

    /**
     * 處理照片上傳
     * @param {FileList} files - 檔案列表
     */
    handlePhotoUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        const preview = document.getElementById('photoPreview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="w-20 h-20 rounded-xl object-cover shadow-watercolor-layered border-2 border-white">
            `;
        };
        reader.readAsDataURL(file);
    }

    /**
     * 新增自訂分類
     */
    async addCustomCategory() {
        const categoryName = prompt('請輸入新分類名稱：');
        if (!categoryName || !categoryName.trim()) return;

        const trimmedName = categoryName.trim();

        // 檢查是否已存在
        const existingCategories = window.DataManager.getCustomCategories();
        if (existingCategories.some(cat => cat.name === trimmedName)) {
            alert('此分類已存在！');
            return;
        }

        try {
            // 新增到資料庫
            await window.DataManager.addCustomCategory(trimmedName);

            // 重新渲染分類列表
            this.renderCustomCategories();

            alert(`✨ 已新增分類「${trimmedName}」！`);
        } catch (error) {
            console.error('❌ 新增分類失敗:', error);
            alert('新增分類失敗：' + error.message);
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
                <div class="w-16 h-16 rounded-[50% 50% 40% 60% / 50% 40% 60% 50%] bg-macaron-cream/40 hover:bg-macaron-cream/60 flex items-center justify-center text-warm-brown group-hover:text-soft-ink transition-all group-active:scale-95 border-2 border-transparent hover:border-macaron-cream/50">
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
        console.log('🔍 開始提交交易...');

        if (!this.form) {
            console.error('❌ 找不到表單元素');
            return;
        }

        if (!this.form.checkValidity()) {
            console.warn('⚠️ 表單驗證失敗');
            this.form.reportValidity();
            return;
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
                photo_url: null
            };

            console.log('📝 交易資料:', transactionData);

            if (!window.DataManager) {
                console.error('❌ DataManager 不存在');
                alert('系統錯誤：資料管理器未初始化');
                return;
            }

            const result = await window.DataManager.addTransaction(transactionData);
            console.log('✅ 交易已新增:', result);

            this.close();

            // 呼叫提交回調（更新首頁）
            if (this.onSubmitCallback) {
                console.log('🔄 呼叫更新回調...');
                this.onSubmitCallback();
            }

            // 簡單的成功提示
            alert('✨ 交易已記入日記！');
        } catch (error) {
            console.error('❌ 提交交易時發生錯誤:', error);
            alert('發生錯誤：' + error.message);
        }
    }
}

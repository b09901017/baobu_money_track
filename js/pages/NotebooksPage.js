// ==================== 帳本頁面控制器 ====================
// 來源: app.js 行 973-1105

export class NotebooksPage {
    constructor(onSwitchCallback) {
        this.onSwitchCallback = onSwitchCallback;  // 切換帳本後的回調
    }

    update() {
        const notebooks = window.DataManager.getNotebooks();
        const container = document.getElementById('notebooksList');
        if (!container) return;

        const currentNotebookId = window.DataManager.currentNotebook;

        const bookColors = [
            { spine: 'from-[#8caec4] to-[#AEC6CF]', ribbon: 'bg-rose-400', gradient: 'from-macaron-blue/30 to-transparent' },
            { spine: 'from-[#d6a578] to-[#E8C4A3]', ribbon: 'bg-yellow-400/90', gradient: 'from-macaron-pink/30 to-transparent' },
            { spine: 'from-[#c4a6b2] to-[#E2C2C6]', ribbon: 'bg-macaron-green', gradient: 'from-macaron-purple/30 to-transparent' },
            { spine: 'from-[#a8c5b0] to-[#C8E6C9]', ribbon: 'bg-macaron-pink', gradient: 'from-macaron-green/30 to-transparent' },
        ];

        const booksHTML = notebooks.map((nb, index) => {
            const colorScheme = bookColors[index % bookColors.length];
            const isActive = nb.id === currentNotebookId;
            const isFirst = index === 0;

            const nbTransactions = window.DataManager.transactions.filter(tx => tx.notebook_id === nb.id);
            let baobaoTotal = 0, bubuTotal = 0, total = 0;

            nbTransactions.forEach(tx => {
                const amount = parseFloat(tx.amount);
                total += amount;
                // 使用絕對角色判斷
                if (tx.payer === 'baobao') baobaoTotal += amount;
                else bubuTotal += amount;
            });

            let statsHTML = '';
            if (isFirst) {
                const balance = window.DataManager.calculateBalance();
                statsHTML = balance.status === 'settled'
                    ? '<div class="text-xs text-warm-brown/80">已結清 💖</div>'
                    : `<div class="text-xs text-warm-brown/80">${balance.debtor}欠${balance.creditor} $${Math.round(balance.amount)}</div>`;
            } else {
                statsHTML = `
                    <div class="space-y-0.5 text-xs text-warm-brown/80">
                        ${baobaoTotal > 0 ? `<div>寶 $${Math.round(baobaoTotal)}</div>` : ''}
                        ${bubuTotal > 0 ? `<div>步 $${Math.round(bubuTotal)}</div>` : ''}
                        ${total > 0 ? `<div class="text-[#E27D60] font-bold">共 $${Math.round(total)}</div>` : ''}
                    </div>`;
            }

            return `
                <div class="group relative cursor-pointer" data-notebook-id="${nb.id}">
                    <div class="relative w-full aspect-[3/4] rounded-r-xl rounded-l-md shadow-book bg-white transition-all duration-300 transform ${isActive ? '-translate-y-2 scale-105 shadow-floating ring-2 ring-antique-gold' : 'hover:-translate-y-2 hover:rotate-1'} overflow-visible">
                        <div class="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r ${colorScheme.spine} rounded-l-md z-20 shadow-md"></div>
                        <div class="absolute inset-0 left-2 bg-gradient-to-br ${colorScheme.gradient} rounded-r-xl overflow-hidden flex flex-col justify-end p-4">
                            <div class="absolute inset-0 book-texture opacity-20"></div>
                            <div class="relative z-10">
                                <h3 class="text-soft-ink text-xl font-hand font-bold leading-tight mb-2">${nb.name}</h3>
                                ${statsHTML}
                            </div>
                        </div>
                        <div class="absolute -top-1 right-6 w-6 h-12 ${colorScheme.ribbon} shadow-md z-30 flex justify-center">
                            <div class="absolute bottom-[-8px] w-full h-4 ${colorScheme.ribbon}" style="clip-path: polygon(0 0, 50% 100%, 100% 0);"></div>
                        </div>
                    </div>
                    <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/10 rounded-[100%] blur-sm pointer-events-none group-hover:w-3/4 group-hover:mx-auto transition-all"></div>
                </div>`;
        }).join('');

        const addBookHTML = `
            <div class="group relative cursor-pointer" id="btnAddNotebook">
                <div class="relative w-full aspect-[3/4] rounded-xl border-[3px] border-dashed border-macaron-rose/50 bg-white/20 shadow-watercolor-layered flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:bg-white/40 hover:border-macaron-rose hover:-translate-y-1 backdrop-blur-sm overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-warm-brown/5 via-transparent to-warm-brown/5 opacity-50"></div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="absolute top-6 left-6 text-antique-gold/40 text-[12px] group-hover:animate-ping">✦</span>
                        <span class="absolute bottom-10 right-8 text-antique-gold/40 text-[16px] group-hover:animate-bounce" style="animation-delay: 0.5s;">✧</span>
                        <span class="absolute top-1/2 right-4 text-antique-gold/40 text-[10px] group-hover:animate-pulse" style="animation-delay: 1s;">✦</span>
                    </div>
                    <div class="w-16 h-16 rounded-full bg-white text-macaron-rose flex items-center justify-center mb-1 group-hover:scale-110 transition-all duration-300 shadow-sm border border-macaron-rose/30">
                        <span class="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <div class="px-2">
                        <h3 class="text-warm-brown font-hand font-bold text-lg leading-tight group-hover:text-soft-ink transition-colors">新故事</h3>
                        <p class="text-[10px] uppercase tracking-wider text-warm-brown/60 mt-1">New Chapter</p>
                    </div>
                </div>
                <div class="absolute -bottom-4 left-4 right-4 h-3 bg-warm-brown/5 rounded-[100%] blur-sm pointer-events-none"></div>
            </div>`;

        container.innerHTML = booksHTML + addBookHTML;

        // 綁定事件
        container.querySelectorAll('[data-notebook-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchNotebook(e.currentTarget.dataset.notebookId);
            });
        });

        const addBtn = document.getElementById('btnAddNotebook');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNewNotebook());
        }
    }

    async switchNotebook(notebookId) {
        try {
            const notebook = await window.DataManager.switchNotebook(notebookId);
            if (notebook && this.onSwitchCallback) {
                this.onSwitchCallback();
            }
        } catch (error) {
            console.error('❌ 切換帳本失敗:', error);
            await window.customDialog.error('切換帳本失敗：' + error.message);
        }
    }

    async addNewNotebook() {
        const name = await window.customDialog.prompt('請輸入帳本名稱', '', '新增故事本');
        if (name && name.trim()) {
            try {
                await window.DataManager.addNotebook(name.trim());
                this.update();
                await window.customDialog.success(`成功新增故事本「${name.trim()}」！`);
            } catch (error) {
                console.error('❌ 新增帳本失敗:', error);
                await window.customDialog.error('新增帳本失敗：' + error.message);
            }
        }
    }
}

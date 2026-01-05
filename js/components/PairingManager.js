// ==================== 配對管理器 ====================
// 處理情侶配對的所有邏輯

export class PairingManager {
    constructor() {
        this.pairingPage = document.getElementById('pairingPage');
        this.pairingOptions = document.getElementById('pairingOptions');
        this.createCoupleForm = document.getElementById('createCoupleForm');
        this.joinCoupleForm = document.getElementById('joinCoupleForm');
        this.showPairingCode = document.getElementById('showPairingCode');

        this.currentCouple = null;  // 當前建立的配對資料
        this.onPairingComplete = null;  // 配對完成回調
    }

    /**
     * 初始化事件綁定
     */
    init(onPairingCompleteCallback) {
        this.onPairingComplete = onPairingCompleteCallback;

        // 建立新配對按鈕
        const btnCreateCouple = document.getElementById('btnCreateCouple');
        if (btnCreateCouple) {
            btnCreateCouple.addEventListener('click', () => this.showCreateForm());
        }

        // 加入現有配對按鈕
        const btnJoinCouple = document.getElementById('btnJoinCouple');
        if (btnJoinCouple) {
            btnJoinCouple.addEventListener('click', () => this.showJoinForm());
        }

        // 建立配對 - 取消
        const btnCancelCreate = document.getElementById('btnCancelCreate');
        if (btnCancelCreate) {
            btnCancelCreate.addEventListener('click', () => this.showOptions());
        }

        // 建立配對 - 確認
        const btnConfirmCreate = document.getElementById('btnConfirmCreate');
        if (btnConfirmCreate) {
            btnConfirmCreate.addEventListener('click', () => this.handleCreateCouple());
        }

        // 加入配對 - 取消
        const btnCancelJoin = document.getElementById('btnCancelJoin');
        if (btnCancelJoin) {
            btnCancelJoin.addEventListener('click', () => this.showOptions());
        }

        // 加入配對 - 確認
        const btnConfirmJoin = document.getElementById('btnConfirmJoin');
        if (btnConfirmJoin) {
            btnConfirmJoin.addEventListener('click', () => this.handleJoinCouple());
        }

        // 完成配對按鈕
        const btnCompletePairing = document.getElementById('btnCompletePairing');
        if (btnCompletePairing) {
            btnCompletePairing.addEventListener('click', () => this.completePairing());
        }

        // 配對碼輸入自動轉大寫
        const inputPairingCode = document.getElementById('inputPairingCode');
        if (inputPairingCode) {
            inputPairingCode.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        console.log('✅ PairingManager 已初始化');
    }

    /**
     * 顯示配對頁面
     */
    showPairingPage() {
        if (this.pairingPage) {
            this.pairingPage.classList.remove('hidden');
            this.showOptions();  // 顯示配對選項
        }
    }

    /**
     * 隱藏配對頁面
     */
    hidePairingPage() {
        if (this.pairingPage) {
            this.pairingPage.classList.add('hidden');
        }
    }

    /**
     * 顯示配對選項
     */
    showOptions() {
        this.hideAllForms();
        if (this.pairingOptions) {
            this.pairingOptions.classList.remove('hidden');
        }
    }

    /**
     * 顯示建立配對表單
     */
    showCreateForm() {
        this.hideAllForms();
        if (this.createCoupleForm) {
            this.createCoupleForm.classList.remove('hidden');
        }
    }

    /**
     * 顯示加入配對表單
     */
    showJoinForm() {
        this.hideAllForms();
        if (this.joinCoupleForm) {
            this.joinCoupleForm.classList.remove('hidden');
        }
    }

    /**
     * 顯示配對碼
     */
    showPairingCodeDisplay() {
        this.hideAllForms();
        if (this.showPairingCode) {
            this.showPairingCode.classList.remove('hidden');
        }
    }

    /**
     * 隱藏所有表單
     */
    hideAllForms() {
        if (this.pairingOptions) this.pairingOptions.classList.add('hidden');
        if (this.createCoupleForm) this.createCoupleForm.classList.add('hidden');
        if (this.joinCoupleForm) this.joinCoupleForm.classList.add('hidden');
        if (this.showPairingCode) this.showPairingCode.classList.add('hidden');
    }

    /**
     * 處理建立配對
     */
    async handleCreateCouple() {
        try {
            // 取得選擇的角色
            const roleInput = document.querySelector('input[name="createRole"]:checked');
            if (!roleInput) {
                await window.customDialog.error('請選擇你的角色');
                return;
            }

            const role = roleInput.value;  // 'baobao' | 'bubu'
            const user = window.currentUser;

            if (!user) {
                await window.customDialog.error('用戶資料不存在，請重新登入');
                return;
            }

            console.log('🔄 正在建立配對...', { role, userName: user.displayName });

            // 呼叫 Firebase API 建立配對
            const couple = await window.FirebaseAPI.createCouple(
                user.uid,
                role,
                user.displayName || user.email
            );

            console.log('✅ 配對已建立:', couple);

            // 儲存配對資料
            this.currentCouple = couple;

            // 顯示配對碼
            const displayPairingCode = document.getElementById('displayPairingCode');
            if (displayPairingCode) {
                displayPairingCode.textContent = couple.pairing_code;
            }

            // 切換到顯示配對碼界面
            this.showPairingCodeDisplay();

            await window.customDialog.success('配對已建立！請將配對碼分享給伴侶');
        } catch (error) {
            console.error('❌ 建立配對失敗:', error);
            await window.customDialog.error('建立配對失敗：' + error.message);
        }
    }

    /**
     * 處理加入配對
     */
    async handleJoinCouple() {
        try {
            // 取得輸入的配對碼
            const inputPairingCode = document.getElementById('inputPairingCode');
            if (!inputPairingCode) {
                await window.customDialog.error('找不到配對碼輸入框');
                return;
            }

            const pairingCode = inputPairingCode.value.trim().toUpperCase();

            // 驗證配對碼格式
            if (!this.validatePairingCode(pairingCode)) {
                await window.customDialog.error('配對碼格式錯誤，請輸入6位英數字');
                return;
            }

            // 取得選擇的角色
            const roleInput = document.querySelector('input[name="joinRole"]:checked');
            if (!roleInput) {
                await window.customDialog.error('請選擇你的角色');
                return;
            }

            const role = roleInput.value;  // 'baobao' | 'bubu'
            const user = window.currentUser;

            if (!user) {
                await window.customDialog.error('用戶資料不存在，請重新登入');
                return;
            }

            console.log('🔍 查找配對碼...', pairingCode);

            // 查找配對
            const couple = await window.FirebaseAPI.findCoupleByCode(pairingCode);

            if (!couple) {
                await window.customDialog.error('配對碼不存在，請確認後再試');
                return;
            }

            // 檢查配對是否已完成
            if (couple.is_complete) {
                await window.customDialog.error('此配對已完成，無法再加入');
                return;
            }

            // 檢查角色是否衝突
            const existingRole = Object.values(couple.member_roles)[0];
            if (existingRole === role) {
                const roleName = role === 'baobao' ? '寶寶' : '步步';
                await window.customDialog.error(`伴侶已選擇「${roleName}」角色，請選擇另一個角色`);
                return;
            }

            console.log('🔄 正在加入配對...', { coupleId: couple.id, role });

            // 加入配對
            await window.FirebaseAPI.joinCouple(
                couple.id,
                user.uid,
                role,
                user.displayName || user.email
            );

            console.log('✅ 已加入配對');

            // 儲存配對資料
            this.currentCouple = couple;

            await window.customDialog.success('配對成功！即將進入記帳 App');

            // 完成配對
            await this.completePairing();
        } catch (error) {
            console.error('❌ 加入配對失敗:', error);
            await window.customDialog.error('加入配對失敗：' + error.message);
        }
    }

    /**
     * 驗證配對碼格式
     * @param {string} code - 配對碼
     * @returns {boolean} - 是否有效
     */
    validatePairingCode(code) {
        // 6位英數字（大寫）
        const pattern = /^[A-Z0-9]{6}$/;
        return pattern.test(code);
    }

    /**
     * 完成配對，進入記帳 App
     */
    async completePairing() {
        try {
            // 隱藏配對頁面
            this.hidePairingPage();

            // 重新取得最新的配對資料（可能已被伴侶更新）
            const user = window.currentUser;
            const couple = await window.FirebaseAPI.getUserCouple(user.uid);

            if (!couple) {
                await window.customDialog.error('無法取得配對資料，請重新登入');
                return;
            }

            // 呼叫配對完成回調
            if (this.onPairingComplete) {
                await this.onPairingComplete(couple);
            }
        } catch (error) {
            console.error('❌ 完成配對失敗:', error);
            await window.customDialog.error('發生錯誤：' + error.message);
        }
    }
}

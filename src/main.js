// ==================== 主入口檔案 ====================
// 整合 CSS、Firebase 與應用邏輯

// 引入樣式
import './style.css';

// 引入 SortableJS（拖曳排序功能）
// 注意：在 Vite 建置環境中使用 npm 套件，在純瀏覽器環境中需要使用 CDN
// 優先使用 CDN 載入的 Sortable（已在 HTML 中引入）
(async () => {
    if (typeof window !== 'undefined' && window.Sortable) {
        // 如果已經從 CDN 載入，直接使用
        console.log('✅ SortableJS 已從 CDN 載入');
    } else {
        // 在 Vite 建置環境中，嘗試動態 import
        try {
            const sortableModule = await import('sortablejs');
            window.Sortable = sortableModule.default;
            console.log('✅ SortableJS 已從 npm 載入');
        } catch (e) {
            console.error('❌ SortableJS 載入失敗，請確保已載入 CDN');
        }
    }
})();

// 引入 Firebase 初始化（會自動初始化 Firebase 並掛載到 window.firebaseModules）
import './firebaseInit.js';

// 引入 Firebase API 封裝（會建立 window.FirebaseAPI）
import '../js/firebase-config.js';

// 引入 DataManager（會建立 window.DataManager）
import '../js/data.js';

// 引入主應用（需要等待 Firebase 初始化完成）
import '../js/app.js';

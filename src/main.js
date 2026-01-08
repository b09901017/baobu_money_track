// ==================== 主入口檔案 ====================
// 整合 CSS、Firebase 與應用邏輯

// 引入樣式
import './style.css';

// 引入 SortableJS（拖曳排序功能）
import Sortable from 'sortablejs';
window.Sortable = Sortable;  // 掛載到全域供舊程式碼使用

// 引入 Firebase 初始化（會自動初始化 Firebase 並掛載到 window.firebaseModules）
import './firebaseInit.js';

// 引入 Firebase API 封裝（會建立 window.FirebaseAPI）
import '../js/firebase-config.js';

// 引入 DataManager（會建立 window.DataManager）
import '../js/data.js';

// 引入主應用（需要等待 Firebase 初始化完成）
import '../js/app.js';

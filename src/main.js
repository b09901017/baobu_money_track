// ==================== 主入口檔案 ====================
// 整合 CSS、Firebase 與應用邏輯

// 引入樣式
import './style.css';

// 引入 Firebase 初始化（會自動初始化 Firebase 並掛載 API）
import './firebaseInit.js';

// 引入主應用（需要等待 Firebase 初始化完成）
import '../js/app.js';

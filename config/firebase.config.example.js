// ==================== Firebase 配置檔案範例 ====================
//
// 📝 設定說明：
// 1. 複製此檔案為 firebase.config.js（同一目錄下）
// 2. 將下方的配置值替換為你的 Firebase 專案配置
// 3. firebase.config.js 已被 .gitignore 排除，不會上傳到 GitHub
//
// 🔑 如何取得 Firebase 配置：
// 1. 前往 Firebase Console: https://console.firebase.google.com/
// 2. 選擇你的專案
// 3. 點擊「專案設定」（齒輪圖示）
// 4. 在「你的應用程式」區塊中找到網頁應用程式
// 5. 複製配置物件
//
// ⚠️ 安全提醒：
// - 不要將 firebase.config.js 上傳到 GitHub 或公開分享
// - 務必設定 Firestore Security Rules 保護你的資料庫
// - 建議在 Firebase Console 中設定允許的網域

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

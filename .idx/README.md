# Google Project IDX 配置

此目錄包含 Google Project IDX 雲端開發環境的配置檔案。

## 檔案說明

### dev.nix
Nix 配置檔案，定義：
- 開發環境依賴套件（Node.js, Java, Android SDK）
- 環境變數（ANDROID_HOME, JAVA_HOME）
- VSCode 擴充功能
- 自動化腳本（onCreate, onStart）
- 預覽設定

## 如何使用

### 1. 在 Project IDX 開啟專案

1. 前往 https://idx.google.com/
2. 選擇「Import from GitHub」
3. 輸入你的 GitHub 倉庫 URL
4. IDX 會自動讀取 `.idx/dev.nix` 並配置環境

### 2. 開發流程

環境啟動後：
- 自動執行 `npm install`
- 自動啟動 `npm run dev`（Vite 開發伺服器）
- 可以在瀏覽器預覽 Web 版本

### 3. Android 開發

```bash
# 建置專案
npm run build

# 同步到 Android
npx cap sync

# 開啟 Android Studio
npx cap open android
```

### 4. Android 模擬器

Project IDX 提供內建 Android 模擬器：
1. 點擊右上角「Android」圖示
2. 選擇模擬器裝置
3. 啟動模擬器
4. 在 Android Studio 中執行 App

## 注意事項

1. **Android SDK 路徑**：IDX 預設路徑為 `/home/user/Android/Sdk`
2. **Firebase 憑證**：確保 `google-services.json` 已正確放置於 `android/app/`
3. **SHA-1 指紋**：需要在 Android Studio 中取得 SHA-1 並加入 Firebase Console
4. **權限設定**：`AndroidManifest.xml` 已包含所有必要權限

## 相關資源

- [Project IDX 官方文檔](https://developers.google.com/idx)
- [Capacitor 官方文檔](https://capacitorjs.com/)
- [Firebase Android 設定](https://firebase.google.com/docs/android/setup)

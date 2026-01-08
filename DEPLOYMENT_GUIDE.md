# 部署指南 - Deployment Guide

本指南提供完整的部署流程，包含 Web 版本與 Android App。

---

## 📋 目錄

1. [環境需求](#環境需求)
2. [本地開發](#本地開發)
3. [Web 版本部署](#web-版本部署-firebase-hosting)
4. [Android App 打包](#android-app-打包)
5. [Google Project IDX 雲端開發](#google-project-idx-雲端開發)
6. [Firebase Android 認證設定](#firebase-android-認證設定)
7. [常見問題](#常見問題)

---

## 🛠️ 環境需求

### 本地開發
- **Node.js**: 18.x 或更高版本
- **NPM**: 9.x 或更高版本
- **Git**: 最新版本

### Android 開發（可選，用於打包 APK）
- **Java JDK**: 17 或更高版本
- **Android Studio**: 最新版本（推薦 Hedgehog 或更新）
- **Android SDK**: API Level 33（Android 13）或更高

---

## 🚀 本地開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

開發伺服器會啟動在 `http://localhost:5173`

### 3. 建置專案

```bash
npm run build
```

建置結果會輸出到 `dist/` 目錄

---

## 🌐 Web 版本部署 (Firebase Hosting)

### 1. 確保已登入 Firebase CLI

```bash
firebase login
```

### 2. 建置專案

```bash
npm run build
```

### 3. 部署到 Firebase Hosting

```bash
firebase deploy --only hosting
```

### 4. 驗證部署

部署完成後，訪問你的 Firebase Hosting URL：
```
https://your-project.web.app
```

---

## 📱 Android App 打包

### 1. 建置 Web 資源

```bash
npm run build
```

### 2. 同步到 Capacitor

```bash
npx cap sync
```

### 3. 開啟 Android Studio

```bash
npx cap open android
```

### 4. 在 Android Studio 中操作

#### 4.1 取得 SHA-1 指紋（重要！）

**方法 1：使用 Gradle（推薦）**

在 Android Studio 中：
1. 開啟右側「Gradle」面板
2. 展開 `android` → `Tasks` → `android`
3. 雙擊 `signingReport`
4. 在「Run」視窗中找到 SHA-1 指紋

**方法 2：使用指令**

```bash
cd android
./gradlew signingReport
```

找到 `SHA1:` 開頭的那行，複製指紋（格式如 `AA:BB:CC:...`）

#### 4.2 將 SHA-1 加入 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案
3. 點擊「專案設定」（齒輪圖示）
4. 選擇「一般」標籤
5. 滾動到「您的應用程式」區域
6. 找到 Android 應用程式 (`com.baobu.moneytrack`)
7. 點擊「新增指紋」
8. 貼上 SHA-1 指紋
9. 點擊「儲存」

**注意**：這一步驟是 Google 登入在 Android 上正常運作的**必要條件**！

#### 4.3 下載最新的 google-services.json

加入 SHA-1 後，Firebase 會更新配置檔案：
1. 在同一個頁面點擊「下載 google-services.json」
2. 將檔案覆蓋到 `android/app/google-services.json`

#### 4.4 建置 APK

**Debug 版本（測試用）**

在 Android Studio 中：
1. 點擊 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. 等待建置完成
3. APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

**Release 版本（正式發布）**

1. 先設定簽名金鑰（如果還沒有）
2. 點擊 `Build` → `Generate Signed Bundle / APK`
3. 選擇「APK」
4. 選擇或建立金鑰
5. 選擇「release」建置類型
6. 等待建置完成
7. APK 位置：`android/app/release/app-release.apk`

#### 4.5 安裝到裝置

**使用 Android Studio**
1. 連接 Android 裝置或啟動模擬器
2. 點擊「Run」按鈕（綠色三角形）

**使用 ADB 安裝 APK**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ☁️ Google Project IDX 雲端開發

### 1. 將專案推送到 GitHub

```bash
# 切換到主分支並合併
git checkout main
git merge feature/vite-app-migration

# 推送到 GitHub
git push origin main
```

### 2. 在 Project IDX 開啟專案

1. 前往 https://idx.google.com/
2. 點擊「Import from GitHub」
3. 選擇你的倉庫
4. IDX 會自動讀取 `.idx/dev.nix` 並配置環境
5. 等待環境初始化完成（會自動執行 `npm install`）

### 3. 在 IDX 中開發

- **Web 開發**：自動啟動 `npm run dev`，點擊預覽按鈕查看
- **Android 開發**：執行 `npx cap open android` 開啟 Android Studio

### 4. 在 IDX 中使用 Android 模擬器

1. 點擊右上角「Android」圖示
2. 選擇模擬器裝置（建議 Pixel 5, API 33）
3. 啟動模擬器
4. 在 Android Studio 中點擊「Run」

### 5. 取得 SHA-1（IDX 環境）

在 IDX 終端機中：
```bash
cd android
./gradlew signingReport
```

將 SHA-1 加入 Firebase Console（參考上方「4.2 將 SHA-1 加入 Firebase Console」）

---

## 🔐 Firebase Android 認證設定

### 完整檢查清單

- [ ] 已在 Firebase Console 建立 Android 應用程式
  - 套件名稱：`com.baobu.moneytrack`
- [ ] 已下載 `google-services.json` 並放置於 `android/app/`
- [ ] 已取得 SHA-1 指紋（Debug 版本）
- [ ] 已將 SHA-1 加入 Firebase Console
- [ ] 已重新下載更新後的 `google-services.json`
- [ ] 已在 Firebase Console 啟用 Google 登入
  - Authentication → Sign-in method → Google → 啟用

### 驗證設定是否正確

1. 在 Android 裝置或模擬器上安裝 App
2. 點擊「Google 登入」按鈕
3. 應該會顯示 Google 帳號選擇畫面
4. 選擇帳號後應該能成功登入

如果失敗，檢查：
- Logcat 中的錯誤訊息
- SHA-1 是否正確加入
- `google-services.json` 是否為最新版本

---

## ❓ 常見問題

### Q1: Web 版本正常，但 Android App 登入失敗？

**原因**：SHA-1 指紋未加入或不正確。

**解決方式**：
1. 重新取得 SHA-1 指紋（參考「4.1 取得 SHA-1 指紋」）
2. 確認已加入 Firebase Console
3. 重新下載 `google-services.json`
4. 重新建置 App

### Q2: Android Studio 建置失敗，提示 google-services.json 錯誤？

**原因**：檔案路徑不正確或檔案損壞。

**解決方式**：
1. 確認檔案位置：`android/app/google-services.json`（不是 `android/google-services.json`）
2. 重新從 Firebase Console 下載檔案
3. Clean Project：`Build` → `Clean Project`
4. Rebuild Project：`Build` → `Rebuild Project`

### Q3: Vite 建置警告 chunk size 過大？

**原因**：Firebase SDK 體積較大（~700KB）。

**說明**：這是正常現象，不影響功能。如需優化可考慮：
- 使用 dynamic import() 分割程式碼
- 調整 `build.rollupOptions.output.manualChunks`

### Q4: 在 Project IDX 中找不到 Android Studio？

**原因**：需要手動開啟。

**解決方式**：
```bash
npx cap open android
```

### Q5: 如何更新 Capacitor 版本？

```bash
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
npx cap sync
```

---

## 📚 相關資源

- [Vite 官方文檔](https://vitejs.dev/)
- [Capacitor 官方文檔](https://capacitorjs.com/)
- [Firebase 官方文檔](https://firebase.google.com/docs)
- [Project IDX 官方文檔](https://developers.google.com/idx)
- [Android Studio 下載](https://developer.android.com/studio)

---

## 📝 版本記錄

- **v1.0.0-capacitor** (2026-01-08)
  - 完成 Vite 遷移
  - 整合 Capacitor 與 Android 支援
  - 實作雙平台登入邏輯
  - 新增 Project IDX 配置

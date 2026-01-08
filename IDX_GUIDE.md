# Google Project IDX 完整操作指南

## 📋 前置準備檢查清單

- [x] 已更新 `google-services.json`（包含 SHA-1 指紋）
- [x] 已提交並推送到 GitHub
- [ ] 準備開始使用 Project IDX

---

## 🚀 步驟 1：匯入專案到 Project IDX

### 1.1 開啟 Project IDX

1. 前往 https://idx.google.com/
2. 使用你的 Google 帳號登入

### 1.2 匯入 GitHub 倉庫

1. 點擊「Import from GitHub」
2. 授權 Project IDX 訪問你的 GitHub 帳號
3. 選擇倉庫：`b09901017/baobu_money_track`
4. 點擊「Import」

### 1.3 等待環境初始化

IDX 會自動執行以下動作：
- 讀取 `.idx/dev.nix` 配置
- 安裝 Node.js、Java JDK 17、Android SDK
- 執行 `npm install` 安裝依賴
- 配置 Android 開發環境

**預計等待時間：** 3-5 分鐘（首次匯入）

---

## 🔧 步驟 2：修復 Firebase 配置檔案（重要！）

### 2.1 問題說明

由於 `config/firebase.config.js` 包含 API Key，已被 `.gitignore` 排除，不會上傳到 GitHub。
因此在 IDX 中需要手動建立這個檔案。

### 2.2 建立 Firebase 配置檔案

在 IDX 終端機中執行以下指令：

```bash
# 建立 config 目錄（如果不存在）
mkdir -p config

# 建立 firebase.config.js
cat > config/firebase.config.js << 'EOF'
// ==================== Firebase 配置檔案（真實配置）====================
// ⚠️ 此檔案包含敏感資訊，已被 .gitignore 排除，不會上傳到 GitHub

export const firebaseConfig = {
    apiKey: "AIzaSyBljCwLMZG1sQOc_CceZ872q2PsBmJ-g3k",
    authDomain: "baobu-app.firebaseapp.com",
    projectId: "baobu-app",
    storageBucket: "baobu-app.firebasestorage.app",
    messagingSenderId: "106168212860",
    appId: "1:106168212860:web:344654c947143b636318f9",
    measurementId: "G-YJ6SY4YGJK"
};
EOF
```

### 2.3 驗證設定成功

等待 Vite 自動重新載入（約 1-2 秒），應該會在終端機看到：

```
✅ Firebase 已初始化 (via Vite)
📦 專案 ID: baobu-app
✅ 離線持久化已啟用
```

**如果仍有錯誤**，手動重啟 Vite：
```bash
# 按 Ctrl+C 停止 Vite
# 重新啟動
npm run dev
```

---

## 🛠️ 步驟 3：驗證環境設定

### 3.1 檢查 Node.js 環境

在 IDX 終端機中執行：

```bash
node --version   # 應該顯示 v20.x.x
npm --version    # 應該顯示 10.x.x
```

### 3.2 檢查 Java 環境

```bash
java -version    # 應該顯示 17.0.x
```

### 3.3 檢查 Android SDK

```bash
echo $ANDROID_HOME   # 應該顯示 Android SDK 路徑
```

### 3.4 檢查 Gradle

```bash
cd android
./gradlew --version
```

如果一切正常，應該會顯示：
```
Gradle 8.11.1
Kotlin: 2.0.20
JVM: 17.0.x
```

---

## 📱 步驟 4：啟動 Android 開發環境

### 4.1 同步 Capacitor

```bash
# 確保在專案根目錄
npm run build       # 建置 Web 資源
npx cap sync        # 同步到 Android
```

### 4.2 開啟 Android Studio

```bash
npx cap open android
```

**注意：** Project IDX 會在雲端啟動 Android Studio，可能需要等待 1-2 分鐘。

### 4.3 等待 Gradle Sync 完成

Android Studio 開啟後會自動執行：
1. Gradle Sync（同步依賴）
2. 索引專案檔案

你可以在 Android Studio 底部看到進度條，等待完成即可。

---

## 🔑 步驟 5：取得 IDX 環境的 SHA-1 指紋（重要！）

### 5.1 在 IDX 終端機執行

```bash
cd android
./gradlew signingReport
```

### 5.2 找到 Debug 版本的 SHA-1

在輸出中找到：

```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: AndroidDebugKey
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

複製 `SHA1:` 後面的指紋（格式如 `AA:BB:CC:...`）

### 5.3 加入到 Firebase Console

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `baobu-app`
3. 點擊「專案設定」（齒輪圖示）
4. 選擇「一般」標籤
5. 滾動到「您的應用程式」區域
6. 找到 Android 應用程式 (`com.baobu.moneytrack`)
7. 點擊「新增指紋」
8. 貼上剛才複製的 SHA-1 指紋
9. 點擊「儲存」

**注意：** 這個 SHA-1 與你本地的**不同**，因為 IDX 使用雲端環境的金鑰。

### 5.4 更新 google-services.json

1. 在 Firebase Console 同一頁面，點擊「下載 google-services.json」
2. **重要：** 檔案會下載到你的本地電腦
3. 在 IDX 中，上傳這個新檔案到 `android/app/google-services.json`

**上傳方式：**
- 方法 1：在 IDX 檔案總管中，右鍵點擊 `android/app` → 「上傳檔案」→ 選擇剛下載的 `google-services.json`
- 方法 2：直接將檔案內容複製貼上到 IDX 編輯器

---

## 🚀 步驟 6：建置 APK（在 IDX 中）

### 6.1 使用 Android Studio（圖形介面）

1. 在 Android Studio 中，點擊 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. 等待建置完成（首次可能需要 5-10 分鐘）
3. APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 6.2 使用 Gradle 指令（推薦）

在 IDX 終端機中：

```bash
cd android
./gradlew assembleDebug
```

建置完成後，APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 步驟 7：測試 APK

### 7.1 使用 IDX 內建模擬器

1. 點擊 IDX 右上角「Android」圖示
2. 選擇模擬器裝置（建議 Pixel 5, API 33）
3. 點擊「啟動模擬器」
4. 等待模擬器啟動（2-3 分鐘）
5. 在 Android Studio 中點擊「Run」按鈕（綠色三角形）

### 7.2 下載 APK 到本地測試

1. 在 IDX 檔案總管中，找到 `android/app/build/outputs/apk/debug/app-debug.apk`
2. 右鍵點擊 → 「下載」
3. 將 APK 傳送到你的 Android 手機
4. 在手機上安裝並測試

**重要：** 測試 Google 登入功能，確保 SHA-1 設定正確！

---

## ✅ 步驟 8：驗證 Google 登入

### 8.1 測試流程

1. 在 Android 裝置或模擬器上開啟 App
2. 點擊「Google 登入」按鈕
3. 應該會顯示 Google 帳號選擇畫面
4. 選擇帳號後應該能成功登入

### 8.2 如果登入失敗

**檢查 Logcat（Android Studio）：**

1. 在 Android Studio 中，點擊「Logcat」分頁
2. 搜尋 `FirebaseAuth` 或 `GoogleSignIn`
3. 查看錯誤訊息

**常見錯誤：**

| 錯誤訊息 | 原因 | 解決方式 |
|---------|------|---------|
| `API_NOT_CONNECTED` | SHA-1 未加入或不正確 | 重新執行步驟 4 |
| `DEVELOPER_ERROR` | `google-services.json` 未更新 | 重新執行步驟 4.4 |
| `NETWORK_ERROR` | 網路問題 | 檢查網路連線 |

---

## 🔄 步驟 9：同步變更回本地

### 9.1 在 IDX 中提交變更

```bash
git add android/app/google-services.json
git commit -m "chore: update google-services.json with IDX SHA-1"
git push origin main
```

### 9.2 在本地同步

```bash
git pull origin main
```

---

## 📊 建議工作流程

### 開發階段

1. **本地開發 Web 版本**
   ```bash
   npm run dev
   ```

2. **在 IDX 測試 Android 版本**
   - 推送程式碼到 GitHub
   - 在 IDX 中 pull 最新程式碼
   - 執行 `npm run build && npx cap sync`
   - 在模擬器中測試

### 發布階段

1. **在 IDX 建置 Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **下載 APK 並發布**
   - 下載 `app-release.apk`
   - 上傳到 Google Play Console

---

## 💡 常見問題

### Q1: IDX 環境需要重新配置嗎？

**答：** 不需要！`.idx/dev.nix` 已經配置好，每次開啟專案都會自動設定。

### Q2: 可以在 IDX 和本地同時開發嗎？

**答：** 可以！建議：
- 本地：Web 開發 + 快速測試
- IDX：Android 建置 + 模擬器測試

### Q3: IDX 模擬器效能如何？

**答：** 與本地 Android Emulator 相當，但受網路延遲影響。建議使用實體裝置測試最終版本。

### Q4: 如何在 IDX 中查看建置進度？

**答：** 在 Android Studio 底部的「Build」分頁中查看。

### Q5: 可以在 IDX 中使用 ADB 嗎？

**答：** 可以！IDX 內建 ADB 工具：
```bash
adb devices  # 查看連接的裝置
adb install path/to/app.apk  # 安裝 APK
```

---

## 🎯 下一步

- [ ] 完成 IDX 環境設定
- [ ] 建置 Debug APK 並測試
- [ ] 驗證 Google 登入功能
- [ ] 建置 Release APK（正式版本）
- [ ] 準備發布到 Google Play

---

## 📚 相關資源

- [Project IDX 官方文檔](https://developers.google.com/idx)
- [Capacitor Android 文檔](https://capacitorjs.com/docs/android)
- [Firebase Android 設定指南](https://firebase.google.com/docs/android/setup)
- [Android Debug Keystore 說明](https://developer.android.com/studio/publish/app-signing)

---

**最後更新：** 2026-01-08
**建立者：** Claude Code

# Google Project IDX 故障排除指南

> 本文檔記錄在 Google Project IDX 環境中建置 Android APK 時遇到的所有問題及解決方案

---

## 📋 目錄

- [問題 1: Firebase 配置檔案遺失](#問題-1-firebase-配置檔案遺失)
- [問題 2: gradlew 權限被拒](#問題-2-gradlew-權限被拒)
- [問題 3: Capacitor 檔案遺失](#問題-3-capacitor-檔案遺失)
- [問題 4: Android SDK 路徑找不到](#問題-4-android-sdk-路徑找不到)
- [問題 5: SDK Platform 35 無法寫入](#問題-5-sdk-platform-35-無法寫入)
- [問題 6: Java 21 vs Java 17 不相容（關鍵問題）](#問題-6-java-21-vs-java-17-不相容關鍵問題)

---

## 問題 1: Firebase 配置檔案遺失

### ❌ 錯誤訊息
```
Failed to resolve import "../config/firebase.config.js" from "src/firebaseInit.js"
```

### 🔍 原因分析
- `config/firebase.config.js` 包含敏感的 Firebase API Key
- 已被 `.gitignore` 排除，不會上傳到 GitHub
- IDX 匯入專案時缺少這個檔案

### ✅ 解決方案

在 **IDX 終端機**中執行：

```bash
# 建立 config 目錄
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

### 🎯 驗證結果
等待 Vite 自動重新載入，應該會在終端機看到：
```
✅ Firebase 已初始化 (via Vite)
📦 專案 ID: baobu-app
✅ 離線持久化已啟用
```

---

## 問題 2: gradlew 權限被拒

### ❌ 錯誤訊息
```bash
bash: ./gradlew: Permission denied
```

### 🔍 原因分析
- `gradlew` 腳本沒有執行權限
- 從 GitHub clone 下來的檔案可能遺失執行權限

### ✅ 解決方案

```bash
cd android
chmod +x gradlew
```

### 🎯 驗證結果
再次執行 `./gradlew signingReport` 應該可以正常運行

---

## 問題 3: Capacitor 檔案遺失

### ❌ 錯誤訊息
```
Could not read script '/home/user/baobu_money_track/android/capacitor-cordova-android-plugins/cordova.variables.gradle' as it does not exist.
```

### 🔍 原因分析
- Capacitor 自動生成的檔案不在 Git 版本控制中
- 需要執行 `npx cap sync` 來生成這些檔案

### ✅ 解決方案

```bash
# 回到專案根目錄
cd ~/baobu_money_track

# 建置 Web 資源
npm run build

# 同步 Capacitor 檔案
npx cap sync
```

### 🎯 驗證結果
`android/capacitor-cordova-android-plugins/` 目錄應該會被建立，包含所有必要的 Gradle 檔案

---

## 問題 4: Android SDK 路徑找不到

### ❌ 錯誤訊息
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file
```

### 🔍 原因分析
- Gradle 找不到 Android SDK 安裝路徑
- `local.properties` 檔案遺失（這個檔案不在 Git 版本控制中）

### ✅ 解決方案

1. 先找出 IDX 環境中的 SDK 路徑：
```bash
echo $ANDROID_HOME
```

預期輸出類似：
```
/nix/store/99kpar230sl91y6wzwhk1l7s8dpzs2xd-androidsdk/libexec/android-sdk
```

2. 建立 `local.properties` 檔案：
```bash
cd android

cat > local.properties << 'EOF'
sdk.dir=/nix/store/99kpar230sl91y6wzwhk1l7s8dpzs2xd-androidsdk/libexec/android-sdk
EOF
```

**注意：** 請使用你實際的 `$ANDROID_HOME` 路徑！

### 🎯 驗證結果
再次執行 Gradle 指令應該可以找到 SDK 路徑

---

## 問題 5: SDK Platform 35 無法寫入

### ❌ 錯誤訊息
```
Failed to install the following Android SDK packages as some licences have not been accepted.
platforms;android-35 Android SDK Platform 35
The SDK directory (/nix/store/.../android-sdk) is not writable
```

### 🔍 原因分析
- `variables.gradle` 設定使用 `compileSdk 35`
- IDX 環境的 Nix Store 是唯讀的，無法下載新的 SDK Platform
- IDX 只預裝了 Platform 36

### ✅ 解決方案

修改 `android/variables.gradle`，將 SDK 版本改為 36：

```bash
cd android

sed -i 's/compileSdkVersion = 35/compileSdkVersion = 36/' variables.gradle
sed -i 's/targetSdkVersion = 35/targetSdkVersion = 36/' variables.gradle
```

驗證修改：
```bash
grep -n "SdkVersion" variables.gradle
```

應該看到：
```
3:    minSdkVersion = 24
4:    compileSdkVersion = 36
5:    targetSdkVersion = 36
```

### 🎯 驗證結果
不再出現嘗試下載 Platform 35 的錯誤

---

## 問題 6: Java 21 vs Java 17 不相容（關鍵問題）

### ❌ 錯誤訊息
```
> Task :app:compileDebugJavaWithJavac FAILED
> error: invalid source release: 21
```

### 🔍 原因分析
- **Capacitor 8.0.0** 預設要求 **Java 21**
- **Google Project IDX** 環境只提供 **Java 17**
- 多個 Gradle 檔案中硬編碼了 `JavaVersion.VERSION_21`

### 📊 影響範圍

執行以下指令找出所有使用 Java 21 的檔案：
```bash
cd android
grep -r "VERSION_21" . --include="*.gradle"
```

結果顯示以下檔案需要修改：
1. `node_modules/@capacitor/android/**/*.gradle` (Capacitor 核心)
2. `node_modules/@capacitor-firebase/authentication/**/*.gradle` (Firebase 插件)
3. `android/app/capacitor.build.gradle` (自動生成的建置檔案)
4. `android/capacitor-cordova-android-plugins/build.gradle` (Cordova 插件)

### ✅ 解決方案（完整步驟）

#### 步驟 1: 修改 Capacitor Android 核心模組

```bash
cd ~/baobu_money_track

# 修改所有 Capacitor Android 相關的 Gradle 檔案
find node_modules/@capacitor/android -name "*.gradle" -exec sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' {} \;
```

#### 步驟 2: 修改 Capacitor Firebase 插件

```bash
# 修改所有 Firebase 插件的 Gradle 檔案
find node_modules/@capacitor-firebase -name "*.gradle" -exec sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' {} \;
```

#### 步驟 3: 修改 Android 專案中的自動生成檔案

```bash
cd android

# 修改 app/capacitor.build.gradle
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' app/capacitor.build.gradle

# 修改 capacitor-cordova-android-plugins/build.gradle
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' capacitor-cordova-android-plugins/build.gradle
```

#### 步驟 4: 修改 app/build.gradle（手動設定）

在 `android/app/build.gradle` 的 `android {}` 區塊最前面加入：

```bash
# 使用 sed 自動插入（在 android { 之後）
sed -i '/android {/a\    compileOptions {\n        sourceCompatibility = JavaVersion.VERSION_17\n        targetCompatibility = JavaVersion.VERSION_17\n    }' app/build.gradle
```

驗證插入結果：
```bash
head -n 10 app/build.gradle
```

應該看到：
```gradle
apply plugin: 'com.android.application'

android {
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    namespace "com.baobu.moneytrack"
    compileSdk rootProject.ext.compileSdkVersion
    ...
}
```

#### 步驟 5: 清理並重新建置

```bash
cd android

# 清理之前的建置
./gradlew clean

# 重新建置 APK
./gradlew assembleDebug
```

### 🎯 驗證結果

成功的建置輸出應該類似：
```
BUILD SUCCESSFUL in 10s
118 actionable tasks: 118 executed
```

APK 位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

確認 APK 存在：
```bash
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔧 完整的 IDX 建置腳本（一鍵執行）

如果你重新匯入專案或遇到相同問題，可以使用以下腳本一次性修復所有問題：

```bash
#!/bin/bash
# IDX Android Build Fix Script

echo "🔧 開始修復 IDX 環境中的 Android 建置問題..."

# 1. 建立 Firebase 配置檔案
echo "📝 步驟 1/7: 建立 Firebase 配置檔案"
mkdir -p ~/baobu_money_track/config
cat > ~/baobu_money_track/config/firebase.config.js << 'EOF'
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

# 2. 修正 gradlew 權限
echo "🔑 步驟 2/7: 修正 gradlew 權限"
chmod +x ~/baobu_money_track/android/gradlew

# 3. 同步 Capacitor
echo "🔄 步驟 3/7: 同步 Capacitor"
cd ~/baobu_money_track
npm run build
npx cap sync

# 4. 建立 local.properties
echo "📍 步驟 4/7: 設定 Android SDK 路徑"
cat > ~/baobu_money_track/android/local.properties << EOF
sdk.dir=$ANDROID_HOME
EOF

# 5. 修改 SDK 版本為 36
echo "🔧 步驟 5/7: 修改 SDK 版本為 36"
cd ~/baobu_money_track/android
sed -i 's/compileSdkVersion = 35/compileSdkVersion = 36/' variables.gradle
sed -i 's/targetSdkVersion = 35/targetSdkVersion = 36/' variables.gradle

# 6. 修復 Java 版本為 17
echo "☕ 步驟 6/7: 修復所有 Gradle 檔案的 Java 版本"
cd ~/baobu_money_track

# Capacitor Android
find node_modules/@capacitor/android -name "*.gradle" -exec sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' {} \;

# Capacitor Firebase
find node_modules/@capacitor-firebase -name "*.gradle" -exec sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' {} \;

# Android 專案檔案
cd android
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' app/capacitor.build.gradle
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' capacitor-cordova-android-plugins/build.gradle

# app/build.gradle
sed -i '/android {/a\    compileOptions {\n        sourceCompatibility = JavaVersion.VERSION_17\n        targetCompatibility = JavaVersion.VERSION_17\n    }' app/build.gradle

# 7. 建置 APK
echo "🚀 步驟 7/7: 建置 Debug APK"
./gradlew clean assembleDebug

echo "✅ 完成！APK 位置："
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
```

將以上腳本儲存為 `fix-idx-build.sh`，然後執行：
```bash
chmod +x fix-idx-build.sh
./fix-idx-build.sh
```

---

## 💡 常見問題 FAQ

### Q1: 為什麼每次 `npx cap sync` 後又會出現 Java 21 錯誤？

**A:** 因為 `npx cap sync` 會重新生成 `app/capacitor.build.gradle` 和 `capacitor-cordova-android-plugins/build.gradle`，覆蓋掉我們的修改。

**解決方案：**
每次執行 `npx cap sync` 後，記得重新執行步驟 6 的修復指令：
```bash
cd android
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' app/capacitor.build.gradle
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' capacitor-cordova-android-plugins/build.gradle
```

### Q2: 能不能升級 IDX 的 Java 版本到 21？

**A:** 不行。IDX 的 Nix 環境預設只提供 Java 17。要使用 Java 21 需要修改 `.idx/dev.nix` 設定檔，但 Capacitor 8.0.0 的 Java 21 支援在 Nix 環境中可能會有其他相容性問題。

**建議：**
- 短期：使用本文檔的 Java 17 修復方案
- 長期：等待 Capacitor 或 IDX 更新，或考慮降級 Capacitor 到 7.x 版本

### Q3: 為什麼要修改 `node_modules` 中的檔案？

**A:** 因為 Capacitor 的 Gradle 設定檔案都在 `node_modules` 中，而這些檔案會被引入到 Android 建置流程。

**注意：**
- 如果執行 `npm install` 會重新下載 `node_modules`，需要重新修復
- 建議將修復指令整理成腳本，方便重複使用

### Q4: 本地環境和 IDX 環境的 SHA-1 不同，怎麼辦？

**A:** 這是正常的！因為兩個環境使用不同的 Debug Keystore。

**解決方案：**
1. 在 Firebase Console 的同一個 App 中**同時新增兩個 SHA-1**：
   - 本地環境的 SHA-1
   - IDX 環境的 SHA-1
2. 重新下載 `google-services.json`（會包含兩個 SHA-1）
3. 將新的 `google-services.json` 同時更新到本地和 IDX

### Q5: 如何確認修復成功？

**A:** 執行以下檢查：

```bash
# 1. 檢查所有 VERSION_21 是否已被替換
cd android
grep -r "VERSION_21" . --include="*.gradle"
# 應該沒有任何輸出

# 2. 檢查 Java 版本設定
grep -r "VERSION_17" . --include="*.gradle"
# 應該看到多個檔案顯示 VERSION_17

# 3. 確認 APK 存在且大小合理
ls -lh app/build/outputs/apk/debug/app-debug.apk
# 應該顯示檔案大小（約 5-10 MB）
```

---

## 📚 參考資源

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Gradle Java Toolchain](https://docs.gradle.org/current/userguide/toolchains.html)
- [Google Project IDX Docs](https://developers.google.com/idx)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)

---

**最後更新：** 2026-01-08
**適用版本：**
- Capacitor: 8.0.0
- Java: 17.0.7 (IDX 環境)
- Gradle: 8.11.1
- Android SDK Platform: 36

**建立者：** Claude Code + 開發者除錯紀錄

# Android APK 建置完整指南

## 📋 問題排查與解決歷程

### 🔴 問題現象
在 Android APK 中點擊 Google 登入按鈕時出現錯誤：
```
登入失敗: Attempt to invoke virtual method 'void io.capawesome.capacitorjs.plugins.firebase.authentication.handlers.GoogleAuthProviderHandler.signIn(com.getcapacitor.PluginCall)' on a null object reference
```

### 🔍 試錯過程

#### 嘗試 1：檢查 SHA-1 指紋配置
**假設：** Google Sign-In 失敗可能是 SHA-1 指紋未正確配置
**結果：** ❌ SHA-1 已正確加入 Firebase Console，但問題依舊

#### 嘗試 2：重新下載 google-services.json
**假設：** `google-services.json` 可能未包含最新的 SHA-1
**結果：** ❌ 已包含正確的 SHA-1，但問題依舊

#### 嘗試 3：在 MainActivity.java 明確註冊插件
**假設：** Firebase Authentication 插件可能未自動註冊
**修改：**
```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin.class);
    }
}
```
**結果：** ❌ 插件已註冊，但 GoogleAuthProviderHandler 仍為 null

#### 嘗試 4：解決 Java 版本衝突
**問題：** Capacitor 8.0.0 預設使用 Java 21，但本地環境只有 Java 17
**修改：**
- `android/app/capacitor.build.gradle`：Java 21 → Java 17
- `android/app/build.gradle`：加入 `compileOptions`
**結果：** ✅ 建置成功，但 Google 登入仍失敗

#### 嘗試 5：深入分析插件源碼 ⭐ **根本原因**
**發現：** 在 `FirebaseAuthentication.java` 的 `initAuthProviderHandlers` 方法中：
```java
private void initAuthProviderHandlers(FirebaseAuthenticationConfig config) {
    List<String> providerList = Arrays.asList(config.getProviders());
    if (providerList.contains(ProviderId.GOOGLE)) {
        googleAuthProviderHandler = new GoogleAuthProviderHandler(this);
        // ...
    }
}
```

**關鍵發現：** `GoogleAuthProviderHandler` 只有在配置中包含 `"google.com"` provider 時才會初始化！

**原始配置：**
```json
{
  "appId": "com.baobu.moneytrack",
  "appName": "BaobuMoneyTrack",
  "webDir": "dist"
}
```

**修正後配置：**
```json
{
  "appId": "com.baobu.moneytrack",
  "appName": "BaobuMoneyTrack",
  "webDir": "dist",
  "plugins": {
    "FirebaseAuthentication": {
      "skipNativeAuth": false,
      "providers": ["google.com"]
    }
  }
}
```

**結果：** ✅ **成功！** Google 登入功能正常運作

---

## ✅ 最終解決方案

### 1. 配置 Capacitor Firebase Authentication

**檔案：** `capacitor.config.json`

```json
{
  "appId": "com.baobu.moneytrack",
  "appName": "BaobuMoneyTrack",
  "webDir": "dist",
  "plugins": {
    "FirebaseAuthentication": {
      "skipNativeAuth": false,
      "providers": ["google.com"]
    }
  }
}
```

### 2. 修正 Java 版本（本地環境）

**問題：** Capacitor 8.0.0 預設 Java 21，但本地環境只有 Java 17

**檔案：** `android/app/capacitor.build.gradle`

```gradle
android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17
      targetCompatibility JavaVersion.VERSION_17
  }
}
```

**注意：** 此檔案會在每次 `npx cap sync` 後重新生成，需要重新修改！

### 3. 明確註冊插件（可選，但建議）

**檔案：** `android/app/src/main/java/com/baobu/moneytrack/MainActivity.java`

```java
package com.baobu.moneytrack;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(io.capawesome.capacitorjs.plugins.firebase.authentication.FirebaseAuthenticationPlugin.class);
    }
}
```

---

## 🚀 完整建置流程

### 步驟 1：同步 Capacitor 配置
```bash
npx cap sync
```

### 步驟 2：修正 Java 版本（每次 sync 後都要做）
```bash
# 修改 android/app/capacitor.build.gradle
# 將 JavaVersion.VERSION_21 改為 JavaVersion.VERSION_17
```

或使用指令：
```bash
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle
```

### 步驟 3：建置 APK
```bash
cd android
./gradlew clean assembleDebug
```

### 步驟 4：安裝測試
APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚠️ 常見問題

### Q1: 為什麼每次 `npx cap sync` 後 Java 版本又變回 21？
**答：** `capacitor.build.gradle` 是自動生成的檔案，Capacitor 8.0.0 預設使用 Java 21。解決方案：
- 每次 sync 後重新修改該檔案
- 或升級本地 JDK 到 Java 21

### Q2: 如何確認 GoogleAuthProviderHandler 是否正確初始化？
**答：** 檢查以下兩點：
1. `capacitor.config.json` 中包含 `"providers": ["google.com"]`
2. `android/app/src/main/assets/capacitor.config.json` 也包含相同配置（sync 後自動生成）

### Q3: Google 登入仍失敗怎麼辦？
**答：** 檢查以下項目：
1. Firebase Console 中是否已加入正確的 SHA-1 指紋
2. `google-services.json` 是否為最新版本
3. `capacitor.config.json` 是否包含 Google provider 配置
4. 手機是否有網路連線

---

## 📊 技術總結

### 根本原因
Capacitor Firebase Authentication 插件採用**按需初始化**策略，只有在配置中明確聲明的 provider 才會初始化對應的 Handler。

### 關鍵程式碼
```java
// FirebaseAuthentication.java (line 900-915)
private void initAuthProviderHandlers(FirebaseAuthenticationConfig config) {
    List<String> providerList = Arrays.asList(config.getProviders());
    if (providerList.contains(ProviderId.GOOGLE)) {
        googleAuthProviderHandler = new GoogleAuthProviderHandler(this);
        // ...
    }
}
```

### 設計考量
- **優點：** 減少 APK 大小，只載入需要的認證方式
- **缺點：** 配置不當會導致 NullPointerException

---

## 📝 下次注意事項

### 1. 使用 Capacitor 插件前先查看官方文檔
- 確認是否需要特殊配置
- 檢查 `capacitor.config.json` 的必要設定

### 2. 遇到 NullPointerException 時
- 先檢查配置是否完整
- 查看插件源碼的初始化邏輯
- 不要只關注錯誤訊息，要理解為什麼物件為 null

### 3. 注意自動生成的檔案
- `capacitor.build.gradle` 會在每次 sync 後重新生成
- 需要建立自動化腳本或記住手動修改

### 4. Java 版本管理
- Capacitor 8.x 預設 Java 21
- 如果環境只有 Java 17，需要手動降級配置
- 考慮升級 JDK 以避免版本衝突

---

## 🎯 最佳實踐

### 建立建置腳本（避免重複修改）

**檔案：** `build-android.sh`

```bash
#!/bin/bash

echo "🚀 開始建置 Android APK..."

# 1. 同步 Capacitor
echo "📦 同步 Capacitor..."
npx cap sync

# 2. 修正 Java 版本
echo "🔧 修正 Java 版本..."
sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle

# 3. 建置 APK
echo "🔨 建置 APK..."
cd android
./gradlew clean assembleDebug

echo "✅ 建置完成！"
echo "📱 APK 位置：android/app/build/outputs/apk/debug/app-debug.apk"
```

使用方式：
```bash
chmod +x build-android.sh
./build-android.sh
```

---

**最後更新：** 2026-01-09
**建立者：** Claude Code
**狀態：** ✅ 已驗證可用

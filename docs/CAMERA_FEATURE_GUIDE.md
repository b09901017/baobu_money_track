# 📷 拍照功能使用指南

## 功能概述

在新增花費表單中,點擊「貼上照片」按鈕,現在可以選擇:
- **📷 拍照** - 直接開啟相機拍攝照片
- **🖼️ 從相簿選擇** - 從手機相簿選擇現有照片

## 實作方式

### 技術架構
- 使用 **@capacitor/camera** 插件
- 自動偵測環境:
  - **行動裝置 (Android/iOS)**: 顯示拍照/相簿選項對話框
  - **網頁版 (桌面/筆電)**: 直接開啟檔案選擇器

### 程式碼修改

#### 1. TransactionForm.js
- **新增方法**: `showPhotoSourceDialog()` - 顯示照片來源選擇對話框
- **新增方法**: `dataUrlToBlob()` - 將相機回傳的 DataURL 轉換為 File 物件
- **保留方法**: `handlePhotoUpload()` - 處理從檔案選擇器上傳的照片

#### 2. EventBinder.js
- **修改**: `bindPhotoUpload()` - 將按鈕點擊事件改為呼叫 `showPhotoSourceDialog()`

## 使用流程

### 行動裝置 (Android App)
1. 點擊表單中的「貼上照片」區域
2. 彈出對話框:
   - 點擊「📷 拍照」→ 開啟相機拍照
   - 點擊「🖼️ 從相簿選擇」→ 開啟相簿選擇照片
3. 選擇/拍攝照片後,自動顯示預覽
4. 提交表單時,照片會一併上傳到 Firebase Storage

### 網頁版 (桌面瀏覽器)
1. 點擊表單中的「貼上照片」區域
2. 直接開啟檔案選擇器
3. 選擇本地照片檔案
4. 自動顯示預覽並上傳

## ⚠️ 已知問題與解決方案

### Java 版本衝突（已解決）

**問題：** 建置 APK 時出現錯誤 `error: invalid source release: 21`

**原因：** Camera Plugin (v8.0.0) 預設使用 Java 21,但本地環境為 Java 17

**解決方案：** 已在 `android/build.gradle` 中全域設定 Java 17（詳見 [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md#-camera-plugin-java-版本問題-v634)）

```gradle
allprojects {
    afterEvaluate { project ->
        if (project.hasProperty("android")) {
            project.android {
                compileOptions {
                    sourceCompatibility = JavaVersion.VERSION_17
                    targetCompatibility = JavaVersion.VERSION_17
                }
            }
        }
    }
}
```

---

## 測試方式

### 本地開發環境測試
```bash
# 啟動本地伺服器
npx http-server -p 8080

# 訪問 http://localhost:8080
# 點擊 FAB 按鈕 → 點擊「貼上照片」
# 應該直接開啟檔案選擇器（網頁版行為）
```

### Android App 測試
```bash
# 1. 同步 Capacitor 配置
npx cap sync

# 2. 建置 APK（記得修正 Java 版本）
cd android
./gradlew clean assembleDebug

# 3. 安裝到手機
adb install app/build/outputs/apk/debug/app-debug.apk

# 4. 開啟 App,測試拍照功能
# - 點擊 FAB 按鈕 → 點擊「貼上照片」
# - 應該顯示「請選擇照片來源」對話框
# - 測試拍照與相簿選擇功能
```

## 權限需求

### Android (已自動配置)
Camera Plugin 會自動新增以下權限到 AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS (未測試)
需要在 `Info.plist` 中新增:
```xml
<key>NSCameraUsageDescription</key>
<string>需要使用相機拍攝照片記錄花費</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要存取相簿選擇照片</string>
```

## 錯誤處理

### 使用者取消
- 如果使用者在選擇畫面取消操作,不會顯示錯誤訊息
- 偵測方式: `error.message.includes('User cancelled')`

### 權限拒絕
- 如果使用者拒絕相機/相簿權限,會顯示錯誤訊息
- 建議引導使用者到設定中開啟權限

### 照片大小限制
- 最大檔案大小: 10MB
- 超過限制會顯示錯誤訊息

## 注意事項

1. **環境偵測**
   - 使用 `window.Capacitor.isNativePlatform()` 判斷是否為原生 App
   - 網頁版不會顯示拍照選項

2. **照片格式**
   - 相機拍攝: 自動存為 JPEG 格式 (quality: 90)
   - 檔案選擇器: 支援 JPG、PNG、WEBP

3. **未來優化建議**
   - 可加入照片壓縮功能,減少上傳時間
   - 可加入照片編輯功能 (裁切、旋轉)
   - 可加入多張照片上傳功能

## 相關檔案

- [js/components/TransactionForm.js](../js/components/TransactionForm.js:389-453) - 主要實作邏輯
- [js/core/EventBinder.js](../js/core/EventBinder.js:135-156) - 事件綁定
- [capacitor.config.json](../capacitor.config.json) - Capacitor 配置
- [docs/ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) - Android 建置指南

## 版本記錄

- **v6.3.4** (2026-01-11) - 新增拍照功能
  - 整合 @capacitor/camera 插件
  - 支援拍照與相簿選擇
  - 自動偵測環境 (原生 App vs 網頁版)

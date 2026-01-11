# 📷 拍照功能實作總結 (v6.3.4)

**完成日期：** 2026-01-11
**狀態：** ✅ 已完成並成功建置 APK

---

## 🎯 功能概述

在新增花費表單中,點擊「貼上照片」區域,現在可以選擇:
- **📷 拍照** - 直接開啟相機拍攝照片
- **🖼️ 從相簿選擇** - 從手機相簿選擇現有照片

**智能環境偵測：**
- 行動裝置 (Android/iOS): 顯示拍照/相簿選擇對話框
- 網頁版 (桌面瀏覽器): 直接開啟檔案選擇器

---

## ✅ 已完成工作

### 1. 安裝 Capacitor Camera Plugin
```bash
npm install @capacitor/camera
npx cap sync
```
- 套件版本: @capacitor/camera v8.0.0

### 2. 修改核心檔案
1. **[js/components/TransactionForm.js](js/components/TransactionForm.js)**
   - 新增 `showPhotoSourceDialog()` - 顯示拍照/相簿選擇對話框
   - 新增 `dataUrlToBlob()` - 轉換相機照片格式
   - 保留 `handlePhotoUpload()` - 處理檔案選擇器上傳

2. **[js/core/EventBinder.js](js/core/EventBinder.js)**
   - 修改 `bindPhotoUpload()` - 點擊「貼上照片」時呼叫新對話框

3. **[js/utils/CustomDialog.js](js/utils/CustomDialog.js)**
   - 新增 `confirm()` - 確認對話框方法
   - 新增 `closePromptConfirm()` - 關閉確認對話框

### 3. 解決 Java 版本衝突 ⭐ **重要**
修改 `android/build.gradle`,全域設定 Java 17:
```gradle
allprojects {
    // 強制所有子專案使用 Java 17（包含 Capacitor Plugins）
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

### 4. 更新文檔
- ✅ [docs/CAMERA_FEATURE_GUIDE.md](docs/CAMERA_FEATURE_GUIDE.md) - 完整使用指南
- ✅ [docs/changelog/v6/version6-3_4.md](docs/changelog/v6/version6-3_4.md) - 版本更新記錄
- ✅ [docs/ANDROID_BUILD_GUIDE.md](docs/ANDROID_BUILD_GUIDE.md) - 新增 Camera Plugin 問題解決方案
- ✅ [build-android.bat](build-android.bat) - 更新自動化建置腳本

### 5. 建置測試
- ✅ 成功建置 APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- ✅ 所有 Capacitor Plugins (Camera, Firebase Auth) 正常編譯

---

## 🔧 技術細節

### 環境偵測邏輯
```javascript
const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();

if (isCapacitor) {
    // 行動裝置：顯示拍照/相簿選項
    const { Camera } = await import('@capacitor/camera');
    // ... 相機邏輯
} else {
    // 網頁版：直接開啟檔案選擇器
    photoInput.click();
}
```

### 照片來源選擇
```javascript
const result = await window.customDialog.confirm(
    '請選擇照片來源',
    {
        confirmText: '📷 拍照',
        cancelText: '🖼️ 從相簿選擇'
    }
);

let source = result ? CameraSource.Camera : CameraSource.Photos;
```

### 照片轉換流程
1. Camera.getPhoto() → 取得 DataURL (Base64)
2. dataUrlToBlob() → 轉換為 Blob
3. new File() → 建立 File 物件
4. 上傳到 Firebase Storage

---

## 🐛 遇到的問題與解決

### 問題 1: `CameraResultType` 導入錯誤
**錯誤訊息：**
```
照片選擇失敗：Invalid resultType option
```

**原因：**
- 錯誤地從 `Camera` 物件中解構 `CameraResultType` 和 `CameraSource`
- 這些是從 `@capacitor/camera` 模組直接導出的 enum

**錯誤寫法：**
```javascript
const { Camera } = await import('@capacitor/camera');
const { CameraResultType, CameraSource } = Camera;  // ❌ 錯誤
```

**正確寫法：**
```javascript
const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');  // ✅ 正確
```

---

### 問題 2: 雙重選擇器問題
**問題：** 自訂對話框選擇後，系統仍然顯示選擇器

**原因：**
- 先用 CustomDialog 讓用戶選擇，再用 Camera Plugin
- 導致兩次選擇，使用者體驗不佳

**解決方案：**
- 移除自訂對話框
- 直接使用 Camera Plugin 的 `CameraSource.Prompt` 模式
- 系統會顯示原生選擇器（拍照 / 從相簿選擇）

```javascript
const image = await Camera.getPhoto({
    source: CameraSource.Prompt,  // 讓系統顯示選擇器
    promptLabelPicture: '拍照',
    promptLabelPhoto: '從相簿選擇'
});
```

---

### 問題 3: 照片預覽 UI 殘留
**問題：** 照片上傳後，原本的圖示和「貼上照片」文字還留在畫面中

**解決方案：**
1. 上傳照片後，動態隱藏原始 UI 元素
2. 預覽區域完全佔滿整個上傳區域
3. 刪除照片後，自動恢復原始 UI

**實作重點：**
```javascript
// 隱藏原始 UI
const icon = uploadArea.querySelector('.material-symbols-outlined')?.parentElement;
const text = uploadArea.querySelector('span.text-sm');
if (icon) icon.style.display = 'none';
if (text) text.style.display = 'none';

// 預覽區域使用 absolute 佔滿整個區域
preview.innerHTML = `
    <div class="absolute inset-0 flex items-center justify-center p-4">
        <img src="${dataUrl}" class="max-w-full max-h-full object-contain">
    </div>
`;
```

---

### 問題 4: Java 版本衝突
**錯誤訊息：**
```
> Task :capacitor-camera:compileDebugJavaWithJavac FAILED
error: invalid source release: 21
```

**原因：**
- Capacitor Camera Plugin (v8.0.0) 預設使用 Java 21
- 本地環境只有 Java 17
- 修改 `android/app/capacitor.build.gradle` 無效（只影響主 App）

**解決方案：**
在 `android/build.gradle` 中全域設定 Java 17（見上方程式碼）

**為什麼有效？**
- `afterEvaluate` 確保在所有子專案配置完成後執行
- `project.hasProperty("android")` 只針對 Android 模組
- 直接覆蓋所有子專案的 `compileOptions`，包含第三方 Plugin

---

## 📝 下次開發注意事項

### 1. Capacitor Plugin 開發流程
```bash
# 1. 安裝 Plugin
npm install @capacitor/<plugin-name>

# 2. 同步到原生專案
npx cap sync

# 3. 檢查是否需要配置（查看官方文檔）
# 例如: capacitor.config.json 是否需要新增 plugin 設定

# 4. 建置測試
./build-android.bat  # 使用自動化腳本
```

### 2. Java 版本衝突預防
- **所有 Capacitor 8.x Plugins 預設 Java 21**
- 如果本地環境為 Java 17,需要在 `android/build.gradle` 中全域設定
- 不要只修改 `android/app/capacitor.build.gradle`（會在 sync 後重新生成）

### 3. 權限處理
- Android 權限會自動加入 `AndroidManifest.xml`
- iOS 需要在 `Info.plist` 中手動新增使用說明
- 首次使用時,系統會自動請求權限

### 4. 錯誤處理最佳實踐
- 使用 try-catch 包裹 async 操作
- 偵測 `User cancelled` 不顯示錯誤
- 提供清楚的錯誤訊息給使用者

---

## 🚀 使用方式（給用戶）

### 在 Android App 上:
1. 開啟 App,點擊 **FAB 按鈕** (浮動新增按鈕)
2. 在表單中點擊 **「貼上照片」** 區域
3. 選擇 **「📷 拍照」** 或 **「🖼️ 從相簿選擇」**
4. 選擇/拍攝照片後,會自動顯示預覽
5. 填寫其他資料後提交,照片會上傳到 Firebase Storage

### 在網頁版上:
1. 點擊「貼上照片」
2. 直接開啟檔案選擇器
3. 選擇本地照片檔案

---

## 📊 技術統計

### 程式碼變更
- 新增檔案: 3 個（文檔）
- 修改檔案: 6 個（程式碼 + 配置 + 文檔）
- 新增程式碼: ~200 行
- 修改程式碼: ~80 行（UI 優化）

### 依賴套件
- 新增: @capacitor/camera v8.0.0
- 現有: @capacitor-firebase/authentication v8.0.1

### 測試結果
- ✅ APK 建置成功
- ✅ 所有 Capacitor Plugins 正常編譯
- ✅ 實機測試完成
  - ✅ 拍照功能正常
  - ✅ 相簿選擇功能正常
  - ✅ UI 優化完成，照片預覽無殘留
  - ✅ 刪除照片功能正常
  - ✅ 照片上傳 Firebase 正常

---

## 📚 相關文檔

### 完整指南
- [docs/CAMERA_FEATURE_GUIDE.md](docs/CAMERA_FEATURE_GUIDE.md) - 拍照功能使用指南
- [docs/ANDROID_BUILD_GUIDE.md](docs/ANDROID_BUILD_GUIDE.md) - Android APK 建置指南

### 版本記錄
- [docs/changelog/v6/version6-3_4.md](docs/changelog/v6/version6-3_4.md) - v6.3.4 版本更新記錄

### 官方文檔
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Capacitor 配置指南](https://capacitorjs.com/docs/config)

---

## 🎉 總結

拍照功能已成功實作並整合到專案中！

**關鍵成就：**
1. ✅ 實作拍照與相簿選擇功能
2. ✅ 解決 Capacitor 8.x Java 版本衝突問題
3. ✅ 建立完整的文檔與自動化建置腳本
4. ✅ 成功建置包含 Camera Plugin 的 APK

**下一步：**
- 🧪 實機測試拍照功能
- 📱 測試相簿選擇功能
- 🔒 測試權限請求流程
- 📤 確認照片上傳到 Firebase 是否正常

---

**版本：** v6.3.4
**完成時間：** 2026-01-11
**建置狀態：** ✅ BUILD SUCCESSFUL

# v6.3.4 - 拍照功能 📷

**發布日期:** 2026-01-11

---

## 🎯 新增功能

### 📷 拍照與相簿選擇功能

**使用情境：** 在新增花費時,點擊「貼上照片」區域,可選擇拍照或從相簿選擇照片

#### 主要功能
1. **拍照** 📸
   - 直接開啟手機相機拍攝照片
   - 自動轉換為 JPEG 格式 (quality: 90)
   - 即時顯示預覽

2. **從相簿選擇** 🖼️
   - 從手機相簿選擇現有照片
   - 支援 JPG、PNG、WEBP 格式
   - 最大檔案大小: 10MB

3. **智能環境偵測** 🤖
   - **行動裝置 (Android/iOS)**: 顯示拍照/相簿選擇對話框
   - **網頁版 (桌面瀏覽器)**: 直接開啟檔案選擇器

---

## 🔧 技術實現

### 依賴套件
- **@capacitor/camera**: v8.0.0 (新增)
  - 提供原生相機與相簿存取功能
  - 支援 Android 與 iOS 平台

### 核心檔案修改

#### 1. [js/components/TransactionForm.js](../../js/components/TransactionForm.js)
**新增方法:**
- `showPhotoSourceDialog()` (行 389-453)
  - 顯示照片來源選擇對話框
  - 偵測環境 (原生 App vs 網頁版)
  - 呼叫 Capacitor Camera API
  - 處理照片轉換與預覽

- `dataUrlToBlob()` (行 456-463)
  - 將相機回傳的 Base64 DataURL 轉換為 Blob
  - 再轉換為 File 物件以供上傳

**保留方法:**
- `handlePhotoUpload()` (行 466-497)
  - 處理從檔案選擇器上傳的照片
  - 驗證檔案類型與大小
  - 顯示預覽

#### 2. [js/core/EventBinder.js](../../js/core/EventBinder.js)
**修改:**
- `bindPhotoUpload()` (行 135-156)
  - 將「貼上照片」按鈕點擊事件改為呼叫 `showPhotoSourceDialog()`
  - 支援 async/await 處理非同步相機操作

#### 3. [js/utils/CustomDialog.js](../../js/utils/CustomDialog.js)
**新增方法:**
- `confirm()` (行 181-236)
  - 顯示確認對話框 (是/否選擇)
  - 支援自訂按鈕文字
  - 回傳 Promise<boolean>

- `closePromptConfirm()` (行 238-260)
  - 關閉確認對話框
  - 恢復原始 UI 狀態

#### 4. [capacitor.config.json](../../capacitor.config.json)
**未修改** - Camera Plugin 不需要額外配置即可使用

---

## 📱 使用流程

### 行動裝置 (Android App)
1. 點擊表單中的「貼上照片」區域
2. 彈出對話框:
   - 「📷 拍照」→ 開啟相機拍照
   - 「🖼️ 從相簿選擇」→ 開啟相簿選擇
3. 選擇/拍攝照片後,自動顯示預覽
4. 提交表單時,照片上傳到 Firebase Storage

### 網頁版 (桌面瀏覽器)
1. 點擊表單中的「貼上照片」區域
2. 直接開啟檔案選擇器
3. 選擇本地照片檔案
4. 自動顯示預覽並上傳

---

## 🔒 權限需求

### Android (自動配置)
Camera Plugin 會自動新增以下權限到 `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

首次使用時,App 會請求相機與儲存空間權限。

### iOS (未測試)
需要在 `Info.plist` 中新增:
```xml
<key>NSCameraUsageDescription</key>
<string>需要使用相機拍攝照片記錄花費</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要存取相簿選擇照片</string>
```

---

## ⚠️ 錯誤處理

### 使用者取消
- 如果使用者在選擇畫面取消操作,不會顯示錯誤訊息
- 偵測方式: `error.message.includes('User cancelled')`

### 權限拒絕
- 如果使用者拒絕相機/相簿權限,會顯示錯誤訊息
- 建議引導使用者到設定中開啟權限

### 照片大小限制
- 最大檔案大小: 10MB
- 超過限制會顯示錯誤訊息

---

## 🚀 建置與部署

### 同步 Capacitor 配置
```bash
npx cap sync
```

### 建置 Android APK
```bash
cd android
./gradlew clean assembleDebug
```

**APK 位置:** `android/app/build/outputs/apk/debug/app-debug.apk`

### 安裝到手機
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎨 UI 優化（v6.3.4 更新）

### 照片預覽區域優化

**問題：** 照片上傳後，原本的圖示和文字殘留在畫面中，UI 不美觀

**解決方案：**
1. **動態隱藏原始 UI**
   - 上傳照片後，自動隱藏加號圖示和「貼上照片」文字
   - 預覽區域完全佔滿整個上傳區域

2. **優化預覽顯示**
   - 照片使用 `object-contain` 保持比例
   - 右上角顯示刪除按鈕（X）
   - 底部顯示「✓ 已選擇照片」漸層金色標籤
   - Hover 時顯示「點擊更換照片」半透明提示

3. **刪除照片後自動恢復**
   - 點擊刪除按鈕後，自動恢復原始 UI
   - 圖示和文字重新顯示，可再次上傳

**修改檔案：**
- `js/components/TransactionForm.js:489-540` - showPhotoPreview() 方法
- `js/components/TransactionForm.js:559-574` - clearPhotoPreview() 方法

---

## 📝 測試建議

### 測試案例
1. **拍照功能** ✅
   - [x] 點擊「貼上照片」→ 系統顯示選擇器
   - [x] 選擇「拍照」→ 直接開啟相機
   - [x] 拍攝照片並確認
   - [x] 檢查預覽是否完全佔滿區域，無殘留 UI
   - [x] 提交表單,檢查照片是否上傳到 Firebase

2. **相簿選擇** ✅
   - [x] 點擊「貼上照片」→ 系統顯示選擇器
   - [x] 選擇「從相簿選擇」→ 開啟相簿
   - [x] 選擇現有照片
   - [x] 檢查預覽是否正常顯示
   - [x] 提交表單,檢查照片是否上傳

3. **UI 交互** ✅
   - [x] Hover 照片時，檢查是否顯示「點擊更換照片」提示
   - [x] 點擊刪除按鈕，檢查是否恢復原始 UI
   - [x] 再次點擊上傳區域，檢查是否可以重新選擇照片

4. **取消操作**
   - [x] 點擊「貼上照片」→ 在系統選擇器中取消
   - [x] 確認沒有錯誤訊息

5. **權限處理**
   - [x] 首次使用時,檢查是否正常請求權限
   - [ ] 拒絕權限後,檢查錯誤訊息

6. **網頁版測試**
   - [ ] 在桌面瀏覽器開啟 App
   - [ ] 點擊「貼上照片」,檢查是否直接開啟檔案選擇器

---

## 🎨 未來優化建議

1. **照片壓縮**
   - 在上傳前自動壓縮照片,減少上傳時間與儲存空間
   - 可使用 `@capacitor/camera` 的 `width` 與 `height` 參數

2. **照片編輯**
   - 新增裁切、旋轉功能
   - 設定 `allowEditing: true`

3. **多張照片上傳**
   - 支援一次上傳多張照片
   - 需修改資料結構與 UI

4. **照片快取**
   - 在本地快取已上傳的照片,提升載入速度
   - 減少 Firebase Storage 讀取次數

---

## 📚 相關文檔

- [docs/CAMERA_FEATURE_GUIDE.md](../CAMERA_FEATURE_GUIDE.md) - 拍照功能完整指南
- [docs/ANDROID_BUILD_GUIDE.md](../ANDROID_BUILD_GUIDE.md) - Android APK 建置指南
- [Capacitor Camera Plugin 官方文檔](https://capacitorjs.com/docs/apis/camera)

---

## 🐛 已知問題

- 暫無

---

## 📦 修改檔案清單

- `js/components/TransactionForm.js` - 新增拍照與相簿選擇功能
- `js/core/EventBinder.js` - 更新照片上傳事件處理
- `js/utils/CustomDialog.js` - 新增 confirm() 確認對話框方法
- `package.json` - 新增 @capacitor/camera 依賴
- `docs/CAMERA_FEATURE_GUIDE.md` - 新增拍照功能使用指南
- `docs/changelog/v6/version6-3_4.md` - 新增版本更新記錄

---

**版本:** v6.3.4
**標籤:** 拍照功能、Capacitor Camera、相簿選擇
**相容性:** Android 5.0+, iOS 11+ (未測試), 網頁版

# 📱 Android App 圖示與名稱修改指南

## ✅ App 名稱修改（已完成）

App 名稱已修改為：**寶步記帳本**

**修改檔案：** `android/app/src/main/res/values/strings.xml`

```xml
<string name="app_name">寶步記帳本</string>
<string name="title_activity_main">寶步記帳本</string>
```

---

## 🎨 App 圖示修改指南

### 方法 1：使用線上工具自動生成（推薦）⭐

#### 步驟 1：準備一張正方形圖片
- **尺寸建議：** 1024x1024 像素（高解析度）
- **格式：** PNG（支援透明背景）
- **內容：** 你想要的 App 圖示設計

#### 步驟 2：使用線上工具生成所有尺寸

**推薦工具：**
1. **Android Asset Studio**（官方推薦）
   - 網址：https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - 上傳你的圖片
   - 調整 Padding、背景色等設定
   - 點擊「Download」下載 ZIP 檔

2. **App Icon Generator**
   - 網址：https://www.appicon.co/
   - 上傳圖片
   - 選擇 Android
   - 下載生成的圖示包

3. **Icon Kitchen**
   - 網址：https://icon.kitchen/
   - 上傳圖片或選擇 Material Icons
   - 自訂顏色、形狀、背景
   - 下載 Android 圖示包

#### 步驟 3：替換圖示檔案

1. **解壓下載的 ZIP 檔**
2. **找到專案的圖示資料夾：**
   ```
   android/app/src/main/res/
   ├── mipmap-hdpi/
   ├── mipmap-mdpi/
   ├── mipmap-xhdpi/
   ├── mipmap-xxhdpi/
   └── mipmap-xxxhdpi/
   ```

3. **複製對應尺寸的圖示到各資料夾：**
   - 從 ZIP 檔的 `res/` 資料夾中，找到對應的 `mipmap-*` 資料夾
   - 將所有 `ic_launcher.png` 和 `ic_launcher_round.png` 複製到專案對應資料夾
   - **覆蓋現有檔案**

4. **檔案結構範例：**
   ```
   mipmap-mdpi/
   ├── ic_launcher.png           (48x48)
   ├── ic_launcher_foreground.png
   └── ic_launcher_round.png     (48x48)

   mipmap-hdpi/
   ├── ic_launcher.png           (72x72)
   ├── ic_launcher_foreground.png
   └── ic_launcher_round.png     (72x72)

   mipmap-xhdpi/
   ├── ic_launcher.png           (96x96)
   ├── ic_launcher_foreground.png
   └── ic_launcher_round.png     (96x96)

   mipmap-xxhdpi/
   ├── ic_launcher.png           (144x144)
   ├── ic_launcher_foreground.png
   └── ic_launcher_round.png     (144x144)

   mipmap-xxxhdpi/
   ├── ic_launcher.png           (192x192)
   ├── ic_launcher_foreground.png
   └── ic_launcher_round.png     (192x192)
   ```

---

### 方法 2：手動建立圖示（進階）

如果你想手動建立，需要準備以下尺寸：

| 資料夾 | 圖示尺寸 | DPI |
|--------|----------|-----|
| mipmap-mdpi | 48x48 | 160 |
| mipmap-hdpi | 72x72 | 240 |
| mipmap-xhdpi | 96x96 | 320 |
| mipmap-xxhdpi | 144x144 | 480 |
| mipmap-xxxhdpi | 192x192 | 640 |

**工具建議：**
- Photoshop / GIMP（圖片編輯）
- Figma / Canva（設計工具）
- ImageMagick（批次縮放指令）

**ImageMagick 批次縮放範例：**
```bash
# 從 1024x1024 原圖生成各尺寸
convert icon-1024.png -resize 48x48 mipmap-mdpi/ic_launcher.png
convert icon-1024.png -resize 72x72 mipmap-hdpi/ic_launcher.png
convert icon-1024.png -resize 96x96 mipmap-xhdpi/ic_launcher.png
convert icon-1024.png -resize 144x144 mipmap-xxhdpi/ic_launcher.png
convert icon-1024.png -resize 192x192 mipmap-xxxhdpi/ic_launcher.png
```

---

### 方法 3：使用 Adaptive Icons（Android 8.0+）

**Adaptive Icons 的優勢：**
- 支援不同裝置的形狀（圓形、方形、圓角方形等）
- 系統會自動裁切成適當形狀
- 支援前景（foreground）和背景（background）分層

**檔案位置：** `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

**如何設定：**
1. 使用線上工具生成時，勾選「Adaptive Icons」
2. 會生成 `ic_launcher_background` 和 `ic_launcher_foreground`
3. 複製到專案對應資料夾

---

## 🔄 測試新圖示

### 1. 重新建置 APK

使用自動化腳本：
```bash
./build-android.bat  # Windows
./build-android.sh   # Linux/macOS
```

或手動建置：
```bash
npx cap sync
cd android
./gradlew clean assembleDebug
```

### 2. 安裝到手機測試

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**-r 參數**：覆蓋安裝（保留資料）

### 3. 檢查結果

- 在手機桌面查看新圖示
- 在應用程式列表查看新名稱「寶步記帳本」

---

## 🎨 圖示設計建議

### 童話風格設計原則
- **色彩：** 使用馬卡龍粉色系（#FFDFD3, #E2C2C6, #E6CEE3）
- **形狀：** 圓潤可愛的邊角
- **元素：** 可以使用：
  - 💰 錢包或錢幣圖示
  - 💕 愛心元素
  - 📖 記帳本造型
  - 👫 情侶剪影
  - 🌸 花朵裝飾

### 設計工具推薦
1. **Canva**（免費，有大量模板）
   - 網址：https://www.canva.com/
   - 搜尋「App Icon」模板
   - 自訂顏色和文字

2. **Figma**（專業設計工具）
   - 網址：https://www.figma.com/
   - 建立 1024x1024 畫布
   - 使用圓角矩形和漸層

3. **AI 生成圖示**（快速方案）
   - 使用 DALL-E、Midjourney 等 AI 工具
   - Prompt 範例：「cute pastel pink money tracking app icon, kawaii style, soft gradient」

---

## 📋 完整替換流程總結

```bash
# 1. 準備圖示（1024x1024 PNG）
# 2. 使用線上工具生成所有尺寸
# 3. 下載並解壓 ZIP 檔
# 4. 複製到專案資料夾
cp -r downloaded-icons/res/mipmap-* android/app/src/main/res/

# 5. 重新建置 APK
./build-android.bat

# 6. 安裝測試
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚠️ 常見問題

### Q1: 圖示沒有更新？
**解決方案：**
1. 執行 `./gradlew clean` 清除快取
2. 解除安裝舊 APK 後重新安裝
3. 重啟手機

### Q2: 圖示顯示模糊？
**解決方案：**
- 確保原圖至少 1024x1024 解析度
- 使用 PNG 格式而非 JPG
- 檢查各尺寸檔案是否正確

### Q3: 圓形圖示被裁切？
**解決方案：**
- 使用線上工具時調整 Padding
- 確保重要元素在安全區域（Safe Zone）內
- 使用 Adaptive Icons 設計

---

## 🔗 相關資源

### 官方文檔
- [Android App Icons 設計指南](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [Adaptive Icons 規範](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

### 線上工具
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://www.appicon.co/)
- [Icon Kitchen](https://icon.kitchen/)

### 免費圖示資源
- [Material Icons](https://fonts.google.com/icons)
- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)

---

**最後更新：** 2026-01-09
**建立者：** Claude Code

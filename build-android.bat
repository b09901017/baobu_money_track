@echo off
REM ==================== Android APK 自動化建置腳本（Windows 版本）====================
REM 用途：自動化執行 Capacitor 同步、Java 版本修正、APK 建置
REM 作者：Claude Code
REM 日期：2026-01-09

echo 🚀 開始建置 Android APK...
echo.

REM 步驟 1：建置 Web 資源
echo 📦 步驟 1/4: 建置 Web 資源...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Web 建置失敗！
    exit /b 1
)
echo ✅ Web 資源建置完成
echo.

REM 步驟 2：同步 Capacitor 配置
echo 🔄 步驟 2/4: 同步 Capacitor 配置到 Android 專案...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Capacitor 同步失敗！
    exit /b 1
)
echo ✅ Capacitor 同步完成
echo.

REM 步驟 3：修正 Java 版本
echo 🔧 步驟 3/4: 修正 Java 版本...
if exist android\app\capacitor.build.gradle (
    powershell -Command "(Get-Content android\app\capacitor.build.gradle) -replace 'JavaVersion\.VERSION_21', 'JavaVersion.VERSION_17' | Set-Content android\app\capacitor.build.gradle"
    echo ✅ Java 版本已修正為 17
) else (
    echo ⚠️  未找到 capacitor.build.gradle 檔案，跳過 Java 版本修正
)
echo.

REM 步驟 4：建置 APK
echo 🔨 步驟 4/4: 建置 Debug APK...
cd android
call gradlew.bat clean assembleDebug
if %errorlevel% neq 0 (
    echo ❌ APK 建置失敗！
    cd ..
    exit /b 1
)
cd ..
echo ✅ APK 建置完成
echo.

REM 完成提示
echo 🎉 建置成功！
echo.
echo 📱 APK 位置：
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 💡 安裝方式：
echo    1. USB 連接手機後執行: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo    2. 或直接將 APK 檔案傳送到手機安裝
echo.
pause

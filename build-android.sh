#!/bin/bash

# ==================== Android APK 自動化建置腳本 ====================
# 用途：自動化執行 Capacitor 同步、Java 版本修正、APK 建置
# 作者：Claude Code
# 日期：2026-01-09

echo "🚀 開始建置 Android APK..."
echo ""

# 步驟 1：建置 Web 資源
echo "📦 步驟 1/4: 建置 Web 資源..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web 建置失敗！"
    exit 1
fi
echo "✅ Web 資源建置完成"
echo ""

# 步驟 2：同步 Capacitor 配置
echo "🔄 步驟 2/4: 同步 Capacitor 配置到 Android 專案..."
npx cap sync
if [ $? -ne 0 ]; then
    echo "❌ Capacitor 同步失敗！"
    exit 1
fi
echo "✅ Capacitor 同步完成"
echo ""

# 步驟 3：修正 Java 版本（Capacitor 8.0.0 預設 Java 21，本地環境為 Java 17）
echo "🔧 步驟 3/4: 修正 Java 版本..."
if [ -f "android/app/capacitor.build.gradle" ]; then
    # Windows 環境使用 PowerShell 的 sed 替代方案
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        powershell -Command "(Get-Content android/app/capacitor.build.gradle) -replace 'JavaVersion\.VERSION_21', 'JavaVersion.VERSION_17' | Set-Content android/app/capacitor.build.gradle"
    else
        sed -i 's/JavaVersion\.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle
    fi
    echo "✅ Java 版本已修正為 17"
else
    echo "⚠️  未找到 capacitor.build.gradle 檔案，跳過 Java 版本修正"
fi
echo ""

# 步驟 4：建置 APK
echo "🔨 步驟 4/4: 建置 Debug APK..."
cd android
./gradlew clean assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ APK 建置失敗！"
    exit 1
fi
cd ..
echo "✅ APK 建置完成"
echo ""

# 完成提示
echo "🎉 建置成功！"
echo ""
echo "📱 APK 位置："
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "💡 安裝方式："
echo "   1. USB 連接手機後執行: adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo "   2. 或直接將 APK 檔案傳送到手機安裝"
echo ""

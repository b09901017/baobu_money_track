# Google Project IDX 開發環境配置
# 此檔案定義雲端開發環境的依賴與設定

{ pkgs, ... }: {
  # 🔴 修正 1: 必須加入 channel 設定 (使用 stable-23.11 或 stable-24.05)
  channel = "stable-23.11"; 

  # 使用的套件
  packages = [
    pkgs.nodejs_20        # Node.js 20.x LTS
    pkgs.nodePackages.npm # NPM 套件管理器
    pkgs.git              # Git 版本控制
    pkgs.openjdk17        # Java 17 (Android 開發需要)
    pkgs.android-tools    # Android SDK 工具 (adb, fastboot 等)
  ];

  # 環境變數
  env = {
    # Android SDK 路徑 (Project IDX 預設路徑)
    ANDROID_HOME = "/home/user/Android/Sdk";
    ANDROID_SDK_ROOT = "/home/user/Android/Sdk";

    # Java 環境
    JAVA_HOME = "${pkgs.openjdk17}";

    # 將 Android 工具加入 PATH
    PATH = "$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH";
  };

  # IDE 擴充功能（推薦）
  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"           # ESLint
      "esbenp.prettier-vscode"           # Prettier
      "bradlc.vscode-tailwindcss"        # Tailwind CSS IntelliSense
      "ms-azuretools.vscode-docker"      # Docker 支援
      # "GitHub.copilot"                 # 🔴 修正 2: 建議先註解掉 Copilot，以免因市場相容性問題導致匯入失敗
    ];

    # 工作區設定
    workspace = {
      # 啟動時執行的指令
      onCreate = {
        npm-install = "npm install";
        # 🔴 修正 3: 確保多行字串語法正確閉合
        setup = ''
          echo "🎉 開發環境已就緒！"
          echo "📦 執行 npm run dev 啟動開發伺服器"
          echo "📱 執行 npx cap open android 開啟 Android Studio"
        '';
      };

      # 啟動開發伺服器
      onStart = {
        dev-server = "npm run dev";
      };
    };

    # 預覽設定
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };
  };
}
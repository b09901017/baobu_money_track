# Google Project IDX 開發環境配置
{ pkgs, ... }: {
  
  # 👇👇👇 這裡是你原本缺少的關鍵一行 👇👇👇
  channel = "stable-23.11"; 
  # 👆👆👆 必須加上這行才能建立環境 👆👆👆

  # 使用的套件
  packages = [
    pkgs.nodejs_20        
    pkgs.nodePackages.npm 
    pkgs.git              
    pkgs.openjdk17        
    pkgs.android-tools    
  ];

  # 環境變數
  env = {
    ANDROID_HOME = "/home/user/Android/Sdk";
    ANDROID_SDK_ROOT = "/home/user/Android/Sdk";
    JAVA_HOME = "${pkgs.openjdk17}";
    PATH = "$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH";
  };

  # IDE 擴充功能
  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"           
      "esbenp.prettier-vscode"           
      "bradlc.vscode-tailwindcss"        
      "ms-azuretools.vscode-docker"      
      # "GitHub.copilot"  <-- 建議先加上 # 註解掉，避免因為這個擴充功能導致錯誤
    ];

    # 工作區設定
    workspace = {
      onCreate = {
        npm-install = "npm install";
        setup = ''
          echo "🎉 開發環境已就緒！"
          echo "📦 執行 npm run dev 啟動開發伺服器"
          echo "📱 執行 npx cap open android 開啟 Android Studio"
        '';
      };

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
{ pkgs, ... }: {

  # 1. 指定頻道
  channel = "stable-23.11";

  # 2. 套件列表
  packages = [
    pkgs.nodejs_20
    pkgs.git
    pkgs.openjdk17
    pkgs.android-tools
  ];

  # 3. 環境變數
  # ✅ 我們把 ANDROID_HOME 加回來，這樣 native-run 才能找到 SDK
  # ❌ 依然保持移除 PATH，避免衝突
  env = {
    ANDROID_HOME = "/home/user/Android/Sdk";
    ANDROID_SDK_ROOT = "/home/user/Android/Sdk";
    JAVA_HOME = "${pkgs.openjdk17}";
  };

  # 4. IDX 設定
  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
    ];

    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        dev-server = "npm run dev";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
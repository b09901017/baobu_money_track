{ pkgs, ... }: {

  # 1. 指定頻道 (必須保留)
  channel = "stable-23.11";

  # 2. 套件列表
  packages = [
    pkgs.nodejs_20
    pkgs.git
    pkgs.openjdk17
    pkgs.android-tools
  ];

  # 3. 環境變數
  # ❌ 我移除了原本這裡的 PATH 設定，這是導致報錯的主因
  # ❌ 也移除了 ANDROID_HOME 硬路徑，避免指向不存在的資料夾
  env = {
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
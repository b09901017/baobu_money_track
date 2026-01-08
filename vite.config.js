import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    // 確保所有資源都被正確處理
    assetsDir: 'assets',
    // 生成 sourcemap 以便調試
    sourcemap: true,
  },
  // 對 Capacitor 非常重要：使用相對路徑
  base: './',
  // 開發伺服器配置
  server: {
    port: 5173,
    open: true,
  },
  // 確保 CSS 模組正確處理
  css: {
    postcss: './postcss.config.js',
  },
});

# 遷移總結 - Migration Summary

## 🎯 遷移目標

將原本基於 CDN 的 Vanilla JS 專案現代化，建立「Web + Android App 共用、一勞永逸」的維護架構。

---

## ✅ 已完成階段

### 階段 0：建立 Git 分支
- 建立 `feature/vite-app-migration` 分支

### 階段 1：引入 Vite 與 NPM 依賴
- 初始化 NPM 專案 (`package.json`)
- 安裝 Vite 6.4.1
- 安裝 Tailwind CSS v4.1.18 + PostCSS
- 安裝 Firebase 12.7.0 (從 CDN 10.7.1 升級)
- 安裝 SortableJS 1.15.6
- 建立 Vite 配置 (`vite.config.js`)
- 建立 PostCSS 配置 (`postcss.config.js`)
- 建立 Tailwind 配置 (`tailwind.config.js`)
- 修正 CSS 語法錯誤 (`animations.css`)
- 建置成功：137.95 kB → 703.16 kB（包含 Firebase SDK）

### 階段 2：重構程式碼（移除 Window Globals 與 CDN）
- 建立 `src/main.js` (Vite 入口點)
- 建立 `src/firebaseInit.js` (Firebase 初始化)
- 建立 `src/style.css` (CSS 入口點)
- 移除 `index.html` 中所有 CDN 引用
  - Tailwind CSS CDN → NPM
  - SortableJS CDN → NPM
  - Firebase CDN → NPM
- 遷移 Tailwind 配置（從 inline script 到 `tailwind.config.js`）
- 更新 `js/firebase-config.js` 使用 `window.firebaseModules`（過渡期）
- 維持向後兼容性（`window.FirebaseAPI`）

### 階段 3：整合 Capacitor 與 Android
- 安裝 Capacitor CLI 與 Android 平台
- 安裝 `@capacitor-firebase/authentication` 插件
- 初始化 Capacitor 專案
  - App ID: `com.baobu.moneytrack`
  - App Name: `BaobuMoneyTrack`
  - Web Directory: `dist`
- 新增 Android 平台 (`android/` 目錄結構)
- 配置 `google-services.json`（已由使用者手動下載）

### 階段 4：實作雙平台登入邏輯
- 新增 `signInWithCredential` 到 Firebase 模組
- 實作動態 Capacitor 檢測（`initCapacitor()`）
- 改寫 `signInWithGoogle()` 函數
  - Web 平台：使用 `signInWithPopup`（原邏輯）
  - Native 平台：使用 `FirebaseAuthentication.signInWithGoogle()` + `signInWithCredential`
- 避免 Web 環境載入 Capacitor 時報錯（動態載入）

### 階段 5：Project IDX 與權限設定
- 建立 `.idx/dev.nix`（Project IDX 環境配置）
  - Node.js 20, Java 17, Android SDK
  - 環境變數配置
  - 自動化腳本
  - VSCode 擴充功能推薦
- 更新 `AndroidManifest.xml` 新增權限
  - INTERNET, ACCESS_NETWORK_STATE
  - CAMERA, READ_MEDIA_IMAGES, READ_EXTERNAL_STORAGE
  - POST_NOTIFICATIONS
- 更新 `.gitignore` 忽略 IDX 產生的檔案
- 建立 `.idx/README.md` 使用說明

### 階段 6：驗證與指引
- 建置驗證成功 ✅
- Capacitor 同步成功 ✅
- 建立 `DEPLOYMENT_GUIDE.md` 完整部署指南
- 建立 `MIGRATION_SUMMARY.md` 遷移總結

---

## 📦 技術棧變更對比

### 建置工具
| 項目 | 之前 | 之後 |
|------|------|------|
| 建置系統 | 無（純 HTML/JS） | Vite 6.4.1 |
| 依賴管理 | CDN | NPM |
| 模組系統 | 全域變數 | ES Modules |

### 前端框架
| 項目 | 之前 | 之後 |
|------|------|------|
| CSS 框架 | Tailwind CDN | Tailwind CSS v4.1.18 (NPM) |
| 拖曳功能 | SortableJS CDN | SortableJS 1.15.6 (NPM) |

### 後端服務
| 項目 | 之前 | 之後 |
|------|------|------|
| Firebase | CDN v10.7.1 | NPM v12.7.0 |
| 初始化 | inline script | `src/firebaseInit.js` |

### 行動應用
| 項目 | 之前 | 之後 |
|------|------|------|
| 平台 | 僅 Web | Web + Android |
| 容器 | 無 | Capacitor 8.0.0 |
| Google 登入 | Web Only | Web + Native |

### 雲端開發
| 項目 | 之前 | 之後 |
|------|------|------|
| 雲端 IDE | 無 | Google Project IDX |
| 環境配置 | 手動 | `.idx/dev.nix` |

---

## 📊 建置結果對比

### 之前（CDN）
- HTML: ~72 kB
- CSS: ~65 kB（inline styles）
- JS: 分散載入（多個 CDN 請求）
- 總大小: 無法精確計算（依賴外部 CDN）

### 之後（Vite + NPM）
- HTML: 72.88 kB (gzip: 11.84 kB)
- CSS: 64.89 kB (gzip: 11.31 kB)
- JS: 703.16 kB (gzip: 167.84 kB)
  - Firebase SDK: ~650 kB
  - App Code: ~50 kB
- 總大小: ~841 kB (gzip: ~191 kB)

**說明**：雖然總體積增加，但這是因為 Firebase SDK 現在打包進來。優點是：
- 離線支援更好
- 載入速度更穩定（不依賴 CDN）
- 版本控制更精確
- 支援 Tree Shaking（未來優化空間）

---

## 🔄 架構變更

### 入口點變更

**之前**：
```html
<!-- index.html -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
  // ... 更多 Firebase imports
</script>
<script type="module" src="js/app.js"></script>
```

**之後**：
```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>
```

```javascript
// src/main.js
import './style.css';
import './firebaseInit.js';
import '../js/app.js';
```

### Firebase 初始化變更

**之前**（`index.html` inline script）：
```javascript
const { initializeApp, getFirestore, /* ... */ } = window.firebaseModules;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ... 掛載到 window
```

**之後**（`src/firebaseInit.js`）：
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, /* ... */ } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 過渡期：掛載到 window
window.firebaseModules = { /* ... */ };

// 未來：ES Module 匯出
export { app, db, storage, auth, /* ... */ };
```

### Google 登入變更

**之前**（Web Only）：
```javascript
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
```

**之後**（Web + Native）：
```javascript
async function signInWithGoogle() {
  const isNative = Capacitor && Capacitor.isNativePlatform();

  if (isNative && FirebaseAuthentication) {
    // Native: Capacitor 插件 + signInWithCredential
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(result.credential.idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } else {
    // Web: signInWithPopup
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }
}
```

---

## 🎓 學到的經驗

### 1. Tailwind CSS v4 PostCSS 插件變更
- **問題**：Tailwind v4 移除了直接使用 `tailwindcss` 作為 PostCSS 插件
- **解決**：安裝 `@tailwindcss/postcss` 並使用該插件
- **教訓**：重大版本升級時，插件架構可能變更

### 2. CSS Import 順序
- **問題**：`@import` 必須放在 `@tailwind` 之前
- **解決**：調整 `src/style.css` 順序
- **教訓**：CSS 規範對 `@import` 位置有嚴格要求

### 3. Firebase SDK 版本升級
- **變更**：CDN v10.7.1 → NPM v12.7.0
- **新增**：`signInWithCredential`, `runTransaction`, `writeBatch`
- **教訓**：確保所有需要的 API 都有匯出

### 4. Capacitor 動態載入
- **問題**：Web 環境中 `import('@capacitor-firebase/authentication')` 會報錯
- **解決**：使用 try-catch 包裹動態 import，只在 Native 環境載入
- **教訓**：跨平台程式碼需要環境檢測

### 5. Vite 相對路徑配置
- **問題**：Capacitor 需要相對路徑，不是絕對路徑
- **解決**：設定 `vite.config.js` 的 `base: './'`
- **教訓**：打包工具配置需考慮目標平台

---

## 📁 新增的檔案

### 配置檔案
- `package.json` - NPM 專案配置
- `vite.config.js` - Vite 建置配置
- `postcss.config.js` - PostCSS 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `capacitor.config.json` - Capacitor 專案配置
- `.idx/dev.nix` - Project IDX 環境配置

### 原始碼檔案
- `src/main.js` - Vite 入口點
- `src/firebaseInit.js` - Firebase 初始化
- `src/style.css` - CSS 入口點

### 文檔檔案
- `.idx/README.md` - Project IDX 使用說明
- `DEPLOYMENT_GUIDE.md` - 部署指南
- `MIGRATION_SUMMARY.md` - 遷移總結（本檔案）

### Android 專案（由 Capacitor 自動產生）
- `android/` - 完整的 Android 專案結構
- `android/app/google-services.json` - Firebase Android 配置（需手動下載）

---

## 🔜 後續優化建議

### 短期（可選）
1. **程式碼分割**：使用 dynamic import() 減少初始 bundle 大小
2. **Tree Shaking**：確保未使用的 Firebase 模組被移除
3. **圖片優化**：壓縮 splash screen 和 icon 圖片
4. **Service Worker**：新增 PWA 支援（離線使用）

### 中期（未來）
1. **完全移除 Window Globals**：將 `js/` 目錄下的所有檔案改用 ES Module import
2. **TypeScript 遷移**：增加型別安全
3. **單元測試**：使用 Vitest 添加測試
4. **E2E 測試**：使用 Playwright 或 Cypress

### 長期（擴展）
1. **iOS 支援**：新增 iOS 平台（需要 macOS 環境）
2. **桌面應用**：使用 Electron 或 Tauri
3. **CI/CD**：GitHub Actions 自動化建置與部署
4. **性能監控**：整合 Firebase Performance Monitoring

---

## 🎉 遷移成果

### ✅ 達成目標
- ✅ 從 CDN 遷移到 NPM（版本控制）
- ✅ 引入 Vite 建置系統（現代化工具鏈）
- ✅ 整合 Capacitor（Web + Android 共用）
- ✅ 雙平台登入邏輯（Web/Native 自動切換）
- ✅ Google Project IDX 支援（雲端開發）
- ✅ 完整的文檔與指引

### 🏆 優勢
- **一致的開發體驗**：Web 和 Android 共用相同程式碼
- **現代化工具鏈**：Vite HMR, ES Modules, Tree Shaking
- **版本鎖定**：不再依賴 CDN，版本更新可控
- **離線支援**：Firebase Offline Persistence + Capacitor
- **雲端開發**：在 Project IDX 中直接開發與測試
- **一勞永逸**：架構完善，易於維護與擴展

### 📈 數據對比
| 指標 | 之前 | 之後 | 變化 |
|------|------|------|------|
| 依賴管理 | CDN | NPM | ⬆️ 可控性 |
| 建置時間 | 無 | ~4s | ➕ 建置步驟 |
| 熱重載 | ❌ | ✅ | ⬆️ 開發效率 |
| 離線支援 | 部分 | 完整 | ⬆️ 使用體驗 |
| 平台支援 | Web | Web + Android | ➕ Android |
| 雲端開發 | ❌ | ✅ (IDX) | ➕ 雲端環境 |

---

## 📞 支援與資源

如有問題，請參考：
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 完整部署指南
- [.idx/README.md](./.idx/README.md) - Project IDX 使用說明
- [CLAUDE.md](./CLAUDE.md) - 專案架構說明（給 AI 看的）

---

**遷移完成日期**：2026-01-08
**最終版本**：v1.0.0-capacitor
**遷移分支**：`feature/vite-app-migration`

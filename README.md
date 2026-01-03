# 情侶記帳 App - Claude Code 設定 (簡化彈性版)

## 📦 這是什麼?

這是為「情侶記帳 App」準備的 Claude Code 設定檔,幫助你使用 Claude 快速開發。

**特色:**
- ✅ **簡單**: 只保留必要的設定
- ✅ **彈性**: 細節在對話中調整,不寫死
- ✅ **前端優先**: 先用 Mock Data 完成前端
- ✅ **預留串接**: 之後輕鬆整合 Firebase

## 📁 檔案結構

```
couple-expense-tracker-v2/
├── CLAUDE.md                    # 專案主配置
├── README.md                    # 本說明文件
└── .claude/
    └── skills/                  # 專業技能
        ├── project-manager/     # 整理需求
        ├── frontend/            # 前端開發
        ├── designer/            # 設計調整
        └── backend/             # Firebase (之後用)
```

## 🚀 如何使用

### 1. 設定專案

```bash
# 下載後,放到你的專案目錄
cd couple-expense-tracker-v2

# 啟動 Claude Code
claude
```

### 2. 開始開發

#### 步驟 1: 整理需求 (可選)
```
/skill project-manager
我的想法有點混亂,幫我整理一下頁面架構和功能需求
```

Claude 會幫你建立:
- `docs/pages-structure.md` - 頁面架構
- `docs/mock-data.md` - 假資料格式
- `docs/PRD.md` - 功能需求

#### 步驟 2: 開發前端 ⭐
```
/skill frontend
請建立主頁面,包含底部三個浮動按鈕 (帳本|記帳|分析)
```

```
/skill frontend
請實作記帳列表顯示功能,使用 Mock Data
```

#### 步驟 3: 調整設計 (需要時)
```
/skill designer
請幫我優化按鈕的童話風格,讓它更可愛
```

```
/skill designer
可以給我 3 種不同的色彩方案選擇嗎?
```

#### 步驟 4: 串接 Firebase (之後)
```
/skill backend
請幫我設定 Firebase,並替換掉所有 Mock Data
```

## 💡 四個 Skills 說明

### 📋 project-manager
**用途**: 整理混亂的想法,產生清楚的文件

**何時用**:
- 不確定要做什麼功能
- 想規劃頁面架構
- 需要定義資料結構

**範例**:
```
/skill project-manager
我想要一個記帳頁面,但不知道要怎麼呈現?
```

---

### 💻 frontend
**用途**: 開發 HTML/CSS/JavaScript,使用 Mock Data

**何時用**:
- 建立網頁
- 實作功能
- 處理互動邏輯

**範例**:
```
/skill frontend
請建立新增記帳的表單,包含金額、項目、分類等欄位
```

**重點**: 
- ✅ 使用假資料 (Mock Data)
- ✅ 預留 Firebase 串接點
- ✅ 保持程式碼乾淨

---

### 🎨 designer
**用途**: 童話風格設計,優化視覺效果

**何時用**:
- 調整色彩配置
- 設計 UI 組件
- 優化動畫效果

**範例**:
```
/skill designer
我覺得粉色太淺了,可以給我深一點的選項嗎?
```

**重點**:
- ✅ 提供多種選項
- ✅ 隨時可以調整
- ✅ 不寫死設計

---

### 🔥 backend
**用途**: Firebase 整合 (目前不用)

**何時用**:
- 前端完成後
- 準備串接資料庫
- 需要檔案上傳

**範例**:
```
/skill backend
前端都做好了,請幫我整合 Firebase
```

**重點**:
- 🟡 目前不使用
- ⏰ 之後再用

## 🎯 推薦開發流程

```
第一階段 - 規劃 (30分鐘)
├─ 使用 project-manager 整理需求
└─ 定義 Mock Data 結構

第二階段 - 前端開發 (主要階段)
├─ 建立主頁面
├─ 實作記帳列表
├─ 新增記帳功能
├─ 編輯/刪除功能
├─ 帳本切換
├─ 分析頁面
└─ 調整設計細節

第三階段 - 後端整合 (之後)
├─ 設定 Firebase
├─ 替換 Mock Data
└─ 測試上線
```

## 🎨 專案特色

### 童話風格設計
- 🎨 粉紅色系配色
- ⭕ 圓潤可愛的元素
- ✨ 柔和的動畫效果
- 💕 溫馨的使用體驗

### 技術棧
- **前端**: 純 HTML/CSS/JavaScript
- **無框架**: 輕量快速
- **後端**: Firebase (之後整合)

### 頁面構想
```
┌─────────────────────────────┐
│      主要內容區域           │
│   (根據底部按鈕切換)        │
│                             │
│  📖 帳本總覽                │
│  💰 記帳列表 (預設)         │
│  📊 分析圖表                │
└─────────────────────────────┘
       ┌───┬───┬───┐
       │📖 │💰 │📊 │ 底部浮動按鈕
       └───┴───┴───┘
```

## 💭 常見問題

### Q: 為什麼要用 Skills?
A: Skills 讓 Claude 扮演不同角色 (專案經理、前端、設計師),給出更專業的建議。

### Q: 一定要用所有 Skills 嗎?
A: 不用!你可以只用 frontend,或只用需要的部分。

### Q: 可以修改 Skills 嗎?
A: 當然!Skills 都是 Markdown 檔案,隨時可以調整。

### Q: Mock Data 在哪?
A: 開發時 Claude 會建立 `src/js/mock-data.js`,包含假資料。

### Q: 什麼時候串接 Firebase?
A: 前端功能都完成、測試沒問題後,再用 backend skill 整合。

## ⚡ 快速開始範例

**情境**: 我想開始開發,但不太確定要怎麼做

```bash
# 1. 啟動 Claude Code
claude

# 2. 整理需求
/skill project-manager
我想做一個情侶記帳 App,有日常記帳和旅遊帳本,
可以記誰幫誰付錢,還要能看欠款分析。
幫我整理一下需要哪些頁面和功能?

# 3. 開始開發
/skill frontend
根據剛才的規劃,請先建立主頁面的 HTML 結構

# 4. 繼續開發
繼續跟 Claude 對話,逐步完成功能!
```

## 📝 注意事項

✅ **建議做法**:
- 一次專注一個功能
- 先完成基本功能再優化
- 隨時測試確認效果
- 保持程式碼簡潔

❌ **避免**:
- 不要一次做太多功能
- 不要跳過規劃直接開發
- 不要急著串接後端
- 不要忽略測試

## 🎉 開始開發!

現在你可以開始了!建議順序:

1. ✅ `/skill project-manager` - 整理需求
2. ✅ `/skill frontend` - 建立主頁面
3. ✅ `/skill frontend` - 實作功能
4. ✅ `/skill designer` - 優化設計 (隨時)
5. ⏰ `/skill backend` - 串接 Firebase (之後)

**祝開發順利!** 🚀💕

---

有任何問題,隨時在 Claude Code 中使用對應的 skill 尋求協助!

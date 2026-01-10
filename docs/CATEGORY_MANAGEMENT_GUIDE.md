# 類別管理操作指南 🎨

> 本指南說明如何手動新增、修改、調整類別的位置與顯示區域

## 目錄
1. [新增類別](#新增類別)
2. [調整類別順序](#調整類別順序)
3. [移動類別區域（常用 ↔ 更多）](#移動類別區域)
4. [修改類別樣式](#修改類別樣式)
5. [可用圖示參考](#可用圖示參考)

---

## 新增類別

### 步驟 1: 選擇 Material Icon 圖示

訪問 [Google Material Symbols](https://fonts.google.com/icons) 選擇合適的圖示，記下圖示名稱。

**常用圖示參考：**
- 交通類：`directions_bus`, `directions_subway`, `train`, `local_taxi`, `two_wheeler`
- 飲食類：`restaurant`, `local_cafe`, `local_bar`, `fastfood`, `lunch_dining`
- 購物類：`shopping_cart`, `shopping_bag`, `local_mall`, `store`
- 娛樂類：`movie`, `videogame_asset`, `sports_esports`, `theater_comedy`

### 步驟 2: 在 TransactionRenderer.js 註冊圖示與顏色

**檔案位置：** `js/components/TransactionRenderer.js`

#### 2.1 新增圖示映射（第 8-33 行）
```javascript
const CATEGORY_ICONS = {
    // 常用類別
    '吃吃': 'restaurant',
    '喝喝': 'local_cafe',
    // ... 其他類別

    // 👉 在此新增
    '交通': 'directions_bus',  // 新增類別

    // 預設
    '其他': 'auto_stories'
};
```

#### 2.2 新增列表模式顏色（第 36-61 行）
```javascript
const CATEGORY_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20',
    // ... 其他類別

    // 👉 在此新增
    '交通': 'bg-macaron-green/20',  // 新增顏色

    // 預設
    '其他': 'bg-warm-brown/10'
};
```

**可用顏色：**
```
bg-macaron-pink/20      // 粉色
bg-macaron-blue/20      // 藍色
bg-macaron-purple/20    // 紫色
bg-macaron-green/20     // 綠色
bg-macaron-orange/20    // 橙色
bg-macaron-rose/20      // 玫瑰色
bg-macaron-lavender/20  // 薰衣草紫
bg-macaron-cream/40     // 奶油色
bg-antique-gold/20      // 古金色
bg-warm-brown/15        // 暖棕色
```

#### 2.3 新增時間軸模式顏色（第 64-89 行）
```javascript
const TIMELINE_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20 border-macaron-pink',
    // ... 其他類別

    // 👉 在此新增（顏色需與上方一致，border 加上對應顏色）
    '交通': 'bg-macaron-green/20 border-macaron-green',

    // 預設
    '其他': 'bg-warm-brown/10 border-warm-brown'
};
```

### 步驟 3: 在 index.html 新增類別按鈕

**檔案位置：** `index.html`（第 775-956 行的 `categoryTags` 區域）

#### 新增到「常用類別」（第 776-839 行）
在洗衣服按鈕之後、`moreCategories` div 之前插入：

```html
<!-- 交通 -->
<button type="button" class="tag-btn flex flex-col items-center gap-2" data-category="交通">
    <div class="bg-gradient-to-br from-macaron-green/40 to-macaron-green/30">
        <span class="material-symbols-outlined text-2xl">directions_bus</span>
    </div>
    <span class="text-sm font-hand font-bold text-warm-brown">交通</span>
</button>
```

#### 新增到「更多類別」（第 842-946 行）
在 `moreCategories` div 內、`btnAddCustomCategory` 之前插入：

```html
<!-- 交通 -->
<button type="button" class="tag-btn flex flex-col items-center gap-2" data-category="交通">
    <div class="bg-gradient-to-br from-macaron-green/40 to-macaron-green/30">
        <span class="material-symbols-outlined text-2xl">directions_bus</span>
    </div>
    <span class="text-sm font-hand font-bold text-warm-brown">交通</span>
</button>
```

**HTML 結構說明：**
```html
<button type="button"
        class="tag-btn flex flex-col items-center gap-2"
        data-category="類別名稱">
    <!-- 圖示容器（漸層背景）-->
    <div class="bg-gradient-to-br from-顏色/40 to-顏色/30">
        <span class="material-symbols-outlined text-2xl">圖示名稱</span>
    </div>
    <!-- 文字標籤 -->
    <span class="text-sm font-hand font-bold text-warm-brown">顯示文字</span>
</button>
```

**注意事項：**
- `data-category` 必須與 TransactionRenderer.js 中的鍵名一致
- 長文字使用 `text-xs` 或換行 `<br>`：
  ```html
  <span class="text-xs font-hand font-bold text-warm-brown leading-tight text-center">
      家樂福<br>全聯
  </span>
  ```

---

## 調整類別順序

### 在同一區域內調整

直接在 `index.html` 中剪切 & 貼上 `<button>` 區塊即可。

**範例：將「喝喝」移到「吃吃」之前**

**原本順序：**
```html
<!-- 吃吃 -->
<button ...>...</button>

<!-- 喝喝 -->
<button ...>...</button>
```

**調整後：**
```html
<!-- 喝喝 -->
<button ...>...</button>

<!-- 吃吃 -->
<button ...>...</button>
```

---

## 移動類別區域

### 範例：洗衣服（常用 → 更多）

#### 步驟 1: 從常用區域剪切

**檔案：** `index.html`（第 833-839 行）

找到並**剪切**這段程式碼：
```html
<!-- 洗衣服 -->
<button type="button" class="tag-btn flex flex-col items-center gap-2" data-category="洗衣服">
    <div class="bg-gradient-to-br from-macaron-blue/35 to-macaron-blue/25">
        <span class="material-symbols-outlined text-2xl">local_laundry_service</span>
    </div>
    <span class="text-sm font-hand font-bold text-warm-brown">洗衣服</span>
</button>
```

#### 步驟 2: 貼到更多類別區域

在 `<div id="moreCategories" class="hidden ...">` 內部，選擇合適位置貼上（建議按邏輯分組）。

**完成！** 洗衣服現在只會在「載入更多」後顯示。

### 範例：交通（更多 → 常用）

反向操作即可：
1. 從 `moreCategories` div 內剪切「交通」按鈕
2. 貼到常用區域（第 776-839 行之間）

---

## 修改類別樣式

### 更改圖示

在 `index.html` 中找到對應按鈕，修改：
```html
<span class="material-symbols-outlined text-2xl">新圖示名稱</span>
```

同時記得在 `TransactionRenderer.js` 的 `CATEGORY_ICONS` 中同步更新。

### 更改顏色

修改漸層背景：
```html
<div class="bg-gradient-to-br from-macaron-pink/40 to-macaron-rose/30">
```

改為：
```html
<div class="bg-gradient-to-br from-macaron-blue/40 to-macaron-blue/30">
```

同時記得在 `TransactionRenderer.js` 的 `CATEGORY_COLORS` 和 `TIMELINE_COLORS` 中同步更新。

### 更改文字大小

- 一般文字：`text-sm`
- 較小文字：`text-xs`
- 極小文字：`text-[10px]`

---

## 可用圖示參考

### 交通類
```
directions_bus        // 公車
directions_subway     // 地鐵
train                 // 火車
local_taxi            // 計程車
two_wheeler           // 機車/自行車
flight                // 飛機
directions_car        // 汽車
```

### 飲食類
```
restaurant            // 一般餐廳
local_cafe            // 咖啡廳
dinner_dining         // 高級餐點
fastfood              // 速食
lunch_dining          // 午餐
local_bar             // 酒吧
ramen_dining          // 拉麵
```

### 購物類
```
shopping_cart         // 購物車（超市）
shopping_bag          // 購物袋
shopping_basket       // 購物籃（大量購物）
local_mall            // 百貨公司
store                 // 商店
```

### 娛樂類
```
toys                  // 玩具
videogame_asset       // 遊戲/電玩
movie                 // 電影
theater_comedy        // 表演
sports_esports        // 電競
celebration           // 慶祝
```

### 生活類
```
home                  // 房屋
weekend               // 沙發/居家
cleaning_services     // 清潔
local_laundry_service // 洗衣
cottage               // 小屋
```

### 其他類
```
favorite              // 實心愛心
favorite_border       // 空心愛心
credit_card           // 信用卡
medical_services      // 醫療
cake                  // 生日蛋糕
subscriptions         // 訂閱
devices               // 3C 設備
local_offer           // 優惠標籤
```

---

## 完整範例：新增「交通」到常用區域

### 1. TransactionRenderer.js

```javascript
// 第 8-33 行
const CATEGORY_ICONS = {
    // 常用類別
    '吃吃': 'restaurant',
    '喝喝': 'local_cafe',
    '玩玩': 'toys',
    '刷寶媽卡': 'credit_card',
    '高級吃吃': 'dinner_dining',
    '優惠超人': 'local_offer',
    '家樂福/全聯': 'shopping_cart',
    '交通': 'directions_bus',  // ✅ 新增
    // 更多類別...
};

// 第 36-61 行
const CATEGORY_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20',
    '喝喝': 'bg-macaron-blue/20',
    '玩玩': 'bg-macaron-purple/20',
    '刷寶媽卡': 'bg-antique-gold/20',
    '高級吃吃': 'bg-macaron-rose/20',
    '優惠超人': 'bg-macaron-orange/20',
    '家樂福/全聯': 'bg-macaron-green/20',
    '交通': 'bg-macaron-green/20',  // ✅ 新增
    // 更多類別...
};

// 第 64-89 行
const TIMELINE_COLORS = {
    // 常用類別
    '吃吃': 'bg-macaron-pink/20 border-macaron-pink',
    '喝喝': 'bg-macaron-blue/20 border-macaron-blue',
    '玩玩': 'bg-macaron-purple/20 border-macaron-purple',
    '刷寶媽卡': 'bg-antique-gold/20 border-antique-gold',
    '高級吃吃': 'bg-macaron-rose/20 border-macaron-rose',
    '優惠超人': 'bg-macaron-orange/20 border-macaron-orange',
    '家樂福/全聯': 'bg-macaron-green/20 border-macaron-green',
    '交通': 'bg-macaron-green/20 border-macaron-green',  // ✅ 新增
    // 更多類別...
};
```

### 2. index.html

在常用區域（第 833-839 行之後）插入：

```html
<!-- 交通 -->
<button type="button" class="tag-btn flex flex-col items-center gap-2" data-category="交通">
    <div class="bg-gradient-to-br from-macaron-green/40 to-macaron-green/30">
        <span class="material-symbols-outlined text-2xl">directions_bus</span>
    </div>
    <span class="text-sm font-hand font-bold text-warm-brown">交通</span>
</button>
```

### 3. 移動洗衣服到更多區域

將原本的洗衣服按鈕（第 833-839 行）剪切，貼到 `moreCategories` div 內部。

---

## 注意事項 ⚠️

1. **三處同步修改**
   - `TransactionRenderer.js` 的三個物件（ICONS、COLORS、TIMELINE_COLORS）
   - `index.html` 的按鈕 HTML

2. **命名一致性**
   - `data-category` 屬性值必須與 JS 中的鍵名完全一致（包含大小寫、空格、特殊符號）

3. **顏色對應**
   - 列表模式與時間軸模式使用相同基礎顏色
   - 時間軸模式需額外加上 `border-` 前綴

4. **Grid 布局**
   - 常用區域和更多區域都是 4 欄網格（`grid-cols-4`）
   - 「載入更多」按鈕使用 `col-span-4` 佔滿整行

5. **自訂類別**
   - 透過「新增」按鈕建立的類別會自動儲存到 Firebase
   - 不需要手動修改程式碼

---

## 常見問題 FAQ

### Q1: 修改後沒有生效？
**A:** 清除瀏覽器快取並重新整理（Ctrl + Shift + R）。

### Q2: 圖示顯示為方框？
**A:** 檢查圖示名稱是否正確，參考 [Google Material Symbols](https://fonts.google.com/icons)。

### Q3: 顏色沒有套用？
**A:** 確認顏色類別是否存在於 `css/base/variables.css` 中。

### Q4: 按鈕點擊沒反應？
**A:** 檢查 `data-category` 屬性是否與 JS 配置一致。

### Q5: 想要更多顏色選擇？
**A:** 可在 `css/base/variables.css` 中新增自訂顏色變數，然後在 Tailwind 配置中啟用。

---

## 相關檔案

- **圖示與顏色配置：** `js/components/TransactionRenderer.js`
- **HTML 結構：** `index.html`（第 772-956 行）
- **事件綁定：** `js/core/EventBinder.js`（第 100-133 行）
- **展開/收合邏輯：** `js/components/TransactionForm.js`（第 505-534 行）
- **樣式定義：** `css/components/forms.css`（第 85-191 行）

---

**最後更新：** 2026-01-10
**版本：** v5.9.1

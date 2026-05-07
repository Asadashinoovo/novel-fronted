# 页面风格统一实施方案

**Goal:** 将所有页面统一为移动端风格（max-width: 480px，sticky 导航栏，暖色背景 #faf7f2）

**Architecture:** 以 SearchRank.vue 为基准，统一各页面的容器宽度、导航栏样式和背景色。

**Tech Stack:** Vue 3, CSS Scoped

---

## 统一样式规范

所有页面根容器样式：
```css
.page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #faf7f2;
}
```

统一 sticky 导航栏：
```css
.nav-bar {
  position: sticky;
  top: 0;
  background: #fff8f0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0ebe5;
  z-index: 50;
}

.back-btn {
  font-size: 20px;
  color: #5a3a2a;
  cursor: pointer;
  padding: 4px 8px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #5a3a2a;
  margin-left: 8px;
}
```

---

## 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `src/views/home/App.vue` | 重构布局为 480px 窄屏 + 添加 sticky nav-bar |
| `src/views/rank/BookRank.vue` | 添加 max-width: 480px |
| `src/views/book/BookDetail.vue` | max-width 从 600px 改为 480px |
| `src/views/read/ReadPage.vue` | max-width 从 800px 改为 480px |
| `src/views/publish/PublishManage.vue` | 添加 sticky nav-bar + max-width: 480px |
| `src/views/publish/BookDetail.vue` | 添加 sticky nav-bar + max-width: 480px |
| `src/views/comic/Comic.vue` | 添加 sticky nav-bar + max-width: 480px + 暖色背景 |
| `src/views/me/Me.vue` | 添加 sticky nav-bar + max-width: 480px + 暖色背景 |

---

### Task 1: 统一 home/App.vue

**Files:**
- Modify: `src/views/home/App.vue`

**Current:** `max-width: 1200px`，hero 区域居中，无导航栏
**Target:** `max-width: 480px` + sticky nav-bar "南瓜小说"

- [ ] **Step 1: 修改根容器样式**

将 `.page` 样式块中的 `max-width: 1200px` 改为 `max-width: 480px`

- [ ] **Step 2: 添加 sticky 导航栏**

在 `<div class="page">` 后添加：
```html
<div class="nav-bar">
  <span class="nav-title">南瓜小说</span>
</div>
```

在 `<style scoped>` 中添加 `.nav-bar`、`.back-btn`、`.nav-title` 样式

- [ ] **Step 3: 调整 hero 区域**

Hero 区域保持居中，但内容宽度受限（内容已相对定位，居中性不受 max-width 影响）

- [ ] **Step 4: 调整书籍网格为单列展示**

`grid-template-columns` 从 `repeat(4, 1fr)` 改为 `repeat(2, 1fr)`

- [ ] **Step 5: 提交**

```bash
git add src/views/home/App.vue
git commit -m "style: unify home page to mobile layout"
```

---

### Task 2: 统一 rank/BookRank.vue

**Files:**
- Modify: `src/views/rank/BookRank.vue`

**Current:** 无 max-width 限制
**Target:** 添加 `max-width: 480px`

- [ ] **Step 1: 在 .page 样式中添加 max-width**

找到 `.page {` 样式块，添加 `max-width: 480px;` 和 `margin: 0 auto;`

- [ ] **Step 2: 提交**

```bash
git add src/views/rank/BookRank.vue
git commit -m "style: unify BookRank page width to 480px"
```

---

### Task 3: 统一 book/BookDetail.vue

**Files:**
- Modify: `src/views/book/BookDetail.vue`

**Current:** `max-width: 600px`
**Target:** `max-width: 480px`

- [ ] **Step 1: 修改 max-width**

将 `.page {` 中的 `max-width: 600px` 改为 `max-width: 480px`

- [ ] **Step 2: 提交**

```bash
git add src/views/book/BookDetail.vue
git commit -m "style: unify BookDetail page width to 480px"
```

---

### Task 4: 统一 read/ReadPage.vue

**Files:**
- Modify: `src/views/read/ReadPage.vue`

**Current:** `.content { max-width: 800px }`
**Target:** `.content { max-width: 480px }`

- [ ] **Step 1: 修改内容区 max-width**

将 `.content { max-width: 800px }` 改为 `.content { max-width: 480px }`

- [ ] **Step 2: 提交**

```bash
git add src/views/read/ReadPage.vue
git commit -m "style: unify ReadPage content width to 480px"
```

---

### Task 5: 统一 publish/PublishManage.vue

**Files:**
- Modify: `src/views/publish/PublishManage.vue`

**Current:** 无 sticky nav-bar，`max-width: 400px`
**Target:** 添加 sticky nav-bar + `max-width: 480px`

- [ ] **Step 1: 修改根容器样式**

在 `.publish-page {` 中添加 `max-width: 480px; margin: 0 auto;`

- [ ] **Step 2: 将现有 .header 替换为 sticky nav-bar**

将 `<div class="header">` 替换为：
```html
<div class="nav-bar">
  <span class="back-btn" @click="router.push('/me')">‹</span>
  <span class="nav-title">我的发布</span>
</div>
```

- [ ] **Step 3: 添加 nav-bar 相关样式**

在 `<style scoped>` 中添加 `.nav-bar`、`.back-btn`、`.nav-title` 样式（参考规范）

- [ ] **Step 4: 提交**

```bash
git add src/views/publish/PublishManage.vue
git commit -m "style: unify PublishManage with sticky nav-bar"
```

---

### Task 6: 统一 publish/BookDetail.vue

**Files:**
- Modify: `src/views/publish/BookDetail.vue`

**Current:** 普通 header，`max-width: 700px`
**Target:** sticky nav-bar + `max-width: 480px`

- [ ] **Step 1: 修改根容器样式**

在 `.detail-page {` 中将 `max-width` 改为 `480px`，添加 `margin: 0 auto;`

- [ ] **Step 2: 将 .header 替换为 sticky nav-bar**

将 `<div class="header">` 替换为：
```html
<div class="nav-bar">
  <span class="back-btn" @click="router.back()">‹</span>
  <span class="nav-title">书籍详情</span>
  <div style="flex:1"></div>
  <button v-if="bookInfo" class="edit-btn" @click="openEditDialog">编辑</button>
  <button v-if="bookInfo" class="add-btn" @click="openAddDialog">添加章节</button>
</div>
```

- [ ] **Step 3: 添加 nav-bar 样式**

- [ ] **Step 4: 提交**

```bash
git add src/views/publish/BookDetail.vue
git commit -m "style: unify publish BookDetail with sticky nav-bar"
```

---

### Task 7: 统一 comic/Comic.vue

**Files:**
- Modify: `src/views/comic/Comic.vue`

**Current:** `background: #f5f5f5`，普通 header
**Target:** `background: #faf7f2` + sticky nav-bar + `max-width: 480px`

- [ ] **Step 1: 修改根容器样式**

将 `.comic-page {` 改为：
```css
.comic-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #faf7f2;
}
```

- [ ] **Step 2: 替换 header 为 sticky nav-bar**

将 `<div class="header">` 替换为：
```html
<div class="nav-bar">
  <span class="back-btn" @click="router.push('/')">‹</span>
  <span class="nav-title">漫画</span>
</div>
```

- [ ] **Step 3: 添加 nav-bar 样式**

- [ ] **Step 4: 提交**

```bash
git add src/views/comic/Comic.vue
git commit -m "style: unify Comic page to mobile layout"
```

---

### Task 8: 统一 me/Me.vue

**Files:**
- Modify: `src/views/me/Me.vue`

**Current:** `background: #f5f5f5`，普通 header
**Target:** `background: #faf7f2` + sticky nav-bar + `max-width: 480px`

- [ ] **Step 1: 修改根容器样式**

将 `.me-page {` 改为：
```css
.me-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #faf7f2;
}
```

- [ ] **Step 2: 替换 header 为 sticky nav-bar**

将 `<div class="header">` 替换为：
```html
<div class="nav-bar">
  <span class="nav-title">个人中心</span>
</div>
```

- [ ] **Step 3: 添加 nav-bar 样式**

- [ ] **Step 4: 提交**

```bash
git add src/views/me/Me.vue
git commit -m "style: unify Me page to mobile layout"
```

---

## 自检清单

- [ ] 所有页面 max-width 统一为 480px
- [ ] 所有页面 background 统一为 #faf7f2
- [ ] 所有页面添加 sticky nav-bar（除首页标题外）
- [ ] nav-bar 样式统一：background: #fff8f0, border-bottom: 1px solid #f0ebe5
- [ ] SearchRank.vue 无需修改（已达标）

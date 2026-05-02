# 章节导航功能设计

## 1. 概述

在 ReadPage.vue 中添加章节间导航功能（上一章/下一章），使用数组索引作为显示序号，避免后端 chapterNum 字段不可靠的问题。

## 2. 数据流

```
BookDetail.vue
  └── router.push(`/read/${bookId}/${chapterId}?chapterIndex=${index}`)
                              ↓
ReadPage.vue
  ├── 从 URL 获取 chapterIndex
  ├── 用 bookId 调用 getBookChapters 获取章节列表
  ├── 根据 chapterIndex 计算 prevChapterId / nextChapterId
  └── 显示: 第 (chapterIndex + 1) 章 / 共 N 章
```

## 3. 修改文件

### BookDetail.vue

**goToRead 函数：**
```typescript
function goToRead(chapterId: number, chapterIndex: number) {
  const bookId = Number(route.params.id)
  router.push(`/read/${bookId}/${chapterId}?chapterIndex=${chapterIndex}`)
}
```

**模板调用：**
```vue
@click="goToRead(chapter.id, index)"
```

### ReadPage.vue

**新增状态：**
```typescript
const chapters = ref<any[]>([])
const chapterIndex = ref(0)  // 当前章节在列表中的位置
const prevChapterId = ref<number | null>(null)
const nextChapterId = ref<number | null>(null)
```

**获取章节列表：**
```typescript
// 在 onMounted 中获取章节列表
const chaptersRes = await getBookChapters(bookId)
chapters.value = chaptersRes.data.data || []
chapterIndex.value = Number(route.query.chapterIndex) || 0

// 计算上一章/下一章
if (chapterIndex.value > 0) {
  prevChapterId.value = chapters.value[chapterIndex.value - 1].id
}
if (chapterIndex.value < chapters.value.length - 1) {
  nextChapterId.value = chapters.value[chapterIndex.value + 1].id
}
```

**按钮文案逻辑：**
- 最后一页：下一页按钮显示"下一章"
- 第一页：上一页按钮显示"上一章"
- 非首末页：显示"上一页"/"下一页"

**切换章节：**
```typescript
function goToPrevChapter() {
  if (prevChapterId.value) {
    router.push(`/read/${route.params.bookId}/${prevChapterId.value}?chapterIndex=${chapterIndex.value - 1}`)
  }
}

function goToNextChapter() {
  if (nextChapterId.value) {
    router.push(`/read/${route.params.bookId}/${nextChapterId.value}?chapterIndex=${chapterIndex.value + 1}`)
  }
}
```

## 4. 显示序号逻辑

- **章节标题**：使用 `chapterIndex + 1` 作为序号，不依赖后端 chapterNum
- **按钮文案**：根据当前页和章节位置综合判断

## 5. 验收标准

- [ ] 章节导航按钮正确显示
- [ ] 跳转上一章/下一章功能正常
- [ ] 章节序号始终正确（不受后端影响）
- [ ] 添加/删除章节后导航仍然正确
- [ ] 切换章节后重置页码为 1
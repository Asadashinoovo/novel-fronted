# 阅读页分页功能设计

## 1. 概述

在 ReadPage.vue 中实现章节内容分页显示，支持固定高度分页、多种翻页交互、页码指示器，同时保留跨章节导航功能。

## 2. 分页逻辑

- **固定高度分页**：内容容器高度固定为 `calc(100vh - 160px)`
- 每页行数由 `line-height: 1.8` 和容器高度自动决定（约 20-25 行）
- 总页数通过 `Math.ceil(content.split('\n').length / linesPerPage)` 计算
- 内容按自然换行符 `\n` 拆分成段落数组，再分配到各页面

## 3. 数据字段（后端返回）

```
GET /api/chapter/get/{bookId}/{id}
返回: {
  id: number,
  title: string,
  chapterNum: number,  // 章节序号，来自后端
  content: string,
  wordCount: number,
  readCount: number
}
```

## 4. 交互方式

| 交互 | 行为 |
|------|------|
| 底部按钮 | 上一页/下一页，禁用状态灰显 |
| 左右滑动 | touchstart/touchend 差值 > 50px 触发翻页 |
| 点击屏幕边缘 | 左 30% = 上一页，右 30% = 下一页 |
| 页码指示器 | 点击圆点跳转到对应页面 |

## 5. 页面指示器

- 固定在内容区下方
- 圆点指示器，当前页高亮（实心 vs 空心）
- 最多显示 7 个点，超过用省略号（如 1 2 3 ... 10）
- 显示 "第 X/Y 页" 文本

## 6. 章节间切换

- 当前页 = 最后一页时，下一页按钮变为"下一章"
- 当前页 = 第一页时，上一页按钮变为"上一章"
- 切换章节时重置页码为 1

## 7. 组件状态

```typescript
const chapter = ref<{
  id: number
  title: string
  chapterNum: number
  content: string
  wordCount: number
  readCount: number
} | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(true)
```

## 8. API 调用

- 获取章节内容：`getChapterContent(bookId, chapterId)`
- 已有 API：`src/api/modules/book.ts` 中的 `getChapterContent`

## 9. 文件修改

- 修改 `src/views/read/ReadPage.vue`
- 不修改其他文件

## 10. 验收标准

- [ ] 分页显示正确，每页高度固定
- [ ] 底部按钮翻页正常工作
- [ ] 滑动手势翻页正常工作
- [ ] 点击屏幕边缘翻页正常工作
- [ ] 页码指示器显示正确，可点击跳转
- [ ] 章节末页/首页正确切换为"上一章/下一章"
- [ ] 切换章节后页码重置为 1
- [ ] 加载状态显示正确
- [ ] 错误处理正确（参数错误、获取失败）
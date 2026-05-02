<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapterContent, getBookChapters } from '@/api/modules/book'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const chapter = ref<any>(null)
const chapterNum = ref<number>(0)
const chapters = ref<any[]>([])
const chapterIndex = ref(0)
const prevChapterId = ref<number | null>(null)
const nextChapterId = ref<number | null>(null)

// 分页状态变量
const currentPage = ref(1)
const totalPages = ref(1)
const pages = ref<string[]>([])

// 触摸跟踪变量
const touchStartX = ref(0)
const touchEndX = ref(0)

// 分页控制函数
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  } else if (chapterIndex.value < chapters.value.length - 1) {
    // 当前章最后一页，跳转到下一章第一页
    const nextBookId = Number(route.params.bookId)
    const nextChapterId = chapters.value[chapterIndex.value + 1].id
    router.push(`/read/${nextBookId}/${nextChapterId}?chapterIndex=${chapterIndex.value + 1}`)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  } else if (chapterIndex.value > 0) {
    // 当前章第一页，跳转到上一章最后一页，传递 targetPage=-1 表示最后一页
    const prevBookId = Number(route.params.bookId)
    const prevChapterId = chapters.value[chapterIndex.value - 1].id
    router.push(`/read/${prevBookId}/${prevChapterId}?chapterIndex=${chapterIndex.value - 1}&targetPage=-1`)
  }
}

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

// 触摸手势处理
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX
  const diffX = touchEndX.value - touchStartX.value
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      prevPage()
    } else {
      nextPage()
    }
  }
}

// 点击屏幕边缘处理
const handleContentClick = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = clickX / rect.width
  if (percentage < 0.3) {
    prevPage()
  } else if (percentage > 0.7) {
    nextPage()
  }
}

// 计算每页行数
const getLinesPerPage = (): number => {
  const containerHeight = window.innerHeight - 160
  const lineHeight = 16 * 1.8 // font-size * line-height
  return Math.floor(containerHeight / lineHeight)
}

// 按行数拆分内容到 pages 数组
const splitContentIntoPages = (content: string) => {
  const lines = content.split('\n')
  const linesPerPage = getLinesPerPage()
  const pageCount = Math.ceil(lines.length / linesPerPage)
  totalPages.value = pageCount
  pages.value = []

  for (let i = 0; i < pageCount; i++) {
    const start = i * linesPerPage
    const end = start + linesPerPage
    pages.value.push(lines.slice(start, end).join('\n'))
  }
}

// 监听路由变化，重新加载章节
watch(() => [route.params.id, route.query.chapterIndex], (newId, newIndex) => {
  if (newId && route.params.id) {
    fetchChapter()
  }
}, { immediate: false })

async function fetchChapter() {
  // 重置状态
  chapter.value = null
  chapters.value = []  // 先清空章节列表
  prevChapterId.value = null
  nextChapterId.value = null
  pages.value = []
  currentPage.value = 1

  const bookId = Number(route.params.bookId)
  const chapterId = Number(route.params.id)
  const queryIndex = route.query.chapterIndex
  chapterIndex.value = queryIndex ? Number(queryIndex) : 0
  if (isNaN(bookId) || isNaN(chapterId)) {
    ElMessage.error('参数错误')
    router.back()
    return
  }

  try {
    const res = await getChapterContent(bookId, chapterId)
    if (res.data.success) {
      chapter.value = res.data.data
      splitContentIntoPages(res.data.data.content)
      // 检查是否需要跳到最后一页
      const targetPage = route.query.targetPage
      if (targetPage === '-1') {
        currentPage.value = totalPages.value
      }
    }
  } catch (e) {
    ElMessage.error('获取章节内容失败')
  } finally {
    loading.value = false
  }

  // 获取章节列表计算上一章/下一章
  try {
    const chaptersRes = await getBookChapters(bookId)
    chapters.value = chaptersRes.data.data || []
    chapterIndex.value = Number(route.query.chapterIndex) || 0

    if (chapterIndex.value > 0) {
      prevChapterId.value = chapters.value[chapterIndex.value - 1].id
    } else {
      prevChapterId.value = null
    }
    if (chapterIndex.value < chapters.value.length - 1) {
      nextChapterId.value = chapters.value[chapterIndex.value + 1].id
    } else {
      nextChapterId.value = null
    }
  } catch (e) {
    console.error('获取章节列表失败:', e)
  }
}

onMounted(() => {
  fetchChapter()
})
</script>

<template>
  <div class="read-page">
    <div class="header">
      <span class="back-btn" @click="router.push(`/book/${route.params.bookId}`)"><span class="arrow">&lt;</span> 第{{ chapterIndex + 1 }}章 {{ chapter?.title }}</span>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="chapter" class="content">
      <h1 v-if="currentPage === 1" class="chapter-title">第{{ chapterIndex + 1 }}章 {{ chapter?.title }}</h1>
      <div class="chapter-info" v-if="currentPage === 1">
        <span>字数：{{ chapter.wordCount }}</span>
        <span>阅读：{{ chapter.readCount }}</span>
        <span>第{{ chapterIndex + 1 }}/{{ chapters.length }}章</span>
      </div>
      <!-- 内容包装容器，绑定触摸和点击事件 -->
      <div
        class="chapter-content-wrapper"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @click="handleContentClick"
      >
        <div class="chapter-content">
          {{ pages[currentPage - 1] }}
        </div>
      </div>
      <!-- 底部翻页导航 -->
      <div class="page-navigation">
        <div class="page-counter">{{ currentPage }}/{{ totalPages }}</div>
        <div class="nav-btn-group left">
          <button
            v-if="chapterIndex > 0"
            class="nav-btn"
            @click="goToPrevChapter()"
          >
            上一章
          </button>
          <button
            class="nav-btn"
            :disabled="currentPage <= 1 && chapterIndex <= 0"
            @click="prevPage()"
          >
            上一页
          </button>
        </div>
        <div class="page-indicators">
          <template v-if="totalPages <= 7">
            <span
              v-for="i in totalPages"
              :key="i"
              class="indicator"
              :class="{ active: i === currentPage }"
              @click="goToPage(i)"
            ></span>
          </template>
          <template v-else>
            <span
              v-for="i in 3"
              :key="i"
              class="indicator"
              :class="{ active: i === currentPage }"
              @click="goToPage(i)"
            ></span>
            <span class="ellipsis">...</span>
            <span
              class="indicator"
              :class="{ active: totalPages === currentPage }"
              @click="goToPage(totalPages)"
            ></span>
          </template>
        </div>
        <div class="nav-btn-group right">
          <button
            v-if="currentPage < totalPages || chapterIndex < chapters.length - 1"
            class="nav-btn"
            @click="nextPage()"
          >
            下一页
          </button>
          <button
            v-if="chapterIndex < chapters.length - 1"
            class="nav-btn"
            @click="goToNextChapter()"
          >
            下一章
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-page {
  min-height: 100vh;
  background: #d4c4a8;
  color: #333;
  padding: 20px;
  padding-bottom: 80px;
}

.header {
  margin-bottom: 20px;
}

.back-btn {
  font-size: 14px;
  color: #5c4a32;
  cursor: pointer;
}

.arrow {
  font-size: 18px;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #8b7355;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.chapter-title {
  font-size: 20px;
  font-weight: 600;
  color: #5c4a32;
  text-align: center;
  margin: 0 0 12px;
}

.chapter-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  color: #8b7355;
  margin-bottom: 24px;
}

.chapter-content {
  font-size: 16px;
  line-height: 1.8;
  color: #4a3f2f;
  text-indent: 2em;
  white-space: pre-wrap;
}

/* 内容包装容器 */
.chapter-content-wrapper {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* 底部翻页导航 */
.page-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(212, 196, 168, 0.95);
  backdrop-filter: blur(10px);
}

.page-counter {
  font-size: 12px;
  color: #8b7355;
  min-width: 50px;
}

.nav-btn-group {
  display: flex;
  gap: 8px;
}

.nav-btn-group.left {
  justify-content: flex-start;
}

.nav-btn-group.right {
  justify-content: flex-end;
}

.nav-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: #8b7355;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.nav-btn:not(:disabled):hover {
  background: #6b5a45;
}

.page-indicators {
  display: flex;
  gap: 8px;
  align-items: center;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b7355;
  opacity: 0.3;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  opacity: 1;
  transform: scale(1.2);
}

.ellipsis {
  color: #8b7355;
  font-size: 12px;
}
</style>
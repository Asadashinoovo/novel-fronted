<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChapterContent, getBookChapters, getBookDetail } from '@/api/modules/book'
import { ElMessage } from 'element-plus'
import { ElDrawer } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const chapter = ref<any>(null)
const bookName = ref('')
const bookCover = ref('')
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

// 底部导航栏显示状态
const showNavBar = ref(false)

// 目录抽屉显示状态
const showChapterDrawer = ref(false)

// 分页控制函数
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo(0, 0)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo(0, 0)
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
    window.scrollTo(0, 0)
  } else if (chapterIndex.value > 0) {
    // 当前章第一页，跳转到上一章最后一页，传递 targetPage=-1 表示最后一页
    const prevBookId = Number(route.params.bookId)
    const prevChapterId = chapters.value[chapterIndex.value - 1].id
    router.push(`/read/${prevBookId}/${prevChapterId}?chapterIndex=${chapterIndex.value - 1}&targetPage=-1`)
  }
}

function goToPrevChapter() {
  if (prevChapterId.value) {
    window.scrollTo(0, 0)
    router.push(`/read/${route.params.bookId}/${prevChapterId.value}?chapterIndex=${chapterIndex.value - 1}`)
  }
}

function goToNextChapter() {
  if (nextChapterId.value) {
    window.scrollTo(0, 0)
    router.push(`/read/${route.params.bookId}/${nextChapterId.value}?chapterIndex=${chapterIndex.value + 1}`)
  }
}

function goToChapter(chapterId: number, index: number) {
  window.scrollTo(0, 0)
  showChapterDrawer.value = false
  showNavBar.value = false
  router.push(`/read/${route.params.bookId}/${chapterId}?chapterIndex=${index}`)
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
  // 如果抽屉是打开的，不处理点击事件
  if (showChapterDrawer.value) return

  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = clickX / rect.width
  if (percentage < 0.2) {
    prevPage()
  } else if (percentage > 0.8) {
    nextPage()
  } else {
    // 中间区域点击，切换底部导航栏显示/隐藏
    showNavBar.value = !showNavBar.value
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
  showChapterDrawer.value = false

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

  // 获取书籍信息
  try {
    const bookRes = await getBookDetail(bookId)
    if (bookRes.data.success) {
      bookName.value = bookRes.data.data.title
      bookCover.value = bookRes.data.data.cover
    }
  } catch (e) {
    console.error('获取书籍信息失败:', e)
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
  <div class="read-page" @click="handleContentClick">
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
      <!-- 内容包装容器，绑定触摸事件 -->
      <div
        class="chapter-content-wrapper"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div class="chapter-content">
          {{ pages[currentPage - 1] }}
        </div>
      </div>
      <!-- 底部翻页导航 -->
      <div class="page-navigation" :class="{ hidden: !showNavBar }">
        <div class="nav-row top-row">
          <div class="nav-btn-group left">
            <button
              class="nav-btn nav-btn-small"
              :disabled="chapterIndex <= 0"
              @click.stop="goToPrevChapter()"
            >
              上一章
            </button>
            <button
              class="nav-btn nav-btn-small"
              :disabled="currentPage <= 1 && chapterIndex <= 0"
              @click.stop="prevPage()"
            >
              上一页
            </button>
          </div>
          <div class="page-counter">{{ currentPage }}/{{ totalPages }}</div>
          <div class="nav-btn-group right">
            <button
              class="nav-btn nav-btn-small"
              :disabled="currentPage >= totalPages && chapterIndex >= chapters.length - 1"
              @click.stop="nextPage()"
            >
              下一页
            </button>
            <button
              class="nav-btn nav-btn-small"
              :disabled="chapterIndex >= chapters.length - 1"
              @click.stop="goToNextChapter()"
            >
              下一章
            </button>
          </div>
        </div>
        <div class="nav-row bottom-row">
          <div class="menu-wrapper" @click.stop="showChapterDrawer = true">
            <span class="menu-icon">
              <span class="dot">·</span><span class="dash">—</span><br>
              <span class="dot">·</span><span class="dash">—</span><br>
              <span class="dot">·</span><span class="dash">—</span>
            </span>
            <span class="menu-label">目录</span>
          </div>
        </div>
      </div>

      <!-- 目录抽屉 -->
      <el-drawer v-model="showChapterDrawer" title="目录" direction="rtl" size="60%" :style="{ '--el-drawer-bg-color': '#e8f5e9' }">
        <div class="drawer-header">
          <img v-if="bookCover" :src="bookCover" class="drawer-cover" />
          <span class="drawer-book-name">{{ bookName }}</span>
        </div>
        <div class="drawer-chapter-list">
          <div class="chapter-item" v-for="(chapter, index) in chapters" :key="chapter.id" :class="{ active: index === chapterIndex }" @click="goToChapter(chapter.id, index)">
            <span v-if="index === chapterIndex" class="active-icon">●</span>
            <span class="chapter-num">第{{ index + 1 }}章</span><span class="chapter-gap"></span><span class="chapter-title">{{ chapter.title }}</span>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<style scoped>
.read-page {
  min-height: 100vh;
  background: #d4c4a8;
  color: #333;
  padding: 20px;
  padding-bottom: 55px;
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
  flex-direction: column;
  padding: 10px 16px;
  background: rgba(212, 196, 168, 0.95);
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-row.top-row {
  margin-bottom: 8px;
}

.nav-row.bottom-row {
  position: relative;
  display: flex;
  align-items: center;
  height: 44px;
}

.page-navigation.hidden {
  opacity: 0;
  transform: translateY(100%);
  pointer-events: none;
}

.page-counter {
  font-size: 12px;
  color: #8b7355;
  min-width: 50px;
}

.nav-btn-group {
  display: flex;
  gap: 6px;
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
  white-space: nowrap;
  min-width: 60px;
  text-align: center;
  outline: none;
}

.nav-btn:focus {
  outline: none;
  box-shadow: none;
  background: #8b7355;
}

.nav-btn-small {
  padding: 6px 10px;
  font-size: 12px;
  min-width: 50px;
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

/* 目录抽屉 */
.drawer-chapter-list {
  display: flex;
  flex-direction: column;
}

.drawer-chapter-list .chapter-item {
  padding: 14px 0;
  border-bottom: 1px solid #ccc;
  cursor: default;
}

.drawer-chapter-list .chapter-item:hover {
  background: #e8f5e9;
}

.drawer-chapter-list .chapter-item.active {
  color: #ff8c00;
  background: #fff8f0;
  border-radius: 4px;
  padding: 12px 8px;
}

.drawer-chapter-list .chapter-item.active .chapter-num,
.drawer-chapter-list .chapter-item.active .chapter-title {
  color: #ff8c00;
}

.drawer-chapter-list .chapter-item.active .chapter-num,
.drawer-chapter-list .chapter-item.active .chapter-title {
  font-weight: normal;
}

.drawer-chapter-list .chapter-num {
  font-size: 14px;
  color: #333;
}

.drawer-chapter-list .chapter-title {
  font-size: 14px;
  color: #333;
  font-weight: normal;
}

.active-icon {
  color: #ff8c00;
  margin-right: 6px;
  font-size: 10px;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ddd;
}

.drawer-cover {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.drawer-book-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.chapter-gap {
  display: inline-block;
  width: 20px;
}

.menu-btn {
  background: #5c4a32;
  min-width: 50px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border: none;
  outline: none;
}

.menu-icon {
  letter-spacing: 3px;
  text-align: center;
  line-height: 0.35;
  color: #333;
  font-weight: 700;
  cursor: pointer;
}

.dot {
  font-size: 6px;
}

.dash {
  font-size: 12px;
}

.menu-label {
  font-size: 10px;
  color: #333;
  cursor: pointer;
}

.menu-wrapper {
  position: absolute;
  left: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
</style>
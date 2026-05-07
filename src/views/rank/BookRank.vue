<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'

const route = useRoute()
const router = useRouter()

const book = ref<Book | null>(null)
const chapters = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const bookId = route.params.id
  try {
    const res = await getBookList({ page: 1, pageSize: 1 })
    const books = res.data.data || []
    // 找到对应id的书
    const foundBook = books.find((b: Book) => b.id === Number(bookId))
    if (foundBook) {
      book.value = foundBook
      // 模拟章节数据
      chapters.value = [
        { id: 1, title: '第一章 穿越' },
        { id: 2, title: '第二章 金手指' },
        { id: 3, title: '第三章 修炼' },
        { id: 4, title: '第四章 突破' },
        { id: 5, title: '第五章 宗门大比' },
        { id: 6, title: '第六章 崭露头角' },
        { id: 7, title: '第七章 扬名' },
        { id: 8, title: '第八章 秘境' },
        { id: 9, title: '第九章 奇遇' },
        { id: 10, title: '第十章 归来' },
      ]
    }
  } finally {
    loading.value = false
  }
})

function goToRead(chapterId: number) {
  router.push(`/read/${book.value?.id}/${chapterId}`)
}
</script>

<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <span class="back-btn" @click="router.back()">&lt;</span>
      <span class="nav-title">书籍详情</span>
    </div>

    <!-- 书本信息 -->
    <div class="book-header">
      <img v-if="book?.cover" :src="book.cover" class="book-cover" />
      <div v-else class="book-cover book-placeholder"></div>
      <div class="book-info">
        <h1 class="book-title">{{ book?.title || '加载中...' }}</h1>
        <p class="book-author">{{ book?.authorName || book?.author || '未知作者' }}</p>
        <p class="book-desc">{{ book?.description || '暂无简介' }}</p>
      </div>
    </div>

    <!-- 章节列表 -->
    <div class="chapter-section">
      <h2 class="section-title">目录</h2>
      <div class="chapter-list">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item"
          @click="goToRead(chapter.id)"
        >
          {{ chapter.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #faf7f2;
  max-width: 480px;
  margin: 0 auto;
}

.nav-bar {
  position: sticky;
  top: 0;
  background: #fff8f0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0ebe5;
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

.book-header {
  background: linear-gradient(180deg, #fff8f0 0%, #ffffff 100%);
  padding: 24px 16px;
  display: flex;
}

.book-cover {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.book-placeholder {
  background: linear-gradient(135deg, #f0e6d6 0%, #e8d5c0 100%);
}

.book-info {
  margin-left: 16px;
  flex: 1;
}

.book-title {
  font-size: 20px;
  font-weight: 700;
  color: #5a3a2a;
  margin: 0 0 8px;
}

.book-author {
  font-size: 13px;
  color: #8a7a6a;
  margin: 0 0 12px;
}

.book-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chapter-section {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #5a3a2a;
  margin: 0 0 16px;
}

.chapter-list {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.chapter-item {
  padding: 14px 16px;
  font-size: 14px;
  color: #5a3a2a;
  cursor: pointer;
  transition: background 0.2s;
}

.chapter-item:hover {
  background: #faf7f2;
}

.chapter-item + .chapter-item {
  border-top: 1px solid #f0ebe5;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'
import BookCard from './BookCard.vue'

const router = useRouter()

const books = ref<Book[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const keyword = ref('')
const activeTab = ref('novel')
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchBooks() {
  if (loading.value && !keyword.value) return
  loading.value = true
  try {
    const res = await getBookList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    })
    const newBooks = res.data.data || []
    if (page.value === 1) {
      books.value = newBooks
    } else {
      books.value.push(...newBooks)
    }
    hasMore.value = newBooks.length === pageSize.value
    page.value++
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    hasMore.value = true
    books.value = []
    fetchBooks()
  }, 300)
}

function handleScroll() {
  const scrollBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  if (scrollBottom < 100) {
    fetchBooks()
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchBooks()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="page">
    <div class="hero">
      <h1 class="hero-title">南瓜小说</h1>
      <p class="hero-sub">海量免费小说，畅享阅读时光</p>
      <div class="search-box">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索书名..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>
    <div class="container">
      <h2 class="section-title">热门推荐</h2>
      <div v-loading="loading" class="book-grid">
        <BookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
      <div v-if="!hasMore && books.length > 0" class="no-more">没有更多了</div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.hero {
  text-align: center;
  padding: 48px 20px 36px;
  background: #ffffff;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin: 0 0 8px;
}

.hero-sub {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 20px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  min-height: 200px;
}

@media (max-width: 1024px) {
  .book-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero-title {
    font-size: 26px;
  }
}

.search-box {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #ff6b35;
}

.no-more {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
  padding-bottom: 70px;
}
</style>
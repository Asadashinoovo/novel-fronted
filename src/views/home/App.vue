<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'
import BookCard from './BookCard.vue'

const router = useRouter()

const books = ref<Book[]>([])
const featuredBooks = ref<Book[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const keyword = ref('')
const activeTab = ref('novel')
const currentSlide = ref(0)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let slideTimer: ReturnType<typeof setInterval> | null = null

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
      // 设置今日主打（前6本或全部）
      featuredBooks.value = newBooks.slice(0, 6)
    } else {
      books.value.push(...newBooks)
    }
    hasMore.value = newBooks.length === pageSize.value
    page.value++
  } finally {
    loading.value = false
  }
}

function nextSlide() {
  if (featuredBooks.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % featuredBooks.value.length
}

function prevSlide() {
  if (featuredBooks.value.length === 0) return
  currentSlide.value = (currentSlide.value - 1 + featuredBooks.value.length) % featuredBooks.value.length
}

function startAutoSlide() {
  if (slideTimer) clearInterval(slideTimer)
  slideTimer = setInterval(nextSlide, 3000)
}

function stopAutoSlide() {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
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
  startAutoSlide()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  stopAutoSlide()
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
      <!-- 今日主打 -->
      <div class="featured-section">
        <div class="featured-wrapper" @mouseenter="stopAutoSlide" @mouseleave="startAutoSlide">
          <div class="featured-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="book in featuredBooks" :key="book.id" class="featured-item">
              <div class="featured-card" @click="router.push(`/book/${book.id}`)">
                <img v-if="book.cover" :src="book.cover" class="featured-cover" />
                <div v-else class="featured-cover featured-placeholder"></div>
              </div>
            </div>
          </div>
          <button class="slide-btn slide-left" @click="prevSlide">
            <span>&lt;</span>
          </button>
          <button class="slide-btn slide-right" @click="nextSlide">
            <span>&gt;</span>
          </button>
        </div>
        <div class="slide-dots">
          <span
            v-for="(_, index) in featuredBooks"
            :key="index"
            class="dot"
            :class="{ active: index === currentSlide }"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>

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
  background: #faf7f2;
}

.hero {
  text-align: center;
  padding: 32px 20px 24px;
  background: #faf7f2;
}

.hero-title {
  font-size: 24px;
  font-weight: 700;
  color: #5a3a2a;
  margin: 0 0 6px;
}

.hero-sub {
  font-size: 12px;
  color: #8a7a6a;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.featured-section {
  margin-bottom: 24px;
}

.featured-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.featured-track {
  display: flex;
  transition: transform 0.5s ease;
}

.featured-item {
  flex: 0 0 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

.featured-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 60, 30, 0.12);
}

.featured-cover {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.featured-placeholder {
  background: linear-gradient(135deg, #f0e6d6 0%, #e8d5c0 100%);
}

.slide-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
  z-index: 2;
}

.slide-btn:hover {
  background: #fff;
}

.slide-btn span {
  font-size: 18px;
  color: #5a3a2a;
  line-height: 1;
}

.slide-left {
  left: 12px;
}

.slide-right {
  right: 12px;
}

.slide-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0c0b0;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}

.dot.active {
  background: #ff6b35;
  transform: scale(1.2);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  font-family: 'Noto Serif SC', serif;
  color: #e06830;
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
  border: 1px solid #bbb;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;
}

.search-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
  background: #fff;
}

.no-more {
  text-align: center;
  color: #a09080;
  padding: 20px;
  font-size: 14px;
  padding-bottom: 70px;
}
</style>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'
import BookCard from './BookCard.vue'

const router = useRouter()

const books = ref<Book[]>([])
const featuredBooks = ref<Book[]>([
  { id: 1, title: '封面1', cover: 'https://i.bobopic.com/small/101733315.jpg', author: '', authorName: '', description: '' },
  { id: 2, title: '封面2', cover: 'https://ts1.tc.mm.bing.net/th/id/R-C.d1d8b6cb909e5abb8da3473936348f6c?rik=y8nL78C07qf9vw&riu=http%3a%2f%2fn.sinaimg.cn%2fsinacn%2fw2048h1468%2f20180220%2f15ab-fyrswmu4535841.jpg&ehk=v9XBWX0cEZs%2b3p0j6MsXoIIQ%2bGpKaXift5Z48UWFg98%3d&risl=&pid=ImgRaw&r=0', author: '', authorName: '', description: '' },
  { id: 3, title: '封面3', cover: 'https://www.scla.com.cn/Public/Uploads/uploadfile/images/20230830/20230830140002_64eedae295da9.jpg', author: '', authorName: '', description: '' },
  { id: 4, title: '封面4', cover: 'https://www.scla.com.cn/Public/Uploads/uploadfile/images/20230403/20230403161613_642a8b4d66aba.jpg', author: '', authorName: '', description: '' },
])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const keyword = ref('')
const activeTab = ref('novel')
const currentSlide = ref(0)
const searchFocused = ref(false)
const searchResults = ref<Book[]>([])
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
    } else {
      books.value.push(...newBooks)
    }
    hasMore.value = newBooks.length === pageSize.value
    page.value++
  } finally {
    loading.value = false
  }
}

async function fetchSearchResults() {
  if (!keyword.value.trim()) {
    searchResults.value = []
    return
  }
  try {
    const res = await getBookList({
      page: 1,
      pageSize: 10,
      keyword: keyword.value
    })
    searchResults.value = res.data.data || []
  } catch (e) {
    searchResults.value = []
  }
}

function handleSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchSearchResults()
  }, 300)
}

function goToBook(book: Book) {
  router.push(`/book/${book.id}`)
}

function goToSearchRank() {
  if (keyword.value.trim()) {
    router.push(`/search-rank?keyword=${encodeURIComponent(keyword.value)}`)
  }
}

function onSearchFocus() {
  searchFocused.value = true
  if (keyword.value) {
    fetchSearchResults()
  }
}

function onSearchBlur() {
  setTimeout(() => {
    searchFocused.value = false
  }, 200)
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
      <div class="search-row">
        <div class="search-box">
          <span class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索书名..."
            class="search-input"
            @input="handleSearchInput"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            @keyup.enter="goToSearchRank"
          />
          <div v-if="searchFocused && searchResults.length > 0" class="search-dropdown">
            <div
              v-for="book in searchResults"
              :key="book.id"
              class="dropdown-item"
              @click="goToBook(book)"
            >
              <img v-if="book.cover" :src="book.cover" class="dropdown-cover" />
              <div v-else class="dropdown-cover dropdown-placeholder"></div>
              <div class="dropdown-info">
                <div class="dropdown-title">{{ book.title }}</div>
                <div class="dropdown-author">{{ book.authorName || book.author }}</div>
              </div>
            </div>
          </div>
        </div>
        <button class="search-btn" @click="goToSearchRank">搜索</button>
      </div>
    </div>
    <div class="container">
      <!-- 今日主打 -->
      <div class="featured-section">
        <div class="featured-wrapper" @mouseenter="stopAutoSlide" @mouseleave="startAutoSlide">
          <div class="featured-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="book in featuredBooks" :key="book.id" class="featured-item">
              <div class="featured-card">
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
  max-width: 480px;
  margin: 0 auto;
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
  grid-template-columns: repeat(2, 1fr);
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
  position: relative;
  width: 360px;
  margin: 20px auto 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
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

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
}

.search-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  background: #faf7f2;
}

.search-box {
  position: relative;
  width: 360px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
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

.search-btn {
  padding: 6px 14px;
  background: #e06830;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #faf7f2;
}

.dropdown-item + .dropdown-item {
  border-top: 1px solid #f0ebe5;
}

.dropdown-cover {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.dropdown-placeholder {
  background: linear-gradient(135deg, #f0e6d6 0%, #e8d5c0 100%);
}

.dropdown-info {
  margin-left: 10px;
  flex: 1;
  min-width: 0;
}

.dropdown-title {
  font-size: 13px;
  font-weight: 600;
  color: #5a3a2a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-author {
  font-size: 11px;
  color: #8a7a6a;
  margin-top: 2px;
}

.no-more {
  text-align: center;
  color: #a09080;
  padding: 20px;
  font-size: 14px;
  padding-bottom: 70px;
}
</style>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'
import BookCard from './BookCard.vue'

const router = useRouter()
const scrolled = ref(false)

const books = ref<Book[]>([])
const rankBooks = ref<Book[]>([])
const rankLoading = ref(false)
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
const activeRankTab = ref('recommend')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let slideTimer: ReturnType<typeof setInterval> | null = null

async function fetchRankBooks() {
  rankLoading.value = true
  try {
    const res = await getBookList({ page: 1, pageSize: 3 })
    rankBooks.value = res.data.data || []
  } finally {
    rankLoading.value = false
  }
}

const rankTabs = [
  { key: 'recommend', label: '推荐榜' },
  { key: 'finished', label: '完结榜' },
  { key: 'new', label: '新书榜' },
  { key: 'drama', label: '长剧榜' },
  { key: 'short', label: '短剧榜' },
]

function handleRankTabClick(key: string) {
  if (key !== 'recommend') {
    ElMessage.info('功能还在开发哦')
    return
  }
  activeRankTab.value = key
}

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
  searchResults.value = []
  searchFocused.value = false
  router.push(`/book/${book.id}`)
}

function goToSearchRank() {
  if (keyword.value.trim()) {
    router.push(`/search-rank?keyword=${encodeURIComponent(keyword.value)}`)
  }
  searchResults.value = []
  searchFocused.value = false
}

function onSearchFocus() {
  searchFocused.value = true
  if (!keyword.value) {
    searchResults.value = []
    return
  }
  fetchSearchResults()
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
  scrolled.value = window.scrollY > 30
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
  fetchRankBooks()
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
    <div class="hero" :class="{ scrolled }">
      <div class="hero-inner">
        <div class="hero-brand" :class="{ hidden: scrolled }">
          <h1 class="hero-title">南瓜小说</h1>
          <span class="hero-stroke"></span>
          <p class="hero-sub">海量免费</p>
        </div>
        <div class="search-row" :class="{ focused: searchFocused }">
          <div class="search-box">
            <span class="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              v-model="keyword"
              type="text"
              placeholder="寻一本好书"
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

      <!-- 榜单切换区 -->
      <div class="rank-section">
        <div v-loading="rankLoading" class="rank-content">
          <div class="rank-tabs">
            <span
              v-for="tab in rankTabs"
              :key="tab.key"
              class="rank-tab"
              :class="{ active: activeRankTab === tab.key }"
              @click="handleRankTabClick(tab.key)"
            >
              {{ tab.label }}
            </span>
          </div>
          <div v-if="activeRankTab === 'recommend'" class="rank-list">
            <div v-for="book in rankBooks" :key="book.id" class="rank-book-row" @click="goToBook(book)">
              <img :src="book.cover" :alt="book.title" class="rank-book-cover" />
              <div class="rank-book-info">
                <p class="rank-book-title">{{ book.title }}</p>
                <p class="rank-book-desc">{{ book.description }}</p>
              </div>
            </div>
          </div>
          <div v-else class="rank-placeholder">待接口填充</div>
        </div>
      </div>

      <div class="book-section">
        <h2 class="section-title">热门推荐</h2>
        <div v-loading="loading" class="book-grid">
          <BookCard v-for="book in books" :key="book.id" :book="book" />
        </div>
        <div v-if="!hasMore && books.length > 0" class="no-more">没有更多了</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.hero {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s, padding 0.3s;
}

.hero.scrolled {
  border-bottom-color: #f0f0f0;
  padding: 10px 24px;
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hero-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
  overflow: hidden;
  max-width: 200px;
  opacity: 1;
  transition: max-width 0.4s ease, opacity 0.3s ease, margin 0.4s ease;
  margin-right: 0;
}

.hero-brand.hidden {
  max-width: 0;
  opacity: 0;
  margin-right: -12px;
}

.hero-title {
  font-size: 17px;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 2px;
  margin: 0;
  white-space: nowrap;
  line-height: 1.2;
}

.hero-stroke {
  width: 24px;
  height: 2px;
  background: #e53e3e;
  border-radius: 1px;
  flex-shrink: 0;
}

.hero-sub {
  font-size: 12px;
  color: #888;
  letter-spacing: 1px;
  margin: 0;
  white-space: nowrap;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 16px 40px;
}

.featured-section {
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
  margin-top: 10px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d0c0b0;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}

.dot.active {
  background: #ff6b35;
  transform: scale(1.2);
}

.rank-section {
}

.rank-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 8px;
}

.rank-tab {
  font-size: 13px;
  font-weight: 400;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.rank-tab.active {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.rank-content {
  min-height: 120px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 16px;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-book-row {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.rank-book-cover {
  width: 45px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.rank-book-info {
  flex: 1;
  min-width: 0;
}

.rank-book-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-book-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 1px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  min-height: 200px;
}



.search-row {
display: flex;
align-items: center;
gap: 0;
min-width: 0;
width: 52%;
transition: width 0.4s ease;
}

.hero.scrolled .search-row,
.hero .search-row.focused {
width: 100%;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #bbb;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  font-size: 12px;
  border: none;
  border-radius: 2px;
  outline: none;
  background: #f5f5f5;
  transition: background 0.2s;
}

.search-input:focus {
  background: #eee;
}

.search-btn {
  padding: 7px 12px;
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.search-btn:active {
  opacity: 0.7;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #fafafa;
}

.dropdown-item + .dropdown-item {
  border-top: 1px solid #f0f0f0;
}

.dropdown-cover {
  width: 32px;
  height: 44px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}

.dropdown-placeholder {
  background: #eee;
}

.dropdown-info {
  margin-left: 10px;
  flex: 1;
  min-width: 0;
}

.dropdown-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-author {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.no-more {
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 13px;
  font-weight: 600;
  padding-bottom: 70px;
}
</style>
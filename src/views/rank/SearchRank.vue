<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookList } from '@/api/modules/book'
import type { Book } from '@/types'

const route = useRoute()
const router = useRouter()

const books = ref<Book[]>([])
const loading = ref(true)
const keyword = ref('')
const searchInput = ref('')
const searchResults = ref<Book[]>([])
const showDropdown = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchBooks() {
  loading.value = true
  try {
    const kw = route.query.keyword as string
    keyword.value = kw || ''
    const res = await getBookList({
      page: 1,
      pageSize: 50,
      keyword: kw || undefined
    })
    books.value = res.data.data || []
  } finally {
    loading.value = false
  }
}

async function fetchSearchResults() {
  if (!searchInput.value.trim()) {
    searchResults.value = []
    return
  }
  try {
    const res = await getBookList({
      page: 1,
      pageSize: 10,
      keyword: searchInput.value
    })
    searchResults.value = res.data.data || []
  } catch (e) {
    searchResults.value = []
  }
}

onMounted(fetchBooks)

watch(() => route.query.keyword, fetchBooks)

function goToBook(book: Book) {
  router.push(`/book/${book.id}`)
}

function handleSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchSearchResults()
    showDropdown.value = true
  }, 500)
}

function handleSearchBtn() {
  showDropdown.value = false
  if (searchInput.value.trim()) {
    router.push(`/search-rank?keyword=${encodeURIComponent(searchInput.value)}`)
  }
}

function onSearchFocus() {
  if (searchResults.value.length > 0) {
    showDropdown.value = true
  }
}

function onSearchBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>

<template>
  <div class="page">
    <!-- 搜索关键词 -->
    <div class="search-tip" v-if="keyword">
      <span>关于 "<strong>{{ keyword }}</strong>" 的搜索结果</span>
    </div>

    <!-- 搜索栏和返回 -->
    <div class="search-row">
      <span class="back-btn" @click="router.push('/')">&lt;</span>
      <div class="search-bar">
        <span class="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          v-model="searchInput"
          type="text"
          placeholder="搜索书名..."
          class="search-input"
          @input="handleSearchInput"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
        />
        <div v-if="showDropdown && searchResults.length > 0" class="search-dropdown">
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
      <button class="search-btn" @click="handleSearchBtn">搜索</button>
    </div>

    <!-- 书籍列表 -->
    <div class="book-list" v-loading="loading">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-item"
        @click="goToBook(book)"
      >
        <img v-if="book.cover" :src="book.cover" class="book-cover" />
        <div v-else class="book-cover book-placeholder"></div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.authorName || book.author }}</p>
          <p class="book-desc">{{ book.description || '暂无简介' }}</p>
        </div>
        <span class="arrow">&gt;</span>
      </div>
      <div v-if="!loading && books.length === 0" class="no-result">
        未找到相关书籍
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #faf7f2;
}

.search-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
}

.back-btn {
  font-size: 20px;
  color: #5a3a2a;
  cursor: pointer;
  padding: 10px 8px;
  flex-shrink: 0;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 360px;
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
  padding: 6px 16px 6px 40px;
  font-size: 14px;
  border: 1px solid #bbb;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;
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

.search-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
  background: #fff;
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
  padding: 2px 8px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #5a3a2a;
  margin-left: 8px;
}

.search-tip {
  padding: 12px 16px;
  font-size: 13px;
  color: #8a7a6a;
  background: #fff;
  border-bottom: 1px solid #f0ebe5;
}

.search-tip strong {
  color: #e06830;
}

.book-list {
  padding: 12px 16px;
}

.book-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 60, 30, 0.1);
}

.book-cover {
  width: 64px;
  height: 85px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.book-placeholder {
  background: linear-gradient(135deg, #f0e6d6 0%, #e8d5c0 100%);
}

.book-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: #5a3a2a;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 12px;
  color: #8a7a6a;
  margin: 0 0 6px;
}

.book-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  font-size: 18px;
  color: #bbb;
  margin-left: 8px;
}

.no-result {
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
  color: #999;
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Book {
  id: number
  title: string
  author: string
  authorName: string
  authorId: number
  cover: string
  description: string
  hotCount: number
}

const props = defineProps<{
  book: Book
}>()

const router = useRouter()

function goToDetail() {
  router.push(`/book/${props.book.id}`)
}
</script>

<template>
  <div class="book-card">
    <div class="cover-wrapper" @click="goToDetail">
      <img :src="book.cover" :alt="book.title" class="book-cover" />
      <div class="overlay">
        <span class="read-btn">阅读</span>
      </div>
    </div>
    <div class="info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-desc">{{ book.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.cover-wrapper {
  position: relative;
  overflow: hidden;
}

.book-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .overlay {
  opacity: 1;
}

.read-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.info {
  padding: 6px;
}

.book-title {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-desc {
  font-size: 11px;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>
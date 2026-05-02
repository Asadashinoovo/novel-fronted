<script setup lang="ts">
interface Book {
  id: number
  title: string
  author: string
  cover: string
  description: string
}

defineProps<{
  book: Book
}>()
</script>

<template>
  <div class="book-card">
    <img :src="book.cover" :alt="book.title" class="book-cover" />
    <h3 class="book-title">{{ book.title }}</h3>
    <p class="book-author">{{ book.author }}</p>
    <p class="book-desc">{{ book.description }}</p>
  </div>
</template>

<style scoped>
.book-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 4px;
  background: #f0f0f0;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 10px 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
</style>

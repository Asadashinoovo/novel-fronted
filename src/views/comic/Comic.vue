<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="comic-page">
    <div class="nav-bar">
      <span class="back-btn" @click="router.push('/')">‹</span>
      <span class="nav-title">漫画</span>
    </div>
    <div class="content">
      <p>漫画页面开发中...</p>
    </div>
  </div>
</template>

<style scoped>
.comic-page {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #faf7f2;
}

.nav-bar {
  position: sticky;
  top: 0;
  background: #fff8f0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0ebe5;
  z-index: 50;
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

.content {
  padding: 40px;
  text-align: center;
  color: #999;
}
</style>
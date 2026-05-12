<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref('novel')

const showTabBar = computed(() => {
  return ['/', '/comic', '/me'].includes(route.path)
})

function goTo(path: string, tab: string) {
  activeTab.value = tab
  router.push(path)
}
</script>

<template>
  <router-view />
  <div class="tab-bar" v-if="showTabBar">
    <div class="tab-bar-inner">
      <div class="tab-item" :class="{ active: activeTab === 'novel' }" @click="goTo('/', 'novel')">小说</div>
      <div class="tab-item" :class="{ active: activeTab === 'comic' }" @click="goTo('/comic', 'comic')">漫画</div>
      <div class="tab-item" :class="{ active: activeTab === 'me' }" @click="goTo('/me', 'me')">我</div>
    </div>
  </div>
</template>

<style>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-bar-inner {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.tab-item:active {
  background: #f5f5f5;
}

.tab-item.active {
  color: #333;
  font-weight: 600;
}
</style>
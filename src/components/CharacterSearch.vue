<script setup lang="ts">
import { ref } from 'vue'
import { searchCharacter } from '@/api/modules/ai'
import { ElMessage } from 'element-plus'
import type { CharacterSearchResult } from '@/types'

const props = defineProps<{
  bookId: number
  maxChapterId?: number
}>()

const keyword = ref('')
const searching = ref(false)
const results = ref<CharacterSearchResult[]>([])
const searched = ref(false)

async function doSearch() {
  const name = keyword.value.trim()
  if (!name) return

  searching.value = true
  results.value = []
  searched.value = false

  try {
    const res = await searchCharacter({
      bookId: props.bookId,
      characterName: name,
      maxChapterId: props.maxChapterId
    })
    if (res.data.success && res.data.data) {
      results.value = res.data.data
      if (results.value.length === 0) {
        ElMessage.info('未找到相关角色')
      }
    }
  } catch (e) {
    // handled by interceptor
  } finally {
    searching.value = false
    searched.value = true
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    doSearch()
  }
}
</script>

<template>
  <div class="character-search">
    <div class="search-box">
      <input
        v-model="keyword"
        class="search-input"
        placeholder="输入角色名搜索..."
        :disabled="searching"
        @keydown="handleKeydown"
      />
      <button
        class="search-btn"
        :disabled="!keyword.trim() || searching"
        @click="doSearch"
      >
        {{ searching ? '搜索中...' : '搜索' }}
      </button>
    </div>

    <div class="search-results">
      <div v-if="!searched && !searching" class="search-hint">
        输入角色名，查查 ta 的故事线
      </div>

      <div v-if="searching" class="search-loading">正在搜索...</div>

      <div v-if="searched && results.length === 0 && !searching" class="search-empty">
        未找到相关角色
      </div>

      <div
        v-for="char in results"
        :key="char.characterId"
        class="character-card"
      >
        <div class="character-name">{{ char.characterName }}</div>
        <div class="character-first-chapter">首次登场：第{{ char.firstChapterId }}章</div>
        <div v-if="char.events && char.events.length > 0" class="event-list">
          <div class="event-title">事迹时间线（{{ char.events.length }}条）：</div>
          <div
            v-for="event in char.events"
            :key="event.chapterId"
            class="event-item"
          >
            <span class="event-chapter">第{{ event.chapterId }}章</span>
            <span class="event-desc">{{ event.eventDescription }}</span>
          </div>
        </div>
        <div v-else class="no-events">该角色暂无已记录的事迹</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-search {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-box {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.search-input {
  flex: 1;
  border: 1px solid #e0d5c5;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  background: #faf8f5;
}

.search-input:focus {
  border-color: #8b7355;
}

.search-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #8b7355;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.search-btn:disabled {
  background: #c4b89a;
  cursor: not-allowed;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.search-hint {
  text-align: center;
  color: #bbb;
  margin-top: 60px;
  font-size: 14px;
}

.search-loading {
  text-align: center;
  color: #8b7355;
  margin-top: 40px;
}

.search-empty {
  text-align: center;
  color: #999;
  margin-top: 40px;
}

.character-card {
  background: #faf8f5;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #e8e0d5;
}

.character-name {
  font-size: 16px;
  font-weight: 600;
  color: #5c4a32;
  margin-bottom: 4px;
}

.character-first-chapter {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.event-title {
  font-size: 12px;
  color: #8b7355;
  margin-bottom: 8px;
  font-weight: 500;
}

.event-item {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed #e8e0d5;
  font-size: 13px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-chapter {
  color: #5c8a5a;
  white-space: nowrap;
  flex-shrink: 0;
}

.event-desc {
  color: #4a3f2f;
  line-height: 1.5;
}

.no-events {
  color: #bbb;
  font-size: 13px;
  text-align: center;
  padding: 12px 0;
}
</style>

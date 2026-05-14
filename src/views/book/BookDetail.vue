<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookDetail, getBookChapters, getBookComments, getSimilarBooks } from '@/api/modules/book'
import { ElMessage } from 'element-plus'
import { ElDrawer } from 'element-plus'
import type { Book } from '@/types'
import { setBookCache } from '@/utils/cache'

const route = useRoute()
const router = useRouter()

const book = ref<Book | null>(null)
const chapters = ref<any[]>([])
const comments = ref<any[]>([])
const similarBooks = ref<any[]>([])
const loading = ref(true)
const showChapterDrawer = ref(false)
const showCommentDrawer = ref(false)
const isDescriptionExpanded = ref(false)

async function fetchBook() {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    return
  }

  loading.value = true
  try {
    const [bookRes, chaptersRes, commentsRes, similarRes] = await Promise.all([
      getBookDetail(id),
      getBookChapters(id),
      getBookComments(id),
      getSimilarBooks(id)
    ])
    book.value = bookRes.data.data
    chapters.value = chaptersRes.data.data || []
    comments.value = commentsRes.data.data || []
    similarBooks.value = similarRes.data.data || []
    setBookCache(id, bookRes.data.data, chaptersRes.data.data || [])
  } catch (e) {
    console.error('获取数据失败:', e)
  }

  loading.value = false
}

onMounted(() => {
  fetchBook()
})

function goBack() {
  router.push('/')
}

function goToRead(chapterId: number, chapterIndex: number) {
  if (!chapterId) {
    ElMessage.warning('请联系作者添加书本内容')
    return
  }
  const bookId = Number(route.params.id)
  router.push(`/read/${bookId}/${chapterId}?chapterIndex=${chapterIndex}`)
}
</script>

<template>
  <div class="book-detail">
    <div v-if="loading" class="loading-placeholder"></div>
    <template v-else>
    <!-- 顶部信息栏 -->
    <div class="detail-header">
      <div class="side-back" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>返回</span>
      </div>
      <div class="header-content">
        <img v-if="book" :src="book.cover" :alt="book.title" class="book-cover" />
        <div class="book-info">
          <h1 class="book-title">{{ book?.title }}</h1>
          <div class="book-tags">
            <span class="tag" v-for="type in book?.types" :key="type.id">{{ type.typeName }}</span>
          </div>
          <p class="book-author">
            {{ book?.authorName }}
          </p>
          <p class="book-hot">
            {{ book?.hotCount || 0 }} 热度
          </p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="action-bar">
      <div class="action-content">
        <el-button type="primary" class="action-btn read-btn" @click="goToRead(chapters[0]?.id, 0)">
          开始阅读
        </el-button>
        <el-button class="action-btn shelf-btn">
          加入书架
        </el-button>
      </div>
    </div>

    <!-- 相似书籍 -->
    <div class="similar-section" v-if="similarBooks.length">
      <div class="similar-content">
        <h3 class="similar-title">相似书籍</h3>
        <div class="similar-list">
          <div class="similar-item" v-for="item in similarBooks" :key="item.id">
            <img :src="item.cover" :alt="item.title" class="similar-cover" />
            <p class="similar-name">{{ item.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="content-card">
        <div class="section-header">
          <span class="section-title">简介</span>
        </div>
        <div class="description" :class="{ collapsed: !isDescriptionExpanded }">
          {{ book?.description || '暂无简介' }}
        </div>
        <div class="description-toggle" @click="isDescriptionExpanded = !isDescriptionExpanded">
          {{ isDescriptionExpanded ? '收起' : '展开全部' }}
        </div>
      </div>

      <!-- 目录 -->
      <div class="content-card">
        <div class="section-header">
          <span class="section-title">目录</span>
          <span class="section-count">共{{ chapters.length }}章</span>
          <span class="section-more" @click="showChapterDrawer = true">全部 ></span>
        </div>
        <div class="chapter-list" v-if="chapters.length">
          <div class="chapter-item" v-for="(chapter, index) in chapters" :key="chapter.id" @click="goToRead(chapter.id, index)">
            <span class="chapter-num">第{{ index + 1 }}章</span>
            <span class="chapter-title">{{ chapter.title }}</span>
          </div>
        </div>
        <div v-else class="empty-tip">暂无目录</div>
      </div>

      <!-- 章节抽屉 -->
      <el-drawer v-model="showChapterDrawer" title="目录" direction="rtl" size="70%">
        <div class="drawer-chapter-list">
          <div class="chapter-item" v-for="(chapter, index) in chapters" :key="chapter.id" @click="goToRead(chapter.id, index)">
            <span class="chapter-num">第{{ index + 1 }}章</span>
            <span class="chapter-title">{{ chapter.title }}</span>
          </div>
        </div>
      </el-drawer>

      <!-- 书评抽屉 -->
      <el-drawer v-model="showCommentDrawer" title="全部书评" direction="rtl" size="70%">
        <div class="drawer-comment-list">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-user">
              <div class="user-avatar">{{ comment.userName?.[0] }}</div>
              <span class="user-name">{{ comment.userName }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <div class="comment-footer">
              <span class="comment-likes">👍 {{ comment.likes || 0 }}</span>
              <span class="comment-time">{{ comment.createTime }}</span>
            </div>
          </div>
        </div>
      </el-drawer>

      <!-- 热门书评 -->
      <div class="content-card">
        <div class="section-header">
          <span class="section-title">热门书评</span>
          <span class="section-more" @click="showCommentDrawer = true">更多 ></span>
        </div>
        <div class="comment-list" v-if="comments.length">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <div class="comment-user">
              <div class="user-avatar">{{ comment.userName?.[0] }}</div>
              <span class="user-name">{{ comment.userName }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <div class="comment-footer">
              <span class="comment-likes">👍 {{ comment.likes || 0 }}</span>
              <span class="comment-time">{{ comment.createTime }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无热门书评</div>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
.book-detail {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  color: #000;
  padding-bottom: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.loading-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* PC端返回按钮（header右上角） */
.side-back {
  position: absolute;
  right: 16px;
  top: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  z-index: 10;
  min-width: 50px;
  min-height: 28px;
  box-sizing: border-box;
}

.side-back::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
}

.side-back:hover {
  background: rgba(255, 255, 255, 0.3);
}


/* 顶部信息栏 */
.detail-header {
  position: relative;
  background: #444;
  padding: 35px 20px 30px;
  max-width: 100%;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  position: relative;
}

.book-cover {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.book-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
}

.book-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 10px;
}

.book-author {
  font-size: 13px;
  color: #aaa;
  margin: 0 0 8px;
}

.shelf-btn {
  border: 1.5px solid #ff6b6b !important;
  color: #ff6b6b !important;
  background: #fff !important;
}

.shelf-btn:hover {
  background: #fff5f5 !important;
}

.book-hot {
  font-size: 12px;
  color: #ff6b6b;
  margin: 0;
}

/* 操作按钮 */
.action-bar {
  background: #fff;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.action-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #eee;
}

.read-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
}

.read-btn:hover {
  background: linear-gradient(135deg, #ff5252, #dd4a14);
}

/* 相似书籍 */
.similar-section {
  background: #fff;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.similar-content {
  max-width: 600px;
  margin: 0 auto;
}

.similar-title {
  font-size: 14px;
  color: #333;
  margin: 0 0 16px;
}

.similar-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.similar-item {
  flex-shrink: 0;
  text-align: center;
  width: 80px;
}

.similar-cover {
  width: 70px;
  height: 95px;
  object-fit: cover;
  border-radius: 6px;
  margin: 0 auto 8px;
}

.similar-name {
  font-size: 12px;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 内容区域 */
.content-area {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #eee;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.section-more {
  font-size: 12px;
  color: #999;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.description.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-toggle {
  font-size: 13px;
  color: #ff6b6b;
  text-align: center;
  padding: 8px 0 4px;
  cursor: default;
}

.description-toggle:hover {
  color: #ff5252;
}

/* 目录列表 */
.section-count {
  font-size: 12px;
  color: #999;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chapter-list::-webkit-scrollbar {
  display: none;
}

.chapter-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  cursor: default;
}

.chapter-item:hover {
  background: #f5f5f5;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-num {
  font-size: 14px;
  color: #333;
  width: 70px;
  flex-shrink: 0;
}

.chapter-title {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.drawer-chapter-list {
  display: flex;
  flex-direction: column;
}

.drawer-chapter-list .chapter-item {
  padding: 14px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.drawer-chapter-list .chapter-item:hover {
  background: #f9f9f9;
}

/* 热门书评 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
}

.user-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.comment-content {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 8px;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.comment-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 书评抽屉 */
.drawer-comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-comment-list .comment-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 14px;
}

.drawer-comment-list .comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.drawer-comment-list .user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
}

.drawer-comment-list .user-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.drawer-comment-list .comment-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 10px;
}

.drawer-comment-list .comment-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.drawer-comment-list .comment-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
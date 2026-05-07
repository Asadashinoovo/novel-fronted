<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookDetail, getBookChapters, getBookComments, getSimilarBooks } from '@/api/modules/book'
import { ElMessage } from 'element-plus'
import { ElDrawer } from 'element-plus'
import type { Book } from '@/types'

const route = useRoute()
const router = useRouter()

const book = ref<Book | null>(null)
const chapters = ref<any[]>([])
const comments = ref<any[]>([])
const similarBooks = ref<any[]>([])
const loading = ref(false)
const showChapterDrawer = ref(false)
const showCommentDrawer = ref(false)

async function fetchBook() {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    return
  }

  loading.value = true
  try {
    const bookRes = await getBookDetail(id)
    book.value = bookRes.data.data
  } catch (e) {
    console.error('获取书籍详情失败:', e)
  }

  try {
    const chaptersRes = await getBookChapters(id)
    chapters.value = chaptersRes.data.data || []
  } catch (e) {
    console.error('获取目录失败:', e)
  }

  try {
    const commentsRes = await getBookComments(id)
    comments.value = commentsRes.data.data || []
  } catch (e) {
    console.error('获取评论失败:', e)
  }

  try {
    const similarRes = await getSimilarBooks(id)
    similarBooks.value = similarRes.data.data || []
  } catch (e) {
    console.error('获取相似书籍失败:', e)
  }

  loading.value = false
}

onMounted(() => {
  fetchBook()
})

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
  <div v-loading="loading" class="book-detail">
    <!-- 顶部返回按钮 -->
    <div class="back-bar">
      <span class="back-btn" @click="router.push('/')">‹ 返回</span>
    </div>
    <!-- 顶部信息栏 -->
    <div class="detail-header">
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
        <el-button class="action-btn">
          书评
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
        <div class="description">
          {{ book?.description || '暂无简介' }}
        </div>
      </div>

      <!-- 目录 -->
      <div class="content-card">
        <div class="section-header">
          <span class="section-title">目录</span>
          <span class="section-more" @click="showChapterDrawer = true">更多 ></span>
        </div>
        <div class="chapter-list" v-if="chapters.length">
          <div class="chapter-item" v-for="(chapter, index) in chapters.slice(0, 5)" :key="chapter.id" @click="goToRead(chapter.id, index)">
            <span class="chapter-num">第{{ index + 1 }}章</span>
            <span class="chapter-title">{{ chapter.title }}</span>
          </div>
          <div class="chapter-more" v-if="chapters.length > 5" @click="showChapterDrawer = true">
            <span>...</span>
            <span class="more-text">展开更多</span>
          </div>
        </div>
        <div v-else class="empty-tip">暂无目录</div>
      </div>

      <!-- 章节抽屉 -->
      <el-drawer v-model="showChapterDrawer" title="目录" direction="rtl" size="70%" :style="{ '--el-drawer-bg-color': '#e8f5e9' }">
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

    <!-- 底部加入书架 -->
    <div class="shelf-bar">
      <el-button type="primary" class="shelf-btn-fixed">加入书架</el-button>
    </div>
  </div>
</template>

<style scoped>
.book-detail {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  color: #000;
  padding-bottom: 40px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* 顶部返回按钮 */
.back-bar {
  position: sticky;
  top: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  font-size: 16px;
  color: #333;
  cursor: default;
}

/* 顶部信息栏 */
.detail-header {
  background: #444;
  padding: 60px 20px 30px;
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
  display: none;
}

.book-hot {
  font-size: 12px;
  color: #ff6b6b;
  margin: 0;
}

/* 底部加入书架 */
.shelf-bar {
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

.shelf-btn-fixed {
  width: 100%;
  max-width: 480px;
  height: 44px;
  border-radius: 22px;
  background: #ff4d4d;
  border: none;
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
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

/* 目录列表 */
.chapter-list {
  display: flex;
  flex-direction: column;
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

.chapter-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  cursor: default;
  color: #999;
  font-size: 12px;
}

.chapter-more:hover {
  color: #666;
}

.more-text {
  margin-left: 4px;
}

.drawer-chapter-list {
  display: flex;
  flex-direction: column;
}

.drawer-chapter-list .chapter-item {
  padding: 14px 0;
  border-bottom: 1px solid #ccc;
  cursor: default;
}

.drawer-chapter-list .chapter-item:hover {
  background: #e8f5e9;
}

.drawer-chapter-list .chapter-num {
  font-size: 14px;
}

.drawer-chapter-list .chapter-title {
  font-size: 14px;
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
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookDetailById, updateBook, getChapterList, addChapter, getChapterById, updateChapter, deleteChapter, getBookTypes } from '@/api/modules/book'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const bookInfo = ref<any>(null)
const chapterList = ref<any[]>([])
const showEditDialog = ref(false)
const editForm = ref({
  title: '',
  cover: '',
  description: '',
  types: [] as any[]
})
const editLoading = ref(false)
const showAddDialog = ref(false)
const addForm = ref({
  title: '',
  content: ''
})
const addLoading = ref(false)
const showEditChapterDialog = ref(false)
const editChapterForm = ref({
  id: 0,
  bookId: 0,
  title: '',
  content: ''
})
const editChapterLoading = ref(false)
const typeList = ref<any[]>([])
const showTypeDropdown = ref(false)

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  const id = Number(route.params.id)
  if (isNaN(id)) {
    ElMessage.error('无效的书籍ID')
    router.back()
    return
  }
  try {
    const res = await getBookDetailById(id)
    if (res.data.success) {
      bookInfo.value = res.data.data
      fetchChapterList(id)
    }
  } catch (e) {
    ElMessage.error('获取书籍详情失败')
  } finally {
    isLoading.value = false
  }
})

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.type-form-item')) {
    showTypeDropdown.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function fetchChapterList(bookId: number) {
  try {
    const res = await getChapterList(bookId)
    if (res.data.success) {
      chapterList.value = res.data.data || []
    }
  } catch (e) {
    // ignore
  }
}

function openEditDialog() {
  editForm.value = {
    title: bookInfo.value.title || '',
    cover: bookInfo.value.cover || '',
    description: bookInfo.value.description || '',
    types: bookInfo.value.types ? [...bookInfo.value.types] : []
  }
  showEditDialog.value = true
  showTypeDropdown.value = false
  if (typeList.value.length === 0) {
    fetchTypes()
  }
}

async function fetchTypes() {
  try {
    const res = await getBookTypes()
    if (res.data.success) {
      typeList.value = res.data.data || []
    }
  } catch (e) {
    // ignore
  }
}

function toggleEditType(type: any) {
  const index = editForm.value.types.findIndex((t: any) => t.typeName === type.typeName)
  if (index > -1) {
    editForm.value.types.splice(index, 1)
  } else {
    editForm.value.types.push(type)
  }
}

async function handleUpdate() {
  if (!editForm.value.title || !editForm.value.cover) {
    ElMessage.warning('请填写书名和封面URL')
    return
  }
  editLoading.value = true
  try {
    const res = await updateBook({
      id: bookInfo.value.id,
      ...editForm.value
    })
    if (res.data.success) {
      ElMessage.success('修改成功')
      showEditDialog.value = false
      bookInfo.value = { ...bookInfo.value, ...editForm.value }
    }
  } catch (e) {
    // ignore
  } finally {
    editLoading.value = false
  }
}

function openAddDialog() {
  addForm.value = { title: '', content: '' }
  showAddDialog.value = true
}

async function openEditChapterDialog(chapter: any) {
  editChapterLoading.value = true
  showEditChapterDialog.value = true
  try {
    const res = await getChapterById(bookInfo.value.id, chapter.id)
    if (res.data.success) {
      editChapterForm.value = {
        id: chapter.id,
        bookId: bookInfo.value.id,
        title: res.data.data.title || chapter.title,
        content: res.data.data.content || ''
      }
    }
  } catch (e) {
    ElMessage.error('获取章节内容失败')
  } finally {
    editChapterLoading.value = false
  }
}

async function handleAddChapter() {
  if (!addForm.value.title || !addForm.value.content) {
    ElMessage.warning('请填写章节标题和内容')
    return
  }
  addLoading.value = true
  try {
    const res = await addChapter({
      bookId: bookInfo.value.id,
      title: addForm.value.title,
      content: addForm.value.content
    })
    if (res.data.success) {
      ElMessage.success('添加章节成功')
      showAddDialog.value = false
      fetchChapterList(bookInfo.value.id)
    }
  } catch (e) {
    // ignore
  } finally {
    addLoading.value = false
  }
}

async function handleUpdateChapter() {
  if (!editChapterForm.value.title || !editChapterForm.value.content) {
    ElMessage.warning('请填写章节标题和内容')
    return
  }
  editChapterLoading.value = true
  try {
    const res = await updateChapter(editChapterForm.value)
    if (res.data.success) {
      ElMessage.success('修改章节成功')
      showEditChapterDialog.value = false
      fetchChapterList(bookInfo.value.id)
    }
  } catch (e) {
    // ignore
  } finally {
    editChapterLoading.value = false
  }
}

async function handleDeleteChapter(chapter: any) {
  try {
    await ElMessageBox.confirm('确定删除该章节吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteChapter(bookInfo.value.id, chapter.id)
    if (res.data.success) {
      ElMessage.success('删除成功')
      fetchChapterList(bookInfo.value.id)
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<template>
  <div class="detail-page">
    <div class="nav-bar">
  <span class="back-btn" @click="router.back()">‹</span>
  <span class="nav-title">书籍详情</span>
  <div style="flex:1"></div>
  <button v-if="bookInfo" class="edit-btn" @click="openEditDialog">编辑</button>
  <button v-if="bookInfo" class="add-btn" @click="openAddDialog">添加章节</button>
</div>
    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-else-if="bookInfo" class="content">
      <div class="book-header">
        <img :src="bookInfo.cover" :alt="bookInfo.title" class="book-cover" />
        <div class="book-info">
          <h2 class="book-title">{{ bookInfo.title }}</h2>
          <p class="book-author">作者ID：{{ bookInfo.authorId }}</p>
          <p class="book-hot">热度：{{ bookInfo.hotCount || 0 }}</p>
        </div>
      </div>
      <div class="book-desc">
        <h3>简介</h3>
        <p>{{ bookInfo.description || '暂无简介' }}</p>
      </div>
      <div class="book-chapters" v-if="bookInfo.types && bookInfo.types.length > 0">
        <h3>类型</h3>
        <div class="type-list">
          <span v-for="(type, index) in bookInfo.types" :key="index" class="type-item">
            {{ type.typeName }}
          </span>
        </div>
      </div>
      <div class="book-chapter-list">
        <h3>章节列表 ({{ chapterList.length }})</h3>
        <div v-if="chapterList.length > 0" class="chapter-list">
          <div v-for="chapter in chapterList" :key="chapter.id" class="chapter-item">
            <div class="chapter-left" @click="openEditChapterDialog(chapter)">
              <div class="chapter-info">
                <span class="chapter-num">第{{ chapter.chapterNum }}章</span>
                <span class="chapter-title">{{ chapter.title }}</span>
              </div>
              <div class="chapter-stats">
                <span>字数：{{ chapter.wordCount || 0 }}</span>
                <span>阅读：{{ chapter.readCount || 0 }}</span>
              </div>
            </div>
            <button class="delete-chapter-btn" @click.stop="handleDeleteChapter(chapter)">删除</button>
          </div>
        </div>
        <div v-else class="empty">暂无章节</div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEditDialog" class="dialog-overlay">
      <div class="dialog">
        <h3 class="dialog-title">编辑书籍</h3>
        <div class="form-item">
          <label>书名</label>
          <input v-model="editForm.title" type="text" placeholder="请输入书名" />
        </div>
        <div class="form-item">
          <label>封面URL</label>
          <input v-model="editForm.cover" type="text" placeholder="请输入封面图片地址" />
        </div>
        <div class="form-item">
          <label>简介</label>
          <textarea v-model="editForm.description" placeholder="请输入书籍简介" rows="3"></textarea>
        </div>
        <div class="form-item type-form-item">
          <label>类型</label>
          <div class="type-selected" @click="showTypeDropdown = !showTypeDropdown">
            <span v-if="editForm.types.length === 0" class="placeholder">请选择类型</span>
            <span v-else>{{ editForm.types.map((t: any) => t.typeName).join('、') }}</span>
            <span class="arrow">▼</span>
          </div>
          <div v-if="showTypeDropdown" class="type-dropdown">
            <div
              v-for="type in typeList"
              :key="type.id"
              class="type-option"
              :class="{ selected: editForm.types.some((t: any) => t.typeName === type.typeName) }"
              @click="toggleEditType(type)"
            >
              {{ type.typeName }}
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showEditDialog = false">取消</button>
          <button class="confirm-btn" @click="handleUpdate" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加章节弹窗 -->
    <div v-if="showAddDialog" class="dialog-overlay" style="display:flex">
      <div class="dialog" @click.stop>
        <h3 class="dialog-title">添加章节</h3>
        <div class="dialog-content">
          <div class="form-item">
            <label>章节标题</label>
            <input v-model="addForm.title" type="text" placeholder="请输入章节标题" />
          </div>
          <div class="form-item">
            <label>章节内容</label>
            <textarea v-model="addForm.content" placeholder="请输入章节内容" rows="20"></textarea>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showAddDialog = false">取消</button>
          <button class="confirm-btn" @click="handleAddChapter" :disabled="addLoading">
            {{ addLoading ? '添加中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑章节弹窗 -->
    <div v-if="showEditChapterDialog" class="dialog-overlay">
      <div class="dialog">
        <h3 class="dialog-title">编辑章节</h3>
        <div class="dialog-content">
          <div class="form-item">
            <label>章节标题</label>
            <input v-model="editChapterForm.title" type="text" placeholder="请输入章节标题" />
          </div>
          <div class="form-item">
            <label>章节内容</label>
            <textarea v-model="editChapterForm.content" placeholder="请输入章节内容" rows="20"></textarea>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showEditChapterDialog = false">取消</button>
          <button class="confirm-btn" @click="handleUpdateChapter" :disabled="editChapterLoading">
            {{ editChapterLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  max-width: 480px;
  margin: 0 auto;
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

.edit-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.add-btn {
  padding: 6px 16px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.book-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.book-cover {
  width: 100px;
  height: 133px;
  object-fit: cover;
  border-radius: 6px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.book-author,
.book-hot {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px;
}

.book-desc {
  margin-bottom: 20px;
}

.book-desc h3,
.book-chapters h3,
.book-chapter-list h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.book-desc p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.book-chapters {
  margin-bottom: 20px;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-item {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.book-chapter-list {
  margin-top: 20px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.chapter-left {
  flex: 1;
  cursor: pointer;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.chapter-num {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.chapter-title {
  font-size: 14px;
  color: #333;
}

.chapter-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  align-items: center;
}

.delete-chapter-btn {
  padding: 4px 12px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  resize: none;
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: #667eea;
}

.type-form-item {
  position: relative;
}

.type-selected {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.type-selected .placeholder {
  color: #999;
}

.type-selected .arrow {
  font-size: 10px;
  color: #999;
}

.type-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-option {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}

.type-option:hover {
  background: #f5f5f5;
}

.type-option.selected {
  color: #667eea;
  background: #f0f0ff;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.dialog-content .form-item:last-child {
  margin-bottom: 0;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  flex: 1;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.confirm-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
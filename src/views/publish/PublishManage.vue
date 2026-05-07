<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/modules/auth'
import { getMyPublishedBooks, addBook, deleteBooks, getBookTypes } from '@/api/modules/book'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isLoading = ref(true)
const userInfo = ref<any>(null)
const publishedBooks = ref<any[]>([])
const searchKeyword = ref('')
const showAddDialog = ref(false)
const addForm = ref({
  title: '',
  cover: '',
  description: '',
  types: [] as any[]
})
const addLoading = ref(false)
const selectedBooks = ref<number[]>([])
const deleteLoading = ref(false)
const isManageMode = ref(false)
const typeList = ref<any[]>([])
const showTypeDropdown = ref(false)

const filteredBooks = computed(() => {
  if (!searchKeyword.value) return publishedBooks.value
  const kw = searchKeyword.value.toLowerCase()
  return publishedBooks.value.filter(book =>
    book.title?.toLowerCase().includes(kw)
  )
})

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  try {
    const res = await getUserInfo()
    if (res.data.success) {
      userInfo.value = res.data.data
      fetchPublishedBooks()
    }
  } catch (e: any) {
    if (e?.response?.status === 401) {
      ElMessage.error('当前用户未登录')
      router.replace('/me')
    }
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

async function fetchPublishedBooks() {
  if (!userInfo.value) return
  try {
    const res = await getMyPublishedBooks(userInfo.value.id)
    if (res.data.success) {
      publishedBooks.value = res.data.data || []
    }
  } catch (e) {
    // ignore
  }
}

function openAddDialog() {
  addForm.value = { title: '', cover: '', description: '', types: [] }
  showAddDialog.value = true
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

function toggleType(type: any) {
  const index = addForm.value.types.findIndex((t: any) => t.typeName === type.typeName)
  if (index > -1) {
    addForm.value.types.splice(index, 1)
  } else {
    addForm.value.types.push(type)
  }
}

async function handleAdd() {
  if (!addForm.value.title || !addForm.value.cover) {
    ElMessage.warning('请填写书名和封面URL')
    return
  }
  addLoading.value = true
  try {
    const res = await addBook(addForm.value)
    if (res.data.success) {
      ElMessage.success('添加成功')
      showAddDialog.value = false
      fetchPublishedBooks()
    }
  } catch (e) {
    // ignore
  } finally {
    addLoading.value = false
  }
}

function toggleSelect(id: number) {
  const index = selectedBooks.value.indexOf(id)
  if (index > -1) {
    selectedBooks.value.splice(index, 1)
  } else {
    selectedBooks.value.push(id)
  }
}

function toggleSelectAll() {
  if (selectedBooks.value.length === filteredBooks.value.length) {
    selectedBooks.value = []
  } else {
    selectedBooks.value = filteredBooks.value.map(b => b.id)
  }
}

async function handleDelete() {
  if (selectedBooks.value.length === 0) {
    ElMessage.warning('请选择要删除的书籍')
    return
  }
  deleteLoading.value = true
  try {
    const res = await deleteBooks(selectedBooks.value)
    if (res.data.success) {
      ElMessage.success('删除成功')
      selectedBooks.value = []
      fetchPublishedBooks()
    }
  } catch (e) {
    // ignore
  } finally {
    deleteLoading.value = false
  }
}

function goToDetail(id: number) {
  if (isManageMode.value) return
  router.push(`/publish/book/${id}`)
}
</script>

<template>
  <div class="publish-page">
    <div class="nav-bar">
      <span class="back-btn" @click="router.push('/me')">‹</span>
      <span class="nav-title">我的发布</span>
      <div class="header-actions">
        <button v-if="!isManageMode" class="manage-btn" @click="isManageMode = true">管理</button>
        <template v-else>
          <button class="cancel-btn" @click="isManageMode = false; selectedBooks = []">取消</button>
          <button class="delete-btn" @click="handleDelete" :disabled="selectedBooks.length === 0 || deleteLoading">删除 ({{ selectedBooks.length }})</button>
        </template>
        <button class="add-btn" @click="openAddDialog">添加书籍</button>
      </div>
    </div>
    <div v-if="isLoading" class="loading">加载中...</div>
    <template v-else-if="userInfo">
      <div class="user-card">
        <div class="avatar" :style="userInfo.imgUrl ? { backgroundImage: `url(${userInfo.imgUrl})` } : {}"></div>
        <div class="user-info">
          <p class="username">{{ userInfo.username }}</p>
          <p class="user-id">ID: {{ userInfo.id }}</p>
        </div>
      </div>
      <div class="book-section">
        <div class="search-bar">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索书名..."
            class="search-input"
          />
        </div>
        <h3 class="section-title">
          已发布书籍 ({{ filteredBooks.length }})
          <label v-if="isManageMode" class="select-all" @click="toggleSelectAll">
            <input type="checkbox" :checked="selectedBooks.length === filteredBooks.length && filteredBooks.length > 0" />
            全选
          </label>
        </h3>
        <div v-if="filteredBooks.length > 0" class="book-grid">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="book-item"
            :class="{ selected: selectedBooks.includes(book.id) }"
            @click="isManageMode ? toggleSelect(book.id) : goToDetail(book.id)"
          >
            <div class="cover-wrapper">
              <img :src="book.cover" :alt="book.title" class="book-cover" />
              <div v-if="isManageMode" class="check-overlay">
                <span class="check-icon" v-if="selectedBooks.includes(book.id)">✓</span>
              </div>
            </div>
            <p class="book-title">{{ book.title }}</p>
          </div>
        </div>
        <div v-else class="empty">暂无发布的书籍</div>
      </div>
    </template>

    <!-- 添加书籍弹窗 -->
    <div v-if="showAddDialog" class="dialog-overlay">
      <div class="dialog">
        <h3 class="dialog-title">添加书籍</h3>
        <div class="form-item">
          <label>书名</label>
          <input v-model="addForm.title" type="text" placeholder="请输入书名" />
        </div>
        <div class="form-item">
          <label>封面URL</label>
          <input v-model="addForm.cover" type="text" placeholder="请输入封面图片地址" />
        </div>
        <div class="form-item">
          <label>简介</label>
          <textarea v-model="addForm.description" placeholder="请输入书籍简介" rows="3"></textarea>
        </div>
        <div class="form-item type-form-item">
          <label>类型</label>
          <div class="type-selected" @click="showTypeDropdown = !showTypeDropdown">
            <span v-if="addForm.types.length === 0" class="placeholder">请选择类型</span>
            <span v-else>{{ addForm.types.map((t: any) => t.typeName).join('、') }}</span>
            <span class="arrow">▼</span>
          </div>
          <div v-if="showTypeDropdown" class="type-dropdown">
            <div
              v-for="type in typeList"
              :key="type.id"
              class="type-option"
              :class="{ selected: addForm.types.some((t: any) => t.typeName === type.typeName) }"
              @click="toggleType(type)"
            >
              {{ type.typeName }}
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showAddDialog = false">取消</button>
          <button class="confirm-btn" @click="handleAdd" :disabled="addLoading">
            {{ addLoading ? '添加中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.manage-btn,
.cancel-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
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

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ddd;
  background-size: cover;
  background-position: center;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.book-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #667eea;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-all {
  font-size: 12px;
  font-weight: normal;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.select-all input {
  cursor: pointer;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.book-item {
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px;
  transition: background 0.2s;
}

.book-item:hover {
  background: #f5f5f5;
}

.book-item.selected {
  background: #e6f0ff;
}

.cover-wrapper {
  position: relative;
  display: inline-block;
}

.book-cover {
  width: 80px;
  height: 107px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
  margin: 0 auto 8px;
}

.check-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: #fff;
  font-size: 12px;
}

.book-title {
  font-size: 12px;
  color: #333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px;
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
  max-width: 400px;
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

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
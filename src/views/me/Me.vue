<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElDrawer, ElMessage } from 'element-plus'
import { login, getUserInfo, logout } from '@/api/modules/auth'

const router = useRouter()
const showDrawer = ref(false)
const username = ref('')
const password = ref('')
const userInfo = ref<any>(null)

function openDrawer() {
  showDrawer.value = true
}

function goToPublish() {
  router.push('/publish')
}

async function handleLogin() {
  if (!username.value || !password.value) {
    return
  }
  try {
    const res = await login({
      username: username.value,
      password: password.value
    })
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token)
      localStorage.setItem('loginSuccess', 'true')
      showDrawer.value = false
      username.value = ''
      password.value = ''
      window.location.reload()
    }
  } catch (e) {
    // 错误已在 axios interceptor 弹出
  }
}

async function fetchUserInfo() {
  try {
    const res = await getUserInfo()
    if (res.data.success) {
      userInfo.value = res.data.data
    }
  } catch (e: any) {
    // 401 未登录，不做处理
    if (e?.response?.status === 401) {
      return
    }
  }
}

async function handleLogout() {
  try {
    const res = await logout()
    if (res.data.success) {
      ElMessage.success(res.data.msg || '退出成功')
    }
  } catch (e) {
    // 错误已在 axios interceptor 弹出
  }
  localStorage.removeItem('token')
  userInfo.value = null
  showDrawer.value = false
}

onMounted(() => {
  if (localStorage.getItem('loginSuccess') === 'true') {
    localStorage.removeItem('loginSuccess')
    ElMessage.success('登录成功')
  }
  fetchUserInfo()
})
</script>

<template>
  <div class="me-page">
    <div class="nav-bar">
      <span class="nav-title">个人中心</span>
    </div>

    <div class="user-card" @click="openDrawer">
      <div class="avatar">
        <img v-if="userInfo?.imgUrl" :src="userInfo.imgUrl" class="avatar-img" />
      </div>
      <div class="user-info">
        <p class="username">{{ userInfo?.username || '未登录用户' }}</p>
        <p class="user-id">ID: {{ userInfo?.id || '---' }}</p>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item">
        <span>我的书架</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item">
        <span>阅读记录</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="goToPublish">
        <span>我的发布</span>
        <span class="arrow">›</span>
      </div>
    </div>

    <!-- 抽屉 -->
    <el-drawer v-model="showDrawer" direction="rtl" size="80%">
      <template #title>
        <span>{{ userInfo ? '账户详情' : '登录' }}</span>
      </template>
      <div v-if="!userInfo" class="login-form">
        <div class="form-item">
          <input v-model="username" placeholder="请输入账号" class="form-input" />
        </div>
        <div class="form-item">
          <input v-model="password" type="password" placeholder="请输入密码" class="form-input" />
        </div>
        <button class="submit-btn" @click="handleLogin">登 录</button>
      </div>
      <div v-else class="user-detail">
        <div class="detail-avatar">
        <img v-if="userInfo?.imgUrl" :src="userInfo.imgUrl" class="avatar-img" />
      </div>
        <p class="detail-name">{{ userInfo.username }}</p>
        <p class="detail-id">ID: {{ userInfo.id }}</p>
        <button class="logout-btn-detail" @click="handleLogout">退出登录</button>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.me-page {
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

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  cursor: pointer;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ddd;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.menu-list {
  background: #fff;
  border-radius: 12px;
}

.menu-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item span:first-child {
  font-size: 14px;
  color: #333;
}

.arrow {
  color: #ccc;
  font-size: 14px;
}

.login-form {
  padding: 40px 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ddd;
  margin-bottom: 16px;
  overflow: hidden;
}

.detail-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.detail-id {
  font-size: 14px;
  color: #999;
  margin: 0 0 30px;
}

.logout-btn-detail {
  width: 100%;
  padding: 14px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 16px;
  cursor: pointer;
}
</style>
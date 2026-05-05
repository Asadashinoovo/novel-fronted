import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const instance: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 32000,
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { success, errorMsg } = response.data
    if (!success) {
      ElMessage.error(errorMsg || '请求失败')
      return Promise.reject(new Error(errorMsg))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 401 不弹提示，由调用方自行处理
      return Promise.reject(error)
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default instance
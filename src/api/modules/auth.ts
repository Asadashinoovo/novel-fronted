import axios from '@/utils/axios'
import type { ApiResponse } from '@/types'

interface LoginRequest {
  username: string
  password: string
}

interface UserInfo {
  id: number
  username: string
  img_url?: string
}

export function login(data: LoginRequest): Promise<ApiResponse<{ token: string }>> {
  return axios.post('/api/auth/login', data)
}

export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return axios.get('/api/user/me')
}

export function logout(): Promise<ApiResponse<any>> {
  return axios.post('/api/auth/logout')
}
import axios from '@/utils/axios'
import type { ApiResponse, ChatResponse, SummaryData, CharacterSearchResult, CharacterTimeline } from '@/types'

// 获取最新章节的前情提要
export function getLatestSummary(bookId: number): Promise<ApiResponse<SummaryData>> {
  return axios.get(`/api/ai/summary/${bookId}`)
}

// 获取指定章节之前的前情提要
export function getSummaryUpToChapter(bookId: number, chapterId: number): Promise<ApiResponse<SummaryData>> {
  return axios.get(`/api/ai/summary/${bookId}/${chapterId}`)
}

// AI 对话助手 (RAG)
export function aiChat(data: {
  bookId: number
  question: string
  maxChapterId?: number
}): Promise<ApiResponse<ChatResponse>> {
  return axios.post('/api/ai/chat', data)
}

// 搜索角色
export function searchCharacter(data: {
  bookId: number
  characterName: string
  maxChapterId?: number
}): Promise<ApiResponse<CharacterSearchResult[]>> {
  return axios.post('/api/ai/character/search', data)
}

// 获取角色时间线
export function getCharacterTimeline(
  characterId: number,
  maxChapterId?: number
): Promise<ApiResponse<CharacterTimeline>> {
  return axios.get('/api/ai/character/' + characterId + '/timeline', {
    params: maxChapterId ? { maxChapterId } : {}
  })
}

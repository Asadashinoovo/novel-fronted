export interface Book {
  id: number
  title: string
  author: string
  authorName: string
  authorId: number
  cover: string
  description: string
  hotCount: number
  types?: string[]
}

export interface ApiResponse<T> {
  success: boolean
  errorMsg: string | null
  data: T | null
  total: number | null
}

// AI 相关类型

export interface SummaryData {
  chapterId: number
  summary: string
}

export interface SourceInfo {
  chapterId: number
  title: string
  snippet: string
}

export interface ChatResponse {
  answer: string
  sources: SourceInfo[]
}

export interface CharacterEvent {
  chapterId: number
  chapterTitle: string
  eventDescription: string
}

export interface CharacterSearchResult {
  characterId: number
  characterName: string
  firstChapterId: number
  events: CharacterEvent[]
}

export interface CharacterTimeline {
  characterId: number
  characterName: string
  events: CharacterEvent[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: SourceInfo[]
}
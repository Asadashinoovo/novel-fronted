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
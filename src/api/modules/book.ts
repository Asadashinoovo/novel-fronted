import axios from '@/utils/axios'
import type { Book, ApiResponse } from '@/types'

export function getBookList(params: {
  page?: number
  pageSize?: number
  keyword?: string
} = {}): Promise<ApiResponse<Book[]>> {
  return axios.get('/api/home/book', { params })
}

export function getBookDetail(id: number): Promise<ApiResponse<Book>> {
  return axios.get(`/api/home/book/${id}`)
}

export function getBookChapters(bookId: number): Promise<ApiResponse<any[]>> {
  return axios.get(`/api/home/book/${bookId}/chapters`)
}

export function getBookComments(bookId: number): Promise<ApiResponse<any[]>> {
  return axios.get(`/api/home/book/${bookId}/comments`)
}

export function getSimilarBooks(bookId: number): Promise<ApiResponse<any[]>> {
  return axios.get(`/api/home/book/${bookId}/similar`)
}

export function getMyPublishedBooks(userId: number): Promise<ApiResponse<any[]>> {
  return axios.get(`/api/bookinfo/getmybook/${userId}`)
}

export function addBook(data: { title: string; cover: string; description: string; types: any[] }): Promise<ApiResponse<any>> {
  return axios.post('/api/bookinfo/add', data)
}

export function deleteBooks(ids: number[]): Promise<ApiResponse<any>> {
  return axios.post('/api/bookinfo/delete', ids)
}

export function getBookDetailById(id: number): Promise<ApiResponse<any>> {
  return axios.get(`/api/bookinfo/getbookbyid/${id}`)
}

export function updateBook(data: { id: number; title: string; cover: string; description: string; types: any[] }): Promise<ApiResponse<any>> {
  return axios.post('/api/bookinfo/update', data)
}

export function getChapterList(bookId: number): Promise<ApiResponse<any[]>> {
  return axios.get(`/api/home/book/${bookId}/chapters`)
}

export function getBookTypes(): Promise<ApiResponse<any[]>> {
  return axios.get('/api/bookinfo/types')
}

export function getChapterContent(bookId: number, chapterId: number): Promise<ApiResponse<any>> {
  return axios.get(`/api/chapter/get/${bookId}/${chapterId}`)
}

export function getChapterById(bookId: number, chapterId: number): Promise<ApiResponse<any>> {
  return axios.get(`/api/chapter/get/${bookId}/${chapterId}`)
}

export function updateChapter(data: { id: number; bookId: number; title: string; content: string }): Promise<ApiResponse<any>> {
  return axios.post('/api/chapter/update', data)
}

export function deleteChapter(bookId: number, chapterId: number): Promise<ApiResponse<any>> {
  return axios.post(`/api/chapter/delete/${bookId}/${chapterId}`)
}

export function addChapter(data: { bookId: number; title: string; content: string }): Promise<ApiResponse<any>> {
  return axios.post('/api/chapter/add', data)
}
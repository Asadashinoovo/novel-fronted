let cachedBookId: number | null = null
let cachedBookDetail: any = null
let cachedChapters: any[] = []

export function setBookCache(bookId: number, detail: any, chapters: any[]) {
  cachedBookId = bookId
  cachedBookDetail = detail
  cachedChapters = chapters
}

export function getBookCache(bookId: number) {
  if (cachedBookId === bookId) {
    return { detail: cachedBookDetail, chapters: cachedChapters }
  }
  return null
}

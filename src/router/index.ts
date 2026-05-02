import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/App.vue'
import BookDetail from '../views/book/BookDetail.vue'
import ReadPage from '../views/read/ReadPage.vue'
import Me from '../views/me/Me.vue'
import Comic from '../views/comic/Comic.vue'
import PublishManage from '../views/publish/PublishManage.vue'
import PublishBookDetail from '../views/publish/BookDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/book/:id',
      component: BookDetail
    },
    {
      path: '/read/:bookId/:id',
      component: ReadPage
    },
    {
      path: '/me',
      component: Me
    },
    {
      path: '/comic',
      component: Comic
    },
    {
      path: '/publish',
      component: PublishManage
    },
    {
      path: '/publish/book/:id',
      component: PublishBookDetail
    }
  ]
})

export default router
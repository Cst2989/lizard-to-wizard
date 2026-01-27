import { createMemoryHistory, createRouter } from 'vue-router'

import AccessCode  from './features/access-codes/AccessCode.vue'
import ReviewListComponent  from './features/reviews/ReviewListComponent.vue'
import ThreadListComponent  from './features/threads/ThreadListComponent.vue'

const routes = [
  {path: '/', component: AccessCode},
  { path: '/reviews', component: ReviewListComponent },
  { path: '/codes', component: AccessCode },
  { path: '/threads', component: ThreadListComponent },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router

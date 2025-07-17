import Login from '@/views/Auth/Login.vue';
import DashBoard from '@/views/DashBoard/DashBoard.vue';
import Student from '@/views/Manage/Student.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import Notice from '@/views/Support/Notice.vue';
import Qna from '@/views/Support/Qna.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Login,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/vue',
      component: DashBoard,
      children: [
        {
          path: 'support',
          name: 'support',
          children: [
            {
              path: 'notice',
              name: 'notice',
              component: Notice,
            },
            {
              path: 'qna',
              name: 'Qna',
              component: Qna,
            },
          ],
        },
        {
          path: 'manage',
          name: 'manage',
          children: [
            {
              path: 'student',
              name: 'student',
              component: Student,
            },
          ],
        },
      ],
    },
  ],
});

export default router;

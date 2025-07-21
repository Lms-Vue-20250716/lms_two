import Login from '@/views/Auth/Login.vue';
import DashBoard from '@/views/DashBoard/DashBoard.vue';
import Student from '@/views/Manage/Student.vue';
import LectureList from '@/views/Lecture/LectureList.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import Notice from '@/views/Support/Notice.vue';
import Statistics from '@/views/User/Statistics.vue';
import Qna from '@/views/Support/Qna.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Classroom from '@/views/System/Classroom.vue';
import Equipment from '@/views/System/Equipment.vue';

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
          path: 'user',
          name: 'user',
          children: [
            {
              path: 'statistics',
              name: 'statistics',
              component: Statistics,
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
        {
          path: 'lecture',
          name: 'lecture',
          children: [
            {
              path: 'list',
              name: 'list',
              component: LectureList,
            },
          ],
        },
        {
          path: 'system',
          name: 'system',
          children: [
            {
              path: 'classroom',
              name: 'classroom',
              component: Classroom,
            },
            {
              path: 'equipment',
              name: 'equipment',
              component: Equipment,
            },
          ],
        },
      ],
    },
  ],
});

export default router;

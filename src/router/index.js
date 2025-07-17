import Login from '@/views/Auth/Login.vue';
import DashBoard from '@/views/DashBoard/DashBoard.vue';
import Student from '@/views/Manage/Student.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import LearningMaterials from '@/views/Support/LearningMaterials.vue';
import LectureSurvey from '@/views/Support/LectureSurvey.vue';
import ManageSurvey from '@/views/Support/ManageSurvey.vue';
import Notice from '@/views/Support/Notice.vue';
import Qna from '@/views/Support/Qna.vue';
import { createRouter, createWebHistory } from 'vue-router'; // ✅ 수정됨

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
              name: 'qna',
              component: Qna,
            },
            {
              path: 'learning-materials',
              name: 'learningMaterials',
              component: LearningMaterials,
            },
            {
              path: 'lecture-survey',
              name: 'lectureSurvey',
              component: LectureSurvey,
            },
            {
              path: 'manage-survey',
              name: 'manageSurvey',
              component: ManageSurvey,
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

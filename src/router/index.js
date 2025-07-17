import Login from '@/views/Auth/Login.vue';
import DashBoard from '@/views/DashBoard/DashBoard.vue';
import Student from '@/views/Manage/Student.vue';
import NotFound from '@/views/NotFound/NotFound.vue';
import LearningMaterials from '@/views/Support/LearningMaterials.vue';
import LectureSurvey from '@/views/Support/LectureSurvey.vue';
import ManageSurvey from '@/views/Support/ManageSurvey.vue';
import Notice from '@/views/Support/Notice.vue';
import Statistics from '@/views/User/Statistics.vue';
import Qna from '@/views/Support/Qna.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Classroom from '@/views/System/Classroom.vue';
import LectureList from '@/views/Lecture/LectureList.vue';

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
          children: [
            {
              path: 'classroom',
              name: 'classroom',
              component: Classroom,
            },
          ],
        },
      ],
    },
  ],
});

export default router;

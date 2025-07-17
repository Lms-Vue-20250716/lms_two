<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import StudentModal from '../StudentModal/StudentModal.vue';

const route = useRoute();
const studentList = ref([]);
const studentCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const studentSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/manage/studentListBody.do', param).then((res) => {
    console.log('응답:', res.data);
    studentList.value = res.data.list;
    studentCount.value = res.data.count;
  });
};

onMounted(() => {
  studentSearch();
});

const studentDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => route.query,
  () => {
    studentSearch();
  },
);
</script>

<template>
  <div class="student-main-container">
    <table class="student-table">
      <thead class="student-table-header">
        <tr>
          <th>학번</th>
          <th>이름</th>
          <th>연락처</th>
          <th>가입일자</th>
          <th>취업여부</th>
          <th>재학상태</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="studentCount > 0">
          <tr v-for="student in studentList" :key="student.studentId" class="student-table-row">
            <td class="student-cell">{{ student.studentNumber }}</td>
            <td class="student-cell cursor-pointer hover:underline" @click="studentDetail(student.studentName)">
              {{ student.studentName }}
            </td>
            <td class="student-cell">{{ student.studentHp }}</td>
            <td class="student-cell">{{ student.studentRegDate.substr(0, 10) }}</td>
            <td class="student-cell">{{ student.statusYN }}</td>
            <td class="student-cell">{{ student.studentEmpStatus }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="6" class="student-empty-row">일치하는 학생이 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="studentCount" :items-per-page="5" :on-page-change="studentSearch" />
  </div>
  <StudentModal v-if="modalState.isOpen" :detail-id="detailId" @post-success="studentSearch()"
    @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

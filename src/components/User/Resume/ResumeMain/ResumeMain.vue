<script setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import ResumeModal from '../ResumeModal/ResumeModal.vue';

const route = useRoute();
const resumeList = ref([]);
const resumeCount = ref(0);
const modalState = useModalState();
const lectureId = ref(0);

const resumeSearch = (cPage = 1) => {
  const params = {
    currentPage: cPage,
    pageSize: 5,
    ...route.query,
  };

  const urlParams = new URLSearchParams(params);

  axios.post('/api/user/resumeLectureListBody.do', urlParams).then((res) => {
    resumeList.value = res.data.resumeLectureList;
    resumeCount.value = res.data.resumeLectureCnt;
  });
};

const resumesDetail = (lecId) => {
  modalState.$patch({ isOpen: true, type: 'resume' });
  lectureId.value = lecId;
};

watch(
  () => route.query,
  () => {
    resumeSearch();
  },
);

onMounted(() => {
  resumeSearch();
});
</script>
<template>
  <div></div>
  <div class="resume-main-container">
    <table class="resume-table">
      <thead class="resume-table-header">
        <tr>
          <th>강의 번호</th>
          <th>강의 이름</th>
          <th>회차</th>
          <th>담당 강사</th>
          <th>정원</th>
          <th>개강일</th>
          <th>종강일</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="resumeCount > 0">
          <tr v-for="resume in resumeList" :key="resume.lecId" class="resume-table-row">
            <td class="resume-cell">{{ resume.lecId }}</td>
            <td
              class="resume-cell cursor-pointer hover:underline"
              @click="resumesDetail(resume.lecId)"
            >
              {{ resume.lecName }}
            </td>
            <td class="resume-cell">{{ resume.lectureRound }}</td>
            <td class="resume-cell">{{ resume.tutorName }}</td>
            <td class="resume-cell">{{ resume.lecPersonnel }}</td>
            <td class="resume-cell">{{ resume.lecStartDate?.substring(0, 10) }}</td>
            <td class="resume-cell">{{ resume.lecEndDate?.substring(0, 10) }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="resume-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="resumeCount" :items-per-page="5" :on-page-change="resumeSearch" />
  </div>
  <ResumeModal v-if="modalState.type === 'resume' && modalState.isOpen" :lec-id="lectureId" />
</template>

<style>
@import './styled.css';
</style>

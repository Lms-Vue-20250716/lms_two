<script setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import LecturePlanModal from '../LectureModal_/LecturePlanModal.vue';
import LectureRegister from '../LectureModal_/LectureRegister.vue';
import PageNavigation2 from '@/components/common/PageNavigation2.vue';

const route = useRoute();
const lectureList = ref([]);
const lectureCount = ref(0);
const modalState = useModalState();
const currentPage = ref(1);

const selectedLecture = ref(null);

const lectureSearch = (pageToGo = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', pageToGo);
  param.append('pageSize', 5);

  // console.log(param);

  axios.post('/api/lecture/lectureManageListBody.do', param).then((res) => {
    lectureList.value = res.data.lectureManageList || [];
    lectureCount.value = res.data.lectureManageCnt || 0;

    // console.log(res.data);
  });
};
const paginationStateChanged = (page) => {
  currentPage.value = page;
  lectureSearch(page);
};

const selectForEdit = (lecture) => {
  selectedLecture.value = lecture;
  modalState.$patch({ isOpen: true, type: 'lecture-manage-register' });
};

const openLecturePlan = (lecture) => {
  selectedLecture.value = lecture;
  modalState.$patch({ isOpen: true, type: 'lecture-manage-plan' });
};

const closeLectureRegisterModal = () => {
  selectedLecture.value = null;
  lectureSearch(1);
};

const ModalSubmitSuccess = () => {
  currentPage.value = 1;
  lectureSearch(1);
};

watch(
  () => route.query,
  () => {
    lectureSearch(1);
  },
);

onMounted(() => {
  lectureSearch(1);
});
</script>

<template>
  <div class="lecture-main-container">
    <table class="lecture-table">
      <thead class="lecture-table-header">
        <tr>
          <th>강의명</th>
          <th>강사</th>
          <th>강의 시작일</th>
          <th>강의 종료일</th>
          <th>정원</th>
          <th>강의실</th>
          <th>강의계획서</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="lectureCount > 0">
          <tr v-for="lecture in lectureList" :key="lecture.lecId" class="lecture-table-row">
            <td class="lecture-cell cursor-pointer hover:underline" @click="selectForEdit(lecture)">
              {{ lecture.lecName }}
            </td>
            <td class="lecture-cell">{{ lecture.lecInstructorName }}</td>
            <td class="lecture-cell">
              {{ lecture.lecStartDate.substr(0, 10) }}
            </td>
            <td class="lecture-cell">
              {{ lecture.lecEndDate.substr(0, 10) }}
            </td>
            <td class="lecture-cell">{{ lecture.lecPersonnel }}</td>
            <td class="lecture-cell">{{ lecture.lecRoomName }}</td>
            <td
              class="lecture-cell cursor-pointer hover:underline"
              @click="openLecturePlan(lecture)"
            >
              강의계획서 보기
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="7" class="lecture-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation2
      :total-items="lectureCount"
      :items-per-page="5"
      :on-page-change="paginationStateChanged"
      :current-page="currentPage"
    />
  </div>
  <LectureRegister
    v-if="modalState.isOpen && modalState.type === 'lecture-manage-register'"
    :lecture-data="selectedLecture"
    @lecture-manage-register-close="closeLectureRegisterModal()"
    @lecture-manage-register-submit-success="ModalSubmitSuccess()"
  />
  <LecturePlanModal
    v-if="modalState.isOpen && modalState.type === 'lecture-manage-plan'"
    :lecture-data="selectedLecture"
    @lecture-manage-register-submit-success="ModalSubmitSuccess()"
  />
</template>

<style>
@import './styled.css';
</style>

<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import LectureDetailModal from '../LectureModal_/LectureDetailModal.vue';

const route = useRoute();
const lectureList = ref([]);
const lectureCount = ref(0);
const modalState = useModalState();
const selectedLecture = ref(null);

const lectureSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  console.log(param);

  axios.post('/api/lecture/lectureListBody.do', param).then((res) => {
    lectureList.value = res.data.list;
    lectureCount.value = res.data.count;

    console.log(res.data);
  });
};

const lectureDetail = (lecture) => {
  selectedLecture.value = lecture; // 객체 전체를 ref에 저장합니다.
  modalState.$patch({ isOpen: true, type: 'lecture-list-detail' });
};

watch(
  () => route.query,
  () => {
    lectureSearch();
  },
);

onMounted(() => {
  lectureSearch();
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
          <th>신청인원</th>
          <th>강의실</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="lectureCount > 0">
          <tr v-for="lecture in lectureList" :key="lecture.lecId" class="lecture-table-row">
            <td class="lecture-cell cursor-pointer hover:underline" @click="lectureDetail(lecture)">
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
            <td class="lecture-cell">{{ lecture.courseCntPersonnel }}</td>
            <td class="lecture-cell">{{ lecture.lecRoomName }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="7" class="lecture-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="lectureCount"
      :items-per-page="5"
      :on-page-change="lectureSearch"
    />
  </div>
  <LectureDetailModal
    v-if="modalState.isOpen && modalState.type === 'lecture-list-detail'"
    :lecture-data="selectedLecture"
    @post-success="lectureSearch()"
  />
</template>

<style>
@import './styled.css';
</style>

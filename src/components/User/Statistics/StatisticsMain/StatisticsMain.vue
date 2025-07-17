<script setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import StatisticsDetailModal from '../StatisticsDetailModal/StatisticsDetailModal.vue';

const route = useRoute();
const statisticsList = ref([]);
const statisticsCount = ref(0);
const modalState = useModalState();
const lectureId = ref(0);

const statisticsSearch = (cPage = 1) => {
  const params = {
    currentPage: cPage,
    pageSize: 5,
    ...route.query,
  };

  const urlParams = new URLSearchParams(params);

  axios.post('/api/user/resumeLectureListBody.do', urlParams).then((res) => {
    statisticsList.value = res.data.resumeLectureList;
    statisticsCount.value = res.data.resumeLectureCnt;
  });
};

const statisticsDetail = (lecId) => {
  modalState.$patch({ isOpen: true, type: 'detail' });
  lectureId.value = lecId;
};

watch(
  () => route.query,
  () => {
    statisticsSearch();
  },
);

onMounted(() => {
  statisticsSearch();
});
</script>
<template>
  <div></div>
  <div class="statistics-main-container">
    <table class="statistics-table">
      <thead class="statistics-table-header">
        <tr>
          <th>강의 번호</th>
          <th>강의 이름</th>
          <th>회차</th>
          <th>개강일</th>
          <th>종강일</th>
          <th>정원</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="statisticsCount > 0">
          <tr
            v-for="statistics in statisticsList"
            :key="statistics.lecId"
            class="statistics-table-row"
          >
            <td class="statistics-cell">{{ statistics.lecId }}</td>
            <td
              class="statistics-cell cursor-pointer hover:underline"
              @click="statisticsDetail(statistics.lecId)"
            >
              {{ statistics.lecName }}
            </td>
            <td class="statistics-cell">{{ statistics.lectureRound }}</td>
            <td class="statistics-cell">{{ statistics.lecStartDate?.substring(0, 10) }}</td>
            <td class="statistics-cell">{{ statistics.lecEndDate?.substring(0, 10) }}</td>
            <td class="statistics-cell">{{ statistics.lecPersonnel }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="statistics-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="statisticsCount"
      :items-per-page="5"
      :on-page-change="statisticsSearch"
    />
  </div>
  <StatisticsDetailModal
    v-if="modalState.type === 'detail' && modalState.isOpen"
    :lecture-id="lectureId"
    @un-mounted-modal="lectureId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

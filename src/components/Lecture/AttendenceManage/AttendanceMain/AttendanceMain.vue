<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';

const route = useRoute();
const attendanceList = ref([]);
const attendanceCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const attendanceSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  await axios.post('/api/lecture/AttendanceLectureListBody.do', param).then((res) => {
    attendanceList.value = res.data.list || [];
    attendanceCount.value = res.data.count || 0;

    console.log(res.data);
    console.log(attendanceList.value);
    console.log(attendanceCount.value);
  });
};

const attendanceDetail = (id) => {
  modalState.$patch({ isOpen: true, type: 'attendance' });
  detailId.value = id;
};

/**
 * 타임스탬프를 'YYYY-MM-DD' 형식의 문자열로 변환하는 함수입니다.
 * @param {number} timestamp - 변환할 타임스탬프 숫자
 * @returns {string} 포맷팅된 날짜 문자열
 */
const formatDate = (timestamp) => {
  // 타임스탬프 값이 유효하지 않으면 빈 문자열을 반환합니다.
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const year = date.getFullYear();
  // getMonth()는 0부터 시작하므로 1을 더하고, 10보다 작으면 앞에 '0'을 붙여줍니다.
  const month = String(date.getMonth() + 1).padStart(2, '0');
  // getDate()가 10보다 작으면 앞에 '0'을 붙여줍니다.
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

watch(
  () => route.query,
  () => {
    attendanceSearch();
  },
);

onMounted(() => {
  attendanceSearch();
});
</script>

<template>
  <div class="attendance-main-container">
    <table class="attendance-table">
      <thead class="attendance-table-header">
        <tr>
          <th>번호</th>
          <th>강의이름</th>
          <th>개강일자</th>
          <th>종강일자</th>
          <th>강의실</th>
          <th>-</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="attendanceCount > 0">
          <tr
            v-for="attendance in attendanceList"
            :key="attendance.lecId"
            class="attendance-table-row"
          >
            <td class="attendance-cell">{{ attendance.lecId }}</td>
            <td
              class="attendance-cell cursor-pointer hover:underline"
              @click="attendanceDetail(attendance.lecId)"
            >
              {{ attendance.lecName }}
            </td>
            <td class="attendance-cell">{{ formatDate(attendance.lecStartDate) }}</td>
            <td class="attendance-cell">{{ formatDate(attendance.lecEndDate) }}</td>
            <td class="attendance-cell">{{ attendance.roomName }}</td>
            <td>-</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="attendance-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="attendanceCount"
      :items-per-page="5"
      :on-page-change="attendanceSearch"
    />
  </div>
</template>

<style scoped>
@import './styled.css';
</style>

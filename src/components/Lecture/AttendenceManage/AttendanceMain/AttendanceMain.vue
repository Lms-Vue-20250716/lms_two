<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const attendanceList = ref([]);
const attendanceCount = ref(0);
// const attendState = ref('');

/**
 * [추가] 출석 상태 코드를 한글 텍스트로 변환하는 객체입니다.
 * 템플릿에서 v-if를 여러 번 쓰는 대신, 이 객체를 사용하여 코드를 간결하게 만듭니다.
 */
const attendanceStatusText = {
  E: '출석',
  L: '지각',
  F: '결석',
  J: '조퇴',
};

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

/**
 * '출석' 버튼을 눌렀을 때 실행되는 함수입니다.
 */
const handleAttendanceCheck = async (lecId) => {
  if (window.confirm('출석 처리 하시겠습니까?')) {
    try {
      const params = new URLSearchParams({ lecId });
      await axios.post('/api/lecture/attendanceEnter.do', params);
      alert('출석 처리되었습니다.');
      attendanceSearch(); // 목록 새로고침
    } catch (error) {
      console.error('출석 처리 중 오류 발생:', error);
      alert('오류가 발생했습니다.');
    }
  }
};

/**
 * '퇴실' 버튼을 눌렀을 때 실행되는 함수입니다.
 */
const handleAttendanceOut = async (lecId) => {
  if (window.confirm('퇴실 처리 하시겠습니까?')) {
    try {
      const params = new URLSearchParams({ lecId });
      await axios.post('/api/lecture/attendanceOut.do', params);
      alert('퇴실 처리되었습니다.');
      attendanceSearch(); // 목록 새로고침
    } catch (error) {
      console.error('퇴실 처리 중 오류 발생:', error);
      alert('오류가 발생했습니다.');
    }
  }
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
            <td class="attendance-cell cursor-pointer hover:underline">
              {{ attendance.lecName }}
            </td>
            <td class="attendance-cell">{{ formatDate(attendance.lecStartDate) }}</td>
            <td class="attendance-cell">{{ formatDate(attendance.lecEndDate) }}</td>
            <td class="attendance-cell">{{ attendance.roomName }}</td>
            <td class="attendance-action-cell">
              <!-- 1. 아직 출석하지 않은 상태 (attendState가 없는 경우) -->
              <button
                v-if="!attendance.attendState"
                class="attendance-button attend"
                @click="handleAttendanceCheck(attendance.lecId)"
              >
                출석
              </button>

              <!-- 2. 출석은 했지만, 아직 퇴실하지 않은 상태 -->
              <button
                v-else-if="attendance.attendState && !attendance.attendEnddate"
                class="attendance-button leave"
                @click="handleAttendanceOut(attendance.lecId)"
              >
                퇴실
              </button>

              <!-- 3. 출석과 퇴실이 모두 완료된 상태 -->
              <span v-else>
                {{ attendanceStatusText[attendance.attendState] || '완료' }}
              </span>
            </td>
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

<script setup>
import { formatTimestampToDate } from '@/common/common_time';
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const attendanceList = ref([]);
const attendanceCount = ref(0);
// const attendState = ref('');

/**
 * 출석/퇴실 처리 비즈니스 로직 (서버 기준)
 *
 * [출석 처리: /attendanceEnter.do]
 * - 요청 시점 기준, 서버에서 아래와 같이 상태 결정
 * - 09:10 이전: 'E' (출석)
 * - 13:00 이전: 'L' (지각)
 * - 13:00 이후: 'F' (결석)
 *
 * [퇴실 처리: /attendanceOut.do]
 * - 이전 출석 상태에 따라 최종 상태 결정
 * - 이전 상태 'E' (출석)
 * - 13:00 이전 퇴실 -> 'F' (결석)
 * - 18:00 이전 퇴실 -> 'J' (조퇴)
 * - 18:00 이후 퇴실 -> 'E' (정상 완료)
 * - 이전 상태 'L' (지각)
 * - 13:00 이전 퇴실 -> 'F' (결석)
 * - 13:00 이후 퇴실 -> 'L' (지각으로 완료)
 * - 이전 상태 'F', 'J' -> 'F' (결석)
 */
const attendanceStatusText = {
  E: '출석', //early
  L: '지각', //late
  F: '결석', //fail
  J: '조퇴', //joe-tae instead of 'leave early'
};

const attendanceStatusClass = {
  E: 'status-e', // 출석 (완료 시)
  L: 'status-l', // 지각
  F: 'status-f', // 결석
  J: 'status-j', // 조퇴
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
 * '출석' 버튼을 눌렀을 때 실행되는 함수입니다.
 */
const handleAttendanceCheck = async (lecId) => {
  if (window.confirm('출석 처리 하시겠습니까?')) {
    try {
      const params = new URLSearchParams({ lecId });
      await axios.post('/api/lecture/attendanceEnter.do', params).then((res) => {
        console.log('#############################');
        console.log(res);
        if (res.data.result === 'success') {
          alert('출석 처리되었습니다.');
          attendanceSearch(); // 목록 새로고침
        } else {
          alert('날짜를 확인해주세요.');
        }
      });
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
            <td class="attendance-cell">
              {{ attendance.lecName }}
            </td>
            <td class="attendance-cell">{{ formatTimestampToDate(attendance.lecStartDate) }}</td>
            <td class="attendance-cell">{{ formatTimestampToDate(attendance.lecEndDate) }}</td>
            <td class="attendance-cell">{{ attendance.roomName }}</td>
            <td class="attendance-action-cell">
              <button
                v-if="
                  (attendance.attendState === 'E' || attendance.attendState === 'L') &&
                  !attendance.attendEnddate
                "
                class="attendance-button leave-attendance"
                @click="handleAttendanceOut(attendance.lecId)"
              >
                퇴실
              </button>

              <button
                v-else-if="!attendance.attendState"
                class="attendance-button attend"
                @click="handleAttendanceCheck(attendance.lecId)"
              >
                출석
              </button>

              <button
                v-else
                :class="['attendance-button', attendanceStatusClass[attendance.attendState]]"
              >
                {{ attendanceStatusText[attendance.attendState] }}
              </button>
              <!-- <button
                v-if="attendance.attendState && attendance.attendEnddate"
                class="attendance-button leave"
              >
                {{ attendanceStatusText[attendance.attendState] || '완료' }}
              </button>

              <button
                v-else-if="
                  (attendance.attendState === 'E' || attendance.attendState === 'L') &&
                  !attendance.attendEnddate
                "
                class="attendance-button leave"
                @click="handleAttendanceOut(attendance.lecId)"
              >
                퇴실
              </button>

              <button
                v-else-if="attendance.attendState === 'F' || attendance.attendState === 'J'"
                class="attendance-button other"
              >
                {{ attendanceStatusText[attendance.attendState] }}
              </button>

              <button
                v-else
                class="attendance-button attend"
                @click="handleAttendanceCheck(attendance.lecId)"
              >
                출석
              </button> -->
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

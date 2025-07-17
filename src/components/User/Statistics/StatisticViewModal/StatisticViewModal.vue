<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onBeforeMount, onMounted, ref } from 'vue';
import StatisticsChart from '../StatisticsChart/StatisticsChart.vue';

const modalState = useModalState();
const viewDataParam = ref([]);

const props = defineProps({
  lecName: {
    type: String,
    default: '',
  },
  lectureStartAround: {
    type: Number,
    default: 0,
  },
  lectureEndAround: {
    type: Number,
    default: 0,
  },
});

const viewLabels = ref([]);

for (let idx = props.lectureStartAround; idx <= props.lectureEndAround; idx++) {
  viewLabels.value.push(idx);
}

const viewData = () => {
  const params = {
    lectureName: props.lecName,
    lectureStartAround: props.lectureStartAround,
    lectureEndAround: props.lectureEndAround,
  };

  const param = new URLSearchParams(params);

  axios.post('/api/user/lacture-statistics', param).then((res) => {
    viewDataParam.value = res.data;
  });
};

onBeforeMount(() => {
  if (
    !props.lecName ||
    !props.lectureStartAround ||
    !props.lectureEndAround ||
    props.lecName === ''
  ) {
    alert('통계를 내고자하는 데이터를 선택해주세요');
    modalState.$patch({ isOpen: false });
  }
});
onMounted(() => {
  props.lecName && viewData();
});
</script>
<template>
  <div class="modal-overlay">
    <div class="lecture-stats-modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>강의 통계</h2>
        <button class="close-btn" @click="modalState.$patch({ isOpen: false })">×</button>
      </div>

      <!-- 테이블 -->
      <div class="table-container">
        <table class="stats-table">
          <thead>
            <tr>
              <th>강의 번호</th>
              <th>강의 이름</th>
              <th>강사 이름</th>
              <th>회차</th>
              <th>개강일</th>
              <th>종강일</th>
              <th>정원</th>
              <th>평균 점수</th>
              <th>최고 점수</th>
              <th>최저 점수</th>
              <th>과락 인원</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="view in viewDataParam" :key="view.lecId">
              <td>{{ view.lecId }}</td>
              <td>{{ view.lecName }}</td>
              <td>{{ view.tutorName }}</td>
              <td>{{ view.lectureRound }}</td>
              <td>{{ view.lecStartDate?.substring(0, 10) }}</td>
              <td>{{ view.lecEndDate?.substring(0, 10) }}</td>
              <td>{{ view.lecPersonnel }}</td>
              <td>{{ view.avgScore }}</td>
              <td>{{ view.maxScore }}</td>
              <td>{{ view.minScore }}</td>
              <td>{{ view.failedStudents }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <StatisticsChart v-if="viewDataParam.length > 0" :view-data="viewDataParam" />
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

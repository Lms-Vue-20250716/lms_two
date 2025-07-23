<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ManageSurveyModal from '../ManageSurveyModal/ManageSurveyModal.vue';

const selectedView = ref('completed'); // 'completed' | 'result'

const completedList = ref([]);
const resultList = ref([]);
const isModalOpen = ref(false);
const selectedSurveyItem = ref(null);

// API 호출
const fetchData = async () => {
  try {
    if (selectedView.value === 'completed') {
      const res = await axios.get('/support/getCompletedPageList.do');
      completedList.value = res.data.completedList || [];
    } else {
      const res = await axios.get('/support/getResultListReact.do');
      const raw = res.data.resultList || [];
      // 응답률 계산
      resultList.value = raw.map((item) => ({
        ...item,
        rate: item.coursesStudentCount
          ? ((item.respondentCount / item.coursesStudentCount) * 100).toFixed(1)
          : '0.0',
      }));
    }
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

onMounted(() => {
  fetchData();
});

// 모달 열기
const openDetailModal = (item) => {
  selectedSurveyItem.value = item;
  isModalOpen.value = true;
};
</script>

<template>
  <div class="survey-manage-container">
    <div class="survey-manage-header">
      <h2>설문조사 관리</h2>

      <!-- 유형 선택 드롭다운 -->
      <select v-model="selectedView" @change="fetchData" class="view-selector">
        <option value="completed">설문 완료 목록 조회</option>
        <option value="result">설문 결과 조회</option>
      </select>
    </div>

    <!-- 목록 테이블: completed -->
    <table v-if="selectedView === 'completed'" class="survey-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>과목명</th>
          <th>학생 ID</th>
          <th>학생명</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="completedList.length === 0">
          <td colspan="5" class="no-data">조회된 설문이 없습니다.</td>
        </tr>
        <tr v-for="(item, index) in completedList" :key="item.lecId + '-' + item.loginId">
          <td>{{ index + 1 }}</td>
          <td>{{ item.lecName }}</td>
          <td>{{ item.loginId }}</td>
          <td>{{ item.stName }}</td>
          <td>
            <button @click="openDetailModal(item)" class="btn-detail">상세보기</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 목록 테이블: result -->
    <table v-else class="survey-table">
      <thead>
        <tr>
          <th>No.</th>
          <th>과목명</th>
          <th>강사명</th>
          <th>평균 점수</th>
          <th>응답 인원</th>
          <th>응답률(%)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="resultList.length === 0">
          <td colspan="6" class="no-data">조회된 설문 결과가 없습니다.</td>
        </tr>
        <tr v-for="(item, index) in resultList" :key="item.lecId">
          <td>{{ index + 1 }}</td>
          <td>{{ item.lecName }}</td>
          <td>{{ item.lecInstructorName }}</td>
          <td>{{ item.avgScore }}</td>
          <td>{{ item.respondentCount }}</td>
          <td>{{ item.rate }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 모달 -->
    <ManageSurveyModal
      v-if="isModalOpen"
      :mode="'detail'"
      :surveyData="selectedSurveyItem"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style>
@import './styled.css';
</style>

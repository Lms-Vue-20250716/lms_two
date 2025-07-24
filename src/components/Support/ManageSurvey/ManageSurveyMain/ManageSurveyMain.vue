<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import ManageSurveyModal from '../ManageSurveyModal/ManageSurveyModal.vue';

const selectedTab = ref('');
const dataList = ref([]);
const isModalOpen = ref(false);
const selectedSurveyItem = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// Enum을 기반으로 avgScore를 텍스트로 변환하는 함수
const getScoreText = (score) => {
  const scoreMap = {
    1: '매우나쁨',
    2: '나쁨',
    3: '보통',
    4: '좋음',
    5: '매우좋음',
    null: '평가 없음',
    undefined: '평가 없음',
  };
  return scoreMap[score] || '평가 없음';
};

const fetchData = async () => {
  if (!selectedTab.value) return; // 아무 것도 선택 안 했을 경우 빠르게 리턴

  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    };
    if (selectedTab.value === 'completed') {
      const res = await axios.get('/api/support/getCompletedList.do', { params });
      console.log('Completed 응답:', res.data);
      dataList.value = res.data.resultList || [];
      totalItems.value = res.data.resultCnt || 0;
    } else {
      const res = await axios.get('/api/support/getResultList.do', { params });
      console.log('Result 응답:', res.data);
      const fixedRes = res.data.fixedRes || [];
      dataList.value = res.data.fixedRes.map((item) => ({
        ...item,
        rate: item.coursesStudentCount
          ? ((item.respondentCount / item.coursesStudentCount) * 100).toFixed(1)
          : '0.0',
        avgScore: getScoreText(item.avgScore)
          ? getScoreText(item.avgScore).toString()
          : '평가 없음',
      }));
      totalItems.value = res.data.resultCnt || 0;
    }
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    fetchData();
  }
};

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

watch(() => [selectedTab.value, currentPage.value], fetchData, { immediate: true });

const openDetailModal = (item) => {
  selectedSurveyItem.value = item;
  isModalOpen.value = true;
};
</script>

<template>
  <div class="survey-manage-container">
    <div class="survey-manage-header">
      <div class="view-selector-wrapper">
        <label>관리 항목 <span class="required">*</span></label>
        <select v-model="selectedTab" @change="fetchData" class="view-selector">
          <option disabled value="" hidden>클릭해서 항목 선택</option>
          <option value="completed">설문 완료 목록 조회</option>
          <option value="result">설문 결과 조회</option>
        </select>
      </div>
    </div>

    <div class="survey-table-wrapper" v-if="selectedTab && selectedTab !== 'null'">
      <table class="survey-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>과목명</th>
            <th v-if="selectedTab === 'completed'">학생 ID</th>
            <th v-if="selectedTab === 'completed'">학생명</th>
            <th v-if="selectedTab === 'result'">강사이름</th>
            <th v-if="selectedTab === 'result'">평균</th>
            <th v-if="selectedTab === 'result'">응답인원</th>
            <th v-if="selectedTab === 'result'">완료율(%)</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dataList.length === 0">
            <td colspan="5" class="no-data">조회된 설문이 없습니다.</td>
          </tr>
          <tr v-for="(item, index) in dataList" :key="item.lecId + '-' + (item.loginId || index)">
            =======
          </tr>

          <tr v-for="(item, index) in dataList" :key="item.lecId + '-' + item.loginId">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ item.lecName }}</td>
            <td v-if="selectedTab === 'completed'">{{ item.loginId }}</td>
            <td v-if="selectedTab === 'completed'">{{ item.stName }}</td>
            <td v-if="selectedTab === 'result'">{{ item.lecInstructorName }}</td>
            <td v-if="selectedTab === 'result'">{{ item.avgScore }}</td>
            <td v-if="selectedTab === 'result'">{{ item.respondentCount }}</td>
            <td v-if="selectedTab === 'result'">{{ item.rate }}</td>
            <td>
              <button
                v-if="selectedTab === 'completed'"
                @click="openDetailModal(item)"
                class="btn-detail"
              >
                상세보기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination" v-if="totalItems > pageSize">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          다음
        </button>
      </div>
    </div>

    <ManageSurveyModal
      v-if="isModalOpen"
      :mode="'detail'"
      :survey-data="selectedSurveyItem"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
@import './styled.css';

/* 기존 스타일 유지 */
.survey-manage-container {
  padding: 20px;
}

/* ... (기존 스타일 생략) ... */

.view-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 5px 10px;
  border-radius: 4px;
}

.view-selector-wrapper label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.view-selector-wrapper .required {
  color: red;
}

.view-selector {
  padding: 5px;
  color: #666;
  border: none;
  background: transparent;
  outline: none;
}

.view-selector option {
  color: #000;
}

.view-selector:invalid {
  color: #666;
}
</style>

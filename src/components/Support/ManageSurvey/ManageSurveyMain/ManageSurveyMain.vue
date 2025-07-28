<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import PageNavigation from '@/components/common/PageNavigation.vue'; // ✅ 추가
import ManageSurveyModal from '../ManageSurveyModal/ManageSurveyModal.vue';

const selectedTab = ref('');
const dataList = ref([]);
const isModalOpen = ref(false);
const selectedSurveyItem = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

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

const paginatedList = computed(() => {
  if (selectedTab.value === 'completed') {
    return dataList.value;
  } else {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return dataList.value.slice(start, end);
  }
});

const fetchData = async () => {
  if (!selectedTab.value) return;

  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    };

    if (selectedTab.value === 'completed') {
      const res = await axios.get('/api/support/getCompletedList.do', { params });
      dataList.value = res.data.resultList || [];
      totalItems.value = res.data.resultCnt || dataList.value.length;
    } else {
      const res = await axios.get('/api/support/getResultList.do', { params });
      const fixedRes = res.data.fixedRes || [];

      dataList.value = fixedRes.map((item) => ({
        ...item,
        rate:
          Number(item.coursesStudentCount) > 0
            ? Math.round((item.respondentCount / item.coursesStudentCount) * 100)
            : 0,
        avgScore: getScoreText(item.avgScore),
      }));
      totalItems.value = res.data.resultCnt || dataList.value.length;
    }
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

// 페이지네이션에서 페이지 변경 시 호출할 함수
const handlePageChange = (page) => {
  currentPage.value = page;
};

watch(selectedTab, () => {
  currentPage.value = 1;
});

watch([selectedTab, currentPage], fetchData, { immediate: true });

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
        <select v-model="selectedTab" class="view-selector">
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
            <th v-if="selectedTab === 'completed'">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dataList.length === 0">
            <td colspan="9" class="no-data">조회된 설문이 없습니다.</td>
          </tr>
          <tr
            v-for="(item, index) in paginatedList"
            :key="item.lecId + '-' + (item.loginId || index)"
          >
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ item.lecName }}</td>
            <td v-if="selectedTab === 'completed'">{{ item.loginId }}</td>
            <td v-if="selectedTab === 'completed'">{{ item.stName }}</td>
            <td v-if="selectedTab === 'result'">{{ item.lecInstructorName }}</td>
            <td v-if="selectedTab === 'result'">{{ item.avgScore }}</td>
            <td v-if="selectedTab === 'result'">{{ item.respondentCount }}</td>
            <td v-if="selectedTab === 'result'">
              {{ item.rate }}%
              <div v-if="Number(item.rate) > 0" class="progress-bar-container">
                <div class="progress-bar" :style="{ width: Number(item.rate) + '%' }"></div>
              </div>
            </td>
            <td v-if="selectedTab === 'completed'">
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

      <PageNavigation
        :total-items="totalItems"
        :items-per-page="pageSize"
        :on-page-change="handlePageChange"
      />
      <<<<<<< HEAD =======

      <div class="pagination" v-if="totalItems > pageSize">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">이전</button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          다음
        </button>
      </div>
      ======= >>>>>>> 9d3e9fe (fix: survey 페이지내이션 수정)

      <ManageSurveyModal
        v-if="isModalOpen"
        mode="detail"
        :survey-data="selectedSurveyItem"
        @close="isModalOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
@import './styled.css';

/* 기존 스타일 유지 */
.survey-manage-container {
  padding: 20px;
}

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

.progress-bar-container {
  border: 1px solid red; /* 디버깅용 */
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  border-radius: 5px;
  transition: width 0.3s ease;
}
</style>

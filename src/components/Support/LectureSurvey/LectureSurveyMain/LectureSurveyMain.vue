<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import LectureSurveySearch from '../LectureSurveySearch/LectureSurveySearch.vue';

const lecOptions = ref([]); // 드롭다운 강의 목록
const selectedLecId = ref(''); // 선택된 강의 ID
const surveyData = ref([]); // 설문 문항 배열
const currentPage = ref(0); // 현재 설문 문항 인덱스
const surveyCompleted = ref(false); // 설문 완료 여부
const loginInfo = ref(null);
const userRole = ref(''); // userRole: 'student' 또는 'admin' 등 역할을 담는 변수

const showSurvey = computed(
  () => selectedLecId.value && !surveyCompleted.value && surveyData.value.length > 0,
);

const loginData = localStorage.getItem('loginInfo'); // localStorage에서 로그인 정보 가져옴
if (loginData) {
  loginInfo.value = JSON.parse(loginData); // 문자열을 객체로 변환
  userRole.value = loginInfo.value.role || ''; // role 값이 없으면 빈 문자열
}

// 강의 목록 불러오기
const fetchLectureList = async () => {
  try {
    const res = await axios.get('/api/support/lecture-surveyJson', {
      params: { loginId: loginInfo.value?.loginId },
    });
    lecOptions.value = res.data.lectures || [];
  } catch (err) {
    console.error('강의 목록 불러오기 실패:', err);
  }
};

// 설문 문항 불러오기
const fetchSurveyByLecture = async (lecId = selectedLecId.value) => {
  if (!lecId) {
    surveyData.value = [];
    surveyCompleted.value = false;
    currentPage.value = 0;
    return;
  }

  try {
    const res = await axios.get('/api/support/getSurveyContents.do', {
      params: { lecId },
    });

    const data = res.data;

    // 백엔드에서 중복일 경우 빈 배열 반환
    if (Array.isArray(data) && data.length === 0) {
      surveyCompleted.value = true;
      surveyData.value = [];
    } else {
      surveyCompleted.value = false;
      surveyData.value = data.map((q) => ({ question: q }));
    }

    currentPage.value = 0;
  } catch (err) {
    console.error('설문 불러오기 실패:', err);
    surveyData.value = [];
    surveyCompleted.value = false;
    currentPage.value = 0;
  }
};

// 다음/이전 버튼
const goNext = () => {
  if (currentPage.value < surveyData.value.length - 1) currentPage.value++;
};
const goPrev = () => {
  if (currentPage.value > 0) currentPage.value--;
};

// 강의 선택 시 자동 호출
watch(selectedLecId, (newId) => {
  if (newId) fetchSurveyByLecture(newId);
});

// 최초 강의 목록 조회
onMounted(() => {
  fetchLectureList();
});
</script>

<template>
  <div class="rounded bg-white p-4 shadow">
    <LectureSurveySearch
      v-if="userRole === 'student'"
      v-model="selectedLecId"
      @lectureSelected="(id) => (selectedLecId = id)"
    />

    <div v-if="userRole === 'student'" class="survey-container">
      <div class="survey-header">
        <h1>설문조사</h1>
      </div>

      <div class="survey-content">
        <div v-if="!selectedLecId" class="question-box">
          <h2>먼저 강의를 선택해주세요.</h2>
        </div>

        <div v-else-if="surveyCompleted" class="question-box">
          <h2>이미 완료된 설문입니다.</h2>
        </div>

        <div v-else-if="showSurvey" class="question-box">
          <h2>{{ surveyData[currentPage].question }}</h2>
        </div>
      </div>

      <div class="mt-4 flex justify-between">
        <button class="rounded bg-gray-200 px-4 py-2" @click="goPrev" :disabled="currentPage === 0">
          이전
        </button>
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white"
          @click="goNext"
          :disabled="currentPage === surveyData.length - 1"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@import './styled.css';

.survey-container {
  max-width: 1000px;
  margin: 40px auto;
  font-family: sans-serif;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.4;
}

.question-box h2 {
  margin-bottom: 25px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.survey-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

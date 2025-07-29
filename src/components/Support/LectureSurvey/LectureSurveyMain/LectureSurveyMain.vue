<script setup>
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import axios from 'axios';
import LectureSurveySearch from '../LectureSurveySearch/LectureSurveySearch.vue';
// import LectureSurveyModal from '../LectureSurveyModal/LectureSurveyModal.vue';

const lecOptions = ref([]); // 드롭다운에 쓸 강의 목록
const selectedLecId = ref(''); // 선택된 강의 ID
const surveyData = ref([]); // 선택된 강
const currentPage = ref(0); // 설문 페이지 번호
const showSurvey = computed(
  () => selectedLecId.value && Array.isArray(surveyData.value) && surveyData.value.length > 0,
);

const fetchLectureList = async () => {
  try {
    const response = await axios.get('/support/getLectureListForSurvey.do');
    lecOptions.value = response.data.lectureList.map((item) => ({
      label: item.lecName,
      value: item.lecId,
    }));
  } catch (error) {
    console.error('강의 목록 불러오기 실패:', error);
  }
};

const fetchSurveyByLecture = async () => {
  if (!selectedLecId.value) return;
  try {
    const response = await axios.get('/support/getSurveyContents.do', {
      params: { lecId: selectedLecId.value },
    });
    console.log('설문 응답:', response.data.survey);
    const questions = response.data;
    surveyData.value = Array.isArray(questions) ? questions.map((q) => ({ question: q })) : [];

    currentPage.value = 0;
  } catch (error) {
    console.error('설문 불러오기 실패:', error);
    surveyData.value = [];
  }
};

const goNext = () => {
  if (currentPage.value < surveyData.value.length - 1) {
    currentPage.value++;
  }
};
const goPrev = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

onMounted(fetchLectureList);
</script>

<template>
  <div class="rounded bg-white p-4 shadow">
    <LectureSurveySearch
      :lecOptions="lecOptions"
      v-model:selectedLecId="selectedLecId"
      @lectureSelected="fetchSurveyByLecture"
    />

    <div class="survey-container">
      <div class="survey-header">
        <h1>설문조사</h1>
      </div>
      <div class="survey-content">
        <div id="question-box" v-if="!showSurvey" class="question-box" style="margin-bottom: 30px">
          <h2>먼저 강의를 선택해주세요.</h2>
        </div>
      </div>

      <!-- 이전/다음 버튼 -->
      <div class="mt-4 flex justify-between">
        <button class="rounded bg-gray-200 px-4 py-2" @click="goPrev" :disabled="currentPage === 0">
          이전
        </button>
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white"
          :disabled="currentPage === surveyData.length - 1"
          @click="goNext"
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

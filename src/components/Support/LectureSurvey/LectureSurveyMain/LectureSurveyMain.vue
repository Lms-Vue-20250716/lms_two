<script setup>
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import axios from 'axios';
import LectureSurveySearch from '../LectureSurveySearch/LectureSurveySearch.vue';
// import LectureSurveyModal from '../LectureSurveyModal/LectureSurveyModal.vue';

const lecOptions = ref([]); // 드롭다운에 쓸 강의 목록
const selectedLecId = ref(''); // 선택된 강의 ID
const surveyData = ref(null); // 선택된 강
const currentPage = ref(0); // 설문 페이지 번호
const showSurvey = computed(() => selectedLecId.value && surveyData.value);

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
    const response = await axios.get('/support/getSurveyByLecture.do', {
      params: { lecId: selectedLecId.value },
    });
    surveyData.value = response.data.survey;
    currentPage.value = 0;
  } catch (error) {
    console.error('설문 불러오기 실패:', error);
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
      @search="fetchSurveyByLecture"
    />

    <div v-if="!showSurvey" class="mt-8 text-center text-gray-500">먼저 강의를 선택해주세요.</div>

    <div v-else class="mt-8">
      <!-- 설문 내용 -->
      <div class="rounded border p-4">
        <div class="mb-2 font-semibold">설문조사</div>
        <div>
          {{ surveyData[currentPage].question }}
        </div>
      </div>

      <!-- 이전/다음 버튼 -->
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
</style>

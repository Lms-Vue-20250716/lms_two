<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const selectedLecId = ref(null);
const surveyData = ref([]);
const surveyCompleted = ref(false);
const loginInfo = ref({ loginId: 'student' }); // 백엔드 세션에서 가져가므로 하드코딩
const router = useRouter();

// 설문 불러오기
const fetchSurveyByLecture = async (lecId = selectedLecId.value) => {
  if (!lecId) {
    surveyData.value = [];
    surveyCompleted.value = false;
    return;
  }

  try {
    const res = await axios.get('/api/support/getSurveyContents.do', {
      params: { lecId },
    });

    const data = res.data;
    console.log('서버에서 받은 설문 데이터:', data);

    if (!Array.isArray(data) || data.length === 0) {
      surveyCompleted.value = true;
      surveyData.value = [];
    } else {
      surveyCompleted.value = false;
      surveyData.value = data.map((q, idx) => ({
        surveyId: idx + 1,
        question: typeof q === 'string' ? q : q.question,
        options: ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'],
        answer: '', // 사용자가 고를 값
      }));
    }
  } catch (error) {
    console.error('설문 데이터 불러오기 실패:', error);
  }
};

// 설문 제출
const handleSubmit = async () => {
  if (!selectedLecId.value) {
    alert('강의가 선택되지 않았습니다.');
    return;
  }

  if (!surveyData.value.length) {
    alert('설문 데이터가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const unanswered = surveyData.value.some((q) => !q.answer);
  if (unanswered) {
    alert('모든 질문에 답해주세요.');
    return;
  }

  console.log('surveyData:', surveyData.value);

  try {
    for (const item of surveyData.value) {
      const surveyResult = item.options.includes(item.answer)
        ? item.options.indexOf(item.answer) + 1
        : null;

      if (surveyResult === null) {
        alert(`문항 "${item.question}"에 유효하지 않은 답변이 있습니다.`);
        return;
      }

      const payload = {
        lecId: selectedLecId.value,
        surveyId: item.surveyId,
        loginId: loginInfo.value?.loginId,
        surveyResult,
      };

      const urlParam = new URLSearchParams(payload);

      console.log('전송할 payload:', payload);

      await axios.post('/api/support/saveResult.do', urlParam);
    }

    alert('설문이 성공적으로 제출되었습니다.');
  } catch (error) {
    console.error('제출 중 에러 발생:', error);
    alert('제출 중 오류가 발생했습니다.');
  }
};

// 강의 선택 시 설문 불러오기
watch(selectedLecId, (newId) => {
  console.log('선택된 강의 ID 변경:', newId);
  if (newId) fetchSurveyByLecture(newId);
});

// 초기 로딩 시 실행
onMounted(() => {
  if (selectedLecId.value) {
    fetchSurveyByLecture();
  }
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
          <h2>Q{{ surveyData[currentPage].id }}. {{ surveyData[currentPage].question }}</h2>

          <div class="options mt-4">
            <label
              v-for="option in surveyData[currentPage].options"
              :key="option"
              class="option-label"
            >
              <input
                type="radio"
                :name="'q' + surveyData[currentPage].id"
                :value="option"
                v-model="surveyData[currentPage].answer"
              />
              {{ option }}
            </label>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-between">
        <button class="rounded bg-gray-200 px-4 py-2" @click="goPrev" :disabled="currentPage === 0">
          이전
        </button>

        <button
          v-if="currentPage < surveyData.length - 1"
          class="rounded bg-blue-500 px-4 py-2 text-white"
          @click="goNext"
        >
          다음
        </button>

        <button v-else class="rounded bg-green-500 px-4 py-2 text-white" @click="handleSubmit">
          완료
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

.options {
  display: flex;
  flex-direction: row;
  gap: 15px;
  flex-wrap: wrap;
}

.option-label {
  font-size: 1rem;
  cursor: pointer;
}

.option-label input {
  margin-right: 6px;
}

button:hover {
  background-color: #4299e1;
  color: white;
  transition: background-color 0.2s ease;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

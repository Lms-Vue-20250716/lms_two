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
        answer: '',
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
  try {
    const responses = surveyData.value;

    for (const item of responses) {
      const payload = new URLSearchParams();
      payload.append('lecId', selectedLecId.value);
      payload.append('surveyId', item.id); // 설문 문항 번호
      payload.append('surveyResult', item.answer); // 선택된 답변 값

      console.log('전송할 payload:', payload.toString());

      const res = await axios.post('/api/support/saveResult.do', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('서버 응답:', res.data);
    }

    alert('설문이 성공적으로 제출되었습니다.');
  } catch (error) {
    console.error('제출 중 에러 발생:', error);
    alert('설문 제출 중 오류가 발생했습니다.');
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
  <div v-if="surveyCompleted">
    <p>이미 설문을 완료하셨습니다.</p>
  </div>

  <div v-else>
    <div v-for="(item, index) in surveyData" :key="index" class="survey-question">
      <p>{{ item.question }}</p>
      <div v-for="(option, idx) in item.options" :key="idx">
        <label>
          <input type="radio" :value="option" v-model="item.answer" />
          {{ option }}
        </label>
      </div>
    </div>

    <button @click="handleSubmit">제출</button>
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

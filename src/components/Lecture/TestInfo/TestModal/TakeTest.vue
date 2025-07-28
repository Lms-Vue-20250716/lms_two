<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useModalState } from '@/stores/modalState';
import { formatDateTime } from '@/common/common_time';

// --- Props & Emits ---
const props = defineProps({
  // 부모 컴포넌트에서 시험 관련 데이터를 객체로 전달받습니다.
  testTakeProps: {
    type: Object,
    required: true,
  },
  // 'take' (시험 응시) 또는 'result' (결과 보기) 모드를 결정합니다.
  mode: {
    type: String,
    default: 'take', // 기본값은 시험 응시 모드
  },
});

const emit = defineEmits(['test-submit-success']);

// --- 모달 정보
const modalState = useModalState();

// --- 로그인 정보 ---
// const userInfoStore = useUserInfo();
// const studentId = computed(() => userInfoStore.user?.loginId);

// --- Component State ---
const isLoading = ref(true); // 데이터 로딩 상태
const questions = ref([]); // 질문 목록
const allOptions = ref([]); // 모든 보기 목록
const submittedAnswers = ref([]); // 서버에서 받은, 이미 제출된 답변 목록
const studentAnswers = ref({}); // 학생이 선택한 답변 (v-model과 연결)
const openQuestionIds = ref({}); // 아코디언 UI를 위한 열린 질문 ID 목록

// --- 시험 결과 전용 상태 ---
const correctAnswers = ref({}); // { questionId: correctOptionId } 형태
const testResultInfo = ref(null); // 시험 점수, 제출일 등

// --- Computed Properties ---

// 시험이 이미 제출되었는지 여부를 반환합니다.
// 제출 여부 확인: true면 답변 미리 선택 + 변경 불가 + 제출 버튼 숨김
const isSubmitted = computed(() => submittedAnswers.value && submittedAnswers.value.length > 0);

// 원본 데이터를 템플릿에서 사용하기 편한 구조로 가공합니다.
const processedQuestions = computed(() => {
  return questions.value
    .map((q) => {
      return {
        ...q,
        // 전체 보기 목록에서 현재 질문에 해당하는 보기만 필터링합니다.
        options: allOptions.value.filter((opt) => opt.questionId === q.questionId),
        // 결과 보기 모드일 때, 각 질문의 정답 ID를 추가합니다.
        correctOptionId: props.mode === 'result' ? correctAnswers.value[q.questionId] : null,
      };
    })
    .sort((a, b) => a.questionNumber - b.questionNumber); // 문제 번호 순으로 정렬
});

// 시험 결과 요약 정보를 계산합니다.
const resultSummary = computed(() => {
  if (props.mode !== 'result' || !testResultInfo.value || questions.value.length === 0) {
    return null;
  }
  const totalQuestions = questions.value.length;
  const totalPossibleScore = questions.value.reduce((sum, q) => sum + (q.questionScore || 0), 0);
  // 맞은 문제 수를 직접 계산합니다.
  const correctAnswerCount = questions.value.reduce((count, question) => {
    const questionId = question.questionId;
    // 학생이 제출한 답안과 실제 정답을 비교합니다.
    if (studentAnswers.value[questionId] === correctAnswers.value[questionId]) {
      return count + 1;
    }
    return count;
  }, 0);

  return {
    scoreText: `${testResultInfo.value.testScore || 0} / ${totalPossibleScore}점`,
    countText: `${correctAnswerCount || 0} / ${totalQuestions}`,
    totalQuestionQuantity: totalQuestions,
    totalCountText: `${totalQuestions}문제`,
    submitDate: testResultInfo.value.testResultRegDate
      ? formatDateTime(testResultInfo.value.testResultRegDate, 'YYYY-MM-DD HH:mm:ss')
      : '정보 없음',
  };
});

// --- API 호출: 시험 문제 및 보기 정보 조회 ---
const fetchTestDetails = async () => {
  const params = new URLSearchParams();
  params.append('testId', props.testTakeProps.testId);
  params.append('lecId', props.testTakeProps.lecId);
  params.append('studentId', props.testTakeProps.studentId);

  try {
    const response = await axios.post('/api/lecture/testQuestionNOptionInfoDetail.do', params);
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    console.log(response.data);

    questions.value = response.data.testQuestionInfoDetail || [];
    allOptions.value = response.data.testQuestionOptionInfoDetail || [];
    submittedAnswers.value = response.data.testSubmitOptionDetail || [];

    // 이미 제출된 답변이 있다면, studentAnswers 모델을 채워 라디오 버튼을 check 상태로 만듭니다.
    if (isSubmitted.value) {
      submittedAnswers.value.forEach((ans) => {
        studentAnswers.value[ans.questionId] = ans.optionId;
      });
    }
  } catch (error) {
    console.error('시험 상세 정보 조회 중 오류 발생:', error);
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
  }
};

// --- API 호출: 시험 문제 및 보기 정보 조회 ---
const fetchTestResultDetails = async () => {
  isLoading.value = true;

  const params = new URLSearchParams();
  params.append('testId', props.testTakeProps.testId);
  params.append('lecId', props.testTakeProps.lecId);
  params.append('studentId', props.testTakeProps.studentId);

  try {
    const response = await axios.post('/api/lecture/testTakeSubmitResultDetail.do', params);

    questions.value = response.data.testQuestionInfoDetail || [];
    allOptions.value = response.data.testQuestionOptionInfoDetail || [];
    testResultInfo.value = response.data.testResultInfoValue || {};

    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log(testResultInfo.value);

    const submitted = response.data.testSubmitOptionDetailValue || [];
    submitted.forEach((ans) => {
      studentAnswers.value[ans.questionId] = ans.optionId;
    });

    const correct = response.data.testQuestionAnswerInfoDetail || [];
    const correctMap = {};
    correct.forEach((ans) => {
      correctMap[ans.questionId] = ans.correctOptionId;
    });
    correctAnswers.value = correctMap;
  } catch (err) {
    console.log(err);
  } finally {
    isLoading.value = false;
  }
};

// --- Methods ---

// 질문의 보기 영역을 열고 닫습니다 (아코디언 효과).
const toggleQuestion = (questionId) => {
  openQuestionIds.value[questionId] = !openQuestionIds.value[questionId];
};

// 시험 답안을 제출합니다.
const submitTest = async () => {
  const unansweredNumbers = [];

  // 1. 답변하지 않은 문제가 있는지 확인합니다.
  processedQuestions.value.forEach((q) => {
    if (!studentAnswers.value[q.questionId]) {
      unansweredNumbers.push(`Q${q.questionNumber}`);
      // 답변 안 한 문제의 보기 목록을 펼칩니다.
      openQuestionIds.value[q.questionId] = true;
    }
  });

  if (unansweredNumbers.length > 0) {
    alert(`다음 문항에 답변하지 않았습니다:\n${unansweredNumbers.join(', ')}`);
    return;
  }

  if (!confirm('시험을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.')) {
    return;
  }

  // 2. 서버에 전송할 'answers' 배열을 생성합니다.
  const answers = Object.entries(studentAnswers.value).map(([questionId, optionId]) => ({
    testId: props.testTakeProps.testId,
    lecId: props.testTakeProps.lecId,
    studentId: props.testTakeProps.studentId,
    questionId: parseInt(questionId, 10),
    optionId: parseInt(optionId, 10),
    submitDate: formatDateTime(new Date().toISOString(), 'YYYY-MM-DD HH:mm:ss'),
  }));

  // 3. JSP와 동일한 구조의 최종 payload 객체를 생성합니다.
  const payload = {
    answers: answers,
    lecId: props.testTakeProps.lecId,
    testId: props.testTakeProps.testId,
    studentId: props.testTakeProps.studentId,
    submitDate: formatDateTime(new Date().toISOString(), 'YYYY-MM-DD HH:mm:ss'),
  };

  try {
    // 4. 생성된 payload로 API를 호출합니다.
    const response = await axios.post('/api/lecture/testTakeSubmit.do', payload);

    // 5. 서버 응답 결과에 따라 분기 처리합니다.
    if (response.data.result === 'success') {
      alert('시험이 성공적으로 제출되었습니다.');
      modalState.$patch({ isOpen: false, type: 'test-take' });
      emit('test-submit-success');
    } else if (response.data.result === 'isExist') {
      alert('이미 제출된 시험입니다.');
      modalState.$patch({ isOpen: false, type: 'test-take' });
    } else {
      alert('제출에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (error) {
    console.error('답안 제출 중 오류 발생:', error);
    alert('답안 제출에 실패했습니다. 다시 시도해주세요.');
  }
};

watch(
  () => props.testTakeProps,
  async () => {
    if (!props.testTakeProps) return;
    isLoading.value = true;

    // 상태 초기화
    questions.value = [];
    allOptions.value = [];
    submittedAnswers.value = [];
    studentAnswers.value = {};
    openQuestionIds.value = {};
    testResultInfo.value = null;
    correctAnswers.value = {};

    try {
      // mode에 따라 다른 API 호출
      if (props.mode === 'result') {
        await fetchTestResultDetails();
      } else {
        await fetchTestDetails();
      }

      if (questions.value.length === 0) {
        alert('문제가 출제되지 않았거나 시험 정보를 불러올 수 없습니다.');
        modalState.$patch({ isOpen: false, type: 'test-take' });
        return;
      }

      // 모든 질문을 열린 상태로 초기화
      questions.value.forEach((q) => {
        openQuestionIds.value[q.questionId] = true;
      });
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      modalState.$patch({ isOpen: false, type: 'test-take' });
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="modal-overlay">
    <form
      @submit.prevent="saveQuestionList"
      :class="['test-take-modal', { 'is-loading': isLoading }]"
    >
      <!-- Modal Header -->
      <header class="modal-header">
        <h2 class="modal-title">
          {{ mode === 'result' ? '시험 결과' : '시험 응시' }} : {{ testTakeProps.lecName }}
        </h2>
        <button @click="modalState.$patch({ isOpen: false, type: 'test-take' })" class="close-btn">
          &times;
        </button>
      </header>

      <!-- Modal Body -->
      <main class="modal-content">
        <div v-if="isLoading" class="loading-message">
          <p>시험 문제를 불러오는 중입니다...</p>
        </div>
        <div v-else-if="processedQuestions.length === 0" class="empty-message">
          <p>출제된 문제가 없습니다.</p>
        </div>
        <div v-else>
          <!-- 시험 결과 요약 테이블 (결과 보기 모드에서만 표시) -->
          <div v-if="mode === 'result' && resultSummary" class="result-summary-table">
            <table>
              <tbody>
                <tr>
                  <th>채점 문제수/채점 점수</th>
                  <td>{{ resultSummary.countText + ' (' + resultSummary.scoreText + ')' }}</td>
                </tr>
                <tr>
                  <th>전체 문제 수</th>
                  <td>{{ resultSummary.totalQuestionQuantity + '문제' }}</td>
                </tr>
                <tr>
                  <th>시험 제출일</th>
                  <td>{{ resultSummary.submitDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="question-list">
            <div v-for="q in processedQuestions" :key="q.questionId" class="question-item">
              <div @click="toggleQuestion(q.questionId)" class="question-header">
                <h3 class="font-semibold">
                  Q{{ q.questionNumber }}. {{ q.questionContent }}
                  <span v-if="mode === 'result'" class="text-sm text-gray-500">
                    ({{ q.questionScore }}점)</span
                  >
                </h3>
                <span class="toggle-icon">{{ openQuestionIds[q.questionId] ? '▲' : '▼' }}</span>
              </div>

              <div v-if="openQuestionIds[q.questionId]" class="question-body">
                <div class="options-list">
                  <div v-for="opt in q.options" :key="opt.optionId" class="option-item">
                    <label
                      :for="`q${q.questionId}_opt${opt.optionId}`"
                      class="option-label"
                      :class="{
                        'correct-answer':
                          mode === 'result' &&
                          studentAnswers[q.questionId] === opt.optionId &&
                          opt.optionId === q.correctOptionId,
                        'incorrect-answer':
                          mode === 'result' &&
                          studentAnswers[q.questionId] === opt.optionId &&
                          opt.optionId !== q.correctOptionId,
                        'correct-option':
                          mode === 'result' &&
                          opt.optionId === q.correctOptionId &&
                          studentAnswers[q.questionId] !== opt.optionId,
                      }"
                    >
                      <input
                        type="radio"
                        :id="`q${q.questionId}_opt${opt.optionId}`"
                        :name="`question_${q.questionId}`"
                        :value="opt.optionId"
                        v-model="studentAnswers[q.questionId]"
                        :disabled="isSubmitted || mode === 'result'"
                        class="form-radio"
                      />
                      <span>보기{{ opt.optionNumber }}. {{ opt.optionContent }}</span>
                      <span
                        v-if="mode === 'result' && opt.optionId === q.correctOptionId"
                        class="answer-tag"
                        >(정답)</span
                      >
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal Footer -->
      <footer class="modal-footer">
        <!-- 시험 미제출 시에만 제출 버튼 표시 -->
        <button v-if="mode === 'take' && !isSubmitted" @click="submitTest" class="btn-primary">
          답안 제출
        </button>
        <button
          @click="modalState.$patch({ isOpen: false, type: 'test-take' })"
          class="btn-secondary"
        >
          닫기
        </button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
@import 'tailwindcss';
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.test-take-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 900px;
  /* display: flex;
  flex-direction: column; */
  max-height: 90vh;
  overflow-y: auto;
}

.test-take-modal.is-loading {
  visibility: hidden;
}

/* --- 헤더 --- */
.modal-header {
  @apply flex flex-shrink-0 items-center justify-between rounded-t-lg border-b bg-slate-700 p-4 text-white;
}

.modal-title {
  @apply text-xl font-bold;
}

.close-btn {
  @apply text-2xl leading-none font-bold text-white hover:text-gray-300;
}

/* --- 콘텐츠 영역 --- */
.modal-content {
  @apply overflow-y-auto bg-slate-50 p-6;
}

.loading-message,
.empty-message {
  @apply p-8 text-center text-gray-500;
}

/* --- 결과 요약 테이블 --- */
.result-summary-table {
  @apply mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm;
}
.result-summary-table table {
  @apply w-full;
}
.result-summary-table th {
  @apply w-1/3 p-2 text-left font-semibold text-gray-600;
}
.result-summary-table td {
  @apply flex justify-end p-2 text-gray-800;
}

/* --- 질문 목록 --- */
.question-list {
  @apply space-y-4;
}
.question-item {
  @apply rounded-md border border-gray-300 bg-white shadow-sm;
}
.question-header {
  @apply flex cursor-pointer items-center justify-between rounded-t-md p-4 hover:bg-gray-100;
}
.toggle-icon {
  @apply text-gray-500;
}
.question-body {
  @apply border-t border-gray-200 p-4;
}
.options-list {
  @apply space-y-2;
}
.option-item {
  @apply rounded;
}

.option-label {
  @apply flex cursor-pointer items-center space-x-3 rounded-md p-2 transition-colors hover:bg-blue-50;
}
.form-radio {
  @apply h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500;
}
.form-radio:disabled {
  @apply cursor-not-allowed bg-gray-200;
}

/* --- 정답/오답 스타일 --- */
.answer-tag {
  @apply ml-auto text-sm font-bold;
}

/* 학생이 선택한 답이 '정답'일 경우 */
.correct-answer {
  @apply border-green-300 bg-green-100;
}
.correct-answer .answer-tag {
  @apply text-green-700;
}

/* 학생이 선택한 답이 '오답'일 경우 */
.incorrect-answer {
  @apply border-2 border-red-500 bg-red-100;
}
.incorrect-answer .answer-tag {
  @apply text-red-700;
}

/* 학생이 선택하지 않은 '정답' 보기 */
.correct-option {
  @apply border-2 border-green-500;
}
.correct-option .answer-tag {
  @apply text-green-700;
}

/* --- 푸터 --- */
.modal-footer {
  @apply flex flex-shrink-0 justify-end space-x-2 rounded-b-lg bg-slate-100 p-4;
}
.btn-primary {
  @apply rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700;
}
.btn-secondary {
  @apply rounded-md bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700;
}
</style>

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
});

const emit = defineEmits(['testTakeSuccess']);

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
      };
    })
    .sort((a, b) => a.questionNumber - b.questionNumber); // 문제 번호 순으로 정렬
});

// --- API 호출: 시험 문제 및 보기 정보 조회 ---
const fetchTestDetails = async () => {
  isLoading.value = true;

  // 상태 초기화
  openQuestionIds.value = {};
  studentAnswers.value = {};

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

    if (!response.data || !response.data.testQuestionInfoDetail) {
      alert('시험 문제를 불러오는 데 실패했습니다.');
      questions.value = [];
      allOptions.value = [];
      submittedAnswers.value = [];
      modalState.$patch({ isOpen: false, type: 'test-take' });
      return;
    }

    if (questions.value.length === 0 && allOptions.value.length === 0) {
      alert('문제가 아직 출제되지 않았습니다.');
      modalState.$patch({ isOpen: false, type: 'test-take' });
      return;
    }

    // 모든 질문을 열린 상태로 초기화
    questions.value.forEach((q) => {
      openQuestionIds.value[q.questionId] = true;
    });

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
      emit('testTakeSuccess');
    } else if (response.data.result === 'isExist') {
      alert('이미 제출된 시험입니다.');
      modalState.$patch({ isOpen: false, type: 'test-take' });
      emit('testTakeSuccess');
    } else {
      alert('제출에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (error) {
    console.error('답안 제출 중 오류 발생:', error);
    alert('답안 제출에 실패했습니다. 다시 시도해주세요.');
  }
};

// props가 변경될 때마다 데이터를 다시 불러옵니다.
watch(() => props.testTakeProps, fetchTestDetails, { immediate: true, deep: true });
</script>

<template>
  <div class="modal-overlay">
    <form
      @submit.prevent="saveQuestionList"
      :class="['test-take-modal', { 'is-loading': isLoading }]"
    >
      <!-- Modal Header -->
      <header class="modal-header">
        <h2 class="modal-title">시험 응시 : {{ testTakeProps.lecName }}</h2>
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
        <div v-else class="question-list">
          <!-- 각 질문을 v-for로 렌더링 -->
          <div v-for="q in processedQuestions" :key="q.questionId" class="question-item">
            <!-- 질문 제목 (클릭 시 보기 토글) -->
            <div @click="toggleQuestion(q.questionId)" class="question-header">
              <h3 class="font-semibold">Q{{ q.questionNumber }}. {{ q.questionContent }}</h3>
              <span class="toggle-icon">{{ openQuestionIds[q.questionId] ? '▲' : '▼' }}</span>
            </div>

            <!-- 보기 목록 (v-if로 토글) -->
            <div v-if="openQuestionIds[q.questionId]" class="question-body">
              <div class="options-list">
                <div v-for="opt in q.options" :key="opt.optionId" class="option-item">
                  <label
                    :for="`q${q.questionId}_opt${opt.optionId}`"
                    class="option-label"
                    :class="{
                      'submitted-answer':
                        isSubmitted && studentAnswers[q.questionId] === opt.optionId,
                    }"
                  >
                    <input
                      type="radio"
                      :id="`q${q.questionId}_opt${opt.optionId}`"
                      :name="`question_${q.questionId}`"
                      :value="opt.optionId"
                      v-model="studentAnswers[q.questionId]"
                      :disabled="isSubmitted"
                      class="form-radio"
                    />
                    <span>보기{{ opt.optionNumber }}. {{ opt.optionContent }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal Footer -->
      <footer class="modal-footer">
        <!-- 시험 미제출 시에만 제출 버튼 표시 -->
        <button v-if="!isSubmitted" @click="submitTest" class="btn-primary">답안 제출</button>
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

/* .modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50;
}

.test-take-modal {
  @apply bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col;
} */

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
  @apply flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-blue-50;
}

.form-radio {
  @apply h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500;
}
.form-radio:disabled {
  @apply cursor-not-allowed bg-gray-200;
}

/* --- 푸터 --- */
.modal-footer {
  @apply flex flex-shrink-0 justify-end space-x-2 rounded-b-lg border-t bg-slate-100 p-4;
}

.btn-primary {
  @apply rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700;
}

.btn-secondary {
  @apply rounded-md bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700;
}
</style>

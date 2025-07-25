<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref, computed } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const props = defineProps({
  detailId: { type: Number, default: 0 },
  mode: { type: String, default: 'create' }, // 'create' or 'detail'
  loginId: { type: String, required: true }, // 현재 로그인한 사용자의 ID
});

const modalState = useModalState();
const formRef = ref();
const detail = ref({
  qnaId: 0,
  lecId: '',
  lecName: '',
  loginId: props.loginId,
  qnaTitle: '',
  qnaContent: '',
  qnaAnswer: '',
  qnaRegDate: '',
  qnaAnswerDate: '',
});

const selectedLecture = ref('');
const lecOptions = ref([]);

const isNew = computed(() => props.mode === 'create');

const resetForm = () => {
  detail.value = {
    qnaId: 0,
    lecId: '',
    lecName: '',
    loginId: props.loginId,
    qnaTitle: '',
    qnaContent: '',
    qnaAnswer: '',
    qnaRegDate: '',
    qnaAnswerDate: '',
  };
  selectedLecture.value = '';
};

const fetchLectureList = async () => {
  try {
    const response = await axios.get('/support/getQnaLectureListBody.do');
    lecOptions.value = response.data.lectureList.map((item) => ({
      label: item.lecName,
      value: item.lecId,
    }));
    if (lecOptions.value.length === 0) {
      console.warn('강의 목록이 비어 있습니다. 기본값을 사용합니다.');
      lecOptions.value = [
        { value: 2, label: 'React' },
        { value: 1, label: 'Nodejs' },
        { value: 3, label: 'Vue' },
        { value: 4, label: 'Spring' },
        { value: 5, label: 'Java' },
        { value: 6, label: 'C#' },
        { value: 7, label: '요리' },
        { value: 8, label: '직접추가' },
      ];
    }
  } catch (error) {
    console.error('강의 목록을 불러오는데 실패했습니다.', error);
    lecOptions.value = [
      { value: 2, label: 'React' },
      { value: 1, label: 'Nodejs' },
      { value: 3, label: 'Vue' },
      { value: 4, label: 'Spring' },
      { value: 5, label: 'Java' },
      { value: 6, label: 'C#' },
      { value: 7, label: '요리' },
      { value: 8, label: '직접추가' },
    ];
  }
};

const fetchDetail = async () => {
  if (props.detailId === 0) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);
  try {
    const res = await axios.post('/api/support/qnaDetail.do', param); // 엔드포인트 수정
    if (res.data && !res.data.error) {
      detail.value = {
        qnaId: res.data.qnaId || 0,
        lecId: res.data.lecId || '',
        lecName: res.data.lecName || '',
        loginId: res.data.qnaAnswerWriter || props.loginId,
        qnaTitle: res.data.qnaTitle || '',
        qnaContent: res.data.qnaContent || '',
        qnaAnswer: res.data.qnaAnswer || '',
        qnaRegDate: res.data.qnaRegDate || '',
        qnaAnswerDate: res.data.qnaAnswerDate || '',
      };
      selectedLecture.value = res.data.lecId || '';
      console.log('상세 데이터 로드:', detail.value); // 디버깅용
    } else {
      console.error('데이터를 불러오지 못했습니다.', res.data.error);
    }
  } catch (error) {
    console.error('API 호출 오류:', error);
  }
};

const checkTeacherPermission = async () => {
  const param = new URLSearchParams();
  param.append('questionId', props.detailId);
  param.append('loginId', props.loginId);
  const res = await axios.post('/api/support/checkTeacherPermission.do', param);
  return res.data > 0;
};

const handleSubmit = async () => {
  if (isNew.value && !selectedLecture.value) {
    alert('강의를 선택하세요.');
    return;
  }

  const formData = new URLSearchParams();
  formData.append('qnaId', detail.value.qnaId);
  formData.append('lecId', selectedLecture.value); // lecId 사용
  formData.append('qnaTitle', detail.value.qnaTitle);
  formData.append('qnaContent', detail.value.qnaContent);

  if (!isNew.value) {
    formData.append('qnaAnswer', detail.value.qnaAnswer);
  }

  const api = isNew.value ? '/api/support/saveQuestion.do' : '/api/support/saveAnswer.do';

  try {
    const res = await axios.post(api, formData);

    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      const isTeacher = await checkTeacherPermission();
      if (isTeacher && !isNew.value) return;
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    } else {
      alert('저장 실패');
    }
  } catch (err) {
    console.error('요청 실패:', err);
    alert('오류가 발생했습니다.');
  }
};

const handleQuestionDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);

  try {
    const res = await axios.post('/api/support/deleteQuestion.do', param);
    if (res.data.result === 'success') {
      alert('삭제되었습니다');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    } else {
      alert('삭제 실패');
    }
  } catch (err) {
    console.error('삭제 요청 실패:', err);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

const handleAnswerDelete = async () => {
  const isTeacher = await checkTeacherPermission();
  if (!isTeacher) {
    alert('해당 강의의 강사만 삭제할 수 있습니다.');
    return;
  }

  if (!confirm('정말 답변을 삭제하시겠습니까?')) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);

  try {
    const res = await axios.post('/api/support/deleteAnswer.do', param);
    if (res.data.result === 'success') {
      alert('답변 삭제되었습니다');
      detail.value.qnaAnswer = '';
      detail.value.qnaAnswerDate = '';
    } else {
      alert('답변 삭제 실패');
    }
  } catch (err) {
    console.error('답변 삭제 요청 실패:', err);
    alert('답변 삭제 중 오류가 발생했습니다.');
  }
};

const closeModal = () => {
  modalState.$patch({ isOpen: false });
};

onMounted(() => {
  fetchLectureList();
  if (!isNew.value) fetchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <div class="modal-header">
          <h2>Q&A</h2>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="form-row">
              <label>강의명:</label>
              <select v-model="selectedLecture" :disabled="false" required>
                <option disabled value="">클릭해서 강의 선택</option>
                <option v-for="lec in lecOptions" :key="lec.value" :value="lec.value">
                  {{ lec.label }}
                </option>
              </select>
              <span>{{ detail.lecName }}</span>
              ======= >>>>>>> 398b565 (feat: qna 모달 진행중)
            </div>
            <div class="form-row">
              <label>제목:</label>
              <input
                v-model="detail.qnaTitle"
                type="text"
                name="qnaTitle"
                :readonly="!isNew"
                required
              />
            </div>
            <div class="form-row">
              <label>내용:</label>
              <textarea
                v-model="detail.qnaContent"
                type="qnaContent"
                rows="3"
                class="textarea"
                required
              ></textarea>
            </div>
            <div class="button-container-middle">
              <button type="button" @click="handleQuestionDelete" class="btn-secondary">
                삭제
              </button>
              <button type="button" @click="closeModal" class="btn-secondary">취소</button>
            </div>
          </div>
          <div v-if="!isNew" class="modal-section">
            <h3 class="section-title">댓글</h3>
            <div class="form-row">
              <label>작성자:</label>
              <input type="text" value="admin" readonly />
            </div>
            <div class="form-row">
              <label>내용:</label>
              <textarea
                v-model="detail.qnaAnswer"
                name="qnaAnswer"
                rows="3"
                placeholder="답변을 입력하세요"
              ></textarea>
            </div>
            <div class="form-row">
              <label>답변일:</label>
              <input
                type="text"
                :value="detail.qnaAnswerDate || new Date().toLocaleDateString()"
                readonly
              />
            </div>
            <div class="button-container-middle">
              <button type="button" @click="handleAnswerDelete" class="btn-secondary">
                답변 삭제
              </button>
              <button type="button" @click="handleSubmit" class="btn-primary">등록</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
@import './styled.css';

.modal-container {
  display: flex;
  flex-direction: column;
  width: 700px; /* 더 넓게 조정 */
  background: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 10px;
  background: #172554;
  border-bottom: 1px solid #ccc;
  text-align: center;
}

.modal-body {
  padding: 15px;
  flex-grow: 1;
}

.modal-section {
  margin-bottom: 15px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 3px;
}

.section-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 5px;
}

.form-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start; /* 상단 정렬 */
  margin-bottom: 10px;
}

label {
  width: 120px; /* 레이블 폭 */
  margin-right: 15px;
  font-weight: bold;
  text-align: right;
  padding-top: 5px; /* 세로 정렬 맞춤 */
}

input,
select,
textarea {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  min-width: 0; /* 플렉스 아이템 크기 조정 */
}

textarea {
  resize: vertical;
  min-height: 60px; /* 높이 조정 */
  width: 100%; /* 가로 꽉 채우기 */
}

.button-container-middle {
  margin: 10px 0;
  text-align: right;
}

.btn-primary {
  /* background-color: #007bff; */
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
}

/* .btn-primary:hover,
.btn-secondary:hover {
  opacity: 0.9;
} */
</style>

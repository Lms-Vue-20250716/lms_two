<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref, computed } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const props = defineProps({
  detailId: { type: Number, default: 0 },
  mode: { type: String, default: 'create' }, //'create' or 'detail'
  loginId: { type: String, required: true }, // 현재 로그인한 사용자의  ID
});

// const { detaiId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
// // 클릭한 질문 항목 데이터를 여기에 바인딩
// const selectedItem = ref(null);
const selectedLecture = ref('');
// 강의명 목록을 서버에서 불러오려고 했는데, 뜨는 강의가 없어서, 수동 입력.
const lecOptions = ref([
  { value: 2, label: 'React' },
  { value: 1, label: 'Nodejs' },
  { value: 3, label: 'Vue' },
  { value: 4, label: 'Spring' },
  { value: 5, label: 'Java' },
  { value: 6, label: 'C#' },
  { value: 7, label: '요리' },
  { value: 8, label: '직접추가' },
]);
// 참조 객체
const formRef = ref();
const detail = ref({
  qnaId: 0,
  lecName: '',
  loginId: props.loginId, // 현재 로그인한 사용자의 ID
  qnaTitle: '',
  qnaContent: '',
  qnaAnswer: '',
  qnaRegDate: '',
  qnaAnswerDate: '',
});

// 신규인지 여부 판단
const isNew = computed(() => props.mode === 'create');

// 신규 모드: 입력값 초기화
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

// const title = ref('');
// const content = ref('');
// const lectureId = ref('');

// // 등록
// const registerQna = async () => {
//   try {
//     const payload = {
//       title: title.value,
//       content: content.value,
//       lectureId: lectureId.value,
//     };
//     const res = await axios.post('/api/qna/register', payload);
//     console.log('등록 성공:', res.data);
//     emit('postSuccess');
//     emit('unMountedModal');
//   } catch (err) {
//     console.error('등록 실패:', err);
//   }
// };

const fetchLectureList = async () => {
  try {
    const response = await axios.get('/support/getQnaLectureListBody.do');
    lecOptions.value = response.data.lectureList.map((item) => ({
      label: item.lecName,
      value: item.lecId,
    }));
  } catch (error) {
    console.error('강의 목록을 불러오는데 실패했습니다.', error);
  }
};

// 상세조회 (수정/답변)
const fetchDetail = async () => {
  if (props.detailId === 0) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);
  const res = await axios.post('/api/support/getQnaDetail.do', param);

  if (res.data) {
    detail.value = {
      qnaId: res.data.qnaId,
      lecId: res.data.lecId,
      lecName: res.data.lecName,
      loginId: res.data.loginId, // DB에서 가져온 작성자 ID
      qnaTitle: res.data.qnaTitle,
      qnaContent: res.data.qnaContent,
      qnaAnswer: res.data.qnaAnswer || '',
      qnaRegDate: res.data.qnaRegDate,
      qnaAnswerDate: res.data.qnaAnswerDate || '',
    };
    selectedLecture.value = res.data.lecId;
  }
};

// 권한 확인 (강사인지 체크)
const checkTeacherPermission = async () => {
  const param = new URLSearchParams();
  param.append('questionId', props.detailId);
  param.append('loginId', props.loginId);
  const res = await axios.post('/api/support/checkTeacherPermission.do', param);
  return res.data > 0;
};

// 등록/수정 처리
const handleSubmit = async () => {
  if (isNew.value && !selectedLecture.value) {
    alert('강의를 선택하세요.');
    return;
  }

  const formData = new URLSearchParams();
  formData.append('qnaId', detail.value.qnaId);
  formData.append('lecName', detail.value.lecName);
  // formData.append('loginId', props.loginId);
  formData.append('qnaTitle', detail.value.qnaTitle);
  formData.append('qnaContent', detail.value.qnaContent);

  if (!isNew.value) {
    formData.append('lecId', selectedLecture.value);
  } else {
    formData.append('qnaAnswer', detail.value.qnaAnswer);
  }

  const api = isNew.value ? '/api/support/saveQuestion.do' : '/api/support/updateAnswer.do';

  try {
    const res = await axios.post(api, formData);

    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      const isTeacher = await checkTeacherPermission();
      if (isTeacher && !isNew.value) return; // 강사이고 상세 모드일 경우 모달 유지 // 모달을 열린 상태로 유지
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

const handleDelete = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);

  try {
    const res = await axios.post('/api/support/deleteQuestion.do', param);
    if (res.data.result === 'success') {
      alert('삭제 되었습니다');
      modalState.$patch({ isOpen: false }); //false면 창이 꺼지고 true면 창이 열리는 거잖아? 이건 됐고 그...머였지. 타입? 이름을 개인걸로 지정해야 다른 분이 한거에서 모달창이 연동이 안된대...
      emit('postSuccess');
    } else {
      alert('삭제 실패');
    }
  } catch (err) {
    console.error('삭제 요청 실패:', err);
    alert('삭제 중 오류가 발생했습니다.');
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
        <h2 class="modal-title">Q&A</h2>

        <div class="modal-section border-bottom">
          <div class="form-row">
            <label>강의명</label>
            <select v-model="selectedLecture" :disabled="!isNew" required>
              <option disabled value="">클릭해서 강의 선택</option>
              <template v-if="lecOptions.length > 0">
                <option v-for="opt in lecOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                  =======
                </option>

                <option v-for="lec in lecOptions" :key="lec.lecId" :value="lec.lecId">
                  {{ lec.lecName }}
                </option>

                <option v-for="lec in lecOptions" :key="lec.lecId" :value="lec.lecId">
                  {{ lec.lecName }}
                </option>
              </template>
              <template v-else>
                <option disabled>수강중인 강의가 없습니다.</option>
              </template>
            </select>
          </div>

          <div class="form-row">
            <label>제목</label>
            <input
              v-model="detail.qnaTitle"
              type="text"
              name="qnaTitle"
              :readonly="!isNew"
              required
            />
          </div>

          <div class="form-row">
            <label>내용</label>
            <textarea
              v-model="detail.qnaContent"
              type="qnaContent"
              rows="4"
              class="textarea"
              required
            ></textarea>
          </div>
        </div>

        <!-- 답변은 detail 모드일 때만 보여줌 -->
        <div v-if="!isNew" class="modal-section">
          <h3 class="section-title">댓글</h3>

          <div class="form-row">
            <label>작성자</label>
            <input type="text" value="admin" readonly />
          </div>

          <div class="form-row">
            <label>내용</label>
            <textarea
              v-model="detail.qnaAnswer"
              name="qnaAnswer"
              rows="4"
              placeholder="답변을 입력하세요"
            ></textarea>
          </div>

          <div class="form-row">
            <label>답변일</label>
            <input
              type="text"
              :value="detail.qnaAnswerDate || new Date().toLocaleDateString()"
              readonly
            />
          </div>
        </div>

        <div class="button-container">
          <template v-if="isNew">
            <button type="button" @click="resetForm">초기화</button>
            <button type="button" @click="handleSubmit">등록</button>
          </template>
          <template v-else>
            <button type="button" @click="handleSubmit">등록</button>
            <button type="button" @click="handleDelete">삭제</button>
          </template>
          <button type="button" @click="closeModal">취소</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

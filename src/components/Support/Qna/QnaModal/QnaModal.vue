<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref, computed } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const props = defineProps({
  detailId: { type: Number, default: 0 },
  mode: { type: String, default: 'create' }, //'create' or 'detail'
});

// const { detaiId: id } = defineProps({ detailId: { type: Number, default: 0 } });

// const modalState = useModalState();
const formRef = ref();
const detail = ref({
  qnaId: 0,
  lecName: '',
  qnaTitle: '',
  qnaContent: '',
  qnaAnswer: '',
});

// 신규 모드: 입력값 초기화
const resetForm = () => {
  detail.value = {
    qnaId: 0,
    lecName: '',
    qnaTitle: '',
    qnaContent: '',
    qnaAnswer: '',
  };
};

// 강의명 목록을 서버 또는 하드코딩으로 불러올 수 있음.
const lecOptions = ref([]);
const modalState = useModalState();
// 신규인지 여부 판단
const isNew = computed(() => props.mode === 'create');

// 상세조회 (mode가 detail일 때만 호출)
const fetchDetail = async () => {
  if (props.detailId === 0) return;
  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);
  const res = await axios.post('/api/support/getQnaDetail.do', param);
  if (res.data) {
    detail.value = {
      qnaId: res.data.qnaId,
      lecName: res.data.lecName,
      qnaTitle: res.data.qnaTitle,
      qnaContent: res.data.qnaContent,
      qnaAnswer: res.data.qnaAnswer || '',
    };
  }
};

const handleSubmit = () => {
  const formData = new FormData(formRef.value);
  formData.append('qnaId', props.detailId);

  axios.post('/api/saveAnswer.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

const handleDelete = () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  const param = new URLSearchParams();
  param.append('qnaId', props.detailId);

  axios.post('/api/support/deleteQuestion.do', param).then((res) => {
    if (res.data.result === 'success') {
      alert('삭제 되었습니다');
      modalState.$patch({ isOpen: false }); //false면 창이 꺼지고 true면 창이 열리는 거잖아? 이건 됐고 그...머였지. 타입? 이름을 개인걸로 지정해야 다른 분이 한거에서 모달창이 연동이 안된대...
      emit('postSuccess');
    } else {
      alert('삭제 실패');
    }
  });
};

const closeModal = () => {
  modalState.$patch({ isOpen: false });
};

onMounted(() => {
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
            <select v-model="detail.lecName" name="lecName" required>
              <option disabled value="">클릭해서 강의 선택</option>
              <template v-if="lecOptions.length > 0">
                <option v-for="lec in lecOptions" :key="lec" :value="lec">{{ lec }}</option>
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
              requir
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
            <input type="text" :value="new Date().toLocaleDateString()" readonly />
          </div>
        </div>

        <div class="button-container">
          <template v-if="isNew">
            <button type="button" @click="resetForm">초기화</button>
            <button type="button" @click="handleSubmit">등록</button>
          </template>
          <template v-else>
            <button type="button" @click="handleDelete">삭제</button>
            <button type="button" @click="closeModal">취소</button>
          </template>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
@import './styled.css';
</style>

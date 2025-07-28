<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});
const originalDetail = ref([]); // 원래 데이터 저장용
const isDeleting = ref(false); // 삭제/취소 상태 관리

// 모달 닫기 함수
const closeModal = () => {
  modalState.$patch({ isOpen: false, type: '' });
  emit('unMountedModal', 0);
};

const handlerDelete = () => {
  if (isDeleting.value) {
    // 취소 로직: 원래 데이터로 복원
    detail.value = { ...originalDetail.value };
    isDeleting.value = false;
  } else {
    // 삭제 로직
    if (confirm('정말 삭제하시겠습니까?')) {
      const param = new URLSearchParams();
      param.append('materiId', id);

      axios.post('/api/support/deleteMtr.do', param).then((res) => {
        if (res.data.result === 'success') {
          alert('삭제 되었습니다');
          closeModal();
          emit('postSuccess');
        } else {
          alert('삭제 실패');
        }
      });
      console.log('삭제요청:', id);
    }
    isDeleting.value = true; // 삭제 후 취소 상태로 전환
  }
};

// 수정 로직 (추가)
const handlerUpdate = () => {
  const formData = new FormData(formRef.value);
  axios.post('/api/support/updateMtr.do', formData).then((res) => {
    // update API 경로 확인 필요
    if (res.data.result === 'success') {
      alert('수정 되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

// 제목 클릭시 모달창 조회
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('materiId', id);

  axios.post('/api/support/getMtrDetail.do', param).then((res) => {
    detail.value = res.data.detailValue;
    originalDetail.value = { ...res.data.detailValue }; // 초기 데이터 저장
  });
};

onMounted(() => {
  modalState.$patch({ isOpen: true, type: 'material' });
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});

watch(isDeleting, (newVal) => {
  if (!newVal && !id) detail.value = {};
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <button type="button" class="modal-close-button" @click="closeModal">닫기</button>

        <label> 강의명:<input v-model="detail.lecName" type="text" name="lecName" /> </label>
        <label> 제목:<input v-model="detail.materiTitle" type="text" name="materiTitle" /> </label>
        <label>
          내용:<input v-model="detail.materiContent" type="text" name="materiContent" />
        </label>
        파일:
        <input id="fileInput" type="file" name="file" @change="handlerFile" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>

        <div @click="downloadFile">
          <div>
            <label>미리보기</label>
            <img :src="imageUrl" class="preview-image" />
          </div>
        </div>

        <div class="button-container">
          <button v-if="id" type="button" @click="handlerDelete">
            {{ isDeleting ? '취소' : '삭제' }}
          </button>
          <button type="button" @click="closeModal">취소</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
@import './styled.css';
</style>

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detaiId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

const handlerDelete = () => {
  const param = new URLSearchParams();
  param.append('qnaId', id);
  axios.post('/api/support/deleteMtr.do', param).then((res) => {
    if (res.data.result === 'success') {
      alert('삭제 되었습니다');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    } else {
      alert('삭제 실패');
    }
  });
  console.log('삭제요청:', id);
};

// 저장 버튼 클릭시 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);

  axios.post('/api/support/saveMtr.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장 되었습니다.');
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
  });
};

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <label> 강의명:<input v-model="detail.lecName" type="text" name="lecName" /> </label>
        <label> 작성자:<input v-model="detail.loginId" type="text" name="loginId" /> </label>
        <label> 제목:<input v-model="detail.materiTitle" type="text" name="materiTitle" /> </label>
        <label>
          내용:<input v-model="detail.materiContent" type="text" name="materiContent" />
        </label>
        <div class="button-container">
          <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
            {{ !id ? '저장' : '수정' }}
          </button>
          <button v-if="id" type="button" @click="handlerDelete()">삭제</button>
          <button type="button" @click="useModalState.$patch({ isOpen: false })">나가기</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
@import './styled.css';
</style>

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detaiId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

// 저장 버튼 클릭시 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);
  formData.append('qnaId', id);

  try {
    axios.post('/api/saveAnswer.do', formData).then((res) => {
      if (res.data.result === 'success') {
        alert('삭제 되었습니다.');
      }
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    });
  } catch (error) {
    console.log(error);
  }
};

// 제목 클릭시 모달창 조회
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('qnaId', id);

  axios.post('/api/support/getQnaDetail.do', param).then((res) => {
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
        <label> 제목:<input v-model="detail.qnaTitle" type="text" name="qnaTitle" /> </label>
        <label> 내용:<input v-model="detail.qnaContent" type="text" name="fileContent" /> </label>
        <div class="button-container">
          <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
            {{ !id ? '저장' : '수정' }}
          </button>
          <button v-if="id" type="button" @click="handlerDelete()">삭제</button>""
          <button type="button" @click="useModalState.$patch({ isOpen: false })">나가기</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

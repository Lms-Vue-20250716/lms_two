<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

const handlerDelete = async () => {
  const formData = new FormData(formRef.value);
  formData.append('noticeId', id);

  try {
    await axios.post('/api/support/noticeDelete.do', formData).then((res) => {
      if (res.data.result === 'success') {
        alert('삭제 되었습니다.')
      }
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    })
  } catch (error) {
    console.log(error);
  }
}

// 저장 버튼 클릭시 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);

  axios.post('/api/support/noticeSave.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장 되었습니다.')
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  })
};

// 수정 버튼 클릭시 수정
const handlerUpdate = () => {
  const formData = new FormData(formRef.value);
  formData.append('noticeId', id);

  axios.post('/api/support/noticeUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정 되었습니다.')
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  })
}

// 제목 클릭시 모달창 조회
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('noticeId', id);

  axios.post('/api/support/noticeDetail.do', param).then((res) => {
    detail.value = res.data.detailValue;
  })
};

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
})

</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <label> 제목 :<input v-model="detail.noticeTitle" type="text" name="title" /> </label>
        <label> 내용 :<input v-model="detail.noticeContent" type="text" name="content" /> </label>
        파일 :
        <input id="fileInput" type="file" name="file" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
        <div>
          <div>
            <label>미리보기</label>
            <img class="preview-image" />
          </div>
        </div>
        <div class="button-container">
          <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">{{ !id ? '저장' : '수정' }}</button>
          <button v-if="id" type="button" @click="handlerDelete()">삭제</button>
          <button type="button" @click="modalState.$patch({ isOpen: false })">나가기</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

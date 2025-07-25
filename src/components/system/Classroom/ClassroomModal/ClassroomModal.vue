<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

// 저장
const handlerInsert = () => {
  if (!validateForm()) return;
  const formData = new FormData(formRef.value);
  axios.post('/api/system/classroomSave.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

//수정
const handlerUpdate = () => {
  if (!validateForm()) return;
  const formData = new FormData(formRef.value);
  formData.append('roomId', id);
  axios.post('/api/system/classroomUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

const handlerDelete = () => {
  const formData = new FormData(formRef.value);
  formData.append('roomId', id);
  axios.post('/api/system/classroomDelete.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('삭제되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

// 모달에 정보뜨기
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('roomId', id);
  axios.post('/api/system/classroomDetail.do', param).then((res) => {
    detail.value = res.data.detailValue;
  });
};

const validateForm = () => {
  if (!detail.value.roomName) {
    alert('강의실 이름을 입력해주세요.');
    return false;
  }
  if (!detail.value.roomPersonnel || detail.value.roomPersonnel <= 0) {
    alert('강의실 정원을 입력해주세요.');
    return false;
  }
  if (!detail.value.roomSize) {
    alert('강의실 사이즈를 입력해주세요.');
    return false;
  }
  // 비고는 선택 입력이므로 검사 제외
  return true;
};

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>
<template>
  <div class="classmodal-overlay">
    <form ref="formRef" class="classmodal-form classmodal-container">
      <h2 class="mb-4 text-center text-xl font-bold">강의실 정보</h2>
      <label
        ><span>강의실 이름<span class="required">*</span></span
        ><input v-model="detail.roomName" type="text" name="roomName" />
      </label>
      <label
        >강의실 정원
        <input v-model="detail.roomPersonnel" type="number" step="10" min="0" name="roomPersonnel"
      /></label>
      <label>강의실 사이즈 <input v-model="detail.roomSize" type="text" name="roomSize" /></label>
      <label>비고 <input v-model="detail.roomRemark" type="text" name="roomRemark" /></label>
      <div class="button-container">
        <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
          {{ !id ? '저장' : '수정' }}
        </button>
        <button v-if="id" type="button" @click="handlerDelete">삭제</button>
        <button type="button" @click="modalState.$patch({ isOpen: false })">나가기</button>
      </div>
    </form>
  </div>
</template>

<style>
@import './styled.css';
</style>

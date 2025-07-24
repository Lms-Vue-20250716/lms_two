<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: [String, Number], default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('detailCode', id);
  axios.post('/api/system/commonDetail.do', param).then((res) => {
    detail.value = res.data.detailValue;
  });
};

const handlerUpdate = () => {
  if (!validateForm()) return;
  const formData = new FormData(formRef.value);
  formData.append('oldDetailCode', id);
  formData.append('newDetailCode', detail.value.detailCode);
  axios.post('/api/system/commonUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

const validateForm = () => {
  if (!detail.value.detailCode) {
    alert('시리얼코드를 입력해주세요.');
    return false;
  }
  if (!detail.value.detailName) {
    alert('상세명을 입력해주세요.');
    return false;
  }
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
  <div class="commoncodeModal-overlay">
    <form ref="formRef" class="commoncodeModal-form commoncodeModal-container">
      <h2 class="mb-4 text-center text-xl font-bold">공통 코드</h2>
      <label>대분류 <input :value="detail.useYn" type="text" name="useYn" readonly /></label>
      <label
        >그룹코드 <input :value="detail.groupName" type="text" name="groupName" readonly
      /></label>
      <label
        ><span>시리얼코드<span class="required">*</span></span>
        <input v-model="detail.detailCode" type="text" name="detailCode"
      /></label>
      <label
        ><span>상세명<span class="required">*</span></span>
        <input v-model="detail.detailName" type="text" name="detailName"
      /></label>
      <label>번호 <input :value="detail.regId" type="text" name="regId" readonly /></label>
      <div class="button-container">
        <button type="button" @click="handlerUpdate()">수정</button>
        <button type="button" @click="modalState.$patch({ isOpen: false })">취소</button>
      </div>
    </form>
  </div>
</template>
<style>
@import './styled.css';
</style>

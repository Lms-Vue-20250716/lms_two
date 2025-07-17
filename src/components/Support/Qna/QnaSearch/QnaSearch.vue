<script setup>
import router from '@/router';
import { useModalState } from '@/stores/modalState';
import { onMounted, ref } from 'vue';

const select = ref('title');
const inputText = ref('');
// const searchTitle = ref('');
// const searchWriter = ref('');
const modalState = useModalState; // 함수 실행 잊지 말기!

const handlerSearch = () => {
  const query = [];

  if (select.value === 'title' && inputText.value) {
    query.push(`title=${inputText.value}`);
  } else if (select.value === 'writer' && inputText.value) {
    query.push(`writer=${inputText.value}`);
  }

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';

  router.push(queryString);
};

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>

<template>
  <div class="qna-container">
    <div class="input-box">
      <select v-model="select">
        <option value="title">제목</option>
        <option value="writer">작성자</option>
      </select>
      <input v-model="inputText" type="text" />
      <button @click="handlerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true })">신규</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

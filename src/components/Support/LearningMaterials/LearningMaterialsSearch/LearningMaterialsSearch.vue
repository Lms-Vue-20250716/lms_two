<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';

const select = ref('title');
const inputText = ref('');

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
  <div class="learningMaterials-container">
    <div class="input-box">
      <select v-model="select">
        <option value="title">제목</option>
        <option value="writer">작성자</option>
      </select>
      <input v-model="inputText" type="text" />
      <button @click="handlerSearch">검색</button>
    </div>
  </div>
</template>

<style scoped>
@import './styled.css';
</style>

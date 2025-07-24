<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';

const lecName = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');

// 검색 버튼을 클릭을 할때, 검색 데이터가 queryParam에 들어가게끔 하는 함수
const handlerSearch = () => {
  const query = [];

  // 1. searchTitle의 값이 있을 경우, 쿼리라는 array에 담아 둘껍니다.
  !lecName.value || query.push(`lecName=${lecName.value}`);
  !searchStDate.value || query.push(`searchStDate=${searchStDate.value}`);
  !searchEdDate.value || query.push(`searchEdDate=${searchEdDate.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';

  router.push(queryString);
};

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>

<template>
  <div class="attendance-container">
    <div class="input-box">
      강의명: <input v-model.lazy="lecName" />
      개강일자:
      <input v-model="searchStDate" type="date" />
      ~
      <input v-model="searchEdDate" type="date" />
      <button @click="handlerSearch">검색</button>
    </div>
  </div>
</template>

<style scoped>
@import './styled.css';
</style>

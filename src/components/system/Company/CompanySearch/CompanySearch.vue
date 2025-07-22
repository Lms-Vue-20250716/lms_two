<script setup>
import router from '@/router';
import { useModalState } from '@/stores/modalState';
import { onMounted, ref } from 'vue';

const searchCompanyName = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');
const modalState = useModalState();

const handlerSearch = () => {
  if (searchStDate.value && searchEdDate.value && searchStDate.value > searchEdDate.value) {
    alert('시작일이 종료일보다 늦을 수 없습니다.');
    return;
  }

  const query = [];
  !searchCompanyName.value || query.push(`companyName=${searchCompanyName.value}`);
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
  <div class="notice-container">
    <div class="input-box">
      기업이름: <input v-model.lazy="searchCompanyName" /> 가입일자:
      <input v-model="searchStDate" type="date" />
      <input v-model="searchEdDate" type="date" />
      <button @click="handlerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true })">등록</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

<script setup>
import router from '@/router';
import { useModalState } from '@/stores/modalState';
import { onMounted, ref } from 'vue';

const SearchequipName = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');
const modalState = useModalState();

// 검색 실행 함수
const handlerEquipSearch = () => {
  if (searchStDate.value && searchEdDate.value && searchStDate.value > searchEdDate.value) {
    alert('시작일이 종료일보다 늦을 수 없습니다.');
    return;
  }
  const query = [];
  !SearchequipName.value || query.push(`equipName=${SearchequipName.value}`);
  !searchStDate.value || query.push(`StDate=${searchStDate.value}`);
  !searchEdDate.value || query.push(`EdDate=${searchEdDate.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  router.push(queryString);
};

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>
<template>
  <div class="equipment-container">
    <div class="input-box">
      장비명:
      <input v-model.lazy="SearchequipName" />
      구매일자:
      <input v-model="searchStDate" type="date" />
      <input v-model="searchEdDate" type="date" />
      <button @click="handlerEquipSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true })">신규</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

<script setup>
import router from '@/router';
import { useModalState } from '@/stores/modalState';
import { onMounted, ref } from 'vue';

const searchTitle = ref('');
const searchPersonnel = ref('');
const modalState = useModalState();

const handelerSearch = () => {
  const query = [];
  !searchTitle.value || query.push(`title=${searchTitle.value}`);
  !searchPersonnel.value || query.push(`personnel=${searchPersonnel.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  // vue router에서 제공해주는 메소드... // 직접 URL넣어주기 위해 사용.
  router.push(queryString);
};

onMounted(() => {
  // search한 값이 있아면 repalce해라 (window.location.pathname)으로. 이거 console찍어보면 /vue/system/classroom이렇게 나옴.
  window.location.search && router.replace(window.location.pathname);
  console.log(window.location.pathname);
});
</script>
<template>
  <div class="classroom-container">
    <div class="input-box">
      강의실 이름: <input v-model.lazy="searchTitle" /> 강의실 정원:
      <input v-model.lazy="searchPersonnel" type="number" step="10" min="0" />
      <button @click="handelerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true })">등록</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

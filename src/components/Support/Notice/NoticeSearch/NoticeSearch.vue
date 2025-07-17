<script setup>
import router from '@/router';
import { useModalState } from '@/stores/modalState';
import { onMounted, ref } from 'vue';

const searchTitle = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');
const modalState = useModalState();

//검색 버튼 클릭 할 시에 검색 data가 queryParm에 들어가게끔 하는 함수.
const handelerSearch = () => {
  const query = [];
  // searchTitle의 값이 있는 경우 쿼리라는 array에 담아둘거다.
  !searchTitle.value || query.push(`title=${searchTitle.value}`);
  !searchStDate.value || query.push(`startDate=${searchStDate.value}`);
  !searchEdDate.value || query.push(`endDate=${searchEdDate.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  // vue router에서 제공해주는 메소드... // 직접 URL넣어주기 위해 사용.
  router.push(queryString);
};

onMounted(() => {
  // search한 값이 있아면 repalce해라 (window.location.pathname)으로. 이거 console찍어보면 /vue/support/notice이렇게 나옴.
  window.location.search && router.replace(window.location.pathname);
});
</script>

<template>
  <div class="notice-container">
    <div class="input-box">
      <!-- lazy: title에 입력을 할 때마다 랜더링될텐데 포커스를 잃었을 때만 ref에 값이 저장되어라. -->
      제목: <input v-model.lazy="searchTitle" />
      <input v-model="searchStDate" type="date" />
      <input v-model="searchEdDate" type="date" />
      <button @click="handelerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true })">등록</button>
    </div>
  </div>
</template>

<!-- style scoped는 해당 컴포넌트에서만 스타일을 적용시키는 방법이다.
    그러나, scoped는 컴파일 시점에 고유한 속성을 컴포넌트 요소에 추가하는데,
    외부 css 파일은 이 고유 속성을 알지 못하므로 스타일이 적용안된다.

    scoped을 사용하지 않고, css파일을 import 하거나, <style scoped> 안에 css를 구성해야한다.
-->
<style>
@import './styled.css';
</style>

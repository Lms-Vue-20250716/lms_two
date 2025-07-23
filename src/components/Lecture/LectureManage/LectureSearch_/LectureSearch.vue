<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';

const searchTag = ref('lecName');
const searchTitle = ref('');
const searchStDate = ref('');
const searchEdDate = ref('');

// 검색 버튼을 클릭을 할때, 검색 데이터가 queryParam에 들어가게끔 하는 함수
const handlerSearch = () => {
  if (searchTag.value == '' || searchTag.value == undefined || searchTag.value == null) {
    alert('검색 옵션을 넣으세요!');
    return;
  }
  if (searchStDate.value && searchEdDate.value) {
    const from = new Date(searchStDate.value);
    const to = new Date(searchEdDate.value);

    if (to < from) {
      alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
      return;
    }
  }

  const query = [];

  // 1. searchTitle의 값이 있을 경우, 쿼리라는 array에 담아 둘껍니다.
  !searchTag.value || query.push(`searchTag=${searchTag.value}`);
  !searchTitle.value || query.push(`searchTitle=${searchTitle.value}`);
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
  <div class="lecture-container">
    <div class="input-box">
      <select v-model="searchTag">
        <option value="lecName">강의명</option>
        <option value="lecInstructorName">강사명</option>
        <option value="lecRoomName">강의실</option>
      </select>
      제목: <input v-model.lazy="searchTitle" />
      <input v-model="searchStDate" type="date" />
      <input v-model="searchEdDate" type="date" />
      <button @click="handlerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true, type: 'lecture-manage-register' })">
        신규
      </button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

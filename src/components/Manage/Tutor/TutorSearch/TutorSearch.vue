<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';


const searchName = ref('');
const searchStatusYn = ref('');
const regStDate = ref('');
const regEdDate = ref('');

// 검색 버튼을 클릭할 때, 검색 데이터가 QueryParam에 들어가도록 하는 함수
const handlerSearch = () => {
  // 가입 기간 날짜 검증
  if (regStDate.value && regEdDate.value) {
    const startDate = new Date(regStDate.value);
    const endDate = new Date(regEdDate.value);
    
    if (startDate > endDate) {
      alert('가입 기간의 시작일이 종료일보다 늦습니다. 날짜를 다시 확인해주세요.');
      return;
    }
  }

  const query = [];

  // 1. searchTitle의 값이 있을 경우, 쿼리라는 array에 담아둠
  searchName.value && query.push(`searchName=${searchName.value}`);
  searchStatusYn.value && query.push(`searchStatusYn=${searchStatusYn.value}`);
  regStDate.value && query.push(`regStDate=${regStDate.value}`);
  regEdDate.value && query.push(`regEdDate=${regEdDate.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';

  router.push(queryString);
};

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>

<template>
  <div class="tutor-container">
    <div class="input-box">
      이름: <input v-model.lazy="searchName" />
      재직 상태: <select v-model="searchStatusYn">
        <option value selected="selected"> 선택 </option>
        <option value="W"> 승인대기중 </option>
        <option value="Y"> 재학 </option>
        <option value="N"> 탈퇴 </option>
      </select>
      가입 기간: <input v-model="regStDate" type="date" />
      ~ <input v-model="regEdDate" type="date" />
      <button @click="handlerSearch">검색</button>
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

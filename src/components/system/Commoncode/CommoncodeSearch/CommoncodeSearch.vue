<script setup>
import router from '@/router';
import { onMounted, ref } from 'vue';

const searchuseYn = ref('');
const searchgroupName = ref('');
const searchDetailCode = ref('');

const handelerSearch = () => {
  const query = [];
  !searchuseYn.value || query.push(`commonGroup=${searchuseYn.value}`);
  !searchgroupName.value || query.push(`groupCode=${searchgroupName.value}`);
  !searchDetailCode.value || query.push(`detailCode=${searchDetailCode.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  // vue router에서 제공해주는 메소드 // 직접 URL넣어주기 위해 사용.
  router.push(queryString);
};

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
});
</script>
<template>
  <div class="commoncode-container">
    <div class="input-box">
      분류:
      <select v-model="searchuseYn">
        <option value="">분류란을 선택하세요</option>
        <option value="equip">장비</option>
        <option value="loc">지역</option>
      </select>
      그룹코드:
      <select v-model.lazy="searchgroupName">
        <option value="">그룹코드를 선택하세요</option>
        <option value="com">컴퓨터</option>
        <option value="ms">마우스</option>
        <option value="msp">마우스패드</option>
        <option value="kb">키보드</option>
        <option value="mt">모니터</option>
        <option value="dk">책상</option>
        <option value="chr">의자</option>
        <option value="wb">화이트보드</option>
        <option value="etc">기타</option>
      </select>
      시리얼코드:
      <input v-model.lazy="searchDetailCode" />
      <button @click="handelerSearch">검색</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

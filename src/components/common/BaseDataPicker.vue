<!-- 날짜를 선택하는 UI 요소입니다. 실제 프로젝트에서는 v-calendar나 Element Plus 같은 외부 라이브러리를 감싸서(Wrapping) 만들지만, 여기서는 브라우저 기본 <input type="date">를 사용한 간단한 예시를 보여드립니다. -->

<script setup>
const model = defineModel();
</script>

<template>
  <input type="date" class="base-date-picker" v-model="model" />
</template>

<style scoped>
.base-date-picker {
  padding: 7px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: sans-serif;
  font-size: 14px;
}
</style>

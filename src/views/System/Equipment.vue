<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import ClassroomEqMain from '@/components/system/Equipment/ClassroomEqMain/ClassroomEqMain.vue';
import ClassroomEqSearch from '@/components/system/Equipment/ClassroomEqSearch/ClassroomEqSearch.vue';
</script>

<template>
  <ContentBox>장비 정보</ContentBox>
  <ClassroomEqSearch></ClassroomEqSearch>
  <ClassroomEqMain></ClassroomEqMain>
</template>

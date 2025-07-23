<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import LectureMain from '@/components/Lecture/LectureList/LectureMain_/LectureMain.vue';
import LectureSearch from '@/components/Lecture/LectureList/LectureSearch_/LectureSearch.vue';
</script>
<template>
  <ContentBox>강의 목록</ContentBox>
  <LectureSearch />
  <LectureMain />
</template>

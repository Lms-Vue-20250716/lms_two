<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import LectureMain from '@/components/Lecture/LectureManage/LectureMain_/LectureMain.vue';
import LectureSearch from '@/components/Lecture/LectureManage/LectureSearch_/LectureSearch.vue';
</script>
<template>
  <ContentBox>강의 목록 관리</ContentBox>
  <LectureSearch />
  <LectureMain />
</template>

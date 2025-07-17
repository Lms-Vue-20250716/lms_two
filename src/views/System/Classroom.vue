<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import ClassroomMian from '@/components/system/Classroom/ClassroomMain/ClassroomMian.vue';
import ClassroomSearch from '@/components/system/Classroom/ClassroomSearch/ClassroomSearch.vue';
</script>

<template>
  <ContentBox>강의실 정보</ContentBox>
  <ClassroomSearch />
  <ClassroomMian />
</template>

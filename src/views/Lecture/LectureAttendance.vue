<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import AttendanceMain from '@/components/Lecture/AttendenceManage/AttendanceMain/AttendanceMain.vue';
import AttendanceSearch from '@/components/Lecture/AttendenceManage/AttendanceSearch/AttendanceSearch.vue';
</script>
<template>
  <ContentBox>출결관리</ContentBox>
  <AttendanceSearch />
  <AttendanceMain />
</template>

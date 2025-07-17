<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import ManageSurveyMain from '@/components/Support/ManageSurvey/ManageSurveyMain/ManageSurveyMain.vue';
import ManageSurveySearch from '@/components/Support/ManageSurvey/ManageSurveySearch/ManageSurveySearch.vue';
</script>

<template>
  <ContentBox>설문 조사 관리</ContentBox>
  <ManageSurveySearch />
  <ManageSurveyMain />
</template>

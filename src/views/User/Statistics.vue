<template>
  <ContentBox>강의 통계</ContentBox>
  <StatisticSearch />
  <StatisticsMain />
</template>

<script setup>
import ContentBox from '@/components/common/ContentBox.vue';
import StatisticsMain from '@/components/User/Statistics/StatisticsMain/StatisticsMain.vue';
import StatisticSearch from '@/components/User/Statistics/StatisticsSearch/StatisticSearch.vue';
</script>

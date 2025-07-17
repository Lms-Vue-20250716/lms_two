<script setup lang="ts">
import ContentBox from '@/components/common/ContentBox.vue';
import EquipmentMain from '@/components/system/Equipment/EquipmentMain/EquipmentMain.vue';
import EquipmentSearch from '@/components/system/Equipment/EquipmentSearch/EquipmentSearch.vue';
</script>

<template>
  <ContentBox>장비 정보</ContentBox>
  <EquipmentSearch />
  <EquipmentMain />
</template>

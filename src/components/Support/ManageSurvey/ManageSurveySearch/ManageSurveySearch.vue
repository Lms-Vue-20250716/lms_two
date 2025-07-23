<script setup>
import { reactive } from 'vue';

defineProps(['selectedTab']);

const searchParams = reactive({
  keyword: '',
});
</script>

<template>
  <div class="search-box">
    <div class="tabs">
      <button
        :class="{ active: selectedTab === 'completed' }"
        @click="$emit('change-tab', 'completed')"
      >
        설문 완료 목록 조회
      </button>

      <button :class="{ active: selectedTab === 'result' }" @click="$emit('change-tab', 'result')">
        설문 결과 조회
      </button>
    </div>

    <div class="search-fields">
      <input v-model="searchParams.keyword" placeholder="설문     결과조회" />
      <button @click="$emit('search', searchParams)">검색</button>
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

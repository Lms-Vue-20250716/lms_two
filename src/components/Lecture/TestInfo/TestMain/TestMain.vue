<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import TestModal from '../TestModal/TestModal.vue';

const route = useRoute();
const testList = ref([]);
const testCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const testSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/support/testListBody.do', param).then((res) => {
    testList.value = res.data.list;
    testCount.value = res.data.count;
  });
};

const testDetail = (id) => {
  modalState.$patch({ isOpen: true, type: 'test' });
  detailId.value = id;
};

watch(
  () => route.query,
  () => {
    testSearch();
  },
);

onMounted(() => {
  testSearch();
});
</script>

<template>
  <div class="test-main-container">
    <table class="test-table">
      <thead class="test-table-header">
        <tr>
          <th>공지번호</th>
          <th>공지 제목</th>
          <th>공지 날짜</th>
          <th>작성자</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="testCount > 0">
          <tr v-for="test in testList" :key="test.testId" class="test-table-row">
            <td class="test-cell">{{ test.testId }}</td>
            <td class="test-cell cursor-pointer hover:underline" @click="testDetail(test.testId)">
              {{ test.testTitle }}
            </td>
            <td class="test-cell">{{ test.regDate.substr(0, 10) }}</td>
            <td class="test-cell">{{ test.loginId }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="test-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="testCount" :items-per-page="5" :on-page-change="testSearch" />
  </div>
  <TestModal
    v-if="modalState.isOpen && modalState.type === 'test'"
    :detail-id
    @post-success="testSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
/* @import './styled.css'; */
</style>

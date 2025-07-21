<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import TestRegister from '../TestModal/TestRegister.vue';
import TestUpdate from '../TestModal/TestUpdate.vue';

const route = useRoute();
const testList = ref([]);
const testCount = ref(0);
const modalState = useModalState();
// const detailId = ref(0);
const selectedTestData = ref(null);

const testSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/lecture/testInfoListBody.do', param).then((res) => {
    testList.value = res.data.list;
    testCount.value = res.data.count;

    console.log('&&&&&&&&&&&&&&&&&&&');
    console.log(res.data);
  });
};

const testDetail = (selectedLecId) => {
  selectedTestData.value = testList.value.find((lecture) => lecture.lecId == selectedLecId);
  modalState.$patch({ isOpen: true, type: 'test-update' });
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
          <th>강의</th>
          <th>강사</th>
          <th>강의실</th>
          <th>시험 시작일</th>
          <th>시험 종료일</th>
          <th>시험 등록일</th>
          <th>시험문제보기</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="testCount > 0">
          <tr v-for="test in testList" :key="test.testId" class="test-table-row">
            <td class="test-cell cursor-pointer hover:underline" @click="testDetail(test.lecId)">
              {{ test.lecName }}
            </td>
            <td class="test-cell">
              {{ test.lecInstructorName }}
            </td>
            <td class="test-cell">
              {{ test.lecRoomName }}
            </td>
            <td class="test-cell">{{ test.testBeginDate.substr(0, 19) }}</td>
            <td class="test-cell">{{ test.testEndDate.substr(0, 19) }}</td>
            <td class="test-cell">{{ test.testRegDate.substr(0, 10) }}</td>
            <td class="test-cell">시험문제보기</td>
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
  <TestRegister
    v-if="modalState.isOpen && modalState.type === 'test-create'"
    @test-post-success="testSearch()"
  />
  <TestUpdate
    v-if="modalState.isOpen && modalState.type === 'test-update'"
    :lectureData="selectedTestData"
    @test-update-success="testSearch()"
  />
</template>

<style>
/* @import './styled.css'; */
</style>

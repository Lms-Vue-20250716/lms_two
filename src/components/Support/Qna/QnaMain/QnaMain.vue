<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import QnaModal from '../QnaModal/QnaModal.vue';
import { onMounted } from 'vue';
import { watch } from 'vue';
import axios from 'axios';

const route = useRoute();
const qnaList = ref([]); // ref([])에서 []는 초깃값이고, 빈 배열로 시작하되 나중에 목록 데이터를 넣겠다는 의도
const qnaCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const qnaSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/support/getQnaListBody.do', param).then((res) => {
    qnaList.value = res.data.list;
    qnaCount.value = res.data.count;
  });
};

onMounted(() => {
  qnaSearch();
});

const qnaDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => route.query,
  () => {
    qnaSearch();
  },
);
</script>

<template>
  <div class="qna-main-container">
    <table class="qna-table">
      <thead class="qna-table-header">
        <tr>
          <th>No.</th>
          <th>강의명</th>
          <th>제목</th>
          <th>작성일</th>
          <th>작성자</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="qnaCount > 0">
          <tr v-for="qna in qnaList" :key="qna.qnaId" class="qna-table-row">
            <td class="qna-cell">{{ qna.qnaId }}</td>
            <td class="qna-cell">{{ qna.lecName }}</td>
            <td class="qna-cell cursor-pointer hover:underline" @click="qnaDetail(qna.qnaId)">
              {{ qna.qnaTitle }}
            </td>
            <td class="qna-cell">{{ qna.qnaAnswerDate }}</td>
            <td class="qna-cell">{{ qna.qnaAnswerWriter }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="qna-empty-row">일치하는 QnA가 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="qnaCount" :items-per-page="5" :on-page-change="qnaSearch" />
  </div>
  <QnaModal
    v-if="modalState.isOpen"
    :detail-id="detailId"
    @post-success="qnaSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import QnaModal from '../QnaModal/QnaModal.vue';
import { onMounted } from 'vue';
import { watch } from 'vue';
import axios from 'axios';
import QnaSearch from '../QnaSearch/QnaSearch.vue';

const route = useRoute();
const qnaList = ref([]); // ref([])에서 []는 초깃값이고, 빈 배열로 시작하되 나중에 목록 데이터를 넣겠다는 의도
const qnaCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);
const modalMode = ref('create');

const formatDateTime = (rawDate) => {
  if (!rawDate) return '-';
  const date = new Date(rawDate);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const qnaSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/support/getQnaListBody.do', param).then((res) => {
    qnaList.value = res.data.list;
    console.log('qnaList:', qnaList.value);
    qnaCount.value = res.data.count;
  });
};

onMounted(() => {
  qnaSearch();
});

const openDetailModal = (id) => {
  detailId.value = id;
  modalMode.value = 'detail';
  modalState.$patch({ isOpen: true, type: 'qna' });
};

const openCreateModal = () => {
  detailId.value = 0;
  modalMode.value = 'create';
  modalState.$patch({ isOpen: true, type: 'qna' });
};

watch(
  () => route.query,
  () => {
    qnaSearch();
  },
);
</script>

<template>
  <!-- QnaSearch 컴포넌트, 이벤트 연결 -->
  <QnaSearch @open-create-modal="openCreateModal" />

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
            <td class="qna-cell cursor-pointer hover:underline" @click="openDetailModal(qna.qnaId)">
              {{ qna.qnaTitle }}
            </td>
            <td class="qna-cell">{{ qna.qnaRegDate ? formatDateTime(qna.qnaRegDate) : '-' }}</td>
            <td class="qna-cell">{{ qna.loginId || '-' }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="5" class="qna-empty-row">일치하는 QnA가 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="qnaCount" :items-per-page="5" :on-page-change="qnaSearch" />
  </div>

  <QnaModal
    v-if="modalState.isOpen && modalState.type === 'qna'"
    :detail-id="detailId"
    :mode="modalMode"
    :login-id="loginId"
    @post-success="qnaSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style scoped>
@import './styled.css';
</style>

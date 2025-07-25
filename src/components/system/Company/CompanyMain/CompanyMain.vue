<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CompanyModal from '../CompanyModal/CompanyModal.vue';

const route = useRoute();
const companyList = ref([]);
const companyCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const companySearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/system/companyListBody.do', param).then((res) => {
    companyList.value = res.data.list;
    companyCnt.value = res.data.count;
  });
};

const companyDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '-')
    .replace('.', '');
};

watch(
  () => {
    return route.query;
  },
  () => {
    companySearch();
  },
);

onMounted(() => {
  companySearch();
});
</script>
<template>
  <div class="company-main-container">
    <table class="company-table">
      <thead class="company-table-header">
        <tr>
          <th>번호</th>
          <th>회사명</th>
          <th>대표명</th>
          <th>휴대전화</th>
          <th>주소</th>
          <th>이메일</th>
          <th>가입일자</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="companyCnt > 0">
          <tr v-for="company in companyList" :key="company.companyId" class="company-table-row">
            <td class="company-cell">{{ company.companyId }}</td>
            <td
              class="company-cell cursor-pointer !font-bold hover:underline"
              @click="companyDetail(company.companyId)"
            >
              {{ company.companyName }}
            </td>
            <td class="company-cell">{{ company.companyCeo }}</td>
            <td class="company-cell">{{ company.companyHp }}</td>
            <td class="company-cell">{{ company.companyLoc }}</td>
            <td class="company-cell">{{ company.companyEmail }}</td>
            <td class="company-cell">{{ formatDate(company.companyRegDate) }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="7" class="company-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="companyCnt" :items-per-page="5" :on-page-change="companySearch" />
  </div>
  <CompanyModal
    v-if="modalState.isOpen"
    :detail-id
    @post-success="companySearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

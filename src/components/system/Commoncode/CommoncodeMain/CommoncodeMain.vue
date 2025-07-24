<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import CommoncodeModal from '../CommoncodeModal/CommoncodeModal.vue';

const route = useRoute();
const commonList = ref([]);
const commonCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const commonSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/system/commonListJson.do', param).then((res) => {
    commonList.value = res.data.list;
    commonCnt.value = res.data.CommonCnt;
  });
};

const commonDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => {
    return route.query;
  },
  () => {
    commonSearch();
  },
);
onMounted(() => {
  commonSearch();
});
</script>
<template>
  <div class="commoncode-main-container">
    <table class="commoncode-table">
      <thead class="commoncode-table-header">
        <tr>
          <th>대분류</th>
          <th>그룹코드</th>
          <th>상세코드</th>
          <th>상세명</th>
          <th>번호</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="commonCnt > 0">
          <tr v-for="common in commonList" :key="common.detailCode" class="commoncode-table-row">
            <td class="commoncode-cell">
              {{
                common.useYn === 'equip' ? '장비' : common.useYn === 'loc' ? '지역' : common.useYn
              }}
            </td>
            <td class="commoncode-cell">
              {{ common.groupName }}
            </td>
            <td class="commoncode-cell">
              {{ common.detailCode }}
            </td>
            <td
              class="commoncode-cell cursor-pointer font-bold hover:underline"
              @click="commonDetail(common.detailCode)"
            >
              {{ common.detailName }}
            </td>
            <td class="commoncode-cell">{{ common.regId }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="commoncode-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="commonCnt" :items-per-page="5" :on-page-change="commonSearch" />
  </div>
  <CommoncodeModal
    v-if="modalState.isOpen"
    :detail-id
    @post-success="commonSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

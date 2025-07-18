<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { watch } from 'vue';
import axios from 'axios';
import LearningMaterialsModal from '../LearningMaterialsModal/LearningMaterialsModal.vue';

const route = useRoute();
const learningMaterialsList = ref([]); // ref([])에서 []는 초깃값이고, 빈 배열로 시작하되 나중에 목록 데이터를 넣겠다는 의도
const learningMaterialsCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const learningMaterialsSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/support/getMtrListBody.do', param).then((res) => {
    learningMaterialsList.value = res.data.list;
    learningMaterialsCount.value = res.data.count;
  });
};

onMounted(() => {
  learningMaterialsSearch();
});

const learningMaterialsDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => route.query,
  () => {
    learningMaterialsSearch();
  },
);
</script>

<template>
  <div class="learningMaterials-main-container">
    <table class="learningMaterials-table">
      <thead class="learningMaterials-table-header">
        <tr>
          <th>강의명</th>
          <th>작성자</th>
          <th>제목</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="learningMaterialsCount > 0">
          <tr
            v-for="learningMaterials in learningMaterialsList"
            :key="learningMaterials.materiId"
            class="learningMaterials-table-row"
          >
            <td class="learningMaterials-cell">{{ learningMaterials.lecName }}</td>
            <td class="learningMaterials-cell">{{ learningMaterials.loginId }}</td>
            <td
              class="learningMaterials-cell cursor-pointer hover:underline"
              @click="learningMaterialsDetail(learningMaterials.materiId)"
            >
              {{ learningMaterials.materiTitle }}
            </td>
            <td class="learningMaterials-cell">{{ learningMaterials.materiDate }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="learningMaterials-empty-row">데이터가 존재하지 않습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="learningMaterialsCount"
      :items-per-page="5"
      :on-page-change="learningMaterialsSearch"
    />
  </div>
  <LearningMaterialsModal
    v-if="modalState.isOpen"
    :detail-id="detailId"
    @post-success="learningMaterialsSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style scoped>
@import './styled.css';
</style>

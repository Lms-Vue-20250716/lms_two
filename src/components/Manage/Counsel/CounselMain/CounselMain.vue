<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import CounselModal from '../CounselModal/CounselModal.vue';
const route = useRoute();
const counselList = ref([]);
const lectureList = ref([]);
const counselCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

/** ----------------------------------------------- */

const counselSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  console.log(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  try {
    const res = await axios.post('/api/manage/getCounselListBody.do', param)
    counselList.value = res.data.counselList;
    counselCnt.value = res.data.counselCnt;
    lectureList.value = res.data.lectures;
  } catch (error) {
    console.log(error);
  }
};


onMounted(() => {
  counselSearch();
});

const counselDetail = (id) => {
  modalState.$patch({ isOpen: true, type: "counsel" })
  detailId.value = id;
}

watch(
  () => route.query,
  () => {
    counselSearch()
  },
)

</script>

<template>
  <div class="counsel-main-container">
    <table class="counsel-table">
      <thead class="counsel-table-header">
        <tr>
          <th>No.</th>
          <th>상담 과목</th>
          <th>상담 제목</th>
          <th>상담 학생</th>
          <th>상담 일</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="counselCnt > 0">
          <tr v-for="counsel in counselList" :key="counsel.counselId" class="counsel-table-row">
            <td class="counsel-cell">{{ counsel.counselId }}</td>
            <td class="counsel-cell">{{ counsel.lecName }}</td>
            <td class="counsel-cell cursor-pointer hover:underline" @click="counselDetail(counsel.counselId)">{{
              counsel.counselTitle }}</td>
            <td class="counsel-cell">{{ counsel.counselStudentName }}</td>
            <td class="counsel-cell">{{ counsel.counselRegDate.substr(0, 10) }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="5" class="counsel-empty-row">데이터가 존재하지 않습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="counselCnt" :items-per-page="5" :on-page-change="counselSearch" />
  </div>
  <CounselModal v-if="modalState.isOpen && modalState.type === 'counsel'" :detail-id="detailId"
    :lecture-list="lectureList" @post-success="counselSearch()" @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

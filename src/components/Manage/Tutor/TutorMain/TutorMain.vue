<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import TutorModal from '../TutorModal/TutorModal.vue';
const route = useRoute();
const tutorList = ref([]);
const tutorCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

/** ----------------------------------------------- */

const updateStatusYn = async (e, tutor) => {
  const tutorId = tutor.insId;
  const param = {
    tutorStatus: e.target.value,
    tutorId: tutorId
  };
  if (confirm('재직 상태를 변경하시겠습니까?')) {
    try {
      const res = await axios.post('/api/manage/update-ins-status', param);
      if (res.data === 'SUCCESS') {
        alert('재직상태가 변경되었습니다.');
      } else {
        alert('재직상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

const tutorSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  console.log(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  try {
    const res = await axios.post('/api/manage/tutorListBody.do', param)
    tutorList.value = res.data.list;
    tutorCount.value = res.data.count;
  } catch (error) {
    console.log(error);
  }
};


onMounted(() => {
  tutorSearch();
});

const tutorDetail = (id) => {
  modalState.$patch({ isOpen: true, type: "tutor" })
  detailId.value = id;
}

watch(
  () => route.query,
  () => {
    tutorSearch()
  },
)

</script>

<template>
  <div class="tutor-main-container">
    <table class="tutor-table">
      <thead class="tutor-table-header">
        <tr>
          <th>강사번호</th>
          <th>이름</th>
          <th>연락처</th>
          <th>가입일자</th>
          <th>재직상태</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="tutorCount > 0">
          <tr v-for="tutor in tutorList" :key="tutor.insId" class="tutor-table-row">
            <td class="tutor-cell">{{ tutor.insNumber }}</td>
            <td class="tutor-cell cursor-pointer hover:underline" @click="tutorDetail(tutor.insId)">{{
              tutor.insName }}</td>
            <td class="tutor-cell">{{ tutor.insHp }}</td>
            <td class="tutor-cell">{{ tutor.insRegDate.substr(0, 10) }}</td>
            <td class="tutor-cell">
              <select @change="updateStatusYn($event, tutor)" v-model="tutor.insStatusYn">
                <option value="W">승인 대기중</option>
                <option value="Y">재직</option>
                <option value="N">탈퇴</option>
              </select>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="5" class="tutor-empty-row">일치하는 강사가 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="tutorCount" :items-per-page="5" :on-page-change="tutorSearch" />
  </div>
  <TutorModal v-if="modalState.isOpen && modalState.type === 'tutor'" :detail-id="detailId"
    @post-success="tutorSearch()" @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

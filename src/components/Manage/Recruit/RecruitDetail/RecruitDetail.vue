<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import RecruitModal from '../RecruitModal/RecruitModal.vue';

const props = defineProps({
  loginId: String
});

const route = useRoute();
const recruitList = ref([]);
const recruitCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

/** ----------------------------------------------- */

const recruitSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  console.log(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);
  param.append('loginID', props.loginId);

  try {
    const res = await axios.post('/api/manage/RecruitDetailBody.do', param)
    recruitList.value = res.data.list;
    recruitCnt.value = res.data.count;
  } catch (error) {
    console.log(error);
  }
};

const recruitDetail = (empId) => {
  modalState.$patch({ isOpen: true, type: "recruit" })
  detailId.value = empId;
}

// 클릭이 되고, loginId가 변경되면 함수 실행
watch(
  () => props.loginId,
  (newLoginId) => {
    if (newLoginId) {
      recruitSearch();
    }
  },
  { immediate: true }
)

</script>

<template>
  <div class="recruit-main-container">
    <table class="recruit-table">
      <thead class="recruit-table-header">
        <tr>
          <th>번호</th>
          <th>학생명</th>
          <th>입사일</th>
          <th>퇴사일</th>
          <th>업체명</th>
          <th>재직여부</th>
          <th>-</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="recruitCnt > 0">
          <tr v-for="recruit in recruitList" :key="recruit.empId" class="recruit-table-row">
            <td class="recruit-cell">{{ recruit.empId }}</td>
            <td class="recruit-cell cursor-pointer hover:underline" @click="recruitDetail(recruit.empId)">{{
              recruit.studentName }}</td>
            <td class="recruit-cell ">
              {{ recruit.empJoinDate ? recruit.empJoinDate : '-' }}
            </td>
            <td class="recruit-cell">
              {{ recruit.empRetireDate ? recruit.empRetireDate : '-' }}
            </td>
            <td class="recruit-cell">{{ recruit.empName }}</td>
            <td class="recruit-cell">
              <span>{{ recruit.studentsEmpStatus === 'Y' ? '취업' : '퇴직' }}</span>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="6" class="recruit-empty-row">데이터가 존재하지 않습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="recruitCnt" :items-per-page="5" :on-page-change="recruitSearch" />
  </div>
  <RecruitModal v-if="modalState.isOpen && modalState.type === 'recruit'" :detail-id="detailId" :login-id="loginId"
    @post-success="recruitSearch()" @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

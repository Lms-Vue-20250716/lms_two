<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import RecruitModal from '../RecruitModal/RecruitModal.vue';
import NewRecruit from '../RecruitModal/NewRecruit.vue';

const props = defineProps({
  loginId: String
});

const route = useRoute();
const recruitList = ref([]);
const recruitCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);
const emit = defineEmits(['refreshMain']);

/** ----------------------------------------------- */

const detailSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
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

const retireGoGo = async (studentId) => {
  const param = new URLSearchParams(route.query);
  param.append('loginID', studentId);

  try {
    const res = await axios.post('/api/manage/RetireStudent.do', param)
    if (res.data.result === 'success') {
      alert('퇴직되었습니다.');
      detailSearch();
      emit('refreshMain');
    }
  } catch (error) {
    console.log(error);
  }
}

const newRecruit = () => {
  modalState.$patch({ isOpen: true, type: "newRecruit" })
}

const recruitDetail = (empId) => {
  modalState.$patch({ isOpen: true, type: "recruit" })
  detailId.value = empId;
}

// 클릭이 되고, loginId가 변경되면 함수 실행
watch(
  () => props.loginId,
  (newLoginId) => {
    if (newLoginId) {
      detailSearch();
    }
  },
  { immediate: true }
)

</script>

<template>

  <div class="recruit-main-container">
    <div class="w-full max-w-6xl">
      <div class="text-right mb-4">
        <button @click="newRecruit()" type="button"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          신규
        </button>
      </div>
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
              <span>{{ recruit.empRetireDate ? '퇴직' : '취업' }}</span>
            </td>
            <td class="recruit-cell">
              <button type="button" @click="retireGoGo(recruit.loginID)"
                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                :disabled="recruit.empRetireDate" :class="{ 'opacity-50 cursor-not-allowed': recruit.empRetireDate }">
                퇴직
              </button>
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
      <PageNavigation :total-items="recruitCnt" :items-per-page="5" :on-page-change="detailSearch" />
    </div>
  </div>
  <RecruitModal v-if="modalState.isOpen && modalState.type === 'recruit'" :detail-id="detailId" :login-id="loginId"
    @post-success="detailSearch(); emit('refreshMain')" @un-mounted-modal="detailId = $event" />
  <NewRecruit v-if="modalState.isOpen && modalState.type === 'newRecruit'" :login-id="loginId"
    @post-success="detailSearch(); emit('refreshMain')" @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

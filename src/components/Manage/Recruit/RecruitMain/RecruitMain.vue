<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import RecruitDetail from '../RecruitDetail/RecruitDetail.vue';

const route = useRoute();
const recruitList = ref([]);
const recruitCnt = ref(0);
const loginId = ref('');
const showDetail = ref(false);

/** ----------------------------------------------- */

const recruitSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  try {
    const res = await axios.post('/api/manage/recruitListBody.do', param)
    recruitList.value = res.data.list;
    recruitCnt.value = res.data.count;
  } catch (error) {
    console.log(error);
  }
};

const recruitDetail = (selectedLoginId) => {
  showDetail.value = true;
  loginId.value = selectedLoginId;
}

onMounted(() => {
  recruitSearch();
});

watch(
  () => route.query,
  () => {
    recruitSearch()
  },
)

</script>

<template>
  <div class="recruit-main-container">
    <table class="recruit-table">
      <thead class="recruit-table-header">
        <tr>
          <th>로그인ID</th>
          <th>학생명</th>
          <th>입사일</th>
          <th>퇴사일</th>
          <th>업체명</th>
          <th>재직여부</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="recruitCnt > 0">
          <tr v-for="recruit in recruitList" :key="recruit.empId" class="recruit-table-row">
            <td class="recruit-cell">{{ recruit.loginID }}</td>
            <td class="recruit-cell cursor-pointer hover:underline" @click="recruitDetail(recruit.loginID)">{{
              recruit.studentName }}</td>
            <td class="recruit-cell ">
              {{ recruit.empJoinDate ? recruit.empJoinDate : '-' }}
            </td>
            <td class="recruit-cell">
              {{ recruit.empRetireDate ? recruit.empRetireDate : '-' }}
            </td>
            <td class="recruit-cell">{{ recruit.empName }}</td>
            <td class="recruit-cell">
              <span>{{ recruit.studentsEmpStatus === 'Y' ? '취업' : '실업' }}</span>
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
  <RecruitDetail v-if="showDetail" :login-id="loginId" @refresh-main="recruitSearch()" />
</template>

<style>
@import './styled.css';
</style>

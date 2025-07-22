<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import TestRegister from '../TestModal/TestRegister.vue';
import TestUpdate from '../TestModal/TestUpdate.vue';
import TestDetail from '../TestModal/TestDetail.vue';
import { useUserInfo } from '@/stores/loginInfoState';

// --- 로그인 정보 가져오기 ---
const userInfoStore = useUserInfo();
// computed를 사용해 user 객체가 null일 때도 에러 없이 안전하게 값을 가져옴
const loginId = computed(() => userInfoStore.user?.loginId);
const userType = computed(() => userInfoStore.user?.userType);

// --- router
const route = useRoute();

// --- 게시판
const testList = ref([]);
const testCount = ref(0);

// -- modal
const modalState = useModalState();
const selectedTestData = ref(null);

const testSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/lecture/testInfoListBody.do', param).then((res) => {
    const originalList = res.data.list;
    testCount.value = res.data.count;

    // console.log('&&&&&&&&&&&&&&&&&&&');
    // console.log(res.data);

    //강사인 경우, 해당 강사의 강의 리스트만 보여줍니다.
    if (userType.value === 'T') {
      //testList에서  sessionScope.loginId == list.lecInstructorId 인 element만 testList에 넣는다.
      // loginId.value가 유효한지 확인하는 것이 안전합니다.
      if (loginId.value) {
        testList.value = originalList.filter((test) => test.lecInstructorId === loginId.value);
      } else {
        // loginId가 아직 로드되지 않은 경우, 빈 목록을 표시하여 오류를 방지합니다.
        testList.value = [];
      }
    } else {
      //강사가 아닌 경우(admin, "M" 권한), 모든 강의 리스트를 보여줍니다.
      testList.value = originalList;
    }

    // console.log(testList.value);
    // console.log(testCount.value);
  });
};

const testDetail = (selectedLecId) => {
  selectedTestData.value = testList.value.find((lecture) => lecture.lecId == selectedLecId);
  modalState.$patch({ isOpen: true, type: 'test-update' });
};

const testProblemsDetail = (selectedLecId) => {
  selectedTestData.value = testList.value.find((lecture) => lecture.lecId == selectedLecId);
  modalState.$patch({ isOpen: true, type: 'test-detail' });
};

watch(
  () => route.query,
  () => {
    testSearch();
  },
);

watch(
  loginId, // 감시할 대상
  (newLoginId) => {
    // newLoginId에 값이 들어오면 (undefined가 아니게 되면) 아래 코드가 실행됩니다.
    if (newLoginId) {
      // console.log('watch: loginId 값이 설정되었습니다 ->', newLoginId);
      // console.log('watch: userType 값 ->', userType.value);
    }
  },
  {
    immediate: true, // 최초 실행 시에도 한번 즉시 실행할지 여부 (필요에 따라 사용)
  },
);

onMounted(() => {
  testSearch();
});
</script>

<template>
  <div class="test-main-container">
    <table class="test-table">
      <thead class="test-table-header">
        <tr>
          <th>강의</th>
          <th>강사</th>
          <th>강의실</th>
          <th>시험 시작일</th>
          <th>시험 종료일</th>
          <th>시험 등록일</th>
          <th>시험문제보기</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="testCount > 0">
          <tr v-for="test in testList" :key="test.testId" class="test-table-row">
            <td class="test-cell cursor-pointer hover:underline" @click="testDetail(test.lecId)">
              {{ test.lecName }}
            </td>
            <td class="test-cell">
              {{ test.lecInstructorName }}
            </td>
            <td class="test-cell">
              {{ test.lecRoomName }}
            </td>
            <td class="test-cell">{{ test.testBeginDate.substr(0, 19) }}</td>
            <td class="test-cell">{{ test.testEndDate.substr(0, 19) }}</td>
            <td class="test-cell">{{ test.testRegDate.substr(0, 10) }}</td>
            <td
              class="test-cell cursor-pointer hover:underline"
              @click="testProblemsDetail(test.lecId)"
            >
              시험문제보기
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="test-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="testCount" :items-per-page="5" :on-page-change="testSearch" />
  </div>
  <TestRegister
    v-if="modalState.isOpen && modalState.type === 'test-create'"
    @test-post-success="testSearch()"
  />
  <TestUpdate
    v-if="modalState.isOpen && modalState.type === 'test-update'"
    :lectureData="selectedTestData"
    @test-update-success="testSearch()"
  />
  <TestDetail
    v-if="modalState.isOpen && modalState.type === 'test-detail'"
    :lectureData="selectedTestData"
    @test-update-success="testSearch()"
  />
</template>

<style>
@import './styled.css';
</style>

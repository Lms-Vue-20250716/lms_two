<script setup>
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import TestRegister from '../TestModal/TestRegister.vue';
import TestUpdate from '../TestModal/TestUpdate.vue';
import TestDetail from '../TestModal/TestDetail.vue';
import { useUserInfo } from '@/stores/loginInfoState';
import TakeTest from '../TestModal/TakeTest.vue';
import PageNavigation2 from '@/components/common/PageNavigation2.vue';

// --- 로그인 정보 가져오기 ---
const userInfoStore = useUserInfo();
// computed를 사용해 user 객체가 null일 때도 에러 없이 안전하게 값을 가져옴
const loginId = computed(() => userInfoStore.user?.loginId);
const userType = computed(() => userInfoStore.user?.userType);

// --- router
const route = useRoute();

// -- modal state 관리
const modalState = useModalState();
const selectedTestData = ref(null);

// --- 게시판
const testList = ref([]);
const testCount = ref(0);
const currentPage = ref(1);

// --- test-take modal을 위한 props
const testMode = ref('take'); // 'take' 또는 'result' 값을 가짐
const testTakeProps = ref({});

/**
 * API에서 받아온 testList를 화면에 표시하기 좋게 가공합니다.
 * 각 시험 항목에 'testStatus'와 'resultStatus' 객체를 추가합니다.
 */
const processedTestList = computed(() => {
  if (!testList.value) return [];
  return testList.value.map((test) => ({
    ...test,
    // 학생(S)인 경우에만 상태 계산, 그 외에는 null 할당
    testStatus: userType.value === 'S' ? getTestStatus(test) : null,
    resultStatus: userType.value === 'S' ? getResultStatus(test) : null,
  }));
});

/**
 * 시험 응시 상태에 따른 텍스트와 액션을 반환합니다.
 * @param {object} test - 시험 정보 객체
 */
const getTestStatus = (test) => {
  const { submitYn, testId, lecId, lecStudentId, lecName } = test;
  // 현재 날짜를 'YYYY-MM-DD HH:MM:SS' 형식의 문자열로 가져옵니다.
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  const isTestAvailable =
    test.testAvailable && now >= test.testBeginDate && now <= test.testEndDate;

  if (isTestAvailable) {
    if (submitYn === 'N') {
      return {
        text: '시험응시',
        class: 'text-blue-600 font-bold cursor-pointer hover:underline',
        action: () => testTakeModal(testId, lecId, lecStudentId, lecName),
      };
    } else {
      // submitYn === 'Y'
      return {
        text: '시험응시완료',
        class: 'text-blue-900 cursor-pointer hover:underline',
        action: () => testTakeModal(testId, lecId, lecStudentId, lecName), // 완료 후 재응시 또는 검토
      };
    }
  } else {
    // 시험 기간이 아닐 때
    if (submitYn === 'Y') {
      return { text: '시험응시 종료', class: 'text-gray-400', action: null };
    } else {
      // submitYn === 'N'
      return { text: '시험미응시', class: 'text-red-500', action: null };
    }
  }
};

/**
 * 시험 결과 상태에 따른 텍스트와 액션을 반환합니다.
 * @param {object} test - 시험 정보 객체
 */
const getResultStatus = (test) => {
  const { scoreYn, testId, lecId, lecStudentId, lecName } = test;
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  const isTestAvailable =
    test.testAvailable && now >= test.testBeginDate && now <= test.testEndDate;

  if (isTestAvailable) {
    if (scoreYn === 'N') {
      return { text: '시험응시예정', class: 'text-gray-400', action: null };
    } else {
      // scoreYn === 'Y'
      return {
        text: '시험응시결과',
        class: 'text-blue-600 font-bold cursor-pointer hover:underline',
        action: () => testResultModal(testId, lecId, lecStudentId, lecName),
      };
    }
  } else {
    // 시험 기간 종료
    if (scoreYn === 'Y') {
      return {
        text: '시험종료',
        class: 'text-gray-500 cursor-pointer hover:underline',
        action: () => testResultModal(testId, lecId, lecStudentId, lecName),
      };
    } else {
      // scoreYn === 'N'
      return { text: '시험미응시', class: 'text-red-500', action: null };
    }
  }
};

const testSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  if (userType.value === 'S') {
    axios.post('/api/lecture/testListBody.do', param).then((res) => {
      console.log('#################################');
      console.log(res);

      testList.value = res.data.list;
      testCount.value = res.data.count;

      currentPage.value = cPage;
    });
  } else if (userType.value === 'T') {
    axios.post('/api/lecture/testInfoListBody.do', param).then((res) => {
      const originalList = res.data.list;
      testCount.value = res.data.count;

      // console.log('&&&&&&&&&&&&&&&&&&&');
      // console.log(res.data);

      if (loginId.value) {
        testList.value = originalList.filter((test) => test.lecInstructorId === loginId.value);
      } else {
        // loginId가 아직 로드되지 않은 경우, 빈 목록을 표시하여 오류를 방지합니다.
        testList.value = [];
      }

      currentPage.value = cPage;
    });
  } else if (userType.value === 'M') {
    axios.post('/api/lecture/testInfoListBody.do', param).then((res) => {
      testList.value = res.data.list;
      testCount.value = res.data.count;
      currentPage.value = cPage;
    });
  } else {
    alert('권한이 없습니다!');
    return;
  }
};

const testTakeModal = async (testId, lecId, studentId, lecName) => {
  console.log(`시험 응시: testId=${testId}, lecId=${lecId}, studentId=${studentId}`);
  testMode.value = 'take';
  testTakeProps.value = {
    testId: testId,
    lecId: lecId,
    studentId: studentId,
    lecName: lecName,
  };
  modalState.$patch({ isOpen: true, type: 'test-take' });
};

const testResultModal = async (testId, lecId, studentId, lecName) => {
  console.log(`시험 결과 보기: testId=${testId}, lecId=${lecId}, studentId=${studentId}`);
  testMode.value = 'result';
  testTakeProps.value = {
    testId: testId,
    lecId: lecId,
    studentId: studentId,
    lecName: lecName,
  };

  modalState.$patch({ isOpen: true, type: 'test-take' });
};

const testDetail = (selectedLecId) => {
  selectedTestData.value = testList.value.find((lecture) => lecture.lecId == selectedLecId);
  modalState.$patch({ isOpen: true, type: 'test-update' });
};

const testProblemsDetail = (selectedLecId) => {
  selectedTestData.value = testList.value.find((lecture) => lecture.lecId == selectedLecId);
  modalState.$patch({ isOpen: true, type: 'test-detail' });
};

const paginationStateChanged = (page) => {
  currentPage.value = page;
  testSearch(page);
};

const ModalSubmitSuccess = (page = 1) => {
  currentPage.value = page;
  testSearch(page);
};

watch(
  () => route.query,
  () => {
    testSearch(1);
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
  testSearch(1);
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
          <th>{{ userType === 'S' ? '시험응시' : '시험 등록일' }}</th>
          <th>{{ userType === 'S' ? '시험응시결과' : '시험문제보기' }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="testCount > 0">
          <tr v-for="test in processedTestList" :key="test.testId" class="test-table-row">
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

            <!-- 학생(S) 뷰 -->
            <template v-if="userType === 'S'">
              <td class="test-cell">
                <!-- testStatus.action이 있을 때만 클릭 이벤트와 스타일 적용 -->
                <span
                  :class="test.testStatus.class"
                  @click="test.testStatus.action && test.testStatus.action()"
                >
                  {{ test.testStatus.text }}
                </span>
              </td>
              <td class="test-cell">
                <span
                  :class="test.resultStatus.class"
                  @click="test.resultStatus.action && test.resultStatus.action()"
                >
                  {{ test.resultStatus.text }}
                </span>
              </td>
            </template>

            <!-- 강사(T) 또는 관리자(M) 뷰 -->
            <template v-else>
              <td class="test-cell">{{ test.testRegDate.substr(0, 10) }}</td>
              <td
                class="test-cell cursor-pointer hover:underline"
                @click="testProblemsDetail(test.lecId)"
              >
                시험문제보기
              </td>
            </template>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="test-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation2
      :total-items="testCount"
      :items-per-page="5"
      :on-page-change="paginationStateChanged"
      :current-page="currentPage"
    />
  </div>
  <TestRegister
    v-if="modalState.isOpen && modalState.type === 'test-create'"
    @test-post-success="ModalSubmitSuccess()"
  />
  <TestUpdate
    v-if="modalState.isOpen && modalState.type === 'test-update'"
    :lectureData="selectedTestData"
    @test-update-success="ModalSubmitSuccess()"
  />
  <TestDetail
    v-if="modalState.isOpen && modalState.type === 'test-detail'"
    :lectureData="selectedTestData"
    @test-update-success="ModalSubmitSuccess()"
  />
  <TakeTest
    v-if="modalState.isOpen && modalState.type === 'test-take'"
    :testTakeProps="testTakeProps"
    :mode="testMode"
    @test-submit-success="ModalSubmitSuccess()"
  />
</template>

<style>
@import './styled.css';
</style>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import LectureSearch from '../LectureSearch/LectureManageSearch.vue';
import { useRouter } from 'vue-router';
import { watch } from 'vue';
import { onMounted } from 'vue';
import axios from 'axios';
import PageNavigation from '@/components/common/PageNavigation.vue';
import LectureSaveModal from '../LectureModal/LectureSaveModal.vue';
import { useModalState } from '@/stores/lectureManageModalState';

//router
const route = useRoute();
const router = useRouter();

//bbs
const lectureList = ref([]);
const lectureCount = ref(0);

//modal
const modalState = useModalState();

/**
 * 서버에서 강의 목록 데이터를 비동기적으로 가져옵니다.
 * 현재 URL의 쿼리 파라미터를 사용하여 필터링 및 페이지네이션을 처리하고,
 * 그 결과를 컴포넌트의 상태(state)에 반영합니다.
 */
const fetchLectureList = async (page) => {
  try {
    //1. url값 받아다가 유효성검사
    let pageNumber = page || 1;
    let itemPerPage = 5;

    //2. 강의목록 fetch에 필요한 파라미터를 url에서 가져온다.
    //필요 파라미터
    //1. pagination: currentPage, pageSize
    //2. searchTitle, searchTag, searchStDate, searchEdDate
    const params = new URLSearchParams({
      ...route.query,
      currentPage: pageNumber,
      pageSize: itemPerPage,
    });

    //3. 유효성 검사(null, undefined, "")
    for (let [key, value] of params.entries()) {
      if (!value) {
        params.delete(key);
      }
    }

    //4. axios.get
    // const response = await axios.get(`/api/lecture/lectureListBody.do?${params.toString()}`);
    const response = await axios.get(`/api/lecture/lectureManageListBody.do?${params.toString()}`);

    if (response && response.data) {
      //테이블에 쓸 필드들
      //강의명 / 강사 / 강의시작일 / 강의종료일 / 정원 / 신청인원 / 강의실
      lectureList.value = response.data.lectureManageList || [];
      lectureCount.value = response.data.lectureManageCnt || 0;

      console.log('==============================');
      console.log(response.data.lectureManageList);
    }
  } catch (err) {
    console.log(err);
  }
};

//searchbar
const handleSearch = (filters) => {
  //searchbar로부터 emit된 값을 받아서, 그 값으로 url을 바꾼다
  router.push({ query: filters });
};

const handleSaveSuccess = () => {
  router.push({ query: {} });
  fetchLectureList();
};

//watch -> url바뀌는감지하고 search lecture list
watch(
  //1. 감시하는 값: url
  () => route.fullPath,
  //2. 새로운 값으로 바뀌면, 어떤 행동을 취하라
  () => {
    fetchLectureList();
  },
  { deep: true },
);

//onMount -> search lectureList
onMounted(() => {
  fetchLectureList();
});
</script>
<template>
  <LectureSearch :initial-query="route.query" @search="handleSearch" />
  <div class="lecture-manager-main-container">
    <table class="lecture-manager-table">
      <thead class="lecture-manager-table-header">
        <tr>
          <th>강의명</th>
          <th>강사</th>
          <th>강의시작일</th>
          <th>강의종료일</th>
          <th>정원</th>
          <th>강의실</th>
          <th>강의계획서</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="lectureCount > 0">
          <tr v-for="lecture in lectureList" :key="lecture.lecId" class="lecture-manager-table-row">
            <td class="lecture-manager-cell cursor-pointer hover:underline">
              {{ lecture.lecName }}
            </td>
            <td class="lecture-manager-cell">{{ lecture.lecInstructorName }}</td>
            <td class="lecture-manager-cell">{{ lecture.lecStartDate.substr(0, 10) }}</td>
            <td class="lecture-manager-cell">{{ lecture.lecEndDate.substr(0, 10) }}</td>
            <td class="lecture-manager-cell">{{ lecture.lecPersonnel }}</td>
            <td class="lecture-manager-cell">{{ lecture.lecRoomName }}</td>
            <td class="lecture-manager-cell">?</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="lecture-manager-empty-row">일치하는 공지사항이 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="lectureCount"
      :items-per-page="5"
      :on-page-change="fetchLectureList"
    />
    <LectureSaveModal
      v-if="modalState.isOpen && modalState.type === 'lecture-manage-save'"
      @save-success="handleSaveSuccess"
    />
  </div>
</template>
<style setup>
@import './styled.css';
</style>

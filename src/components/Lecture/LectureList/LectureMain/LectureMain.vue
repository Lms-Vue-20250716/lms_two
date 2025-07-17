<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import LectureSearch from '../LectureSearch/LectureSearch.vue';
import { useRouter } from 'vue-router';
import { watch } from 'vue';
import { onMounted } from 'vue';
import axios from 'axios';
import PageNavigation from '@/components/common/PageNavigation.vue';

//router
const route = useRoute();
const router = useRouter();

//bbs
const lectureList = ref([]);
const lectureCount = ref(0);

/**
 * 서버에서 강의 목록 데이터를 비동기적으로 가져옵니다.
 * 현재 URL의 쿼리 파라미터를 사용하여 필터링 및 페이지네이션을 처리하고,
 * 그 결과를 컴포넌트의 상태(state)에 반영합니다.
 */
const fetchLectureList = async () => {
  try {
    //1. url값 받아다가 유효성검사
    let page = Number(route.query.page || 1);
    let itemPerPage = 5;

    //2. 강의목록 fetch에 필요한 파라미터를 url에서 가져온다.
    //필요 파라미터
    //1. pagination: currentPage, pageSize
    //2. searchTitle, searchTag, searchStDate, searchEdDate
    const params = new URLSearchParams({
      ...route.query,
      currentPage: page,
      pageSize: itemPerPage,
    });

    //3. 유효성 검사(null, undefined, "")
    for (let [key, value] of params.entries()) {
      if (!value) {
        params.delete(key);
      }
    }

    //4. axios.get
    const response = await axios.get(`/api/lecture/lectureListBody.do?${params.toString()}`);

    if (response && response.data) {
      //테이블에 쓸 필드들
      //강의명 / 강사 / 강의시작일 / 강의종료일 / 정원 / 신청인원 / 강의실
      lectureList.value = response.data.list || [];
      lectureCount.value = response.data.count || 0;

      console.log(lectureList.value);
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

//pagination
// const onPageChange = (page) => {};

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
  <div class="lecture-main-container">
    <table class="lecture-table">
      <thead class="lecture-table-header">
        <tr>
          <th>강의명</th>
          <th>강사</th>
          <th>강의시작일</th>
          <th>강의종료일</th>
          <th>정원</th>
          <th>신청인원</th>
          <th>강의실</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="lectureCount > 0">
          <tr v-for="lecture in lectureList" :key="lecture.lecId" class="lecture-table-row">
            <td class="lecture-cell cursor-pointer hover:underline">{{ lecture.lecName }}</td>
            <td class="lecture-cell">{{ lecture.lecInstructorName }}</td>
            <td class="lecture-cell">{{ lecture.lecStartDate.substr(0, 10) }}</td>
            <td class="lecture-cell">{{ lecture.lecEndDate.substr(0, 10) }}</td>
            <td class="lecture-cell">{{ lecture.lecPersonnel }}</td>
            <td class="lecture-cell">{{ lecture.courseCntPersonnel }}</td>
            <!-- lms_one에는 tb_courses_info 에 데이터 있어서 이게 찍히는데, lms_two에는 데이터 없어서안찍힘 -->
            <td class="lecture-cell">{{ lecture.lecRoomName }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="lecture-empty-row">일치하는 강의가 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="lectureCount"
      :items-per-page="5"
      :on-page-change="fetchLectureList"
    />
  </div>
</template>
<style scoped>
@import './styled.css';
</style>

<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import StudentModal from '../StudentModal/StudentModal.vue';
const route = useRoute();
const studentList = ref([]);
const studentCount = ref(0);
const modalState = useModalState();
const detailId = ref(0);

/** ----------------------------------------------- */

const updateStatusYn = async (e, student) => {
  const studentId = student.studentId;
  const param = {
    studentStatus: e.target.value,
    studentId: studentId
  };
  if (confirm('재학 상태를 변경하시겠습니까?')) {
    try {
      const res = await axios.post('/api/manage/student-status', param);
      if (res.data === 'SUCCESS') {
        alert('재학상태가 변경되었습니다.');
      } else {
        alert('재학상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

const studentSearch = async (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  console.log(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  try {
    const res = await axios.post('/api/manage/studentListBody.do', param)
    studentList.value = res.data.list;
    studentCount.value = res.data.count;
  } catch (error) {
    console.log(error);
  }
};


onMounted(() => {
  studentSearch();
});

const studentDetail = (id) => {
  modalState.$patch({ isOpen: true, type: "student" })
  detailId.value = id;
}

watch(
  () => route.query,
  () => {
    studentSearch()
  },
)

</script>

<template>
  <div class="student-main-container">
    <table class="student-table">
      <thead class="student-table-header">
        <tr>
          <th>학번</th>
          <th>이름</th>
          <th>연락처</th>
          <th>가입일자</th>
          <th>취업여부</th>
          <th>재학상태</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="studentCount > 0">
          <tr v-for="student in studentList" :key="student.studentId" class="student-table-row">
            <td class="student-cell">{{ student.studentNumber }}</td>
            <td class="student-cell cursor-pointer hover:underline" @click="studentDetail(student.studentId)">{{
              student.studentName }}</td>
            <td class="student-cell">{{ student.studentHp }}</td>
            <td class="student-cell">{{ student.studentRegDate.substr(0, 10) }}</td>
            <td class="student-cell">
              <span>{{ student.studentEmpStatus === 'Y' ? '취업' : '미취업' }}</span>
            </td>
            <td class="student-cell">
              <select @change="updateStatusYn($event, student)" v-model="student.statusYN">
                <option value="W">승인 대기중</option>
                <option value="Y">재학</option>
                <option value="N">탈퇴</option>
              </select>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="6" class="student-empty-row">일치하는 학생이 없습니다.</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation :total-items="studentCount" :items-per-page="5" :on-page-change="studentSearch" />
  </div>
  <StudentModal v-if="modalState.isOpen && modalState.type === 'student'" :detail-id="detailId"
    @post-success="studentSearch()" @un-mounted-modal="detailId = $event" />
</template>

<style>
@import './styled.css';
</style>

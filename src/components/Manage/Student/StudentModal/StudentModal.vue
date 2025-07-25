<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const detail = ref({});
const lectureList = ref([]);
const modalState = useModalState();
const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: [String, Number], default: 0 } });

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
})

const searchDetail = async () => {
  const param = new URLSearchParams();
  param.append('studentId', id);

  try {
    const res = await axios.post(`/api/manage/student-detail/${id}`, param);
    detail.value = res.data;
    lectureList.value = res.data.lectureInfo || [];
  } catch (error) {
    console.log(error);
  }

};

</script>

<template>
  <div class="student-manage-modal-overlay">
    <div class="student-manage-modal-container">
      <div class="flex justify-between items-center bg-[#494c6b] text-white p-3">
        <h2 class="text-lg font-medium">학생 상세</h2>
        <button @click="modalState.$patch({ isOpen: false, type: 'null' })" class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <h3 class="font-medium mb-2">학생 정보</h3>
          <table class="w-full border-collapse table-auto">
            <tbody>
              <tr>
                <th class="student-manage-modal-table-th">학생 ID</th>
                <td class="student-manage-modal-table-td">{{ detail.studentId }}</td>
                <th class="student-manage-modal-table-th">이름</th>
                <td class="student-manage-modal-table-td">{{ detail.studentName }}</td>
              </tr>
              <tr>
                <th class="student-manage-modal-table-th">학번</th>
                <td class="student-manage-modal-table-td">{{ detail.studentNumber }}</td>
                <th class="student-manage-modal-table-th">연락처</th>
                <td class="student-manage-modal-table-td">{{ detail.studentHp }}</td>
              </tr>
              <tr>
                <th class="student-manage-modal-table-th">이메일</th>
                <td class="student-manage-modal-table-td break-all">{{ detail.studentEmail }}</td>
                <th class="student-manage-modal-table-th">생일</th>
                <td class="student-manage-modal-table-td">{{ detail.studentBirthday }}</td>
              </tr>
              <tr>
                <th class="student-manage-modal-table-th">취업 상태</th>
                <td class="student-manage-modal-table-td">{{ detail.studentEmpStatus === 'Y' ? '취업' : '미취업' }}</td>
                <th class="student-manage-modal-table-th">재학 상태</th>
                <td class="student-manage-modal-table-td">{{ detail.statusYn === 'W' ? '승인 대기중' : detail.statusYn ===
                  'Y' ?
                  '재학' : '탈퇴' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="font-medium mb-2">강의 목록</h3>
          <table class="student-manage-modal-table">
            <thead>
              <tr>
                <th class="student-manage-modal-table-th">강의 번호</th>
                <th class="student-manage-modal-table-th">강의명</th>
                <th class="student-manage-modal-table-th">개강 일자</th>
                <th class="student-manage-modal-table-th">종강 일자</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="lectureList.length > 0">
                <tr v-for="lecture in lectureList" :key="lecture.lecId">
                  <td class="student-manage-modal-table-td">{{ lecture.lecId }}</td>
                  <td class="student-manage-modal-table-td">{{ lecture.lectureName }}</td>
                  <td class="student-manage-modal-table-td">{{ new
                    Date(lecture.lectureStartDate).toISOString().split('T')[0]
                    }}</td>
                  <td class="student-manage-modal-table-td">{{ new
                    Date(lecture.lectureEndDate).toISOString().split('T')[0] }}
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td colspan="4" class="student-manage-modal-table-td text-center">수강 강의 목록이 없습니다.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="flex justify-center mt-4">
          <button type="button" @click="modalState.$patch({ isOpen: false, type: 'null' })"
            class="bg-[#7f8cb6] text-white px-6 py-2 rounded hover:bg-[#6b7aa1] transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
@import './styled.css';
</style>

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
});

const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('studentId', id);

  axios.post(`/api/manage/student-detail/${id}`, param).then((res) => {
    detail.value = res.data;
    lectureList.value = res.data.lectureInfo || [];
  });
};
</script>

<template>
  <div class="student-modal-overlay">
    <div class="student-modal-container">
      <div class="flex items-center justify-between bg-[#494c6b] p-3 text-white">
        <h2 class="text-lg font-medium">학생 상세</h2>
        <button class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <h3 class="mb-2 font-medium">학생 정보</h3>
          <table class="w-full table-auto border-collapse">
            <tbody>
              <tr>
                <th class="student-modal-table-th">학생 ID</th>
                <td class="student-modal-table-td">{{ detail.studentId }}</td>
                <th class="student-modal-table-th">이름</th>
                <td class="student-modal-table-td">{{ detail.studentName }}</td>
              </tr>
              <tr>
                <th class="student-modal-table-th">학번</th>
                <td class="student-modal-table-td">{{ detail.studentNumber }}</td>
                <th class="student-modal-table-th">연락처</th>
                <td class="student-modal-table-td">{{ detail.studentHp }}</td>
              </tr>
              <tr>
                <th class="student-modal-table-th">이메일</th>
                <td class="student-modal-table-td break-all">{{ detail.studentEmail }}</td>
                <th class="student-modal-table-th">생일</th>
                <td class="student-modal-table-td">{{ detail.studentBirthday }}</td>
              </tr>
              <tr>
                <th class="student-modal-table-th">취업 상태</th>
                <td class="student-modal-table-td">
                  {{ detail.studentEmpStatus === 'Y' ? '취업' : '미취업' }}
                </td>
                <th class="student-modal-table-th">재학 상태</th>
                <td class="student-modal-table-td">
                  {{
                    detail.statusYn === 'W'
                      ? '승인 대기중'
                      : detail.statusYn === 'Y'
                        ? '재학'
                        : '탈퇴'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="mb-2 font-medium">강의 목록</h3>
          <table class="student-modal-table">
            <thead>
              <tr>
                <th class="student-modal-table-th">강의 번호</th>
                <th class="student-modal-table-th">강의명</th>
                <th class="student-modal-table-th">개강 일자</th>
                <th class="student-modal-table-th">종강 일자</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="lectureList.length > 0">
                <tr v-for="lecture in lectureList" :key="lecture.lecId">
                  <td class="student-modal-table-td">{{ lecture.lecId }}</td>
                  <td class="student-modal-table-td">{{ lecture.lectureName }}</td>
                  <td class="student-modal-table-td">
                    {{ new Date(lecture.lectureStartDate).toISOString().split('T')[0] }}
                  </td>
                  <td class="student-modal-table-td">
                    {{ new Date(lecture.lectureEndDate).toISOString().split('T')[0] }}
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td colspan="4" class="student-modal-table-td text-center">
                    수강 강의 목록이 없습니다.
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex justify-center">
          <button
            type="button"
            @click="modalState.$patch({ isOpen: false })"
            class="rounded bg-[#7f8cb6] px-6 py-2 text-white transition-colors hover:bg-[#6b7aa1]"
          >
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

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
  param.append('tutorId', id);

  try {
    const res = await axios.post(`/api/manage/tutor-detail/${id}`, param);
    detail.value = res.data;
    lectureList.value = res.data.lectureInfo || [];
  } catch (error) {
    console.log(error);
  }

};

</script>

<template>
  <div class="tutor-modal-overlay">
    <div class="tutor-modal-container">
      <div class="flex justify-between items-center bg-[#494c6b] text-white p-3">
        <h2 class="text-lg font-medium">강사 상세</h2>
        <button @click="modalState.$patch({ isOpen: false, type: 'null' })" class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <h3 class="font-medium mb-2">강사 정보</h3>
          <table class="w-full border-collapse table-auto">
            <tbody>
              <tr>
                <th class="tutor-modal-table-th">강사 ID</th>
                <td class="tutor-modal-table-td">{{ detail.insId }}</td>
                <th class="tutor-modal-table-th">이름</th>
                <td class="tutor-modal-table-td">{{ detail.insName }}</td>
              </tr>
              <tr>
                <th class="tutor-modal-table-th">강사번호</th>
                <td class="tutor-modal-table-td">{{ detail.insNumber }}</td>
                <th class="tutor-modal-table-th">연락처</th>
                <td class="tutor-modal-table-td">{{ detail.insHp }}</td>
              </tr>
              <tr>
                <th class="tutor-modal-table-th">이메일</th>
                <td class="tutor-modal-table-td break-all">{{ detail.insEmail }}</td>
                <th class="tutor-modal-table-th">재직상태</th>
                <td class="tutor-modal-table-td">{{ detail.insStatusYn === 'Y' ? '재직' : '퇴직' }}</td>
              </tr>
              <tr>
                <th class="tutor-modal-table-th">은행</th>
                <td class="tutor-modal-table-td">{{ detail.insBank }}</td>
                <th class="tutor-modal-table-th">계좌 번호</th>
                <td class="tutor-modal-table-td">{{ detail.insAccount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="font-medium mb-2">강의 목록</h3>
          <table class="tutor-modal-table">
            <thead>
              <tr>
                <th class="tutor-modal-table-th">강의 번호</th>
                <th class="tutor-modal-table-th">강의명</th>
                <th class="tutor-modal-table-th">개강 일자</th>
                <th class="tutor-modal-table-th">종강 일자</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="lectureList.length > 0">
                <tr v-for="lecture in lectureList" :key="lecture.lecId">
                  <td class="tutor-modal-table-td">{{ lecture.lecId }}</td>
                  <td class="tutor-modal-table-td">{{ lecture.lecName }}</td>
                  <td class="tutor-modal-table-td">{{ new Date(lecture.lecStartDate).toISOString().split('T')[0]
                  }}</td>
                  <td class="tutor-modal-table-td">{{ new Date(lecture.lecEndDate).toISOString().split('T')[0] }}
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td colspan="4" class="tutor-modal-table-td text-center">진행하는 강의 목록이 없습니다.</td>
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

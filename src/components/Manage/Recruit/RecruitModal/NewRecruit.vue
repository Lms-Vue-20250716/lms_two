<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onUnmounted, ref } from 'vue';

const detail = ref({});
const modalState = useModalState();
const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { loginId } = defineProps({ loginId: { type: String, default: '0' } });

const formatDateForInput = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onUnmounted(() => {
  emit('unMountedModal', 0);
})

const save = async () => {
  // 유효성 검사
  if (!detail.value.empName) {
    alert('업체명을 입력해주세요.');
    return;
  }
  if (!detail.value.empJoinDate) {
    alert('입사일을 선택해주세요.');
    return;
  }

  // 입사일이 오늘 이후인지 검증
  const today = new Date();
  const joinDate = new Date(detail.value.empJoinDate);
  if (joinDate > today) {
    alert('입사일은 오늘 날짜 이후로 설정할 수 없습니다.');
    return;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const param = new URLSearchParams();
  param.append('empName', detail.value.empName);
  param.append('empJoinDate', formatDate(detail.value.empJoinDate));
  param.append('loginID', loginId);

  try {
    const res = await axios.post(`/api/manage/RecruitSave.do`, param);
    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      close();
      emit('postSuccess');
    } else if (res.data.result === 'retirefail') {
      alert('입사일자와 퇴직일자를 확인해주세요.');
    }
  } catch (error) {
    console.log(error);
  }
}

const close = () => {
  modalState.$patch({ isOpen: false, type: null });
}

</script>

<template>
  <div class="recruit-modal-overlay">
    <div class="recruit-modal-container">
      <div class="flex justify-between items-center bg-[#494c6b] text-white p-3">
        <h2 class="text-lg font-medium">취업 정보</h2>
        <button @click="modalState.$patch({ isOpen: false, type: null })" class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <table class="w-full border-collapse table-auto">
          <tbody>
            <tr>
              <th class="recruit-modal-table-th">업체명</th>
              <td class="recruit-modal-table-td">
                <input type="text" :value="detail.empName" @input="detail.empName = $event.target.value" />
              </td>
            </tr>
            <tr>
              <th class="recruit-modal-table-th">입사일</th>
              <td class="recruit-modal-table-td">
                <input type="date" :value="detail.empJoinDate ? formatDateForInput(detail.empJoinDate) : ''"
                  @input="detail.empJoinDate = new Date($event.target.value).getTime()"
                  class="w-full border-none outline-none" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-center">
        <button type="button" @click="save()"
          class="bg-[#6b79a1] text-white px-6 py-2 rounded hover:bg-[#5e6c94] transition-colors">
          저장
        </button>
        <button type="button" @click="close()"
          class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors">
          취소
        </button>
      </div>
    </div>
  </div>
</template>


<style>
@import './styled.css';
</style>

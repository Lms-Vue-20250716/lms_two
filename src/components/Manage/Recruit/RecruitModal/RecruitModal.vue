<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const detail = ref({});
const modalState = useModalState();
const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId, loginId } = defineProps({
  detailId: { type: String, default: '0' },
  loginId: { type: String, default: '0' }
});

onMounted(() => {
  detailId && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
})

const searchDetail = async () => {
  const param = new URLSearchParams();
  param.append('empId', detailId);

  try {
    const res = await axios.post(`/api/manage/empStudentDetail.do`, param);
    detail.value = res.data.detailValue;
  } catch (error) {
    console.log(error);
  }
};

const close = () => {
  modalState.$patch({ isOpen: false, type: null });
}

const edit = async () => {
  // 유효성 검사
  if (!detail.value.empJoinDate) {
    alert('올바른 입사일을 선택해주세요.');
    return;
  }
  if (!detail.value.empRetireDate) {
    alert('올바른 퇴사일을 선택해주세요.');
    return;
  }

  // 날짜 검증
  const today = new Date();
  const joinDate = new Date(detail.value.empJoinDate);
  const retireDate = new Date(detail.value.empRetireDate);
  
  // 입사일이 오늘 이후인지 검증
  if (joinDate > today) {
    alert('입사일은 오늘 날짜 이후로 설정할 수 없습니다.');
    return;
  }
  
  // 날짜 순서 검증
  if (joinDate >= retireDate) {
    alert('퇴사일은 입사일 이후여야 합니다.');
    return;
  }

  const param = new URLSearchParams();
  param.append('empId', detailId);
  param.append('empName', detail.value.empName);
  param.append('empJoinDate', new Date(detail.value.empJoinDate).toISOString().split('T')[0]);
  param.append('loginID', loginId);
  param.append('empRetireDate', new Date(detail.value.empRetireDate).toISOString().split('T')[0]);

  try {
    const res = await axios.post(`/api/manage/empStudentUpdate.do`, param);
    if (res.data.result === 'success') {
      alert('수정되었습니다.');
      close();
      emit('postSuccess');
    } else if (res.data.result === 'joinfail') {
      alert('입사일은 이전 퇴사일 이후 시간대여야 합니다.')
    } else if (res.data.result === 'retirefail') {
      alert('퇴사일은 이후 입사일 이전 시간대여야 합니다.')
    }


  } catch (error) {
    console.log(error);
  }
}

</script>

<template>
  <div class="recruit-modal-overlay">
    <div class="recruit-modal-container">
      <div class="flex justify-between items-center bg-[#494c6b] text-white p-3">
        <h2 class="text-lg font-medium">학생 정보 상세보기</h2>
        <button @click="modalState.$patch({ isOpen: false, type: null })" class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <h3 class="font-medium mb-2">학생 정보</h3>
          <table class="w-full border-collapse table-auto">
            <tbody>
              <tr>
                <th class="recruit-modal-table-th">기업명</th>
                <td class="recruit-modal-table-td">
                  <input type="text" :value="detail.empName" @input="detail.empName = $event.target.value" />
                </td>
              </tr>
              <tr>
                <th class="recruit-modal-table-th">입사일</th>
                <td class="recruit-modal-table-td">
                  <input type="date"
                    :value="detail.empJoinDate ? new Date(detail.empJoinDate).toISOString().split('T')[0] : ''"
                    @input="detail.empJoinDate = new Date($event.target.value).getTime()"
                    class="w-full border-none outline-none" />
                </td>
              </tr>
              <tr>
                <th class="recruit-modal-table-th">퇴사일</th>
                <td class="recruit-modal-table-td">
                  <input type="date"
                    :value="detail.empRetireDate ? new Date(detail.empRetireDate).toISOString().split('T')[0] : ''"
                    @input="detail.empRetireDate = new Date($event.target.value).getTime()"
                    class="w-full border-none outline-none" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <button type="button" @click="edit()"
          class="bg-[#6b79a1] text-white px-6 py-2 rounded hover:bg-[#5e6c94] transition-colors">
          수정
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

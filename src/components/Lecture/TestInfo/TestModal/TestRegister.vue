<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['testPostSuccess']);

const modalState = useModalState();
const lectureSelectBoxList = ref([]);

const selectedLecId = ref(''); //선택된 강의의 ID를 저장할 ref
const lecInstructorName = ref('');
const lecRoomName = ref('');
const lecStartDate = ref('');
const lecEndDate = ref('');

const searchSelectBox = async () => {
  try {
    const response = await axios.get('/api/lecture/lectureSelectBoxList.do');
    // console.log('%%%%%%%%%%%%%%%%%%%%%%%%%');
    lectureSelectBoxList.value = response.data.lecSelectBoxList;
    // console.log(response.data);
    // console.log(lectureSelectBoxList.value);
    // console.log('$$$$$$$$$$$$$$$$$$$$$$$');
  } catch (err) {
    console.log(err);
  }
};

// testInfoSave, post testInfoSave.do
// {lecId=22, testBeginDate=2025-07-23 11:32:00, testEndDate=2025-07-24 11:32:00, testType=0}
// testInfoSave paramMap ================= {lecId=7, testBeginDate=2025-07-22 11:52, testEndDate=2025-07-24 11:52, testType=0}
//  testInfoSave paramMap ================= {lecId=6, testBeginDate=2025-07-22 11:54:00, testEndDate=2025-08-01 11:56:00, testType=0}
const registerTest = async () => {
  try {
    //유효성 검사
    if (
      selectedLecId.value == '' ||
      selectedLecId.value == undefined ||
      selectedLecId.value == null
    ) {
      alert('id가 선택되지 않았습니다!');
      return;
    }
    if (!lecStartDate.value || !lecEndDate.value) {
      alert('시험 시작일과 종료일을 모두 입력해주세요.');
      return;
    }
    const from = new Date(lecStartDate.value);
    const to = new Date(lecEndDate.value);
    if (to < from) {
      alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
      return;
    }

    const startHour = from.getHours();
    const endHour = to.getHours();
    const today = new Date();

    // 시작 시간이 오전 6시 이전인지 확인
    if (startHour < 6) {
      alert('시험 시작 시간은 오전 6시 이후로 설정해야 합니다.');
      return;
    }

    // 종료 시간이 오전 6시 이전인지 확인
    // (만약 종료일이 시작일과 다른 날짜일 경우, 종료 시간도 제한하는 것이 맞습니다.)
    if (endHour < 6) {
      alert('시험 종료 시간은 오전 6시 이후로 설정해야 합니다.');
      return;
    }

    if (to < today) {
      alert('시험 종료일은 과거일 수 없습니다.');
      return;
    }

    const param = {
      lecId: selectedLecId.value,
      // datetime-local의 'T'를 공백으로 치환하여 'YYYY-MM-DD HH:MI' 형식으로 만듦
      testBeginDate: lecStartDate.value.replace('T', ' ') + ':00',
      testEndDate: lecEndDate.value.replace('T', ' ') + ':00',
      testType: '0',
    };

    await axios.post('/api/lecture/testInfoSave.do', param);

    alert('시험정보 저장 완료');

    // 성공 시 모달 닫기 및 부모 컴포넌트에 이벤트 전달
    emit('testPostSuccess');

    modalState.$patch({ isOpen: false, type: 'test-create' });
    //close modal
  } catch (err) {
    console.log(err);
  }
};

watch(selectedLecId, (newId) => {
  if (newId) {
    const selectedLecture = lectureSelectBoxList.value.find((lecture) => lecture.lecId == newId);
    if (selectedLecture) {
      lecInstructorName.value = selectedLecture.lecInstructorName;
      lecRoomName.value = selectedLecture.lecRoomName;
    }
  } else {
    //강의 선택을 고른 경우, 변수 ''로 초기화
    lecInstructorName.value = '';
    lecRoomName.value = '';
  }
});

onMounted(() => {
  searchSelectBox();
});

// onUnmounted(() => {
//   emit('unMountedModal', 0);
// });
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form @submit.prevent="registerTest" class="test-register-modal">
        <div class="modal-header">
          <h2>시험 등록</h2>
          <button
            class="close-btn"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-create' })"
          >
            &times;
          </button>
        </div>

        <div class="modal-content">
          <table class="form-table">
            <tbody>
              <tr>
                <td class="label-cell">
                  <label for="lecture">강의</label><span class="required-star">*</span>
                </td>
                <td colspan="3">
                  <select id="lecture" name="lecture" v-model="selectedLecId">
                    <option value="" disabled>강의 선택</option>
                    <option
                      v-for="lecture in lectureSelectBoxList"
                      :key="lecture.lecId"
                      :value="lecture.lecId"
                    >
                      {{ lecture.lecName }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="label-cell"><label>강사</label><span class="required-star">*</span></td>
                <td>
                  <input type="text" :value="lecInstructorName" readonly />
                </td>
                <td class="label-cell">
                  <label>강의실</label><span class="required-star">*</span>
                </td>
                <td>
                  <input type="text" :value="lecRoomName" readonly />
                </td>
              </tr>
              <tr>
                <td class="label-cell">
                  <label for="start-datetime">시험 시작일</label
                  ><span class="required-star">*</span>
                </td>
                <td>
                  <input
                    type="datetime-local"
                    id="start-datetime"
                    v-model="lecStartDate"
                    name="start-datetime"
                  />
                </td>
                <td class="label-cell">
                  <label for="end-datetime">시험 종료일</label><span class="required-star">*</span>
                </td>
                <td>
                  <input
                    type="datetime-local"
                    id="end-datetime"
                    v-model="lecEndDate"
                    name="end-datetime"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" type="submit">저장</button>
          <button
            class="btn btn-secondary"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-create' })"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- 1. 모달 배경(오버레이) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* 약간 더 어둡게 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* --- 2. 모달 박스 --- */
.user-management-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px; /* 너비 조절 */
  border: 1px solid #d1d5db;
  /* form 태그이므로 display:flex 등을 직접 적용하지 않아도 자식들이 세로로 쌓임 */
}

/* --- 3. 모달 헤더 --- */
.modal-header {
  background-color: #475569; /* 어두운 슬레이트 색상 */
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.75rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 0.8;
}

/* --- 4. 모달 본문 (콘텐츠) --- */
.modal-content {
  padding: 1.5rem;
  background-color: #f8fafc;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
}

.form-table td {
  border: 1px solid #e2e8f0;
  padding: 0.8rem;
  vertical-align: middle;
}

.label-cell {
  background-color: #f1f5f9;
  font-weight: 600;
  color: #334155;
  width: 120px;
  text-align: center;
}

.required-star {
  color: #ef4444;
  margin-left: 4px;
}

/* input, select 공통 스타일 */
.modal-content input[type='text'],
.modal-content input[type='datetime-local'],
.modal-content select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.modal-content input:read-only {
  background-color: #e5e7eb;
  cursor: not-allowed;
}

/* --- 5. 모달 푸터 --- */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* --- 6. 버튼 공통 스타일 --- */
.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}
.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
</style>

<script setup>
import { useUserInfo } from '@/stores/loginInfoState';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  lectureData: {
    type: Object, // 데이터 타입은 객체
    default: () => ({}), // 기본값은 빈 객체
  },
});

const emit = defineEmits(['testUpdateSuccess']);

// --- 로그인 정보 가져오기 ---
const userInfoStore = useUserInfo();
// computed를 사용해 user 객체가 null일 때도 에러 없이 안전하게 값을 가져옴
const userType = computed(() => userInfoStore.user?.userType);

const modalState = useModalState();

const testId = ref(0);
const lecId = ref(''); //선택된 강의의 ID를 저장할 ref
const lecName = ref(''); //선택된 강의의 ID를 저장할 ref
const lecInstructorName = ref('');
const lecRoomName = ref('');
// 1. 날짜 데이터 저장을 위한 내부 ref
// 이 ref들이 실제 데이터 소스 역할을 합니다.
const _lecStartDate = ref('');
const _lecEndDate = ref('');

// 날짜 입력 실패시 강제 재랜더링을 위한 키값
const startDateKey = ref(0);
const endDateKey = ref(0);

const lecStartDate = computed({
  get() {
    return _lecStartDate.value;
  },
  set(newValue) {
    if (_lecEndDate.value && new Date(newValue) > new Date(_lecEndDate.value)) {
      alert('시작일은 종료일 보다 늦을 수 없습니다.');
      startDateKey.value++;
      return;
    }
    _lecStartDate.value = newValue;
  },
});

const lecEndDate = computed({
  get() {
    return _lecEndDate.value;
  },
  set(newValue) {
    if (_lecStartDate.value && new Date(newValue) < new Date(_lecStartDate.value)) {
      alert('시작일은 종료일 보다 늦을 수 없습니다.');
      endDateKey.value++;
      return;
    }
    _lecEndDate.value = newValue;
  },
});

//testInfoUpdate.do
const updateTest = async () => {
  try {
    //유효성 검사
    if (testId.value == '' || testId.value == undefined || testId.value == null) {
      alert('id가 선택되지 않았습니다!');
      return;
    }
    // 중복 validaction check이긴 하지만, 만일의 상황을 위해 다시 한번 검증한다.
    if (lecStartDate.value && lecEndDate.value) {
      const from = new Date(lecStartDate);
      const to = new Date(lecEndDate);

      if (to < from) {
        alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
        return;
      }
    }

    const params = new URLSearchParams();
    params.append('testId', testId.value);
    params.append('lecId', lecId.value);
    params.append('testBeginDate', lecStartDate.value.replace('T', ' ') + ':00');
    params.append('testEndDate', lecEndDate.value.replace('T', ' ') + ':00');
    params.append('testType', '0');

    await axios.post('/api/lecture/testInfoUpdate.do', params);

    alert('시험 날짜 수정 완료!');

    // 성공 시 모달 닫기 및 부모 컴포넌트에 이벤트 전달
    emit('testUpdateSuccess');

    //close modal
    modalState.$patch({ isOpen: false, type: 'test-update' });
  } catch (err) {
    console.log(err);
  }
};

watch(
  () => props.lectureData,
  (newData) => {
    if (newData && newData.lecId && newData.testId) {
      // console.log('Props로 전달받은 데이터:', newData);

      testId.value = newData.testId;
      lecId.value = newData.lecId;
      lecName.value = newData.lecName;
      lecInstructorName.value = newData.lecInstructorName;
      lecRoomName.value = newData.lecRoomName;

      // 2. 날짜 형식을 <input type="datetime-local">에 맞게 변환
      // 예: "2025-07-21 12:30:00" -> "2025-07-21T12:30"
      _lecStartDate.value = newData.testBeginDate.substring(0, 16).replace(' ', 'T');
      _lecEndDate.value = newData.testEndDate.substring(0, 16).replace(' ', 'T');
    }
  },
  {
    immediate: true, // 컴포넌트가 처음 로드될 때도 즉시 한 번 실행
    deep: true, // 객체 내부의 속성 변경까지 감지
  },
);
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form @submit.prevent="updateTest" class="test-update-modal">
        <div class="modal-header">
          <h2>시험 상세</h2>
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
                  <input type="text" :value="lecName" readonly />
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
                    :readonly="userType !== 'M'"
                    name="start-datetime"
                    :key="startDateKey"
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
                    :readonly="userType !== 'M'"
                    name="end-datetime"
                    :key="endDateKey"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button v-if="userType === 'M'" class="btn btn-primary" type="submit">수정</button>
          <button
            class="btn btn-secondary"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-update' })"
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

<script setup>
import { calculateBusinessDays, formatDateTime, isWeekend } from '@/common/common_time';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { computed, ref, watch } from 'vue';

// --- 부모 컴포넌트로부터받은 데이터
const props = defineProps({
  lectureData: {
    type: Object, // 데이터 타입은 객체
    default: () => ({}), // 기본값은 빈 객체
  },
});

// 모드 구분을 위한 상태 변수
const isEditMode = ref(false);
const lecId = ref();

const emit = defineEmits(['lectureManageRegisterClose', 'lectureManageRegisterSubmitSuccess']);

const modalState = useModalState();

/// --- 서버로부터 받은 데이터
// <select> 태그의 <option> 목록으로 사용될 배열들입니다.
const lecList = ref([]);
const insNameList = ref([]);
const lecClassRoomList = ref([]);

//변수 for '강의 등록' 모달
const lecName = ref(''); //강의명
const customLecName = ref(''); //강의명 직접입력시 사용할 변수명
/**
 * 최종적으로 저장될 강의명을 결정하는 계산된 속성입니다.
 */
const finalLecName = computed(() => {
  // '직접 입력'이 선택되었다면, customLecName 입력창의 값을 사용합니다.
  if (lecName.value === 'new') {
    return customLecName.value;
  }
  return lecName.value;
});
const lecInstructorId = ref(''); //강사 아이디
const lecClassRoomId = ref(''); //강의실

const lecPersonnel = ref(0); //정원
const lecStartDate = ref(); //강의시작일
const lecEndDate = ref(); //강의종료일
const lecDaysCnt = computed(() => {
  return calculateBusinessDays(lecStartDate.value, lecEndDate.value);
});

/** 날짜 선택기의 최소/최대 범위를 계산 */
const dateLimits = computed(() => {
  const today = new Date();
  const minDate = new Date();
  const maxDate = new Date();

  minDate.setDate(today.getDate() - 200);
  maxDate.setDate(today.getDate() + 300);

  return {
    min: formatDateTime(minDate, 'YYYY-MM-DD'),
    max: formatDateTime(maxDate, 'YYYY-MM-DD'),
  };
});

//변수 for '강의 상세' 모달
const insName = ref('');

const resetForm = () => {
  lecId.value = null; // ID 초기화가 중요합니다.
  lecName.value = '';
  customLecName.value = '';
  lecInstructorId.value = '';
  insName.value = '';
  lecClassRoomId.value = '';
  lecPersonnel.value = 0;
  lecStartDate.value = null;
  lecEndDate.value = null;
  // lecDaysCnt는 computed이므로 따로 초기화할 필요가 없습니다.

  // 드롭다운 목록은 그대로 두거나, 필요 시 다시 불러올 수 있습니다.
};

const searchSelectBox = async () => {
  try {
    const response = await axios.get('/api/lecture/lectureManageSelectBox.do');
    lecList.value = response.data.lecSelectBoxLecNameList || [];
    insNameList.value = response.data.lecSelectBoxInstructorInfoList || [];
    lecClassRoomList.value = response.data.lecSelectBoxClassRoomList || [];

    // console.log('lecList', lecList);
    // console.log('insNameList', insNameList);
    // console.log('lecClassRoomList', lecClassRoomList);
  } catch (err) {
    console.log(err);
  }
};

const searchLectureDetail = async (lecId, lecInstructorId) => {
  try {
    // 1. URLSearchParams 대신 일반 자바스크립트 객체로 파라미터를 준비합니다.
    const params = {
      lecId: lecId,
      lecInstructorId: lecInstructorId,
    };

    // 2. axios.get의 두 번째 인자에 { params: ... } 형태로 전달합니다.
    const response = await axios.get('/api/lecture/lectureManageDetail.do', {
      params: params, // 축약형으로 { params } 라고만 써도 됩니다.
    });
    // console.log('##################################');
    // console.log(response.data.lectureManageDetailValue);
    const result = response.data.lectureManageDetailValue;

    lecName.value = result.lecName;
    insName.value = props.lectureData.insName;
    lecPersonnel.value = result.lecPersonnel;
  } catch (err) {
    console.log(err);
  }
};

const handleSave = async () => {
  try {
    //step1. validation
    if (!lecName.value) {
      alert('강의명을 입력해주세요!');
      return;
    }
    if (lecName.value === 'new' && !customLecName.value) {
      alert('강의명을 입력해주세요!');
      return;
    }
    if (!lecInstructorId.value) {
      alert('강사명을 입력해주세요!');
      return;
    }
    if (!lecClassRoomId.value) {
      alert('강의실을 선택해주세요!');
      return;
    }
    if (
      lecPersonnel.value === '' ||
      lecPersonnel.value === 'undefined' ||
      lecPersonnel.value === null
    ) {
      alert('정원을 입력해주세요!');
      return;
    }
    if (!Number.isInteger(lecPersonnel.value)) {
      alert('정원은 숫자를 넣어주세요.');
      return;
    }
    if (lecPersonnel.value < 0) {
      alert('정원은 0 이하일 수 없습니다.');
      return;
    }
    if (lecPersonnel.value > 50) {
      // 사용자가 '취소'를 누르면 confirmResult는 false가 됩니다.
      const confirmResult = window.confirm('정원이 50명을 초과했습니다. 계속 진행하시겠습니까?');

      // 만약 사용자가 '취소'를 눌렀다면(!confirmResult), 함수 실행을 중단합니다.
      if (!confirmResult) {
        return; // 여기서 함수가 종료됩니다.
      }
    }
    if (!lecStartDate.value) {
      alert('강의시작일을 입력해주세요!');
    }
    if (!lecEndDate.value) {
      alert('강의종료일을 입력해주세요!');
    }

    if (lecStartDate.value && lecEndDate.value) {
      const from = new Date(lecStartDate.value);
      const to = new Date(lecEndDate.value);

      if (from > to) {
        alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
        return;
      }
    }

    if (!lecDaysCnt.value) {
      alert('강의 일 수를 입력해주세요.');
      return;
    }

    if (!Number.isInteger(lecDaysCnt.value)) {
      alert('강의일 수에 숫자를 넣어주세요.');
      return;
    }

    if (lecDaysCnt.value < 0) {
      alert('강의일 수는 0 이하일 수 없습니다.');
      return;
    }

    //step2. 전처리
    const from = formatDateTime(lecStartDate.value, 'YYYY-MM-DD');
    const to = formatDateTime(lecEndDate.value, 'YYYY-MM-DD');

    //step3. prepare params
    const payload = {
      lecInstructorId: lecInstructorId.value,
      lecRoomId: lecClassRoomId.value,
      lecName: finalLecName.value,
      lecStartDate: from,
      lecEndDate: to,
      lecPersonnel: lecPersonnel.value,
      lecDaysCnt: lecDaysCnt.value,
    };

    //step4. axios.post
    if (isEditMode.value) {
      const finalPayload = new URLSearchParams();
      finalPayload.append('lecId', lecId.value);
      for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
          finalPayload.append(key, payload[key]);
        }
      }

      await axios.post(`/api/lecture/lectureManageUpdate.do`, finalPayload);
    } else {
      await axios.post(`/api/lecture/lectureManageSave.do`, payload);
    }

    //step5. 후처리
    alert('강의 저장 성공!');

    emit('lecture-manage-register-submit-success');

    closeModal();
  } catch (err) {
    console.log(err);
    alert('강의 저장에 실패했습니다!');
  }
};

const closeModal = () => {
  emit('lecture-manage-register-close');
  modalState.$patch({ isOpen: false, type: 'lecture-manage-register' });
};

// 1. 드롭다운 선택 시, ID에 맞는 이름으로 insName을 업데이트하는 watcher
watch(lecInstructorId, (newId) => {
  // 새로운 ID가 있고, 강사 목록이 로드된 상태일 때만 실행
  if (newId && insNameList.value.length > 0) {
    const selectedInstructor = insNameList.value.find((ins) => ins.lecInstructorId === newId);
    if (selectedInstructor) {
      insName.value = selectedInstructor.insName;
    }
  }
});

// 2. Props가 변경될 때, lecInstructorId와 insName을 모두 업데이트
watch(
  () => props.lectureData,
  (newData) => {
    // 부모로부터 유효한 데이터가 넘어왔을 때
    if (newData && Object.keys(newData).length > 0 && newData.lecId) {
      //수정모드로 설정
      isEditMode.value = true;

      // API 호출 전, props의 값으로 상태를 즉시 업데이트
      lecId.value = newData.lecId;
      lecInstructorId.value = newData.lecInstructorId;
      insName.value = newData.insName;
      lecClassRoomId.value = newData.lecRoomId;

      lecStartDate.value = formatDateTime(newData.lecStartDate, 'YYYY-MM-DD');
      lecEndDate.value = formatDateTime(newData.lecEndDate, 'YYYY-MM-DD');

      // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      // console.log(lecStartDate.value);
      // console.log(lecEndDate.value);

      // 나머지 로직 실행
      searchSelectBox();
      searchLectureDetail(newData.lecId, newData.lecInstructorId);
    } else {
      // 데이터가 없으면 '생성 모드'로 설정
      isEditMode.value = false;

      resetForm();

      searchSelectBox();
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

let isUpdating = false;

// 시작일 변경 감시
watch(lecStartDate, (newStart) => {
  if (isUpdating || !newStart) return;

  // 1. 주말 선택 방지
  if (isWeekend(newStart)) {
    alert('주말은 시작일로 선택할 수 없습니다.');
    lecStartDate.value = null; // 초기화
    return;
  }

  // 2. 종료일이 시작일보다 빠르면 종료일을 시작인 다음날로 자동 조정 (주말건너뛰고)
  if (lecEndDate.value && newStart > lecEndDate.value) {
    alert('강의 종료일은 시작일보다 빠를 수 없습니다. 날짜를 조정합니다.');
    let nextDay = new Date(newStart);
    nextDay.setDate(nextDay.getDate() + 1);
    while (isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    isUpdating = true;
    lecEndDate.value = formatDateTime(nextDay, 'YYYY-MM-DD');
    requestAnimationFrame(() => {
      isUpdating = false;
    }); // 다음 프레임에서 플래그 해제
  }

  const end = lecEndDate.value;
  // 3. 최대 강의 기간(200일) 체크 및 시작일 자동 조정
  if (end && lecDaysCnt.value > 200) {
    alert('강의 기간은 최대 200일까지만 설정할 수 있습니다. 시작일을 조정합니다.');
    let adjustedStart = new Date(end);
    let count = 0;
    // 종료일로부터 거꾸로 200 영업일을 계산합니다.
    while (count < 200) {
      if (!isWeekend(adjustedStart)) {
        count++;
      }
      if (count < 200) {
        adjustedStart.setDate(adjustedStart.getDate() - 1);
      }
    }
    isUpdating = true;
    lecStartDate.value = formatDateTime(adjustedStart, 'YYYY-MM-DD');
    requestAnimationFrame(() => {
      isUpdating = false;
    });
  }
});

// 종료일 변경 감시
watch(lecEndDate, (newEnd) => {
  if (isUpdating || !newEnd) return;
  const start = lecStartDate.value;

  // 1. 주말 선택 방지
  if (isWeekend(newEnd)) {
    alert('주말은 종료일로 선택할 수 없습니다.');
    lecEndDate.value = null;
    return;
  }

  // 2. 종료일이 시작일보다 빠른지 체크
  if (start && newEnd < start) {
    alert('강의 종료일은 시작일보다 빠를 수 없습니다. 날짜를 조정합니다.');
    let nextDay = new Date(start);
    nextDay.setDate(nextDay.getDate() + 1);
    while (isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    isUpdating = true;
    lecEndDate.value = formatDateTime(nextDay, 'YYYY-MM-DD');
    requestAnimationFrame(() => {
      isUpdating = false;
    });
    return; // 자동 조정 후 함수 종료
  }

  // 3. 최대 강의 기간(200일) 체크 및 자동 조정
  if (lecDaysCnt.value > 200) {
    alert('강의 기간은 최대 200일까지만 설정할 수 있습니다. 종료일을 조정합니다.');
    let adjustedEnd = new Date(start);
    let count = 0;
    while (count < 200) {
      if (!isWeekend(adjustedEnd)) {
        count++;
      }
      if (count < 200) {
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      }
    }
    isUpdating = true;
    lecEndDate.value = formatDateTime(adjustedEnd, 'YYYY-MM-DD');
    requestAnimationFrame(() => {
      isUpdating = false;
    });
  }
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form @submit.prevent="handleSave" class="test-register-modal">
        <div class="modal-header">
          <h2>{{ isEditMode ? '강의 상세' : '시험 등록' }}</h2>
          <button class="close-btn" type="button" @click="closeModal()">&times;</button>
        </div>

        <div class="modal-content">
          <table class="form-table">
            <tbody>
              <tr>
                <td class="label-cell">
                  <label for="lecture">강의</label><span class="required-star">*</span>
                </td>
                <td colspan="3">
                  <select v-model="lecName" :disabled="isEditMode">
                    <option disabled value="">강의 선택</option>
                    <option value="new">직접 입력</option>
                    <option v-for="lec in lecList" :key="lec.lecId" :value="lec.lecName">
                      {{ lec.lecName }}
                    </option>
                  </select>
                  <label v-if="lecName === 'new'" class="sub-input">
                    <input
                      v-model="customLecName"
                      type="text"
                      placeholder="새로운 강의명을 입력하세요"
                      class="new-lecture-input"
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td class="label-cell"><label>강사</label><span class="required-star">*</span></td>
                <td colspan="3">
                  <!-- <input type="text" :value="lecInstructorName" readonly /> -->
                  <select v-model="lecInstructorId">
                    <option disabled value="">강사 선택</option>
                    <option
                      v-for="ins in insNameList"
                      :key="ins.lecInstructorId"
                      :value="ins.lecInstructorId"
                    >
                      {{ ins.insName }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="label-cell"><label>정원</label><span class="required-star">*</span></td>
                <td>
                  <input v-model="lecPersonnel" type="number" />
                </td>
                <td class="label-cell">
                  <label>강의실</label><span class="required-star">*</span>
                </td>
                <td>
                  <select v-model="lecClassRoomId">
                    <option disabled value="">강의실 선택</option>
                    <option
                      v-for="room in lecClassRoomList"
                      :key="room.roomId"
                      :value="room.roomId"
                    >
                      {{ room.roomName }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td class="label-cell">
                  <label for="start-datetime">강의 시작일</label
                  ><span class="required-star">*</span>
                </td>
                <td>
                  <input
                    type="date"
                    id="start-datetime"
                    v-model="lecStartDate"
                    name="start-datetime"
                    :min="dateLimits.min"
                    :max="dateLimits.max"
                  />
                </td>
                <td class="label-cell">
                  <label for="end-datetime">강의 종료일</label><span class="required-star">*</span>
                </td>
                <td>
                  <input
                    type="date"
                    id="end-datetime"
                    v-model="lecEndDate"
                    name="end-datetime"
                    :min="dateLimits.min"
                    :max="dateLimits.max"
                  />
                </td>
              </tr>
              <tr>
                <td class="label-cell">
                  <label>강의일수</label><span class="required-star">*</span>
                </td>
                <td>
                  <span> {{ lecDaysCnt }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" type="submit">{{ isEditMode ? '수정' : '저장' }}</button>
          <button class="btn btn-secondary" type="button" @click="closeModal()">취소</button>
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

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { ref, watch } from 'vue';

const props = defineProps({
  lectureData: {
    type: Object, // 데이터 타입은 객체
    default: () => ({}), // 기본값은 빈 객체
  },
});

const emit = defineEmits(['testUpdateSuccess']);

const modalState = useModalState();

const testId = ref(0);
const lecId = ref(''); //선택된 강의의 ID를 저장할 ref
const lecName = ref(''); //선택된 강의의 ID를 저장할 ref
const lecInstructorName = ref('');
const lecRoomName = ref('');
const lecStartDate = ref('');
const lecEndDate = ref('');

//testInfoUpdate.do
const updateTest = async () => {
  try {
    //유효성 검사
    if (testId.value == '' || testId.value == undefined || testId.value == null) {
      alert('id가 선택되지 않았습니다!');
      return;
    }
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
    modalState.$patch({ isOpen: false, type: 'test-update' });
    emit('testUpdateSuccess');

    //close modal
  } catch (err) {
    console.log(err);
  }
};

watch(
  () => props.lectureData,
  (newData) => {
    if (newData && newData.lecId && newData.testId) {
      console.log('Props로 전달받은 데이터:', newData);

      testId.value = newData.testId;
      lecId.value = newData.lecId;
      lecName.value = newData.lecName;
      lecInstructorName.value = newData.lecInstructorName;
      lecRoomName.value = newData.lecRoomName;

      // 2. 날짜 형식을 <input type="datetime-local">에 맞게 변환
      // 예: "2025-07-21 12:30:00" -> "2025-07-21T12:30"
      lecStartDate.value = newData.testBeginDate.substring(0, 16).replace(' ', 'T');
      lecEndDate.value = newData.testEndDate.substring(0, 16).replace(' ', 'T');
    }
  },
  {
    immediate: true, // 컴포넌트가 처음 로드될 때도 즉시 한 번 실행
    deep: true, // 객체 내부의 속성 변경까지 감지
  },
);

// onMounted(() => {
//   console.log(props);
// });
</script>

<template>
  <Teleport to="body">
    <form @submit.prevent="updateTest">
      <div class="modal-container">
        <div class="modal-header">
          <h2>시험 상세</h2>
          <button
            class="close-button"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-create' })"
          >
            &times;
          </button>
        </div>

        <div class="modal-body">
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
          <button class="btn-save" type="submit">수정</button>
          <button
            class="btn-cancel"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-update' })"
          >
            취소
          </button>
        </div>
      </div>
    </form>
  </Teleport>
</template>

<style>
/* @import './styled.css'; */
</style>

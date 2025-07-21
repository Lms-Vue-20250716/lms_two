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
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%');
    lectureSelectBoxList.value = response.data.lecSelectBoxList;
    console.log(response.data);
    console.log(lectureSelectBoxList.value);
    console.log('$$$$$$$$$$$$$$$$$$$$$$$');
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
    if (lecStartDate.value && lecEndDate.value) {
      const from = new Date(lecStartDate);
      const to = new Date(lecEndDate);

      if (to < from) {
        alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
        return;
      }
    }

    const param = {
      lecId: selectedLecId.value,
      // datetime-local의 'T'를 공백으로 치환하여 'YYYY-MM-DD HH:MI' 형식으로 만듦
      testBeginDate: lecStartDate.value.replace('T', ' ') + ':00',
      testEndDate: lecEndDate.value.replace('T', ' ') + ':00',
      testType: '0',
    };

    await axios.post('/api/lecture/testInfoSave.do', param);

    // 성공 시 모달 닫기 및 부모 컴포넌트에 이벤트 전달
    modalState.$patch({ isOpen: false, type: 'test-create' });
    emit('testPostSuccess');

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
    <form @submit.prevent="registerTest">
      <div class="modal-container">
        <div class="modal-header">
          <h2>시험 등록</h2>
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
          <button class="btn-save" type="submit">저장</button>
          <button
            class="btn-cancel"
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'test-create' })"
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

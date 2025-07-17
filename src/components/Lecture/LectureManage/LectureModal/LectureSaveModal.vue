<script setup>
import BaseDataPicker from '@/components/common/BaseDataPicker.vue';
import { useModalState } from '@/stores/lectureManageModalState';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';

//emit
const emit = defineEmits(['save-success']); // 부모에게 보낼 이벤트를 정의합니다.

//modal state
const modalState = useModalState();

//변수
const lecName = ref(''); //강의명
const customLecName = ref(''); //강의명 직접입력시 사용할 변수명
const lecInstructorId = ref(''); //강사 아이디
const lecClassRoomId = ref(''); //강의실

// <select> 태그의 <option> 목록으로 사용될 배열들입니다.
const lecList = ref([]);
const insNameList = ref([]);
const lecClassRoomList = ref([]);

const lecPersonnel = ref(''); //정원
const lecStartDate = ref(); //강의시작일
const lecEndDate = ref(); //강의종료일
const lecDaysCnt = ref(0); //강의일수  ?? - tdlecDaysCnt??

/**
 * 모달이 열릴 때, 각 <select> 태그를 채울 옵션 목록을 서버에서 가져옵니다.
 */
const fetchLectureOptions = async () => {
  try {
    const response = await axios.get('/api/lecture/lectureManageSelectBox.do');
    // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    // console.log(response.data);
    lecList.value = response.data.lecSelectBoxLecNameList || [];
    insNameList.value = response.data.lecSelectBoxInstructorInfoList || [];
    lecClassRoomList.value = response.data.lecSelectBoxClassRoomList || [];

    console.log('lecList', lecList);
    console.log('insNameList', insNameList);
    console.log('lecClassRoomList', lecClassRoomList);
  } catch (err) {
    console.log(err);
  }
};

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

const handleSave = async () => {
  try {
    //validation
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

    if (lecStartDate.value && lecEndDate.value) {
      const from = new Date(lecStartDate);
      const to = new Date(lecEndDate);

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

    //param
    const payload = {
      lecInstructorId: lecInstructorId.value,
      lecRoomId: lecClassRoomId.value,
      lecName: finalLecName.value,
      lecStartDate: lecStartDate.value,
      lecEndDate: lecEndDate.value,
      lecPersonnel: lecPersonnel.value,
      lecDaysCnt: lecDaysCnt.value,
    };

    //axios.get
    // const response = await axios.get(`/api/lecture/lectureListBody.do?${params.toString()}`);
    await axios.post(`/api/lecture/lectureManageSave.do`, payload);

    alert('강의 저장 성공!');

    //부모에게 save 성공했다 보내기
    emit('save-success'); // 부모에게 성공 이벤트를 보냅니다.

    //close modal
    modalState.$patch({ isOpen: false, type: 'lecture-manage-save' });
  } catch (err) {
    console.log(err);
    alert('강의 저장에 실패했습니다!');
  }
};

const handleUpdate = () => {
  // UPDATE
  // 	tb_lecture_info
  // SET
  // 	loginID = #{lecInstructorId}
  // 	, room_id = #{lecRoomId}
  // 	, lec_name = #{lecName}
  // 	, lec_start_date = #{lecStartDate}
  // 	, lec_end_date = #{lecEndDate}
  // 	, lec_personnel = #{lecPersonnel}
  // 	, lec_days_cnt = #{lecDaysCnt}
  // WHERE lec_id = #{lecId}
  //Q. userId 어떻게 가져오지?
};

onMounted(() => {
  fetchLectureOptions();
});
</script>
<template>
  <Teleport to="body">
    <div class="modal-save-overlay">
      <form @submit.prevent="handleSave" ref="formRef" class="modal-save-form modal-save-container">
        <label>
          강의명:
          <select v-model="lecName">
            <option disabled value="">강의 선택</option>
            <option value="new">직접 입력</option>
            <option v-for="lec in lecList" :key="lec.lecId" :value="lec.lecName">
              {{ lec.lecName }}
            </option>
          </select>
        </label>

        <label v-if="lecName === 'new'" class="sub-input">
          <input
            v-model="customLecName"
            type="text"
            placeholder="새로운 강의명을 입력하세요"
            class="new-lecture-input"
          />
        </label>

        <lable>
          강사:
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
        </lable>
        <label>
          정원 :
          <input v-model="lecPersonnel" type="number" name="lecPersonnel" />
        </label>
        <label>
          강의실:
          <select v-model="lecClassRoomId">
            <option disabled value="">강의실 선택</option>
            <option v-for="room in lecClassRoomList" :key="room.roomId" :value="room.roomId">
              {{ room.roomName }}
            </option>
          </select>
        </label>
        <!-- <label> 강의시작일 :<input v-model="lecStartDate" type="text" name="lecStartDate" /></label> -->
        <lable> 강의시작일: <BaseDataPicker v-model="lecStartDate" /></lable>
        <!-- <label> 강의종료일 : <input v-model="lecEndDate" type="text" name="lecEndDate" /> </label> -->
        <lable> 강의종료일: <BaseDataPicker v-model="lecEndDate" /></lable>
        <label> 강의일수 :<input v-model="lecDaysCnt" type="number" name="lecDaysCnt" /> </label>
        <div class="modal-save-button-container">
          <button type="submit">저장</button>
          <button
            type="button"
            @click="modalState.$patch({ isOpen: false, type: 'lecture-manage-save' })"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
<style scoped>
@import './modal_saved_styled.css';
</style>

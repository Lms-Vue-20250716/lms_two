<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detaiId: id } = defineProps({ detailId: { type: Number, default: 0 } });

// const modalState = useModalState();
const formRef = ref();
const detail = ref({
  lecName: '',
  qnaTitle: '',
  qnaContent: '',
});

const modalState = useModalState();

// const handlerDelete = () => {
//   const param = new URLSearchParams();
//   param.append('qnaId', id);
//   axios.post('/api/support/deleteQuestion.do', param).then((res) => {
//     if (res.data.result === 'success') {
//       alert('삭제 되었습니다');
//       modalState.$patch({ isOpen: false });
//       emit('postSuccess');
//     } else {
//       alert('삭제 실패');
//     }
//   });
// };

// // 저장 버튼 클릭시 저장
// const handlerInsert = () => {
//   const formData = new FormData(formRef.value);
//   formData.append('qnaId', id);

//   try {
//     axios.post('/api/saveAnswer.do', formData).then((res) => {
//       if (res.data.result === 'success') {
//         alert('저장 되었습니다.');
//       }
//       modalState.$patch({ isOpen: false });
//       emit('postSuccess');
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// // 수정 버튼 클릭시 수정
// const handlerUpdate = () => {
//   const formData = new FormData(formRef.value);
//   formData.append('noticeId', id);

//   axios.post('/api/support/updateQuestion.do', formData).then((res) => {
//     if (res.data.result === 'success') {
//       alert('수정 되었습니다.');
//       modalState.$patch({ isOpen: false });
//       emit('postSuccess');
//     }
//   });
// };

// // 제목 클릭시 모달창 조회
// const searchDetail = () => {
//   const param = new URLSearchParams();
//   param.append('qnaId', id);

//   axios.post('/api/support/getQnaDetail.do', param).then((res) => {
//     detail.value = res.data.detailValue;
//   });
// };

// 강의명 목록을 서버 또는 하드코딩으로 불러올 수 있음.
const lecOptions = ref([]);

// onMounted(() => {
//   id && searchDetail();
// });

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <label>
          강의명:
          <select v-model="detail.lecName" name="lecName">
            <option disabled value="">클릭해서 강의 선택</option>
            <template v-if="lecOptions.length > 0">
              <option v-for="lec in lecOptions" :key="lec" :value="lec">{{ lec }}</option>
            </template>
            <template v-else>
              <option disabled>수강중인 강의가 없습니다.</option>
            </template>
          </select>
        </label>
        <label>
          제목:
          <input v-model="detail.qnaTitle" type="text" name="qnaTitle" />
        </label>
        <label>
          내용:
          <textarea
            v-model="detail.qnaContent"
            type="qnaContent"
            rows="4"
            class="textarea"
          ></textarea>
        </label>

        <div class="button-container">
          <button type="button" @click="modalState.$patch({ isOpen: false })">취소</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
@import './styled.css';
</style>

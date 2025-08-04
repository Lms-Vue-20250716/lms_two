<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emits = defineEmits(['unMountedModal']);

const { lectureId } = defineProps({
  lectureId: { type: Number, default: 0 },
});

const startDate = ref('');
const endDate = ref('');

const modalState = useModalState();
const searchDetail = ref({});
const lectureDetail = () => {
  const url = `/api/user/lec-detail/${lectureId}`;
  axios.get(url).then((res) => {
    console.log(res);
    searchDetail.value = res.data;
    startDate.value = searchDetail.value.lecStartDate.slice(0, 10);
    endDate.value = searchDetail.value.lecEndDate.slice(0, 10);
  });
};

onMounted(() => {
  lectureId && lectureDetail();
});

onUnmounted(() => {
  emits('unMountedModal', 0);
});
</script>
<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">강의 상세</h3>
          <button class="close-btn" @click="modalState.$patch({ isOpen: false })">×</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">강의 이름</label>
                <input
                  v-model.lazy="searchDetail.lecName"
                  type="text"
                  class="form-input"
                  readonly
                />
              </div>

              <div class="form-group">
                <label class="form-label">회차</label>
                <input v-model.lazy="searchDetail.lectureRound" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">담당 강사</label>
                <input v-model.lazy="searchDetail.tutorName" type="text" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">정원</label>
                <input v-model.lazy="searchDetail.lecPersonnel" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">개강 일자</label>
                <input v-model.lazy="startDate" type="text" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">종강 일자</label>
                <input v-model.lazy="endDate" type="text" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">평균 점수</label>
                <input v-model.lazy="searchDetail.avgScore" type="text" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label">과락 인원</label>
                <input v-model.lazy="searchDetail.failedStudents" type="text" class="form-input" />
              </div>
            </div>
          </div>

          <div class="button-container">
            <button class="save-btn" @click="modalState.$patch({ isOpen: false })">취소</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

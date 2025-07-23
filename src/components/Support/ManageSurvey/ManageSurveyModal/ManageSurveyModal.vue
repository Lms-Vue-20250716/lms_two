<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  surveyId: { type: Number, required: true },
});
const emit = defineEmits(['close']);

const surveyList = ref([]);
const avgResult = ref('');

onMounted(() => {
  axios
    .get('/support/getSurveyDetail.do', { params: { surveyId: props.surveyId } })
    .then((res) => {
      surveyList.value = res.data.detailList || [];
      avgResult.value = res.data.avgResult || '';
    })
    .catch((err) => console.error('상세조회 실패', err));
});

const closeModal = () => emit('close');
</script>

<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>상세 보기</h3>
          <button class="close-btn" @click="closeModal">X</button>
        </div>

        <table class="survey-table">
          <thead>
            <tr>
              <th>문항</th>
              <th>답변</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, idx) in surveyList" :key="idx">
              <td>{{ item.surveyContent }}</td>
              <td>{{ item.surveyResult }}</td>
            </tr>
            <tr>
              <td>평균</td>
              <td>{{ avgResult }}</td>
            </tr>
          </tbody>
        </table>

        <div class="modal-footer">
          <button class="close-btn-lg" @click="closeModal">닫기</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style>
@import './styled.css';
</style>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  surveyData: { type: Object, required: true },
});
const emit = defineEmits(['close']);

const surveyList = ref([]);
const avgResult = ref('');

const fetchSurveyDetail = async () => {
  try {
    const { lecId, loginId } = props.surveyData;
    const res = await axios.get('/support/getSurveyDetail.do', { params: { lecId, loginId } });
    surveyList.value = res.data.detail || [];
    avgResult.value =
      surveyList.value.reduce((sum, item) => sum + (item.surveyResult || 0), 0) /
        surveyList.value.length || 0;
  } catch (error) {
    console.error('상세조회 실패:', error);
  }
};

watch(() => props.surveyData, fetchSurveyDetail, { immediate: true });

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

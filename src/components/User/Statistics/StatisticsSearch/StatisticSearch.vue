<script setup>
import router from '@/router';
import axios from 'axios';
import StatisticViewModal from '../StatisticViewModal/StatisticViewModal.vue';
import { onMounted, ref, watch } from 'vue';
import { useModalState } from '@/stores/modalState';

const lecName = ref('');
const lecRound = ref([]);
const lecStartRound = ref(0);
const lecEndRound = ref(0);
const lecKindOf = ref([]);
const modalState = useModalState();

const handlerSearch = () => {
  const query = [];

  !lecName.value || query.push(`lectureName=${lecName.value}`);
  !lecStartRound.value || query.push(`lectureStartAround=${lecStartRound.value}`);
  !lecEndRound.value || query.push(`lectureEndAround=${lecEndRound.value}`);

  const queryString = query.length > 0 ? `?${query.join('&')}` : '';

  router.push(queryString);
};

const lecNameSelectBox = () => {
  axios.post('/api/user/lecture-selectbox').then((res) => {
    lecKindOf.value = res.data;
  });
};

const lecAroundByLecName = () => {
  if (!lecName.value) {
    return;
  }

  const url = `/api/user/lecture-round-selectbox/${lecName.value}`;
  axios.get(url).then((res) => {
    lecRound.value = res.data;
  });
};

watch(lecStartRound.value, (newStart) => {
  if (newStart && lecEndRound.value) {
    const startRound = parseInt(newStart);
    const endRound = parseInt(lecEndRound.value);

    if (endRound < startRound) {
      lecEndRound.value = '';
    }
  }
});

watch(lecEndRound.value, (newEnd) => {
  if (newEnd && lecStartRound.value) {
    const endRound = parseInt(newEnd);
    const startRound = parseInt(lecStartRound.value);
    if (startRound > endRound) {
      lecStartRound.value = '';
    }
  }
});

const isStartRoundDisabled = (startValue) => {
  if (!lecStartRound.value || lecStartRound.value === '') {
    return false;
  }
  return parseInt(startValue) < parseInt(lecStartRound.value);
};

const isEndRoundDisabled = (endValue) => {
  if (!lecEndRound.value || lecEndRound.value === '') {
    return false;
  }
  return parseInt(endValue) > parseInt(lecEndRound.value);
};

watch(
  () => lecName.value,
  () => {
    lecAroundByLecName();
  },
);

onMounted(() => {
  window.location.search && router.replace(window.location.pathname);
  lecNameSelectBox();
});
</script>

<template>
  <div class="statistics-container">
    <div class="input-box">
      강의 이름
      <select v-model="lecName">
        <option value="" selected>전체</option>
        <option v-for="lec in lecKindOf" :key="lec.lecId" :value="lec.lecName">
          {{ lec.lecName }}
        </option>
      </select>
      회차
      <select v-model="lecStartRound">
        <option value="">전체</option>
        <option
          v-for="roundOption in lecRound"
          :key="roundOption.lectureRound"
          :value="roundOption.lectureRound"
          :disabled="isEndRoundDisabled(roundOption.lectureRound)"
        >
          {{ roundOption.lectureRound }}회
        </option>
      </select>
      ~
      <select v-model="lecEndRound">
        <option value="">전체</option>
        <option
          v-for="roundOption in lecRound"
          :key="roundOption.lectureRound"
          :value="roundOption.lectureRound"
          :disabled="isStartRoundDisabled(roundOption.lectureRound)"
        >
          {{ roundOption.lectureRound }}회
        </option>
      </select>

      <button @click="handlerSearch">검색</button>
      <button @click="modalState.$patch({ isOpen: true, type: 'view' })">통계</button>
    </div>
  </div>
  <StatisticViewModal
    v-if="modalState.type === 'view' && modalState.isOpen"
    :lec-name="lecName"
    :lecture-start-around="lecStartRound"
    :lecture-end-around="lecEndRound"
  />
</template>

<style>
@import './styled.css';
</style>

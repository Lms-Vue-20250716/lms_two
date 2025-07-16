<script setup>
import BaseDataPicker from '@/components/common/BaseDataPicker.vue';
import ContentBox from '@/components/common/ContentBox.vue';
import { watch } from 'vue';
import { ref } from 'vue';

const props = defineProps({
  initialQuery: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['search']);

const selectOption = ref('');
const title = ref('');
const startDate = ref();
const endDate = ref();

const handleSearch = () => {
  if (selectOption == '' || selectOption == undefined || selectOption == null) {
    alert('검색 옵션을 넣으세요!');
    return;
  }
  if (startDate && endDate) {
    const from = new Date(startDate);
    const to = new Date(endDate);

    if (to < from) {
      alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
      return;
    }
  }

  const newQuery = {};

  if (selectOption.value) newQuery.selectOption = selectOption.value;
  if (title.value) newQuery.title = title.value;
  if (startDate.value) newQuery.startDate = startDate.value;
  if (endDate.value) newQuery.endDate = endDate.value;

  emit('search', newQuery);
};

watch(
  //1. 감시대상
  () => props.initialQuery,
  //2. 값이 바뀌면 새로운 값을 newValue로 받아와서 로컬 ref 변수들에게 넣는다.
  (newValue) => {
    title.value = newValue.title || '';
    startDate.value = newValue.startDate || '';
    endDate.value = newValue.endDate || '';
  },
  { deep: true, immediate: true },
);
</script>
<template>
  <ContentBox>강의 목록</ContentBox>
  <form @submit.prevent="handleSearch">
    <select>
      <option value="강의명" selected="selected">강의명</option>
      <option value="강사명">강사명</option>
      <option value="강의실">강의실</option>
    </select>
    <input v-model="title" placeholder="검색어를 입력해주세요." />
    <span>기간</span>
    <BaseDataPicker v-model="startDate" />
    ~
    <BaseDataPicker v-model="endDate" />
    <button>검색</button>
  </form>
</template>
<style scoped></style>

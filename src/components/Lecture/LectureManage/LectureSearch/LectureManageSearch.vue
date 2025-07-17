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

const searchTag = ref('lecName');
const searchTitle = ref('');
const searchStDate = ref();
const searchEdDate = ref();

const handleSearch = () => {
  if (searchTag.value == '' || searchTag.value == undefined || searchTag.value == null) {
    alert('검색 옵션을 넣으세요!');
    return;
  }
  if (searchStDate.value && searchEdDate.value) {
    const from = new Date(searchStDate);
    const to = new Date(searchEdDate);

    if (to < from) {
      alert('종료일이 시작일 보다 더 빠를 수 없습니다!');
      return;
    }
  }

  const newQuery = {};

  if (searchTag.value) newQuery.searchTag = searchTag.value;
  if (searchTitle.value) newQuery.searchTitle = searchTitle.value;
  if (searchStDate.value) newQuery.searchStDate = searchStDate.value;
  if (searchEdDate.value) newQuery.searchEdDate = searchEdDate.value;

  emit('search', newQuery);
};

watch(
  //1. 감시대상
  () => props.initialQuery,
  //2. 값이 바뀌면 새로운 값을 newValue로 받아와서 로컬 ref 변수들에게 넣는다.
  (newValue) => {
    searchTitle.value = newValue.searchTitle || '';
    searchStDate.value = newValue.searchStDate || '';
    searchEdDate.value = newValue.searchEdDate || '';
  },
  { deep: true, immediate: true },
);
</script>
<template>
  <ContentBox>강의 목록</ContentBox>
  <div class="lecture-manager-container">
    <form @submit.prevent="handleSearch">
      <select v-model="searchTag">
        <option value="lecName">강의명</option>
        <option value="lecInstructorName">강사명</option>
        <option value="lecRoomName">강의실</option>
      </select>
      <input v-model="searchTitle" placeholder="검색어를 입력해주세요." />
      <span>기간</span>
      <BaseDataPicker v-model="searchStDate" />
      ~
      <BaseDataPicker v-model="searchEdDate" />
      <button>검색</button>
    </form>
  </div>
</template>
<style setup>
@import './styled.css';
</style>

<script setup>
import { computed } from 'vue';

//Q. diff PageNavigation?
//A. currentPage 변수를 <LectureMain /> 에서 관리하도록 수정함.

//Q. 왜?
//A. 3페이지에서 모달로 submit한 후, 게시판을 1페이지로 refresh하면, pagination도 1페이지로 refresh 되어야 하는데,
// currentPage 변수를 <LectureMain />에서 관리를 안하다니보니 저 값이 업데이트 안되어 pagination은 그대로 3을 가르키는 문제가 있었음.

// @totalItems : 총 리스트의 요소의 갯수
// @itemsPerPage : 페이지당 보여줄 요소의 갯수 (게시판의 row의 수)
// @onPageChange : 페이징 버튼 누를 때 마다 실행되는 함수
// @currentPage: 현재 페이지
const props = defineProps({
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 5,
  },
  onPageChange: {
    type: Function,
    required: true,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
});

//pagination bar의 번호 갯수
const pageRange = 5;

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const pageNumbers = computed(() => {
  let start = Math.max(1, props.currentPage - Math.floor(pageRange / 2));
  const end = Math.min(start + pageRange - 1, totalPages.value);

  if (end === totalPages.value) {
    start = Math.max(1, end - pageRange + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const handlePageChange = (page) => {
  if (page === props.currentPage) return;
  props.onPageChange(page);
};
</script>
<template>
  <div class="pagination-container">
    <button :disabled="currentPage === 1" class="pagination-button" @click="handlePageChange(1)">
      처음
    </button>

    <button
      :disabled="currentPage === 1"
      class="pagination-button"
      @click="handlePageChange(props.currentPage - 1)"
    >
      이전
    </button>

    <div class="pagination-numbers-container">
      <button
        v-for="page in pageNumbers"
        :key="page"
        :class="['pagination-number-button', { active: props.currentPage === page }]"
        @click="handlePageChange(page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      :disabled="currentPage === totalPages"
      class="pagination-button"
      @click="handlePageChange(props.currentPage + 1)"
    >
      다음
    </button>

    <button
      :disabled="currentPage === totalPages"
      class="pagination-button"
      @click="handlePageChange(totalPages)"
    >
      마지막
    </button>
  </div>
</template>

<style scoped>
@import 'tailwindcss';

.pagination-container {
  @apply mt-4 flex items-center justify-center gap-2;
}

.pagination-button {
  @apply rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out;
}

.pagination-button:hover:not(:disabled) {
  @apply -translate-y-0.5 border-blue-400 bg-blue-50 text-blue-600 shadow-md;
}

.pagination-button:active:not(:disabled) {
  @apply translate-y-0 transform bg-blue-100;
}

.pagination-button:disabled {
  @apply cursor-not-allowed opacity-50;
}

.pagination-number-button {
  @apply rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-in-out hover:bg-blue-50;
}

.pagination-number-button.active {
  @apply bg-blue-500 text-white shadow-md hover:bg-blue-600;
}

.pagination-numbers-container {
  @apply flex gap-1;
}
</style>

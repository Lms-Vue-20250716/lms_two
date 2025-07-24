<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ClassroomModal from '../ClassroomModal/ClassroomModal.vue';

const route = useRoute();
const classroomList = ref([]);
const classroomCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const classroomSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/system/classroomListBody.do', param).then((res) => {
    classroomList.value = res.data.list;
    classroomCnt.value = res.data.count;
  });
};

// roomName 클릭하면 classroomDetail 열어줄거임 (모달창)
const classroomDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => {
    return route.query;
  },
  () => {
    classroomSearch();
  },
);

onMounted(() => {
  classroomSearch();
});
</script>
<template>
  <div class="classroom-main-container">
    <table class="classroom-table">
      <thead class="classroom-table-header">
        <tr>
          <th>번호</th>
          <th>강의실 이름</th>
          <th>강의실 정원</th>
          <th>강의실 사이즈</th>
          <th>비고</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="classroomCnt > 0">
          <tr
            v-for="classroom in classroomList"
            :key="classroom.roomId"
            class="classroom-table-row"
          >
            <td class="classroom-cell">{{ classroom.roomId }}</td>
            <td
              class="classroom-cell cursor-pointer font-bold hover:underline"
              @click="classroomDetail(classroom.roomId)"
            >
              {{ classroom.roomName }}
            </td>
            <td class="classroom-cell">{{ classroom.roomPersonnel }}</td>
            <td class="classroom-cell">{{ classroom.roomSize }}</td>
            <td class="classroom-cell">{{ classroom.roomRemark }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="classroom-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="classroomCnt"
      :items-per-page="5"
      :on-page-change="classroomSearch"
    />
  </div>
  <ClassroomModal
    v-if="modalState.isOpen"
    :detail-id
    @post-success="classroomSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

<script setup>
import PageNavigation from '@/components/common/PageNavigation.vue';
import axios from 'axios';
import { onMounted } from 'vue';
import { watch } from 'vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import EquipmentMain from '../EquipmentMain/EquipmentMain.vue';
import EquipmentSearch from '../EquipmentSearch/EquipmentSearch.vue';

const route = useRoute();
const classroomList = ref([]);
const classroomCnt = ref(0);

const classroomSearch = (cPage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('currentPage', cPage);
  param.append('pageSize', 5);

  axios.post('/api/system/classroomListBody.do', param).then((res) => {
    classroomList.value = res.data.list;
    classroomCnt.value = res.data.count;
  });
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

const selectedRoom = ref(null);

const selectRoom = (roomId) => {
  selectedRoom.value = roomId;
};
</script>
<template>
  <div class="equipment-main-container">
    <table class="equipment-table">
      <thead class="equipment-table-header">
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
            class="equipment-table-row"
          >
            <td class="equipment-cell">{{ classroom.roomId }}</td>
            <td
              class="equipment-cell cursor-pointer hover:underline"
              @click="selectRoom(classroom.roomId)"
            >
              {{ classroom.roomName }}
            </td>
            <td class="equipment-cell">{{ classroom.roomPersonnel }}</td>
            <td class="equipment-cell">{{ classroom.roomSize }}</td>
            <td class="equipment-cell">{{ classroom.roomRemark }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td colspan="4" class="equipment-empty-row">일치하는 검색 결과가 없습니다</td>
          </tr>
        </template>
      </tbody>
    </table>
    <PageNavigation
      :total-items="classroomCnt"
      :items-per-page="5"
      :on-page-change="classroomSearch"
    />
    <div v-if="selectedRoom">
      <div
        class="mx-auto mt-10 flex w-[1150px] flex-col justify-center rounded-xl bg-blue-950 p-5 font-semibold text-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        장비 상세 목록
      </div>
      <EquipmentSearch />
      <EquipmentMain v-if="selectedRoom" :room-id="selectedRoom" />
    </div>
  </div>
</template>

<style>
@import './styled.css';
</style>

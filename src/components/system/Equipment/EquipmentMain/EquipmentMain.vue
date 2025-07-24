<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import PageNavigation from '@/components/common/PageNavigation.vue';
import { useRoute } from 'vue-router';
import { useModalState } from '@/stores/modalState';
import EquipmentModal from '../EquipmentModal/EquipmentModal.vue';

const props = defineProps({
  roomId: { type: Number, required: true },
});

const route = useRoute();
const equipmentList = ref([]);
const equipmentCnt = ref(0);
const modalState = useModalState();
const detailId = ref(0);

const EquipmentSearch = async (cpage = 1) => {
  const param = new URLSearchParams(route.query);
  param.append('roomId', props.roomId);
  param.append('currentPage', cpage);
  param.append('pageSize', 5);

  axios.post('/api/system/equipmentListBody.do', param).then((res) => {
    equipmentList.value = res.data.list;
    equipmentCnt.value = res.data.count;
  });
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

const deleteEquip = async (equipId) => {
  const params = new URLSearchParams();
  params.append('equipId', equipId);

  await axios.post('/api/system/equipmentDelete.do', params);
  alert('삭제되었습니다.');
  EquipmentSearch(); // 목록 새로고침
};

const equipmentDetail = (id) => {
  modalState.$patch({ isOpen: true });
  detailId.value = id;
};

watch(
  () => [props.roomId, route.query],
  () => {
    EquipmentSearch();
  },
);

onMounted(() => {
  EquipmentSearch();
});
</script>

<template>
  <div class="equipment-main-container">
    <table class="equipment-table">
      <thead class="equipment-table-header">
        <tr>
          <th>정보</th>
          <th>시리얼넘버</th>
          <th>분류</th>
          <th>장비명</th>
          <th>수량</th>
          <th>구매일자</th>
          <th>잔여 사용기한</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equip in equipmentList" :key="equip.equipId" class="equipment-table-row">
          <td>
            <img
              v-if="equip.fileExt === 'jpg' || equip.fileExt === 'png'"
              :src="`/api${equip.logicalPath}`"
              class="h-10 w-10 object-cover"
            />
            <span v-else>이미지 없음</span>
          </td>
          <td class="equipment-cell">{{ equip.equipSerial }}</td>
          <td class="equipment-cell">{{ equip.equipGroup }}</td>
          <td
            class="equipment-cell cursor-pointer !font-bold text-blue-600 hover:underline"
            @click="equipmentDetail(equip.equipId)"
          >
            {{ equip.equipName }}
          </td>
          <td class="equipment-cell">{{ equip.equipQuantity }}</td>
          <td class="equipment-cell">{{ formatDate(equip.equipPurchaseDate) }}</td>
          <td>
            <span v-if="equip.remainPeroid >= 0">{{ equip.remainPeroid }}일</span>
            <span
              v-else
              class="equipment-cell cursor-pointer text-red-600 underline"
              @click="deleteEquip(equip.equipId)"
              >장비 삭제</span
            >
          </td>
        </tr>
      </tbody>
    </table>
    <PageNavigation
      :total-items="equipmentCnt"
      :items-per-page="5"
      :on-page-change="EquipmentSearch"
    />
  </div>
  <EquipmentModal
    v-if="modalState.isOpen"
    :detail-id="detailId"
    :room-id="roomId"
    @post-success="EquipmentSearch()"
    @un-mounted-modal="detailId = $event"
  />
</template>

<style>
@import './styled.css';
</style>

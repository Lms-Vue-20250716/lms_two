<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const props = defineProps({
  detailId: { type: Number, default: 0 },
  roomId: { type: Number, default: 0 }, // 등록모드에서 전달받음
});

const id = props.detailId;
const modalState = useModalState();
const formRef = ref();
const detail = ref({});
const imageUrl = ref('');
const roomList = ref([]);

// 강의실 리스트 불러오기
const searchRoomList = async () => {
  const res = await axios.post('/api/system/classroomJsonList.do');
  roomList.value = res.data.detailValue;
};

//  날짜 변환
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 장비 상세정보 조회
const searchDetail = async () => {
  const param = new URLSearchParams();
  param.append('equipId', id);

  const res = await axios.post('/api/system/equipmentDetail.do', param);
  const raw = res.data.detailValue;

  // roomList 로딩 완료될 때까지 대기
  while (roomList.value.length === 0) {
    await new Promise((r) => setTimeout(r, 10));
  }

  // 날짜 및 기타 필드 가공
  detail.value = {
    ...raw,
    roomId: Number(raw.roomId),
    equipPurchaseDate: formatDate(raw.equipPurchaseDate),
    equipPerioduseDate: formatDate(raw.equipPerioduseDate),
  };

  // 이미지 경로 설정
  if (['jpg', 'gif', 'png'].includes(raw.fileExt?.toLowerCase())) {
    imageUrl.value = '/api' + raw.logicalPath.replace(/\\/g, '/');
  } else {
    imageUrl.value = '';
  }
};

// 등록
const handlerInsert = async () => {
  if (!validateEquipForm()) return;
  const formData = new FormData(formRef.value);
  if (props.roomId) {
    formData.set('Fileclassroom', String(props.roomId));
  }
  const res = await axios.post('/api/system/equipFileSave.do', formData);
  if (res.data.result === 'success') {
    alert('저장 되었습니다.');
    modalState.$patch({ isOpen: false });
    emit('postSuccess');
  }
};

//파일 미리보기
const handlerFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (['jpg', 'gif', 'png'].includes(ext)) {
    imageUrl.value = URL.createObjectURL(file);
  }
};

// 수정
const handlerUpdate = async () => {
  if (!validateEquipForm()) return;
  const formData = new FormData(formRef.value);
  formData.append('equipId', id);
  const res = await axios.post('/api/system/equipmentUpdate.do', formData);
  if (res.data.result === 'success') {
    alert('수정 되었습니다.');
    modalState.$patch({ isOpen: false });
    emit('postSuccess');
  }
};

// 삭제
const handlerDelete = async () => {
  const formData = new FormData(formRef.value);
  formData.append('equipId', id);
  const res = await axios.post('/api/system/equipmentDelete.do', formData);
  if (res.data.result === 'success') {
    alert('삭제 되었습니다.');
    modalState.$patch({ isOpen: false });
    emit('postSuccess');
  }
};

const validateEquipForm = () => {
  if (!detail.value.equipSerial?.trim()) {
    alert('시리얼넘버를 입력해주세요.');
    return false;
  }
  if (!detail.value.roomId) {
    alert('강의실을 선택해주세요.');
    return false;
  }
  if (!detail.value.equipName?.trim()) {
    alert('장비명을 입력해주세요.');
    return false;
  }
  if (
    detail.value.equipQuantity === undefined ||
    detail.value.equipQuantity === null ||
    Number(detail.value.equipQuantity) <= 0
  ) {
    alert('수량을 1 이상으로 입력해주세요.');
    return false;
  }
  if (!detail.value.equipPerioduseDate) {
    alert('구매일자를 입력해주세요.');
    return false;
  }
  if (!detail.value.equipGroup) {
    alert('분류를 선택해주세요.');
    return false;
  }
  if (!detail.value.equipPurchaseDate) {
    alert('사용연한을 입력해주세요.');
    return false;
  }
  return true;
};

// 초기 실행 로직
onMounted(async () => {
  await searchRoomList(); // 반드시 먼저 실행

  if (id) {
    await searchDetail(); // 수정 모드
  } else {
    detail.value.roomId = props.roomId; // 등록 모드
  }
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <div class="equipModal-overlay">
    <form ref="formRef" class="equipModal-form equipModal-container">
      <h2 class="mb-4 text-center text-xl font-bold">장비 관리</h2>
      <label
        ><span>시리얼넘버<span class="required">*</span></span>
        <input v-model="detail.equipSerial" type="text" name="equipSerial" />
      </label>

      <label
        ><span>강의실<span class="required">*</span></span>
        <select v-if="roomList.length > 0" v-model.number="detail.roomId" name="roomId">
          <option disabled value="">강의실 선택</option>
          <option v-for="room in roomList" :key="room.roomId" :value="Number(room.roomId)">
            {{ room.roomName }}
          </option>
        </select>
      </label>

      <label
        ><span>장비명<span class="required">*</span></span>
        <input v-model="detail.equipName" type="text" name="equipName" />
      </label>

      <label
        ><span>수량<span class="required">*</span></span>
        <input v-model="detail.equipQuantity" type="number" min="0" name="equipQuantity" />
      </label>

      <label
        ><span>구매일자<span class="required">*</span></span>
        <input v-model="detail.equipPerioduseDate" type="date" name="equipPerioduseDate" />
      </label>

      <label
        ><span>분류<span class="required">*</span></span>
        <select v-model="detail.equipGroup" name="equipGroup">
          <option value="">장비를 선택하세요</option>
          <option value="com">컴퓨터</option>
          <option value="ms">마우스</option>
          <option value="msp">마우스패드</option>
          <option value="kb">키보드</option>
          <option value="mt">모니터</option>
          <option value="dk">책상</option>
          <option value="chr">의자</option>
          <option value="wb">화이트보드</option>
          <option value="etc">기타</option>
        </select>
      </label>

      <label
        ><span>사용연한<span class="required">*</span></span>
        <input v-model="detail.equipPurchaseDate" type="date" name="equipPurchaseDate" />
      </label>

      <span>파일</span>
      <input id="fileInput" type="file" name="file" @change="handlerFile" />
      <label class="img-label" for="fileInput">파일 첨부하기</label>

      <div>
        <label>미리보기</label>
        <img :src="imageUrl" class="preview-image" />
      </div>

      <div class="button-container">
        <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
          {{ !id ? '저장' : '수정' }}
        </button>
        <button v-if="!!id" type="button" @click="handlerDelete">삭제</button>
        <button type="button" @click="modalState.$patch({ isOpen: false })">나가기</button>
      </div>
    </form>
  </div>
</template>

<style>
@import './EquipStyled.css';
</style>

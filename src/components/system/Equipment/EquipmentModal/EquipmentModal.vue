<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const props = defineProps({
  detailId: { type: Number, default: 0 },
  roomId: { type: Number, default: 0 },
});

const id = props.detailId;

const modalState = useModalState();
const formRef = ref();
const detail = ref({});
const imageUrl = ref('');
const roomList = ref({});

// 강의실 select box 정보를 가져옴
const searchRoomList = () => {
  axios.post('/api/system/classroomJsonList.do').then((res) => {
    console.log(res.data.detailValue);
    roomList.value = res.data.detailValue;
  });
};

// 날짜 변환
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 제목 클릭시 모달창 조회
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('equipId', id);

  axios.post('/api/system/equipmentDetail.do', param).then((res) => {
    const raw = res.data.detailValue;

    // 날짜 필드를 변환
    raw.equipPurchaseDate = formatDate(raw.equipPurchaseDate);
    raw.equipPerioduseDate = formatDate(raw.equipPerioduseDate);

    detail.value = raw;

    if (['jpg', 'gif', 'png'].includes(detail.value.fileExt)) {
      getFileImage();
    }
  });
};

// 상세조회 썸네일 구현
const getFileImage = () => {
  const param = new URLSearchParams();
  param.append('equipId', id);

  axios.post('/api/system/equipFileSave.do', param, { responseType: 'blob' }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    imageUrl.value = url;
  });
};

// 미리보기
const handlerFile = (e) => {
  const fileInfo = e.target.files;
  const fileInfoSplit = fileInfo[0].name.split('.');
  const fileExtension = fileInfoSplit[1].toLowerCase();

  if (['jpg', 'gif', 'png'].includes(fileExtension)) {
    imageUrl.value = URL.createObjectURL(fileInfo[0]);
  }
};

// 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);

  axios.post('/api/system/equipFileSave.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장 되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

// 수정
const handlerUpdate = () => {
  const formData = new FormData(formRef.value);
  formData.append('equipId', id);

  axios.post('/api/system/equipmentUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정 되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

//삭제
const handlerDelete = async () => {
  const formData = new FormData(formRef.value);
  formData.append('equipId', id);

  try {
    await axios.post('/api/system/equipmentDelete.do', formData).then((res) => {
      if (res.data.result === 'success') {
        alert('삭제 되었습니다.');
      }
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    });
  } catch (error) {
    console.log(error);
  }
};

// onMounted(() => {
//   id && searchDetail();
//   searchRoomList();
// });

onMounted(() => {
  if (!props.detailId && props.roomId) {
    detail.value.roomId = props.roomId;
  }
  props.detailId && searchDetail();
  searchRoomList();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>
<template>
  <teleport to="body">
    <div class="equipModal-overlay">
      <form ref="formRef" class="equipModal-form equipModal-container">
        <label
          >시리얼넘버 : <input v-model="detail.equipSerial" type="text" name="equipSerial"
        /></label>
        <label>
          강의실 :
          <select v-model="detail.roomId" name="roomId">
            <option disabled value="">강의실 선택</option>
            <option v-for="room in roomList" :key="room.roomId" :value="room.roomId">
              {{ room.roomName }}
            </option>
          </select>
        </label>
        <label>장비명 : <input v-model="detail.equipName" type="text" name="equipName" /></label>
        <label
          >수량 : <input v-model="detail.equipQuantity" type="number" min="0" name="equipQuantity"
        /></label>
        <label
          >구매일자 :
          <input v-model="detail.equipPerioduseDate" type="date" name="equipPerioduseDate"
        /></label>
        <label>
          분류 :
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
          >사용연한 :
          <input v-model="detail.equipPurchaseDate" type="date" name="equipPurchaseDate"
        /></label>
        파일 :
        <input id="fileInput" type="file" name="file" @change="handlerFile" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
        <div>
          <div>
            <label>미리보기</label>
            <img :src="imageUrl" class="preview-image" />
          </div>
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
  </teleport>
</template>

<style>
@import './EquipStyled.css';
</style>

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});
const imageUrl = ref('');

const downloadFile = () => {
  const param = new URLSearchParams();
  param.append('noticeId', id);

  axios.post('/api/support/noticeDownload.do', param, { responseType: 'blob' }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', detail.value.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};

// 상세조회 썸네일 구현
const getFileImage = () => {
  const param = new URLSearchParams();
  param.append('noticeId', id);

  axios.post('/api/support/noticeDownload.do', param, { responseType: 'blob' }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    imageUrl.value = url;
  });
};

// 미리보기 구현
const handlerFile = (e) => {
  // 현재 파일이 이미지 파일이면, 썸네일이 보이도록
  // 선택된 파일의 확장자를 가져오는 작업
  const fileInfo = e.target.files;
  const fileInfoSplit = fileInfo[0].name.split('.');
  const fileExtension = fileInfoSplit[1].toLowerCase();

  // 만약 선택한 파일이 이미지이면, 썸네일을 생성함
  if (['jpg', 'gif', 'png'].includes(fileExtension)) {
    imageUrl.value = URL.createObjectURL(fileInfo[0]);
  }
};

const handlerDelete = async () => {
  const formData = new FormData(formRef.value);
  formData.append('noticeId', id);

  try {
    await axios.post('/api/support/noticeFileDelete.do', formData).then((res) => {
      if (res.data.result === 'success') {
        alert('삭제 되었습니다.');
      }
      modalState.$patch({ isOpen: false, type: null });
      emit('postSuccess');
    });
  } catch (error) {
    console.log(error);
  }
};

// 저장 버튼 클릭시 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);

  axios.post('/api/support/noticeFileSave.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장 되었습니다.');
      modalState.$patch({ isOpen: false, type: null });
      emit('postSuccess');
    }
  });
};

// 수정 버튼 클릭시 수정
const handlerUpdate = () => {
  const formData = new FormData(formRef.value);
  formData.append('noticeId', id);

  axios.post('/api/support/noticeFileUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정 되었습니다.');
      modalState.$patch({ isOpen: false, type: null });
      emit('postSuccess');
    }
  });
};

// 제목 클릭시 모달창 조회
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('noticeId', id);

  axios.post('/api/support/noticeFileDetail.do', param).then((res) => {
    detail.value = res.data.detailValue;

    if (['jpg', 'gif', 'png'].includes(detail.value.fileExt)) {
      getFileImage();
    }
  });
};

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <div class="modal-overlay">
    <form ref="formRef" class="modal-form modal-container">
      <label> 제목 :<input v-model="detail.noticeTitle" type="text" name="fileTitle" /> </label>
      <label> 내용 :<input v-model="detail.noticeContent" type="text" name="fileContent" /> </label>
      파일 :
      <input id="fileInput" type="file" name="file" @change="handlerFile" />
      <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
      <div @click="downloadFile">
        <div>
          <label>미리보기</label>
          <img :src="imageUrl" class="preview-image" />
        </div>
      </div>
      <div class="button-container">
        <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
          {{ !id ? '저장' : '수정' }}
        </button>
        <button v-if="id" type="button" @click="handlerDelete()">삭제</button>
        <button type="button" @click="modalState.$patch({ isOpen: false, type: null })">
          나가기
        </button>
      </div>
    </form>
  </div>
</template>

<style>
@import './styled.css';
</style>

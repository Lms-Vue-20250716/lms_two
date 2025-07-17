<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

// defineEmits: 자식이 부모에게 이벤트 emit(발신)할 수 있게 정의하는 함수
const emit = defineEmits(['postSuccess', 'unMountedModal']);
// Main에서 detailId 받아온거를 넘버로 사용할거임. 얘는 어차피 0이 아니니깐 초기값을 0으로 지정
const { detailId: id } = defineProps({ detailId: { type: Number, default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});
const imageUrl = ref('');

// 저장
const handlerInsert = () => {
  const formData = new FormData(formRef.value);
  // form tag안에 name이 키가되는데 이걸 가져올거임
  axios.post('/api/support/noticeSave.do', formData).then((res) => {
    // 저장되면(res의 result가 success)가 나오면 모달창 꺼라.
    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

//수정
const handlerUpdate = () => {
  const formData = new FormData();
  formData.append('noticeId', id);
  axios.post('/api/support/noticeUpdate.do', formData).then((res) => {
    // 저장되면(res의 result가 success)가 나오면 모달창 꺼라.
    if (res.data.result === 'success') {
      alert('수정되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

const handlerDelete = () => {
  const formData = new FormData(formRef.value);
  formData.append('noticeId', id);
  axios.post('/api/support/noticeDelete.do', formData).then((res) => {
    // 삭제되면(res의 result가 success)가 나오면 모달창 꺼라.
    if (res.data.result === 'success') {
      alert('삭제되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

// 모달에 정보뜨기
const searchDetail = () => {
  const param = new URLSearchParams();
  // id를 받아올거임. 그래야 Main에서 가져온 id와 key값이 일치하니깐.
  param.append('noticeId', id);

  axios.post('/api/support/noticeDetail.do', param).then((res) => {
    // 콘솔쳐보니깐 detailValue를 받아오고 있음.
    detail.value = res.data.detailValue;
    // 이미지 미리보기
    if (['jpg', 'gif', 'png'].includes(detail.value.fileExt)) {
      getFileImage();
    }
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
  // 현재 파일이 이미지 파일이면, 썸네일이 나타나게 할겁니다.

  // 선택된 파일의 확장자를 가져오는 겁니다. (jpg인지? png인지? hwp?)
  const fileInfo = e.target.files;
  const fileInfoSplit = fileInfo[0].name.split('.');
  const fileExtension = fileInfoSplit[1].toLowerCase();

  // 만약 선택한 파일이 이미지이면 썸네일을 생성하는 겁니다.
  if (['jpg', 'gif', 'png'].includes(fileExtension)) {
    imageUrl.value = URL.createObjectURL(fileInfo[0]);
  }
};

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

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});
</script>

<template>
  <!-- Teleprot: 현재 modal이 noticeMain안에 있기 때문에 html의 body에서 열리게 하겠다. -->
  <Teleport to="body">
    <div class="modal-overlay">
      <form ref="formRef" class="modal-form modal-container">
        <label> 제목 :<input v-model="detail.noticeTitle" type="text" name="title" /> </label>
        <label> 내용 :<input v-model="detail.noticeContent" type="text" name="content" /> </label>
        파일 :
        <input id="fileInput" type="file" name="file" @change="handlerFile" />
        <label class="img-label" htmlFor="fileInput"> 파일 첨부하기 </label>
        <div @click="downloadFile">
          <div>
            <label>미리보기</label>
            <img class="preview-image" :src="imageUrl" />
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
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

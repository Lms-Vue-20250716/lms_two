<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id } = defineProps({ detailId: { type: [String, Number], default: 0 } });

const modalState = useModalState();
const formRef = ref();
const detail = ref({});

// 모달에 정보뜨기
const searchDetail = () => {
  const param = new URLSearchParams();
  param.append('companyId', id);
  axios.post('/api/system/companyDetail.do', param).then((res) => {
    const raw = res.data.detailValue;

    if (raw.companyRegDate) {
      raw.companyRegDate = formatDate(raw.companyRegDate);
    }
    detail.value = {
      ...raw,
      companyLoc: raw.zipcode, // 저장용 코드
      zipcode: raw.companyLoc, // 사용자 보기용 주소
    };
  });
};

// 저장
const handlerInsert = () => {
  if (!validateForm()) return;
  const formData = new FormData(formRef.value);
  axios.post('/api/system/companySave.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('저장되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

//수정
const handlerUpdate = () => {
  if (!validateForm()) return;
  const formData = new FormData(formRef.value);
  formData.append('companyId', id);
  axios.post('/api/system/companyUpdate.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('수정되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

//삭제
const handlerDelete = () => {
  const formData = new FormData(formRef.value);
  formData.append('companyId', id);
  axios.post('/api/system/companyDelete.do', formData).then((res) => {
    if (res.data.result === 'success') {
      alert('삭제되었습니다.');
      modalState.$patch({ isOpen: false });
      emit('postSuccess');
    }
  });
};

onMounted(() => {
  id && searchDetail();
});

onUnmounted(() => {
  emit('unMountedModal', 0);
});

//  날짜 변환
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 주소 입력
const loadDaumPostcodeScript = () => {
  return new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve(window.daum);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve(window.daum);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// 주소 저장
const execDaumPostcode = async () => {
  try {
    await loadDaumPostcodeScript();

    new window.daum.Postcode({
      oncomplete: function (data) {
        detail.value.companyLoc = data.zonecode; // detail_code
        detail.value.zipcode = data.roadAddress; // 화면용 주소
        detail.value.detailName = data.roadAddress; // INSERT용 detail_name
      },
    }).open();
  } catch (e) {
    alert('주소 검색 스크립트를 불러오는 데 실패했습니다.');
    console.error(e);
  }
};

// 휴대번호 - 생성
const formatPhone = (e) => {
  const numbers = e.target.value.replace(/\D/g, ''); // 숫자만 추출

  let result = '';
  if (numbers.length <= 3) {
    result = numbers;
  } else if (numbers.length <= 7) {
    result = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    result = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }

  detail.value.companyHp = result;
};

// 이메일 형식 검사
const isEmailValid = ref(true);

const validateEmail = () => {
  const val = detail.value.companyEmail || '';
  isEmailValid.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

// 유효성 test
const validateForm = () => {
  const val = detail.value;

  if (!val.companyName?.trim()) {
    alert('회사명을 입력해주세요.');
    return false;
  }
  if (!val.companyCeo?.trim()) {
    alert('대표명을 입력해주세요.');
    return false;
  }
  if (!val.companyHp || !/^010-\d{4}-\d{4}$/.test(val.companyHp)) {
    alert('휴대전화는 010-xxxx-xxxx 형식으로 입력해주세요.');
    return false;
  }
  if (!val.companyLoc || !/^\d{5}$/.test(val.companyLoc)) {
    alert('우편번호를 정확히 입력해주세요.');
    return false;
  }
  if (!val.zipcode?.trim()) {
    alert('기본주소를 입력해주세요.');
    return false;
  }
  if (!val.companyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.companyEmail)) {
    alert('올바른 이메일 형식을 입력해주세요.');
    return false;
  }
  if (!val.companyRegDate) {
    alert('가입일자를 선택해주세요.');
    return false;
  }

  return true;
};
</script>
<template>
  <div class="companyModal-overlay">
    <form ref="formRef" class="companyModal-form companyModal-container">
      <label>회사명* :<input v-model="detail.companyName" type="text" name="companyName" /></label>
      <label>대표명* :<input v-model="detail.companyCeo" type="text" name="companyCeo" /></label>
      <label
        >휴대전화* :
        <input
          v-model="detail.companyHp"
          name="companyHp"
          type="text"
          maxlength="13"
          placeholder="010-0000-0000"
          @input="formatPhone"
      /></label>
      <label>
        우편번호* :
        <button type="button" class="postcode-button" @click="execDaumPostcode">주소 검색</button>
        <input
          v-model="detail.companyLoc"
          type="text"
          name="companyLoc"
          readonly
          placeholder="주소검색"
        />
      </label>
      <input v-model="detail.detailName" type="hidden" name="detailName" />
      <label>
        기본주소* :
        <input
          v-model="detail.zipcode"
          type="text"
          name="zipcode"
          placeholder="주소검색"
          readonly
        />
      </label>



      <label>
        상세주소* :
        <input v-model="detail.detailAddress" type="text" name="companyDetailAddress" />
      </label>
      <label>
        이메일* :
        <input
          v-model="detail.companyEmail"
          name="companyEmail"
          type="text"
          placeholder="example@example.com"
          @input="validateEmail"
        />
      </label>
      <p v-if="!isEmailValid && detail.companyEmail" style="color: red; font-size: 12px">
        이메일 형식이 올바르지 않습니다.
      </p>
      <label
        >가입일자* :<input v-model="detail.companyRegDate" type="date" name="companyRegDate"
      /></label>
      <div class="button-container">
        <button type="button" @click="!id ? handlerInsert() : handlerUpdate()">
          {{ !id ? '저장' : '수정' }}
        </button>
        <button v-if="id" type="button" @click="handlerDelete">삭제</button>
        <button type="button" @click="modalState.$patch({ isOpen: false })">나가기</button>
      </div>
    </form>
  </div>
</template>
<style>
@import './styled.css';
</style>

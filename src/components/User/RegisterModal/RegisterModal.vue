<script setup>
import { useModalState } from '@/stores/modalState';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const modalState = useModalState();
const form = ref({
  userType: '',
  loginId: '',
  loc: '',
  name: '',
  password: '',
  password2: '',
  hp: '',
  sex: '',
  birthday: '',
  email: '',
  insBank: '',
  insAccount: '',
});

const rules = {
  idRules: /^[a-z0-9]{6,20}$/,
  nameRules: /^[가-힣a-zA-Z]{2,}$/,
  passwordRules: /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/,
  emailRules: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
  tel1Rules: /^\d{2,3}$/,
  tel2Rules: /^\d{3,4}$/,
  tel3Rules: /^\d{4}$/,
};

const idInput = ref();
const nameInput = ref();
const pwdInput = ref();
const pwd2Input = ref();
const sexSelect = ref();
const birthInput = ref();
const emailInput = ref();
const accInput = ref();
const bnkSelect = ref();
const locSelect = ref();

const isCheckedEmail = ref(false);
const isCheckedId = ref(false);

const checkId = () => {
  if (!form.value.loginId || form.value.loginId === '') {
    ElMessage.error('아이디를 입력해주세요.');
    idInput.value.focus();
    isCheckedId.value = false;
    return;
  } else if (!rules.idRules.test(form.value.loginId)) {
    ElMessage.error('아이디는 숫자, 영문자 조합으로 6~20자리를 사용해야합니다.');
    idInput.value.focus();
    isCheckedId.value = false;
    return false;
  }

  const url = `/api/user/checkId/${form.value.loginId}`;
  axios
    .get(url)
    .then((res) => {
      if (res.data === 'FALSE') {
        ElMessage.error('중복된 아이디가 존재합니다.');
        idInput.value.focus();
        isCheckedId.value = false;
      } else if (res.data === 'TRUE') {
        ElMessage.success('사용할 수 있는 아이디입니다.');
        isCheckedId.value = true;
      } else {
        ElMessage.error('아이디 확인 중 오류가 발생했습니다.');
        idInput.value.focus();
        isCheckedId.value = false;
      }
    })
    .catch((err) => {
      ElMessage.error('서버와의 연결을 실패했습니다.', `error: ${err}`);
    });
};

const checkEmail = () => {
  if (!rules.emailRules.test(form.value.email)) {
    ElMessage.error('이메일 형식을 확인해주세요.');
    emailInput.value.focus();
    return false;
  }

  axios
    .get('/api/user/checkEmail', {
      params: {
        email: form.value.email,
      },
    })
    .then((res) => {
      if (res.data === 'FALSE') {
        ElMessage.error('중복된 이메일이 존재합니다.');
        emailInput.value.focus();
        isCheckedEmail.value = false;
        return false;
      } else if (res.data === 'TRUE') {
        ElMessage.success('사용 가능한 이메일입니다.');
        isCheckedEmail.value = true;
      } else {
        ElMessage.error('이메일 확인 중 오류가 발생했습니다.');
        emailInput.value.focus();
        isCheckedEmail.value = false;
      }
    });
};

const validateForm = () => {
  const name = form.value.name.trim();
  const insAccount = form.value.insAccount.trim();

  if (!rules.nameRules.test(name)) {
    ElMessage.error('이름은 한글 또는 영어 2자 이상이어야 합니다.');
    nameInput.value.focus();
    return false;
  }

  if (!form.value.loc) {
    ElMessage.error('주소를 선택해주세요.');
    locSelect.value.focus();
    return false;
  }

  if (!form.value.sex) {
    ElMessage.error('성별을 선택해주세요.');
    sexSelect.value.focus();
    return false;
  }

  if (!form.value.birthday) {
    ElMessage.error('생년월일을 선택해주세요.');
    birthInput.value.focus();
    return false;
  }

  if (form.value.userType === 'T') {
    if (!insAccount) {
      ElMessage.error('계좌번호를 입력해주세요.');
      accInput.value.focus();
      return false;
    }
    if (!form.value.insBank) {
      ElMessage.error('은행명을 선택해주세요.');
      bnkSelect.value.focus();
      return false;
    }
  }

  if (!isCheckedId.value) {
    ElMessage.error('아이디 중복확인을 진행해주세요');
    idInput.value.focus();
    return false;
  }
  if (!rules.passwordRules.test(form.value.password)) {
    ElMessage.error('비밀번호는 숫자, 영문자, 특수문자 8~15자리를 사용해야합니다.');
    pwdInput.value.focus();
    return false;
  }
  if (form.value.password !== form.value.password2) {
    ElMessage.error('비밀번호가 맞지 않습니다.');
    pwd2Input.value.focus();
    return false;
  }
  if (!isCheckedEmail.value) {
    ElMessage.error('이메일 중복확인을 해주세요');
    emailInput.value.focus();
    return false;
  }

  return true;
};

const completeRegister = () => {
  if (!validateForm()) {
    return;
  }

  const urlParam = new URLSearchParams(form.value);
  axios.post('/api/user/register', urlParam).then((res) => {
    if (res.data === 'SUCCESS') {
      ElMessage.success('회원가입이 완료되었습니다.');
      modalState.$patch({ isOpen: false });
    } else {
      ElMessage.error('회원가입 중 오류가 발생했습니다.');
    }
  });
};
</script>

<template>
  <Teleport to="body">
    <div class="signup-container">
      <div class="signup-form">
        <div class="form-header">
          <h2>회원가입</h2>
        </div>

        <div class="form-content">
          <div class="form-row">
            <div class="form-group">
              <label for="userType">회원 유형<span class="required">*</span> </label>
              <select id="userType" ref="typeSelect" v-model="form.userType" class="form-select">
                <option value="">선택</option>
                <option value="S">학생</option>
                <option value="T">강사</option>
              </select>
            </div>

            <div class="form-group">
              <label for="loginId">아이디<span class="required">*</span> </label>
              <div class="input-group">
                <input
                  id="loginId"
                  ref="idInput"
                  v-model="form.loginId"
                  type="text"
                  placeholder="숫자, 영문자 조합으로 6-20자리"
                  class="form-input"
                />
                <button type="button" class="check-btn" @click="checkId">중복확인</button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="loc">주소<span class="required">*</span> </label>
              <select id="loc" ref="locSelect" v-model="form.loc" class="form-select">
                <option value="">도/광역시 선택</option>
                <option value="서울특별시">서울특별시</option>
                <option value="전라남도">전라남도</option>
                <option value="경기도">경기도</option>
                <option value="부산광역시">부산광역시</option>
                <option value="대구광역시">대구광역시</option>
                <option value="인천광역시">인천광역시</option>
              </select>
            </div>

            <div class="form-group">
              <label for="name">이름<span class="required">*</span> </label>
              <input id="name" ref="nameInput" v-model="form.name" type="text" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">비밀번호<span class="required">*</span> </label>
              <input
                id="password"
                ref="pwdInput"
                v-model="form.password"
                type="password"
                placeholder="숫자, 영문자, 특수문자 조합으로 8-15자리"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="passwordConfirm">비밀번호 확인<span class="required">*</span> </label>
              <input
                id="passwordConfirm"
                ref="pwd2Input"
                v-model="form.password2"
                type="password"
                placeholder="숫자, 영문자, 특수문자 조합으로 8-15자리"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="hp">전화번호<span class="required">*</span> </label>
              <input id="hp" v-model="form.hp" type="tel" class="form-input" />
            </div>

            <div class="form-group">
              <label for="sex">성별<span class="required">*</span> </label>
              <select id="sex" ref="sexSelect" v-model="form.sex" class="form-select">
                <option value="">선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthday">생년월일<span class="required">*</span> </label>
              <input
                id="birthday"
                ref="birthInput"
                v-model="form.birthday"
                type="date"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="email">이메일<span class="required">*</span> </label>
              <div class="input-group">
                <input
                  id="email"
                  ref="emailInput"
                  v-model="form.email"
                  type="email"
                  placeholder="happyjob@happyjob.com"
                  class="form-input"
                />
                <button type="button" class="check-btn" @click="checkEmail">중복확인</button>
              </div>
            </div>
          </div>

          <div v-if="form.userType === 'T'" class="form-row">
            <div class="form-group">
              <label for="insAccount">계좌번호<span class="required">*</span> </label>
              <input
                id="insAccount"
                ref="accInput"
                v-model="form.insAccount"
                type="text"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="insBank">은행<span class="required">*</span> </label>
              <select id="geninsBanker" ref="bnkSelect" v-model="form.insBank" class="form-select">
                <option value="">선택</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="submit-btn" @click="completeRegister">회원가입</button>
          <button type="button" class="cancel-btn" @click="modalState.$patch({ isOpen: false })">
            취소
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import './style.css';
</style>

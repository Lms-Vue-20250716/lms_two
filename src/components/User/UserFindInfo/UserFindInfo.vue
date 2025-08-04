<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const modalState = useModalState();
const emits = defineEmits(['authComplete']);
const activeFindIdPwd = ref('id');

const loginId = ref('');
const emailForId = ref('');
const emailForPwd = ref('');
const authNumb = ref('');
const authNumbInput = ref('');

const emailInput = ref();

const SendEmailForId = () => {
  if (!emailForId.value || emailForId.value === '') {
    ElMessage.error('이메일을 입력하여주세요...');
    emailInput.value.focus();
  }
  const urlParam = new URLSearchParams();
  urlParam.append('email', emailForId.value);
  axios
    .post('/api/selectFindInfoId.do', urlParam)
    .then((res) => {
      console.log(res);
      if (res.data.result === 'FALSE') {
        ElMessage.error('존재하지 않는 이메일입니다.');
      } else if (res.data.result === 'SUCCESS') {
        loginId.value = res.data.loginId;
        ElMessage.success(`찾으시고자 하는 ID는 ${loginId.value}입니다.`);
      }
    })
    .catch((err) => {
      ElMessage.error(`입력하신 이메일 ${emailForId.value}에 맞는 ID가 없습니다.`);
      console.log('서버 오류 발생 err : ', err);
    });
};

const SendEmailForPwd = () => {
  if (!emailForPwd.value || emailForPwd.value === '') {
    ElMessage.error('이메일을 입력하여주세요...');
    emailInput.value.focus();
  }
  const urlParam = new URLSearchParams();
  urlParam.append('email', emailForPwd.value);
  axios.post('/api/selectFindInfoPw.do', urlParam).then((res) => {
    if (res.data.result === 'FALSE') {
      ElMessage.error('이메일 주소를 확인해주세요');
    } else if (res.data.result === 'SUCCESS') {
      console.log(res);
      activeFindIdPwd.value = 'authNumb';
      ElMessage.success('해당 이메일로 인증번호를 보냈습니다.');
      //   createdAuthNumb.value(res);
      SendEmail();
    }
  });
};

const SendEmail = () => {
  const param = {
    email: emailForPwd.value,
    // authNumIdPwd: createdAuthNumb.value,
  };

  const urlParam = new URLSearchParams(param);
  axios
    .post('/api/sendmail.do', urlParam)
    .then((res) => {
      authNumb.value = res.data.authNumId;
    })
    .catch(() => {
      ElMessage.error('실패하였습니다...');
    });
};

const CompletedAuthPwd = () => {
  if (authNumbInput.value.length < 1) {
    ElMessage.error('인증번호를 입력해주세요');
    return false;
  } else if (authNumb.value !== authNumbInput.value) {
    ElMessage.error('인증번호가 틀렸습니다.');
    return false;
  } else if (authNumb.value === authNumbInput.value) {
    ElMessage.success('인증 성공했습니다.');
    authNumb.value = '';
    handleClose();
    console.log(emailForPwd.value);
    emits('authComplete', { email: emailForPwd.value });
  }
};

const handleClose = () => {
  modalState.$patch({ isOpen: false });
};
</script>

<template>
  <Teleport to="body">
    <div class="find-modal-overlay" @click="handleClose">
      <div class="find-modal" @click.stop>
        <div class="modal-header">
          <h2>아이디/비밀번호 찾기</h2>
          <button class="close-btn" @click="handleClose">×</button>
        </div>

        <div class="tab-container">
          <button
            :class="['tab-btn', { active: activeFindIdPwd === 'id' }]"
            @click="activeFindIdPwd = 'id'"
          >
            아이디 찾기
          </button>
          <button
            :class="['tab-btn', { active: activeFindIdPwd === 'password' }]"
            @click="activeFindIdPwd = 'password'"
          >
            비밀번호 찾기
          </button>
        </div>

        <div class="modal-content">
          <!-- 아이디 찾기 탭 -->
          <div v-if="activeFindIdPwd === 'id'" class="tab-content">
            <div class="input-row">
              <label for="findIdEmail">아이디 찾기</label>
              <div class="input-group">
                <input
                  id="findIdEmail"
                  ref="emailInput"
                  v-model.lazy="emailForId"
                  type="email"
                  placeholder="가입하신 이메일을 입력하세요"
                  class="find-input"
                />
                <button type="button" class="action-btn" @click="SendEmailForId">
                  아이디 찾기
                </button>
              </div>
            </div>
          </div>

          <!-- 비밀번호 찾기 탭 -->
          <div
            v-if="activeFindIdPwd === 'password' || activeFindIdPwd === 'authNumb'"
            class="tab-content"
          >
            <div class="input-row">
              <label for="findPwEmail">비밀번호 찾기</label>
              <div class="input-group">
                <input
                  id="findPwEmail"
                  v-model.lazy="emailForPwd"
                  type="email"
                  placeholder="가입하신 이메일을 입력하세요"
                  class="find-input"
                />
                <button type="button" class="action-btn" @click="SendEmailForPwd">
                  이메일 전송
                </button>
              </div>
            </div>
            <div v-if="activeFindIdPwd === 'authNumb'" class="input-row">
              <div class="input-group">
                <input
                  id="findPwEmail"
                  v-model.lazy="authNumbInput"
                  type="text"
                  placeholder="전송된 인증번호를 입력하세요"
                  class="find-input"
                />
                <button type="button" class="action-btn" @click="CompletedAuthPwd">인증하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

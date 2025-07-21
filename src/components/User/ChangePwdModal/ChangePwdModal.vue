<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const props = defineProps({
  userEmail: {
    type: String,
    required: true,
  },
});

const modalState = useModalState();

const newPassword = ref('');
const confirmPassword = ref('');
const newPasswordInput = ref();
const confirmPasswordInput = ref();

const handlePasswordChange = () => {
  if (!newPassword.value || newPassword.value === '') {
    ElMessage.error('비밀번호를 입력하세요');
    newPasswordInput.value.focus();
    return false;
  }
  if (!confirmPassword.value || confirmPassword.value === '') {
    ElMessage.error('비밀번호 확인을 입력하세요');
    confirmPasswordInput.value.focus();
    return false;
  }

  const passwordRules = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

  if (!passwordRules.test(newPassword.value)) {
    ElMessage.error('비밀번호는 숫자, 영문자, 특수문자 조합으로 8~15자리를 사용해야 합니다.');
    newPasswordInput.value.focus();
    return false;
  } else if (newPassword.value !== confirmPassword.value) {
    ElMessage.error('비밀번호가 맞지 않습니다.');
    confirmPasswordInput.value.focus();
    return false;
  }

  const param = {
    chPassword: newPassword.value,
    email: props.userEmail,
  };

  const urlParam = new URLSearchParams(param);

  axios
    .post('/api/changePwd.do', urlParam)
    .then(() => {
      ElMessage.success('비밀번호 변경 완료');
      modalState.$patch({ isOpen: false });
    })
    .catch(() => {
      ElMessage.error('비밀번호 변경 실패');
    });
};

const handleClose = () => {
  modalState.$patch({ isOpen: false });
};
</script>

<template>
  <Teleport to="body">
    <div class="change-password-overlay" @click="handleClose">
      <div class="change-password-modal" @click.stop>
        <div class="modal-header">
          <h2>비밀번호 변경</h2>
          <button class="close-btn" @click="handleClose">×</button>
        </div>

        <div class="modal-content">
          <div class="password-form">
            <div class="input-row">
              <label for="newPassword" class="input-label">새 비밀번호</label>
              <input
                id="newPassword"
                ref="newPasswordInput"
                v-model.lazy="newPassword"
                type="password"
                placeholder="새 비밀번호"
                class="password-input"
              />
            </div>

            <div class="input-row">
              <label for="confirmPassword" class="input-label">비밀번호 확인</label>
              <input
                id="confirmPassword"
                ref="confirmPasswordInput"
                v-model.lazy="confirmPassword"
                type="password"
                placeholder="비밀번호 확인"
                class="password-input"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="change-btn" @click="handlePasswordChange">
            비밀번호 변경
          </button>
          <button type="button" class="cancel-btn" @click="handleClose">취소</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import './style.css';
</style>

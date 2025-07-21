<script setup>
import logo from '@/assets/logo_img.png';
import { ref } from 'vue';
import { useUserInfo } from '@/stores/loginInfoState';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useModalState } from '@/stores/modalState';
import RegisterModal from '@/components/User/RegisterModal/RegisterModal.vue';
import UserFindInfo from '@/components/User/UserFindInfo/UserFindInfo.vue';
import ChangePwdModal from '@/components/User/ChangePwdModal/ChangePwdModal.vue';

const loginInfo = ref({});
const { setUserData } = useUserInfo();
const router = useRouter();
const modalState = useModalState();

const userEmail = ref('');

const handlerLogin = () => {
  if (!loginInfo.value.lgn_Id || !loginInfo.value.pwd) {
    alert('아이디와 비밀번호를 입력해주세요....');
    return;
  }
  const param = new URLSearchParams(loginInfo.value);

  axios.post('/api/loginProc.do', param).then((res) => {
    const data = res.data;
    if (data.result === 'SUCCESS') {
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      setUserData(data);
      router.push('/vue');
    } else {
      alert('아이디 혹은 비밀번호가 일치하지 않아요');
      return;
    }
  });
};

const changePwdModalOn = (data) => {
  userEmail.value = data.email;
  modalState.$patch({ isOpen: true, type: 'pwdChange' });
};
</script>

<template>
  <div class="login-main">
    <div class="login-container">
      <div class="login-image">
        <img alt="" :src="logo" />
      </div>
      <h3>안되는 것이 실패가 아니라 포기하는 것이 실패다</h3>
      <div>
        성공은 실패의 꼬리를 물고 온다.지금 포기한 것이 있는가 ?
        <br />
        그렇다면 다시 시작해 보자. <br />
        안되는 것이 실패가 아니라 포기하는 것이 실패다. <br />
        포기한 순간이 성공하기 5 분전이기 쉽다. <br />
        실패에서 더 많이 배운다. <br />
        실패를 반복해서 경험하면 실망하기 쉽다. <br />
        하지만 포기를 생각해선 안된다.실패는 언제나 중간역이지 종착역은 아니다. <br />
      </div>
      <div>-이대희, ‘1 % 의 가능성을 희망으로 바꾼 사람들’ 에서</div>
    </div>
    <div class="login-box">
      <div class="buttons inputs">
        <div>
          <label> 아이디 </label>
          <input v-model="loginInfo.lgn_Id" required />
        </div>
        <div>
          <label> 비밀번호 </label>
          <input v-model="loginInfo.pwd" required type="password" />
        </div>
        <div>
          <button class="login-button" @click="handlerLogin">Login</button>
          <button
            class="signup-button"
            @click="modalState.$patch({ isOpen: true, type: 'register' })"
          >
            Sign Up
          </button>
          <button class="find-button" @click="modalState.$patch({ isOpen: true, type: 'find' })">
            Find ID/PW
          </button>
        </div>
      </div>
    </div>
  </div>
  <RegisterModal v-if="modalState.type === 'register' && modalState.isOpen" />
  <UserFindInfo
    v-if="modalState.type === 'find' && modalState.isOpen"
    @auth-complete="changePwdModalOn"
  />
  <ChangePwdModal
    v-if="modalState.type === 'pwdChange' && modalState.isOpen"
    :user-email="userEmail"
  />
</template>

<style>
@import './styled.css';
</style>

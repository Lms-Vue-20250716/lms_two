import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';

import App from './App.vue';
import router from './router';
import { useUserInfo } from './stores/loginInfoState';
import axios from 'axios';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

axios.defaults.withCredentials = true; // 모든 axios 요청에 쿠키 자동 포함
app.use(ElementPlus);

app.use(createPinia());

const userStore = useUserInfo();
userStore.initializeFromSession();
app.use(router);
app.use(VueQueryPlugin);
app.mount('#app');

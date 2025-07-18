import { defineStore } from 'pinia';
import { ref } from 'vue';

// Composition API 스타일로 스토어를 정의합니다. (더 유연합니다)
export const useModalState = defineStore('lectureManageModalState', () => {
  // state: 컴포넌트의 ref와 같습니다.
  const isOpen = ref(false);
  const type = ref(null);
  const payload = ref(null);

  // actions: state를 변경하는 함수들입니다.
  function openModal(modalType, modalPayload = null) {
    isOpen.value = true;
    type.value = modalType;
    payload.value = modalPayload;
    console.log(`Modal opened: type=${type.value}, isOpen=${isOpen.value}`);
  }

  function closeModal() {
    isOpen.value = false;
    type.value = null;
    payload.value = null;
    console.log('Modal closed');
  }

  // 외부에서 사용할 수 있도록 state와 action을 반환합니다.
  return { isOpen, type, payload, openModal, closeModal };
});

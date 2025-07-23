import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useModalState } from './modalState'; // modalState도 Pinia 스토어로 관리되고 있다고 가정

export const useLectureStore = defineStore('lecture', () => {
  // state: 관리할 데이터
  const selectedLecture = ref(null);
  const modalState = useModalState();

  // actions: 데이터를 변경하는 함수

  /** 수정 모드를 위해 강의 데이터를 선택하고 모달을 켭니다. */
  function selectForEdit(lecture) {
    selectedLecture.value = lecture;
    modalState.$patch({ isOpen: true, type: 'lecture-manage-register' });
  }

  /** 저장(신규) 모드를 위해 데이터를 초기화하고 모달을 켭니다. */
  function prepareForCreate() {
    selectedLecture.value = null; // <-- 핵심! 데이터를 null로 초기화합니다.
    modalState.$patch({ isOpen: true, type: 'lecture-manage-register' });
  }

  function openLecturePlan(lecture) {
    selectedLecture.value = lecture; // 객체 전체를 ref에 저장합니다.
    modalState.$patch({ isOpen: true, type: 'lecture-manage-plan' });
  }

  return { selectedLecture, selectForEdit, prepareForCreate };
});

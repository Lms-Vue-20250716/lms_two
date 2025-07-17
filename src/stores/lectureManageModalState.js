import { defineStore } from 'pinia';

export const useModalState = defineStore('lectureManageSaveModalState', {
  state: () => {
    return {
      isOpen: false,
      type: null,
      payload: null,
    };
  },
});

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';

const modalState = useModalState();

const mode = ref('view');

watch(() => modalState, (newState) => {
  if (newState.payload?.mode) {
    mode.value = newState.payload.mode;
  }
}, { immediate: true, deep: true });
const detail = ref({});
const isEditing = computed(() => mode.value === 'create' || mode.value === 'edit');
const editForm = ref({});

const emit = defineEmits(['postSuccess', 'unMountedModal']);
const { detailId: id, lectureList: lectureList } = defineProps({
  detailId: { type: [String, Number], default: 0 },
  lectureList: { type: Array, default: () => { } },
});

onMounted(async () => {
  if (mode.value === 'create') {
    editForm.value = {
      counselTitle: '',
      counselContent: '',
      counselStudentName: '',
      lecId: ''
    };
  } else {
    id && searchDetail();
  }
});

onUnmounted(() => {
  emit('unMountedModal', 0);
})

const deleteHandler = async () => {
  const param = new URLSearchParams();
  param.append('counselId', id);

  try {
    const res = await axios.post(`/api/manage/counselDelete.do`, param);

    if (res.data.result === 'success') {
      alert('삭제되었습니다.')
      modalState.$patch({ isOpen: false, type: null, payload: null });
      emit('postSuccess');
    }
  } catch (error) {
    console.log(error);
  }
}

const searchDetail = async () => {
  const param = new URLSearchParams();
  param.append('counselId', id);

  try {
    const res = await axios.post(`/api/manage/counselDetail.do`, param);
    detail.value = res.data.detailValue;
  } catch (error) {
    console.log(error);
  }
};

const startEdit = () => {
  modalState.$patch({ payload: { mode: 'edit' } });
  editForm.value = { ...detail.value };
};

const saveEdit = async () => {
  // 유효성 검사
  if (!editForm.value.lecId) {
    alert('상담 과목을 선택해주세요.');
    return;
  }
  
  if (!editForm.value.counselStudentName || editForm.value.counselStudentName.trim() === '') {
    alert('상담 학생명을 입력해주세요.');
    return;
  }
  
  if (!editForm.value.counselTitle || editForm.value.counselTitle.trim() === '') {
    alert('상담 제목을 입력해주세요.');
    return;
  }
  
  if (!editForm.value.counselContent || editForm.value.counselContent.trim() === '') {
    alert('상담 내용을 입력해주세요.');
    return;
  }

  const param = new URLSearchParams();

  if (mode.value !== 'create') {
    param.append('counselId', id);
  }
  param.append('counselTitle', editForm.value.counselTitle);
  param.append('counselContent', editForm.value.counselContent);
  param.append('counselStudentName', editForm.value.counselStudentName);
  param.append('counselLecId', editForm.value.lecId);

  const endpoint = mode.value === 'create' ? '/api/manage/counselSave.do' : '/api/manage/counselUpdate.do';

  try {
    const res = await axios.post(endpoint, param);
    if (res.data.result === 'success') {
      if (mode.value === 'create') {
        alert('등록되었습니다.');
        modalState.$patch({ isOpen: false, type: null, payload: null });
      } else if (mode.value === 'edit') {
        alert('수정되었습니다.');
        modalState.$patch({ isOpen: false, type: null, payload: null });
      } else {
        detail.value = { ...editForm.value };
        modalState.$patch({ payload: { mode: 'view' } });
      }
      emit('postSuccess');
    }
  } catch (error) {
    console.log('저장 오류:', error);
  }
};

const close = () => {
  modalState.$patch({ isOpen: false, type: null, payload: null });
}

</script>

<template>
  <div class="counsel-modal-overlay">
    <div class="counsel-modal-container">
      <div class="flex justify-between items-center bg-[#494c6b] text-white p-3">
        <h2 class="text-lg font-medium">{{ mode === 'create' ? '상담 등록' : '상담 관리' }} </h2>
        <button type="button" @click="close()" class="text-2xl">×</button>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <table class="w-full border-collapse table-auto" :key="mode">
            <tbody>
              <tr>
                <th class="counsel-modal-table-th">상담 과목</th>
                <td class="counsel-modal-table-td">
                  <select v-if="mode === 'create' || mode === 'edit'" v-model="editForm.lecId"
                    class="w-full border border-gray-300 rounded p-2">
                    <option value="">과목을 선택하세요</option>
                    <option v-for="lecture in lectureList" :key="lecture.lecId" :value="lecture.lecId">
                      {{ lecture.lecName }}
                    </option>
                  </select>
                  <span v-else>{{ detail.lecName }}</span>
                </td>
              </tr>
              <tr>
                <th class="counsel-modal-table-th">상담 학생</th>
                <td class="counsel-modal-table-td">
                  <input v-if="mode === 'create' || mode === 'edit'" v-model="editForm.counselStudentName"
                    class="w-full border border-gray-300 rounded p-2" />
                  <span v-else>{{ detail.counselStudentName }}</span>
                </td>
              </tr>
              <tr>
                <th class="counsel-modal-table-th">상담 제목</th>
                <td class="counsel-modal-table-td">
                  <input v-if="isEditing" v-model="editForm.counselTitle"
                    class="w-full border border-gray-300 rounded p-2" />
                  <span v-else>{{ detail.counselTitle }}</span>
                </td>
              </tr>
              <tr>
                <th class="counsel-modal-table-th">상담 내용</th>
                <td class="counsel-modal-table-td">
                  <textarea v-if="isEditing" v-model="editForm.counselContent"
                    class="w-full border border-gray-300 rounded p-2 min-h-[100px]"></textarea>
                  <span v-else>{{ detail.counselContent }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-center mt-4 gap-2">
          <template v-if="!isEditing">
            <button type="button" @click="startEdit()"
              class="bg-[#6b79a1] text-white px-6 py-2 rounded hover:bg-[#5e6c94] transition-colors">
              수정
            </button>
            <button type="button" @click="deleteHandler()"
              class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors">
              삭제
            </button>
            <button type="button" @click="close()"
              class="bg-[#7f8cb6] text-white px-6 py-2 rounded hover:bg-[#5e6c94] transition-colors">
              닫기
            </button>
          </template>
          <template v-else>
            <button type="button" @click="saveEdit()"
              class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors">
              저장
            </button>
            <button type="button" @click="close()"
              class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors">
              취소
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
@import './styled.css';
</style>

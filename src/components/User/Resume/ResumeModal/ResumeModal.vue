<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

const studentsList = ref([]);
const selectedCompany = ref('');
const selectedCompanies = ref([]);
const modalState = useModalState();
const selectedStudents = ref([]);
const isAllSelected = ref(false);

const companyList = ref([]);
const { lecId } = defineProps({
  lecId: { type: Number, default: 0 },
});

const companySelectBox = () => {
  axios.get('/api/user/company-list').then((res) => {
    console.log(res);
    companyList.value = res.data;
  });
};

const handlerStudentList = () => {
  const url = `/api/user/students-lecture/${lecId}`;
  axios.get(url).then((res) => {
    console.log(res.data);
    studentsList.value = res.data;
  });
};

const deleteCompanyList = (company) => {
  selectedCompanies.value.pop(company);
};

const toggleAllSelect = () => {
  if (isAllSelected.value) {
    selectedStudents.value = [...studentsList.value];
  } else {
    selectedStudents.value = [];
  }
};

const updateAllSelectedState = () => {
  isAllSelected.value = selectedStudents.value.length === studentsList.value.length;
};

const handlerFileChange = (e, student) => {
  const file = e.target.files[0];
  if (file) {
    updateFile(file, student);
  }
};

const updateFile = (file, student) => {
  const formData = new FormData();
  formData.append('file', file);

  const apiUrl = !student.fileName
    ? `/api/user/create-resume/${student.studentId}`
    : `/api/user/update-resume/${student.studentId}`;

  axios
    .post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {
      alert('이력서 수정 성공');
      handlerStudentList();
    });
};

const triggerFileInput = (studentId) => {
  document.getElementById(`fileInput-${studentId}`).click();
};

const sendEmail = () => {
  if (selectedCompanies.value.length === 0) {
    alert('기업을 선택해주세요');
    return;
  }
  if (selectedStudents.value.length === 0) {
    alert('학생을 선택해주세요');
    return;
  }
  console.log(selectedStudents.value);

  for (let idx = 0; idx < selectedStudents.value.length; idx++) {
    if (!selectedStudents.value[idx].fileName || selectedStudents.value[idx].fileName === '') {
      alert('이력서를 등록해주세요');
      return;
    }
  }

  const selectedCompanyIds = companyList.value
    .filter((company) => {
      return selectedCompanies.value.includes(company.companyName);
    })
    .map((company) => company.companyId);

  const selectedStudentIds = selectedStudents.value.map((student) => {
    student.studnetId;
  });

  console.log(selectedCompanyIds);
  console.log(selectedStudentIds);

  const params = {
    companyIds: selectedCompanyIds,
    studentIds: selectedStudentIds,
  };

  axios.post('/api/user/send-resume', params).then((res) => {
    console.log(res);
  });
};

const downloadFile = (student) => {
  const url = `/api/user/download-resume/${student.studentId}`;

  axios.post(url, {}, { responseType: 'blob' }).then((res) => {
    console.log(res.data);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', student.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};

watch(selectedStudents, () => {
  updateAllSelectedState();
});

watch(
  () => selectedCompany.value,
  (newValue) => {
    if (!newValue) return;
    if (selectedCompanies.value.includes(selectedCompany.value)) return;
    selectedCompanies.value.push(selectedCompany.value);
  },
);

onMounted(() => {
  if (lecId) {
    handlerStudentList();
    companySelectBox();
  }
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="user-management-modal">
        <!-- 헤더 -->
        <div class="modal-header">
          <h2>이력서 관리</h2>
          <button class="close-btn" @click="modalState.$patch({ isOpen: false })">×</button>
        </div>

        <!-- 컨텐츠 -->
        <div class="modal-content">
          <!-- 에매취 전송법 기업 선택 -->
          <div class="section">
            <label class="section-label">이메일 전송할 기업 선택</label>
            <select v-model="selectedCompany">
              <option value="">전체</option>
              <option v-for="company in companyList" :key="company.companyId">
                {{ company.companyName }}
              </option>
            </select>
          </div>

          <!-- 선택된 기업 목록 -->
          <div class="section">
            <label class="section-label">선택된 기업 목록</label>
            <div class="selected-list">
              <table class="selected-table">
                <thead>
                  <tr>
                    <th>기업명</th>
                    <th>식별</th>
                  </tr>
                </thead>
                <tbody v-if="selectedCompanies.length > 0">
                  <tr v-for="company in selectedCompanies" :key="company" class="selected-item">
                    <td>{{ company }}</td>
                    <td>
                      <button class="delete-btn" @click="deleteCompanyList(company)">삭제</button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="2" class="empty-message">선택된 회사가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- 학생 목록 -->
          <div class="section">
            <label class="section-label">학생 목록</label>
            <div class="student-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input v-model="isAllSelected" type="checkbox" @change="toggleAllSelect" />
                    </th>
                    <th>이름</th>
                    <th>학번</th>
                    <th>전화번호</th>
                    <th>이메일</th>
                    <th>이력서</th>
                    <th>이력서 관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in studentsList" :key="student.studentId">
                    <td>
                      <input v-model="selectedStudents" :value="student" type="checkbox" />
                    </td>
                    <td>{{ student.name }}</td>
                    <td>{{ student.studentsNumber }}</td>
                    <td>{{ student.hp }}</td>
                    <td>{{ student.email }}</td>
                    <td @click="downloadFile(student)">{{ student.fileName }}</td>
                    <td>
                      <input
                        :id="`fileInput-${student.studentId}`"
                        type="file"
                        name="file"
                        style="display: none"
                        @change="handlerFileChange($event, student)"
                      />
                      <button class="manage-btn" @click="triggerFileInput(student.studentId)">
                        {{ !student.fileName || student.fileName === '' ? '업로드' : '수정' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 버튼 그룹 -->
          <div class="button-group">
            <button class="btn btn-primary" @click="sendEmail">전송</button>
            <button class="btn btn-secondary" @click="modalState.$patch({ isOpen: false })">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@import './styled.css';
</style>

<script setup>
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { computed, ref, watch } from 'vue';

// --- 부모 컴포넌트로 부터 받은 데이터
const props = defineProps({
  lectureData: {
    type: Object,
    default: () => ({}), // 기본값은 빈 객체
  },
});

const emit = defineEmits(['lecturePlanRegisterSubmitSuccess']);

// --- 모달 관련
const modalState = useModalState();
const detailProps = ref({});

// --- 서버로부터 받은 데이터
const lectureDetail = ref({});

// --- 모달에 뿌려질 데이터
// 1) 강의 상세
const lecId = ref(0); //강의ID
const lecName = ref(''); //강의
const lecInstructorName = ref(''); //강사
const lecRoomName = ref(''); //강의실
const insEmail = ref(''); //이메일
const insHp = ref(''); //연락처
const lecStartDate = ref(''); //강의 시작일
const lecEndDate = ref(''); //강의 종료일
const lecPersonnel = ref(0); //정원
const lecDaysCnt = ref(0); //강의 일수(주차) TODO - 강의 일수(주차)	1(2주차) 에서 2주차는 어디에서 나온거임?
const lecSectionCnt = ref(0);

// 2) 강의 계획
const lecGoal = ref(''); //강의 목표
const lecContent = ref(''); //강의 내용
const lecSpecifics = ref(''); //강의 기타사항

// 3) N주차별 학습 목표
const lecWeekPlanList = ref([]);

//lecWeekPlanList가 비어있어도 lecSectionCnt만큼 테이블의 row가 만들어져야 한다.
const displayWeekPlan = computed(() => {
  // lecSectionCnt나 lecWeekPlanList가 준비되지 않았으면 빈 배열 반환
  if (lecSectionCnt.value <= 0) {
    return [];
  }

  // lecWeekPlanList를 주차(lecWeekRound) 기준으로 쉽게 찾을 수 있도록 Map으로 변환
  const planMap = new Map(lecWeekPlanList.value.map((plan) => [plan.lecWeekRound, plan]));

  const mergedList = [];
  // 1주차부터 lecSectionCnt 만큼 반복
  for (let i = 1; i <= lecSectionCnt.value; i++) {
    // 해당 주차의 데이터가 Map에 있는지 확인
    if (planMap.has(i)) {
      // 데이터가 있으면 해당 객체를 추가
      mergedList.push(planMap.get(i));
    } else {
      // 데이터가 없으면 v-model이 바인딩될 수 있도록 기본 구조를 가진 빈 객체 추가
      mergedList.push({
        lecWeekRound: i,
        lecWeekGoal: '',
        lecWeekContent: '',
        lecWeekPlanId: '',
      });
    }
  }

  return mergedList;
});

// --- toggle save || update
const isUpdate = ref(false);

const searchDetail = (lecId, lecInstructorId) => {
  try {
    const param = new URLSearchParams();
    param.append('lecId', lecId);
    param.append('lecInstructorId', lecInstructorId);

    axios.post('/api/lecture/lectureManagePlanDetail.do', param).then((res) => {
      console.log(res.data);

      lectureDetail.value = res.data.lectureManagePlanDetailValue;

      lecName.value = lectureDetail.value.lecName;
      lecInstructorName.value = lectureDetail.value.lecInstructorName;
      lecRoomName.value = lectureDetail.value.lecRoomName;
      insEmail.value = lectureDetail.value.insEmail;
      insHp.value = lectureDetail.value.insHp;
      lecStartDate.value = lectureDetail.value.lecStartDate;
      lecEndDate.value = lectureDetail.value.lecEndDate;
      lecPersonnel.value = lectureDetail.value.lecPersonnel;
      lecDaysCnt.value = lectureDetail.value.lecDaysCnt;
      lecSectionCnt.value = lectureDetail.value.lecSectionCnt;

      lecGoal.value = lectureDetail.value.lecGoal;
      lecContent.value = lectureDetail.value.lecContent;
      lecSpecifics.value = lectureDetail.value.lecSpecifics;

      lecWeekPlanList.value = lectureDetail.value.lecWeekPlanList;

      if (lecWeekPlanList.value.length > 0) {
        isUpdate.value = true;
      }
    });
  } catch (err) {
    console.log(err);
    alert('강의 상세 및 계획서 불러오기 실패!');
    return;
  }
};

const LecturePlanSave = async () => {
  try {
    //validation check

    const params = {
      lecId: lecId.value || detailProps.value.lecId,
      lecGoal: lecGoal.value,
      lecContent: lecContent.value,
      lecSpecifics: lecSpecifics.value,
      lecManageWeekPlanList: displayWeekPlan.value,
    };

    //send request
    if (isUpdate.value) {
      const response = await axios.post('/api/lecture/lectureManagePlanSave.do', params);
      if (response.data.result === 'success') {
        alert('저장되었습니다.');
      } else if (response.data.result === 'fail') {
        alert('저장된 내용이 없습니다.');
      }
    } else {
      const response = await axios.post('/api/lecture/lectureManagePlanSave.do', params);
      if (response.data.result === 'success') {
        alert('수정되었습니다.');
      }
    }

    emit('lecture-plan-register-submit-success');
    closeModal();
  } catch (err) {
    console.log(err);
    alert('오류로 인한 실패!');
    return;
  }
};

const closeModal = () => {
  modalState.$patch({ isOpen: false, type: 'lecture-manage-plan' });
};

watch(
  () => props.lectureData,
  (newData) => {
    if (newData) {
      // props를 직접 수정하지 않기 위해 객체를 복사하여 사용
      detailProps.value = { ...newData };
      searchDetail(detailProps.value.lecId, detailProps.value.lecInstructorId);
    }
  },
  {
    immediate: true, // 컴포넌트가 마운트될 때 즉시 실행
    deep: true,
  },
);
</script>
<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <div class="lecture-detail-modal">
        <div class="modal-header">
          <h2>강의 상세 및 계획서</h2>
          <button class="close-btn" @click="closeModal()">&times;</button>
        </div>

        <div class="modal-content">
          <section class="section">
            <h3 class="section-header">강의 상세</h3>
            <table class="detail-table">
              <tbody>
                <tr>
                  <th>강의</th>
                  <td colspan="3">{{ lecName }}</td>
                </tr>
                <tr>
                  <th>강사</th>
                  <td>
                    <input v-model="lecInstructorName" />
                  </td>
                  <th>강의실<span class="required-star">*</span></th>
                  <td>{{ lecRoomName }}</td>
                </tr>
                <tr>
                  <th>이메일</th>
                  <td>{{ insEmail }}</td>
                  <th>연락처</th>
                  <td>{{ insHp }}</td>
                </tr>
                <tr>
                  <th>강의 시작일</th>
                  <td>{{ lecStartDate }}</td>
                  <th>강의 종료일</th>
                  <td>{{ lecEndDate }}</td>
                </tr>
                <tr>
                  <th>정원</th>
                  <td>{{ lecPersonnel }}</td>
                  <th>강의 일수(주차)</th>
                  <td>{{ lecDaysCnt }}일 ({{ lecSectionCnt }}주차)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="section">
            <h3 class="section-header">강의 계획</h3>

            <div class="plan-item">
              <h4>강의목표<span class="required-star">*</span></h4>
              <textarea class="content-box" v-model="lecGoal"> </textarea>
            </div>

            <div class="plan-item">
              <h4>강의내용<span class="required-star">*</span></h4>
              <textarea class="content-box" v-model="lecContent"> </textarea>
            </div>

            <div class="plan-item">
              <h4>강의기타사항<span class="required-star">*</span></h4>
              <textarea class="content-box" v-model="lecSpecifics"> </textarea>
            </div>

            <table class="plan-table">
              <thead>
                <tr>
                  <th>주차<span class="required-star">*</span></th>
                  <th>학습목표<span class="required-star">*</span></th>
                  <th>학습내용<span class="required-star">*</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, index) in displayWeekPlan" :key="index">
                  <td>{{ week.lecWeekRound }}주차</td>
                  <td><input class="align-left" v-model="week.lecWeekGoal" /></td>
                  <td><input class="align-left" v-model="week.lecWeekContent" /></td>
                </tr>
                <tr v-if="!displayWeekPlan || displayWeekPlan.length === 0">
                  <td colspan="3" class="empty-message">강의 주차 정보가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="LecturePlanSave">
            {{ isUpdate ? '수정' : '신청' }}
          </button>
          <button class="btn btn-secondary" @click="closeModal()">닫기</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- 기본 모달 레이아웃 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lecture-detail-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* --- 헤더, 콘텐츠, 푸터 공통 --- */
.modal-header {
  background-color: #475569;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  flex-shrink: 0;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.75rem;
  cursor: pointer;
}

.modal-content {
  background-color: #f8fafc;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  flex-shrink: 0;
}

/* --- 섹션 스타일 --- */
.section {
  margin-bottom: 2rem;
}
.section-header {
  background-color: #e2e8f0;
  color: #334155;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 4px;
}

/* --- 상세 정보 테이블 --- */
.detail-table {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.9rem;
}
.detail-table th,
.detail-table td {
  border: 1px solid #e2e8f0;
  padding: 0.8rem;
}
.detail-table input {
  width: 100%;
  border: 1px solid #e2e8f0;
  padding: 0.8rem;
}
.detail-table th {
  background-color: #f1f5f9;
  font-weight: 600;
  width: 120px;
  text-align: center;
}
.detail-table td {
  background-color: white;
}

/* --- 강의 계획 스타일 --- */
.plan-item {
  margin-top: 1.5rem;
}
.plan-item h4 {
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  background-color: #e2e8f0;
  color: #334155;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border: 1px solid #d1d5db;
  border-bottom: none;
  margin: 0;
}
.content-box {
  background-color: white;
  padding: 1rem;
  min-height: 80px;
  border: 1px solid #d1d5db;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap; /* 줄바꿈과 공백을 그대로 표시 */
}

textarea.content-box {
  width: 100%;
  background-color: white;
  padding: 1rem;
  min-height: 80px;
  border: 1px solid #d1d5db;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap; /* 줄바꿈과 공백을 그대로 표시 */
}

/* --- 주차별 계획 테이블 --- */
.plan-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}
.plan-table th,
.plan-table td {
  border: 1px solid #d1d5db;
  padding: 0.8rem;
  background-color: white;
  text-align: center;
}
.plan-table th {
  background-color: #f1f5f9;
  font-weight: 600;
}
.plan-table input {
  padding: 0;
  width: 100%;
  border: 1px solid #d1d5db;
  /* padding: 0.8rem; */
  text-align: center;
}
.plan-table .align-left {
  text-align: left;
  padding: 0;
}
.empty-message {
  padding: 2rem;
  color: #9ca3af;
}

/* --- 기타 공통 스타일 --- */
.required-star {
  color: #ef4444;
  margin-left: 4px;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
}
.btn-primary:hover {
  background-color: #2563eb;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
</style>

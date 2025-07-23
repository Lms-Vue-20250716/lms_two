<script setup>
import { useUserInfo } from '@/stores/loginInfoState';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  lectureData: {
    type: Object,
    default: () => ({}), // 기본값은 빈 객체
  },
});

const emit = defineEmits(['postSuccess']);

// --- 로그인 정보 가져오기 ---
const userInfoStore = useUserInfo();
// computed를 사용해 user 객체가 null일 때도 에러 없이 안전하게 값을 가져옴
const loginId = computed(() => userInfoStore.user?.loginId);
const userType = computed(() => userInfoStore.user?.userType);

// --- 모달 관련
const modalState = useModalState();
const detailProps = ref({});

// --- 서버로부터 받은 데이터
const isLectureRegistrationAvailable = ref('');
const lectureDetail = ref({});

// --- 모달에 뿌려질 데이터
// 1) 강의 상세
const lecId = ref(''); //강의ID
const lecName = ref(''); //강의
const lecInstructorName = ref(''); //강사
const lecRoomName = ref(''); //강의실
const insEmail = ref(''); //이메일
const insHp = ref(''); //연락처
const lecStartDate = ref(''); //강의 시작일
const lecEndDate = ref(''); //강의 종료일
const lecPersonnel = ref(0); //정원
const lecDaysCnt = ref(0); //강의 일수(주차) TODO - 강의 일수(주차)	1(2주차) 에서 2주차는 어디에서 나온거임?

// 2) 강의 계획
const lecGoal = ref(''); //강의 목표
const lecContent = ref(''); //강의 내용
const lecSpecifics = ref(''); //강의 기타사항

// 3) N주차별 학습 목표
const lecWeekPlanList = ref([]);

const searchDetail = (lecId) => {
  try {
    const param = new URLSearchParams();
    param.append('lecId', lecId);

    axios.post('/api/lecture/lectureDetail.do', param).then((res) => {
      console.log(res.data);
      isLectureRegistrationAvailable.value = res.data.isLectureRegistrationAvailable;
      lectureDetail.value = res.data.lectureDetailValue;

      lecName.value = lectureDetail.value.lecName;
      lecInstructorName.value = lectureDetail.value.lecInstructorName;
      lecRoomName.value = lectureDetail.value.lecRoomName;
      insEmail.value = lectureDetail.value.insEmail;
      insHp.value = lectureDetail.value.insHp;
      lecStartDate.value = lectureDetail.value.lecStartDate;
      lecEndDate.value = lectureDetail.value.lecEndDate;
      lecPersonnel.value = lectureDetail.value.lecPersonnel;
      lecDaysCnt.value = lectureDetail.value.lecDaysCnt;

      lecGoal.value = lectureDetail.value.lecGoal;
      lecContent.value = lectureDetail.value.lecContent;
      lecSpecifics.value = lectureDetail.value.lecSpecifics;

      lecWeekPlanList.value = lectureDetail.value.lecWeekPlanList;
    });
  } catch (err) {
    console.log(err);
    alert('강의 상세 및 계획서 불러오기 실패!');
    return;
  }
};

const courseRegister = async () => {
  try {
    const params = new URLSearchParams();
    params.append('lecId', lecId.value || detailProps.value.lecId);
    params.append('studentId', loginId.value);

    const response = await axios.post('/api/lecture/lectureStdRegister.do', params);

    console.log(response);

    const resultData = response.data;

    if (resultData.result === 'success') {
      alert('신청되었습니다.');
      modalState.$patch({ isOpen: false, type: 'lecture-list-detail' });
    } else if (resultData.result === 'loginIdNotExist') {
      alert('학생정보가 등록되어 있지 않아 수강 신청할 수 없습니다.\n관리자에게 문의하시오.');
    } else if (resultData.result === 'lecIdAlreadyExist') {
      alert('이미 수강 신청한 강의입니다.');
    } else if (resultData.result === 'lecExceedsCapacity') {
      alert('현재 수강 인원이 모두 마감되었습니다. 다른 강의를 확인해 주세요.');
    } else {
      alert('알 수 없는 오류로 수강 신청에 실패했습니다.');
    }
  } catch (err) {
    console.log(err);
    alert('수강 신청 실패!');
    return;
  }
};

watch(
  () => props.lectureData,
  (newData) => {
    if (newData) {
      // props를 직접 수정하지 않기 위해 객체를 복사하여 사용
      detailProps.value = { ...newData };
      searchDetail(detailProps.value.lecId);
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
          <button
            class="close-btn"
            @click="modalState.$patch({ isOpen: false, type: 'lecture-list-detail' })"
          >
            &times;
          </button>
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
                  <td>{{ lecInstructorName }}</td>
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
              <div class="content-box">
                {{ lecGoal || '아직 입력된 정보가 없습니다.' }}
              </div>
            </div>

            <div class="plan-item">
              <h4>강의내용<span class="required-star">*</span></h4>
              <div class="content-box">
                {{ lecContent || '아직 입력된 정보가 없습니다.' }}
              </div>
            </div>

            <div class="plan-item">
              <h4>강의기타사항<span class="required-star">*</span></h4>
              <div class="content-box">
                {{ lecSpecifics || '아직 입력된 정보가 없습니다.' }}
              </div>
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
                <tr v-for="week in lecWeekPlanList" :key="week.week">
                  <td>{{ week.lecWeekRound }}주차</td>
                  <td class="align-left">{{ week.lecWeekGoal }}</td>
                  <td class="align-left">{{ week.lecWeekContent }}</td>
                </tr>
                <tr v-if="!lecWeekPlanList || lecWeekPlanList.length === 0">
                  <td colspan="3" class="empty-message">주차별 계획 정보가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" @click="courseRegister" v-if="userType === 'S'">
            신청
          </button>
          <button
            class="btn btn-secondary"
            @click="modalState.$patch({ isOpen: false, type: 'lecture-list-detail' })"
          >
            닫기
          </button>
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
  text-align: center;
}
.plan-table th {
  background-color: #f1f5f9;
  font-weight: 600;
}
.plan-table td {
  background-color: white;
}
.plan-table .align-left {
  text-align: left;
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

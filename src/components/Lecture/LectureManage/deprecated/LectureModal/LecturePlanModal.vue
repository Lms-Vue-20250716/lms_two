<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  lecId: {
    type: Number,
    default: 0,
    required: true,
  },
  lecInstructorId: {
    type: String,
    required: true,
  },
});

//emit plan-update-success
const emit = defineEmits(['plan-save-success', 'plan-modal-close']); // 부모에게 보낼 이벤트를 정의합니다.

//변수
const lecNameManagePlan = ref(''); //강의
const lecInstructorNameManagePlan = ref(''); //강사
const lecRoomNameManagePlan = ref(''); //강의실
const insEmailManagePlan = ref(''); //이메일
const insHpManagePlan = ref(''); //연락처
const lecStartDateManagePlan = ref(''); //강의 시작일
const lecEndDateManagePlan = ref(''); //강의 종료일

const lectureGoal = ref(''); //강의목표
const lectureContent = ref(''); //강의내용
const lectureSpecifics = ref(''); //강의기타사항

//세부 week-plans
const lecWeekPlanList = ref([]); // 세부 weekly plans

const getLectureManagePlanDetail = async () => {
  try {
    if (!props.lecId || !props.lecInstructorId) {
      alert('잘못된 접근입니다.');
      return;
    }

    // console.log(props.lecId);
    // console.log(props.lecInstructorId);

    const response = await axios.get('/api/lecture/lectureManagePlanDetail.do', {
      params: {
        lecId: props.lecId,
        lecInstructorId: props.lecInstructorId,
      },
    });

    const result = response.data.lectureManagePlanDetailValue;
    // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    // console.log(response.data.lectureManagePlanDetailValue);

    //강의: lecNameManagePlan
    lecNameManagePlan.value = result.lecName;
    //강사: lecInstructorNameManagePlan
    lecInstructorNameManagePlan.value = result.lecInstructorName;
    //강의실: lecRoomNameManagePlan
    lecRoomNameManagePlan.value = result.lecRoomName;
    //이메일: insEmailManagePlan
    insEmailManagePlan.value = result.insEmail;
    //연락처: insHpManagePlan
    insHpManagePlan.value = result.insHp;
    //강의시작일: lecStartDateManagePlan
    lecStartDateManagePlan.value = result.lecStartDate;
    //강의종료일: lecEndDateManagePlan
    lecEndDateManagePlan.value = result.lecEndDate;

    //강의목표: lectureGoal
    lectureGoal.value = result.lecGoal;
    //강의내용: lectureContent
    lectureContent.value = result.lecContent;
    //강의기타고려사항: lectureSpecifics
    lectureSpecifics.value = result.lecSpecifics;

    //주간계획 리스트
    const fetchedWeeklyPlans = response.data.lectureManagePlanDetailValue.lecWeekPlanList;
    lecWeekPlanList.value =
      fetchedWeeklyPlans && fetchedWeeklyPlans.length > 0
        ? fetchedWeeklyPlans
        : [{ lecWeekRound: 1, lecWeekGoal: '', lecWeekContent: '' }];

    // console.log(lecWeekPlanList.value);
  } catch (err) {
    console.log('lecture-manage-plan-modal에서 getLectureManagePlanDetail()시 에러');
    console.log(err);
    return;
  }
};

const handlePlanSave = async () => {
  try {
    //1. validation check
    if (!props.lecId) {
      alert('잘못된 접근입니다.');
      return;
    }

    //2. prepare parameter
    console.log(lectureGoal.value);

    //3. axios.post()
    await axios.post('/api/lecture/lectureManagePlanSave.do', {
      lecId: props.lecId,
      lecGoal: lectureGoal.value,
      lecContent: lectureContent.value,
      lecSpecifics: lectureSpecifics.value,
      lecManageWeekPlanList: lecWeekPlanList.value,
    });

    //4. exit modal
    emit('plan-modal-close');
  } catch (err) {
    console.log(err);
  }
};

/**
 * 모달의 모든 입력 필드를 초기 상태로 리셋하는 함수입니다.
 */
const initializeVariables = () => {
  lecNameManagePlan.value = '';
  lecInstructorNameManagePlan.value = '';
  lecRoomNameManagePlan.value = '';
  insEmailManagePlan.value = '';
  insHpManagePlan.value = '';
  lecStartDateManagePlan.value = '';
  lecEndDateManagePlan.value = '';

  lectureGoal.value = '';
  lectureContent.value = '';
  lectureSpecifics.value = '';

  lecWeekPlanList.value = [];

  console.log('모달이 닫히면서 내부 상태가 초기화되었습니다.');
};

onMounted(() => {
  getLectureManagePlanDetail();
});

onUnmounted(() => {
  initializeVariables();
});
</script>
<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form @submit.prevent="handlePlanSave" class="modal-container">
        <!-- 강의 상세 정보 섹션 -->
        <div class="modal-section">
          <h3 class="section-title">강의 상세</h3>
          <div class="detail-grid">
            <div class="grid-item">
              <label class="form-label">강의<span class="required-star">*</span></label>
              <input type="text" :value="lecNameManagePlan" readonly class="readonly-input" />
            </div>
            <div class="grid-item"></div>
            <!-- 빈 공간 -->
            <div class="grid-item">
              <label class="form-label">강사<span class="required-star">*</span></label>
              <input
                type="text"
                :value="lecInstructorNameManagePlan"
                readonly
                class="readonly-input"
              />
            </div>
            <div class="grid-item">
              <label class="form-label">강의실<span class="required-star">*</span></label>
              <input type="text" :value="lecRoomNameManagePlan" readonly class="readonly-input" />
            </div>
            <div class="grid-item">
              <label class="form-label">이메일<span class="required-star">*</span></label>
              <input type="email" :value="insEmailManagePlan" readonly class="readonly-input" />
            </div>
            <div class="grid-item">
              <label class="form-label">연락처<span class="required-star">*</span></label>
              <input type="text" :value="insHpManagePlan" readonly class="readonly-input" />
            </div>
            <div class="grid-item">
              <label class="form-label">강의 시작일<span class="required-star">*</span></label>
              <input type="text" :value="lecStartDateManagePlan" readonly class="readonly-input" />
            </div>
            <div class="grid-item">
              <label class="form-label">강의 종료일<span class="required-star">*</span></label>
              <input type="text" :value="lecEndDateManagePlan" readonly class="readonly-input" />
            </div>
          </div>
        </div>

        <!-- 강의 계획 섹션 -->
        <div class="modal-section">
          <h3 class="section-title">강의 계획</h3>
          <div class="space-y-2">
            <label class="form-label standalone"
              >강의목표<span class="required-star">*</span></label
            >
            <textarea v-model="lectureGoal" rows="3" class="form-textarea"></textarea>
          </div>
          <div class="space-y-2">
            <label class="form-label standalone"
              >강의내용<span class="required-star">*</span></label
            >
            <textarea v-model="lectureContent" rows="3" class="form-textarea"></textarea>
          </div>
          <div class="space-y-2">
            <label class="form-label standalone"
              >강의기타사항<span class="required-star">*</span></label
            >
            <textarea v-model="lectureSpecifics" rows="3" class="form-textarea"></textarea>
          </div>
        </div>

        <!-- 주차별 계획 섹션 -->
        <div class="modal-section">
          <div class="week-grid-header">
            <div class="col-span-2">주차<span class="required-star">*</span></div>
            <div class="col-span-5">학습목표<span class="required-star">*</span></div>
            <div class="col-span-5">학습내용<span class="required-star">*</span></div>
          </div>
          <div v-for="plan in lecWeekPlanList" :key="plan.lecId" class="week-grid-row">
            <div class="week-cell">{{ plan.lecWeekRound }}주차</div>
            <div class="week-input-cell">
              <input type="text" v-model="plan.lecWeekGoal" class="week-input" />
            </div>
            <div class="week-input-cell">
              <input type="text" v-model="plan.lecWeekContent" class="week-input" />
            </div>
          </div>
        </div>

        <!-- 하단 버튼 섹션 -->
        <div class="button-container">
          <button type="submit" class="action-button primary">수정</button>
          <button @click="emit('plan-modal-close')" type="button" class="action-button secondary">
            취소
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
<style scoped>
@import 'tailwindcss';

.modal-overlay {
  /* [수정] bg-opacity-50과 bg-black을 bg-black/50으로 합쳤습니다. */
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/50;
}

.modal-container {
  @apply max-h-[90vh] w-full max-w-4xl space-y-6 overflow-y-auto rounded-lg bg-white p-6 shadow-xl;
}

.modal-section {
  @apply space-y-4 rounded-md border p-4;
}

.section-title {
  @apply border-b pb-2 text-lg font-semibold text-gray-700;
}

.detail-grid {
  @apply grid grid-cols-1 gap-4 text-sm md:grid-cols-2;
}

.grid-item {
  @apply grid grid-cols-3 items-center;
}

.form-label {
  @apply col-span-1 font-medium text-gray-600;
}

.form-label.standalone {
  @apply col-span-full;
}

.required-star {
  @apply ml-1 text-red-500;
}

.readonly-input {
  @apply col-span-2 rounded-md border bg-gray-100 p-2;
}

.form-textarea {
  @apply w-full rounded-md border p-2;
}

.week-grid-header {
  @apply grid grid-cols-12 gap-2 rounded-t-md bg-gray-100 p-2 text-center font-semibold;
}

.week-grid-row {
  @apply mt-2 grid grid-cols-12 items-center gap-2;
}

.week-cell {
  @apply col-span-2 rounded-md border bg-gray-50 p-2 text-center;
}

.week-input-cell {
  @apply col-span-5;
}

.week-input {
  @apply w-full rounded-md border p-2;
}

.button-container {
  @apply flex justify-center space-x-4 pt-4;
}

.action-button {
  @apply rounded-md px-6 py-2 font-semibold;
}

.action-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-button.secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}
</style>

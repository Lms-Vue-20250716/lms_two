<script setup>
import { useUserInfo } from '@/stores/loginInfoState';
import { useModalState } from '@/stores/modalState';
import axios from 'axios';
import { computed, ref, watch } from 'vue';

const modalState = useModalState();

const props = defineProps({
  lectureData: {
    type: Object, // 데이터 타입은 객체
    default: () => ({}), // 기본값은 빈 객체
  },
});

// --- 로그인 정보 가져오기 ---
const userInfoStore = useUserInfo();
// computed를 사용해 user 객체가 null일 때도 에러 없이 안전하게 값을 가져옴
const userType = computed(() => userInfoStore.user?.userType);

// --- 모달 로드시 부모 게시판 글에서 받아오는 게시글 아이디
const testId = ref(0);
const lecId = ref('');

// --- 모달 로드시 서버에서받아오는 변수들
const lecInstructorId = ref('');
const testQuestionInfoDetail = ref([]); //문제가 들어있는 리스트. "1+1=?"
const testQuestionAnswerInfoDetail = ref([]); //정답이 들어있는 array. querId 몇에 correctOptionId는? 1~5
const testQuestionOptionInfoDetail = ref([]); //아래 문제 추가목록의 각 row? 문제당 5개씩 들어감. 3개면 15개, 5개면 25개

// --- 추가된 문제 목록을 저장할 배열 ---
const addedQuestions = ref([]);

// --- "추가된 문제 목록" 1 row에 들어가는 변수들
const newQuestionContent = ref('');
const newOptions = ref(['', '', '', '', '']); // 5개의 보기를 하나의 배열로 관리
const newPoints = ref(0); // 기본 배점
const newCorrectAnswer = ref(1); // 기본 정답

// --- validation check을 위한 변수들
const totalQuestionQuantity = ref(0);
const totalPoints = ref(0);

// --- 수정 모드인지 판별하는 상태 변수 추가
const isUpdateMode = ref(false);
const isEditing = ref([]); // 각 문제의 수정 상태를 담을 배열

const searchTestDetail = async () => {
  try {
    const param = {
      testId: testId.value,
      lecId: lecId.value,
    };

    const response = await axios.post('/api/lecture/testQuestionInfoDetail.do', param);
    lecInstructorId.value = response.data.lecInstructorId;
    testQuestionAnswerInfoDetail.value = response.data.testQuestionAnswerInfoDetail;
    testQuestionInfoDetail.value = response.data.testQuestionInfoDetail;
    testQuestionOptionInfoDetail.value = response.data.testQuestionOptionInfoDetail;

    // console.log(response);
    // console.log(lecInstructorId.value);
    // console.log(testQuestionInfoDetail.value);
    // console.log(testQuestionAnswerInfoDetail.value);
    // console.log(testQuestionOptionInfoDetail.value);

    // --- 서버에서 받아온 데이터를 전처리하여 addedQuestions 배열에 추가해 모달 하단 '문제 추가' 부분에 문제 추가
    const questionDetails = response.data.testQuestionInfoDetail;
    const questionOptions = response.data.testQuestionOptionInfoDetail;
    const questionAnswers = response.data.testQuestionAnswerInfoDetail;

    // 1. 서버에서 받아온 3개의 배열을 조합하여 addedQuestions 배열을 재구성합니다.
    const reconstructedQuestions = questionDetails.map((detail) => {
      // 2. 현재 문제(detail)에 해당하는 보기들(options)을 찾습니다.
      const options = questionOptions
        .filter((option) => option.questionId === detail.questionId)
        .sort((a, b) => a.optionId - b.optionId) // optionId 순서대로 정렬
        .map((option) => option.optionContent); // 보기 내용만 추출

      // 3. 현재 문제에 해당하는 정답을 찾습니다.
      const answer = questionAnswers.find((ans) => ans.questionId === detail.questionId);

      // 4. 화면 표시용 객체 형식으로 조합하여 반환합니다.
      return {
        id: detail.questionId, // 서버에서 받은 고유 ID 사용
        content: detail.questionContent,
        points: detail.questionScore,
        answer: answer ? answer.correctOptionId : null, // 정답이 없을 경우 null 처리
        options: options,
      };
    });

    // 5. 재구성된 배열을 addedQuestions에 할당합니다.
    addedQuestions.value = reconstructedQuestions;
    // 각 문제의 수정 상태를 false로 초기화합니다.
    isEditing.value = Array(addedQuestions.value.length).fill(false);

    // --- ------------------------------------ ---

    // '최대 문제 수'와 '총 만점'도 서버 데이터로 설정
    if (questionDetails && questionDetails.length > 0) {
      // 기존 데이터가 있으면 isUpdateMode를 true로 설정
      isUpdateMode.value = true;

      // 최대 문제 수 값을 넣고 read only로 바꾼다.
      totalQuestionQuantity.value = questionDetails.length;

      // 총 만점은 모든 문제의 배점 합계로 설정
      totalPoints.value = questionDetails.reduce((sum, q) => sum + q.questionScore, 0);
    } else {
      // 기존 데이터가 없으면 isUpdateMode를 false로 설정
      isUpdateMode.value = false;
      alert('아직 등록된 문제가 없습니다. 시험 문제를 등록해주세요.');
      if (userType.value === 'T') {
        //close modal
        modalState.$patch({ isOpen: false, type: 'test-detail' }); // 모달 닫기
      }

      return;
    }
  } catch (err) {
    console.log(err);
  }
};

const addQuestionToList = () => {
  // 간단한 유효성 검사
  if (!newQuestionContent.value) {
    alert('문제 내용을 입력해주세요.');
    return;
  }
  const isAnyOptionEmpty = newOptions.value.some((option) => option === '');
  if (isAnyOptionEmpty) {
    alert('모든 보기를 입력해주세요.');
    return;
  }

  if (addedQuestions.value.length > totalQuestionQuantity.value) {
    alert('최대 문제수 보다 더 많은 문제를 추가하셨습니다!');
    return;
  }

  if (newPoints.value <= 0 || newPoints.value > 10) {
    alert('배점은 1점 이상 10점 이하로 입력해주세요.');
    return;
  }

  // 현재 목록에 있는 점수 총합 계산
  const currentPointsSum = addedQuestions.value.reduce((sum, question) => sum + question.points, 0);

  if (currentPointsSum + newPoints.value > totalPoints.value) {
    alert('총 만점을 초과하는 배점을 부여할 수 없습니다!');
    return;
  }

  // 입력된 값들로 새로운 문제 객체를 만듭니다.
  const newQuestion = {
    id: Date.now(), // v-for의 key로 사용할 임시 고유 ID
    content: newQuestionContent.value,
    points: newPoints.value,
    answer: newCorrectAnswer.value,
    options: [...newOptions.value], // 배열 복사
  };

  // 만들어진 객체를 목록 배열에 추가합니다.
  addedQuestions.value.push(newQuestion);

  // 새 문제에 대한 수정 상태 추가
  isEditing.value.push(false);

  // 다음 입력을 위해 폼을 초기화합니다.
  newQuestionContent.value = '';
  newOptions.value = ['', '', '', '', ''];
  newPoints.value = 1;
  newCorrectAnswer.value = 1;
};

/**
 * 목록에서 특정 문제를 삭제하는 함수
 * @param {number} index - 삭제할 문제의 배열 인덱스
 */
const removeQuestion = (index) => {
  addedQuestions.value.splice(index, 1);
  isEditing.value.splice(index, 1); // 해당 문제의 수정 상태도 함께 삭제
};

const saveQuestionList = async () => {
  // ====================================================================
  // 1. 모든 개별 문제에 대한 유효성 검사 (가장 먼저 실행)
  // ====================================================================
  for (let i = 0; i < addedQuestions.value.length; i++) {
    const question = addedQuestions.value[i];
    const questionNumber = i + 1; // 사용자에게 보여줄 문제 번호

    if (!question.content) {
      alert(`${questionNumber}번 문제의 내용을 입력해주세요.`);
      return; // 함수 실행 중단
    }
    if (question.options.some((opt) => !opt && opt !== 0)) {
      // 빈 문자열, null, undefined 체크
      alert(`${questionNumber}번 문제의 모든 보기를 입력해주세요.`);
      return;
    }
    if (question.points <= 0 || question.points > 10) {
      alert(`${questionNumber}번 문제의 배점은 1점 이상 10점 이하로 입력해주세요.`);
      return;
    }
  }

  // ====================================================================
  // 2. 전체 문제 목록에 대한 유효성 검사
  // ====================================================================
  //1. 최대 문제수랑 문제추가목록.length 갯수같아야 한다.
  if (addedQuestions.value.length !== totalQuestionQuantity.value) {
    alert(
      `문제 개수가 최대 문제 수(${totalQuestionQuantity.value}개)와 일치해야 합니다. (현재: ${addedQuestions.value.length}개)`,
    );
    return;
  }

  if (addedQuestions.value.length === 0) {
    alert('문제를 하나 이상 추가해주세요.');
    return;
  }

  //2. 문제추가목록 각 item의 배점 다 더한게 총 만점이랑 같아야한다.
  // 현재 목록에 있는 점수 총합 계산
  const currentPointsSum = addedQuestions.value.reduce((sum, question) => sum + question.points, 0);

  if (currentPointsSum != totalPoints.value) {
    alert(
      '문제들의 배점의 총합이 ' +
        totalPoints.value +
        '와 같아야 합니다. 현재는 ' +
        currentPointsSum +
        ' 점 입니다.',
    );
    return;
  }

  // --- 서버에 보낼 파라미터를 담을 배열 초기화 ---
  const questionList = [];
  const optionList = [];
  const answerList = [];

  // --- 3. addedQuestions 배열을 순회하며 데이터 가공 ---
  addedQuestions.value.forEach((question, index) => {
    //questionId = lectureId + testId + questionNo;
    const questionId = `${lecId.value}${testId.value}${index + 1}`;
    const questionNumber = index + 1;

    // 3-1. questionList에 추가할 객체 생성
    questionList.push({
      lecId: lecId.value,
      testId: testId.value,
      questionId: questionId,
      questionScore: question.points,
      questionNumber: questionNumber,
      questionContent: question.content,
    });

    // 3-2. answerList에 추가할 객체 생성
    answerList.push({
      lecId: lecId.value,
      testId: testId.value,
      questionId: questionId,
      correctOptionId: question.answer,
    });

    // 3-3. 각 문제의 보기(options)를 순회하며 optionList에 추가
    question.options.forEach((optionContent, optionIndex) => {
      optionList.push({
        lecId: lecId.value,
        testId: testId.value,
        questionId: questionId,
        optionId: optionIndex + 1, // 보기는 1번부터 시작
        optionContent: optionContent,
      });
    });
  });

  //업데이트이면
  if (isUpdateMode.value) {
    //param
    const params = {
      lecId: lecId.value,
      testId: testId.value,
      questionList,
      optionList,
      answerList,
    };
    // console.log('서버로 전송될 최종 파라미터:', params);

    try {
      //axios
      await axios.post('/api/lecture/testQuestionsInfoUpdate.do', params).then((res) => {
        // console.log(res);

        if (res.data.result === 'success') {
          alert('문제 저장이 완료되었습니다.');
        } else if (res.data.result === 'CannotModifyDueToExistingSubmission') {
          alert('시험 응시자가 존재하여 수정이 불가합니다.\n시험을 새로 등록하세요.');
        } else {
          alert('수정 실패하였습니다.');
        }
      });

      //close modal
      modalState.$patch({ isOpen: false, type: 'test-detail' }); // 모달 닫기
    } catch (err) {
      console.error('저장 중 오류 발생:', err);
      alert('수정 실패하였습니다.');
    }
  } else {
    //저장이면
    //param
    const params = {
      questionList,
      optionList,
      answerList,
    };
    console.log('서버로 전송될 최종 파라미터:', params);

    try {
      //axios
      await axios.post('/api/lecture/testQuestionsInfoSave.do', params);
      alert('문제 저장이 완료되었습니다.');

      //close modal
      modalState.$patch({ isOpen: false, type: 'test-detail' }); // 모달 닫기
    } catch (err) {
      console.error('저장 중 오류 발생:', err);
    }
  }
};

/**
 * 문제 수정 폼을 토글하는 함수
 * @param {number} index - 토글할 문제의 배열 인덱스
 */
const toggleEdit = (index) => {
  // isEditing 배열에서 해당 인덱스의 boolean 값을 반전시킵니다.
  isEditing.value[index] = !isEditing.value[index];
};

/**
 * 수정된 문제 내용을 저장(반영)하는 함수
 * @param {number} index - 수정 완료된 문제의 배열 인덱스
 */
const updateQuestion = (index) => {
  isEditing.value[index] = false;
};

watch(
  () => props.lectureData,
  (newData) => {
    if (newData && newData.lecId && newData.testId) {
      // console.log('Props로 전달받은 데이터:', newData);

      testId.value = newData.testId;
      lecId.value = newData.lecId;
      // lecName.value = newData.lecName;
      // lecInstructorName.value = newData.lecInstructorName;
      // lecRoomName.value = newData.lecRoomName;

      // 2. 날짜 형식을 <input type="datetime-local">에 맞게 변환
      // 예: "2025-07-21 12:30:00" -> "2025-07-21T12:30"
      // lecStartDate.value = newData.testBeginDate.substring(0, 16).replace(' ', 'T');
      // lecEndDate.value = newData.testEndDate.substring(0, 16).replace(' ', 'T');

      searchTestDetail();
    }
  },
  {
    immediate: true, // 컴포넌트가 처음 로드될 때도 즉시 한 번 실행
    deep: true, // 객체 내부의 속성 변경까지 감지
  },
);
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay">
      <form @submit.prevent="saveQuestionList" class="test-detail-modal">
        <div v-if="userType === 'M'">
          <div class="form-header">
            <h2>문제 등록</h2>
            <button
              class="close-btn"
              type="button"
              @click="modalState.$patch({ isOpen: false, type: 'test-detail' })"
            >
              &times;
            </button>
          </div>

          <div class="form-body">
            <table class="form-table">
              <tbody>
                <tr>
                  <td class="label-cell"><label for="max-questions">최대 문제 수</label></td>
                  <td>
                    <input
                      type="number"
                      v-model.number="totalQuestionQuantity"
                      :readonly="testQuestionInfoDetail.length > 0"
                    />
                  </td>
                  <td class="label-cell"><label for="total-score">총 만점</label></td>
                  <td><input type="number" v-model.number="totalPoints" /></td>
                </tr>
                <tr>
                  <td class="label-cell"><label for="points">배점</label></td>
                  <td>
                    <input v-model.number="newPoints" type="number" id="points" placeholder="" />
                  </td>
                  <td class="label-cell"><label for="correct-answer">정답 보기</label></td>
                  <td>
                    <select v-model.number="newCorrectAnswer" id="correct-answer">
                      <option value="1">1번</option>
                      <option value="2">2번</option>
                      <option value="3">3번</option>
                      <option value="4">4번</option>
                      <option value="5">5번</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td class="label-cell"><label for="question-content">문제 내용</label></td>
                  <td colspan="3">
                    <input v-model="newQuestionContent" type="text" id="question-content" />
                  </td>
                </tr>

                <tr v-for="(option, index) in newOptions" :key="index">
                  <td class="label-cell">
                    <label :for="'option' + (index + 1)">보기 {{ index + 1 }}</label>
                  </td>
                  <td colspan="3">
                    <input v-model="newOptions[index]" type="text" :id="'option' + (index + 1)" />
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- <div class="form-footer"> -->
            <button class="btn-add" type="button" @click="addQuestionToList">문제 추가</button>
            <!-- </div> -->
          </div>
        </div>

        <div>
          <h3 id="questionListTitle" class="form-header">
            {{ userType === 'M' ? '문제 추가 목록' : '문제 목록' }}
          </h3>
          <table class="list-table">
            <colgroup>
              <col width="10%" />
              <col width="50%" />
              <col width="15%" />
              <col width="15%" />
              <col width="10%" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">번호</th>
                <th scope="col">내용</th>
                <th scope="col">배점</th>
                <th scope="col">정답</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody id="questionListBody">
              <tr v-if="addedQuestions.length === 0"></tr>

              <template v-for="(question, index) in addedQuestions" :key="question.id">
                <tr>
                  <button
                    type="button"
                    style="text-align: center"
                    @click="toggleEdit(index)"
                    class="link-button"
                  >
                    {{ index + 1 }}
                  </button>
                  <td>{{ question.content }}</td>
                  <td style="text-align: center">{{ question.points }}</td>
                  <td style="text-align: center">{{ question.answer }}번</td>
                  <td style="text-align: center">
                    <button
                      v-if="userType === 'M'"
                      @click="removeQuestion(index)"
                      style="color: red; background: none; border: none; cursor: pointer"
                    >
                      삭제
                    </button>
                  </td>
                </tr>

                <tr v-if="isEditing[index]">
                  <td colspan="5" class="edit-form-cell">
                    <div class="edit-form-content">
                      <label :for="'edit-content-' + index">문제 내용</label>
                      <input
                        type="text"
                        :id="'edit-content-' + index"
                        v-model="question.content"
                        :readonly="userType === 'T'"
                      />

                      <label :for="'edit-points-' + index">배점</label>
                      <input
                        type="number"
                        :id="'edit-points-' + index"
                        v-model.number="question.points"
                        :readonly="userType === 'T'"
                      />

                      <div v-for="(option, optIndex) in question.options" :key="optIndex">
                        <label :for="'edit-option-' + index + '-' + optIndex"
                          >보기 {{ optIndex + 1 }}</label
                        >
                        <input
                          type="text"
                          :id="'edit-option-' + index + '-' + optIndex"
                          v-model="question.options[optIndex]"
                          :readonly="userType === 'T'"
                        />
                      </div>

                      <label :for="'edit-answer-' + index">정답</label>
                      <select
                        :id="'edit-answer-' + index"
                        v-model.number="question.answer"
                        :disabled="userType === 'T'"
                      >
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}번</option>
                      </select>

                      <button
                        type="button"
                        class="btn-update"
                        v-if="userType === 'M'"
                        @click="updateQuestion(index)"
                      >
                        수정 완료
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <button type="submit" v-if="userType === 'M'" class="btn-primary">
          {{ isUpdateMode ? '수정' : '저장' }}
        </button>
        <button
          type="button"
          @click="modalState.$patch({ isOpen: false, type: 'test-detail' })"
          class="btn-secondary"
        >
          취소
        </button>
      </form>
    </div>
  </Teleport>
</template>
<style scoped>
/* --- 모달 기본 레이아웃 --- */
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

.test-detail-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 900px;
  /* display: flex; 
  flex-direction: column; */
  max-height: 90vh;
  overflow-y: auto;
}

/* --- 헤더 --- */
.form-header {
  /* 기존 클래스 이름 활용 */
  background-color: #475569;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  flex-shrink: 0; /* 높이가 줄어들지 않도록 설정 */
}

.form-header h2 {
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
  line-height: 1;
}

/* --- 콘텐츠 영역 --- */
.modal-content {
  padding: 1.5rem;
  background-color: #f8fafc;
  overflow-y: auto; /* 내용이 길어지면 스크롤 생성 */
}

.section {
  margin-bottom: 2rem;
}
.section:last-child {
  margin-bottom: 0;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #0d6deb;
}

/* --- 상단 문제 등록 테이블 --- */
.form-table {
  width: 100%;
  border-collapse: collapse;
}
.form-table td {
  border: 1px solid #7e7d7d;
  background-color: white;
  padding: 0.8rem;
  vertical-align: middle;
}
td.label-cell {
  background-color: #919194;
  font-weight: 600;
  width: 120px;
  text-align: center;
}
.form-table input,
.form-table select {
  width: 100%;
  padding: 0.6rem;
  background-color: white;
  border: 1px solid #686868;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.form-footer {
  text-align: right;
  margin-top: 1rem;
}
.btn-add {
  background-color: #45c9ce;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-add:hover {
  background-color: #059669;
}

/* --- 하단 문제 목록 테이블 --- */
.list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  text-align: center;
  background-color: white;
  border: 1px solid #e2e8f0;
}
.list-table th {
  background-color: #e2e8f0;
  padding: 0.75rem;
  font-weight: 600;
  border-bottom: 2px solid #cbd5e1;
}
.list-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.list-table tbody tr:last-child td {
  border-bottom: none;
}
.list-table tbody tr:hover {
  background-color: #f1f5f9;
}
.list-table .content-cell {
  text-align: left;
}
.empty-message {
  padding: 2rem;
  color: #9ca3af;
}

/* --- 1. 수정 폼을 감싸는 테이블 셀 --- */
.edit-form-cell {
  background-color: #f0f3f8; /* 살짝 다른 배경색으로 구분 */
  padding: 1.5rem 2rem;
  /* border-bottom: 2px solid #cbd5e1; */
}

/* --- 2. 수정 폼 콘텐츠 영역 --- */
.edit-form-content {
  max-width: 600px; /* 폼의 최대 너비 제한 */
  margin: 0 auto; /* 중앙 정렬 */
}

/* --- 3. 라벨 스타일 --- */
.edit-form-content label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  margin-top: 1.2rem; /* 각 항목간의 세로 간격 */
  margin-bottom: 0.5rem;
}
.edit-form-content label:first-child {
  margin-top: 0;
}

/* --- 4. input, select 공통 스타일 --- */
.edit-form-content input[type='text'],
.edit-form-content input[type='number'],
.edit-form-content select {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s; /* 부드러운 전환 효과 */
}

/* --- 5. 포커스 및 읽기 전용/비활성화 스타일 --- */
.edit-form-content input:focus,
.edit-form-content select:focus {
  outline: none;
  border-color: #3b82f6; /* 포커스 시 파란색 테두리 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); /* 은은한 그림자 효과 */
}

.edit-form-content input:read-only,
.edit-form-content select:disabled {
  background-color: #e5e7eb;
  cursor: not-allowed;
  opacity: 0.7;
}

/* --- 6. 수정 완료 버튼 --- */
.btn-update {
  display: block; /* 오른쪽 정렬을 위해 블록 요소로 변경 */
  margin-left: auto; /* 자동 마진으로 오른쪽 끝으로 밀어냄 */
  margin-top: 1.5rem;
  background-color: #059669; /* 녹색 계열 버튼 */
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-update:hover {
  background-color: #047857;
}

/* .edit-form-cell {
  padding: 0;
}
.edit-form-content {
  background-color: rgb(199, 199, 199);
  padding: 0;
}

.edit-form-content input {
  background-color: white;
  border-color: #919194;
} */

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}
.delete-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
}

/* --- 하단 버튼 영역 --- */
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
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #2563eb;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #4b5563;
}
</style>

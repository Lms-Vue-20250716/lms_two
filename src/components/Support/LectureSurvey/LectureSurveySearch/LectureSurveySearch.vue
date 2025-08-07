<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
});
const emit = defineEmits(['update:modelValue', 'lectureSelected']);

const lectureList = ref([]);
const selectedLectureId = ref(props.modelValue || '');
const selectedLectureName = ref('');
const showDropdown = ref(false);

// 강의 목록 호출
const fetchLectureList = async () => {
  try {
    const res = await fetch('/api/support/lecture-surveyJson');
    const data = await res.json();
    console.log('응답 데이터:', data);

    const lectures = data.lectures || [];
    if (Array.isArray(lectures)) {
      lectureList.value = lectures;

      const selected = lectures.find((l) => l.lecId === selectedLectureId.value);
      if (selected) {
        selectedLectureName.value = selected.lecName;
      }
    } else {
      console.warn('lectures가 배열이 아님:', lectures);
    }
  } catch (e) {
    console.error('강의 목록 불러오기 실패:', e);
  }
};

const selectLecture = (lecture) => {
  selectedLectureId.value = lecture.lecId;
  selectedLectureName.value = lecture.lecName;
  emit('update:modelValue', lecture.lecId);
  emit('lectureSelected', lecture.lecId);
  showDropdown.value = false;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

watch(
  () => props.modelValue,
  (val) => {
    selectedLectureId.value = val;
  },
);

onMounted(fetchLectureList);
</script>

<template>
  <div class="lecture-search-wrapper" style="margin-top: 15px">
    <table class="row">
      <tbody>
        <tr>
          <th scope="row">강의명<span class="font_red"> *</span></th>
          <td colspan="3" style="position: relative">
            <input
              id="lecName"
              v-model="selectedLectureName"
              type="text"
              class="inputTxt p100"
              placeholder="클릭해서 강의 선택"
              readonly
              @click="toggleDropdown"
              style="
                padding-left: 10px;
                width: 94%;
                border: 1px solid #ccc;
                border-radius: 4px;
                height: 30px;
                cursor: pointer;
                background: #fff;
              "
            />
            <input id="lecId" type="hidden" :value="selectedLectureId" />
            <div
              v-if="showDropdown"
              id="lecDropdown"
              style="
                position: absolute;
                top: 100%;
                left: 0;
                width: 94%;
                max-height: 150px;
                overflow-y: auto;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: #fff;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              "
            >
              <div
                v-if="lectureList.length === 0"
                style="padding: 8px; color: #888; border-bottom: 1px solid #ccc"
              >
                수강중인 강의가 없습니다.
              </div>
              <div
                v-else
                v-for="lecture in lectureList"
                :key="lecture.lecId"
                @click="selectLecture(lecture)"
                style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee"
              >
                {{ lecture.lecName }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.inputTxt {
  outline: none;
}
.p100 {
  width: 100%;
}
.font_red {
  color: red;
}
.row {
  width: 100%;
  border-collapse: collapse;
}
.row th {
  text-align: left;
  padding: 5px;
}
.row td {
  padding: 5px;
}
.lecture-search-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
</style>

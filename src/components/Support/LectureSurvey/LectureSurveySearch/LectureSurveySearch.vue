<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const emit = defineEmits(['lectureSelected']);

const lectureList = ref([]);
const selectedLectureId = ref(''); // 선택된 강의 ID
const selectedLectureName = ref(''); // 선택된 강의 이름
const showDropdown = ref(false);

const fetchLectureList = async () => {
  try {
    const response = await axios.get('/support/getLectureSurveyList.do');
    if (response.data && Array.isArray(response.data.lectureList)) {
      lectureList.value = response.data.lectureList;
    } else {
      lectureList.value = [];
      console.warn('lectureList가 비어 있거나 잘못된 형식입니다.', response.data);
    }
  } catch (error) {
    console.error('강의 목록을 불러오는데 실패했습니다.', error);
  }
};

const selectLecture = (lecture) => {
  selectedLectureId.value = lecture.lecId;
  selectedLectureName.value = lecture.lecName;
  emit('lectureSelected', lecture.lecId);
  showDropdown.value = false;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

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
              name="lecName"
              class="inputTxt p100"
              style="
                padding-left: 10px;
                width: 94%;
                border: 1px solid #ccc;
                border-radius: 4px;
                height: 30px;
                cursor: pointer;
                background: #fff;
              "
              readonly
              placeholder="클릭해서 강의 선택"
              @click="toggleDropdown"
            />
            <input id="lecId" type="hidden" name="lecId" :value="selectedLectureId" />
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

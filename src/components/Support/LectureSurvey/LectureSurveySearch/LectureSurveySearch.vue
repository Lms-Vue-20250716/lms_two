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
  <!-- <div class="search-box">
    <label for="lecture" class="block text-sm font-medium text-gray-700">강의명</label>
    <select
      id="lecture"
      v-model="selectedLectureId"
      @change="onLectureChange"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
    >
      <option disabled value="">강의를 선택하세요</option>
      <option v-for="lecture in lectureList" :key="lecture.lecId" :value="lecture.lecId">
        {{ lecture.lecName }}
      </option>
    </select>
  </div> -->

  <div style="margin-top: 15px">
    <table class="row">
      <tbody>
        <tr>
          <th scope="row">강의명<span class="font_red"> *</span></th>
          <td colspan="3" style="position: relative">
            <input
              type="text"
              id="lecName"
              name="lecName"
              class="inputTxt p100"
              style="padding-left: 10px"
              readonly
              placeholder="클릭해서 강의 선택"
              :value="selectedLectureName"
              @click="toggleDropdown"
            />
            <input type="hidden" id="lecId" name="lecId" :value="selectedLectureId" />
            <div v-if="showDropdown" id="lecDropdown">
              <div v-if="lectureList.length === 0" style="padding: 8px; color: #888">
                수강중인 강의가 없습니다.
              </div>
            </div>

            <ul v-else>
              <li
                v-for="lecture in lectureList"
                :key="lecture.lecId"
                @click="selectLecture(lecture)"
                style="padding: 8px; cursor: pointer"
              >
                {{ lecture.lecname }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
@import './styled.css';
</style>

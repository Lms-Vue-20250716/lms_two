<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  components: {
    Bar,
  },
  props: {
    viewData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    chartData() {
      return {
        labels: this.viewData.map((item) => item.lectureRound + '회차'),
        datasets: [
          {
            label: '수강인원',
            backgroundColor: '#5EABD6',
            data: this.viewData.map((item) => item.lecPersonnel),
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };
    },
    chartData2() {
      return {
        labels: this.viewData.map((item) => item.lectureRound + '회차'),
        datasets: [
          {
            label: '과락인원',
            backgroundColor: '#E14434',
            data: this.viewData.map((item) => item.failedStudents),
          },
        ],
      };
    },
    chartOptions2() {
      return {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };
    },
  },
  mounted() {
    console.log(this.viewData);
  },
};
</script>
<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div class="chart-container">
      <Bar :data="chartData2" :options="chartOptions2" />
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.chart-container {
  flex: 1;
  height: 400px;
  width: 200px;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
}
</style>

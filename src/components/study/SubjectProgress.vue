<template>
  <div class="subject-progress">
    <div class="subject-info">
      <span class="subject-name">{{ name }}</span>
      <span class="subject-hours">{{ finishedHours }}h / {{ targetHours }}h</span>
    </div>
    <n-progress
      type="line"
      :percentage="progress"
      :color="color"
      :rail-color="'#f0f0f0'"
      :show-indicator="false"
      :height="10"
      border-radius="5px"
    />
    <div class="subject-percent">{{ progress }}%</div>
  </div>
</template>

<script setup lang="ts">
import { NProgress } from 'naive-ui'

defineProps<{
  name: string
  targetHours: number
  finishedHours: number
  color: string
  progress: number
}>()
</script>

<style scoped>
.subject-progress {
  padding: 8px 0;
}
.subject-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}
.subject-name {
  font-weight: 500;
  color: #333;
}
.subject-hours {
  color: #999;
}
.subject-percent {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>

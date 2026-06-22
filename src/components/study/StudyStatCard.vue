<template>
  <n-card :bordered="false" class="stat-card" :style="{ borderTop: `3px solid ${color || '#2080f0'}` }">
    <div class="stat-card-content">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-info">
        <div class="stat-value">{{ value }}<span class="stat-suffix" v-if="suffix">{{ suffix }}</span></div>
        <div class="stat-title">{{ title }}</div>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'

defineProps<{
  title: string
  value: string | number
  icon?: string
  color?: string
  suffix?: string
}>()
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  font-size: 36px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}
.stat-suffix {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}
.stat-title {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}
</style>

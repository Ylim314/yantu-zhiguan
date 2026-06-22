<template>
  <n-card class="mistake-card" hoverable @click="emit('click', mistake.id)">
    <div class="mistake-header">
      <n-space align="center">
        <n-tag :type="difficultyType" size="small" round>{{ mistake.difficulty }}</n-tag>
        <span class="mistake-subject">{{ mistake.subjectName }}</span>
        <span class="mistake-chapter">{{ mistake.chapter }}</span>
      </n-space>
    </div>
    <h4 class="mistake-title">{{ mistake.title }}</h4>
    <p class="mistake-reason">错误原因：{{ mistake.reason }}</p>
    <div class="mistake-footer">
      <n-space>
        <n-tag v-for="tag in mistake.tags" :key="tag" size="tiny" :bordered="false">{{ tag }}</n-tag>
      </n-space>
      <n-space align="center" :size="12">
        <span class="review-count">复盘 {{ mistake.reviewCount }} 次</span>
        <span class="review-date">下次：{{ mistake.nextReviewDate }}</span>
      </n-space>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NTag, NSpace } from 'naive-ui'
import type { Mistake } from '@/types'

const props = defineProps<{
  mistake: Mistake
}>()

const emit = defineEmits<{
  (e: 'click', id: number): void
}>()

const difficultyType = computed(() => {
  const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = { '简单': 'success', '中等': 'warning', '困难': 'error' }
  return map[props.mistake.difficulty] || 'default'
})
</script>

<style scoped>
.mistake-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}
.mistake-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.mistake-header {
  margin-bottom: 8px;
}
.mistake-subject {
  font-size: 13px;
  color: #666;
}
.mistake-chapter {
  font-size: 12px;
  color: #999;
}
.mistake-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
}
.mistake-reason {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
}
.mistake-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.review-count {
  font-size: 12px;
  color: #2080f0;
}
.review-date {
  font-size: 12px;
  color: #999;
}
</style>

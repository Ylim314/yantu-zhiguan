<template>
  <div class="plan-calendar">
    <n-timeline v-if="plans.length > 0">
      <n-timeline-item
        v-for="plan in plans"
        :key="plan.id"
        :type="timelineType(plan.status)"
        :title="plan.title"
        :content="planContent(plan)"
        :time="`${plan.date} ${plan.timeRange}`"
      >
        <template #header>
          <n-space align="center">
            <span style="font-weight: 500;">{{ plan.title }}</span>
            <n-tag :type="statusType(plan.status)" size="small">{{ plan.status }}</n-tag>
          </n-space>
        </template>
        <div class="plan-content">
          <span>{{ planContent(plan) }}</span>
          <n-space size="small">
            <n-button
              v-if="plan.status !== '已完成'"
              size="tiny"
              type="primary"
              secondary
              @click="emit('statusChange', plan.id, '已完成')"
            >
              完成
            </n-button>
            <n-popconfirm @positive-click="emit('delete', plan.id)">
              <template #trigger>
                <n-button size="tiny" type="error" secondary>删除</n-button>
              </template>
              确认删除该计划吗？
            </n-popconfirm>
          </n-space>
        </div>
      </n-timeline-item>
    </n-timeline>
    <n-empty v-else description="暂无学习计划" />
  </div>
</template>

<script setup lang="ts">
import { NTimeline, NTimelineItem, NTag, NSpace, NEmpty, NButton, NPopconfirm } from 'naive-ui'
import type { Plan, PlanStatus } from '@/types'

defineProps<{
  plans: Plan[]
}>()

const emit = defineEmits<{
  (e: 'statusChange', id: number, status: PlanStatus): void
  (e: 'delete', id: number): void
}>()

function statusType(status: string): 'default' | 'info' | 'success' | 'warning' {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning'> = { '未开始': 'default', '进行中': 'info', '已完成': 'success', '已取消': 'warning' }
  return map[status] || 'default'
}

function timelineType(status: string): 'default' | 'info' | 'success' | 'warning' {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning'> = { '未开始': 'default', '进行中': 'info', '已完成': 'success', '已取消': 'warning' }
  return map[status] || 'default'
}

function planContent(plan: Plan): string {
  return `${plan.subjectName} | ${plan.timeRange}${plan.remark ? ' | ' + plan.remark : ''}`
}
</script>

<style scoped>
.plan-calendar {
  padding: 8px 0;
}

.plan-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 768px) {
  .plan-content {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

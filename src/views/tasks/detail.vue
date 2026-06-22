<template>
  <div class="task-detail-page">
    <!-- 任务不存在 -->
    <NResult
      v-if="!task"
      status="warning"
      title="任务不存在"
      description="当前任务ID无效或已被删除"
    >
      <template #footer>
        <NButton @click="router.back()">返回上一页</NButton>
      </template>
    </NResult>

    <!-- 任务详情 -->
    <template v-else>
      <NCard :bordered="false">
        <template #header>
          <div class="detail-header">
            <NButton text @click="router.back()" style="margin-right: 12px">
              ← 返回
            </NButton>
            <span class="detail-title">{{ task.title }}</span>
          </div>
        </template>

        <template #header-extra>
          <NButton
            v-if="task.status !== '已完成'"
            type="primary"
            @click="handleMarkComplete"
          >
            标记为已完成
          </NButton>
          <NTag v-else type="success" size="large" round>
            已完成
          </NTag>
        </template>

        <NDescriptions :column="2" label-placement="left" bordered>
          <NDescriptionsItem label="任务标题">
            {{ task.title }}
          </NDescriptionsItem>

          <NDescriptionsItem label="所属科目">
            <NTag type="info" size="small">{{ task.subjectName }}</NTag>
          </NDescriptionsItem>

          <NDescriptionsItem label="任务类型">
            {{ task.type }}
          </NDescriptionsItem>

          <NDescriptionsItem label="优先级">
            <NTag :type="priorityTagType(task.priority)" size="small">
              {{ task.priority }}
            </NTag>
          </NDescriptionsItem>

          <NDescriptionsItem label="当前状态">
            <NTag :type="statusTagType(task.status)" size="small">
              {{ task.status }}
            </NTag>
          </NDescriptionsItem>

          <NDescriptionsItem label="截止日期">
            {{ task.deadline || '未设置' }}
          </NDescriptionsItem>

          <NDescriptionsItem label="预估时间">
            {{ task.estimatedMinutes ? `${task.estimatedMinutes} 分钟` : '未设置' }}
          </NDescriptionsItem>

          <NDescriptionsItem label="实际用时">
            {{ task.actualMinutes ? `${task.actualMinutes} 分钟` : '尚未开始' }}
          </NDescriptionsItem>

          <NDescriptionsItem label="任务描述" :span="2">
            {{ task.description || '暂无描述' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NButton, NTag, NDescriptions, NDescriptionsItem, NResult,
  useMessage
} from 'naive-ui'
import { useStudyStore } from '@/stores/study'
import type { TaskStatus, Priority } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const studyStore = useStudyStore()

/** 根据路由参数获取任务 */
const task = computed(() => {
  const id = Number(route.params.id)
  return studyStore.getTaskById(id) || null
})

/** 优先级标签颜色 */
function priorityTagType(priority: Priority) {
  const map: Record<Priority, 'error' | 'warning' | 'success'> = {
    '高': 'error',
    '中': 'warning',
    '低': 'success'
  }
  return map[priority] || 'default'
}

/** 状态标签颜色 */
function statusTagType(status: TaskStatus) {
  const map: Record<TaskStatus, 'default' | 'info' | 'success' | 'error'> = {
    '未开始': 'default',
    '进行中': 'info',
    '已完成': 'success',
    '已延期': 'error'
  }
  return map[status] || 'default'
}

/** 标记完成 */
async function handleMarkComplete() {
  if (!task.value) return
  try {
    await studyStore.updateTaskStatus(task.value.id, '已完成')
    message.success('已标记为完成')
  } catch (error) {
    message.error(getApiErrorMessage(error, '任务状态更新失败'))
  }
}
</script>

<style scoped>
.task-detail-page {
  padding: 0;
}

.detail-header {
  display: flex;
  align-items: center;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
}
</style>

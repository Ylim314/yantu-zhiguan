<template>
  <n-data-table
    :columns="columns"
    :data="tasks"
    :pagination="{ pageSize: 10 }"
    :bordered="false"
  />
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NDataTable, NButton, NTag, NSpace } from 'naive-ui'
import type { Task } from '@/types'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()

type TagType = 'default' | 'info' | 'success' | 'error' | 'warning' | 'primary'

const statusTypeMap: Record<string, TagType> = {
  '未开始': 'default',
  '进行中': 'info',
  '已完成': 'success',
  '已延期': 'error',
}

const priorityTypeMap: Record<string, TagType> = {
  '高': 'error',
  '中': 'warning',
  '低': 'default',
}

const columns = [
  { title: '任务名称', key: 'title', ellipsis: { tooltip: true } },
  { title: '科目', key: 'subjectName', width: 120 },
  { title: '类型', key: 'type', width: 90 },
  {
    title: '优先级',
    key: 'priority',
    width: 80,
    render(row: Task) {
      return h(NTag, { size: 'small', type: priorityTypeMap[row.priority] || 'default', round: true }, { default: () => row.priority })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render(row: Task) {
      return h(NTag, { size: 'small', type: statusTypeMap[row.status] || 'default' }, { default: () => row.status })
    }
  },
  { title: '截止日期', key: 'deadline', width: 110 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row: Task) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', quaternary: true, onClick: () => emit('view', row.id) }, { default: () => '查看' }),
          h(NButton, { size: 'small', type: 'info', quaternary: true, onClick: () => emit('edit', row.id) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => emit('delete', row.id) }, { default: () => '删除' }),
        ]
      })
    }
  }
]
</script>

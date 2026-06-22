<template>
  <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="90">
    <n-form-item label="任务名称" path="title">
      <n-input v-model:value="formData.title" placeholder="请输入任务名称" />
    </n-form-item>
    <n-form-item label="所属科目" path="subjectId">
      <n-select v-model:value="formData.subjectId" :options="subjects" placeholder="请选择科目" />
    </n-form-item>
    <n-form-item label="任务类型" path="type">
      <n-select v-model:value="formData.type" :options="typeOptions" placeholder="请选择类型" />
    </n-form-item>
    <n-form-item label="优先级" path="priority">
      <n-select v-model:value="formData.priority" :options="priorityOptions" placeholder="请选择优先级" />
    </n-form-item>
    <n-form-item label="状态" path="status">
      <n-select v-model:value="formData.status" :options="statusOptions" placeholder="请选择状态" />
    </n-form-item>
    <n-form-item label="截止日期" path="deadline">
      <n-date-picker v-model:value="formData.deadline" type="date" clearable style="width: 100%;" />
    </n-form-item>
    <n-form-item label="预计时长" path="estimatedMinutes">
      <n-input-number v-model:value="formData.estimatedMinutes" :min="0" placeholder="分钟" style="width: 100%;" />
    </n-form-item>
    <n-form-item label="任务说明">
      <n-input v-model:value="formData.description" type="textarea" :rows="3" placeholder="请输入任务说明" />
    </n-form-item>
    <n-form-item>
      <n-space>
        <n-button type="primary" @click="handleSubmit">提交</n-button>
        <n-button @click="handleCancel">取消</n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NDatePicker, NInputNumber, NButton, NSpace } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import type { Task, TaskType, Priority, TaskStatus } from '@/types'
import { formatLocalDate } from '@/utils/date'

const props = defineProps<{
  task?: Task
  subjects: { label: string; value: number }[]
}>()

const emit = defineEmits<{
  (e: 'submit', data: Omit<Task, 'id'>): void
  (e: 'cancel'): void
}>()

const formRef = ref<FormInst | null>(null)

const formData = reactive({
  title: '',
  subjectId: null as number | null,
  subjectName: '',
  type: '看课' as TaskType,
  priority: '中' as Priority,
  status: '未开始' as TaskStatus,
  deadline: null as number | null,
  estimatedMinutes: 60,
  actualMinutes: 0,
  description: '',
})

watch(() => formData.subjectId, (newId) => {
  const found = props.subjects.find(s => s.value === newId)
  formData.subjectName = found?.label ?? ''
})

function resetForm() {
  formData.title = ''
  formData.subjectId = null
  formData.subjectName = ''
  formData.type = '看课'
  formData.priority = '中'
  formData.status = '未开始'
  formData.deadline = null
  formData.estimatedMinutes = 60
  formData.actualMinutes = 0
  formData.description = ''
  nextTick(() => formRef.value?.restoreValidation())
}

watch(() => props.task, (t) => {
  if (!t) {
    resetForm()
    return
  }

  formData.title = t.title
  formData.subjectId = t.subjectId
  formData.subjectName = t.subjectName
  formData.type = t.type
  formData.priority = t.priority
  formData.status = t.status
  formData.deadline = t.deadline
    ? new Date(`${t.deadline}T00:00:00`).getTime()
    : null
  formData.estimatedMinutes = t.estimatedMinutes
  formData.actualMinutes = t.actualMinutes
  formData.description = t.description
  nextTick(() => formRef.value?.restoreValidation())
}, { immediate: true })

const typeOptions = [
  { label: '看课', value: '看课' },
  { label: '刷题', value: '刷题' },
  { label: '背诵', value: '背诵' },
  { label: '复盘', value: '复盘' },
  { label: '模拟测试', value: '模拟测试' },
  { label: '整理笔记', value: '整理笔记' },
]

const priorityOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

const statusOptions = [
  { label: '未开始', value: '未开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' },
]

const rules: FormRules = {
  title: { required: true, message: '请输入任务名称', trigger: 'blur' },
  subjectId: { required: true, type: 'number', message: '请选择科目', trigger: 'change' },
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  emit('submit', {
    title: formData.title,
    subjectId: formData.subjectId!,
    subjectName: formData.subjectName,
    type: formData.type,
    priority: formData.priority,
    status: formData.status,
    deadline: formData.deadline ? formatLocalDate(formData.deadline) : '',
    estimatedMinutes: formData.estimatedMinutes,
    actualMinutes: formData.actualMinutes,
    description: formData.description,
  })
}

function handleCancel() {
  resetForm()
  emit('cancel')
}
</script>

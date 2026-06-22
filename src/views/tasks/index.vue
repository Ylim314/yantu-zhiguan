<template>
  <div class="tasks-page">
    <PageHeader title="学习任务管理" />

    <!-- 顶部筛选栏 -->
    <NCard :bordered="false" style="margin-bottom: 16px">
      <NGrid :cols="4" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
        <NGi span="4 m:2 l:1">
          <NInput
            v-model:value="searchKeyword"
            placeholder="搜索任务标题..."
            clearable
          >
            <template #prefix>
              <span style="font-size: 14px; color: #999">🔍</span>
            </template>
          </NInput>
        </NGi>
        <NGi span="4 m:2 l:1">
          <NSelect
            v-model:value="selectedSubject"
            :options="subjectOptions"
            placeholder="按科目筛选"
            clearable
          />
        </NGi>
        <NGi span="4 m:2 l:1">
          <NSelect
            v-model:value="selectedStatus"
            :options="statusOptions"
            placeholder="按状态筛选"
            clearable
          />
        </NGi>
        <NGi span="4 m:2 l:1">
          <NButton type="primary" block @click="openAddModal">
            新增任务
          </NButton>
        </NGi>
      </NGrid>
    </NCard>

    <!-- 任务表格 -->
    <TaskTable
      :tasks="filteredTasks"
      @view="handleView"
      @edit="openEditModal"
      @delete="handleDelete"
    />

    <!-- 新增 / 编辑任务弹窗 -->
    <NModal
      v-model:show="modalVisible"
      preset="card"
      :title="isEditing ? '编辑任务' : '新增任务'"
      :style="{ width: '640px' }"
      :mask-closable="false"
    >
      <TaskForm
        :task="editingTask"
        :subjects="subjectFormOptions"
        @submit="handleFormSubmit"
        @cancel="modalVisible = false"
      />
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid, NGi, NCard, NInput, NSelect, NButton, NModal,
  useMessage, useDialog
} from 'naive-ui'
import { useStudyStore } from '@/stores/study'
import PageHeader from '@/components/study/PageHeader.vue'
import TaskTable from '@/components/study/TaskTable.vue'
import TaskForm from '@/components/study/TaskForm.vue'
import type { Task } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const studyStore = useStudyStore()

const searchKeyword = ref('')
const selectedSubject = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)
const modalVisible = ref(false)
const isEditing = ref(false)
const editingTask = ref<Task | undefined>(undefined)

/** 科目筛选下拉选项 */
const subjectOptions = computed(() => {
  return studyStore.subjectsList.map(s => ({
    label: s.name,
    value: s.name
  }))
})

/** 科目表单下拉选项（给 TaskForm 用） */
const subjectFormOptions = computed(() => {
  return studyStore.subjectsList.map(s => ({
    label: s.name,
    value: s.id
  }))
})

/** 状态筛选下拉选项 */
const statusOptions = [
  { label: '未开始', value: '未开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

/** 过滤后的任务列表 */
const filteredTasks = computed(() => {
  let list = [...studyStore.tasksList]

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(kw))
  }

  if (selectedSubject.value) {
    list = list.filter(t => t.subjectName === selectedSubject.value)
  }

  if (selectedStatus.value) {
    list = list.filter(t => t.status === selectedStatus.value)
  }

  return list
})

/** 打开新增弹窗 */
function openAddModal() {
  isEditing.value = false
  editingTask.value = undefined
  modalVisible.value = true
}

/** 打开编辑弹窗 */
function openEditModal(id: number) {
  const task = studyStore.getTaskById(id)
  if (task) {
    isEditing.value = true
    editingTask.value = { ...task }
    modalVisible.value = true
  }
}

/** 查看任务详情 */
function handleView(id: number) {
  router.push(`/tasks/${id}`)
}

/** 删除任务 */
function handleDelete(id: number) {
  const task = studyStore.getTaskById(id)
  dialog.warning({
    title: '确认删除',
    content: `确定要删除任务「${task?.title || ''}」吗？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await studyStore.deleteTask(id)
        message.success('任务已删除')
      } catch (error) {
        message.error(getApiErrorMessage(error, '任务删除失败'))
      }
    }
  })
}

/** 表单提交 */
async function handleFormSubmit(taskData: Partial<Task>) {
  try {
    if (isEditing.value && editingTask.value) {
      await studyStore.updateTask(editingTask.value.id, taskData)
      message.success('任务修改成功')
    } else {
      const newTask: Task = {
        id: 0,
        title: taskData.title || '',
        subjectId: Number(taskData.subjectId) || 0,
        subjectName: taskData.subjectName || '',
        type: taskData.type || '看课',
        priority: taskData.priority || '中',
        status: taskData.status || '未开始',
        deadline: taskData.deadline || '',
        estimatedMinutes: taskData.estimatedMinutes || 0,
        actualMinutes: 0,
        description: taskData.description || ''
      }
      await studyStore.addTask(newTask)
      message.success('任务添加成功')
    }

    modalVisible.value = false
  } catch (error) {
    message.error(getApiErrorMessage(error, '任务保存失败'))
  }
}
</script>

<style scoped>
.tasks-page {
  padding: 0;
}
</style>

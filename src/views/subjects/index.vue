<template>
  <div class="subjects-page">
    <PageHeader title="科目管理" subtitle="管理考研科目和学习进度" />

    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <NButton type="primary" @click="openAddModal">
        新增科目
      </NButton>
    </div>

    <!-- 科目卡片网格 -->
    <NGrid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <NGi v-for="subject in subjectsList" :key="subject.id" span="3 m:3 l:1">
        <NCard :bordered="false" class="subject-card" hoverable>
          <template #header>
            <div class="card-header">
              <span class="subject-name">{{ subject.name }}</span>
              <NTag
                :type="subject.category === '408' ? 'info' : 'warning'"
                size="small"
                round
              >
                {{ subject.category }}
              </NTag>
            </div>
          </template>

          <div class="subject-progress-section">
            <div class="progress-label">
              <span>学习进度</span>
              <span>{{ subject.progress }}%</span>
            </div>
            <NProgress
              :percentage="subject.progress"
              :color="subject.color"
              :show-indicator="false"
              :height="8"
              border-radius="4px"
            />
          </div>

          <div class="subject-hours">
            <NText depth="3">
              已学 {{ subject.finishedHours }}h / 目标 {{ subject.targetHours }}h
            </NText>
          </div>

          <div v-if="subject.description" class="subject-desc">
            <NText depth="3" :style="{ fontSize: '13px' }">
              {{ subject.description }}
            </NText>
          </div>

          <template #action>
            <NSpace>
              <NButton size="small" secondary @click="openEditModal(subject)">
                编辑
              </NButton>
              <NButton size="small" type="error" secondary @click="handleDelete(subject)">
                删除
              </NButton>
            </NSpace>
          </template>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 新增 / 编辑科目弹窗 -->
    <NModal
      v-model:show="modalVisible"
      preset="card"
      :title="isEditing ? '编辑科目' : '新增科目'"
      :style="{ width: '500px' }"
      :mask-closable="false"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="80"
      >
        <NFormItem label="科目名称" path="name">
          <NInput v-model:value="formData.name" placeholder="请输入科目名称" />
        </NFormItem>

        <NFormItem label="科目分类" path="category">
          <NSelect
            v-model:value="formData.category"
            :options="categoryOptions"
            placeholder="请选择科目分类"
          />
        </NFormItem>

        <NFormItem label="目标学时" path="targetHours">
          <NInputNumber
            v-model:value="formData.targetHours"
            :min="1"
            :max="9999"
            placeholder="请输入目标学时"
            :style="{ width: '100%' }"
          />
        </NFormItem>

        <NFormItem label="主题色" path="color">
          <NInput v-model:value="formData.color" placeholder="如 #2080f0">
            <template #prefix>
              <span
                class="color-preview"
                :style="{ backgroundColor: formData.color || '#ccc' }"
              />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem label="描述" path="description">
          <NInput
            v-model:value="formData.description"
            type="textarea"
            placeholder="请输入科目描述（选填）"
            :rows="3"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalVisible = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">
            {{ isEditing ? '保存修改' : '确认添加' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  NGrid, NGi, NCard, NButton, NTag, NProgress, NText, NSpace,
  NModal, NForm, NFormItem, NInput, NInputNumber, NSelect,
  useMessage, useDialog
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useStudyStore } from '@/stores/study'
import PageHeader from '@/components/study/PageHeader.vue'
import type { Subject } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const message = useMessage()
const dialog = useDialog()
const studyStore = useStudyStore()

const formRef = ref<FormInst | null>(null)
const modalVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

/** 科目列表 */
const subjectsList = computed(() => studyStore.subjectsList)

/** 分类选项 */
const categoryOptions = [
  { label: '408', value: '408' },
  { label: '公共课', value: '公共课' }
]

/** 表单数据 */
const formData = reactive({
  name: '',
  category: '408' as string,
  targetHours: 100 as number,
  color: '#2080f0',
  description: ''
})

/** 表单校验规则 */
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入科目名称', trigger: ['blur', 'input'] }
  ],
  category: [
    { required: true, message: '请选择科目分类', trigger: 'change' }
  ],
  targetHours: [
    { required: true, type: 'number', message: '请输入目标学时', trigger: ['blur', 'input'] }
  ]
}

/** 重置表单 */
function resetForm() {
  formData.name = ''
  formData.category = '408'
  formData.targetHours = 100
  formData.color = '#2080f0'
  formData.description = ''
  editingId.value = null
  isEditing.value = false
}

/** 打开新增弹窗 */
function openAddModal() {
  resetForm()
  modalVisible.value = true
}

/** 打开编辑弹窗 */
function openEditModal(subject: Subject) {
  isEditing.value = true
  editingId.value = subject.id
  formData.name = subject.name
  formData.category = subject.category
  formData.targetHours = subject.targetHours
  formData.color = subject.color
  formData.description = subject.description
  modalVisible.value = true
}

/** 提交表单 */
async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await studyStore.updateSubject(editingId.value, {
        name: formData.name,
        category: formData.category,
        targetHours: formData.targetHours,
        color: formData.color,
        description: formData.description,
        progress: Math.round((studyStore.subjectsList.find(s => s.id === editingId.value)?.finishedHours || 0) / formData.targetHours * 100)
      })
      message.success('科目修改成功')
    } else {
      const newSubject: Subject = {
        id: 0,
        name: formData.name,
        category: formData.category,
        progress: 0,
        targetHours: formData.targetHours,
        finishedHours: 0,
        color: formData.color,
        description: formData.description
      }
      await studyStore.addSubject(newSubject)
      message.success('科目添加成功')
    }

    modalVisible.value = false
    resetForm()
  } catch (error) {
    message.error(getApiErrorMessage(error, '科目保存失败'))
  }
}

/** 删除科目 */
function handleDelete(subject: Subject) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除科目「${subject.name}」吗？删除后不可恢复。`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await studyStore.deleteSubject(subject.id)
        message.success('科目已删除')
      } catch (error) {
        message.error(getApiErrorMessage(error, '科目删除失败'))
      }
    }
  })
}
</script>

<style scoped>
.subjects-page {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.subject-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subject-name {
  font-size: 16px;
  font-weight: 600;
}

.subject-progress-section {
  margin-bottom: 12px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.subject-hours {
  margin-bottom: 8px;
}

.subject-desc {
  margin-bottom: 8px;
}

.color-preview {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 4px;
}
</style>

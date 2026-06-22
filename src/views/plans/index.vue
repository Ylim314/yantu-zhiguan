<template>
  <div class="plans-page">
    <PageHeader title="学习计划" subtitle="合理安排每日学习计划" />

    <!-- 顶部操作栏 -->
    <NCard :bordered="false" style="margin-top: 16px">
      <NFlex justify="end">
        <NButton type="primary" @click="showAddModal = true">
          <template #icon>
            <NIcon><AddOutline /></NIcon>
          </template>
          新增计划
        </NButton>
      </NFlex>
    </NCard>

    <!-- 计划日历组件 -->
    <NCard title="日历视图" :bordered="false" style="margin-top: 16px">
      <PlanCalendar
        :plans="studyStore.plansList"
        @status-change="handleStatusChange"
        @delete="handleDeletePlan"
      />
    </NCard>

    <!-- 计划列表 -->
    <NCard title="计划列表" :bordered="false" style="margin-top: 16px">
      <NDataTable
        :columns="tableColumns"
        :data="studyStore.plansList"
        :bordered="false"
        :single-line="false"
      />
    </NCard>

    <!-- 新增计划弹窗 -->
    <NModal
      v-model:show="showAddModal"
      preset="card"
      title="新增计划"
      style="width: 600px"
      :mask-closable="false"
    >
      <NForm
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="80"
      >
        <NFormItem label="日期" path="date">
          <NDatePicker
            v-model:value="formDateTimestamp"
            type="date"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem label="标题" path="title">
          <NInput v-model:value="formData.title" placeholder="请输入计划标题" />
        </NFormItem>
        <NFormItem label="科目" path="subjectName">
          <NSelect
            v-model:value="formData.subjectName"
            placeholder="请选择科目"
            :options="subjectOptions"
          />
        </NFormItem>
        <NFormItem label="时间段" path="timeRange">
          <NInput v-model:value="formData.timeRange" placeholder="例如：08:00-10:00" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="formData.status"
            placeholder="请选择状态"
            :options="statusOptions"
          />
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput
            v-model:value="formData.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NFlex justify="end">
          <NButton @click="showAddModal = false">取消</NButton>
          <NButton type="primary" @click="handleAddPlan">确认添加</NButton>
        </NFlex>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NCard, NButton, NFlex, NIcon, NModal, NForm, NFormItem,
  NInput, NSelect, NDatePicker, NDataTable, NTag, NPopconfirm,
  useMessage, type FormInst, type FormRules, type DataTableColumns
} from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/study/PageHeader.vue'
import PlanCalendar from '@/components/study/PlanCalendar.vue'
import { useStudyStore } from '@/stores/study'
import { formatLocalDate } from '@/utils/date'
import type { Plan, PlanStatus } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const message = useMessage()
const studyStore = useStudyStore()

// 科目选项
const subjectOptions = computed(() =>
  studyStore.subjectsList.map(s => ({ label: s.name, value: s.name }))
)

// 状态选项
const statusOptions = [
  { label: '未开始', value: '未开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已取消', value: '已取消' }
]

// 状态对应的标签颜色
function getStatusType(status: string): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    '未开始': 'default',
    '进行中': 'info',
    '已完成': 'success',
    '已取消': 'warning'
  }
  return map[status] || 'default'
}

// 表格列定义
const tableColumns: DataTableColumns<Plan> = [
  { title: '日期', key: 'date', width: 120 },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '科目', key: 'subjectName', width: 130 },
  { title: '时间段', key: 'timeRange', width: 130 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(NTag, {
        type: getStatusType(row.status),
        size: 'small',
        bordered: false
      }, { default: () => row.status })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render(row) {
      return h(NFlex, { size: 8 }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleStatusChange(row.id, '已完成')
          }, { default: () => '完成' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDeletePlan(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              secondary: true
            }, { default: () => '删除' }),
            default: () => '确认删除该计划吗？'
          })
        ]
      })
    }
  }
]

// 处理状态变更
async function handleStatusChange(id: number, status: string) {
  try {
    await studyStore.updatePlan(id, { status: status as PlanStatus })
    message.success('计划状态已更新')
  } catch (error) {
    message.error(getApiErrorMessage(error, '计划状态更新失败'))
  }
}

// 处理删除
async function handleDeletePlan(id: number) {
  try {
    await studyStore.deletePlan(id)
    message.success('计划已删除')
  } catch (error) {
    message.error(getApiErrorMessage(error, '计划删除失败'))
  }
}

// 新增计划表单
const showAddModal = ref(false)
const formRef = ref<FormInst | null>(null)
const formDateTimestamp = ref<number>(Date.now())

const formData = ref({
  title: '',
  subjectName: null as string | null,
  timeRange: '',
  status: '未开始' as PlanStatus,
  remark: ''
})

const formRules: FormRules = {
  title: { required: true, message: '请输入计划标题', trigger: 'blur' },
  subjectName: { required: true, message: '请选择科目', trigger: 'change' },
  timeRange: { required: true, message: '请输入时间段', trigger: 'blur' }
}

async function handleAddPlan() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const dateStr = formatLocalDate(formDateTimestamp.value)
  const newPlan: Plan = {
    id: 0,
    date: dateStr,
    title: formData.value.title,
    subjectName: formData.value.subjectName!,
    timeRange: formData.value.timeRange,
    status: formData.value.status,
    remark: formData.value.remark
  }

  try {
    await studyStore.addPlan(newPlan)
    message.success('计划添加成功')
    showAddModal.value = false

    // 重置表单
    formData.value = {
      title: '',
      subjectName: null,
      timeRange: '',
      status: '未开始',
      remark: ''
    }
    formDateTimestamp.value = Date.now()
  } catch (error) {
    message.error(getApiErrorMessage(error, '计划添加失败'))
  }
}
</script>

<style scoped>
.plans-page {
  padding: 0;
}
</style>

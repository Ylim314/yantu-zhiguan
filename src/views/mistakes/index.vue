<template>
  <div class="mistakes-page">
    <PageHeader title="错题记录" subtitle="复盘错题，查漏补缺" />

    <!-- 筛选栏 -->
    <NCard :bordered="false" class="filter-card">
      <NFlex align="center" :wrap="true" :size="16">
        <NInput
          v-model:value="searchKeyword"
          placeholder="搜索错题标题..."
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <NIcon><SearchOutline /></NIcon>
          </template>
        </NInput>
        <NSelect
          v-model:value="selectedSubject"
          placeholder="按科目筛选"
          clearable
          :options="subjectOptions"
          style="width: 180px"
        />
        <NSelect
          v-model:value="selectedDifficulty"
          placeholder="按难度筛选"
          clearable
          :options="difficultyOptions"
          style="width: 150px"
        />
        <NButton type="primary" @click="showAddModal = true">
          <template #icon>
            <NIcon><AddOutline /></NIcon>
          </template>
          新增错题
        </NButton>
      </NFlex>
    </NCard>

    <!-- 错题卡片列表 -->
    <NGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGridItem v-for="item in filteredMistakes" :key="item.id" span="2 m:1">
        <MistakeCard :mistake="item" @click="handleCardClick" />
      </NGridItem>
    </NGrid>

    <!-- 空状态 -->
    <NEmpty
      v-if="filteredMistakes.length === 0"
      description="暂无匹配的错题记录"
      style="margin-top: 60px"
    />

    <!-- 新增错题弹窗 -->
    <NModal
      v-model:show="showAddModal"
      preset="card"
      title="新增错题"
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
        <NFormItem label="标题" path="title">
          <NInput v-model:value="formData.title" placeholder="请输入错题标题" />
        </NFormItem>
        <NFormItem label="科目" path="subjectName">
          <NSelect
            v-model:value="formData.subjectName"
            placeholder="请选择科目"
            :options="subjectOptions"
          />
        </NFormItem>
        <NFormItem label="章节" path="chapter">
          <NInput v-model:value="formData.chapter" placeholder="请输入所在章节" />
        </NFormItem>
        <NFormItem label="难度" path="difficulty">
          <NSelect
            v-model:value="formData.difficulty"
            placeholder="请选择难度"
            :options="difficultyOptions"
          />
        </NFormItem>
        <NFormItem label="错因" path="reason">
          <NInput
            v-model:value="formData.reason"
            type="textarea"
            placeholder="请输入错误原因分析"
            :rows="3"
          />
        </NFormItem>
        <NFormItem label="解法" path="solution">
          <NInput
            v-model:value="formData.solution"
            type="textarea"
            placeholder="请输入正确解法"
            :rows="3"
          />
        </NFormItem>
        <NFormItem label="标签" path="tags">
          <NInput
            v-model:value="tagsInput"
            placeholder="多个标签用逗号分隔"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NFlex justify="end">
          <NButton @click="showAddModal = false">取消</NButton>
          <NButton type="primary" @click="handleAddMistake">确认添加</NButton>
        </NFlex>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NInput, NSelect, NButton, NGrid, NGridItem,
  NModal, NForm, NFormItem, NIcon, NFlex, NEmpty,
  useMessage, type FormInst, type FormRules
} from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'
import PageHeader from '@/components/study/PageHeader.vue'
import MistakeCard from '@/components/study/MistakeCard.vue'
import { useStudyStore } from '@/stores/study'
import { getToday } from '@/utils/date'
import type { Mistake, Difficulty } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const router = useRouter()
const message = useMessage()
const studyStore = useStudyStore()

// 筛选状态
const searchKeyword = ref('')
const selectedSubject = ref<string | null>(null)
const selectedDifficulty = ref<Difficulty | null>(null)

// 科目选项
const subjectOptions = computed(() =>
  studyStore.subjectsList.map(s => ({ label: s.name, value: s.name }))
)

// 难度选项
const difficultyOptions = [
  { label: '简单', value: '简单' },
  { label: '中等', value: '中等' },
  { label: '困难', value: '困难' }
]

// 过滤后的错题列表
const filteredMistakes = computed(() => {
  return studyStore.mistakesList.filter((m: Mistake) => {
    const matchKeyword = !searchKeyword.value || m.title.includes(searchKeyword.value)
    const matchSubject = !selectedSubject.value || m.subjectName === selectedSubject.value
    const matchDifficulty = !selectedDifficulty.value || m.difficulty === selectedDifficulty.value
    return matchKeyword && matchSubject && matchDifficulty
  })
})

// 点击错题卡片，跳转详情
function handleCardClick(id: number) {
  router.push(`/mistakes/${id}`)
}

// 新增错题表单
const showAddModal = ref(false)
const formRef = ref<FormInst | null>(null)
const tagsInput = ref('')

const formData = ref({
  title: '',
  subjectName: null as string | null,
  chapter: '',
  difficulty: null as Difficulty | null,
  reason: '',
  solution: ''
})

const formRules: FormRules = {
  title: { required: true, message: '请输入错题标题', trigger: 'blur' },
  subjectName: { required: true, message: '请选择科目', trigger: 'change' },
  chapter: { required: true, message: '请输入章节', trigger: 'blur' },
  difficulty: { required: true, message: '请选择难度', trigger: 'change' },
  reason: { required: true, message: '请输入错误原因', trigger: 'blur' },
  solution: { required: true, message: '请输入正确解法', trigger: 'blur' }
}

async function handleAddMistake() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const tags = tagsInput.value
    ? tagsInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    : []

  const newMistake: Mistake = {
    id: 0,
    title: formData.value.title,
    subjectName: formData.value.subjectName!,
    chapter: formData.value.chapter,
    difficulty: formData.value.difficulty!,
    reason: formData.value.reason,
    solution: formData.value.solution,
    reviewCount: 0,
    nextReviewDate: getToday(),
    tags
  }

  try {
    await studyStore.addMistake(newMistake)
    message.success('错题添加成功')
    showAddModal.value = false

    // 重置表单
    formData.value = {
      title: '',
      subjectName: null,
      chapter: '',
      difficulty: null,
      reason: '',
      solution: ''
    }
    tagsInput.value = ''
  } catch (error) {
    message.error(getApiErrorMessage(error, '错题添加失败'))
  }
}
</script>

<style scoped>
.mistakes-page {
  padding: 0;
}
.filter-card {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .filter-card :deep(.n-input),
  .filter-card :deep(.n-select) {
    width: 100% !important;
  }
}
</style>

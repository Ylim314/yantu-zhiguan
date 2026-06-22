<template>
  <div class="mistake-detail-page">
    <PageHeader title="错题详情" subtitle="查看错题信息与复盘记录" />

    <!-- 错题不存在 -->
    <NResult
      v-if="!mistake"
      status="warning"
      title="错题不存在"
      description="未找到对应的错题记录，可能已被删除"
      style="margin-top: 60px"
    >
      <template #footer>
        <NButton type="primary" @click="router.back()">返回上一页</NButton>
      </template>
    </NResult>

    <!-- 错题详情 -->
    <NCard v-else :title="mistake.title" :bordered="false" style="margin-top: 16px">
      <template #header-extra>
        <NFlex :size="12">
          <NButton @click="router.back()">返回</NButton>
          <NButton type="success" @click="handleIncrementReview">
            增加复盘次数
          </NButton>
        </NFlex>
      </template>

      <NDescriptions :column="2" label-placement="left" bordered>
        <NDescriptionsItem label="标题">
          {{ mistake.title }}
        </NDescriptionsItem>
        <NDescriptionsItem label="科目">
          {{ mistake.subjectName }}
        </NDescriptionsItem>
        <NDescriptionsItem label="章节">
          {{ mistake.chapter }}
        </NDescriptionsItem>
        <NDescriptionsItem label="难度">
          <NTag
            :type="difficultyType"
            :bordered="false"
            size="small"
          >
            {{ mistake.difficulty }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="错误原因" :span="2">
          {{ mistake.reason }}
        </NDescriptionsItem>
        <NDescriptionsItem label="正确解法" :span="2">
          {{ mistake.solution }}
        </NDescriptionsItem>
        <NDescriptionsItem label="复盘次数">
          <NTag type="info" :bordered="false" size="small">
            {{ mistake.reviewCount }} 次
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="下次复盘日期">
          {{ mistake.nextReviewDate }}
        </NDescriptionsItem>
        <NDescriptionsItem label="标签" :span="2">
          <NFlex :size="8" :wrap="true">
            <NTag
              v-for="tag in mistake.tags"
              :key="tag"
              type="primary"
              :bordered="false"
              size="small"
              round
            >
              {{ tag }}
            </NTag>
            <span v-if="mistake.tags.length === 0" style="color: #999">暂无标签</span>
          </NFlex>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard, NDescriptions, NDescriptionsItem, NTag, NButton,
  NResult, NFlex, useMessage
} from 'naive-ui'
import PageHeader from '@/components/study/PageHeader.vue'
import { useStudyStore } from '@/stores/study'
import { getApiErrorMessage } from '@/api/http'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const studyStore = useStudyStore()

// 从路由参数获取错题 ID
const mistakeId = computed(() => Number(route.params.id))
const mistake = computed(() => studyStore.getMistakeById(mistakeId.value))

// 难度对应标签颜色
const difficultyType = computed(() => {
  const map: Record<string, 'success' | 'warning' | 'error'> = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'error'
  }
  return mistake.value ? map[mistake.value.difficulty] || 'info' : 'info'
})

// 增加复盘次数
async function handleIncrementReview() {
  try {
    await studyStore.incrementReviewCount(mistakeId.value)
    message.success('复盘次数 +1，继续保持！')
  } catch (error) {
    message.error(getApiErrorMessage(error, '复盘次数更新失败'))
  }
}
</script>

<style scoped>
.mistake-detail-page {
  padding: 0;
}
</style>

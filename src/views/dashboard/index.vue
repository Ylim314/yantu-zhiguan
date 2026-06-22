<template>
  <div class="dashboard-page">
    <!-- 顶部欢迎横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="hero-greeting">欢迎回来，</span>
            <span class="hero-name">考研人</span>
          </h1>
          <p class="hero-subtitle">{{ heroMotto }}</p>
        </div>
        <div class="countdown-card">
          <div class="countdown-label">备考演示倒计时</div>
          <div class="countdown-value">
            <span class="countdown-number">{{ daysRemaining }}</span>
            <span class="countdown-unit">天</span>
          </div>
          <div class="countdown-date">演示目标：2027年12月26日（可配置）</div>
        </div>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <NGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGi span="4 m:2 l:1">
        <div class="stat-card-wrap" style="--card-color: #2080f0;">
          <StudyStatCard
            title="今日任务"
            :value="studyStore.todayTasks.length"
            icon="📋"
            color="#2080f0"
          />
        </div>
      </NGi>
      <NGi span="4 m:2 l:1">
        <div class="stat-card-wrap" style="--card-color: #18a058;">
          <StudyStatCard
            title="已完成"
            :value="studyStore.completedTaskCount"
            icon="✅"
            color="#18a058"
            suffix="项"
          />
        </div>
      </NGi>
      <NGi span="4 m:2 l:1">
        <div class="stat-card-wrap" style="--card-color: #f0a020;">
          <StudyStatCard
            title="学习时长"
            :value="studyStore.totalStudyHours"
            icon="⏰"
            color="#f0a020"
            suffix="h"
          />
        </div>
      </NGi>
      <NGi span="4 m:2 l:1">
        <div class="stat-card-wrap" style="--card-color: #d03050;">
          <StudyStatCard
            title="总体进度"
            :value="studyStore.overallProgress"
            icon="🎯"
            color="#d03050"
            suffix="%"
          />
        </div>
      </NGi>
    </NGrid>

    <!-- 科目进度 + 任务完成率 -->
    <NGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGi span="2 l:1">
        <NCard title="408 四科进度" :bordered="false" class="dashboard-card progress-card">
          <NSpace vertical :size="16">
            <SubjectProgress
              v-for="subject in studyStore.subjects408"
              :key="subject.id"
              :name="subject.name"
              :target-hours="subject.targetHours"
              :finished-hours="subject.finishedHours"
              :color="subject.color"
              :progress="subject.progress"
            />
          </NSpace>
        </NCard>
      </NGi>
      <NGi span="2 l:1">
        <NCard title="任务完成率" :bordered="false" class="dashboard-card">
          <div class="progress-circle-wrap">
            <NProgress
              type="circle"
              :percentage="studyStore.taskCompletionRate"
              :stroke-width="10"
              :color="progressColor"
              :rail-color="'#e8e8e8'"
              :style="{ width: '160px', height: '160px' }"
            />
            <div class="progress-text">
              <span class="progress-count">{{ studyStore.completedTaskCount }}</span>
              <span class="progress-sep"> / {{ studyStore.totalTaskCount }} 项</span>
            </div>
            <div class="progress-label">
              <NTag :type="completionTagType" size="small" round>
                {{ completionLabel }}
              </NTag>
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 今日待办 + 错题复盘提醒 -->
    <NGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGi span="2 l:1">
        <NCard title="今日待办" :bordered="false" class="dashboard-card">
          <NList v-if="studyStore.todayTasks.length" hoverable clickable>
            <NListItem v-for="task in studyStore.todayTasks" :key="task.id">
              <div class="todo-item">
                <div class="todo-info">
                  <span class="todo-title">{{ task.title }}</span>
                  <NTag :type="statusTagType(task.status)" size="small" :bordered="false">
                    {{ task.status }}
                  </NTag>
                </div>
                <NButton
                  v-if="task.status !== '已完成'"
                  type="primary"
                  size="small"
                  secondary
                  @click="handleMarkComplete(task.id)"
                >
                  完成
                </NButton>
              </div>
            </NListItem>
          </NList>
          <NEmpty v-else description="今日暂无待办任务" />
        </NCard>
      </NGi>
      <NGi span="2 l:1">
        <NCard title="错题复盘提醒" :bordered="false" class="dashboard-card">
          <NList v-if="studyStore.recentMistakes.length" hoverable clickable>
            <NListItem v-for="mistake in studyStore.recentMistakes" :key="mistake.id">
              <div class="mistake-item">
                <div class="mistake-info">
                  <NTag :type="difficultyTagType(mistake.difficulty)" size="small">
                    {{ mistake.difficulty }}
                  </NTag>
                  <span class="mistake-subject">{{ mistake.subjectName }}</span>
                  <span class="mistake-title-text">{{ mistake.title }}</span>
                </div>
                <NButton
                  type="info"
                  size="small"
                  text
                  @click="router.push(`/mistakes/${mistake.id}`)"
                >
                  查看
                </NButton>
              </div>
            </NListItem>
          </NList>
          <NEmpty v-else description="暂无错题记录" />
        </NCard>
      </NGi>
    </NGrid>

    <!-- 薄弱科目 + 学习建议 -->
    <NGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGi span="2 l:1">
        <NCard title="薄弱科目提醒" :bordered="false" class="dashboard-card">
          <NSpace v-if="weakSubjects.length" :size="12" wrap>
            <NTag
              v-for="item in weakSubjects"
              :key="item.subject.id"
              :type="item.level === 'danger' ? 'error' : 'warning'"
              round
              size="large"
              class="weak-tag"
            >
              {{ item.subject.name }}
              <template #avatar>
                <span>{{ item.level === 'danger' ? '🔴' : '🟡' }}</span>
              </template>
            </NTag>
          </NSpace>
          <div v-if="weakSubjects.length" class="weak-suggestions">
            <NText depth="3">
              建议：以上科目学习进度偏低，建议优先安排复习时间，加强薄弱环节的练习。
            </NText>
          </div>
          <NEmpty v-else description="所有科目进度均衡，继续保持！" />
        </NCard>
      </NGi>
      <NGi span="2 l:1">
        <NCard title="💡 学习建议" :bordered="false" class="dashboard-card suggestion-card">
          <NSpace vertical :size="12">
            <div
              v-for="(suggestion, index) in learningSuggestions"
              :key="index"
              class="suggestion-item"
            >
              <div class="suggestion-icon">{{ suggestion.icon }}</div>
              <div class="suggestion-content">
                <div class="suggestion-title">{{ suggestion.title }}</div>
                <div class="suggestion-desc">{{ suggestion.desc }}</div>
              </div>
            </div>
          </NSpace>
        </NCard>
      </NGi>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid, NGi, NCard, NProgress, NSpace, NTag, NButton,
  NList, NListItem, NEmpty, NText, useMessage
} from 'naive-ui'
import { useStudyStore } from '@/stores/study'
import StudyStatCard from '@/components/study/StudyStatCard.vue'
import SubjectProgress from '@/components/study/SubjectProgress.vue'
import type { TaskStatus, Difficulty } from '@/types'
import { getApiErrorMessage } from '@/api/http'

const router = useRouter()
const message = useMessage()
const studyStore = useStudyStore()

/** 演示倒计时：目标日期可按实际考试安排调整 */
const daysRemaining = computed(() => {
  const examDate = new Date('2027-12-26')
  const now = new Date()
  const diff = examDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

/** 顶部欢迎语 */
const heroMotto = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息，养精蓄锐明日再战'
  if (hour < 9) return '一日之计在于晨，今天也要元气满满'
  if (hour < 12) return '上午是高效学习的黄金时间，加油'
  if (hour < 14) return '午休片刻，下午继续保持学习状态'
  if (hour < 18) return '下午时光，稳扎稳打完成今日目标'
  if (hour < 22) return '晚间是复盘的好时间，记得回顾今日所学'
  return '夜深了，注意休息，养精蓄锐明日再战'
})

/** 进度环颜色 */
const progressColor = computed(() => {
  const rate = studyStore.taskCompletionRate
  if (rate >= 80) return '#18a058'
  if (rate >= 50) return '#f0a020'
  return '#d03050'
})

/** 完成率标签类型 */
const completionTagType = computed(() => {
  const rate = studyStore.taskCompletionRate
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'error'
})

/** 完成率标签文本 */
const completionLabel = computed(() => {
  const rate = studyStore.taskCompletionRate
  if (rate >= 80) return '优秀'
  if (rate >= 50) return '良好'
  if (rate > 0) return '加油'
  return '未开始'
})

/** 薄弱科目：进度最低的科目 */
const weakSubjects = computed(() => {
  const sorted = [...studyStore.subjectsList]
    .filter(s => s.targetHours > 0)
    .sort((a, b) => (a.finishedHours / a.targetHours) - (b.finishedHours / b.targetHours))

  return sorted.slice(0, 4).map(s => {
    const rate = s.finishedHours / s.targetHours
    return {
      subject: s,
      level: rate < 0.2 ? 'danger' : 'warning'
    }
  })
})

/** 学习建议 */
const learningSuggestions = computed(() => {
  const suggestions = []

  const totalRate = studyStore.overallProgress
  const taskRate = studyStore.taskCompletionRate

  if (taskRate < 30) {
    suggestions.push({
      icon: '🚀',
      title: '开始行动',
      desc: '当前任务完成率较低，建议从最简单的任务开始，逐步建立成就感。'
    })
  }

  if (totalRate < 30) {
    suggestions.push({
      icon: '📚',
      title: '打好基础',
      desc: '整体学习进度处于早期阶段，建议先夯实基础概念，再进入刷题阶段。'
    })
  }

  if (studyStore.todayTasks.length === 0) {
    suggestions.push({
      icon: '📝',
      title: '规划任务',
      desc: '今日暂无待办任务，建议前往"学习任务"页面添加新的学习目标。'
    })
  }

  if (studyStore.recentMistakes.length > 3) {
    suggestions.push({
      icon: '🔍',
      title: '错题复盘',
      desc: `您有 ${studyStore.recentMistakes.length} 道错题待复盘，建议优先复习高频易错知识点。`
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      icon: '✨',
      title: '保持节奏',
      desc: '当前学习状态良好，继续保持稳定的复习节奏，定期回顾错题。'
    })
  }

  return suggestions
})

/** 任务状态对应标签类型 */
function statusTagType(status: TaskStatus) {
  const map: Record<TaskStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    '未开始': 'default',
    '进行中': 'info',
    '已完成': 'success',
    '已延期': 'error'
  }
  return map[status] || 'default'
}

/** 错题难度对应标签类型 */
function difficultyTagType(difficulty: Difficulty) {
  const map: Record<Difficulty, 'success' | 'warning' | 'error'> = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'error'
  }
  return map[difficulty] || 'default'
}

/** 标记任务完成，等待后端确认后再更新成功提示。 */
async function handleMarkComplete(taskId: number) {
  try {
    await studyStore.updateTaskStatus(taskId, '已完成')
    message.success('已标记为完成')
  } catch (error) {
    message.error(getApiErrorMessage(error, '任务状态更新失败'))
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

/* 顶部欢迎横幅 */
.hero-banner {
  background: linear-gradient(135deg, #2080f0 0%, #4098fc 50%, #1060c9 100%);
  border-radius: 12px;
  padding: 24px 32px;
  color: #fff;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.hero-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.hero-greeting {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.95;
}

.hero-name {
  font-size: 26px;
  font-weight: 700;
}

.hero-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  opacity: 0.85;
}

/* 倒计时卡片 */
.countdown-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 24px;
  text-align: center;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.countdown-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.countdown-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.countdown-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.countdown-unit {
  font-size: 14px;
  opacity: 0.9;
}

.countdown-date {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 4px;
}

/* 统计卡片 */
.stat-card-wrap {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card-wrap:hover {
  transform: translateY(-2px);
}

/* 仪表盘卡片 */
.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 进度圆环 */
.progress-circle-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.progress-text {
  margin-top: 12px;
  text-align: center;
}

.progress-count {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.progress-sep {
  font-size: 14px;
  color: #999;
}

.progress-label {
  margin-top: 8px;
}

/* 待办事项 */
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.todo-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-title {
  font-size: 14px;
}

/* 错题 */
.mistake-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mistake-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mistake-subject {
  font-size: 12px;
  color: #999;
}

.mistake-title-text {
  font-size: 14px;
}

/* 薄弱科目 */
.weak-suggestions {
  margin-top: 12px;
}

.weak-tag {
  transition: all 0.3s ease;
}

.weak-tag:hover {
  transform: scale(1.05);
}

/* 学习建议卡片 */
.suggestion-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border-left: 3px solid #2080f0;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
  line-height: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.suggestion-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
</style>

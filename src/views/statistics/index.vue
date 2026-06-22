<template>
  <div class="statistics-page">
    <PageHeader title="数据统计" subtitle="全面掌握学习数据，科学分析备考进度" />

    <!-- 顶部概览卡片 -->
    <NGrid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <NGi span="4 m:2 l:1" v-for="(card, index) in overviewCards" :key="index">
        <div class="overview-card" :style="{ borderTop: `3px solid ${card.color}` }">
          <div class="overview-icon" :style="{ backgroundColor: card.color + '15', color: card.color }">
            {{ card.icon }}
          </div>
          <div class="overview-info">
            <div class="overview-value">{{ card.value }}</div>
            <div class="overview-label">{{ card.label }}</div>
          </div>
        </div>
      </NGi>
    </NGrid>

    <!-- 图表区域 -->
    <NGrid :cols="2" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <!-- 各科目学习进度 -->
      <NGi span="2 l:1">
        <NCard title="各科目学习进度" :bordered="false" class="chart-card">
          <template #header-extra>
            <NText depth="3" style="font-size: 12px;">按已完成进度排序</NText>
          </template>
          <VChart :option="subjectProgressOption" autoresize style="height: 360px" />
        </NCard>
      </NGi>

      <!-- 任务完成状态统计 -->
      <NGi span="2 l:1">
        <NCard title="任务完成状态统计" :bordered="false" class="chart-card">
          <template #header-extra>
            <NText depth="3" style="font-size: 12px;">实时统计各状态任务数量</NText>
          </template>
          <VChart :option="taskStatusOption" autoresize style="height: 360px" />
        </NCard>
      </NGi>

      <!-- 错题难度分布 -->
      <NGi span="2 l:1">
        <NCard title="错题难度分布" :bordered="false" class="chart-card">
          <template #header-extra>
            <NText depth="3" style="font-size: 12px;">按难度等级统计错题数量</NText>
          </template>
          <VChart :option="mistakeDifficultyOption" autoresize style="height: 360px" />
        </NCard>
      </NGi>

      <!-- 学习时长统计 -->
      <NGi span="2 l:1">
        <NCard title="学习时长统计" :bordered="false" class="chart-card">
          <template #header-extra>
            <NText depth="3" style="font-size: 12px;">各科目累计学习时长（小时）</NText>
          </template>
          <VChart :option="studyHoursOption" autoresize style="height: 360px" />
        </NCard>
      </NGi>
    </NGrid>

    <!-- 数据说明 -->
    <NCard title="📊 数据说明" :bordered="false" class="chart-card" style="margin-top: 16px">
      <NGrid :cols="4" :x-gap="16" :y-gap="12" responsive="screen" item-responsive>
        <NGi span="4 m:2 l:1">
          <div class="data-desc-item">
            <div class="data-desc-title">学习进度</div>
            <div class="data-desc-text">
              各科目已完成学时占目标学时的百分比，直观展示各科目的复习完成度。
            </div>
          </div>
        </NGi>
        <NGi span="4 m:2 l:1">
          <div class="data-desc-item">
            <div class="data-desc-title">任务状态</div>
            <div class="data-desc-text">
              所有任务按未开始、进行中、已完成、已延期四种状态分组统计。
            </div>
          </div>
        </NGi>
        <NGi span="4 m:2 l:1">
          <div class="data-desc-item">
            <div class="data-desc-title">错题难度</div>
            <div class="data-desc-text">
              按简单、中等、困难三个难度等级统计错题数量分布情况。
            </div>
          </div>
        </NGi>
        <NGi span="4 m:2 l:1">
          <div class="data-desc-item">
            <div class="data-desc-title">学习时长</div>
            <div class="data-desc-text">
              各科目累计投入的实际学习时长，帮助合理分配各科复习时间。
            </div>
          </div>
        </NGi>
      </NGrid>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NGrid, NGi, NText } from 'naive-ui'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import PageHeader from '@/components/study/PageHeader.vue'
import { useStudyStore } from '@/stores/study'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const studyStore = useStudyStore()

// 概览卡片数据
const overviewCards = computed(() => [
  {
    icon: '📊',
    label: '总科目数',
    value: studyStore.subjectsList.length,
    color: '#2080f0'
  },
  {
    icon: '✅',
    label: '已完成任务',
    value: studyStore.completedTaskCount,
    color: '#18a058'
  },
  {
    icon: '❌',
    label: '错题总数',
    value: studyStore.mistakesList.length,
    color: '#f0a020'
  },
  {
    icon: '⏱️',
    label: '总学习时长',
    value: studyStore.totalStudyHours + 'h',
    color: '#d03050'
  }
])

// 1. 各科目学习进度 - 柱状图
const subjectProgressOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#e8e8e8',
    textStyle: { color: '#333' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: studyStore.subjectsList.map(s => s.name),
    axisLabel: {
      interval: 0,
      rotate: 30,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [
    {
      name: '学习进度',
      type: 'bar',
      data: studyStore.subjectsList.map(s => ({
        value: s.progress,
        itemStyle: { color: s.color }
      })),
      barMaxWidth: 40,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%'
      }
    }
  ]
}))

// 2. 任务完成状态统计 - 饼图
const taskStatusOption = computed(() => {
  const statusMap: Record<string, number> = {}
  studyStore.tasksList.forEach(t => {
    statusMap[t.status] = (statusMap[t.status] || 0) + 1
  })

  const colorMap: Record<string, string> = {
    '未开始': '#909399',
    '进行中': '#409EFF',
    '已完成': '#67C23A',
    '已延期': '#F56C6C'
  }

  const data = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
    itemStyle: { color: colorMap[name] || '#909399' }
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333' }
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        data
      }
    ]
  }
})

// 3. 错题难度分布 - 饼图
const mistakeDifficultyOption = computed(() => {
  const diffMap: Record<string, number> = { '简单': 0, '中等': 0, '困难': 0 }
  studyStore.mistakesList.forEach(m => {
    diffMap[m.difficulty] = (diffMap[m.difficulty] || 0) + 1
  })

  const colorMap: Record<string, string> = {
    '简单': '#67C23A',
    '中等': '#E6A23C',
    '困难': '#F56C6C'
  }

  const data = Object.entries(diffMap)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: colorMap[name] }
    }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333' }
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: '难度分布',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}题'
        },
        data
      }
    ]
  }
})

// 4. 学习时长统计 - 柱状图
const studyHoursOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} 小时',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#e8e8e8',
    textStyle: { color: '#333' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: studyStore.subjectsList.map(s => s.name),
    axisLabel: {
      interval: 0,
      rotate: 30,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}h'
    }
  },
  series: [
    {
      name: '已完成时长',
      type: 'bar',
      data: studyStore.subjectsList.map(s => ({
        value: s.finishedHours,
        itemStyle: { color: s.color }
      })),
      barMaxWidth: 40,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}h'
      }
    }
  ]
}))
</script>

<style scoped>
.statistics-page {
  padding: 0;
}

/* 概览卡片 */
.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.overview-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.overview-info {
  flex: 1;
}

.overview-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.overview-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

/* 图表卡片 */
.chart-card {
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 数据说明 */
.data-desc-item {
  padding: 12px;
  border-left: 3px solid #2080f0;
  background: #f8fafc;
  border-radius: 0 8px 8px 0;
  height: 100%;
}

.data-desc-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.data-desc-text {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}
</style>

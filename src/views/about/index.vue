<template>
  <div class="about-page">
    <PageHeader title="项目说明" subtitle="研途智管 — 基于 Vue3 的考研学习任务管理系统" />

    <!-- 项目背景 -->
    <NCard :bordered="false" class="about-card intro-card">
      <div class="intro-header">
        <div class="intro-icon">🎓</div>
        <div class="intro-content">
          <h3 class="intro-title">项目背景</h3>
          <p class="intro-desc">
            "研途智管"是一款专为考研学生打造的学习管理系统，基于 Vue 3 生态构建。
            系统围绕考研备考过程中的核心需求展开，涵盖科目管理、任务规划、错题复盘、
            学习计划、数据统计等功能模块，帮助考生科学安排复习节奏，精准定位薄弱环节，
            提升备考效率。项目采用 Vue 3 + Express 前后端分离架构，通过 Axios 调用 REST API，
            使用 JWT 完成身份认证，并将多用户学习数据持久化存储到 SQLite 数据库。
          </p>
        </div>
      </div>
    </NCard>

    <!-- 技术栈 -->
    <NCard title="🛠️ 技术栈" :bordered="false" class="about-card">
      <NGrid :cols="4" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
        <NGridItem v-for="tech in techStack" :key="tech.name" span="4 s:2 l:1">
          <div class="tech-item" :style="{ borderLeft: `3px solid ${tech.color}` }">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-desc">{{ tech.desc }}</span>
          </div>
        </NGridItem>
      </NGrid>
    </NCard>

    <!-- 功能模块 -->
    <NCard title="📋 功能模块" :bordered="false" class="about-card">
      <NList bordered>
        <NListItem v-for="page in pages" :key="page.name">
          <NFlex align="center" :size="12">
            <NTag type="info" :bordered="false" size="small">{{ page.route }}</NTag>
            <NText strong>{{ page.name }}</NText>
            <NText depth="3">- {{ page.desc }}</NText>
          </NFlex>
        </NListItem>
      </NList>
    </NCard>

    <!-- 课程知识点覆盖 -->
    <NCard title="📚 课程知识点覆盖" :bordered="false" class="about-card">
      <NDataTable
        :columns="knowledgeColumns"
        :data="knowledgeData"
        :bordered="false"
        :single-line="false"
        size="small"
      />
    </NCard>

    <!-- 项目创新点 -->
    <NCard title="💡 项目创新点" :bordered="false" class="about-card">
      <NGrid :cols="3" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
        <NGridItem v-for="item in innovations" :key="item.title" span="3 m:1">
          <div class="innovation-card">
            <div class="innovation-icon">{{ item.icon }}</div>
            <div class="innovation-title">{{ item.title }}</div>
            <div class="innovation-desc">{{ item.desc }}</div>
          </div>
        </NGridItem>
      </NGrid>
    </NCard>

    <!-- 答辩展示要点 -->
    <NCard title="🎯 答辩展示要点" :bordered="false" class="about-card">
      <NGrid :cols="2" :x-gap="16" :y-gap="12" responsive="screen" item-responsive>
        <NGridItem span="2 m:1">
          <div class="highlight-item">
            <div class="highlight-label">考研主题深度定制</div>
            <div class="highlight-text">
              系统所有功能围绕考研备考场景设计，涵盖 408 专业课、数学二、英语二、政治等科目管理，
              区别于通用任务管理工具。
            </div>
          </div>
        </NGridItem>
        <NGridItem span="2 m:1">
          <div class="highlight-item">
            <div class="highlight-label">完整 Vue3 技术栈实践</div>
            <div class="highlight-text">
              全面使用 Vue3 Composition API、Pinia 状态管理、Vue Router 路由、TypeScript 类型约束，
              体现现代化前端工程能力。
            </div>
          </div>
        </NGridItem>
        <NGridItem span="2 m:1">
          <div class="highlight-item">
            <div class="highlight-label">组件化与复用设计</div>
            <div class="highlight-text">
              页面拆分为 8 个可复用组件，通过 props/emit 实现父子通信，
              体现模块化开发思想。
            </div>
          </div>
        </NGridItem>
        <NGridItem span="2 m:1">
          <div class="highlight-item">
            <div class="highlight-label">数据可视化展示</div>
            <div class="highlight-text">
              使用 ECharts 图表库实现学习进度、任务状态、错题分布、学习时长等数据的直观可视化，
              提升数据分析体验。
            </div>
          </div>
        </NGridItem>
      </NGrid>
    </NCard>

    <!-- 开源参考 -->
    <NCard title="📖 开源参考" :bordered="false" class="about-card" style="margin-bottom: 16px">
      <NP>
        本项目在布局设计和工程化实践方面参考了
        <NText type="info" strong>Vue Naive Admin</NText>
        开源项目，借鉴了其基于 Naive UI 的后台管理系统架构方案、
        路由配置模式以及组件封装思路，在此基础上结合考研主题进行了深度定制与功能扩展。
      </NP>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import {
  NCard, NGrid, NGridItem, NTag, NList, NListItem,
  NFlex, NText, NP, NDataTable, type DataTableColumns
} from 'naive-ui'
import PageHeader from '@/components/study/PageHeader.vue'

// 技术栈列表
const techStack = [
  { name: 'Vue 3', desc: '核心框架', color: '#42b883' },
  { name: 'Vite', desc: '构建工具', color: '#646cff' },
  { name: 'TypeScript', desc: '类型安全', color: '#3178c6' },
  { name: 'Vue Router', desc: '路由管理', color: '#42b883' },
  { name: 'Pinia', desc: '状态管理', color: '#ffd859' },
  { name: 'Naive UI', desc: 'UI 组件库', color: '#18a058' },
  { name: 'ECharts', desc: '数据可视化', color: '#5470c6' },
  { name: 'Axios', desc: 'HTTP 数据传输', color: '#5a29e4' },
  { name: 'Express', desc: 'REST 后端服务', color: '#333' },
  { name: 'SQLite', desc: '数据持久化', color: '#0f80cc' },
  { name: 'JWT', desc: '用户身份认证', color: '#d03050' }
]

// 功能模块页面列表
const pages = [
  { route: '/dashboard', name: '首页仪表盘', desc: '展示学习概览、今日任务、进度统计等核心数据' },
  { route: '/subjects', name: '科目管理', desc: '管理考研各科目信息，查看学习进度与时长' },
  { route: '/tasks', name: '学习任务', desc: '创建与管理学习任务，支持状态流转与优先级设置' },
  { route: '/tasks/:id', name: '任务详情', desc: '查看单个任务的完整信息，支持状态更新' },
  { route: '/mistakes', name: '错题记录', desc: '记录与筛选错题，支持按科目和难度检索' },
  { route: '/mistakes/:id', name: '错题详情', desc: '查看错题详情，记录复盘次数' },
  { route: '/plans', name: '学习计划', desc: '制定每日学习计划，日历视图与列表视图结合' },
  { route: '/statistics', name: '数据统计', desc: '使用ECharts可视化展示学习数据' },
  { route: '/profile', name: '个人中心', desc: '管理个人信息、考研目标与座右铭' },
  { route: '/login', name: '登录页', desc: '用户登录与身份验证' },
  { route: '/about', name: '项目说明', desc: '项目背景、技术栈与课程知识点说明' }
]

// 课程知识点表格列定义
const knowledgeColumns: DataTableColumns = [
  { title: '知识点', key: 'knowledge', width: 200 },
  { title: '项目体现', key: 'detail', ellipsis: { tooltip: true } },
  { title: '对应文件', key: 'file', width: 260 }
]

// 课程知识点数据
const knowledgeData = [
  {
    knowledge: 'Vue3 Composition API',
    detail: '所有页面均使用 <script setup lang="ts"> 与 setup 语法糖，通过 ref、computed、watch 等实现响应式逻辑',
    file: 'src/views/**/*.vue'
  },
  {
    knowledge: '组件化开发',
    detail: '将页面拆分为独立组件（PageHeader、MistakeCard、PlanCalendar），各页面按需引用',
    file: 'src/components/study/'
  },
  {
    knowledge: '组件复用',
    detail: 'PageHeader 在多个业务页面复用，TaskForm 同时服务于任务新增与编辑场景',
    file: 'src/components/study/PageHeader.vue, src/components/study/TaskForm.vue'
  },
  {
    knowledge: 'props 父传子',
    detail: '父组件通过 props 向子组件传递数据，如 MistakeCard 接收 mistake 属性、PlanCalendar 接收 plans 数组',
    file: 'src/views/mistakes/index.vue'
  },
  {
    knowledge: 'emit 子传父',
    detail: '子组件通过 defineEmits 通知父组件，如 TaskForm 的 submit/cancel、MistakeCard 的 click、PlanCalendar 的状态与删除事件',
    file: 'src/components/study/TaskForm.vue, src/components/study/PlanCalendar.vue'
  },
  {
    knowledge: 'Pinia 状态管理',
    detail: '使用 defineStore 创建 study 和 user 两个 store，通过 Axios 调用后端 API 并同步响应式状态',
    file: 'src/stores/study.ts, src/stores/user.ts'
  },
  {
    knowledge: '前后端数据传输',
    detail: 'Axios 请求拦截器自动携带 JWT，响应拦截器统一处理登录失效，REST API 完成全部 CRUD',
    file: 'src/api/, server/routes.js'
  },
  {
    knowledge: 'Vue Router 前端路由',
    detail: '配置嵌套路由实现侧边栏布局，使用路由守卫实现登录鉴权拦截',
    file: 'src/router/index.ts'
  },
  {
    knowledge: '动态路由',
    detail: '任务详情和错题详情使用 /tasks/:id 与 /mistakes/:id 动态路由，通过 route.params.id 获取参数',
    file: 'src/views/tasks/detail.vue, src/views/mistakes/detail.vue'
  },
  {
    knowledge: '表单绑定',
    detail: '使用 v-model 双向绑定实现表单输入，包括 NInput、NSelect、NDatePicker、NInputNumber 等',
    file: 'src/views/plans/index.vue, src/views/profile/index.vue'
  },
  {
    knowledge: '事件处理',
    detail: '通过 @click、@submit 等事件绑定处理用户交互，如新增错题、保存个人信息、状态变更等操作',
    file: 'src/views/mistakes/index.vue, src/views/profile/index.vue'
  },
  {
    knowledge: '列表渲染',
    detail: '使用 v-for 渲染错题卡片列表、计划列表、知识点表格等，配合 :key 保证渲染性能',
    file: 'src/views/mistakes/index.vue, src/views/plans/index.vue'
  },
  {
    knowledge: '条件渲染',
    detail: '使用 v-if/v-else 实现条件展示，如错题详情的不存在提示、空列表状态、头像占位等',
    file: 'src/views/mistakes/detail.vue, src/views/profile/index.vue'
  },
  {
    knowledge: '响应式页面',
    detail: '利用 NGrid 栅格系统与 NFlex 弹性布局，实现不同屏幕尺寸下的自适应排列',
    file: 'src/views/statistics/index.vue, src/views/profile/index.vue'
  },
  {
    knowledge: '过渡动画',
    detail: '利用 Vue 的 Transition 组件与 Naive UI 内置动画效果，为路由切换和弹窗提供平滑过渡',
    file: 'src/App.vue, src/components/layout/'
  },
  {
    knowledge: '工程化构建',
    detail: '使用 Vite 构建工具，配置路径别名 (@/)、TypeScript 类型检查与路由懒加载',
    file: 'vite.config.ts, tsconfig.json'
  }
]

// 项目创新点
const innovations = [
  { icon: '🎯', title: '考研主题深度定制', desc: '所有功能围绕考研备考设计，涵盖408、数学二、英语二、政治等科目' },
  { icon: '⏰', title: '备考倒计时实时计算', desc: '首页根据可配置的演示目标日期计算剩余天数' },
  { icon: '📊', title: '408科目进度追踪', desc: '专项展示数据结构、计组、操作系统、网络四门专业课进度' },
  { icon: '🔍', title: '错题复盘提醒机制', desc: '自动按复习日期排序，提醒考生及时复盘薄弱知识点' },
  { icon: '📈', title: 'ECharts数据统计', desc: '柱状图与饼图可视化展示学习进度、任务状态、错题分布' },
  { icon: '🔐', title: 'JWT多用户体系', desc: '支持真实注册登录、密码加密、用户数据隔离与SQLite持久化' }
]
</script>

<style scoped>
.about-page {
  padding: 0;
  padding-bottom: 32px;
}

/* 卡片基础样式 */
.about-card {
  margin-top: 16px;
  transition: all 0.3s ease;
}

.about-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 项目背景卡片 */
.intro-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.intro-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.intro-icon {
  font-size: 40px;
  flex-shrink: 0;
  line-height: 1;
}

.intro-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.intro-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

/* 技术栈 */
.tech-item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.tech-item:hover {
  background: #f1f5f9;
  transform: translateX(2px);
}

.tech-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.tech-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 创新点卡片 */
.innovation-card {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
}

.innovation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.innovation-icon {
  font-size: 32px;
  margin-bottom: 8px;
  line-height: 1;
}

.innovation-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.innovation-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

/* 答辩展示要点 */
.highlight-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #2080f0;
  height: 100%;
}

.highlight-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.highlight-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>

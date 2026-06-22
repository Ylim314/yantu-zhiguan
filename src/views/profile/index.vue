<template>
  <div class="profile-page">
    <PageHeader title="个人中心" subtitle="管理个人信息和考研目标" />

    <NGrid :cols="24" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-top: 16px">
      <!-- 左侧：头像与统计 -->
      <NGridItem span="24 m:8">
        <NCard :bordered="false">
          <NFlex vertical align="center" :size="20">
            <!-- 头像区域 -->
            <div class="avatar-wrapper">
              <NAvatar
                v-if="userStore.userInfo.avatar"
                :size="100"
                :src="userStore.userInfo.avatar"
                round
              />
              <NAvatar
                v-else
                :size="100"
                round
                :style="{ backgroundColor: '#409EFF', fontSize: '40px', color: '#fff' }"
              >
                {{ userStore.userInfo.name.charAt(0).toUpperCase() }}
              </NAvatar>
            </div>
            <NText strong style="font-size: 18px">
              {{ userStore.userInfo.name }}
            </NText>
            <NText depth="3" style="font-style: italic">
              "{{ userStore.userInfo.motto }}"
            </NText>

            <NDivider />

            <!-- 用户统计 -->
            <NFlex vertical :size="16" style="width: 100%">
              <NFlex align="center" :size="12">
                <NTag type="info" :bordered="false" size="large">
                  学习总时长
                </NTag>
                <NText strong>{{ studyStore.totalStudyHours }} 小时</NText>
              </NFlex>
              <NFlex align="center" :size="12">
                <NTag type="success" :bordered="false" size="large">
                  已完成任务
                </NTag>
                <NText strong>{{ studyStore.completedTaskCount }} 个</NText>
              </NFlex>
              <NFlex align="center" :size="12">
                <NTag type="warning" :bordered="false" size="large">
                  距目标日期
                </NTag>
                <NText strong>{{ daysUntilExam }} 天</NText>
              </NFlex>
            </NFlex>
          </NFlex>
        </NCard>
      </NGridItem>

      <!-- 右侧：个人信息表单 -->
      <NGridItem span="24 m:16">
        <NCard title="个人信息设置" :bordered="false">
          <NForm
            :model="formData"
            label-placement="left"
            label-width="100"
            style="max-width: 560px"
          >
            <NFormItem label="姓名">
              <NInput v-model:value="formData.name" placeholder="请输入姓名" />
            </NFormItem>
            <NFormItem label="目标院校">
              <NInput v-model:value="formData.targetSchool" placeholder="请输入目标院校" />
            </NFormItem>
            <NFormItem label="目标专业">
              <NInput v-model:value="formData.targetMajor" placeholder="请输入目标专业" />
            </NFormItem>
            <NFormItem label="考研年份">
              <NInputNumber
                v-model:value="formData.examYear"
                :min="2025"
                :max="2035"
                placeholder="请输入考研年份"
                style="width: 100%"
              />
            </NFormItem>
            <NFormItem label="每日目标时长">
              <NInputNumber
                v-model:value="formData.dailyTargetHours"
                :min="1"
                :max="16"
                placeholder="每日目标学习时长"
                style="width: 100%"
              >
                <template #suffix>小时</template>
              </NInputNumber>
            </NFormItem>
            <NFormItem label="座右铭">
              <NInput
                v-model:value="formData.motto"
                placeholder="请输入座右铭"
              />
            </NFormItem>
            <NFormItem label=" ">
              <NButton type="primary" @click="handleSaveProfile">
                保存修改
              </NButton>
            </NFormItem>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import {
  NCard, NGrid, NGridItem, NFlex, NAvatar, NText, NTag,
  NDivider, NForm, NFormItem, NInput, NInputNumber, NButton,
  useMessage
} from 'naive-ui'
import PageHeader from '@/components/study/PageHeader.vue'
import { useUserStore } from '@/stores/user'
import { useStudyStore } from '@/stores/study'
import { getApiErrorMessage } from '@/api/http'

const message = useMessage()
const userStore = useUserStore()
const studyStore = useStudyStore()

// 用 reactive 初始化表单数据，从 userStore.userInfo 拷贝
const formData = reactive({
  name: userStore.userInfo.name,
  targetSchool: userStore.userInfo.targetSchool,
  targetMajor: userStore.userInfo.targetMajor,
  examYear: userStore.userInfo.examYear,
  dailyTargetHours: userStore.userInfo.dailyTargetHours,
  motto: userStore.userInfo.motto
})

// 异步恢复会话后同步表单，避免刷新页面时仍显示空值。
watch(
  () => userStore.userInfo,
  profile => Object.assign(formData, {
    name: profile.name,
    targetSchool: profile.targetSchool,
    targetMajor: profile.targetMajor,
    examYear: profile.examYear,
    dailyTargetHours: profile.dailyTargetHours,
    motto: profile.motto
  }),
  { deep: true, immediate: true },
)

// 演示目标日期，可根据实际考试安排调整
const daysUntilExam = computed(() => {
  const year = userStore.userInfo.examYear
  const examDate = new Date(`${year}-12-21`)
  const now = new Date()
  const diff = examDate.getTime() - now.getTime()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
})

// 保存修改
async function handleSaveProfile() {
  try {
    await userStore.updateProfile({
      name: formData.name,
      targetSchool: formData.targetSchool,
      targetMajor: formData.targetMajor,
      examYear: formData.examYear,
      dailyTargetHours: formData.dailyTargetHours,
      motto: formData.motto
    })
    message.success('个人信息保存成功')
  } catch (error) {
    message.error(getApiErrorMessage(error, '个人信息保存失败'))
  }
}
</script>

<style scoped>
.profile-page {
  padding: 0;
}
.avatar-wrapper {
  display: flex;
  justify-content: center;
}
</style>

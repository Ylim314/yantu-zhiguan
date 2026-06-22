<template>
  <div class="login-page">
    <NCard class="login-card" :bordered="false">
      <div class="login-header">
        <h1 class="login-title">研途智管</h1>
        <p class="login-subtitle">考研学习任务管理系统</p>
      </div>

      <NForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        :show-label="false"
        @keyup.enter="handleLogin"
      >
        <NFormItem path="username">
          <NInput
            v-model:value="formData.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </NFormItem>

        <NFormItem path="password">
          <NInput
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password-on="click"
          />
        </NFormItem>

        <NFormItem :show-feedback="false">
          <div class="login-options">
            <NCheckbox v-model:checked="rememberMe">记住我</NCheckbox>
          </div>
        </NFormItem>

        <NButton
          type="primary"
          block
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </NButton>
      </NForm>

      <div class="login-footer">
        <NSpace vertical align="center" :size="8">
          <span style="color: #999; font-size: 12px">默认账号: admin / 123456</span>
          <NButton text type="primary" @click="registerVisible = true">
            没有账号？立即注册
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <!-- 注册弹窗沿用登录页视觉，不改变原有页面布局。 -->
    <NModal
      v-model:show="registerVisible"
      preset="card"
      title="注册新用户"
      :style="{ width: '420px' }"
      :mask-closable="false"
    >
      <NForm
        ref="registerFormRef"
        :model="registerData"
        :rules="registerRules"
        label-placement="left"
        label-width="90"
      >
        <NFormItem label="用户名" path="username">
          <NInput v-model:value="registerData.username" placeholder="3-20位字母、数字或下划线" />
        </NFormItem>
        <NFormItem label="姓名" path="name">
          <NInput v-model:value="registerData.name" placeholder="请输入姓名或昵称" />
        </NFormItem>
        <NFormItem label="密码" path="password">
          <NInput
            v-model:value="registerData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入不少于6位的密码"
          />
        </NFormItem>
        <NFormItem label="确认密码" path="confirmPassword">
          <NInput
            v-model:value="registerData.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入密码"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="registerVisible = false">取消</NButton>
          <NButton type="primary" :loading="registerLoading" @click="handleRegister">
            注册并登录
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NCard, NForm, NFormItem, NInput, NButton, NCheckbox, NSpace, NModal, useMessage
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useStudyStore } from '@/stores/study'
import { getApiErrorMessage } from '@/api/http'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()
const studyStore = useStudyStore()

const formRef = ref<FormInst | null>(null)
const registerFormRef = ref<FormInst | null>(null)
const loading = ref(false)
const registerLoading = ref(false)
const registerVisible = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const registerData = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { min: 6, message: '密码长度不能少于6位', trigger: ['blur', 'input'] }
  ]
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: ['blur', 'input'] },
    { pattern: /^[A-Za-z0-9_]{3,20}$/, message: '用户名需为3-20位字母、数字或下划线', trigger: ['blur', 'input'] }
  ],
  name: [
    { required: true, message: '请输入姓名或昵称', trigger: ['blur', 'input'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['blur', 'input'] },
    { min: 6, max: 50, message: '密码长度需为6-50位', trigger: ['blur', 'input'] }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: ['blur', 'input'] },
    {
      validator: (_rule, value) => value === registerData.password,
      message: '两次输入的密码不一致',
      trigger: ['blur', 'input']
    }
  ]
}

onMounted(() => {
  const rememberedUser = localStorage.getItem('yantu_remember_user')
  if (rememberedUser) {
    formData.username = rememberedUser
    rememberMe.value = true
  }
})

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true

  try {
    await userStore.login(formData.username, formData.password)
    await studyStore.fetchAll(true)

    if (rememberMe.value) {
      localStorage.setItem('yantu_remember_user', formData.username)
    } else {
      localStorage.removeItem('yantu_remember_user')
    }

    message.success('登录成功，欢迎回来！')
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (error) {
    message.error(getApiErrorMessage(error, '登录失败，请检查账号和密码'))
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  try {
    await registerFormRef.value?.validate()
  } catch {
    return
  }

  registerLoading.value = true
  try {
    await userStore.register(
      registerData.username,
      registerData.password,
      registerData.name,
    )
    await studyStore.fetchAll(true)
    message.success('注册成功，已为您创建初始学习数据')
    registerVisible.value = false
    await router.push('/dashboard')
  } catch (error) {
    message.error(getApiErrorMessage(error, '注册失败，请稍后重试'))
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f0ff 0%, #ffffff 50%, #f0f8ff 100%);
  padding: 20px;
}

.login-card {
  width: 400px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #2080f0;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
}
</style>

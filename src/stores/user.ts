import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'
import { getProfileApi, loginApi, registerApi, updateProfileApi } from '@/api/auth'

const emptyUser: UserInfo = {
  name: '',
  targetSchool: '',
  targetMajor: '',
  examYear: 2027,
  dailyTargetHours: 8,
  avatar: '',
  motto: '',
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo>({ ...emptyUser })
  const token = ref(localStorage.getItem('yantu_token') || '')
  const isLoggedIn = computed(() => Boolean(token.value))

  /** 保存 JWT 的逻辑集中在 Store，页面不再直接维护认证状态。 */
  function applyAuth(authToken: string, user: UserInfo) {
    token.value = authToken
    userInfo.value = user
    localStorage.setItem('yantu_token', authToken)
  }

  async function login(username: string, password: string) {
    const result = await loginApi(username, password)
    applyAuth(result.token, result.user)
    return true
  }

  async function register(username: string, password: string, name: string) {
    const result = await registerApi(username, password, name)
    applyAuth(result.token, result.user)
    return true
  }

  async function fetchProfile() {
    if (!token.value) return null
    const profile = await getProfileApi()
    userInfo.value = profile
    return profile
  }

  function logout() {
    token.value = ''
    userInfo.value = { ...emptyUser }
    localStorage.removeItem('yantu_token')
  }

  async function updateProfile(data: Partial<UserInfo>) {
    const profile = await updateProfileApi(data)
    userInfo.value = profile
    return profile
  }

  return {
    isLoggedIn,
    userInfo,
    token,
    login,
    register,
    fetchProfile,
    logout,
    updateProfile,
  }
})

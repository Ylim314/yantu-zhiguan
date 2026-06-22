import axios from 'axios'
import type { AxiosError } from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** Axios 实例统一配置 API 前缀、超时时间和 JWT 请求头。 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('yantu_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiResponse<null>>) => {
    // 后端返回 401 说明 JWT 缺失或失效，清理本地状态并回到登录页。
    if (error.response?.status === 401) {
      localStorage.removeItem('yantu_token')
      if (window.location.pathname !== '/login') {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?redirect=${redirect}`
      }
    }
    return Promise.reject(error)
  },
)

/** 从 Axios 异常中提取后端返回的中文业务提示。 */
export function getApiErrorMessage(error: unknown, fallback = '请求失败，请稍后重试') {
  if (axios.isAxiosError<ApiResponse<null>>(error)) {
    return error.response?.data?.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

export default http

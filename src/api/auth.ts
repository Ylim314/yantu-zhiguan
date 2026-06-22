import http from './http'
import type { ApiResponse } from './http'
import type { UserInfo } from '@/types'

export interface AuthResult {
  token: string
  user: UserInfo
}

/** 调用后端登录接口，成功后返回 JWT 和用户资料。 */
export async function loginApi(username: string, password: string) {
  const response = await http.post<ApiResponse<AuthResult>>('/auth/login', {
    username,
    password,
  })
  return response.data.data
}

/** 注册成功后后端会创建独立用户数据并直接签发 JWT。 */
export async function registerApi(username: string, password: string, name: string) {
  const response = await http.post<ApiResponse<AuthResult>>('/auth/register', {
    username,
    password,
    name,
  })
  return response.data.data
}

export async function getProfileApi() {
  const response = await http.get<ApiResponse<UserInfo>>('/auth/me')
  return response.data.data
}

export async function updateProfileApi(data: Partial<UserInfo>) {
  const response = await http.put<ApiResponse<UserInfo>>('/profile', data)
  return response.data.data
}

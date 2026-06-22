import http from './http'
import type { ApiResponse } from './http'
import type { Mistake, Plan, Subject, Task, TaskStatus } from '@/types'

export interface SubjectFilters {
  category?: string
  keyword?: string
}

export interface TaskFilters {
  keyword?: string
  subjectId?: number
  subjectName?: string
  status?: TaskStatus
}

export interface MistakeFilters {
  keyword?: string
  subjectName?: string
  difficulty?: string
}

export interface PlanFilters {
  date?: string
  subjectName?: string
  status?: string
}

/** 以下函数逐一对应后端 REST API，Store 不再直接修改 Mock 数组。 */
export async function getSubjectsApi(params?: SubjectFilters) {
  const response = await http.get<ApiResponse<Subject[]>>('/subjects', { params })
  return response.data.data
}

export async function createSubjectApi(data: Partial<Subject>) {
  const response = await http.post<ApiResponse<Subject>>('/subjects', data)
  return response.data.data
}

export async function updateSubjectApi(id: number, data: Partial<Subject>) {
  const response = await http.put<ApiResponse<Subject>>(`/subjects/${id}`, data)
  return response.data.data
}

export async function deleteSubjectApi(id: number) {
  await http.delete<ApiResponse<null>>(`/subjects/${id}`)
}

export async function getTasksApi(params?: TaskFilters) {
  const response = await http.get<ApiResponse<Task[]>>('/tasks', { params })
  return response.data.data
}

export async function createTaskApi(data: Partial<Task>) {
  const response = await http.post<ApiResponse<Task>>('/tasks', data)
  return response.data.data
}

export async function updateTaskApi(id: number, data: Partial<Task>) {
  const response = await http.put<ApiResponse<Task>>(`/tasks/${id}`, data)
  return response.data.data
}

export async function updateTaskStatusApi(id: number, status: TaskStatus) {
  const response = await http.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status })
  return response.data.data
}

export async function deleteTaskApi(id: number) {
  await http.delete<ApiResponse<null>>(`/tasks/${id}`)
}

export async function getMistakesApi(params?: MistakeFilters) {
  const response = await http.get<ApiResponse<Mistake[]>>('/mistakes', { params })
  return response.data.data
}

export async function createMistakeApi(data: Partial<Mistake>) {
  const response = await http.post<ApiResponse<Mistake>>('/mistakes', data)
  return response.data.data
}

export async function updateMistakeApi(id: number, data: Partial<Mistake>) {
  const response = await http.put<ApiResponse<Mistake>>(`/mistakes/${id}`, data)
  return response.data.data
}

export async function incrementMistakeReviewApi(id: number) {
  const response = await http.patch<ApiResponse<Mistake>>(`/mistakes/${id}/review`)
  return response.data.data
}

export async function deleteMistakeApi(id: number) {
  await http.delete<ApiResponse<null>>(`/mistakes/${id}`)
}

export async function getPlansApi(params?: PlanFilters) {
  const response = await http.get<ApiResponse<Plan[]>>('/plans', { params })
  return response.data.data
}

export async function createPlanApi(data: Partial<Plan>) {
  const response = await http.post<ApiResponse<Plan>>('/plans', data)
  return response.data.data
}

export async function updatePlanApi(id: number, data: Partial<Plan>) {
  const response = await http.put<ApiResponse<Plan>>(`/plans/${id}`, data)
  return response.data.data
}

export async function deletePlanApi(id: number) {
  await http.delete<ApiResponse<null>>(`/plans/${id}`)
}

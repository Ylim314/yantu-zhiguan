/** 科目类型 */
export interface Subject {
  id: number
  name: string
  category: string
  progress: number
  targetHours: number
  finishedHours: number
  color: string
  description: string
}

/** 任务状态 */
export type TaskStatus = '未开始' | '进行中' | '已完成' | '已延期'

/** 任务类型 */
export type TaskType = '看课' | '刷题' | '背诵' | '复盘' | '模拟测试' | '整理笔记'

/** 优先级 */
export type Priority = '高' | '中' | '低'

/** 学习任务 */
export interface Task {
  id: number
  title: string
  subjectId: number
  subjectName: string
  type: TaskType
  priority: Priority
  status: TaskStatus
  deadline: string
  estimatedMinutes: number
  actualMinutes: number
  description: string
}

/** 难度 */
export type Difficulty = '简单' | '中等' | '困难'

/** 错题记录 */
export interface Mistake {
  id: number
  title: string
  subjectName: string
  chapter: string
  difficulty: Difficulty
  reason: string
  solution: string
  reviewCount: number
  nextReviewDate: string
  tags: string[]
}

/** 计划状态 */
export type PlanStatus = '未开始' | '进行中' | '已完成' | '已取消'

/** 学习计划 */
export interface Plan {
  id: number
  date: string
  title: string
  subjectName: string
  timeRange: string
  status: PlanStatus
  remark: string
}

/** 用户信息 */
export interface UserInfo {
  name: string
  targetSchool: string
  targetMajor: string
  examYear: number
  dailyTargetHours: number
  avatar: string
  motto: string
}

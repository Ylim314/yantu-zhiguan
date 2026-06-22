/**
 * 日期工具函数
 * 提供倒计时、日期格式化等常用功能
 */

/** 计算距离目标日期的天数 */
export function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/** 格式化日期为 YYYY-MM-DD */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatLocalDate(d)
}

/** 按浏览器本地时区格式化日期，避免 UTC 转换导致日期偏移 */
export function formatLocalDate(value: number | Date): string {
  const d = typeof value === 'number' ? new Date(value) : value
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 获取今天的日期字符串 */
export function getToday(): string {
  return formatDate(new Date())
}

/** 将分钟数转换为 "Xh Ym" 格式 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}分钟`
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分钟`
}

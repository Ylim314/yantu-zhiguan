/** 可预期的业务异常，用于统一生成规范 JSON 错误响应。 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/** 统一成功响应结构，便于前端拦截器和报告说明。 */
export function success(res, data = null, message = '操作成功', status = 200) {
  return res.status(status).json({ code: 0, message, data })
}

/** 将同步或异步路由异常交给 Express 的统一错误中间件。 */
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

/** 读取必填字符串并去除首尾空格。 */
export function requiredText(value, fieldName) {
  const text = String(value ?? '').trim()
  if (!text) {
    throw new ApiError(400, `${fieldName}不能为空`)
  }
  return text
}

/** 将未知输入安全转换为有限数值。 */
export function numeric(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

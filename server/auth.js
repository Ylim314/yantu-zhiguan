import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { ApiError } from './http.js'

/** 生成包含用户编号和用户名的 JWT 访问令牌。 */
export function createToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  )
}

/** 校验 Authorization: Bearer <token>，并将登录用户写入 req.user。 */
export function authenticate(req, _res, next) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return next(new ApiError(401, '请先登录后再访问'))
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = {
      id: Number(payload.sub),
      username: String(payload.username),
    }
    return next()
  } catch {
    return next(new ApiError(401, '登录状态已失效，请重新登录'))
  }
}

import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { initializeDatabase } from './db.js'
import { ApiError } from './http.js'
import { apiRouter } from './routes.js'

/** 创建 Express 应用，测试代码可直接复用而无需监听固定端口。 */
export function createApp() {
  initializeDatabase()
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({
    origin(origin, callback) {
      // 浏览器同源请求和命令行测试没有 Origin，可直接放行。
      const isLocalDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
      if (!origin || config.clientOrigins.includes(origin) || isLocalDevelopmentOrigin) {
        return callback(null, true)
      }
      return callback(new ApiError(403, '当前来源不在跨域白名单中'))
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use('/api', apiRouter)

  // 生产环境构建后，后端可同时托管 Vue dist 静态文件。
  if (fs.existsSync(path.join(config.distPath, 'index.html'))) {
    app.use(express.static(config.distPath))
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        return res.sendFile(path.join(config.distPath, 'index.html'))
      }
      return next()
    })
  }

  app.use((req, _res, next) => {
    next(new ApiError(404, `接口不存在：${req.method} ${req.originalUrl}`))
  })

  /** 统一异常处理，数据库约束错误也转换为用户可理解的中文信息。 */
  app.use((error, _req, res, _next) => {
    let status = error.status || 500
    let message = error.message || '服务器内部错误'

    if (
      String(error.code || '').startsWith('SQLITE_CONSTRAINT')
      || /UNIQUE constraint failed|FOREIGN KEY constraint failed/i.test(String(error.message))
    ) {
      status = 409
      message = '数据已存在或仍被其他记录使用'
    }

    if (status >= 500) {
      console.error(error)
    }
    res.status(status).json({ code: status, message, data: null })
  })

  return app
}

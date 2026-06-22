import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

// 优先读取项目根目录的 .env；文件不存在时继续使用环境变量或课程演示默认值。
try {
  loadEnvFile()
}
catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

/** 后端运行配置，环境变量未提供时使用适合课程演示的默认值。 */
export const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'yantu-course-design-dev-secret-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databasePath: process.env.DATABASE_PATH || path.join(currentDir, 'data', 'yantu.db'),
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
  distPath: path.resolve(currentDir, '..', 'dist'),
}

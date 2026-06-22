import { createApp } from './app.js'
import { config } from './config.js'

const app = createApp()

app.listen(config.port, () => {
  console.log(`研途智管后端已启动：http://localhost:${config.port}`)
  console.log(`健康检查地址：http://localhost:${config.port}/api/health`)
})

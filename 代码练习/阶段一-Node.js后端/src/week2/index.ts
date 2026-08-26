import { createApp } from './app.js'
import pino from 'pino'

const port = process.env.PORT
const app = createApp()
const logger = pino()

const server = app.listen(port, () => {
  logger.info(`服务已启动: http://localhost:${port}`)
})

const shutdown = () => {
  console.log('收到退出信号，正在优雅关闭...')
  server.close(() => {
    console.log('所有连接已处理完，进程退出')
    process.exit(0)  // 0 表示正常退出
  })
}

process.on('SIGTERM', shutdown)  // 部署平台要下线你时，会发 SIGTERM 信号 → 触发关门
process.on('SIGINT', shutdown)   // 你在终端按 Ctrl+C → 触发关门

process.on('uncaughtException', (err) => {
  console.log(`未捕获的异常: ${err.message}`)
  process.exit(1)  // 1 表示异常退出
})


import { createApp } from './app'
import pino from 'pino'

const port = process.env.PORT
const app = createApp()
const logger = pino()

app.listen(port, () => {
  logger.info(`服务已启动: http://localhost:${port}`)
})





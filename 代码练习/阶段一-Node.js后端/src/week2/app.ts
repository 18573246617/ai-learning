import express from "express"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"
import { requestLogger } from "./middleware/logger.js"
import { tasksRouter } from "./routes/tasks.js"

export function createApp() {
  const app = express()

  // 请求日志：先记录，再处理
  app.use(requestLogger)

  // 解析 JSON 请求体 → req.body（必须在路由之前）
  app.use(express.json())

  // 欢迎页：顺便告诉你有哪些接口
  app.get("/", (_req, res) => {
    res.json({
      message: "Week2 待办 API",
      docs: [
        "GET    /tasks",
        "POST   /tasks",
        "GET    /tasks/:id",
        "PUT    /tasks/:id",
        "DELETE /tasks/:id",
      ],
    })
  })

  // 业务路由
  app.use("/tasks", tasksRouter)

  // 兜底：所有没匹配到的路径
  app.use(notFoundHandler)

  // 错误处理：必须 4 个参数，放在最后
  app.use(errorHandler)

  return app
}

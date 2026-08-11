import type { NextFunction, Request, Response } from "express"

// 404 兜底：放在所有路由之后
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "接口不存在" })
}

// 错误处理中间件：必须 4 个参数，Express 才能识别
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("出错了:", err)
  res.status(500).json({ error: "服务器内部错误" })
}

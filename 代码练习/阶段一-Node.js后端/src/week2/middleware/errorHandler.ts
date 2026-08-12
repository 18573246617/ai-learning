
import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    //原生写法
    // res.statusCode = 500
    // res.end(JSON.stringify({ error: "服务器内部错误" }))


    //express写法
    res.status(500).json({ error: "服务器内部错误" })
}

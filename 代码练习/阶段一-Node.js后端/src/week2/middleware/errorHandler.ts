import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import multer from 'multer'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    // 1. multer 文件上传错误：超大小 → 413，其余（数量超限/字段不对）→ 400
    if (err instanceof multer.MulterError) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
        res.status(status).json({ message: err.message, code: err.code })
        return
    }

    // 2. 上传文件类型不对（fileFilter 抛出的普通 Error）
    if (err instanceof Error && err.message.includes('文件类型')) {
        res.status(400).json({ message: err.message })
        return
    }

    // 3. CORS 白名单拒绝（跨域来源不在白名单内）
    if (err instanceof Error && err.message.includes('不允许的跨域来源')) {
        res.status(403).json({ message: err.message })
        return
    }

    // 4. zod 参数校验失败（路由内一般已处理，这里是兜底）
    if (err instanceof ZodError) {
        res.status(400).json({ message: '参数校验失败', data: err.flatten() })
        return
    }

    // 5. 其余未知错误：记录日志后返回 500
    console.error(err)
    res.status(500).json({ error: '服务器内部错误' })
}

import type { Request, Response, NextFunction } from 'express'
import { createHash } from 'node:crypto'
import { tokenFindUser } from '../data/auth'

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. 没带 token → 401（注意：不要用 String() 包装，否则 undefined 会变成字符串 "undefined"）
        const token = req.headers['x-http-token']
        if (!token) throw new Error('Token 不能为空')

        // 2. 把客户端 token 哈希后查库（库中存的是哈希，不能拿原始 token 直接查）
        const tokenHash = createHash('sha256').update(token as string).digest('hex')
        const user = await tokenFindUser(tokenHash)
        if (!user) {
            return res.status(401).json({ message: '用户不存在或登录已失效' })
        }

        // 3. 校验通过：把用户挂到 req 上，放行给后面的路由
        req.user = user
        next()
    } catch (error) {
        // 预期内的失败（没带 token）直接响应，不抛给错误处理
        res.status(401).json({ message: 'Token 不能为空' })
    }
}

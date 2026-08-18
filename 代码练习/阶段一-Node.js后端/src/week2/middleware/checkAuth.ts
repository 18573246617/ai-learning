import type { Request, Response, NextFunction } from 'express'
import { createHash } from 'node:crypto'
import { tokenFindUser } from '../data/auth'
import jwt from 'jsonwebtoken'

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers['authorization'] || ''
        const token = header.startsWith('Bearer ') ? header.slice(7) : undefined
        if (!token) throw new Error('Token 不能为空')

        const payload = jwt.verify(token, process.env.JWT_SECRET!)
        if (typeof payload === 'string') {
            return res.status(401).json({ message: 'Token 无效' })
        }

        // 校验通过：把 payload 挂到 req.user，放行给后面的路由
        req.user = payload as { userName: string }
        next()

        // 1. 没带 token → 401（注意：不要用 String() 包装，否则 undefined 会变成字符串 "undefined"）
        // const token = req.headers['x-http-token']
        // if (!token) throw new Error('Token 不能为空')

        //  2. 把客户端 token 哈希后查库（库中存的是哈希，不能拿原始 token 直接查）
        // const tokenHash = createHash('sha256').update(token as string).digest('hex')
        // const user = await tokenFindUser(tokenHash)
        // if (!user) {
        //     return res.status(401).json({ message: '用户不存在或登录已失效' })
        // }

        //  3. 校验通过：把用户挂到 req 上，放行给后面的路由
        // req.user = user
        // next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token 已过期' })
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token 无效' })
        } else {
            return res.status(401).json({ message: 'Token 无效' })
        }


        // 预期内的失败（没带 token）直接响应，不抛给错误处理
        // res.status(401).json({ message: 'Token 不能为空' })
    }
}

import { type NextFunction, type Request, type Response, Router } from 'express'
import { loginSchema, registerSchema } from '../../schemas/auth/index.js'

import { checkAuth } from '../../middleware/checkAuth.js'
import { findUser, addUser, listUsers } from '../../data/auth/index.js'
import bcrypt from 'bcrypt' //生成密码
import jwt from 'jsonwebtoken' //生成token
import pino from 'pino'
import { rateLimit } from 'express-rate-limit'

export const authRouter: Router = Router()
const logger = pino()
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 分钟
    limit: 10, // 每个 IP 每分钟最多请求 1 次
    standardHeaders: 'draft-8', // 在响应头暴露 RateLimit-Limit / RateLimit-Remaining 等标准头
    legacyHeaders: false, // 关掉旧版 X-RateLimit-* 头
    message: (req: Request, _res: Response) => {
        // req.rateLimit.resetTime 是本次限流窗口重置的时刻（Date），据此实时算出剩余秒数
        const resetTime = req.rateLimit?.resetTime
        const seconds = resetTime ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000)) : 60 // 拿不到 resetTime 时兜底显示 60 秒

        return { message: `登录尝试过于频繁，请 ${seconds} 秒后再试`, data: null }
    },
})

authRouter.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ?? {} 兜底：客户端没发 body 时 req.body 是 undefined，转成空对象让 zod 进字段校验
        const result = await loginSchema.safeParse(req.body ?? {})
        if (!result.success) {
            // 取第一条具体错误（如“用户名不能为空”），而不是整坨 ZodError
            return res.status(400).json(result.error.flatten())
        }

        //从数据库获取用户信息
        const user = await findUser(result.data.username)

        if (!user) {
            logger.warn('用户不存在')
            return res.status(400).json({
                message: '用户不存在',
                data: null,
            })
        }
        // 不安全 将当前密码转化成哈希值与数据库进行对比
        // const password = createHash('sha256').update(result.data.password).digest('hex')
        //安全 使用 bcrypt 比较密码

        const isMatch = await bcrypt.compare(result.data.password, user.password)
        if (!isMatch) {
            logger.warn('用户名或者密码错误')
            return res.status(400).json({
                message: '用户名或者密码错误',
                data: null,
            })
        }

        // 不安全 生成一个随机的32位字符串作为token，返回给客户端
        // const token = randomBytes(16).toString('hex')

        // 不安全 数据库只存 token 的哈希值，不存原始 token（防库泄露后 token 被直接冒用）
        // const tokenHash = createHash('sha256').update(token).digest('hex')

        // 使用 jwt 生成 token
        const token = jwt.sign({ userName: user.username }, process.env.JWT_SECRET!, { expiresIn: '8h' })

        // updateUser({ username: user.username, })
        logger.info('登录成功')
        res.json({
            message: '登录成功',
            data: {
                username: user.username,
                token,
            },
        })
    } catch (error) {
        next(error)
    }
})

authRouter.post('/register', async (req: Request, res: Response) => {
    const result = await registerSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json(result.error.flatten())
    }
    //不安全
    // const password = createHash('sha256').update(result.data.password).digest('hex')

    // 安全
    const password = await bcrypt.hash(result.data.password, 10)

    const add = await addUser({
        ...result.data,
        password,
    })
    if (!add) {
        return res.status(400).json({
            message: '用户名已存在',
            data: null,
        })
    }
    res.json({ message: '注册成功', data: null })
})

//获取用户列表
authRouter.get('/userList', async (req: Request, res: Response) => {
    const list = await listUsers()
    res.json({
        message: '获取用户列表成功',
        // 只返回用户名，绝不能把 password / token 泄露给前端
        data: list.map(({ password, token, ...safeUser }) => safeUser),
        // data: list.map((ele) => ele)
    })
})

//获取用户信息
// checkAuth 中间件挂在这一条路由上：先鉴权，再把用户挂到 req.user
authRouter.get('/getUserInfo', checkAuth, async (req: Request, res: Response) => {
    // checkAuth 已把 payload 挂到 req.user，这里直接用（payload 只有 userName，无密码，天然安全）
    if (!req.user) {
        return res.status(401).json({ message: '未登录', data: null })
    }
    res.json({ message: '获取用户信息成功', data: req.user })
})

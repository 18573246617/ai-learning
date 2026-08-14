import express, { type Request, type Response, type NextFunction, Router } from 'express'
import { loginSchema, registerSchema } from '../../schemas/auth'

import { tokenFindUser, findUser, addUser, deleteUser, updateUser, listUsers } from '../../data/auth'
import { createHash, randomBytes } from 'node:crypto'
import { checkAuth } from '../../middleware/checkAuth'
export const authRouter: Router = Router()

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ?? {} 兜底：客户端没发 body 时 req.body 是 undefined，转成空对象让 zod 进字段校验
        const result = await loginSchema.safeParse(req.body ?? {})
        if (!result.success) {
            // 取第一条具体错误（如“用户名不能为空”），而不是整坨 ZodError
            return res.status(400).json(result.error.flatten())
        }
        const user = await findUser(result.data.username)



        if (!user) {
            return res.status(400).json({
                message: '请先注册账户！！',
                data: null
            })
        }
        //将当前密码转化成哈希值与数据库进行对比
        const password = createHash('sha256').update(result.data.password).digest('hex')
        if (password != user.password) return res.status(400).json({
            message: '用户名或者密码错误',
            data: null
        })

        //生成一个随机的32位字符串作为token存储到数据库
        const token = randomBytes(16).toString('hex')
        updateUser({ username: user.username, token })

        res.json({
            message: '登录成功',
            data: {
                username: user.username,
                token
            }
        })


    } catch (error) {
        next(error)
    }
})

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const result = await registerSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json(result.error.flatten())
    }
    const password = createHash('sha256').update(result.data.password).digest('hex')

    const add = await addUser({
        ...result.data,
        password,
    })
    if (!add) {
        return res.status(400).json({
            message: '用户名已存在',
            data: null
        })
    }
    res.json({ message: '注册成功', data: null })
})

//获取用户列表
authRouter.get('/userList', async (req: Request, res: Response, next: NextFunction) => {
    const list = await listUsers()
    res.json({
        message: '获取用户列表成功',
        // 只返回用户名，绝不能把 password / token 泄露给前端
        data: list.map(({ password, token, ...safeUser }) => safeUser)
    })
})

//获取用户信息
// checkAuth 中间件挂在这一条路由上：先鉴权，再把用户挂到 req.user
authRouter.get('/getUserInfo', checkAuth, async (req: Request, res: Response, next: NextFunction) => {
    // checkAuth 中间件已经把用户挂到 req.user 上了，这里直接用
    if (!req.user) {
        return res.status(401).json({ message: '未登录', data: null })
    }
    const { password, ...safeUser } = req.user
    res.json({ message: '获取用户信息成功', data: safeUser })
})

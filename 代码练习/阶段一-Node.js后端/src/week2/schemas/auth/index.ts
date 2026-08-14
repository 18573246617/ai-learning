import { z } from 'zod'
export const loginSchema = z.object({
    username: z.string().trim().min(1, '用户名不能为空'),
    password: z.string().trim().min(1, '密码不能为空'),
})

export const registerSchema = z.object({
    username: z.string().trim().min(1, '用户名不能为空'),
    password: z.string().trim().min(1, '密码不能为空'),
})
export const updateSchema = z.object({
    username: z.string().trim().min(1, '用户名不能为空'),
    password: z.string().trim().min(1, '密码不能为空'),
})

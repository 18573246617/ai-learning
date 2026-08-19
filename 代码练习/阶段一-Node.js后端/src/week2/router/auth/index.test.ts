import { beforeEach, it, expect, describe } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app'
import { resetUsers } from '../../data/auth'

// vitest 每个测试文件环境独立，必须单独设置 JWT_SECRET（登录签发 token 需要）
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
const app = createApp()

// 每个测试开始前清空内存用户数据，保证测试互不污染（注册的用户不会串到下一个测试）
beforeEach(() => {
    resetUsers()
})

describe('auth接口测试', () => {
    it('POST /auth/register 注册', async () => {
        const res = await request(app).post('/auth/register').send({ username: 'test', password: 'test' })
        expect(res.status).toBe(200)
        expect(res.body).toBeInstanceOf(Object)
    })
    it('POST /auth/login 登录返回 token', async () => {
        const username = `user_${Date.now()}`
        await request(app).post('/auth/register').send({ username, password: '123456' })  // 自己造数据
        const res = await request(app).post('/auth/login').send({ username, password: '123456' })
        expect(res.status).toBe(200)
        expect(res.body.data.token).toBeDefined()       // 核心：token 必须存在！
    })
    it('完整流程：注册 → 登录 → 带 token 访问 getUserInfo', async () => {
        const username = `user_${Date.now()}`
        await request(app).post('/auth/register').send({ username, password: '123456' })  // 自己造数据
        const res = await request(app).post('/auth/login').send({ username, password: '123456' })
        expect(res.status).toBe(200)
        expect(res.body.data.token).toBeDefined()       // 核心：token必须存在！
        const resUserInfo = await request(app).get('/auth/getUserInfo').set('Authorization', `Bearer ${res.body.data.token}`)
        expect(resUserInfo.status).toBe(200)
        expect(resUserInfo.body.data).toBeDefined()       // 核心：用户信息必须存在！
    })
})


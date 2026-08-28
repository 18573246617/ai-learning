import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app'
import { resetUsers } from '../../data/auth'
import { resetTasks } from '../../data/tasks'

// 测试进程不走 --env-file，必须手动给 JWT_SECRET（登录签发和 checkAuth 验证共用）
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
const app = createApp()

// 每个测试开始前清空内存数据（users + tasks），保证测试互不污染
beforeEach(() => {
    resetUsers()
    resetTasks()
})
const loginToken = async (username: string) => {
    //首先注册
    await request(app).post('/auth/register').send({ username, password: '123456' })
    //登录获取token
    const res = await request(app).post('/auth/login').send({ username, password: '123456' })

    return res.body.data.token
}

describe('task接口集成测试', () => {
    //描述,相当于文件夹
    it('测试GET /tasks/list 列表接口', async () => {
        //当前接口测试用例的描述
        const token = await loginToken(`tester_${Date.now()}`)
        const res = await request(createApp()).get('/tasks/list').set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200) //断言res.status的值为200
        expect(res.body).toBeInstanceOf(Array) //断言res.body的值为数组
    })
    it('GET /tasks/download 返回下载响应', async () => {
        const token = await loginToken(`tester_${Date.now()}`)
        const res = await request(app).get('/tasks/download').set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.headers['content-disposition']).toContain('attachment')
    })
    it('POST /tasks/create 创建任务接口', async () => {
        const token = await loginToken(`tester_${Date.now()}`)
        const res = await request(app)
            .post('/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: '标题', completed: false, priority: 'low' })
        expect(res.status).toBe(201)
        expect(res.body).toBeInstanceOf(Object)
    })
    it('PUT /tasks/update/:id 修改', async () => {
        const token = await loginToken(`tester_${Date.now()}`)
        const createRes = await request(app)
            .post('/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: '标题', completed: false, priority: 'low' })
        const res = await request(app)
            .put(`/tasks/update/${createRes.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: '标题', completed: false, priority: 'low' })
        expect(res.status).toBe(200)
        expect(res.body).toBeInstanceOf(Object)
    })
    it('DELETE /tasks/delete/:id 删除', async () => {
        const token = await loginToken(`tester_${Date.now()}`)
        const createRes = await request(app)
            .post('/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: '标题', completed: false, priority: 'low' })
        const res = await request(app)
            .delete(`/tasks/delete/${createRes.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(204)
        expect(res.body).toBeInstanceOf(Object)
    })
    it('GET /tasks/detail/:id 查看详情', async () => {
        const token = await loginToken(`tester_${Date.now()}`)
        const createRes = await request(app)
            .post('/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: '标题', completed: false, priority: 'low' })
        const res = await request(app).get(`/tasks/detail/${createRes.body.id}`).set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body).toBeInstanceOf(Object)
    })
})

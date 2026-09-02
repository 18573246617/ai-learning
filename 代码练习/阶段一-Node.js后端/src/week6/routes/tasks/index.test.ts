import { describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

// 关键点1：week6 的 config/index.ts 在模块加载时会对 JWT_SECRET 做 fail-fast 校验（必填且 ≥32 位），
// 测试进程不走 --env-file，必须先于 app 的加载把环境变量设置好。
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-0123456789abcdef';

// 关键点2：必须用动态 import 而非顶部静态 import —— ESM 静态 import 会提升，
// 导致 config 模块先于本行执行，JWT_SECRET 未设置时直接 process.exit(1)。
const { createApp } = await import('../../app.js');
const app: Express = createApp();

// 关键点3：token 不硬编码，通过注册 → 登录动态获取（保证密钥一致、永不过期）
const loginToken = async (username: string) => {
    await request(app).post('/auth/register').send({ username, password: '123456' });
    const res = await request(app).post('/auth/login').send({ username, password: '123456' });
    expect(res.status).toBe(200);
    return res.body.data.token as string;
};

describe('tasks 接口集成测试', () => {
    it('GET /tasks/list 全流程：注册 → 登录 → 添加任务 → 列表包含该任务', async () => {
        // 1. 动态获取 token（用户名唯一，保证测试间独立）
        const token = await loginToken(`u_${Date.now()}`);

        // 2. 造数据：通过 add 接口走完整 HTTP 链路添加唯一标题的任务
        const taskTitle = `task_${Date.now()}`;
        const addRes = await request(app)
            .get('/tasks/add')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: taskTitle });
        expect(addRes.status).toBe(200);
        expect(addRes.body.code).toBe(0);

        // 3. 核心契约断言：状态码 200 + 统一响应结构 { code, message, data } + 列表包含刚添加的任务
        const res = await request(app).get('/tasks/list').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.code).toBe(0);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toEqual(
            expect.arrayContaining([expect.objectContaining({ title: taskTitle })]),
        );
    });

    it('GET /tasks/list 未携带 Token 返回 401', async () => {
        const res = await request(app).get('/tasks/list');
        expect(res.status).toBe(401);
        expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' });
    });

    it('GET /tasks/list 按 title 过滤只返回匹配项', async () => {
        const token = await loginToken(`u_${Date.now()}`);

        // 添加两条标题不同的任务（前缀与全流程用例区分，避免 includes 过滤交叉误匹配）
        const target = `filter_${Date.now()}`;
        const other = `other_${Date.now()}`;
        await request(app).get('/tasks/add').set('Authorization', `Bearer ${token}`).send({ title: target });
        await request(app).get('/tasks/add').set('Authorization', `Bearer ${token}`).send({ title: other });

        // 带 title 过滤条件查询（GET + body 由 multer 之外的 express.json() 解析）
        const res = await request(app)
            .get('/tasks/list')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: target });

        expect(res.status).toBe(200);
        expect(res.body.code).toBe(0);
        expect(res.body.data.length).toBeGreaterThan(0);
        // 过滤生效：返回的每一项 title 都必须包含过滤条件（history 数据不含 target 不会被返回）
        expect(res.body.data.every((t: { title?: string }) => t.title?.includes(target))).toBe(true);
    });
});

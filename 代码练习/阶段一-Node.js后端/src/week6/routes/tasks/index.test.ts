import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// 本地跑测试时加载 env/.env.development（CI 里没有这个文件，用 CI 注入的环境变量）。
// 必须在 import app 之前完成：db/prisma.ts 在模块加载时就会读 DATABASE_URL。
const envFile = fileURLToPath(new URL('../../../../env/.env.development', import.meta.url));
if (!process.env.DATABASE_URL && existsSync(envFile)) {
    process.loadEnvFile(envFile);
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-0123456789abcdef';

// 动态 import：ESM 静态 import 会提升，config 会在 JWT_SECRET 设置前执行并 fail fast
const { createApp } = await import('../../app.js');
const app: Express = createApp();

vi.setConfig({ testTimeout: 15000 });

let seq = 0;
const nextName = (prefix: string) => `${prefix}_${Date.now()}_${seq++}`;

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const registerAndLogin = async () => {
    const username = nextName('u');
    await request(app)
        .post('/auth/register')
        .send({ username, password: '123456', email: `${username}@example.com` });
    const res = await request(app).post('/auth/login').send({ username, password: '123456' });
    expect(res.status).toBe(200);
    return { username, token: res.body.data.token as string };
};

// 注册会赠送一条"注册赠送任务"，需要精确计数的用例先清空
const clearTasks = async (token: string) => {
    const res = await request(app).get('/tasks/mine').query({ pageSize: 100 }).set(auth(token));
    for (const task of res.body.data.items as { id: string }[]) {
        await request(app).delete(`/tasks/${task.id}`).set(auth(token));
    }
};

describe('tasks 接口', () => {
    it('POST /tasks → 201，id 是字符串', async () => {
        const { token } = await registerAndLogin();
        const res = await request(app).post('/tasks').set(auth(token)).send({ title: '写周报' });

        expect(res.status).toBe(201);
        expect(res.body.code).toBe(0);
        expect(typeof res.body.data.id).toBe('string');
        expect(res.body.data.title).toBe('写周报');
    });

    it('GET /tasks 只返回当前用户的任务', async () => {
        const a = await registerAndLogin();
        const b = await registerAndLogin();
        const title = `a_${Date.now()}`;
        await request(app).post('/tasks').set(auth(a.token)).send({ title });

        const res = await request(app).get('/tasks').set(auth(b.token));
        expect(res.status).toBe(200);
        const titles = (res.body.data.items as { title: string }[]).map((t) => t.title);
        expect(titles).not.toContain(title);
    });

    it('GET /tasks/mine 游标分页：两页无重复、无遗漏', async () => {
        const { token } = await registerAndLogin();
        await clearTasks(token);
        for (let i = 1; i <= 5; i++) {
            await request(app).post('/tasks').set(auth(token)).send({ title: `c${i}` });
        }

        const first = await request(app).get('/tasks/mine').query({ pageSize: 2 }).set(auth(token));
        expect(first.status).toBe(200);
        expect(first.body.data.items).toHaveLength(2);
        expect(first.body.data.hasMore).toBe(true);

        const cursor1 = first.body.data.items[1].id;
        const second = await request(app)
            .get('/tasks/mine')
            .query({ pageSize: 2, cursor: cursor1 })
            .set(auth(token));
        expect(second.status).toBe(200);
        expect(second.body.data.items).toHaveLength(2);
        expect(second.body.data.hasMore).toBe(true);

        const cursor2 = second.body.data.items[1].id;
        const third = await request(app)
            .get('/tasks/mine')
            .query({ pageSize: 2, cursor: cursor2 })
            .set(auth(token));
        expect(third.status).toBe(200);
        expect(third.body.data.items).toHaveLength(1);
        expect(third.body.data.hasMore).toBe(false);

        const ids = [
            ...first.body.data.items,
            ...second.body.data.items,
            ...third.body.data.items,
        ].map((t: { id: string }) => t.id);
        expect(new Set(ids).size).toBe(5);
    });

    it('GET /tasks/mine 支持 completed / tag 过滤', async () => {
        const { token } = await registerAndLogin();
        await request(app).post('/tasks').set(auth(token)).send({ title: 'work-open', tagNames: ['work'] });
        await request(app)
            .post('/tasks')
            .set(auth(token))
            .send({ title: 'home-done', tagNames: ['home'], completed: true });

        const res = await request(app)
            .get('/tasks/mine')
            .query({ completed: 'false', tag: 'work' })
            .set(auth(token));
        expect(res.status).toBe(200);
        const titles = (res.body.data.items as { title: string }[]).map((t) => t.title);
        expect(titles).toEqual(['work-open']);
    });

    it('PATCH /tasks/:id 不带 body id 也能改，且不能改别人的', async () => {
        const a = await registerAndLogin();
        const b = await registerAndLogin();
        const created = await request(app).post('/tasks').set(auth(a.token)).send({ title: 'alice-task' });
        const id = created.body.data.id;

        const okRes = await request(app).patch(`/tasks/${id}`).set(auth(a.token)).send({ completed: true });
        expect(okRes.status).toBe(200);
        expect(okRes.body.data.completed).toBe(true);

        const forbidden = await request(app).patch(`/tasks/${id}`).set(auth(b.token)).send({ title: 'hacked' });
        expect(forbidden.status).toBe(404);
        expect(forbidden.body.code).toBe('TASK_NOT_FOUND');

        const mine = await request(app).get('/tasks/mine').set(auth(a.token));
        const row = (mine.body.data.items as { id: string; title: string }[]).find((t) => t.id === id);
        expect(row?.title).toBe('alice-task');
    });

    it('DELETE /tasks/:id 不带 body 也能删', async () => {
        const { token } = await registerAndLogin();
        const created = await request(app).post('/tasks').set(auth(token)).send({ title: 'to-delete' });
        const id = created.body.data.id;

        const res = await request(app).delete(`/tasks/${id}`).set(auth(token));
        expect(res.status).toBe(200);

        const mine = await request(app).get('/tasks/mine').set(auth(token));
        const ids = (mine.body.data.items as { id: string }[]).map((t) => t.id);
        expect(ids).not.toContain(id);
    });

    it('参数校验：pageSize=1000 / cursor=abc 返回 400', async () => {
        const { token } = await registerAndLogin();

        const big = await request(app).get('/tasks/mine').query({ pageSize: 1000 }).set(auth(token));
        expect(big.status).toBe(400);
        expect(big.body.code).toBe('VALIDATION_ERROR');

        const bad = await request(app).get('/tasks/mine').query({ cursor: 'abc' }).set(auth(token));
        expect(bad.status).toBe(400);
        expect(bad.body.code).toBe('VALIDATION_ERROR');
    });

    it('PATCH 空 body 返回 400', async () => {
        const { token } = await registerAndLogin();
        const created = await request(app).post('/tasks').set(auth(token)).send({ title: 'x' });

        const res = await request(app).patch(`/tasks/${created.body.data.id}`).set(auth(token)).send({});
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });
});

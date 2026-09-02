import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

// config/index.ts 在模块加载时校验 JWT_SECRET(fail fast)，测试进程不走 --env-file，必须先设置。
// OPENAI_API_KEY 也在此设置：llmService 从 config 取 key，未配置时会走 LLM_CONFIG_ERROR 分支(该分支更适合 service 单测)。
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-0123456789abcdef';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';

// 动态 import：保证 env 先就位，再加载 app（ESM 静态 import 会提升，config 会先执行而退出）
const { createApp } = await import('../../app.js');
const app: Express = createApp();

// 动态获取 token：注册 → 登录（不硬编码，保证密钥一致、永不过期）
const loginToken = async (username: string) => {
    await request(app).post('/auth/register').send({ username, password: '123456' });
    const res = await request(app).post('/auth/login').send({ username, password: '123456' });
    expect(res.status).toBe(200);
    return res.body.data.token as string;
};

// stubGlobal 是运行时替换，必须在被测函数调用前完成；afterEach 清理防止污染后续用例
afterEach(() => {
    vi.unstubAllGlobals();
});

describe('llm 接口集成测试（fetch 全 mock，不真调付费 API）', () => {
    it('POST /llm/chatgpt 成功：返回 { content } 且请求带正确密钥', async () => {
        const token = await loginToken(`u_${Date.now()}`);

        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ choices: [{ message: { content: '我是测试回复' } }] }),
        });
        vi.stubGlobal('fetch', mockFetch);

        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '你好' });

        expect(res.status).toBe(200);
        expect(res.body.code).toBe(0);
        expect(res.body.data).toEqual({ content: '我是测试回复' });

        // 验证真实请求参数：URL、方法、密钥头（防止 mock 成功但请求本身发错了）
        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.openai.com/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ Authorization: 'Bearer test-openai-key' }),
            }),
        );
    });

    it('POST /llm/chatgpt 上游限流 429 → 429 LLM_RATE_LIMITED', async () => {
        const token = await loginToken(`u_${Date.now()}`);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));

        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '你好' });

        expect(res.status).toBe(429);
        expect(res.body).toMatchObject({ code: 'LLM_RATE_LIMITED' });
    });

    it('POST /llm/chatgpt 上游 500 → 502 LLM_API_ERROR', async () => {
        const token = await loginToken(`u_${Date.now()}`);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));

        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '你好' });

        expect(res.status).toBe(502);
        expect(res.body).toMatchObject({ code: 'LLM_API_ERROR' });
    });

    it('POST /llm/chatgpt 网络层失败 → 502 LLM_NETWORK_ERROR', async () => {
        const token = await loginToken(`u_${Date.now()}`);
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '你好' });

        expect(res.status).toBe(502);
        expect(res.body).toMatchObject({ code: 'LLM_NETWORK_ERROR' });
    });

    it('POST /llm/chatgpt 响应无内容 → 502 LLM_EMPTY_RESPONSE', async () => {
        const token = await loginToken(`u_${Date.now()}`);
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ choices: [] }) }));

        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '你好' });

        expect(res.status).toBe(502);
        expect(res.body).toMatchObject({ code: 'LLM_EMPTY_RESPONSE' });
    });

    it('POST /llm/chatgpt prompt 为空 → 400 VALIDATION_ERROR', async () => {
        const token = await loginToken(`u_${Date.now()}`);
        // 不 stub fetch：校验应该拦截在请求发出之前，fetch 不会被调用
        const res = await request(app)
            .post('/llm/chatgpt')
            .set('Authorization', `Bearer ${token}`)
            .send({ prompt: '   ' });

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
    });
});

import { vi, expect, describe, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app'

const app = createApp()
vi.mock('../../service/llm', () => ({
    callDeepSeek: vi.fn().mockResolvedValue('模拟Ai发送消息'),
    callLLM: vi.fn().mockResolvedValue('模拟Ai发送消息')
}))

describe('LLM Router', () => {
    it('调用大模型成功', async () => {
        const res = await request(app).post('/llm/deepseek').send({ prompt: 'test prompt' })
        expect(res.status).toBe(200)
        expect(res.body.data).toBe('模拟Ai发送消息')
    })
})

import { it, expect, describe, afterEach, vi } from 'vitest';

import { callLLM, callDeepSeek } from './index';

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('测试调用chatGpt大模型api', () => {
    it('成功：返回大模型回复', async () => {

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ text: '我是测试ai回复' }] }) }))
        const result = await callLLM('你好');
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(result).toBe('我是测试ai回复');
    })
    it('失败：大模型返回非 200 时抛错', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
        // 模拟 429 限流：响应正常返回，但 ok: false
        await expect(callLLM('你好')).rejects.toThrow('LLM 调用失败')
    })

    it('网络错误：fetch 本身拒绝时抛错', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
        await expect(callLLM('你好')).rejects.toThrow('network error')
    })

});
describe('测试调用DeepSeek大模型api', () => {
    it('成功：返回大模型回复', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ text: '我是测试ai回复' }] }) }))
        const result = await callDeepSeek('你好');
        expect(result).toBe('我是测试ai回复');
    })
    it('失败：大模型返回非 200 时抛错', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
        // 模拟 429 限流：响应正常返回，但 ok: false
        await expect(callDeepSeek('你好')).rejects.toThrow('DeepSeek 调用失败')
    })
    it('网络错误：fetch 本身拒绝时抛错', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
        await expect(callDeepSeek('你好')).rejects.toThrow('network error')
    })
});

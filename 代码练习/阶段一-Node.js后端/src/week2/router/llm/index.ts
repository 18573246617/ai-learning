import { Router } from 'express'
import { callLLM, callDeepSeek } from '../../service/llm'

export const llmRouter = Router()

llmRouter.post('/chatgpt', async (req, res, next) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: '参数错误' })
        }
        const result = await callLLM(prompt as string)
        res.json({ message: 'success', data: result })
    } catch (error) {
        next(error)
    }
})

llmRouter.post('/deepseek', async (req, res, next) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: '参数错误' })
        }
        const result = await callDeepSeek(prompt as string)
        res.json({ message: 'success', data: result })
    } catch (error) {
        next(error)
    }
})


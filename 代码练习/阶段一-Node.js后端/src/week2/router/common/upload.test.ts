import { it, expect, describe } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app'

const app = createApp()

describe('upload 模块', () => {
    it('POST /common/upload 上传图片成功', async () => {
        const res = await request(app)
            .post('/common/upload')
            .field('caption', '测试图片')
            .attach('file', Buffer.from('fake image content'), { filename: 'test.png', contentType: 'image/png' })
        expect(res.status).toBe(200)
        expect(res.body.code).toBe(0)
        expect(res.body.data.originalname).toBe('test.png')
        expect(res.body.data.mimetype).toBe('image/png')
        expect(res.body.data.filename).toMatch(/\.png$/)   // 服务器生成的随机文件名
        expect(res.body.data.caption).toBe('测试图片')
        expect(res.body.data.url).toBe(`/uploads/${res.body.data.filename}`)
    })

    it('不传文件返回 400', async () => {
        const res = await request(app).post('/common/upload')
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('没有收到文件')
    })
})

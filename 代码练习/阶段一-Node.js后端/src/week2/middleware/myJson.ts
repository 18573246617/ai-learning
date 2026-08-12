import { type Request, type Response, type NextFunction } from 'express'

//自定义请求参数json格式化中间件
export const myJson = (req: Request, res: Response, next: NextFunction) => {
    //判断请求体是否是JSON格式
    if (!req.is('application/json')) {
        // 不是 JSON，跳过
        return next() 
    }
    //由于请求体不是一次性返回的，需要监听请求体的事件
    let chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => { 
       chunks.push(chunk)
    })

    //监听是否完成了
    req.on('end', () => { 
        const raw = Buffer.concat(chunks).toString()
        try {
            req.body = raw ? JSON.parse(raw) : {}
        } catch {
            // JSON 格式错误，返回 400
            res.status(400).json({ message: '请求体 JSON 格式错误' })
            return
        }
        next()  
    })
 }
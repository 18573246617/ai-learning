import express, { type Request, type Response, type Express } from "express"
import helmet from "helmet"
import { rateLimit } from 'express-rate-limit'
import cors from "cors"
import { errorHandler } from "./middleware/errorHandler.js"
import { checkAuth } from "./middleware/checkAuth.js"
import { logger } from "./middleware/logger.js"
import { taskRouter } from "./router/tasks/index.js"
import { authRouter } from "./router/auth/index.js"
import { llmRouter } from "./router/llm/index.js"
import { uploadRouter } from "./router/common/upload.js"
const originList = process.env.ORIGIN ? process.env.ORIGIN.split(",").map((o) => new URL(o)) : []

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    limit: 100, // 每个 IP 每分钟最多请求 100 次
    // max: 100, // 每个 IP 每分钟最多请求 100 次 已废弃
    standardHeaders: 'draft-8', // 在响应头暴露 RateLimit-Limit / RateLimit-Remaining 等标准头
    legacyHeaders: false,   // 关掉旧版 X-RateLimit-* 头
    message: {
        message: "请求过于频繁，请稍后再试",
        data: null
    }
})
export function createApp() {

    const app: Express = express()

    // 限流中间件
    app.use(limiter)

    //中间键 解析请求体 JSON → req.body，相当于解析前端的请求参数
    app.use(express.json())

    //"helmet 是 Express 的安全中间件，通过设置响应头提升安全性，
    // 比如 X-Content-Type-Options: nosniff 防止浏览器 MIME 
    // 嗅探导致恶意文件被执行，X-Frame-Options 防止页面被 iframe 
    // 嵌入造成点击劫持，HSTS 强制浏览器走 HTTPS。其中 CSP 功能最
    // 强但配置成本也最高，需要按项目实际资源来源白名单化。"
    app.use(helmet())

    // app.use(myJson)//自定义中间件 解析请求体

    //跨域中间件

    app.use(cors({
        origin(origin: any, cb) {
            // origin 本身就是 "协议://域名:端口" 字符串，直接字符串比较即可
            if (!origin || originList.includes(origin)) {
                cb(null, true)
            } else {
                cb(new Error('不允许的跨域来源'))
            }
        },
        credentials: true,
    }))


    //日志中间件
    app.use(logger)

    //登录模块
    app.use('/auth', authRouter)

    //登录验证中间件
    // app.use(checkAuth)

    app.use('/tasks', taskRouter)

    //通用模块
    app.use('/common', uploadRouter)

    //语言模型模块
    app.use('/llm', llmRouter)

    //不需要使用 new URL() 获取路径 if (url.pathname === '/api')
    app.get('/', (req: Request, res: Response) => {
        //这里不需要通过new URL() 获取路径、查询参数和参数，内置已经处理了
        const { path, query, params, body } = req
        //请求体	POST / PUT 的 body	req.body	{ title: "学Express" }
        // 查询参数	URL ? 后面	req.query / tasks ? completed = true
        // 路径参数	URL 路径里	req.params / tasks / 1 → req.params.id = "1"

        // res.send('Hello World!')

        // 状态码 200 ✓  Content-Type: application/json ✓  JSON序列化 ✓  res.end() ✓
        res.json({
            path,
            query,
            params,
            msg: 'res.json'
        })
    })
    //在控制台测试 curl.exe - X  POST  http://localhost:1300/test/james?name=james
    app.post('/test/:name', (req: Request, res: Response) => {
        res.json({
            params: req.params,//取路径参数
            query: req.query,//取?后的参数
            body: req.body,//取请求体的参数
        })
    })

    // 健康检查
    app.get('/healthz', (req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' })
    })

    // 错误处理：必须放在所有路由之后
    app.use(errorHandler)
    return app
}

//原生写法
// import { createServer } from 'http'
// const server= createServer((req, res) => {
//   res.statusCode = 200
//   res.setHeader('Content-Type', 'text/plain; charset=utf-8;application/json')
//   res.end('Hello World\n')
// })
// server.listen(port, () => {
//   console.log(`服务已启动: http://localhost:${port}`)
// })
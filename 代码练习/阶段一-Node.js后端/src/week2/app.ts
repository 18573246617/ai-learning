import express, { type Request, type Response, type Express } from "express"
import { errorHandler } from "./middleware/errorHandler"
import { checkAuth } from "./middleware/checkAuth"
import { logger } from "./middleware/logger"
import { taskRouter } from "./router/tasks"
import { authRouter } from "./router/auth"

export function createApp() {

    const app: Express = express()

    //中间键 解析请求体 JSON → req.body，相当于解析前端的请求参数
    app.use(express.json())

    // app.use(myJson)//自定义中间件 解析请求体

    //日志中间件
    app.use(logger)

    //登录模块
    app.use('/auth', authRouter)

    //登录验证中间件
    app.use(checkAuth)

    app.use('/tasks', taskRouter)


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
import { createServer } from 'node:http'

const server = createServer((req,res)=>{

    const url = new URL(req.url ?? '/', 'http://localhost:3001')

    console.log(res.headersSent)  // false — 头还没发

    // 监听请求体数据
    req.on('data', (chunk) => {
        console.log(chunk.toString())
    })

    req.on('end', () => {
        console.log('请求体数据接收完毕')
    })

    req.on('error', (err) => {
        console.error('请求体数据接收错误', err)
    })
    res.on('close', () => {
        console.log('响应完成')
    })

    res.statusCode = 200
    // 设置单个响应头
    res.setHeader('Content-Type', 'text/plain')
    //设置状态码和多个响应头
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'
    })

    if (url.pathname == '/api') {
        return res.end(JSON.stringify({
            data: { title: '路径不一样' },
            message: '响应成功'
        }))
    }


    // res.getHeader('Content-Type')
    // res.hasHeader('Content-Type')
    // res.deleteHeader('Content-Type')
    res.end(JSON.stringify({
        data: 'Hello World!',
        message: '响应成功1'
    }))
}) 
server.listen(3001,()=>{
  console.log("服务已启动: http://localhost:3001")

})


//练习:
const server2 = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost:3002')
     

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.getHeader('Content-Type')
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8'
    })
    if (url.pathname == '/api') { 
        res.end(JSON.stringify({
            data: '练习-路径不同返回不同的',
            message: '响应成功'
        }))
    }

    res.end(JSON.stringify({
        data: '练习',
        message: '响应成功'
    }))

})

server2.listen(3002, () => {
    console.log("服务已启动: http://localhost:3002")
})


//注意 ：
// const url = new URL('https://user:pass@example.com:8080/path/to/page?id=1&name=test#section');

// url.protocol  // "https:"
// url.username  // "user"
// url.password  // "pass"
// url.hostname  // "example.com"
// url.port      // "8080"
// url.pathname  // "/path/to/page"
// url.search    // "?id=1&name=test"
// url.hash      // "#section"
// url.origin    // "https://example.com:8080"
// url.href      // 完整URL字符串
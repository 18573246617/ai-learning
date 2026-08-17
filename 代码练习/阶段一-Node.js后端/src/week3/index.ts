import { readFile, writeFile, appendFile, copyFile, stat, open, mkdir, rename, readdir } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { join, extname } from 'node:path'
import { parse } from 'yaml'
import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import { createHash, randomBytes } from 'node:crypto'

//### 1.readFilex学习-直接夺取文件内所有内容并且返回
async function xueReadFile() {

    // import.meta.dirname = src/week3
    // 向上跳一级 .. → src，再进入 week2 → src/week2/data.txt
    const txtFilePath = join(import.meta.dirname, '自动创建的文件夹', 'data.txt')
    //1.读取txt文件
    const data = await readFile(txtFilePath, 'utf-8')
    console.log(data, '//data.txt')

    // src/week3 → .. → src → .. → 项目根目录，tsconfig.json 在根目录
    const tsconfigPath = join(import.meta.dirname, '..', '..', 'tsconfig.json')
    // import.meta.dirname = src/week3指向当前文件夹里

    //2.读取json文件
    const tsconfig = await readFile(tsconfigPath, 'utf-8')
    console.log(tsconfig, '//tsconfig.json')

    //3.读取yml
    const ymlPath = join(import.meta.dirname, '..', '..', 'config.yml')

    // readFile 读出来的是字符串，parse() 把 YAML 文本解析成 JS 对象
    const ymlData = parse(await readFile(ymlPath, 'utf-8'))
    console.log(ymlData, '//config.yml')

    // 解析后就能按层级访问配置了
    console.log(ymlData.dev.APPID, '//APPID')
    console.log(ymlData.dev.HOST, '//HOST')

}
// xueReadFile()

//### 2.createReadStream学习- 创建可读流
async function xueCreateReadStream() {

    const app: Express = express()

    const downloadPath = join(import.meta.dirname, '自动创建的文件夹', 'fake.exe')

    app.use(express.json())
    app.get('/download', (req, res) => {


        const stream = createReadStream(downloadPath)

        // 底层原生写法（write/pipe）不会自动设置请求头，需手动设置：
        // Content-Type 告诉浏览器这是二进制，Content-Disposition 触发下载
        // res.setHeader('Content-Type', 'application/octet-stream')
        // res.setHeader('Content-Disposition', 'attachment; filename="fake.exe"')
        //写法1：原生写法 - 改造版：边读边发/或者一次性发送
        let count = 0
        let chunks: Buffer[] = []
        stream.on('data', (chunk: Buffer) => {
            count++
            // chunks.push(chunk)
            res.write(chunk) // 每读到一块，立刻发给客户端
        })

        stream.on('end', () => {
            console.log('总共发送了', count, '块')

            res.end() // 读完了，结束响应
        })

        //写法2：写法1：原生写法 pipe， // 边读边发
        // stream.pipe(res)

        //写法3：express写法
        res.download(downloadPath, 'fake.exe')
    })

    app.listen(1300, () => {
        console.log('第三周服务启动！！！')
    })

}
// xueCreateReadStream()

// ### 3.writeFile 学习
async function xueWriteFile() {
    // 1. mkdir 创建文件夹：recursive:true 已存在也不报错；需 await
    const dirPath = join(import.meta.dirname, '自动创建的文件夹')
    await mkdir(dirPath, { recursive: true })

    // 2. writeFile 在文件夹里创建文件（writeFile 不自动建父目录，所以要先用 mkdir）
    const filePath = join(dirPath, '自动创建的文本.txt')
    await writeFile(filePath, '调用后修改数据')

    // 3. appendFile 追加写：文件不存在会自动新建，存在则末尾追加
    await appendFile(filePath, '/调用后追加的数据')

    // 4. 复制文件：copyFile 源保留。源用刚创建的文件（每次运行都会重建，可重复跑）
    const copyPath = join(import.meta.dirname, '复制后的文本.txt')
    await copyFile(filePath, copyPath)

    // 5. 移动文件位置：rename 源必须存在。把刚复制的副本移进文件夹（源每次刚生成，可重复跑）
    await rename(copyPath, join(dirPath, '移动位置后的副本.txt'))
    console.log('移动成功')

    // 6. 读取文件夹，将除了 ts 格式的文件移动到别处
    const entries = await readdir(import.meta.dirname, { withFileTypes: true })
    for (const entry of entries) {
        // entry.name 只是文件名，必须 join 上脚本目录才能定位（相对路径是相对 CWD 的！）
        const entryPath = join(import.meta.dirname, entry.name)

        // 获取文件扩展名并转小写
        const ext = extname(entry.name).toLowerCase()
        // 获取文件信息
        const stats = await stat(entryPath)

        console.log(ext, '文件格式')
        // console.log(stats.size, '字节', stats.isDirectory() ? '[目录]' : '[文件]')

        // 只移动「文件」且「不是 .ts」的条目；目录（如 自动创建的文件夹）不动！
        if (entry.isFile() && ext !== '.ts') {
            await rename(entryPath, join(dirPath, entry.name))
            console.log(`已移动：${entry.name}`)
        }
    }

    // 7.pipe：把两个流接起来
    const readStream = createReadStream(filePath)
    const writeStream = createWriteStream(join(dirPath, '使用pipe复制的文本.txt'))
    readStream.pipe(writeStream)

    // 原生写法
    // readStream.on('data', (chunk: Buffer) => {
    //     console.log(chunk.length, '字节')

    //     appendFile(join(dirPath, '使用pipe复制的文本.txt'), chunk, 'utf-8')
    //     console.log(chunk.length, '字节')
    // })
    // readStream.on('end', () => {
    //     console.log('复制完成')
    // })

}
// xueWriteFile()

// ### 本周练习
async function week3Exercise() {
    const app: Express = express()
    app.use(express.json())

    app.get('/events', (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Content-Type', 'text/event-stream')
        res.flushHeaders()
        const stream = createReadStream(join(import.meta.dirname, '自动创建的文件夹', 'events.txt'))

        stream.pipe(res) //等于下面的写法


        //原生写法
        // stream.on('data', (chunk: Buffer) => {
        //     res.write(chunk)
        // })

        // stream.on('end', () => {
        //     res.end()
        // })

        const intervalId = setInterval(() => {
            res.write(`data: ${new Date().toISOString()}\n\n`)
        }, 1000)

        res.on('close', () => {
            clearInterval(intervalId)
        })

    })

    // 读取环境变量 PORT（.env 文件提供），默认 1300；环境变量是字符串，要转成数字
    const port = Number(process.env.PORT)
    app.listen(port, () => {
        console.log('端口', process.env.PORT);

        console.log(`第三周服务启动！！！ http://localhost:${port}`)
    })
}
// week3Exercise()

// ### 4.crypto 学习
async function xueCryto() {

    const hash1 = createHash('sha256').update('密码123').digest('hex')
    const hash2 = createHash('sha256').update('密码123').digest('hex')
    console.log(hash1 === hash2);


    // - 生成一个 32 位随机 hex 字符串

    const string = randomBytes(16).toString('hex')

    const token1 = createHash('sha256').update(string).digest('hex')
    const token2 = createHash('sha256').update(string).digest('hex')
    console.log(string, '32 位随机 hex', token1 == token2);
}

xueCryto()
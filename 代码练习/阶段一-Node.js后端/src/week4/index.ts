import express, { type Request, type Response, type Express } from "express"
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import bcrypt from 'bcrypt'
import pino from 'pino'

const app: Express = express()
const logger = pino()
app.use(express.json())


//1.bcrypt学习

// 注册：哈希后存储（10 是"工作因子"，越大越慢越安全，10 是常用值）
const hash = await bcrypt.hash('密码123', 10)
const hash2 = await bcrypt.hash('密码123', 10)
console.log(hash, hash2);

// 登录：明文和库里哈希比对，返回 true/false
const isMatch = await bcrypt.compare('密码123', hash)
console.log(isMatch, '密码匹配结果');



// 2. JWT：签发与校验
// 校验：成功返回 payload，失败（过期/被篡改）抛异常
try {
    const JWT_SECRET = process.env.JWT_SECRET!
    const token = jwt.sign({ userName: 'james' }, JWT_SECRET, { expiresIn: '8h' })

    logger.info({ token }, 'jwt生成的token');
    const payLoad = jwt.verify(token, JWT_SECRET)
    logger.info(payLoad, '使用jwt校验token通过');
} catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        logger.error('token已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
        logger.error('token被篡改或签名不符');
    } else {
        logger.error(error, '其他错误');
    }

}


app.listen(process.env.PORT, () => {
    console.log("第四周学习 服务已启动！！！http://localhost:" + process.env.PORT)
})

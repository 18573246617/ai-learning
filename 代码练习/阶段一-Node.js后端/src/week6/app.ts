import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';
import checkAuth from './middleware/checkAuth.js';
import authRouter from './routes/auth/index.js';
import llmRouter from './routes/llm/index.js';
import tasksRouter from './routes/tasks/index.js';
import uploadRouter from './routes/upload/index.js';
import { config } from './config/index.js';
import { fail, ok } from './utils/response.js';


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    limit: 100, // 每个 IP 每 15 分钟最多 100 次请求
    standardHeaders: 'draft-8', // 在响应头暴露 RateLimit-* 标准头
    legacyHeaders: false,
    message: fail('TOO_MANY_REQUESTS', '请求过于频繁，请稍后再试'),
});

const createApp = () => {
    const app: Express = express();

    // 解析 JSON 请求体
    app.use(express.json());

    // 安全头，提升应用安全性
    app.use(helmet());

    // 跨域资源共享，允许跨域请求
    app.use(cors({ origin: config.corsOrigins, credentials: true }));

    // 限制请求频率
    app.use(limiter);

    // 健康检查：负载均衡 / 容器编排探活用
    app.get('/health', (req, res) => {
        res.json(ok({ status: 'up' }, '服务正常'));
    });

    // 全局鉴权：白名单（/health、/auth/login、/auth/register）放行，其余接口都需要 Token
    app.use(checkAuth);

    // 业务路由
    app.use('/auth', authRouter);

    app.use('/upload', uploadRouter);

    app.use('/tasks', tasksRouter);

    app.use('/llm', llmRouter);

    // 404 兜底：匹配不到任何路由时返回统一格式
    app.use((req, res) => {
        res.status(404).json(fail('NOT_FOUND', '接口不存在'));
    });

    // 错误处理中间件（必须最后注册）
    app.use(errorHandler);

    return app;
};
export { createApp };

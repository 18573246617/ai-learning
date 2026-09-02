import pino from 'pino';

// 全项目共用同一个 logger 实例（errorHandler / index 入口），避免重复创建
// 开发环境用 pino-pretty 美化输出；生产环境可通过 NODE_ENV 切换为 JSON 日志
const isProd = process.env.NODE_ENV === 'production';

export const logger = pino(
    isProd
        ? {}
        : {
            transport: { target: 'pino-pretty', options: { colorize: true } },
        },
);

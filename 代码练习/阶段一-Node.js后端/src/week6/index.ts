import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, () => {
    logger.info(`服务已启动：http://localhost:${config.port}`);
});

// 优雅退出：收到退出信号后停止接收新连接，处理完存量请求再退出
const shutdown = () => {
    logger.info('收到退出信号，正在关闭服务...');
    server.close(() => {
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
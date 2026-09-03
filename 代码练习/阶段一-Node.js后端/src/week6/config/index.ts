import { z } from 'zod';
import { logger } from '../utils/logger.js';


const envSchema = z.object({
    PORT: z.coerce.number().default(1300),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET 必须配置且至少 32 位'),
    CORS_ORIGINS: z.string().default(''),
    // LLM 密钥可选且容忍空字符串：未配置时服务仍可启动，调用 llm 接口时再明确报错
    OPENAI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // fail fast：配置错了就别启动，而不是等登录接口 500 才发现
    logger.error('环境变量配置错误:' + parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const config = {
    port: parsed.data.PORT,
    jwtSecret: parsed.data.JWT_SECRET,
    corsOrigins: parsed.data.CORS_ORIGINS.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    openaiApiKey: parsed.data.OPENAI_API_KEY,
};

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// tsconfig 里的 @/* → src/* 只对 tsc 生效；vitest 走 Vite 的解析，需要在这里再配一次。
// 不配的话，测试一 import app 就会报 "Cannot find package '@/week6/...'"。
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        // 集成测试打真库：文件串行，避免多个测试文件同时写同一个库
        fileParallelism: false,
        // 沙箱/CI 里 forks pool 需要 spawn 子进程，改成线程池更稳
        pool: 'threads',
    },
});

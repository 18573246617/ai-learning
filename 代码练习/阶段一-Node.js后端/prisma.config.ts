import path from 'node:path'

// 加载项目自定义的 env 文件（Prisma 7 起连接 URL 在这里管理，不再写进 schema.prisma）
// 用 Node 内置的 process.loadEnvFile，免装 dotenv（Node 20.6+ 支持）
process.loadEnvFile(path.join(import.meta.dirname, 'env', '.env.development'))

export default {
    schema: path.join(import.meta.dirname, 'src', 'week6', 'prisma', 'schema'),
    // schema 改成目录后，migrations 默认找 schema/migrations，显式指回原来的位置
    migrations: {
        path: path.join(import.meta.dirname, 'src', 'week6', 'prisma', 'migrations'),
        // seed 脚本：pnpm prisma db seed 会执行它；migrate dev / migrate reset 后也会自动跑
        // 带上 --env-file 让脚本进程能读到 DATABASE_URL（与业务启动方式一致）
        seed: 'tsx --env-file=env/.env.development src/week6/prisma/seed.ts',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
}

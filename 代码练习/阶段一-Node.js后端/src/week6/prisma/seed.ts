// seed 脚本：往数据库灌初始 / 测试数据
// 运行：pnpm prisma db seed （配置见 prisma.config.ts 的 migrations.seed）
//       migrate dev / migrate reset 之后也会自动触发
//
// 幂等策略：
// - 用户、标签有唯一业务键（username / name），用 upsert，反复跑不重复
// - 任务没有唯一业务键，先 deleteMany 再 create（task_tags 靠外键级联一起清掉）
// - 整个流程包在事务里：要么全部成功，要么全部回滚，不会留下"任务被清空但没重建"的中间状态
//
// ⚠️ 仅用于本地开发 / 测试：会清空 tasks 表
import bcrypt from 'bcrypt'

import { prisma } from '../db/prisma'

// 三个种子用户的统一密码，方便本地登录调试（仅开发环境）
const SEED_PASSWORD = 'password123'

const seedUsers = [
    { username: 'alice', nickname: '小艾', email: 'alice@example.com' },
    { username: 'bob', nickname: '小鲍', email: 'bob@example.com' },
    { username: 'charlie', nickname: null, email: 'charlie@example.com' },
]

const seedTags = [
    { name: 'work', description: '工作任务' },
    { name: 'life', description: '生活琐事' },
    { name: 'study', description: '学习计划' },
]

const seedTasks: Record<string, { title: string; completed: boolean; tags: string[] }[]> = {
    alice: [
        { title: '写周报', completed: false, tags: ['work'] },
        { title: '买菜', completed: true, tags: ['life'] },
        { title: '复习 Prisma', completed: false, tags: ['study', 'work'] },
    ],
    bob: [
        { title: '修 bug', completed: true, tags: ['work'] },
        { title: '健身', completed: false, tags: ['life'] },
    ],
    // charlie 故意零任务：给第 10 周"我的任务"和反连接查询留测试数据
    charlie: [],
}

async function main() {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

    await prisma.$transaction(async (tx) => {
        // 这里的循环不违反 N+1 规范（第 10 周 §6）：那条规范针对"请求热路径上的查询"，
        // 而 seed 是一次性写入脚本，条数固定（3 用户 / 3 标签 / 5 任务），且存在依赖链
        // （task 的 userId、taskTags 的 tag 都来自上一步结果）。Prisma 也没有 upsertMany，
        // createMany 又不支持嵌套关系，所以循环是合理例外。
        // 边界：数据涨到几千条会撞上交互式事务 5s 超时（§5.3），那时才需要改批量写法。
        const userIds = new Map<string, bigint>()

        for (const user of seedUsers) {
            const saved = await tx.users.upsert({
                where: { username: user.username },
                // 种子数据保持确定性：昵称 / 邮箱 / 密码每次对齐到脚本里的值
                update: {
                    nickname: user.nickname,
                    email: user.email,
                    passwordHash,
                },
                create: {
                    username: user.username,
                    nickname: user.nickname,
                    email: user.email,
                    passwordHash,
                },
            })
            userIds.set(saved.username, saved.id)
        }

        for (const tag of seedTags) {
            await tx.tags.upsert({
                where: { name: tag.name },
                update: { description: tag.description },
                create: tag,
            })
        }

        await tx.tasks.deleteMany()

        for (const [username, tasks] of Object.entries(seedTasks)) {
            const userId = userIds.get(username)
            if (!userId) {
                throw new Error(`seed 用户不存在：${username}`)
            }

            for (const task of tasks) {
                await tx.tasks.create({
                    data: {
                        // 用关系连接而不是裸 userId：更明确地表达"任务属于这个用户"
                        user: { connect: { id: userId } },
                        title: task.title,
                        completed: task.completed,
                        taskTags: {
                            create: task.tags.map((name) => ({
                                tag: { connect: { name } },
                            })),
                        },
                    },
                })
            }
        }
    })

    const taskCount = Object.values(seedTasks).reduce((sum, tasks) => sum + tasks.length, 0)
    console.log(
        `✅ seed 完成：${seedUsers.length} 用户 / ${seedTags.length} 标签 / ${taskCount} 任务（密码：${SEED_PASSWORD}）`,
    )
}

main()
    .catch((e) => {
        console.error('❌ seed 失败:', e)
        process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())

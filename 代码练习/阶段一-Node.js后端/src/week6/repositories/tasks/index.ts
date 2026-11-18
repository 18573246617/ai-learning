import { Prisma } from '../../prisma/generated/prisma/client'

import { prisma } from '../../db/prisma'
import { AppError } from '../../utils/errors.js'

// 归属作用域：凡是"按用户隔离"的读写都必须带 userId。
// 少传一个字段编译就报错，从类型上堵住"忘了过滤 userId → 操作到别人数据"的越权事故。
type OwnerScope = { userId: bigint }
type TaskScope = OwnerScope & { id: bigint }

// 列表返回的业务形状：tags 在 repository 内压平，
// 中间表结构（taskTags: [{ tag: { name } }]）不泄给 service / controller
export type TaskListItem = {
    id: bigint
    title: string
    completed: boolean
    createdAt: Date
    updatedAt: Date
    tags: string[]
}

const taskListSelect = {
    id: true,
    title: true,
    completed: true,
    createdAt: true,
    updatedAt: true,
    taskTags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.TasksSelect

// 压平：[{ tag: { name } }] → string[]；排序保证同一任务每次返回顺序一致。
// 必须只此一处：list / mine 共用，否则两边返回形状会漂移
const flattenTags = (rows: Prisma.TasksGetPayload<{ select: typeof taskListSelect }>[]): TaskListItem[] =>
    rows.map(({ taskTags, ...task }) => ({
        ...task,
        tags: taskTags.map(({ tag }) => tag.name).sort(),
    }))

// P2025 = 要操作的行不存在。
// 因为下面所有写操作都带 scope（id + userId），"不是你的任务"和"不存在"走同一个错误，
// 统一翻成 404 而不是 403——403 会泄露"这个 id 存在，只是不属于你"。
const notFound = (error: unknown): never => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError(404, 'TASK_NOT_FOUND', '任务不存在')
    }
    throw error
}

const tasksRepositories = {
    // findManyArgs / countArgs 由 service 组装业务口径；
    // userId 由 scope 强制注入，service 不需要（也不应该）自己拼进 where
    list: async (scope: OwnerScope, findManyArgs: Prisma.TasksFindManyArgs, countArgs: Prisma.TasksCountArgs) => {
        const [total, rows] = await prisma.$transaction([
            prisma.tasks.count({ ...countArgs, where: { ...countArgs.where, userId: scope.userId } }),
            prisma.tasks.findMany({
                ...findManyArgs,
                where: { ...findManyArgs.where, userId: scope.userId },
                select: taskListSelect,
            }),
        ])

        // 压平：[{ tag: { name } }] → string[]；排序保证同一任务每次返回顺序一致
        return { total, items: flattenTags(rows) }
    },
    // mine 与 list 的“查 + 压平”完全同构，只是分页方式（cursor）不同，
    // 直接复用避免两处返回形状不一致，也保证 userId 一定被注入（防越权）
    mine: (scope: OwnerScope, findManyArgs: Prisma.TasksFindManyArgs, countArgs: Prisma.TasksCountArgs) =>
        tasksRepositories.list(scope, findManyArgs, countArgs),


    // userId 由 scope 注入，所以 data 里 Omit 掉 userId，避免两处 userId 不一致
    add: (scope: OwnerScope, data: Omit<Prisma.TasksUncheckedCreateInput, 'userId'>) =>
        prisma.tasks.create({ data: { ...data, userId: scope.userId } }),

    // id 是唯一锚点，userId 是附加条件（extended where unique）：
    // 一条语句同时完成"按 id 找"和"必须是你的"，天然防越权
    update: (scope: TaskScope, data: Prisma.TasksUncheckedUpdateInput) =>
        prisma.tasks.update({ where: scope, data }).catch(notFound),

    delete: async (scope: TaskScope) => {
        await prisma.tasks.delete({ where: scope }).catch(notFound)
        return null
    },
}

export default tasksRepositories


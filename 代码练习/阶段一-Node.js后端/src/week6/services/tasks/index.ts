import type { Prisma } from '../../prisma/generated/prisma/client'

import authRepository from '../../repositories/auth/index.js'
import tasksRepositories from '../../repositories/tasks/index.js'
import { AppError } from '../../utils/errors.js'
import type { TaskListQuery, TaskMineQuery } from '../../schemas/tasks/index.js'
// 请求体形状。第 10 周 §7 会用 zod 接管校验，本周先手写最小版本。
export type TaskCreateInput = { title: string; completed?: boolean; tagNames?: string[] }
export type TaskUpdateInput = { title?: string; completed?: boolean }

// 从 token 里的 username 换出 userId。
// userId 永远由服务端决定，绝不接受前端传——否则任何人能往别人名下写任务。
const requireUserId = async (username: string): Promise<bigint> => {
    const user = await authRepository.findUser(username)
    if (!user) {
        throw new AppError(401, 'UNAUTHORIZED', '用户不存在')
    }
    return user.id
}

const tasksServices = {
    list: async (username: string, req: TaskListQuery) => {
        const userId = await requireUserId(username)

        // 业务过滤条件由 service 定；userId 由 repository 的 scope 强制注入
        const where: Prisma.TasksWhereInput = {}
        const keyword = req.title?.trim()
        if (keyword) {
            where.title = { contains: keyword, mode: 'insensitive' }
        }
        // "true"/"false" 已在 zod 层转成 boolean，这里只需要判断有没有传
        if (typeof req.completed === 'boolean') {
            where.completed = req.completed
        }
        // taskTags 是 to-many，用 some 表达“至少有一个标签叫 X”
        if (req.tag) {
            where.taskTags = { some: { tag: { name: req.tag } } }
        }

        // skip/take 是分页数值，属于应用层计算
        // page 从 1 开始，第一页不该跳过任何行
        const skip = (req.page - 1) * req.pageSize

        // 显式标注成 TasksFindManyArgs：让对象字面量处在"有上下文类型"的位置，
        // 'desc' 才会按 SortOrder 收窄，而不是被推断成宽泛的 string
        const findManyArgs: Prisma.TasksFindManyArgs = {
            where,
            skip,
            take: req.pageSize,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }
        // total 的统计口径也由 service 定：这里与列表同过滤，不让 repository 替我们做决定
        const countArgs: Prisma.TasksCountArgs = { where }

        const { total, items } = await tasksRepositories.list({ userId }, findManyArgs, countArgs)
        // take 已经限制了返回条数，不能再用 items.length 判断还有没有下一页
        const hasMore = skip + items.length < total

        return {
            items,
            total,
            hasMore,
            page: req.page,
            pageSize: req.pageSize,
        }
    },
    mine: async (username: string, req: TaskMineQuery) => {
        const userId = await requireUserId(username)

        // 过滤条件与 GET /tasks 对齐；userId 仍由 repository 的 scope 强制注入
        const where: Prisma.TasksWhereInput = {}
        if (typeof req.completed === 'boolean') {
            where.completed = req.completed
        }
        if (req.tag) {
            where.taskTags = { some: { tag: { name: req.tag } } }
        }

        // cursor 已在 zod 层转成 bigint；0n 是 falsy，所以只能显式跟 undefined 比，不能写 req.cursor ?
        const cursor = req.cursor
        const findManyArgs: Prisma.TasksFindManyArgs = {
            where,
            // 游标按 id 倒序：id 自增，等价于创建顺序；(user_id, id) 复合索引能同时满足过滤 + 排序。
            // 若要严格按 createdAt 排序，索引要改成 (user_id, created_at, id)。
            skip: cursor === undefined ? 0 : 1,
            take: req.pageSize + 1, // 多取一条判断 hasMore：最后一页刚好满时不会误报
            cursor: cursor === undefined ? undefined : { id: cursor },
            orderBy: { id: 'desc' },
        }

        const countArgs: Prisma.TasksCountArgs = { where }
        const { total, items } = await tasksRepositories.mine({ userId }, findManyArgs, countArgs)
        const hasMore = items.length > req.pageSize

        return {
            items: items.slice(0, req.pageSize),
            total,
            hasMore,
            pageSize: req.pageSize,
        }
    },

    add: async (username: string, input: TaskCreateInput) => {
        const userId = await requireUserId(username)
        // 必须去重：task_tags 主键是 (task_id, tag_id)，同名标签写两次会主键冲突
        const tagNames = [...new Set(input.tagNames ?? [])]

        return tasksRepositories.add(
            { userId },
            {
                title: input.title,
                completed: input.completed ?? false,
                // 嵌套写入：标签不存在时顺带创建，存在则直接关联（一条语句写 tasks + task_tags + tags）
                taskTags: {
                    create: tagNames.map((name) => ({
                        // 中间表 TaskTag 上的关系字段是单数 tag
                        tag: { connectOrCreate: { where: { name }, create: { name } } },
                    })),
                },
            },
        )
    },

    update: async (username: string, id: bigint, input: TaskUpdateInput) => {
        const userId = await requireUserId(username)
        // 只挑允许改的字段：id / userId 不能从请求体进来，否则能改主键、挪归属
        return tasksRepositories.update(
            { id, userId },
            {
                title: input.title,
                completed: input.completed,
            },
        )
    },

    delete: async (username: string, id: bigint) => {
        const userId = await requireUserId(username)
        return tasksRepositories.delete({ id, userId })
    },
}

export default tasksServices

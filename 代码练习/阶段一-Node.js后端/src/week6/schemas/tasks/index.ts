import z from 'zod'
// schemas：coerce + default + 推导类型导出
export const tasksSchema = z.object({
    page: z.coerce.number({ error: '页码必须是数字' }).int('页码必须是整数').min(1, '页码最小为 1').default(1),
    pageSize: z.coerce
        .number({ error: '每页条数必须是数字' })
        .int('每页条数必须是整数')
        .min(1, '每页条数最小为 1')
        .max(100, '每页条数最大为 100')
        .default(10),
    completed: z
        .enum(['true', 'false'], { error: 'completed 只能是 true 或 false' })
        .transform((v) => v === 'true')
        .optional(),
    title: z.string().trim().min(1, '标题不能为空').max(100, '标题最长 100 个字').optional(),
    tag: z.string().trim().min(1, '标签名不能为空').max(50, '标签名最长 50 个字').optional(),
})
export type TaskListQuery = z.infer<typeof tasksSchema>

// 创建任务的请求体：标签只传名字，服务端负责 connectOrCreate（不存在就建）
export const taskCreateSchema = z.object({
    title: z.string({ error: '标题不能为空' }).trim().min(1, '标题不能为空').max(100, '标题最长 100 个字'),
    completed: z.boolean().optional(),
    tagNames: z
        .array(z.string().trim().min(1, '标签名不能为空').max(50, '标签名最长 50 个字'))
        .max(10, '一次最多 10 个标签')
        .optional(),
})
export type TaskCreateBody = z.infer<typeof taskCreateSchema>

// PATCH /tasks/:id：id 只在路径里（controller 用 parseId），body 不再重复传 id。
// 至少给一个字段，避免"空 PATCH"变成合法请求但什么也没改。
// strict：旧客户端如果还在 body 里带 id / tagNames，直接 400，而不是静默忽略。
export const taskUpdateSchema = z
    .object({
        title: z
            .string({ error: '标题不能为空' })
            .trim()
            .min(1, '标题不能为空')
            .max(100, '标题最长 100 个字')
            .optional(),
        completed: z.boolean().optional(),
    })
    .strict()
    .refine((v) => v.title !== undefined || v.completed !== undefined, {
        message: '至少提供一个要修改的字段（title / completed）',
    })
export type TaskUpdateBody = z.infer<typeof taskUpdateSchema>

export const tasksMineSchema = z.object({
    // query 里是字符串，Prisma 的 cursor 要 bigint：先卡格式再转换，
    // 与 utils/request.ts 的 parseId 同一思路（BigInt('') === 0n，脏值不能直接放进去）
    cursor: z
        .string()
        .trim()
        .regex(/^\d+$/, '游标必须是正整数')
        .transform((v) => BigInt(v))
        .optional(),
    pageSize: z.coerce
        .number({ error: '每页条数必须是数字' })
        .int('每页条数必须是整数')
        .min(1, '每页条数最小为 1')
        .max(100, '每页条数最大为 100')
        .default(10),
    // 过滤条件与 GET /tasks 对齐；游标版不提供 page（page 只属于 offset 分页）
    completed: z
        .enum(['true', 'false'], { error: 'completed 只能是 true 或 false' })
        .transform((v) => v === 'true')
        .optional(),
    tag: z.string().trim().min(1, '标签名不能为空').max(50, '标签名最长 50 个字').optional(),
})
// 游标分页的 query 类型：cursor 是 bigint，和 Prisma where unique 对齐
export type TaskMineQuery = z.infer<typeof tasksMineSchema>

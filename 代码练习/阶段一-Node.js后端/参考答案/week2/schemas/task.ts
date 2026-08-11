import { z } from "zod"

const priority = z.enum(["low", "medium", "high"])

// POST /tasks 的请求体
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(100, "标题最长 100 个字"),
  priority: priority.default("medium"),
})

// PUT /tasks/:id 的请求体：字段都可选，但至少要有一个
export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "标题不能为空").max(100, "标题最长 100 个字").optional(),
    completed: z.boolean().optional(),
    priority: priority.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "至少提供一个要更新的字段",
  })

// 路径参数 :id 在 URL 里永远是字符串，要转成数字
export const taskIdSchema = z.coerce.number().int("id 必须是整数").positive("id 必须是正整数")

// GET /tasks 的查询参数
export const listTasksQuerySchema = z.object({
  completed: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  keyword: z.string().trim().min(1).optional(),
})


import { z } from 'zod';
export const listTasksSchema = z.object({
    completed: z.boolean().optional(),
    keyword:z.string().optional(),
});
  

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, '标题不能为空').max(100, '标题最长 100 个字'),
    completed: z.boolean().default(false),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const taskIdSchema = z.coerce.number().int('ID 必须是整数').positive('ID 必须是正数')


export const updateTaskSchema = z.object({
    title: z.string().trim().min(1, '标题不能为空').max(100, '标题最长 100 个字').optional(),
    priority:z.enum(['low', 'medium', 'high']).optional(),
}).refine((data)=>Object.keys(data).length > 0, { message: '至少提供一个要更新的字段' })




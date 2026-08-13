
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



// 第 1 题：猜输出（基础）
// const s = z.string().min(1)

// console.log(s.safeParse("").success)   // ① 输出什么？ false
// console.log(s.safeParse("a").success)  // ② 输出什么？ true
// ❌ console.log(s.safeParse(123).success)  // ③ 输出什么？  true


// // 第 2 题：猜输出（coerce）
// const s = z.coerce.number()

// console.log(s.parse("42"))     // ① 输出什么？什么类型？ 42 number
// console.log(s.safeParse("abc")) // ② 结果是什么？  false


// // 第 3 题：猜输出（default vs optional）
// const s1 = z.string().default("默认")
// const s2 = z.string().optional()

// console.log(s1.parse(undefined))  // ① 输出什么？ "默认"
// ❌ console.log(s2.parse(undefined))  // ② 输出什么？ undefined  
// console.log(s2.parse("你好"))     // ③ 输出什么？ "你好"


// // 第 4 题：写 schema（字符串转布尔）
// ❌ 需求：接收 query 参数 completed，"true" 变成 true，"false" 变成 false，不传时是 undefined（可选的）。
// 写出这个 schema。

// const completedSchema = z.string().transform((e) => { 
//     if (e === "true") return true
//     if (e === "false") return false
//     return undefined
// })
// z.enum(["true", "false"]).transform(v => v === "true").optional()


// // 第 5 题：写 schema（refine 自定义规则）
// 需求：更新任务的请求体，title 和 completed 都是可选的，但不能两个都不传（至少要有一个）。
// 写出这个 schema。

// const updataSchema = z.object({
//     title: z.string().min(1).optional(),
//     completed: z.boolean().optional(),
// }).refine((data) => Object.keys(data).length > 0, { message: '至少提供一个要更新的字段' })


// // 第 6 题：猜输出（zod 的隐藏行为，和你的 bug 直接相关）
// const s = z.object({ title: z.string() })

// const r = s.safeParse({ title: "学习", extra: 123 })
// console.log(r.success)  // ① 输出什么？true
// console.log(r.data)     // ② 输出什么？extra 还在吗？ { title: "学习", },不在
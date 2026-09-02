import { z } from 'zod';

const loginSchema = z.object({
    username: z.string().trim().min(1, '用户名不能为空').max(20, '用户名最长 20 个字'),
    password: z.string().trim().min(1, '密码不能为空').max(20, '密码最长 20 个字'),
});

const registerSchema = z.object({
    username: z.string().trim().min(1, '用户名不能为空').max(20, '用户名最长 20 个字'),
    password: z.string().trim().min(1, '密码不能为空').max(20, '密码最长 20 个字'),
});

const authSchema = {
    login: loginSchema,
    register: registerSchema,
};

// 从 schema 推导请求体类型，保证校验规则与 TS 类型单一数据源
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export default authSchema;

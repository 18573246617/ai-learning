import { z } from 'zod';

const chatgptSchema = z.object({
    prompt: z.string().trim().min(1, 'prompt 不能为空'),
});

const llmSchema = {
    chatgpt: chatgptSchema,
};

// 从 schema 推导请求体类型，保证校验规则与 TS 类型单一数据源
export type ChatgptInput = z.infer<typeof chatgptSchema>;
export default llmSchema;

import { config } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';

const llmService = {
    chatgpt: async (prompt: string) => {
        // 密钥统一从 config 获取（项目规范：业务代码禁止直接读 process.env）
        if (!config.openaiApiKey) {
            throw new AppError(500, 'LLM_CONFIG_ERROR', '未配置 OPENAI_API_KEY');
        }

        let response: Response;
        try {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                }),
            });
        } catch {
            // 网络层失败（DNS/断网/超时），fetch 本身 reject
            throw new AppError(502, 'LLM_NETWORK_ERROR', '无法连接大模型服务');
        }

        // 限流 429 单独语义化；其他非 200 统一视为上游异常
        if (response.status === 429) {
            throw new AppError(429, 'LLM_RATE_LIMITED', '大模型调用过于频繁，请稍后再试');
        }
        if (!response.ok) {
            throw new AppError(502, 'LLM_API_ERROR', '大模型服务异常');
        }

        // 数据组装放 service：只提取前端真正需要的内容，不透传 OpenAI 原始结构
        const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new AppError(502, 'LLM_EMPTY_RESPONSE', '大模型未返回有效内容');
        }
        return { content };
    },
};
export default llmService;

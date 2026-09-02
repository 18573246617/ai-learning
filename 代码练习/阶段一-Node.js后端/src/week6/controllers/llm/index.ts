import { type Request, type Response } from 'express';
import { ok } from '../../utils/response';
import llmService from '../../services/llm';
import type { ChatgptInput } from '../../schemas/llm/index.js';

const llmController = {
    chatgpt: async (req: Request<unknown, unknown, ChatgptInput>, res: Response) => {
        const data = await llmService.chatgpt(req.body.prompt);
        res.json(ok(data));
    },
};
export default llmController;

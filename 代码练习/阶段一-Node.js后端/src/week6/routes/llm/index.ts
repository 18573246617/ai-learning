
import { Router } from 'express'
import llmController from '../../controllers/llm';
import llmSchema from '../../schemas/llm/index.js';
import asyncHandler from '../../utils/asyncHandler';
import { validateBody } from '../../middleware/validateBody';

const llmRouter = Router()

llmRouter.post('/chatgpt', validateBody(llmSchema.chatgpt), asyncHandler(llmController.chatgpt));


export default llmRouter
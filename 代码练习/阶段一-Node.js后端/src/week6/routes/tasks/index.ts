import { Router } from 'express';

import tasksControllers from '../../controllers/tasks/index.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { validateBody, validateQuery } from '../../middleware/validateBody';
import { taskCreateSchema, tasksMineSchema, tasksSchema, taskUpdateSchema } from '../../schemas/tasks/index.js';

const tasksRouter = Router();

// REST 风格：资源用名词复数 /tasks，动作交给 HTTP 方法
// 旧的 GET /tasks/list、/tasks/add 靠 body 传参，已废弃
tasksRouter.get('/', validateQuery(tasksSchema), asyncHandler(tasksControllers.list));
tasksRouter.get('/mine', validateQuery(tasksMineSchema), asyncHandler(tasksControllers.mine));

tasksRouter.post('/', validateBody(taskCreateSchema), asyncHandler(tasksControllers.add));

tasksRouter.patch('/:id', validateBody(taskUpdateSchema), asyncHandler(tasksControllers.update));

// DELETE 不带 body：id 从路径拿，controller 里的 parseId 负责格式校验
tasksRouter.delete('/:id', asyncHandler(tasksControllers.delete));



export default tasksRouter;


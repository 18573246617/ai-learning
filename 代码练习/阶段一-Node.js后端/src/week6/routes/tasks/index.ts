import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import tasksControllers from '../../controllers/tasks/index.js';


const tasksRouter = Router();

tasksRouter.get('/list', asyncHandler(tasksControllers.list));
tasksRouter.get('/add', asyncHandler(tasksControllers.add));
tasksRouter.get('/update', asyncHandler(tasksControllers.update));
tasksRouter.get('/delete', asyncHandler(tasksControllers.delete));

export default tasksRouter;

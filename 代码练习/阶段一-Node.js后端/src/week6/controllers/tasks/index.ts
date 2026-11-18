import type { Request, Response } from 'express';

import tasksServices, { type TaskUpdateInput } from '../../services/tasks/index.js';
import { currentUsername, parseId } from '../../utils/request.js';
import { ok } from '../../utils/response.js';
import { TaskCreateBody, TaskListQuery, TaskMineQuery } from '../../schemas/tasks';



const tasksControllers = {
    // GET /tasks?title=xxx  —— 只返回当前用户自己的任务
    list: async (
        req: Request<Record<string, string>, unknown, unknown, TaskListQuery>,
        res: Response,
    ) => {
        const data = await tasksServices.list(currentUsername(req), req.query);
        return res.json(ok(data, '获取任务列表成功'));
    },
    mine: async (
        req: Request<Record<string, string>, unknown, unknown, TaskMineQuery>,
        res: Response,
    ) => {
        const data = await tasksServices.mine(currentUsername(req), req.query);
        return res.json(ok(data, '获取任务列表成功'));
    },
    // POST /tasks  —— 创建类接口返回 201
    add: async (req: Request<Record<string, string>, unknown, TaskCreateBody>, res: Response) => {
        const data = await tasksServices.add(currentUsername(req), req.body);
        return res.status(201).json(ok(data, '创建任务成功'));
    },

    // PATCH /tasks/:id  —— 路径参数是字符串，先 parseId 再进业务层
    update: async (req: Request<{ id: string }, unknown, TaskUpdateInput>, res: Response) => {
        const data = await tasksServices.update(
            currentUsername(req),
            parseId(req.params.id),
            req.body,
        );
        return res.json(ok(data, '更新任务成功'));
    },

    // DELETE /tasks/:id
    delete: async (req: Request<{ id: string }>, res: Response) => {
        const data = await tasksServices.delete(currentUsername(req), parseId(req.params.id));
        return res.json(ok(data, '删除任务成功'));
    },
};

export default tasksControllers;

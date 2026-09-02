
import { type Request, type Response } from 'express';
import { ok } from '../../utils/response.js'

import tasksServices from '../../services/tasks/index.js';
const tasksControllers = {
    list: async (req: Request, res: Response) => {
        const data = await tasksServices.list(req.body);

        return res.json(ok(data));
    },
    add: async (req: Request, res: Response) => {
        const data = await tasksServices.add(req.body);
        return res.json(ok(data));
    },
    update: async (req: Request, res: Response) => {
        const data = await tasksServices.update(req.body);
        return res.json(ok(data));
    },
    delete: async (req: Request, res: Response) => {
        const data = await tasksServices.delete(req.body);
        return res.json(ok(data));
    },
}

export default tasksControllers;

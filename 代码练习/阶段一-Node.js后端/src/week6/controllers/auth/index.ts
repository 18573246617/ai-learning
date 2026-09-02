import type { Request, Response } from 'express';

import authService from '../../services/auth/index.js';
import { ok } from '../../utils/response.js';
import type { LoginInput, RegisterInput } from '../../schemas/auth/index.js';

const authController = {
    login: async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
        // 取参数 → 调 service（抛错就抛，不 try/catch，交给 errorHandler）→ 定响应
        const data = await authService.login(req.body);
        res.json(ok(data, '登录成功'));
    },
    register: async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
        const data = await authService.register(req.body);
        // 创建类接口统一返回 201
        res.status(201).json(ok(data, '注册成功'));
    },
    getUsers: async (req: Request, res: Response) => {
        const data = await authService.userList();
        res.json(ok(data, '获取用户列表成功'));
    },
    getUserByUsername: async (req: Request<{ username: string }>, res: Response) => {
        const data = await authService.userInfo(req.params.username);
        res.json(ok(data, '获取用户信息成功'));
    },
};
export default authController;

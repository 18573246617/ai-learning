import { Router } from 'express';

import validateBody from '../../middleware/validateBody.js';
import asyncHandler from '../../utils/asyncHandler.js';
import authController from '../../controllers/auth/index.js';
import authSchema from '../../schemas/auth/index.js';

const authRouter = Router();

// 路由层只做：路径 + 中间件 + controller，不写任何业务
// RESTful 风格：资源用名词复数 /users，操作由 HTTP 方法表达
// 鉴权由 app.ts 全局挂载的 checkAuth 统一处理，白名单外的接口自动需要 Token
authRouter.post('/login', validateBody(authSchema.login), asyncHandler(authController.login));

authRouter.post('/register', validateBody(authSchema.register), asyncHandler(authController.register));

authRouter.get('/users', asyncHandler(authController.getUsers));

authRouter.get('/users/:username', asyncHandler(authController.getUserByUsername));

export default authRouter;

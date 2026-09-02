import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { PUBLIC_PATHS } from '../config/publicPaths.js';
import { AppError } from '../utils/errors.js';

// 全局鉴权：白名单放行，其余接口统一校验 Token（抛 AppError 由 errorHandler 集中出口）
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (PUBLIC_PATHS.includes(req.path)) {
        return next();
    }

    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
        throw new AppError(401, 'UNAUTHORIZED', '缺少 Token');
    }

    try {
        const payload = jwt.verify(token, config.jwtSecret);
        if (typeof payload === 'string') {
            throw new AppError(401, 'UNAUTHORIZED', 'Token 无效');
        }
        // 与登录时签发的 payload 字段对齐（{ username }）
        req.user = { userName: payload.username };
        next();
    } catch (error) {
        if (error instanceof AppError) throw error;
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError(401, 'TOKEN_EXPIRED', 'Token 已过期');
        }
        throw new AppError(401, 'UNAUTHORIZED', 'Token 无效');
    }
};
export default checkAuth;
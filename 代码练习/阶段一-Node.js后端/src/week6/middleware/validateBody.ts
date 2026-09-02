import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    // ?? {} 兜底：客户端没发 body 时 req.body 是 undefined，转成空对象让 zod 进字段校验
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
        // 统一抛 AppError，让 errorHandler 出口处理，不在中间件里手动 res
        throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0].message);
    }
    next();
};
export default validateBody;

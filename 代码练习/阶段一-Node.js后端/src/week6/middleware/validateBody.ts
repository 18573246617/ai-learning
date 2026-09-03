import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

// 三个校验中间件只差“从 req 取哪块数据”，抽成通用工厂，按数据源区分
// body：请求体   /list 的 { title }
// params：路径参数 /list/:id 的 { id }
// query：查询参数  /list?name=1 的 { name }
type Source = 'body' | 'params' | 'query';

const createValidator = (source: Source) => (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    // ?? {} 兜底：没发 body / 没有 query 时数据是 undefined，转空对象让 zod 进字段校验
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
        // 统一抛 AppError，让 errorHandler 出口处理，不在中间件里手动 res
        throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0].message);
    }
    next();
};

export const validateBody = createValidator('body');
export const validateParams = createValidator('params');
export const validateQuery = createValidator('query');


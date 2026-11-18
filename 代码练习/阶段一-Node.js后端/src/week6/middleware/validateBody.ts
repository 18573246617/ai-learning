import type { Request, RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/errors.js';

// 三个校验中间件只差“从 req 取哪块数据”，抽成通用工厂，按数据源区分
// body：请求体   /list 的 { title }
// params：路径参数 /list/:id 的 { id }
// query：查询参数  /list?name=1 的 { name }
type Source = 'body' | 'params' | 'query';

// 三个校验中间件各自把不同的泛型槽收窄（params/body/query），
// 回写工具只关心“往 req 上盖属性”，所以用全 unknown 的 Request 接住任意一种窄化后的 Request
type ValidatableRequest = Request<unknown, unknown, unknown, unknown>;

// 校验结果必须写回 req：zod 的 coerce / default / trim 只体现在 result.data 上，
// 不写回的话 controller 拿到的还是原始值（req.query.page 运行时是字符串 "2"，
// 类型却标成 number，分页 (page - 1) * pageSize 会算成 NaN）
// 注意：Express 5 的 req.query 是原型上的只读 getter，直接 req.query = data
// 在严格模式下会抛 TypeError，只能用 defineProperty 在实例上盖一个同名属性
const writeBack = (req: ValidatableRequest, source: Source, data: unknown) => {
    Object.defineProperty(req, source, { value: data, writable: true, configurable: true, enumerable: true });
};

const parseOrThrow = <T>(schema: ZodType<T>, input: unknown): T => {
    // ?? {} 兜底：没发 body / 没有 query 时数据是 undefined，转空对象让 zod 进字段校验
    const result = schema.safeParse(input ?? {});
    if (!result.success) {
        // 统一抛 AppError，让 errorHandler 出口处理，不在中间件里手动 res
        throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0].message);
    }
    return result.data;
};

// 返回类型把 schema 的输出类型塞进对应的 RequestHandler 泛型槽：
// 同一条路由链上的 handler 必须兼容同一个 Request<P, ResBody, ReqBody, ReqQuery>，
// 这里只收窄被校验的那一格，controller 的 Request<..., TaskListQuery> 才能和中间件对齐
export const validateBody = <T>(schema: ZodType<T>): RequestHandler<Record<string, string>, unknown, T> =>
    (req, _res, next) => {
        writeBack(req, 'body', parseOrThrow(schema, req.body));
        next();
    };

export const validateParams = <T>(schema: ZodType<T>): RequestHandler<T> =>
    (req, _res, next) => {
        writeBack(req, 'params', parseOrThrow(schema, req.params));
        next();
    };

export const validateQuery = <T>(
    schema: ZodType<T>,
): RequestHandler<Record<string, string>, unknown, unknown, T> =>
    (req, _res, next) => {
        writeBack(req, 'query', parseOrThrow(schema, req.query));
        next();
    };


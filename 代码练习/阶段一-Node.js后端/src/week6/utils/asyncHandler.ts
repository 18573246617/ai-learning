import type { NextFunction, Request, RequestHandler, Response } from 'express';

// 泛型化包装：保留路径参数/请求体的类型信息，避免丢失类型安全
const asyncHandler =
    <
        P = Record<string, string>, // 路径参数，等价于 express 的 ParamsDictionary
        ResBody = unknown,
        ReqBody = unknown,
        ReqQuery = Record<string, string | string[] | undefined>, // 等价于 express 的 ParsedQs
    >(
        fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<unknown>,
    ): RequestHandler<P, ResBody, ReqBody, ReqQuery> =>
        (req, res, next) => {
            fn(req, res, next).catch(next);
        };
export default asyncHandler;


import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../utils/errors.js';
import { fail } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    // 业务错误：按 statusCode/code/message 原样返回（预期内的错误，不记堆栈）
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(fail(err.code, err.message));
    }
    // 参数校验错误（zod）
    if (err instanceof ZodError) {
        return res.status(400).json(fail('VALIDATION_ERROR', err.issues[0].message));
    }
    // 文件上传错误（multer）：字段名不匹配 / 超大小 / 超数量等，映射为 400
    if (err instanceof multer.MulterError) {
        const map: Record<string, string> = {
            LIMIT_FILE_SIZE: '文件大小超出限制',
            LIMIT_FILE_COUNT: '文件数量超出限制',
            LIMIT_UNEXPECTED_FILE: '上传字段名不正确',
            LIMIT_FIELD_COUNT: '字段数量超出限制',
        };
        return res.status(400).json(fail('UPLOAD_ERROR', map[err.code] ?? err.message));
    }
    // 请求体 JSON 解析失败（body-parser 抛出的 SyntaxError，如客户端发了非法 JSON）
    if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
        return res.status(400).json(fail('INVALID_JSON', '请求体不是合法的 JSON'));
    }
    // 未知错误：记堆栈，返回 500；错误详情只进日志，绝不泄露给客户端
    logger.error(err);

    res.status(500).json(fail('INTERNAL_ERROR', '服务器内部错误'));
};

export default errorHandler;

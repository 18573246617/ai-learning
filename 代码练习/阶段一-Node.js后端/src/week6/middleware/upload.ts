import multer from 'multer';
import type { Request } from 'express'
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { AppError } from '../utils/errors.js';



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        mkdirSync('uploads', { recursive: true });
        cb(null, 'uploads/');

    },
    filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        cb(null, randomBytes(16).toString('hex') + ext);
    }
});
const uploadImage = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
        files: 5,
        fields: 5,
        fieldSize: 1024 * 1024 * 5,
        fieldNameSize: 100, // 字段名 ≤ 100 字符
        parts: 20, // 总 parts ≤ 20
    },
    fileFilter: (req, file, cb) => {
        // 按 MIME 类型白名单校验（此前误把 mimetype 与扩展名比较，永远不匹配）
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('文件格式不正确'));
        }
        cb(null, true);
    }
})

export default uploadImage;

export const createUpload = (options?: {
    maxCount?: number // 单次上传最大文件数量
    maxFileSize?: number // 单个文件最大大小
    allowedTypes?: string[] // 允许的文件类型
    limits?: multer.Options['limits'] // 额外限制（可选，覆盖默认）
    fileFilter?: multer.Options['fileFilter'] // 自定义过滤器（可选，覆盖默认）
}) => {
    return multer({
        storage,
        limits: {
            files: options?.maxCount ?? 5,
            fileSize: options?.maxFileSize ?? 5 * 1024 * 1024,
            ...options?.limits,
        },
        fileFilter:
            options?.fileFilter ??
            ((req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
                const allowedTypes = options?.allowedTypes
                // 未配置允许类型时全部放行；回调后必须 return，否则会继续落入下方报错分支
                if (!allowedTypes) {
                    cb(null, true)
                    return
                }
                console.log(22);
                if (allowedTypes && allowedTypes.includes(file.mimetype)) {
                    cb(null, true)
                    console.log(333);
                } else {
                    console.log(44);

                    cb(new AppError(400, 'UPLOAD_ERROR', `文件类型错误,请上传${allowedTypes.join(', ')}格式的文件`))
                }
            }),
    })
}

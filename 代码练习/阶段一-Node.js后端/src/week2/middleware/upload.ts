import multer from "multer"
import type { Request } from "express"
import { mkdirSync } from "node:fs"
import { extname } from "node:path"
import { randomBytes } from "node:crypto"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        mkdirSync("uploads", { recursive: true })
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const ext = extname(file.originalname)
        cb(null, randomBytes(16).toString("hex") + ext)
    },
})

export const createUpload = (options: {
    maxCount?: number,                         // 单次上传最大文件数量
    maxFileSize?: number,                      // 单个文件最大大小
    allowedTypes: string[],                    // 允许的文件类型
    limits?: multer.Options["limits"],         // 额外限制（可选，覆盖默认）
    fileFilter?: multer.Options["fileFilter"], // 自定义过滤器（可选，覆盖默认）
}) => {
    return multer({
        storage,
        limits: {
            files: options.maxCount ?? 5,
            fileSize: options.maxFileSize ?? 5 * 1024 * 1024,
            ...options.limits,
        },
        fileFilter: options.fileFilter ?? ((req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            const allowedTypes = options.allowedTypes
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error(`文件类型错误,请上传${allowedTypes.join(", ")}格式的文件`))
            }
        }),
    })
}



// import type { Request } from "express"
// import multer from "multer"
// import { randomBytes } from "node:crypto"
// import { mkdirSync } from "node:fs"
// import { extname } from "node:path"

// const storage = multer.diskStorage({
//     // 存储位置
//     destination: (req, file, cb) => {
//         //创建文件夹
//         mkdirSync("uploads", { recursive: true })
//         cb(null, "uploads/")
//     },
//     //文件名
//     filename: (req, file, cb) => {
//         const ext = extname(file.originalname)
//         const fileNam = randomBytes(16).toString('hex')
//         cb(null, fileNam + ext)
//     },

// })

// const limits = {
//     fileSize: 2 * 1024 * 1024, // 单文件 ≤ 2MB
//     files: 5, // 单次最多 5 个文件
//     fields: 10, // 非文件字段 ≤ 10 个
//     fieldSize: 512 * 1024, // 非文件字段值 ≤ 512KB
//     fieldNameSize: 100, // 字段名 ≤ 100 字符
//     parts: 20, // 总 parts ≤ 20  
// }
// const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//     if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//         cb(null, true)
//     } else {
//         cb(new Error("文件类型错误"))
//     }
// }

// export const upload = multer({
//     storage,
//     limits,
//     fileFilter,
// })

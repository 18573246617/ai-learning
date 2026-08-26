import { Router, type Request, type Response } from "express"
import { createUpload } from "../../middleware/upload.js"
export const uploadRouter = Router()

const uploadImage = createUpload({
    maxCount: 1,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png"],
})
// uploadImage.array("file", 3)

// ⚠️ 路径注意：app.ts 里已挂 app.use('/upload', uploadRouter)，这里用 '/'，否则会变成 /upload/upload
// upload.single('file') 是中间件：先解析 multipart 请求体，把文件挂到 req.file，再进处理器
uploadRouter.post("/upload", uploadImage.single("file"), (req: Request, res: Response) => {
    // 文件数据在这里取 ↓（single 不管字段名叫什么，结果永远挂 req.file）
    const file = req.file
    // 普通文本字段在这里取 ↓（表单里 caption 之类的字段）multer 只解析 multipart 请求体，非 multipart 时 req.body 为 undefined
    const { caption } = req.body ?? {}

    if (!file) {
        res.status(400).json({ error: "没有收到文件" })
        return
    }

    res.json({
        code: 0,
        data: {
            filename: file.filename,         // 服务器上保存的随机文件名
            originalname: file.originalname, // 用户原始文件名
            mimetype: file.mimetype,
            size: file.size,
            caption,                         // 一起传的文本字段
            url: `/uploads/${file.filename}`, // 访问地址（静态服务需要单独配，见下）
        },
    })
})

export class AppError extends Error {
    constructor(
        public readonly statusCode: number, // HTTP 状态码：400/401/403/404/409/500
        public readonly code: string, // 业务错误码：'USER_NOT_FOUND' 等，前端/排查用
        message: string,
    ) {
        super(message)
        this.name = 'AppError'
    }
}


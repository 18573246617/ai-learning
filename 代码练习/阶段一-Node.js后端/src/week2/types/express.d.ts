declare global {
    namespace Express {
        interface Request {
            // checkAuth 挂的是 jwt.verify 解出的 payload（自包含，不查库）
            user?: {
                userName: string
                iat?: number
                exp?: number
            }
            // express-rate-limit 每次请求都会挂上限流信息（类型对齐官方 RateLimitInfo）
            // 超限提示里用 resetTime 实时计算剩余等待秒数
            rateLimit?: {
                limit: number
                used: number
                remaining: number
                resetTime?: Date
                key: string
            }
        }
    }
}

export {}

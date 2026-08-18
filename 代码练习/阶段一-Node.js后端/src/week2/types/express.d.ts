declare global {
  namespace Express {
    interface Request {
      // checkAuth 挂的是 jwt.verify 解出的 payload（自包含，不查库）
      user?: {
        userName: string
        iat?: number
        exp?: number
      }
    }
  }
}

export { }

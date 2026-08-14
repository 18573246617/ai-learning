import type { User } from "../data/auth"

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export {}

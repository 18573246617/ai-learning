import { PrismaPg } from '@prisma/adapter-pg'
// Prisma 7 的 Client 由 prisma generate 生成到 schema 旁的 generated 目录，
// 不再从 @prisma/client 包直接导入
import { PrismaClient } from '../prisma/generated/prisma/client'

// Prisma 7 必须通过 driver adapter 连接数据库
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })


import { Prisma } from '../../prisma/generated/prisma/client';

import { prisma } from '../../db/prisma';
import { AppError } from '../../utils/errors.js';



// P2002 = 唯一约束冲突。
// 能断言"就是用户名重复"，是因为 users 表上目前只有 username 一个唯一约束
// （email 没有 @unique）。哪天给 email 加了 @unique，这里要改成读 error.meta.target。
// 翻译放在仓库层：service 只该知道"注册失败"，不该知道 Prisma 的错误码长什么样。
const duplicateUsername = (error: unknown): never => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(409, 'USERNAME_ALREADY_EXISTS', '用户名已存在');
    }
    throw error;
};

const authRepository = {
    findUser: (username: string) => {
        return prisma.users.findUnique({
            where: {
                username,
            },
        });
    },

    // 唯一性交给数据库约束：并发两个同名注册，只有一个能插入成功，另一个稳定拿到 409。
    // 不用"先查再插"——那有竞态窗口（第 9 周复盘第 10 题）。
    addUser: (user: Prisma.UsersCreateInput) =>
        prisma.users
            .create({
                data: {
                    username: user.username,
                    email: user.email,
                    passwordHash: user.passwordHash,
                    // 嵌套写入：users → tasks → taskTags → tag，一条语句写三张表
                    tasks: {
                        create: {
                            // Tasks.title 必填（schema 里没有 @default），漏传同样报类型错误
                            title: '注册赠送任务',
                            taskTags: {
                                create: {
                                    // TaskTag 上的关联字段叫 tag（单值关系用单数，to-many 才用复数）
                                    tag: {
                                        // connectOrCreate 必须同时给 where（去找哪个）和 create（找不到时建什么）
                                        connectOrCreate: {
                                            where: { name: 'user' },
                                            create: { name: 'user' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            .catch(duplicateUsername),

    userList: () => {
        return prisma.users.findMany();
    },

    updateUser: async (username: string, passwordHash: string): Promise<boolean> => {
        await prisma.users.update({
            where: {
                username,
            },
            data: {
                passwordHash,
            },
        });
        return true;
    },
};
export default authRepository;

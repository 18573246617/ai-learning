
import authRepository from '../../repositories/auth/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
import { Prisma } from '@/week6/prisma/generated/prisma/client';
import type { LoginInput, RegisterInput } from '../../schemas/auth/index.js';

const authService = {
    login: async (data: LoginInput) => {
        const user = await authRepository.findUser(data.username);

        // 安全惯例：用户不存在和密码错误返回相同提示，防止枚举用户名
        if (!user) {
            throw new AppError(400, 'BAD_CREDENTIALS', '用户名或密码错误');
        }

        const isPasswordMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isPasswordMatch) {
            throw new AppError(400, 'BAD_CREDENTIALS', '用户名或密码错误');
        }

        // JWT 无状态：验签只用 secret，token 不需要落库
        const token = jwt.sign({ username: user.username }, config.jwtSecret, { expiresIn: '8h' });
        return {
            username: user.username,
            token,
        };
    },
    register: async (data: RegisterInput) => {
        // const user = await authRepository.findUser(data.username);
        // if (user) {
        //     throw new AppError(400, 'USERNAME_ALREADY_EXISTS', '用户名已存在');
        // }
        const passwordHash = await bcrypt.hash(data.password, 10);

        try {
            await authRepository.addUser({
                username: data.username,
                email: data.email,
                passwordHash,
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new AppError(409, 'USERNAME_ALREADY_EXISTS', '用户名已存在');
            }
            throw e;
        }

        // 只返回用户公开信息，密码哈希绝不回传客户端
        return { username: data.username };
    },
    userList: async () => {

        const users = await authRepository.userList();
        // BigInt 不能直接 JSON 序列化，id 转成字符串
        return users.map(({ passwordHash, id, ...rest }) => ({
            id: id.toString(),
            ...rest,
        }));
    },
    userInfo: async (username: string) => {
        const user = await authRepository.findUser(username);
        if (!user) {
            throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
        }
        const { passwordHash, id, ...rest } = user;
        return { id: id.toString(), ...rest };
    },

};
export default authService;

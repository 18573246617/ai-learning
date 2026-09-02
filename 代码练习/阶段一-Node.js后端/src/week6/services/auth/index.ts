
import authRepository from '../../repositories/auth/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
import type { LoginInput, RegisterInput } from '../../schemas/auth/index.js';

const authService = {
    login: async (data: LoginInput) => {
        const user = authRepository.findUser(data.username);

        // 安全惯例：用户不存在和密码错误返回相同提示，防止枚举用户名
        if (!user) {
            throw new AppError(400, 'BAD_CREDENTIALS', '用户名或密码错误');
        }

        const isPasswordMatch = await bcrypt.compare(data.password, user.password);
        if (!isPasswordMatch) {
            throw new AppError(400, 'BAD_CREDENTIALS', '用户名或密码错误');
        }

        // 登录成功：签发 JWT
        const token = jwt.sign({ username: user.username }, config.jwtSecret, { expiresIn: '8h' });
        const updated = authRepository.updateUser({ username: user.username, password: user.password, token });
        if (!updated) {
            throw new AppError(500, 'INTERNAL_ERROR', 'Token 保存失败');
        }
        return {
            username: user.username,
            token,
        };
    },
    register: async (data: RegisterInput) => {
        const user = authRepository.findUser(data.username);
        if (user) {
            throw new AppError(400, 'USERNAME_ALREADY_EXISTS', '用户名已存在');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        authRepository.addUser({ username: data.username, password: hashedPassword });
        // 只返回用户公开信息，密码哈希绝不回传客户端
        return { username: data.username };
    },
    userList: async () => {
        return authRepository.userList().map(({ password, ...rest }) => rest);
    },
    userInfo: async (username: string) => {
        const user = authRepository.findUser(username);
        if (!user) {
            throw new AppError(404, 'USER_NOT_FOUND', '用户不存在');
        }
        const { password, ...rest } = user;
        return rest;
    },

};
export default authService;

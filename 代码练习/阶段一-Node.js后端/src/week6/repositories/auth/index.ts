import { prisma } from '@/week6/db/prisma';

// 仓库层接收的写入数据：密码一律传 bcrypt 哈希，不传明文
type User = {
    username: string;
    email: string;
    passwordHash: string;
};

const authRepository = {
    findUser: (username: string) => {
        return prisma.users.findUnique({
            where: {
                username,
            },
        });
    },

    addUser: (user: User) => {
        return prisma.users.create({
            data: {
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash,
            },
        });
    },

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

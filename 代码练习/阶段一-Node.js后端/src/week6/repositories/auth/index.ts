
type User = {
    username: string;
    password: string;
    token?: string;
};

const users: User[] = [];

const authRepository = {
    findUser: (username: string): User | undefined =>
        users.find((user) => user.username === username),
    addUser: (user: User): boolean => {
        users.push(user);
        return true;
    },
    userList: (): User[] => [...users],
    updateUser: (user: User): boolean => {
        const index = users.findIndex((u) => u.username === user.username);
        if (index === -1) return false;
        // 展开运算符新建对象，避免 Object.assign 原地修改；undefined 字段不会覆盖已有值
        users[index] = { ...users[index], ...user };
        return true;
    },
};
export default authRepository;


export interface User {
    username: string
    password: string
    token?: string
}
const users: User[] = []

export const findUser = (username: string) => {
    return users.find(user => user.username === username)
}


export const addUser = async (user: User) => {

    const foundUser = await findUser(user.username)
    if (foundUser) return false
    users.push(user)
    return true  // 成功注册必须返回 true，否则调用方收到 undefined（falsy）会误判为失败
}

export const deleteUser = async (username: string) => {
    const user = await findUser(username)
    if (!user) return false
    users.splice(users.findIndex(user => user.username === username), 1)
    return true
}
export const updateUser = async (user: {
    username: string
    password?: string
    token?: string

}) => {
    const foundUser = await findUser(user.username)
    if (!foundUser) return false

    // 合并更新：只覆盖传入的字段，未传的（如 token）保留
    // foundUser 是数组里对象的引用，原地修改即同步更新了 users 数组
    Object.assign(foundUser, user)
    return true
}
export const listUsers = async () => {
    return users
}

export const tokenFindUser = async (token: string) => {
    return users.find(user => user.token === token)
}

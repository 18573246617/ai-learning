// ## 2. TypeScript 基础（够用就行）
// ### 2.1 interface（接口）：描述对象长什么样
interface User {
    name: string;
    age: number;
    isStudent?: boolean;
}

let userName = 'james'

const user: User = {
    name: 'james',
    age: 25,
}

class User2 {
    name: string
    age: number

    constructor(name: string, age: number) {
        this.name = name
        this.age = age
    }
}

const user2: User = new User2('james', 18)

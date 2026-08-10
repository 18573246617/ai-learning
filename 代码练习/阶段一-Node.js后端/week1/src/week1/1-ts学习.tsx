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


const getData = async (user: User) => {
    return {
        name: 'james',
        age: 18
    }
}

// ### 2.2 type（类型别名）：给类型起名字、组合类型

type Name = string | User

//可以重复定义
interface User {
    class?: string;
}
let name2: Name = {
    name: 'james',
    age: 18,
    class: 'A'
}

interface User3 {
    name: string;
    age: number;
}


// type List = [string, number]
type List = Array<string | number> | [string, number]
let list: List = ['2', 1]

// ### 2.3 泛型：让函数支持多种类型
interface IFirst<Type> {
    name: string;
    age: number;
    data?: Type;
}

function first<T>(): IFirst<T> {
    return {
        name: 'james',
        age: 18,
        data: 1 as T
    }
}

const n = first<number>()   // n 是 IFirst<number>
const s = first<string>()   // s 是 IFirst<string>



interface F<Type> {
    name: string;
    age: number;
    data: Type;
    add: (obj: Type) => void
    get: (id: string) => Type

}

function getList<T>(a: T): number {
    return 1
}

getList<string>('1')

let getList2 = <T,>(a: T): T => {

    return a
}

// 继承
type T1 = string | number

let getList3 = <T extends T1,>(a: T): T => {
    return a
}

//相当于传参给 F<Type>
const obj: F<string> = {
    name: 'james',
    age: 18,
    data: 'string',
    add: (obj) => { },
    get: (id) => {
        return 'string'
    }
}
interface User5 {
    name: string;
    age: number;
}

type ObjectArray = Array<User5>

const obj2: ObjectArray = [
    { name: 'james', age: 18 },
    { name: 'james', age: 18 }
]


//interface继承  
interface ObjectArray2 extends ObjectArray { }
const obj3: ObjectArray2 = [
    { name: 'james', age: 18 },
    { name: 'james', age: 18 }
]

//三元表达式
type ObjectArray4 = ObjectArray extends ObjectArray ? ObjectArray : never

//type继承
type A = {
    a: string
}

type B = A & {
    b: string
}


// ！！！！注意 interface和type的区别
// interface 不能定义基本类型别名  如 type Name = string | number
// interface 不能定义元组 type list =[string, number]

// type 不能够同名，会报错
// type Name = string | number
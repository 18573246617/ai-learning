import { prisma } from '@/week6/db/prisma';
type Task = {
    id?: number;
    userId: number;
    title: string;
    completed: boolean;
};


const tasksRepositories = {
    list: (body: Task) => {
        // GET /list 无请求体时 req.body 为 undefined，默认参数兜底，否则 body.title 会抛 TypeError
        const list = prisma.tasks.findMany({
            where: {
                ...body
            }
        })

        return list;
    },
    add: async (body: Task) => {
        const newTask = await prisma.tasks.create({
            data: {
                ...body
            },
        });
        return newTask;
    },
    update: async (body: Task) => {

        const updatedTask = await prisma.tasks.update({
            where: { id: body.id },
            data: {
                ...body
            }
        })
        return updatedTask;
    },
    delete: async (body: Task) => {
        await prisma.tasks.delete({
            where: { id: body.id }
        })
        return null;
    },
}
export { Task }
export default tasksRepositories;

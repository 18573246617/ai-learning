
type Task = {
    id?: number;
    title?: string;

};

const tasksList: Array<Task> = [];

const tasksRepositories = {
    list: async (body: Task = {}) => {
        // GET /list 无请求体时 req.body 为 undefined，默认参数兜底，否则 body.title 会抛 TypeError
        let list = tasksList;
        if (body.title) list = list.filter((task: Task) => task.title && task.title.includes(body.title || ''));
        if (body.id) list = list.filter((task: Task) => task.id && task.id === body.id);
        return list;
    },
    add: async (body: Task) => {
        tasksList.push(body);
        return body;
    },
    update: async (body: Task) => {
        const index = tasksList.findIndex((task: Task) => task.id === body.id);
        if (index !== -1) {
            tasksList[index] = body;
            return body;
        }
        return null;
    },
    delete: async (body: Task) => {
        const index = tasksList.findIndex((task: Task) => task.id === body.id);
        if (index !== -1) {
            tasksList.splice(index, 1);
            return body;
        }
        return null;
    },
}
export { Task }
export default tasksRepositories;

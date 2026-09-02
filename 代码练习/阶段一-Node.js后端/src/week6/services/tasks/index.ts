import tasksRepositories, { Task } from '../../repositories/tasks/index.js';

const tasksServices = {
    list: async (body: Task) => {
        return tasksRepositories.list(body);
    },
    add: async (body: Task) => {
        return tasksRepositories.add(body);
    },
    update: async (body: Task) => {
        return tasksRepositories.update(body);
    },
    delete: async (body: Task) => {
        return tasksRepositories.delete(body);
    },

}

export default tasksServices

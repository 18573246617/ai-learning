export interface Task {
    id: number
    title: string
    completed: boolean
    priority: "low" | "medium" | "high"
    createdAt: string
}


export const task: Task[] = []
let taskId = 1

//查询处理
export const findTask = async (id: Task["id"]): Promise<Task | undefined> => {
   return task.find(e=>e.id===id)
}


export const listTasks = async (filter: { completed?: boolean; keyword?: string }): Promise<Task[]> => {
     let result = task
    if (filter.completed !== undefined) { 
        result = result.filter(e=>e.completed==filter.completed)
    }
    const keyword = filter.keyword
    if (keyword !== undefined) {
        result = result.filter(e => e.title.includes(keyword ))
    }
    return result
}

//新增处理
export const createTask = async (obj: { title: string; completed: Task["completed"]; priority: Task["priority"] }): Promise<Task> => {
    const newTask: Task = {
        id: taskId++,
        title: obj.title,
        completed: obj.completed ,
        priority: obj.priority,
        createdAt: new Date().toISOString(),
    }
    task.push(newTask)
    return newTask
  
}

export const updateTask = async (id: Task["id"], obj: { title?: string; priority?: Task["priority"] }): Promise<Task | undefined> => {
    const foundTask = await findTask(id)
    if (!foundTask) return undefined
    Object.assign(foundTask, obj)
    return foundTask
}

export const deleteTask = async (id: Task["id"]): Promise<boolean> => {
    const index = task.findIndex(e=>e.id===id)
    if (index === -1) return false
    task.splice(index, 1)
    return true
}


export interface Task {
  id: number
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
  createdAt: string
}

export type TaskPriority = Task["priority"]

export type TaskPatch = Partial<Pick<Task, "title" | "completed" | "priority">>

// 内存数据：服务器重启后会清空（第 9 周会换成数据库）
const tasks: Task[] = []
let nextId = 1

// 故意写成 async：模拟将来接数据库的样子，顺便练习 async/await
export async function listTasks(filter: { completed?: boolean; keyword?: string } = {}): Promise<Task[]> {
  let result = tasks
  if (filter.completed !== undefined) {
    result = result.filter((t) => t.completed === filter.completed)
  }
  const keyword = filter.keyword
  if (keyword) {
    result = result.filter((t) => t.title.includes(keyword))
  }
  return result
}

export async function findTask(id: number): Promise<Task | undefined> {
  return tasks.find((t) => t.id === id)
}

export async function createTask(input: { title: string; priority: TaskPriority }): Promise<Task> {
  const task: Task = {
    id: nextId++,
    title: input.title,
    completed: false,
    priority: input.priority,
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  return task
}

export async function updateTask(id: number, patch: TaskPatch): Promise<Task | undefined> {
  const task = await findTask(id)
  if (!task) return undefined
  Object.assign(task, patch)
  return task
}

export async function deleteTask(id: number): Promise<boolean> {
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) return false
  tasks.splice(index, 1)
  return true
}

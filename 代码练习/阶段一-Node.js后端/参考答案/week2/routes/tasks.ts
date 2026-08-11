import { Router } from "express"
import { createTask, deleteTask, findTask, listTasks, updateTask } from "../data/tasks.js"
import { createTaskSchema, listTasksQuerySchema, taskIdSchema, updateTaskSchema } from "../schemas/task.js"

export const tasksRouter = Router()

// GET /tasks?completed=true&keyword=xxx  查列表
tasksRouter.get("/", async (req, res, next) => {
  try {
    const query = listTasksQuerySchema.safeParse(req.query)
    if (!query.success) {
      res.status(400).json({ error: "查询参数不合法", details: query.error.flatten() })
      return
    }
    res.json(await listTasks(query.data))
  } catch (err) {
    next(err)
  }
})

// GET /tasks/:id  查单个
tasksRouter.get("/:id", async (req, res, next) => {
  try {
    const parsed = taskIdSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: "id 必须是正整数" })
      return
    }
    const task = await findTask(parsed.data)
    if (!task) {
      res.status(404).json({ error: "任务不存在" })
      return
    }
    res.json(task)
  } catch (err) {
    next(err)
  }
})

// POST /tasks  创建（201 = 创建成功）
tasksRouter.post("/", async (req, res, next) => {
  try {
    const body = createTaskSchema.safeParse(req.body)
    if (!body.success) {
      res.status(400).json({ error: "请求体不合法", details: body.error.flatten() })
      return
    }
    const task = await createTask(body.data)
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
})

// PUT /tasks/:id  更新
tasksRouter.put("/:id", async (req, res, next) => {
  try {
    const id = taskIdSchema.safeParse(req.params.id)
    if (!id.success) {
      res.status(400).json({ error: "id 必须是正整数" })
      return
    }
    const body = updateTaskSchema.safeParse(req.body)
    if (!body.success) {
      res.status(400).json({ error: "请求体不合法", details: body.error.flatten() })
      return
    }
    const task = await updateTask(id.data, body.data)
    if (!task) {
      res.status(404).json({ error: "任务不存在" })
      return
    }
    res.json(task)
  } catch (err) {
    next(err)
  }
})

// DELETE /tasks/:id  删除（204 = 成功但没有内容返回）
tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const parsed = taskIdSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(400).json({ error: "id 必须是正整数" })
      return
    }
    const ok = await deleteTask(parsed.data)
    if (!ok) {
      res.status(404).json({ error: "任务不存在" })
      return
    }
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

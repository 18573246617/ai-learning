import { Router } from 'express'
import { listTasks, findTask, createTask, updateTask, deleteTask } from '../../data/tasks/index.js'

import { createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema } from '../../schemas/tasks/index.js'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
export const taskRouter = Router()

//下载（固定路径放在动态路由 /detail/:id 之前）
taskRouter.get('/download', async (req, res, next) => {
    try {
        // src/week2/router/tasks → .. → src/week2/router → .. → src/week2 → .. → src → week3
        const downloadPath = join(import.meta.dirname, '..', '..', '..', 'week3', '自动创建的文件夹', 'fake.exe')
        if (!existsSync(downloadPath)) {
            return res.status(404).json({ message: '文件不存在' })
        }
        // 方式一 express 内置：res.download
        res.download(downloadPath, 'fake.exe')

        // 方式二 原生写法：createReadStream + pipe 手动实现（与 res.download 二选一）
        // res.setHeader('Content-Disposition', 'attachment; filename="fake.exe"')
        // createReadStream(downloadPath).pipe(res)
    } catch (error) {
        next(error)
    }
})

//列表
taskRouter.get('/list', async (req, res, next) => {
    try {
        const result = listTasksSchema.safeParse(req.query)
        if (!result.success) {
            return res.status(400).json({ message: '查询参数不合法', data: result.error.flatten() })
        }
        const data = await listTasks(result.data)
        res.json(data)
    } catch (error) {
        next(error)
    }
})

//详情
taskRouter.get('/detail/:id', async (req, res, next) => {
    try {
        const result = taskIdSchema.safeParse(req.params.id)
        if (!result.success) {
            return res.status(400).json({
                message: 'id 必须是正整数',
                data: result.error.flatten(),
            })
        }
        const data = await findTask(Number(req.params.id))

        if (!data) {
            return res.status(404).json({ message: '任务不存在', data: {} })
        }
        return res.json(data)
    } catch (error) {
        next(error)
    }
})

//新增
taskRouter.post('/create', async (req, res, next) => {
    try {
        const result = createTaskSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({ message: '请求体不合法', data: result.error.flatten() })
        }

        const task = await createTask(result.data)
        res.status(201).json(task)
    } catch (error) {
        next(error)
    }
})

//修改
taskRouter.put('/update/:id', async (req, res, next) => {
    try {
        const id = taskIdSchema.safeParse(req.params.id)
        if (!id.success) {
            return res.status(400).json({ message: 'id 必须是正整数', data: id.error.flatten() })
        }
        const result = updateTaskSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: '请求体不合法',
                data: result.error.flatten(),
            })
        }
        const task = await updateTask(id.data, result.data)
        if (!task) {
            return res.status(404).json({ message: '任务不存在', data: {} })
        }
        return res.json(task)
    } catch (error) {
        next(error)
    }
})

//删除
taskRouter.delete('/delete/:id', async (req, res, next) => {
    try {
        const result = taskIdSchema.safeParse(req.params.id)
        if (!result.success) {
            return res.status(400).json({
                message: 'id 必须是正整数',
                data: result.error.flatten(),
            })
        }
        const task = await deleteTask(result.data)
        if (!task) {
            return res.status(404).json({
                message: '任务不存在',
                data: {},
            })
        }
        return res.status(204).json(task)
    } catch (error) {
        next(error)
    }
})

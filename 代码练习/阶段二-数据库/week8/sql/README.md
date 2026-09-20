# week8/sql 练习目录

第 8 周产出：users + tasks + tags + task_tags 四张关联表，外加一组多表查询脚本，全部自己写。

| 文件 | 用途 | 能否重跑 |
|---|---|---|
| `01-create-tables.sql` | DROP 后重建四张表（含外键、中间表复合主键） | 能 |
| `02-insert-data.sql` | 用户 / 任务 / 标签 / 标签关联数据（幂等） | 能 |
| `03-joins.sql` | INNER / LEFT / 三次 JOIN / 反连接查询 | 能 |
| `04-aggregations.sql` | COUNT / GROUP BY / HAVING 统计 | 能 |
| `05-indexes-explain.sql` | 建索引 + EXPLAIN 前后对比 | 能 |

要求：

- 每个文件第一行注释写清用途和自查方法
- 每条查询注释写"查什么、预期几行"
- `01` 里 DROP 按依赖倒序（task_tags → tags → tasks → users），CREATE 按依赖顺序
- 提交前从零连跑一遍，再整体重跑一遍

详细要求见《第 8 周学习笔记》第 3–8 节。

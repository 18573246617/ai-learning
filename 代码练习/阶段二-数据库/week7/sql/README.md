# week7/sql 练习目录

第 7 周产出：4 个可重复运行的 SQL 脚本，全部自己写。

| 文件 | 用途 | 能否重复跑 |
|---|---|---|
| `01-create-tables.sql` | 清空重建 users / tasks | 能 |
| `02-insert-data.sql` | 插入练习数据（幂等） | 能 |
| `03-update-delete.sql` | UPDATE / DELETE + RETURNING 演示 | 能，会改数据 |
| `04-select-queries.sql` | 过滤 / 排序 / count / 分页查询 | 能 |

要求：

- 每个文件第一行用注释写清用途和自查方法
- 每句 SQL 都带 WHERE（除建表/清空）
- 每段查询用注释说明"查什么、预期几行"

详细要求见《第 7 周学习笔记》第 9 节。



```docs
PRIMARY KEY 唯一 ，非空
NOT NULL 不能为空
UNIQUE 
DEFAULT
FOREGIN KEY
CHECK 
```
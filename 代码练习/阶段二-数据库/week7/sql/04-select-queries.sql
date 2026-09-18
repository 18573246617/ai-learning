-- 练习5
-- 1. 给 alice 批量造 100 条任务（`generate_series` 是 PG 内置序列生成函数）：
INSERT INTO
    tasks (user_id, title, completed)
SELECT
    (
        SELECT
            id
        FROM
            users
        WHERE
            username = 'alice'
    ),
    '批量生成',
    false
FROM
    users
    CROSS JOIN generate_series (1, 100) AS g
WHERE
    username = 'alice';

--   2. 写查询：alice 最近创建的 10 条任务（新→旧）
SELECT
    *
FROM
    tasks
WHERE
    user_id = (
        SELECT
            id
        FROM
            users
        WHERE
            username = 'alice'
    )
ORDER BY
    created_at DESC
LIMIT
    10;

-- 3. 写查询：alice 未完成的任务总数
SELECT
    count(*)
FROM
    tasks
WHERE
    completed = false
    AND user_id = (
        SELECT
            id
        FROM
            users
        WHERE
            username = 'alice'
    );

-- 4. 写查询：取第 2 页、每页 5 条（应该看到第 6–10 条），把 OFFSET 算出来再写
SELECT
    *
FROM
    tasks
LIMIT
    5
OFFSET
    5;

-- 5. 用 `ILIKE` 找出标题里带"练习"的任务
SELECT
    *
FROM
    tasks
WHERE
    title ILIKE '%练习%';

-- 6. 自查：`ORDER BY created_at DESC` 只按时间排，两条同一秒创建的任务顺序稳定吗？为什么补一个 `id DESC` 兜底？
SELECT
    *
FROM
    tasks
ORDER BY
    created_at DESC,
    id DESC;

-- 因为同一秒创建的任务，id 是递增的，所以按 id 排序可以保证顺序稳定
-- 创建用户表
CREATE TABLE
    IF NOT EXISTS users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- 自增主键
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

-- 创建任务表
CREATE TABLE
    IF NOT EXISTS tasks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id BIGINT REFERENCES users (id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    );

-- 创建
--    docker exec ai-postgres psql -U postgres -d ai_learning -c "CREATE TABLE IF NOT EXISTS users (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(255) UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());"
-- 插入多行数据
INSERT INTO
    users (username, email, password_hash)
VALUES
    ('Alice', 'alice@example.com', 'password123'),
    ('Bob', 'bob@example.com', 'password123') RETURNING username,
    email,
    password_hash,
    id
    -- VALUES 里的子查询只能返回「单个值」（一行一列），作为某个字段的值使用。它不能替代整个数据源。
INSERT INTO
    tasks (user_id, title)
VALUES
    (
        (
            SELECT
                id
            FROM
                users
            WHERE
                username = 'Alice'
        ),
        'Task 1'
    )
INSERT INTO
    tasks (user_id, title)
SELECT
    user_id,
    title
FROM
    users
WHERE
    username = 'Alice' RETURNING title,
    id,
    user_id
INSERT INTO
    tasks (user_id, title)
VALUES
    (
        (
            SELECT
                id
            from
                users
            WHERE
                username = 'james'
                -- VALUES 里的子查询只能返回「单个值」（一行一列），作为某个字段的值使用。它不能替代整个数据源。
        ),
        '插入的第一条数据'
    ) RETURNING title,
    id,
    user_id
    -- RETURNING 本质上就是一个嵌在 INSERT/UPDATE/DELETE 里的 SELECT。
    -- 返回的数据就是INSERT操作后的这条数据，可以取里面任意字段
    -- SELECT * FROM users 
    -- WHERE created_at>='2026-09-14'::date and created_at<'2026-09-15'::date
    -- ORDER BY id desc


--筛选时间
 SELECT * FROM users 
WHERE created_at>='2026-09-14'::date and created_at<'2026-09-15'::date
ORDER BY id desc

--批量生成数据

INSERT INTO 
users (username, email, password_hash)
SELECT  username, email, password_hash FROM users CROSS JOIN generate_series(1,100) AS g
WHERE id=7

UPDATE  users
SET username='1'
WHERE id=7

DELETE FROM users
WHERE id=7






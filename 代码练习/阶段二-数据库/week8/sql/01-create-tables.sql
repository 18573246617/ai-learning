-- 第 8 周：四张关联表（复用第 7 周的 ai_learning 库）
-- 可重跑：先按依赖倒序 DROP 全部四张表，再按依赖顺序 CREATE
DROP TABLE IF EXISTS task_tags,
tags,
tasks,
users CASCADE;

-- 用户
CREATE TABLE
    users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

-- 增加邀请人列
ALTER TABLE users
ADD COLUMN invited_by BIGINT REFERENCES users (id);

-- -- 删列
-- ALTER TABLE users DROP COLUMN invited_by;
-- -- 加约束（如之前聊的防"自己邀请自己"）
-- ALTER TABLE users 
-- ADD CONSTRAINT chk_not_self_invite CHECK (invited_by IS NULL OR invited_by <> id);
-- -- 改列类型
-- ALTER TABLE tasks ALTER COLUMN title TYPE VARCHAR(200);
-- -- 加默认值
-- ALTER TABLE tasks ALTER COLUMN completed SET DEFAULT false;
-- 任务（一对多的"多"，外键放这里）
CREATE TABLE
    tasks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

CREATE INDEX idx_tasks_user_id ON tasks (user_id);

-- 标签（独立实体，和用户没有关系，所以没有任何外键）
CREATE TABLE
    tags (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
    );

-- 中间表（多对多）：复合主键一箭双雕——既是主键，又防止重复打同一个标签
CREATE TABLE
    task_tags (
        task_id BIGINT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
        tag_id BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
    );

CREATE INDEX idx_task_tags_task_id ON task_tags (task_id);

CREATE INDEX idx_task_tags_tag_id ON task_tags (tag_id);
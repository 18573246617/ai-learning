DROP TABLE IF EXISTS tasks,
users CASCADE;

--用户
CREATE TABLE
    users (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

--任务
CREATE TABLE
    tasks (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT,
        title VARCHAR(100),
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
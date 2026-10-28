DROP TABLE IF EXISTS tasks,
users CASCADE;

--用户
CREATE TABLE
    users (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        -- id BigInt @id @default(autoincrement())
        username VARCHAR(50) UNIQUE NOT NULL,
        -- username String @unique @ db.Varchar(50)
        email VARCHAR(100) NOT NULL,
        -- email String @db.Varchar(100)
        password_hash VARCHAR(100) NOT NULL,
        --passwordHash String @db.Varchar(100) @map("password_hash")
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        -- created_at DateTime @db.Timestamptz @default(now())
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
        -- updated_at DateTime @db.Timestamptz @default(now())
    );

--任务
CREATE TABLE
    tasks (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        -- id BigInt @id @default(autoincrement())
        user_id BIGINT NOT NULL,
        -- userId BigInt @map("user_id")
        -- users Users @relation(fields:[userId],references:[id],onDelete:Cascade)
        title VARCHAR(100),
        -- title String @db.Varchar(100)
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        -- completed Boolean @default(false)
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        -- created_at DateTime @db.Timestamptz @default(now())
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
        -- updated_at DateTime @db.Timestamptz @default(now())
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
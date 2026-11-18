-- | `02-insert-data.sql` | 插入用户 + 任务（先清空再插，保证幂等） | 能 |
-- 幂等的前提：每次从空表开始。RESTART IDENTITY 让自增 id 也从 1 重新开始，
-- CASCADE 允许直接清 users（tasks 的外键跟着清）。不加这三句，连跑第二遍就会撞 username 唯一约束。
TRUNCATE TABLE tasks,
users RESTART IDENTITY CASCADE;

INSERT INTO
    users (username, email, password_hash)
VALUES
    (
        'alice',
        'alice@example.com',
        'password_hash_alice'
    ),
    ('bob', 'bob@example.com', 'password_hash_bob'),
    (
        'charlie',
        'charlie@example.com',
        'password_hash_charlie'
    );

-- prisma.user.createMany({data:[{username:'alice',email:'alice@example.com',passwordHash:'password_hash_alice'},{username:'bob',email:'bob@example.com',passwordHash:'password_hash_bob'},{username:'charlie',email:'charlie@example.com',passwordHash:'password_hash_charlie'}]})
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
    '插入的标题',
    true
FROM
    users
    CROSS JOIN generate_series (1, 10) AS g
WHERE
    username = 'alice';

--const user=await prisma.users.findUnique({where:{username:'alice'}})
-- Array.from({length: 10}, (_, i) => ({id:user.id, completed:true})).map(prisma.tasks.create({data:{ }}))

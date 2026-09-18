-- | `02-insert-data.sql` | 插入用户 + 任务（先清空再插，保证幂等） | 能 |
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
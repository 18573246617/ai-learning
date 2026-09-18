UPDATE users
SET
    username = '修改后的用户名',
    email = '修改后的邮箱',
    password_hash = '修改后的密码哈希'
WHERE
    id = 1;

DELETE FROM users
WHERE
    id = 1;
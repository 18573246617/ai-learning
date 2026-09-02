// 公开接口白名单：无需 Token 即可访问（全局鉴权下的例外）
// 注意：全局挂载 checkAuth 时 req.path 是完整路径（如 /auth/login），需精确匹配
export const PUBLIC_PATHS = ['/health', '/auth/login', '/auth/register'];

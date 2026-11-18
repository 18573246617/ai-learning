// 请求边界上的两个转换：Express 交给你的永远是 string / 可选对象，业务层要的是 string / bigint
// 集中在这里，避免每个 controller 各写一遍 `req.user!` 和 `BigInt(req.params.id)`
import { AppError } from './errors.js';

// 只依赖请求对象上的 user 字段，不绑定 Express 的 Request 泛型（controller 的 P/ReqBody 各不同）
type RequestWithUser = {
    user?: { userName?: string };
};

// checkAuth 已保证白名单之外的请求都有 req.user（类型上是可选的，这里集中兜底）
export const currentUsername = (req: RequestWithUser): string => {
    const username = req.user?.userName;
    if (!username) {
        throw new AppError(401, 'UNAUTHORIZED', '缺少 Token');
    }
    return username;
};

// 路径参数 / query 里的 id 都是字符串，数据库里是 BIGINT
// 不要直接 BigInt(raw)：BigInt('') === 0n、BigInt('0x10') === 16n，脏值会被放进去
export const parseId = (raw: string): bigint => {
    if (!/^\d+$/.test(raw)) {
        throw new AppError(400, 'INVALID_ID', 'id 必须是正整数');
    }
    return BigInt(raw);
};

// 统一响应格式：{ code, message, data } 三件套贯穿所有出口（controller / errorHandler / middleware）
// code 约定：0 表示成功，非 0 为业务错误码（如 'USER_NOT_FOUND'），前端据此统一处理

export const ok = <T>(data: T, message = '操作成功') => ({
    code: 0,
    message,
    data,
});

export const fail = (code: string, message: string) => ({
    code,
    message,
    data: null,
});

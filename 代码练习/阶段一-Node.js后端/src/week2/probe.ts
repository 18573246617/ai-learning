// 模拟部署平台定时探活 /healthz
// 用法：先启动服务（pnpm dev:week2），再开一个终端跑 pnpm probe:week2
const PORT = process.env.PORT || 1300
const HEALTHZ_URL = `http://localhost:${PORT}/healthz`
const INTERVAL_MS = 10_000 // 每隔 10 秒探一次（可改：60_000 = 1 分钟）

const probe = async () => {
    const start = Date.now()
    try {
        const res = await fetch(HEALTHZ_URL)
        console.log(
            `[${new Date().toLocaleTimeString()}] 状态码 ${res.status} | 耗时 ${Date.now() - start}ms | 响应: ${await res.text()}`
        )
    } catch (err: any) {
        // 服务没启动 / 挂了：平台视角就是"探活失败"，会摘掉流量重启实例
        console.log(`[${new Date().toLocaleTimeString()}] 探活失败: ${err.message}`)
    }
}

// 启动后立刻探一次，然后每隔 INTERVAL_MS 自动探一次
probe()
setInterval(probe, INTERVAL_MS)

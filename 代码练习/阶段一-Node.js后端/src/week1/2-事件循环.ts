// 两个关键角色：宏任务和微任务
// 宏任务（macrotask）：setTimeout、setInterval、setImmediate、I / O 回调（读文件、网络请求）
// 微任务（microtask）：Promise.then、await 后面的代码、queueMicrotask

// 执行规则只有一句话：
// 先执行同步代码 → 同步代码结束，把所有微任务清空 → 再取下一个宏任务 → 再清空微任务 → 循环往复


// 一个容易答错的嵌套例子
setTimeout(() => {
    console.log("A")
    Promise.resolve().then(() => console.log("B"))
}, 0)

setTimeout(() => {
    console.log("C")
}, 0)

//它和 Promise.then 是一回事，把一个函数排到“微任务队列”里，等当前这轮代码跑完，立刻执行它。
queueMicrotask(() => console.log("D"))

// 输出：A → B → C  先执行第一个宏任务 再执行第二个宏任务


// 事件循环是什么：单线程下，协调同步代码和异步回调执行顺序的调度机制。
// 为什么 Node 能高并发：耗时的 I / O 不占主线程，交给底层处理完再排队回调，主线程只负责调度。
// 输出顺序题：同步 → nextTick → Promise 微任务 → 宏任务。
// 怎么把事件循环搞死：在微任务里无限递归 Promise.resolve().then(...)，宏任务就永远排不上，进程直接卡死。
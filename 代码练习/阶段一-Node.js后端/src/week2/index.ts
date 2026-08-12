import { createApp} from './app'

const port: number = 1300
const app = createApp()

app.listen(port, () => {
  console.log(`服务已启动: http://localhost:${port}`)
})





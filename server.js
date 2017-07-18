// 引入 http 模块， 用来搭建 http 服务器和 http 客户端的, express是基于这个模块的。
// 一般认为这个是底层,实际上 net 是最底层，http 是在 net 的基础上添加了 http 协议相关部分
const http = require('http')
const https = require('https')
const url = require('url')
const express = require('express')
const app = express()
// 配置express
const bodyParser = require('body-parser')
app.use(bodyParser.json())
// 配置静态资源文件，比如 js css 图片
const asset = __dirname + '/static'
app.use('/static', express.static(asset))
const log = console.log.bind(console)

const clientByProtocol = (protocol) => {
    if(protocol === 'http:'){
        return http
    }else {
        return https
    }
}
const apiOptions =  () => {
    // 从环境变量中获取 api_server 的值
    const envServer = process.env.apiServer
    // 设置默认的服务器的地址
    const defaultServer = 'http://0.0.0.0:4000'
    const server = envServer || defaultServer
    // 解析 url 之后的结果
    const result = url.parse(server)
    // api 通常形式的请求是 Content-Type；application/json
    const obj = {
        headers: {
            'Content-Type': 'application/json',
        },
        // https 相关的设置，为了方便直接设置为 false
        rejectUnauthorized: false,
    }
    const options = Object.assign({}, obj, result)
    if(options.href.length > 0){
        delete options.href
    }
    return options
}
const httpOptions = (request) => {
    // 获取基本的 api options 配置
    const baseOptions = apiOptions()
    // 设置请求的 path
    const pathOptions = {
        path: request.originalUrl,
    }
    const options = Object.assign({}, baseOptions, pathOptions)
    // 把浏览器发送请求的　headers　全部添加到 option 中
    Object.keys(request.headers).forEach((k) => {
        options.headers[k] = request.headers[k]
    })
    // 设置请求的方法
    options.method = request.method
    return options
}
// 我们理论上只转发 api　的请求，所有符合　／api的请求都会被转发
app.all('/api/*', (request, response) => {
    // 1.根据本地请求资源，修改为转发的请求资源
    const options = httpOptions(request)
})
const run = (port=3000, host='') => {
    const server = app.listen(port, host, () => {
        const address = server.address()
        host = address.address
        port = address.port
        log(`server started at http://${host}: ${port}`)
    })
}
if(require.main === module) {
    const port = 3200
    // host 指定为 0.0.0.0 可以让别的机器访问运行的程序
    const host = '0.0.0.0'
    run(port, host)
}
const serverless = require('serverless-http')
const app = require('./bin/www')
const handler = serverless(app)
// 返回输入参数
exports.main = async (event) => {
    const res = await handler(event)
    return res
}

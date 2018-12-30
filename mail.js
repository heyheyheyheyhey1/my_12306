
const nodemailer = require('nodemailer')
const transport = nodemailer.createTransport({
    service: 'qq',
    port: 587,
    secure: true,
    auth: {
        user: '912126472@qq.com',
        pass: 'nxcxdzfatylcbchi'
    }
})



module.exports = function (arg) {
    return new Promise((resolve, reject) => {
        let json = {
            from: "912126472@qq.com",
            to: "912126472@qq.com",
            subject: "有票了",
            html: arg
        }
        transport.sendMail(json, (err, info) => {
            if (err) {
                console.loge(err)
                reject("发送邮件错误")
            }
            else {
                resolve("发送成功")
            }
        })
    })
}
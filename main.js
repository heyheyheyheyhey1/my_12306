let request = require("request")
let mailer = require('./mail')

let addr_Code = {
}
let status_Code = {
    "stain_no": 3,
    "st_start": 6,
    "st_end": 7,
    "sum_noSet": 26,
    "sum_hardSet": 29,
    "date": 13
}


// let url = "https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=2019-01-16&leftTicketDTO.from_station=YYQ&leftTicketDTO.to_station=LDQ&purpose_codes=ADULT"
let query_timeOut = 5000
let query_Times = 1
let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
}

let requestJson = {
    headers,
    method: "GET"
}

function get_Info_By_Json(arg) {
    return new Promise((resolve, reject) => {
        request(requestJson, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                addr_Code = JSON.parse(body).data.map
                // console.log(addr_Code)
                // console.log(body)
                resolve(body)
            }
            else {
                reject("请求错误")
            }
        })
    })
}

async function get_Infos(arg) {
    let infos = []
    for (let i = 0; i < arg.length; i++) {
        let t = await get_Info_By_Json(gen_JSON(arg[i]))
        // console.log(t+"--------------------------------")
        infos.push(t)
    }
    // console.log(infos)
    return infos
}

function gen_JSON(arg) {
    requestJson.url = `https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=2019-01-${arg}&leftTicketDTO.from_station=BJQ&leftTicketDTO.to_station=LDQ&purpose_codes=ADULT`
    return requestJson
}

function get_Array_From_Infos(arg) {
    return new Promise((resolve, reject) => {
        // console.log(JSON.parse(arg).data.result)
        let infos_train = []
        for (let i = 0; i < arg.length; i++) {
            let info = JSON.parse(arg[i]).data.result
            for (let j = 0; j < info.length; j++) {
                infos_train.push(info[j].split('|'))
            }
        }

        process.stdout.write("数量: " + infos_train.length)

        resolve(infos_train)
    })
}

function parse_Array_To_Json(arg) {
    return new Promise((resolve, reject) => {
        let value = []
        for (let i = 0; i < arg.length; i++) {
            let t = {}
            t.stain_no = arg[i][status_Code.stain_no]
            t.st_start = addr_Code[arg[i][status_Code.st_start]]
            t.st_end = addr_Code[arg[i][status_Code.st_end]]
            t.sum_noSet = arg[i][status_Code.sum_noSet]
            t.sum_hardSet = arg[i][status_Code.sum_hardSet]
            t.date = arg[i][status_Code.date]
            value.push(t)
        }
        // console.log(value)
        resolve(value)
    })
}
function checkSum(arg) {
    return new Promise((resolve, reject) => {
        let value = []
        for (let i = 0; i < arg.length; i++) {

            if (arg[i].sum_hardSet != "" && arg[i].sum_hardSet != "无") {
                value.push(arg[i])
            }
        }
        if (value.length > 0) {
            query_timeOut = 60000
            resolve(value)
            // timeOut=1
        }
        else {
            reject(" 状态: 无票")
            query_timeOut = 3000
        }
    })
}

function gen_HTML(arg) {
    return new Promise((resolve, reject) => {
        let html = ""
        for (let i = 0; i < arg.length; i++) {
            html +=
                "车次: " + arg[i].stain_no + "\t"
                + "始发: " + arg[i].st_start + "\t"
                + "日期: " + arg[i].date + "\t"
                + "终点: " + arg[i].st_end + "\t"
                + "硬座: " + arg[i].sum_hardSet + "\t"
                + "无座: " + arg[i].sum_noSet + "<br>"
        }
        // console.log(html)
        resolve(html)
    })
}
function redo(){
    setTimeout(main,query_timeOut,[27,28])
}

function main(arg) {

    process.stdout.write("第 " + query_Times++ + " 次查询:\t")
    get_Infos(arg)
        .then(get_Array_From_Infos)
        .then(parse_Array_To_Json)
        .then(checkSum)
        .then(gen_HTML)
        .then(mailer)
        .then(console.log)
        .catch(console.log)
        .then(redo)
    
}

main([27, 28])
let request = require("request")
let mailer = require('./mail')

let addr_Code = {
}
let status_Code = {
    "stain_no": 3,
    "st_start": 4,
    "st_end": 5,
    "sum_noSet": 26,
    "sum_hardSet": 29
}


let url = "https://kyfw.12306.cn/otn/leftTicket/queryZ?leftTicketDTO.train_date=2019-01-27&leftTicketDTO.from_station=BJQ&leftTicketDTO.to_station=LDQ&purpose_codes=ADULT"
let query_timeOut = 1000
let query_Times=1
let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
}

let requestJson = {
    headers,
    method: "GET",
    url
}

function get_Info_By_Json(arg) {
    return new Promise((resolve, reject) => {
        request(requestJson, (error, response, body) => {

            if (!error && response.statusCode == 200) {
                addr_Code = JSON.parse(body).data.map
                // console.log(addr_Code)
                resolve(body)
            }
            else {
                reject("请求错误")
            }
        })
    })
}

function get_Array_From_Info(arg) {
    return new Promise((resolve, reject) => {
        // console.log(JSON.parse(arg).data.result)
        let arr = JSON.parse(arg).data.result

        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].split('|')
        }
        resolve(arr)
    })
}

function parse_Array_To_Json(arg) {
    return new Promise((resolve, reject) => {
        let value = []
        for (let i = 0; i < arg.length; i++) {
            value[i] = {}
            value[i].stain_no = arg[i][status_Code.stain_no]
            value[i].st_start = addr_Code[arg[i][status_Code.st_start]]
            value[i].st_end = addr_Code[arg[i][status_Code.st_end]]
            value[i].sum_noSet = arg[i][status_Code.sum_noSet]
            value[i].sum_hardSet = arg[i][status_Code.sum_hardSet]

        }
        // console.log(value)
        resolve(value)
    })
}
function checkSum(arg) {
    return new Promise((resolve, reject) => {
        // console.log(arg.length)
        let value = []
        for (let i = 0; i < arg.length; i++) {
            if (arg[i].sum_hardSet != "" && arg[i].sum_hardSet != "无") {
                value.push(arg[i])
            }
        }
        if (value.length > 0) {
            query_timeOut=120000
            resolve(value)
            // timeOut=1
        }
        else{
            reject("无票")
            timeOut=1000
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
                + "终点: " + arg[i].st_end + "\t"
                + "硬座: " + arg[i].sum_hardSet + "\t"
                + "无座: " + arg[i].sum_noSet + "<br>"
        }
        resolve(html)
    })
}

function main(){
    process.stdout.write("第 "+query_Times+++" 次查询:\t")
    get_Info_By_Json(requestJson)
    .then(get_Array_From_Info)
    .then(parse_Array_To_Json)
    .then(checkSum)
    .then(gen_HTML)
    .then(mailer)
    .then(console.log)
    .catch(console.log)
}


setInterval(main,query_timeOut)
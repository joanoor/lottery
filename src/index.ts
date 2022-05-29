import { execSync } from 'child_process'
import * as fs from 'fs'
import * as dayjs from 'dayjs'
import * as rp from 'request-promise'

class JDSign {
  cookie = process.env.JD_COOKIE
  push_key = process.env.PUSH_KEY
  dual_cookie = process.env.JD_DUAL_COOKIE

  // 将"京东多合一签到脚本"下载下来，存放的路径
  js_path = `./JD_DailyBonus.js`

  // 执行"京东多合一签到脚本"，结果输出路径
  result_path = './result.txt'

  // 执行"京东多合一签到脚本"，错误输出路径
  error_path = './error.txt'

  constructor() {
    if (!this.cookie) {
      console.log('请配置京东cookie!')
      return
    }

    // 替换"京东多合一签到脚本"中的京东cookie
    this.setUpCookie()

    // 同步执行"京东多合一签到脚本"，输出结果到"./result.txt"
    execSync(`node '${this.js_path}' >> '${this.result_path}'`)

    // 推送消息
    this.sendNotificationIfNeed()
  }

  setUpCookie() {
    let js_content = fs.readFileSync(this.js_path, 'utf8')
    js_content = js_content.replace(
      /var Key = ''/,
      `var Key = '${this.cookie}'`
    )
    if (this.dual_cookie) {
      js_content = js_content.replace(
        /var DualKey = ''/,
        `var DualKey = '${this.dual_cookie}'`
      )
    }
    fs.writeFileSync(this.js_path, js_content, 'utf8')
  }

  sendNotificationIfNeed() {
    if (!this.push_key) {
      return console.log('执行签到任务结束')
    }

    if (!fs.existsSync(this.result_path)) {
      return console.log('没有执行结果，任务中断！')
    }

    const text = `京东签到_${dayjs().format('YYYY.MM.DD')}`
    const desp = fs.readFileSync(this.result_path, 'utf8')

    const SCKEY = this.push_key.replace(/[\r\n]/g, '')

    rp.post({
      uri: `https://sctapi.ftqq.com/${SCKEY}.send`,
      form: { text, desp },
      json: true,
      method: 'POST',
    })
      .then(res => {
        if (res.code == 0) {
          console.log('通知发送成功，任务结束！')
        } else {
          console.log(res)
          console.log('通知发送失败，任务中断！')
          fs.writeFileSync(this.error_path, JSON.stringify(res), 'utf8')
        }
      })
      .catch(err => {
        console.log('通知发送失败，任务中断！')
        fs.writeFileSync(this.error_path, err, 'utf8')
      })
  }
}

new JDSign()

import * as rp from 'request-promise'
import { readFile } from 'fs/promises'
import * as dayjs from 'dayjs'

const push_key = process.env.PUSH_KEY
const SCKEY = push_key.replace(/[\r\n]/g, '')

const text = `${dayjs().format('YYYY年MM月DD日')}——双色球推荐号码`

readFile('./suppose_shuangseqiu.tmp_bak', {
  encoding: 'utf-8',
}).then(res => {
  rp.post({
    uri: `https://sctapi.ftqq.com/${SCKEY}.send`,
    form: { text, res },
    json: true,
    method: 'POST',
  })
    .then(res => {
      if (res.code == 0) {
        console.log('通知发送成功，任务结束！')
      } else {
        console.log('通知发送失败，任务中断！')
      }
    })
    .catch(err => {
      console.log('通知发送失败，任务中断！')
    })
})

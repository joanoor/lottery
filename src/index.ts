import { execSync } from 'child_process'
import * as fs from 'fs'
import * as dayjs from 'dayjs'
import * as rp from 'request-promise'

class JDSign {
  cookie = `mba_muid=1651579051101585908374; __jdu=1651579051101585908374; unpl=JF8EAKhnNSttXE5WA09QSxUST1lTW1kLTh4DZmRWA1UKSgcETFBJFhd7XlVdXhRKEx9vYBRVVVNKXQ4fCisSEXtfVldfC04TAGdXNVNdUQYVV1YyGBIgSm1UWVkITxELbmMFVFxYT10BEwMSEBZObWRZXQF7JzNvbwBUXl5KVAYdMhoiE0peVllUAEwSAl8sa1UQWExQBR8EExMUS11VXlkBTx8CZmUDUW1Ze1c; mobilev=html5; __jdv=249672349|github.com|-|referral|-|1653575227253; RT="z=1&dm=jd.com&si=689islvq3g6&ss=l3n4194l&sl=1&tt=0&obo=1&ld=82ve&r=04c3342dad20a95ddec84f65c77a7469&ul=82vj&hd=82wy"; wxa_level=1; cid=9; jxsid=16537120749883850084; webp=1; visitkey=67630768172721789; PPRD_P=UUID.1651579051101585908374; sc_width=390; shshshfpa=dc319f2a-735f-3de6-942e-c363d454cbd2-1653712130; shshshfpb=rhksfWo5J4I-Uh2XXc0Caqw; jcap_dvzw_fp=NGHQYjnhVqe7-kJgm5AX9D2E2C7ilDrvLZJ5LW2nlHJT2i_jfZ9ZEqYnR03Z6R9VD9Vmgw==; __jda=249672349.1651579051101585908374.1651579051.1653712075.1653731946.7; __jdc=249672349; appCode=ms0ca95114; share_open_id=; share_cpin=; shareChannel=; source_module=; share_gpin=; erp=; jxsid_s_u=https://home.m.jd.com/myJd/newhome.action; _gia_s_local_fingerprint=12d07500b81f739f629f5bbcfe86cf3c; equipmentId=WTEG2NK4IW57OW5NMN76HTNX7YUPP6NEDV4N27HK4EYET4ZLORFQ5TIR6L34T2HPO5TBCI2SA2OPC34KLD7H35SBGE; fingerprint=12d07500b81f739f629f5bbcfe86cf3c; deviceOS=; deviceVersion=101.0.4951.64; deviceName=Chrome; deviceOSVersion=; _gia_s_e_joint={"eid":"WTEG2NK4IW57OW5NMN76HTNX7YUPP6NEDV4N27HK4EYET4ZLORFQ5TIR6L34T2HPO5TBCI2SA2OPC34KLD7H35SBGE","ma":"","im":"","os":"Windows 10","ip":"36.5.144.153","ia":"","uu":"","at":"5"}; autoOpenApp_downCloseDate_jd_homePage=1653731963676_1; 3AB9D23F7A4B3C9B=WTEG2NK4IW57OW5NMN76HTNX7YUPP6NEDV4N27HK4EYET4ZLORFQ5TIR6L34T2HPO5TBCI2SA2OPC34KLD7H35SBGE; TrackerID=anl2nEJOaCV0GNTAVTcdB2Ikjupi-h0QecM3vMu6Pj96F1-mKr3hhOou0ABBw-0ZD3RkDta4_bC_NOrKkZgamf1sgw6sntZLv9Y3esU2OkfUfzxtNjpgR_zm9XrnL4MW4dA9kKCMBoqblp4WzLs2wQ; pt_key=AAJikfKtADBmiaoarqKS0RNRtdobBsINgisaj51burygrPF7k_grGRvL3ZUgT-_wuLy5oCjrqU4; pt_pin=s1815490070443017; pt_token=d9g2cjg5; pwdt_id=s1815490070443017; sfstoken=tk01m961f1abaa8sMXgyKzN4M0xwAC5k76hZmJoaQ/ki1FQ8xAVyBXjh8XnI3CfTfWd3CIIB9Sa+VGRVOF9yG866b8LO; whwswswws=; __jdb=249672349.10.1651579051101585908374|7.1653731946; mba_sid=16537319463572603689977440044.10; __wga=1653732014781.1653731952827.1653712124256.1653712124256.3.2; jxsid_s_t=1653732014889; shshshfp=205b0b08dcf0f1369585cb17ed5f2de3; shshshsID=f503406c6ffeb5b32ead0b2ff9f0e2da_5_1653732015921; __jd_ref_cls=MCommonBottom_Cart; retina=1; wqmnx1=MDEyNjM1MnQvam10dGlydmNhaj03NDg0NjgyTWwwaCBpZTEzZSApbEswMUggIG9yLy5iMThhMEUwNDYyczRVLTUxT0NIKigp; cartNum=47; kplTitleShow=1`
  push_key = `SCT151609TvHFngmV6BXKbbOoObcjHzuON`
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

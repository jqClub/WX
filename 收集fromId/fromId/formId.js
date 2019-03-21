//说明：文件的使用方法
// 1.formId.js文件放在utils文件夹下
// 1）html文件里写
// <form bindsubmit="formSubmit" report-submit="true">
// 	<!--最外层的 bindsubmit="formSubmit"用来收集用户的fromid-->
// 	<!--button formType="submit"，button加上这个，才会触发请求。只有button加上才有效，view标签加上，不会发送请求-->
// 	<!--hoverClass="none" 去除button的样式-->
// 	<button formType="submit" hoverClass="none" >
//
// 	</button>
// </form>
//
// 2.页面js文件中引入
// //12.24收集formId
// import formId from '../../utils/fromId/formId.js'
//
// //12.24新增，收集formId
//    formSubmit(event) {
//     formId.save({
//       	event: event,
// 		isDev: false,
// 		//12.24新增，使用appid的值
// 		appId: 'wx785bf0e261c3851f',
// 		//用来登录的appName
// 		appName: 'chushouziji',
//     })
//   },

import sign from './sign'

//是否显示打印的信息
const openLog = false
const log = function(...args) {
  if (openLog) {
    console.log.call(console, 'formId', ...args)
  }
}

// http://t1api.zuiqiangyingyu.net/index.php/api/common/Save_form_id?form_id=form_id&openid=openid&app=test
// https://api.zuiqiangyingyu.net/index.php/api/common/Save_form_id?form_id=form_id&openid=openid&app=test

export default {
  save({ event, appName, appId, isDev }) {
    log('开始收集formId, 事件对象为', event)
    return new Promise(resolve => {
      if (event.detail && event.detail.formId) {
        const formId = event.detail.formId
        log('formId为', formId)

        sign(appName, isDev)
          .then(res => {
            const openId = res.open_id
            const url = `https://${isDev ? 't1api.zuiqiangyingyu.net' : 'api.zuiqiangyingyu.net'}/index.php/api/common/Save_form_id`
            const data = {
              form_id: formId,
              openid: openId,
							//12.24修改，使用appid（不是使用appName）
							app: appId,
            }
            log('发送收集formId请求', url, data)
            wx.request({
              url,
              data,
              success: (result) => {
                log('收到收集formId响应', result)
                if (result.data.c == 0) {
                  log('收集formId成功')
                  resolve()
                } else {
                  log('收集formId失败: 请求失败')
                }
              },
              fail: () => {
                log('收集formId失败: 请求失败')
              },
              complete: () => {},
            })
          })
      } else {
        console.log('收集formId失败: 没有formId')
      }
    })
  },
}

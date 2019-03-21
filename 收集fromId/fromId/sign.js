/** 登录
   * @returns {promise}
   * @memberof Fun
   */
export default function(appName, isDev) {
  return new Promise((resolve) => {
    wx.getStorage({
      key: 'bmsAd_sign',
      complete: ({ data }) => {
        if (data) {
          resolve(data)
        } else {
          wx.login({
            success: ({ code }) => {
              const opt = {
                method: 'POST',
                header: { 'content-type': 'application/x-www-form-urlencoded' },
                url: `https://${isDev ? 't3game.zuiqiangyingyu.net' : 'game.zuiqiangyingyu.net'}/common/session/sign_in`,
                data: {
                  app_name: appName, // APP唯一标识符, 必填
                  code, // 微信code, 必填
                },
                success: (res) => {
                  const { data: data2 } = res.data
                  wx.setStorage({
                    key: 'bmsAd_sign',
                    data: data2,
                  })

                  resolve(data2)
                },
                fail(res) {
                  console.error('BMS登录失败', res)
                },
              }
              wx.request(opt)
            },
          })
        }
      },
    })
  })
}

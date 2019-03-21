/* # 判断是否分享成功小程序版
  ### 接口文档
  import wxShare from '../../utils/share/wxShare.js'; // 建议加上版本后缀

  onShow() {
    wxShare.bindShow()
  }

  onShareAppMessage() {
    return wxShare.main({
      isDev: false, // false-正式域名, true-开发域名, 默认为false
      isLog: false, // 是否打印，默认为true---这个参数无效，都会打印出来
      successNeedTime: 3000,  // 如果不能通过图片加载判断, 就根据该时间判断，默认为 3 秒
      title: '',
      path: '',
      imageUrl: '',
      successCallback() {},
      failCallback() {},
    })
  },

  ### 接口文档 - http://120.79.170.234:4999/web/#/35?page_id=579
  ### Version - 1.1.1
  ### 版本记录
  - 1.0.0 - 从立熙的小游戏版本改成小程序版本
  - 1.1.0 - 发现ios不能根据图片加载判断，优化了判断逻辑
  - 1.1.1 - 为避免和小程序原生方法冲突, success改为successCallback, fail改为failCallback
  
  
  //11.23备注：
  //			1.ios的无法判断是否分享成功，只能根据设置的时间来判断
//	      	2.安卓可以判断是否分享成功
//			3.本地的图片，不可以判断是否成功，只能根据时间来判断

*/

//const openLog = true
const openLog = false
const log = function(...args) {
  if (openLog) {
    console.log.call(console, 'wxShare', ...args)
  }
}

const md5 = require('./yt_md5')

const wxShare = {
  config: {
    domain: 'https://api.zuiqiangyingyu.net',
    successNeedTime: 3000,
  },

  startTime: 0, // 去分享时的时间戳
  endTime: 0, // 分享返回的时间戳
  isSharing: false, // 是否在分享中
  isHttpImage: false, // 分享图是否是网络图片
  platform: '', // 是什么系统
  shareSeq: '', // 这个
  successCallback: '',
  failCallback: '',

  setConfig(options) {
    if (options.isDev) {
      this.config.domain = 'https://t3game.zuiqiangyingyu.net'
    }
    if (options.successNeedTime) {
      this.config.successNeedTime = options.successNeedTime
    }
  },

  main: function(options) {
    log('开始分享', options)
    const that = this

    that.setConfig(options)

    that.successCallback = options.successCallback || function() {}
    that.failCallback = options.failCallback || function() {}

    that.isSharing = true
    that.startTime = Date.now()
    that.shareSeq = that.getRandNum()

    if (options.imageUrl) {
      if (options.imageUrl.includes('http')) {
        that.isHttpImage = true
        log('带网络分享图', options.imageUrl)
        let url = that.config.domain + '/index.php/api/pic_intercept/Pic_intercept'
        options.imageUrl = that.getSharePictureUrl(url, {
          url: options.imageUrl,
          seq: that.shareSeq,
        })
        log('处理后的分享图', options.imageUrl)
      } else {
        that.isHttpImage = false
        log('带本地分享图', options.imageUrl)
      }
    } else {
      that.isHttpImage = false
    }

    wx.getSystemInfo({
      success: function(res) {
        that.platform = res.platform
        log('platform', that.platform)
      },
    })

    return options
  },

  bindShow() {
    const that = this
    if (!that.isSharing) {
      return
    }
    log('从分享页返回')
    that.isSharing = false

    this.endTime = Date.now()
    let time = this.endTime - this.startTime
    log('分享页停留时间', time)
    log('平台为', that.platform)
    log('是否是网络图片', that.isHttpImage)

    if (that.platform === 'ios' || !that.isHttpImage) {
      log('只能根据时间判断')
      if (time > that.config.successNeedTime) {
        log('时间超过', that.config.successNeedTime, ', 分享成功, 触发成功回调')
        that.successCallback()
      } else {
        log('时间没超过', that.config.successNeedTime, ', 分享失败, 触发失败回调')
        that.failCallback()
      }
    } else {
      log('根据图片加载成功判断')
      that.getShareTicketResult((result) => {
        if (result) {
          log('加载了图片, 触发成功回调')
          that.successCallback()
        } else {
          log('没加载图片, 触发失败回调')
          that.failCallback()
        }
      })
    }
  },

  getShareTicketResult: function(callback) {
    let url = '/index.php/api/pic_intercept/Has_pic_intercept'

    let sign = this.getSharePictureSign(url, {
      seq: this.shareSeq,
    })

    log('发送判断图片是否加载成功请求', url, {
      seq: this.shareSeq,
      sign: sign,
    })
    this.get(url, {
      seq: this.shareSeq,
      sign: sign,
    }, (response) => {
      log('收到判断图片是否加载成功的响应', response)
      if (response) {
        if (response.d && response.d.has == 1) {
          callback(true)
        } else {
          callback(false)
        }
      } else {
        callback(false)
      }
    })
  },

  getSharePictureUrl: function(url, params) {
    let ticket = 'vUgNMTtQolAjZnYxw9GdiI0Vxper4epW'
    params.ticket = ticket
    let p = this.ksort(params)
    let preSign = url + '?'
    let count = 0
    for (let i in p) {
      if (count == 0) {
        preSign += i + '=' + p[i]
      } else {
        preSign += '&' + i + '=' + p[i]
      }
      count++
    }
    // preSign = encodeURIComponent(preSign);
    return preSign
  },

  getSharePictureSign: function(url, params) {
    let ticket = 'vUgNMTtQolAjZnYxw9GdiI0Vxper4epW'
    params.ticket = ticket
    let p = this.ksort(params)
    let preSign = url + '?'
    let count = 0
    for (let i in p) {
      if (count == 0) {
        preSign += i + '=' + p[i]
      } else {
        preSign += '&' + i + '=' + p[i]
      }
      count++
    }
    preSign = encodeURIComponent(preSign)
    return md5(preSign)
  },

  ksort: function(obj) {
    let keys = Object.keys(obj).sort(),
      sortedObj = {}
    for (let i in keys) {
      sortedObj[keys[i]] = obj[keys[i]]
    }
    return sortedObj
  },

  get: function(url, reqData, callback) {
    let that = this

    url += '?'
    for (let item in reqData) {
      url += item + '=' + reqData[item] + '&'
    }

    wx.request({
      url: that.config.domain + url,
      method: 'GET',
      success: (result) => {
        callback(result.data)
      },
      fail: () => {
        callback(false)
      },
    })
  },

  post: function(url, reqData, success_callback, fail_callback) {
    let that = this
    let param = ''
    for (let item in reqData) {
      param += item + '=' + reqData[item] + '&'
    }

    wx.request({
      url: that.config.domain + url,
      data: {},
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (result) => {
        success_callback(result.data)
      },
      fail: () => {
        fail_callback(false)
      },
    })
  },

  getRandNum: function() {
    let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let nums = ''
    for (let i = 0; i < 32; i++) {
      let id = parseInt(Math.random() * 61)
      nums += chars[id]
    }
    return nums
  },
}

export default wxShare

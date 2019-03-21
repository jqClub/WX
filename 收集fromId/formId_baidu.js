//获取应用实例
var app = getApp()
 //10.15新增缓存内容
var getWx = require("./getWx.js") 

//11.06新增引入ajax请求
var wxRequest = require("./wxRequest.js")

 //10.15新增缓存内容
var wcache = require("./wcache.js") 

var log = console.log.bind(console)

//保存fromid(入口)
var saveFromId = function(page, {event}) {
	var formId = event.detail.formId
//	log('开始收集formId, 事件对象为', event, formId)
	//备注，由于后台无法区分swan_id和open_id，所以统一传swan_id
	//1.先判断是有swan_id，如果没有，先去请求，并保存在本地
	var swan_id = app.data.swan_id
	if(!swan_id) {
		//没有，就去请求swan_id
		getSwanId(page, function(swan_id) {
			//成功后再去发送请求
			sendFrom(formId, swan_id)
		})
		return 
	} 
	//直接发送
	sendFrom(formId, swan_id)
}
//1.去获取用户的swan_id
var getSwanId = function(page, fun) {
	getWx.getSwanId(function(res) {
		var swan_id = res.data.swanid
		if(swan_id == "swanid only valid on real phone device") {
			//说明是开发工具上的，不去请求接口
			log('收集fromId失败--开发工具上')
			return 
		}
		
		if(!swan_id) {
			log('getSwanId没有swan_id', res)
			return 
		}
		//设置一个全局的变量
		app.data.swan_id = swan_id
		
		//12.03新增存本地，因为后面登录的时候，需要取这个值
		wcache.put('swan_id', swan_id)
		if(typeof fun == 'function') {
			fun(swan_id)
		}
	}, function(res) {})
}

//2.去请求接口
//接口文档： http://120.79.170.234:4999/web/#/35?page_id=654
var sendFrom = function(formId, swan_id) {
	//19.1.9新增判断条件
		if(!formId) {
			log('收集失败，没有formId')
			return
		}
		if(!swan_id) {
			log('收集失败，没有swan_id')
			return
		}
		//类型给string
		var appId = '' + app.data.logmsg.appId
	  const data = {
			  form_id: formId,  //收集到的fromid
			  openid: swan_id, //发送swan_id，替代之前的open_id
				app: appId,  //类型给string
		}
	  //发送ajax请求
		var result = {
		  url: app.data.API.FORM_ID,  //请求的地址
		  data: data, 
		}
	  wxRequest.ajaxNew(result).then(function(res) {
	  	log('收到收集formId响应', res)
//	  	if (res.c == 0) {
////	  		app.showToastNew('aaaaaaa')
//	      log('收集formId成功')
//	    } else {
//	      log('收集formId失败: 请求失败')
//	    }
	  })
}

module.exports = {
  saveFromId: saveFromId,
}


//export default {
//save({ event, appId, isDev }) {
//  log('开始收集formId, 事件对象为', event, appId, isDev)
////  return new Promise(resolve => {
////    if (event.detail && event.detail.formId) {
////      const formId = event.detail.formId
////      log('formId为', formId)
////
////      sign(appName, isDev)
////        .then(res => {
////          const openId = res.open_id
////          const url = `https://${isDev ? 't1api.zuiqiangyingyu.net' : 'api.zuiqiangyingyu.net'}/index.php/api/common/Save_form_id`
////          const data = {
////            form_id: formId,
////            openid: openId,
////							//12.24修改，使用appid（不是使用appName）
////							app: appId,
////          }
////          log('发送收集formId请求', url, data)
////          wx.request({
////            url,
////            data,
////            success: (result) => {
////              log('收到收集formId响应', result)
////              if (result.data.d == 0) {
////                log('收集formId成功')
////                resolve()
////              } else {
////                log('收集formId失败: 请求失败')
////              }
////            },
////            fail: () => {
////              log('收集formId失败: 请求失败')
////            },
////            complete: () => {},
////          })
////        })
////    } else {
////      console.log('收集formId失败: 没有formId')
////    }
////  })
//},
//}

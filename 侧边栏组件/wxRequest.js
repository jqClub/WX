var log = console.log.bind(console)

//const url = "https://game.zuiqiangyingyu.net"  //这里先不加前缀
var ajax = function(model) {
	//wx.showLoading({
	//  title: '加载中',
	//})
	//拼接url
	//model.url = url + model.url; 
	model.url = model.url
	//get参数拼接
	if(model.method == "get" && model.data !== undefined) {
		for(let k in model.data) {
			if(model.data[k].toString() !== '') {
				model.url = model.url + "&" + k + "=" + model.data[k];
			}
		}
		model.data = '';
	}
//	log(`ajax发送的数据: ${JSON.stringify(model)}`)
	//返回Promise对象
	return new Promise(function(resolve, reject){
			wx.request({
				method: model.method,
				url: model.url || '',
				data: model.data || {},
				header: {
					//07.06需要设置Content-Type
					"Content-Type": "application/x-www-form-urlencoded", 
				},
				success: function(res) {
					//        wx.hideLoading()
					if(res.statusCode == 200) {
						resolve(res.data);
					} else {
						reject()
						console.log('服务器错误，请联系客服')
						//错误信息处理
//						wx.showModal({
//							title: '提示',
//							content: '服务器错误，请联系客服',
//							showCancel: false,
//						})
					}
				}
			})
		}
	)
}

//设置请求的type
var conType = function(type) {
	var result = 'application/json'
	if(type == 'urlencoded') {
		result = "application/x-www-form-urlencoded"
	}
	return result
}
var ajaxNew = function(model) {
	var contentType = model.contentType
	//返回Promise对象
	return new Promise(function(resolve, reject){
			wx.request({
				method: model.method || 'GET', 
				url: model.url || '',
				data: model.data || {},
				header: {
					'content-type': conType(contentType),
				},
				success: function(res) {
					if(res.statusCode == 200) {
						resolve(res.data);
					} else {
						reject()
						console.log('服务器错误，请联系客服')
						//错误信息处理
//						wx.showModal({
//							title: '提示',
//							content: '服务器错误，请联系客服',
//							showCancel: false,
//						})
					}
				}
			})
		}
	)
}

module.exports = {
	ajax: ajax,
	ajaxNew: ajaxNew,
}
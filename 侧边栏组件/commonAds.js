//××××××××××××××××××××××××××××××××××××××××××××××
//这里的contentType,需要改类型
//contentType: "application/x-www-form-urlencoded",


//07.23新增icon入口（游戏后台）
var log = console.log.bind(console)
//获取应用实例
var app = getApp()

var wcache = require("./wcache.js") //引入缓存的机制

import { ajax } from './wxRequest.js'   //引入ajax请求模块

var prefixion = 'https://game.zuiqiangyingyu.net'
//var appName = 'caigedatiwang'

var appName = app.data.logmsg.appName
//游戏广告信息
var commonApi = {
//	getAds: prefixion + '/common/game/ads',   //获取所有的广告

	//12.14新增，接入bms2的广告接口
	getAds: prefixion + '/common/game/v2/ads',   //获取所有的广告
	showAd: prefixion + '/statistics/ad/show',   //展示广告位的接口
	clickAd: prefixion + '/statistics/ad/hit',	//点击广告位的接口
}

var first = 0

var flags = {
	'1': 'header_icon',
	'2': 'common_ads',
}

//12.14新增，因为接入了bms广告，原来的接口中有些字段没有了，直接新加字段
var addAdField = function(list) {
	list = list || []
	for(let x = 0; x < list.length; x++) {
		var a = list[x]
//		这里加2个字段, 匹配原来的
		a.appId = a.adWxAppId
		a.icon = a.image
	}
	return list
}

//新增的icon入口，获取游戏后台传过来的广告
var getAds = function(sData) {	
	//发送ajax请求
	var result = {
	  url: commonApi.getAds,  //请求的地址
	  data: {
			app_name: appName
		}, 
		contentType: "application/x-www-form-urlencoded",
	}
	
	//08.21新增， 只请求一次数据
	ajax(result).then(function(res) {
//		console.log('获取后台广告-返回', JSON.stringify(res));
		
		getAdsSucceed(res, sData)
	})
	
//	if(first == 0) {
//		ajax(result).then(function(res) {
//			console.log('获取后台广告-返回', res);
//			
//			getAdsSucceed(res, sData)
//		})
//		first++
//	}
}

var getAdsSucceed = function(res, sData) {
	var that = sData.page
	var app = sData.app
	if(res.code == '0') {
		var common_ads = [];
		var header_icon = []
		
		var other_icon = []
		var list = res.data.list;
		
		//12.14新增，接入bms2的广告接口
		list = addAdField(list)
//		console.log('获取后台广告-返回1111', JSON.stringify(list));
		
		//设置列表数据
		app.data.adList = list || []
		
		//10.23新增获取所有的广告内容
		that.setData({
			adList: app.data.adList,
		})
		
		//10.25修改，广告点击切换的效果
		return
		
		
//1：图片广告（更多游戏入口），2：小程序广告(小程序间跳转)，3：启动广告（首页活动预告），4：路径跳转广告（路径参数或跳转）
//10.23新增现在底部的和更多好玩，取得type：1更多游戏入口
//左边得取得type：2小程序广告
//右边取得type：3启动广告

		//只取type == 2 的数据
		for(let x = 0; x < list.length; x++) {
			var a = list[x]
			if(list[x].type == '2') {
				common_ads.push(a);
			} else if (list[x].type == '1') {
				//08.17新增处理，icon广告位置
				header_icon.push(a)
			} else if (list[x].type == '3') {
				//新增的地方
				other_icon.push(a)
			}
		}
		
		app.data.common = common_ads
		app.data.header = header_icon
		
		//08.21新增，显示广告
		saveData(common_ads, that, sData, 'common_ads')
		//08.21新增
		saveData(header_icon, that, sData, 'header_icon')
		//08.27新增，设置其他地方的广告位置
		saveOtherData(other_icon, that, sData)
	}
}


//08.27新增其他地方的位置
var saveOtherData = function(arr, that, sData) {
	arr = arr || []
	var otherObj = {
		'bottom1': [],
		'bottom2': [],
		'box': [],
	}
	var otherObkey = Object.keys(otherObj)
	//如果长度大于1，才去切片
	var len = arr.length
	if(len > 1) {
		for(let i = 0; i < len; i++) {
			var a = arr[i]
			var flag = a.flag
			if(otherObkey.indexOf(flag)>-1) {
				otherObj[flag].push(a)
			}
		}
	}
	sendAsk(otherObj, that, sData)
//	return otherObj
}
//发送请求
var sendAsk = function(otherObj, that, sData) {
//	var otherObkey = Object.keys(otherObj)
	for(var key in otherObj) {
		let arr = otherObj[key]
		//先按照权重进行排序
		var arr = arr.sort((item1, item2) => {
	    	return Number(item2.weight) - Number(item1.weight)
		})
//		切片,只保留一个地方
		if(arr.length >= 1) {
			arr = arr.slice(0, 1)
			otherObj[key] = arr
			//发送请求
			//显示的参数，去发送请求
			addTsji('showAd', arr[0])
		}
	}
	//设置参数		
	that.setData({
		other_icon: otherObj
	})
}

/////////////////////////////////////////////////////////
//08.21新增设置数据
var setDataNew = function(that, sData, showAd, flag) {
	//如果没有id，不去设置数量
	if(!showAd) {
		return 
	}
	
//	log(`当前显示icon: ${JSON.stringify(showAd)}`)
	var flagNew = flag
	//设置参数		
	that.setData({
		[flag]: showAd,
	})
	//07.05新增，加上广告的统计
	app.data[flag] = showAd
	
	//显示的参数，去发送请求
	addTsji('showAd', showAd)
	//保存显示的icon
	saveIcon(flag)
}


//显示过就保存在本地
var saveData = function(arr, that, sData, flag) {
	arr = arr || []
	//先按照权重进行排序
	var arr = arr.sort((item1, item2) => {
      return Number(item2.weight) - Number(item1.weight)
  	})

	//获取本地数据
	saveLocal(that, sData, flag)
}



//07.05新增统计数据,加上游戏后台的统计
var addTsji = function(type, icon) {
	//icon，这里是个对象
	var common_ads = icon
//	var common_ads = app.data.common_ads
	var open_id = app.data.open_id
	if(!common_ads) {return} //如果没有common_ads，不去请求数据
	if(!common_ads.id) {return}
	if(!open_id) {return}
	//type: 是点击，还是显示
//	var common = 'https://game.zuiqiangyingyu.net'
//	var commonApi = {
//		showAd: common + '/statistics/ad/show',   //展示广告位的接口
//		clickAd: common + '/statistics/ad/hit',	//点击广告位的接口
//	}
	var userInfo = app.data.userInfo   //用户的信息
	
	var data = {
//	  "app_name": common_ads.appName,
		"app_name": appName,
	  "open_id": open_id,  //微信的openid
	  "name": userInfo.nickName || '',   //微信用户的信息
	  "gender": userInfo.gender || '', //微信用户的信息
	  //12.14修改，这个在bms2接口中没有，所以注释掉
//	  "type": Number(common_ads.type),
		
	  "ad_id": Number(common_ads.id),
	  "weight": Number(common_ads.weight),
	}
	ajax({
	  method: 'POST',
	  url: commonApi[type],  //请求的地址
	  data: data, //请求的参数
	}).then(function(res) {
//		log(`response: ${JSON.stringify(res)}`)
	})  
}

//点击广告的逻辑
var clickAd = function(sData, e) {
	var that= sData.page
	var id = sData.id
	//显示的参数，去发送请求
	var adList = app.data.adList || []
	
	var findAd = adList.find(function (x) {
	    return x.id === id
	})
	
	if(findAd) {
		//发送点击的请求
		addTsji('clickAd', findAd) 
		
		
		//08.27如果是上面的2个icon才切换位置
		if(findAd.type != 3) {
			//08.21新增,修改位置
			iconChange(that, sData, findAd)
		}
	}
}

//保存数据在本地
var saveLocal = function(that, sData, flag) {
	var arr = app.data.header
	if(flag == 'common_ads') {
		var arr = app.data.common
	}
	//获取本地数据
	var id = wcache.get(flag)
	var index = 0
	var indexFind = findIndex(id, arr) || 0
	if(id) {
		index =  indexFind + 1
		if(index == arr.length) {
			index = 0
		}
	}
	//去设置
	var showAd = arr.slice(index, index+1)[0]
	setDataNew(that, sData, showAd, flag)
}
//保存icon的id
var saveIcon = function(flag) {
	//08.21点击之后，添加到数组里面去,当前显示的icon id
	var common_ads = app.data[flag]
	let id = common_ads.id
	wcache.put(flag, id)
}

//08.21新增,修改位置
var findIndex = function(id, arr) {
	var index = 0
	for (let i = 0; i < arr.length; i++){
		var a = arr[i].id
		//当前的icon所在的位置
		if(id == a) {
			return i
		}
	}
	return index
}

//取数组中下一个
var iconChange = function(that, sData, findAd) {
	var type = findAd.type
	var flag = flags[type]
	//获取本地数据
	saveLocal(that, sData, flag)
}

module.exports = {
	getAds: getAds,  //获取广告
	clickAd: clickAd, //点击广告
	//10.23新增
	addTsji: addTsji, //统计需求
}
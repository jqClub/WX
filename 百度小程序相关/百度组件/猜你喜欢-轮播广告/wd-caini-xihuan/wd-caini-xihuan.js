// import c from '../../utils/console';
var log = console.log.bind(console)

const app = getApp();
const appData = app.data;
let comp;

var timer = null

const compObj = {
  options: {
    multipleSlots: true,
  },
  externalClasses: ['myclass'],
  data: {
    isOpen: false, // 是否展开
  },
  properties: {
//  myprop: {
//    type: Object,
//    value: {},
//    // observer(newVal, oldVal, changedPath) {
//    //   if (!newVal) return;
//    // },
//  },
//  mymeth: {
//    type: Object,
//    value: {},
//    observer(newVal) {
//      if (!newVal) return;
//      const meth = this[newVal.name];
//      if (meth) meth(newVal.data);
//    },
//  },

    list: {
      type: Array,
      value: [],
    },
    list2: {
      type: Array,
      value: [],
    },
  },
  created() {
    comp = this;
  },
  attached() {
    // this.setData({
    //   userInfo: appData.userInfo,
    // });

  },
  detached() {},
  methods: {
    trigger(e = {}, isBubble) {
      const target = e.currentTarget;
      const data = target ? target.dataset : e;
      log(2222, data)
      
      app.bmsAd.subMsg(data.msg, true) // 展示元素时调用
		
    },

    // 开关
    switch() {
    	var that = this
      const isOpen = !this.data.isOpen;
      this.setData({ isOpen });
      var list1 = that.data.list || []
      var list2 = that.data.list2 || []
      var all = list1.concat(list2)
      
      var len = all.length
      //这里去设置定时器
      if(isOpen) {
      	that.setInter(len)
      } else {
      	that.clearTimer()
      }
      
      //12.27新增，这里发送请求
      if(isOpen) {
      	for(var i = 0; i < len; i++) {
						var a = all[i]		
//						//发送展示
						app.bmsAd.subMsg(a) // 展示元素时调用
				} 
      }
    },
    detached: function() {
    	//组件移除时执行
    	that.clearTimer()
    },
    //开始定时器
    setInter(len) {
    	var that = this
    	var i = 0
    	log('-开启定时器-')
    	timer = setInterval(function() {
    		i++
    		if(i > len) {
    			i = 0
    		}
    		that.setData({
    			showIndex: i,
    		})
//  		log(i)
    	}, 500)
    },
    //关闭定时器
    clearTimer() {
    	var that = this
    	if(timer) {
    		log('-关闭定时器-')
    		clearInterval(timer)
    	}
    },
    
     openImg(e) {
	  	var that = this
	  	var target = e.currentTarget.dataset
	  	var msg = target.msg
	  	log('openImg1', target)
	  	log('openImg2', msg)
	  	//12.21点击发送，里面有处理为空的情况
      	app.bmsAd.subMsg(msg, true) // 点击元素时调用
      
      
	  	var img = msg.poster
	  	if(!img) {
	  		log('没有配置预览图片')
	  		return
	  	}
	  	var urls = []
	  	urls.push(img)
	  	//图片预览
      	swan.previewImage({
			  current: img, // 当前显示图片的http链接
			  urls: urls // 需要预览的图片http链接列表
			})
      
      
	  },
  },

};

Component(compObj);

///**
// * wd-loop-ad
// * @desc 广告(小程序跳转) 循环显示
// * @需求 1、icon按BMS后台设置的权重排序进行展现
// *       2、用户点击过icon后，icon位自动更换为下一个用户未点击过的icon
// *       3、如所有icon都已点击过，即重新按排序出现
// *       4、用户如点击过一个icon，退出小程序再次进入，icon位也会自动更换为下一个
// * @param {array} [adList] - 从BMS得到的广告列表
// * @param {string} [type] -  需要循环的广告的type
// * @param {string} [flag] - 需要循环的广告的flag
// *
// * @example
// * "usingComponents": {
// *  "wd-loop-ad": "../../components/wd-loop-ad/wd-loop-ad",
// * }
// *  <wd-loop-ad ad-list="{{bmsAdList}}" bind:click="跳转小程序" bind:show="统计小程序显示"></wd-loop-ad>
// * @author: 张晓彬
// * @version: 1.0.1  2018.08.21
// * 			1.0.2  2018.12.14 新接入的bms2广告，没有type，不用管这个字段
// * 
// * 
// */
//var log = console.log.bind(console)
//var commonAds = require("../../utils/commonAds.js")  //接入BMS广告后台
//var wcache = require("../../utils/wcache.js") //引入缓存的机制
//
////获取应用实例
//var app = getApp()
//
////var STORAGE_KEY_ADLIST = 'loop-ad.currentAdList'
////var STORAGE_KEY_INDEX = 'loop-ad.index'
//
//Component({
//
//properties: {
//  // 从BMS获取的广告列表
//  adList: {
//    type: Array,
//    value: [],
//    observer(newVal) {
//    	var that = this
//    	
//      if (!newVal.length) return
//
//      // 通过type和flag筛选需要循环的广告并根据权重排序
//      var currentAdList = newVal.filter(item => {
////        return item.type === this.data.type && item.flag === this.data.flag
////2018.12.14 新接入的bms2广告，没有type，不用管这个字段
//			return (item.flag === this.data.flag)
//      }).sort((item1, item2) => {
//        return Number(item2.weight) - Number(item1.weight)
//      })
//      
////      //10.23新增判断条件
////      var flag = this.data.flag 
////		//获得对应的本地key值
////		
////		var STORAGE_KEY_INDEX = that.getKey(flag)
////		
////		// 获取上次的index
////      var index = wcache.get(STORAGE_KEY_INDEX) || 0
//		var index = 0
//		currentAdList = currentAdList || []
//		var len = currentAdList.length
//		//设置下，如果是大于0，就显示出来
//		if(!len) {
//			return
//		}
//		
//		that.setData({
//			showAd: true,
//		})
//		
//		if(index > len) {
//			index = 0
//			//设置本地的值
////			wcache.put(STORAGE_KEY_INDEX, index)
//		}
//
//
//      this.setData({
//        currentAdList,
//        index,
//        
//        appData: currentAdList[index],
//      })
//      
//      log(111111111, this.data.appData)
//
//      // 触发show事件, 用于统计
//      this.emitShow()
//    }
//  },
//
////2018.12.14 新接入的bms2广告，没有type，不用管这个字段
////  // 需要循环的广告的type
////  type: {
////    type: String,
////    value: '2',
////  },
//
//  // 需要循环的广告的flag
//  flag: {
//    type: String,
//    value: '',
//  },
//  //传递的值
//  scrolls: {
//  	type: Array,
//     value: [],
//  },
//},
//
//data: {
//  currentAdList: [],
//  index: 0,
//  showAd: false,
//  
//  
//  autoplay: false,  //是否自动播放
//  interval: 1000, //自动切换时间间隔
//  duration: 1000,  //滑动动画时长
//  circular: true, //是否轮播
//  imgUrls: [
//    'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
//    'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
//    'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
//  ],
//  
//  toView: 'yellow',
//  scrollLeft: 0,
////  //滚动的数组
////  scrolls: [
////    {
////      name: '黄色',
////      tag: 'yellow', 
////    },
////    {
////      name: '绿色',
////      tag: 'green',
////    },
////    {
////      name: '红色',
////      tag: 'red',
////    },
////    {
////      name: '黄色',
////      tag: 'yellow',
////    },
////    {
////      name: '绿色',
////      tag: 'green',
////    },
////    {
////      name: '红色',
////      tag: 'red',
////    },
////  ],
//},
//
//methods: {
//  /*tap() {*/
// 	ad_navigateToMiniProgram() {
// 		var that = this
// 		var appData = that.data.appData
// 		
// 		var sData = {
// 			appid: appData.appid || appData.appId,
// 			path: appData.page || appData.path,
// 			data: appData.extra,
// 		}
// 		
// 		//10.23新增，如果成功，才执行回调函数
////		if(app.data.obj_can.comparison207) {
////			//如果是支持navigateToMiniProgram方法,就使用新的
////			return
////		}
//
// 		//调用小程序跳转的方法(navigateToMiniProgram函数中会先判断下，版本号，再去执行跳转的方法)
//		app.navigateToMiniProgramNew(sData.appid, sData.path, sData.data, sData.envVersion, that.successEvent.bind(that))
//  },
// successEvent :function() {
// 		var that = this
// 		var currentAdList = that.data.currentAdList
//    // 触发click事件
//    this.emitClick()
//
//    const oldIndex = this.data.index
//    // 循环
//    let index = ++this.data.index
//    if (index >= this.data.currentAdList.length) {
//      index = 0
//    }
//    
//    var appData = currentAdList[index] || {}
//    
//    this.setData({
//    	index,
//    	
//    	appData: appData,
//    })
//
//    if(oldIndex !== index){
//      // 触发show事件, 用于统计
//      this.emitShow()
//		
////		//获得对应的本地key值
////		var flag = that.data.flag 
////		var STORAGE_KEY_INDEX = that.getKey(flag)
////		
////		wcache.put(STORAGE_KEY_INDEX, index)
//    }
//    
//    
//    
////    //10.23新增统计数据，跳转过去的统计
////    	var appid = appData.appId
////    	if(appid) {
////    		app.commonMtaNew('adsstatistical', 'appid', appid)
////    	}
// },
//
//  // 触发show事件, 用于统计
//  emitShow() {
//  	var that = this
//  	var showAd = this.data.currentAdList[this.data.index]
////    this.triggerEvent('show', showAd)
////    
////    //10.23新增统计的需求(//显示的参数，去发送请求)
//////    log('showAd', showAd)
////    commonAds.addTsji('showAd', showAd)
//		app.bmsAd.subMsg(showAd) // 展示元素时调用
//  },
//
//  // 触发click事件
//  emitClick() {
//  	var that = this
//  	var showAd = this.data.currentAdList[this.data.index]
////    	this.triggerEvent('click', showAd)
////    
////     //10.23新增统计的需求
////      log('click', showAd)
////     	commonAds.addTsji('clickAd', showAd)
//
//		app.bmsAd.subMsg(showAd, true) // 展示元素时调用
//  },
//}
//})

var log = console.log.bind(console)
var app = getApp()
//11.06新增引入ajax请求
var wxRequest = require("../../utils/wxRequest.js")

//11.06新增引入util
var util = require("../../utils/util.js")

// //10.15新增缓存内容
//var wcache = require("../../utils/wcache.js") 

//设置获得的音符数量
var setYnfu = function(money) {
	money = money || 0
	money = Number(money)
	var result = 10
	if(money > 801) {
		
	} else if(money > 500) {
		result = 20
	}  else if(money > 300) {
		result = 30
	}  else if(money > 100) {
		result = 50
	}  else {
		result = 100
	}
	return result
}

//19.2.15出现的题目数

//倒计时时长
var timer = 7 * 10;
var totalTime = 7 * 10;
var progress_first = 522
//每份长度
var one_width = progress_first / timer

var clickTimer = progress_first

let compObj = {
  properties: {
    page: {
      type: String,
      value: '',
    },
  },
  data: {
    //进度条的宽度
    progress_width: progress_first,
    remainingTime: timer,
		treasure: {
			type: 0,
			delayed: false, //设置延迟出现
		},
		//设置延迟出现
  },
  created: function() {
  	var that = this
  	//初始化定时器
  	that.setDelayed()
  },
  methods: {
  		  //初始值
	  setFirst: function(obj) {
	  	var that = this
		log('初始化值', setYnfu(obj.money))
		that.setDelayed.first()
			
	  	var str = 'treasure.type'
	  	var str1 = 'treasure.showAd'
	  	totalTime = timer
	  	that.setData({
	  		remainingTime: totalTime,
	  		progress_width: progress_first, 
	  		[str]: 0,
	  		//奖励的音符数量
	  		money: setYnfu(obj.money),
	  		clickTime: false,
	  		[str1]: 0,
	  	})
	  	
	  	clickTimer = progress_first
	  	
	  	that.setFirstAnimation()
	  },
	  setFirstAnimation: function() {
	  	var that = this
	  	//设置动画，先到满，然后到0,点击的时候，才增加
	  	that.setData({
	  		progress_width: progress_first,
	  	})	
	  	
		var setIntervalTime = 100
	  	this.redpacketTimer1 = setInterval(() => {
			if(totalTime <= 0) {
				clearInterval(this.redpacketTimer1);
		  		return
		  	}
			
			var resultLen = 150
	  		if(that.data.clickTime) {
	  			setIntervalTime = 200
	  			resultLen = 30
	  		}
			clickTimer = clickTimer - resultLen
		    if (clickTimer <= 0) {
		    	clickTimer = 0
			    this.setData({
					progress_width: 0,
		      	});
		        return;
		      }
		      this.setData({
					progress_width: clickTimer,
		      });
//	    }, 100);
		}, setIntervalTime);
	  },
  	    //点击排行榜，提示授权的弹窗
	//10.09新增公用的点击事件
  clickAll: function(e) {
  	var that = this
  	var clickType = e.target.dataset.clicktype
//	log('点击的事件名称', clickType)
  	that.clickEvent(clickType)
  },
  clickEvent: function(clickType) {
	  	var that = this
	  	if(!clickType) {
	  		return
	  	}
	  	var events = {
		  	close: function() {
		  		log('关闭弹窗')
		  		that.closeAll()
		  	},
		  	get_reward: function() {
		  		log('领取奖励')
		  		
		  		//频率控制
					if(app.gettimestamp() - app.data.function_time < app.data.frequency) {
						console.log('点太快了你');
						return
					}
					app.data.function_time = app.gettimestamp();
		
		  		//去请求接口来增加音符数量，成功后关闭弹窗
		  		that.getSubDraReward()
		  	},
		  	clickTime: function() {
		  		that.setData({
		  			clickTime: true,
		  		})
		  		//设置步进的长度
				var stepLen = 130				
//				var stepLen = 110

		  		clickTimer = clickTimer + stepLen
				var jnduLength = util.randomNum(450, 480)
				if(clickTimer >= jnduLength) {
		  			log('点击已满')
		  			that.setData({
		  				progress_width: progress_first,
		  			})
//					//获得奖励
					that.openTreasure()
		  			return 
		  		}
		  	}
		  }
	  	
	  	if(typeof events[clickType] == 'function') {
	  		events[clickType]()
	  	}
  	},
  	//打开宝箱,领取音符
  	openTreasure: function() {
  		var that = this
  		//清空上一个的定时器
  		that._clearTime()
  		
  		that.setDelayed.first()
  		
  		if(that.timeSet1) {
	  		clearTimeout(that.timeSet1)
	  	}
  		var str = 'treasure.showAd'
  		that.setData({
			[str]: 1,
		})
  		that.timeSet1 = setTimeout(function() {
    		var str = 'treasure.type'
			that.setData({
				[str]: 1,
			})
		}, 1000)
  	},
  	//根据长度去计算进度条的宽度
  	calculate_Width(num) {
  		var that = this
  		num = num * 10
  		var width = (one_width * num)
			that.setData({
				progress_width: width,
			})
  	},
  	//新增的带上毫秒的倒计时
	  _prefixInteger(num, length) {
	    return (Array(length).join("0") + num).slice(-length);
	  },
	  //清空定时器
	  _clearTime: function() {
	  	var that = this
	  	var redpacketTimer = that.redpacketTimer
	  	if(redpacketTimer) {
	  		 // 倒计时结束
	      clearInterval(this.redpacketTimer);
	  	}
	  	
	  	var redpacketTimer1 = that.redpacketTimer1
	  	if(redpacketTimer1) {
	  		 // 倒计时结束
	      clearInterval(this.redpacketTimer1);
	  	}
	  	//清空定时器
	  	if(that.timeSet) {
	  		clearTimeout(that.timeSet)
	  	}
	  	if(that.timeSet1) {
	  		clearTimeout(that.timeSet1)
	  	}
	  },
	  showRedpacketIcon: function(obj) {
	  	var that = this
	  	//设置初始值
	  	that.setFirst(obj)
	    console.log("==== _showRedpacketIcon ===");
//	    this.setData({
//	      isShowRedpacketIcon: true
//	    });
//	    let totalTime = 10 * 60 * 10;
	    this.redpacketTimer = setInterval(() => {
	      totalTime -= 1;
	      if (totalTime < 0) {
	       	that.openTreasure()
	        return;
	      }
//	      const minute = this._prefixInteger(parseInt(totalTime / 600), 2);
//	      const second = this._prefixInteger(parseInt((totalTime % 600) / 10), 2);
//	      const aSecond = (totalTime % 600) % 10;
			const second = this._prefixInteger(parseInt((totalTime % 600) / 10), 1);
	      const aSecond = (totalTime % 600) % 10;
	      this.setData({
				remainingTime: `${second}.${aSecond}`
	      });
	      
//	      that.calculate_Width(that.data.remainingTime)
	    }, 100);
	  },
	  ///////////////////////////////////
	  //设置延迟2s后出现
	  setDelayed: function() {
	  		var that = this
//	  		var timeSet
	  		var result = {
	  			first: function() {
	  				var self = this
	  				self.clear()
	  				
	  				var str = 'treasure.delayed'
	  				that.setData({
	  						[str]: false,
	  				})
	  				
	  				that.timeSet = setTimeout(function() {
	  					that.setData({
	  						[str]: true,
	  					})
	  				}, 2000)
	  			},
	  			clear: function() {
	  				if(that.timeSet) {
	  					clearTimeout(that.timeSet)
	  				}
	  			}
	  		}
	  		that.setDelayed = result
	  },
	  ///////////////////////////////////
	  //关闭所有的界面，并且清空所有的回调
	  closeAll() {
	  	var that = this
	  	//清空上一个的定时器
		that._clearTime()
	  	
	  	//触发成功回调
  		that.triggerEvent("closegrade");
	  },
	  //将次数保存在本地
	  setOpneGrade(num) {
//	  	var that = this
//	  	if(num == 0) {
//	  		num = 'no'
//	  	}
//	  	//新用户，存本地
//			wcache.put('openTime', num, wcache.nextDayTime()) 
	  },
//	  接口请求//11.07新增，获取用户信息
		getSubDraReward: function(callBack) {
			var that = this
			var token = app.data.userInfo.token
			if(!token) {
				log('getUserInfoApi_token--为空')
			}
			var let_data = {
				token: token,
			}
			//发送ajax请求
			var result = {
			  url: app.data.API.SUB_DRAW_REWARD,  //请求的地址
			  data: {
			  	token: token,
			  }, 
			}
			wxRequest.ajaxNew(result).then(function(res) {
				log(`-SUB_DRAW_REWARD-: ${JSON.stringify(res)}`)
				if(res.c == '0') {
						var rData = res.d
//					//用户的排名信息
//					var userData = res.d.user
//					that.setData({
//						money: userData.score,
//						userData: userData,
//					})
						
//					//设置剩余的次数
//					that.setOpneGrade(rData.num)
						
					//关闭所有的
					that.closeAll()
					
					//11.09新增,获取用户音符信息
					if(typeof callBack == 'function') {
						callBack()
					}
				} else {
					if(res.c == 4) {
						log('需要重新去登录')
//						//11.16修改---授权过期重新登录(自动重新登录)--因为这个放在onshow里面,所以直接去再次登陆
//						that.get_grant_again_new(function() {
//							console.log('--------')
//						});
					} else {
						if(res.m) {
							//其他报错,直接弹出来
							swan.showToast({
								title: res.m,
								icon: 'none',
								duration: 2000
							})
						}
						console.error(res)
					}
				}
			})
		},
//------------------------
    v_taptwo(e) {
    	var that = this
//  	var a = e.target.dataset.index
			// detail对象，提供给事件监听函数。这个可以用来向父级传值
    	var myEventDetail = {   
					val: 1
      } 
    	//触发成功回调
      this.triggerEvent("taptwo", myEventDetail);
    },
  }
}

Component(compObj)

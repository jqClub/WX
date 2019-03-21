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
    myprop: {
      type: Object,
      value: {},
      // observer(newVal, oldVal, changedPath) {
      //   if (!newVal) return;
      // },
    },
    mymeth: {
      type: Object,
      value: {},
      observer(newVal) {
        if (!newVal) return;
        const meth = this[newVal.name];
        if (meth) meth(newVal.data);
      },
    },

    list: {
      type: Array,
      value: [{}],
    },
    
    list2: {
      type: Array,
      value: [{}],
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
      const {
        trigger = 'trigger', bubbles, composed, capturePhase,
      } = data;

      let opt;
      if (isBubble) {
        opt = { bubbles: true, composed: true };
      } else {
        opt = {
          bubbles,
          composed,
          capturePhase,
        };
      }

      this.triggerEvent(trigger, data, opt);
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
    	timer = setInterval(function() {
    		log('-开启定时器-')
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
      wx.previewImage({
			  current: img, // 当前显示图片的http链接
			  urls: urls // 需要预览的图片http链接列表
			})
      
      
	  },
  },

};

Component(compObj);

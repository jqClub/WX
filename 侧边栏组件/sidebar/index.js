// import c from '../../utils/console';
var log = console.log.bind(console)

const app = getApp();
const appData = app.data;
let comp;

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
      //12.27新增，这里发送请求
      if(isOpen) {
      	for(var i = 0; i < all.length; i++) {
						var a = all[i]		
//						//发送展示
						app.bmsAd.subMsg(a) // 展示元素时调用
				} 
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

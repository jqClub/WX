/*
  // 引入模块
  <!--轮播的列表数据-->
	<wd-loop-list Winners_List="{{Winners_List}}"></wd-loop-list>
*/
var log = console.log.bind(console)

var page = undefined;
var doommList = [];
var danmu_Timeout;
var danmu_num = 0;
var doomm_danmu_Timeout = 0;
class Doomm {
    constructor(text, top, time) {
        this.text = text;
        this.top = top;
        this.time = time;
        let that = this;
        doomm_danmu_Timeout = setTimeout(function() {
            doommList.splice(doommList.indexOf(that), 1); //动画完成，从列表中移除这项
            page.setData({
                doommData: doommList
            })
        }, this.time * 1000) //定时器动画完成后执行。
    }
}

const compObj = {
  properties: {
  	//中奖者列表（获取对应的列表）
    Winners_List: {
			type: Array,
			observer(newVal, oldVal) {
				var that = this
				newVal = newVal || []
				var len = newVal.length
        if (!len) {
          return 
        }
        
        //调用radio_box方法
        that.radio_box()  
      },
		}, 
  },
  data: {
    doommData: [],  //后面的列表数据（可不改）
  },
  created: function() {
  	var that = this
  	page = this
  	
//	that.setList()
  },
  attached() {
//		//取消定时器,这里不能清空，因为中途会隐藏，所以清空后，就不会继续滚动了
//  clearTimeout(danmu_Timeout);
  },
  methods: {
//	setList: function() {
//      var that = this
//          //回调里面去设置数据，并调用接口
//          that.setData({
//              Winners_List: [1, 2, 3],
//          })
//          //调用radio_box方法
//          that.radio_box()  
//  },
  	 	//滚动播报
    radio_box: function() {
        var that = this,
            time = 3;
        	var Winners_List = that.data.Winners_List || []
        	var len = Winners_List.length

        //这里是设置获取到的列表数据，先判断是否为空。不为空，再进行下面的操作（注意，这里的数据名字需要你修改）
        if(!len){return}   
        var radio_list = that.data.Winners_List

        doommList.push(new Doomm(radio_list[danmu_num], Math.ceil(Math.random() * 86), time));
//				log(1111, doommList[0].text)
				
        that.setData({
            doommData: doommList
        })
//      log(222222, doommList, time)
        danmu_num++;
        if(danmu_num == radio_list.length) {
            danmu_num = 0;
        }
        danmu_Timeout = setTimeout(function() {
            that.radio_box()
        }, time * 1000);
    },
    clearTime: function() {
    	var that = this
    	//取消定时器
      clearTimeout(danmu_Timeout);
    },
  },
};

Component(compObj);

/*

"usingComponents": {
  "my-to-mp": "../../components/to-mp/index"
}

<to-mp appid="">按钮</to-mp>
path="" // 跳转地址
version="" // 跳转小程序版本

*/
var log = console.log.bind(log)

const app = getApp();
const appData = app.data;
let comp;

const compObj = {
  options: {
    multipleSlots: true,
  },
  externalClasses: ['myclass'],
  data: {},
  properties: {
    appid: {
      type: String,
      value: '',
    },

    path: {
      type: String,
      value: '',
      /* observer(newVal) {
        if (!newVal) return;

        this.setData({ appPath: `pages/${newVal}/${newVal}` });
      }, */
    },

    version: {
      type: String,
      value: 'release',
    },

    /* myprop: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        if (!newVal) return;
      },
    }, */
    /* mymeth: {
      type: Object,
      value: {},
      observer(newVal) {
        if (!newVal) return;

        const meth = this[newVal.name];
        if (meth) meth(newVal.data);
      },
    }, */
  },
  created() {
    comp = this;
  },
  attached() {
    this.setData({
      // userInfo: appData.userInfo,
      canIUse: swan.canIUse('navigateToMiniProgram'),
    });
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

    toMiniProgram() {
      const { appid, path, version } = this.data;
//    swan.navigateToMiniProgram({
//      appId: appid,
//      envVersion: version,
//      path,
//    });
			app.navigateToMiniProgram(appid, path, '', '')	

      console.log(appid);
    },
  },
};

Component(compObj);

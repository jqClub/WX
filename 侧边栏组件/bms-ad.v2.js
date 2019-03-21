/* Version - 2.0.0

  import BmsAd from '../../utils/bms-ad.v2';

  // 注册模块
  const bmsAd = new BmsAd({
    appName: 'caitudaren',
    openid: '',
    nickname: '',
    gender: '',
    isDev: true,
  });
  app.bmsAd = bmsAd;

  app.bmsAd.getMsg('icon').then((res) => {}); // 获取元素, 注意回调与v1有差异

  app.bmsAd.subMsg(res); // 展示元素时调用
  app.bmsAd.subMsg(res, true); // 点击元素时调用


  // 额外方法
  app.bmsAd.sign(''); // 登陆

*/

var log = console.log.bind(console)

class Fun {
  /**
   * @param {object} {
   *  {string} appName (APP唯一标识符, 必填),
   *  {string} openid (微信开放ID, 必填),
   *  {string} nickname (昵称),
   *  {string} gender (性别),
   *  {number} mode (模式 0:点击后切换元素; 1:展示后切换元素; 2:点击或展示后都切换元素),
   *  {boolean} isDev = false (是否使用测试环境),
   * }
   * @memberof Fun
   */
  constructor({
    appName, openid, nickname, gender, mode = 0, isDev = false,
  }) {
    if (!appName) throw new Error('请输入appName');

    this.appName = appName;
    this.openid = openid;
    this.nickname = nickname;
    this.gender = gender;
    this.mode = mode;
    this.domain = isDev ? 't3game.zuiqiangyingyu.net' : 'game.zuiqiangyingyu.net';

    this.prom = this.init();
  }

  /** 初始化
   * @returns {promise} {
        "code": 0,
        "msg": "成功",
        "data": {
          "list": [
            {
              "id": 3, // 广告ID
              "wxAppId": "111", // 流量主 微信APPID
              "adWxAppId": "33", // 广告主 微信APPID, 原为app_id
              "transferWxAppId": "", // 二次跳转 微信APPID
              "path": "path22222", // 路径
              "image": // 图片, 原为icon
                "http: // static.zuiqiangyingyu.cn/wxgame/ad/201808/jsNw43XFYGWYr8fB.jpg",
              "title": "开户推广", // 标题
              "flag": "test", // 标识
              "price": "3", // 单价
              "weight": "2", // 权重
            }
          ]
        }
      }
   * @memberof Fun
   */
  init() {
    // 游戏广告信息V2
    const ads = new Promise((resolve, reject) => {
      const opt = {
        url: `https://${this.domain}/common/game/v2/ads`,
        data: { app_name: this.appName }, // APP唯一标识符, 必填
        success(res) {
          const { data } = res;
          switch (+data.code) {
            case 0: {
              const { list } = data.data || []     
              resolve(list);
              break;
            }

            default: {
              reject(res);
            }
          }
        },
        fail(res) {
          reject(res);
        },
      };
      wx.request(opt);
    });

    // 如果未登录
    if (!this.openid) {
      const openid = this.sign(this.appName);
      openid.then((res) => {
        this.openid = res.open_id;
      });

      return Promise.all([ads, openid]);
    }

    return Promise.all([ads]);
  }

  /** 获取元素
   * @param {string} flag (广告类型标识, 必填)
   * @param {boolean} isAll (是否获取匹配该标识的所有项)
   * @returns {promise}
   * @memberof Fun
   */
  getMsg(flag, isAll) {
    if (!flag) throw new Error('请传入广告类型标识');
    return new Promise((resolve, reject) =>
      this.prom
        .then(([res]) => {
          if (!res.length) {
            reject(new Error('该应用未投放广告'));
            return;
          }

          const filter = res.filter(v => v.flag === flag);
          if (!filter.length) {
            reject(new Error(`该位置未投放广告: ${flag}`));
            return;
          }

          if (isAll) {
            resolve(filter);
          } else {
            const key = `bmsAd_${flag}`;

            // 如果非首次显示
            const index = wx.getStorageSync(key); // 获取当前显示索引
            if (Number.isInteger(index)) {
              const item = filter[index]; // 获取元素
              // 如果存在元素
              if (item) {
                resolve(item);
                return;
              }
            }

            // 如果为首次显示
            wx.setStorageSync(key, 0);
            resolve(filter[0]);
          }
        })
        .catch((res) => {
          throw new Error('BMS请求错误', res);
        }));
  }

  /** 展示点击记录
   * @param {string} msg (调用getMsg方法获取的元素, 必填)
   * @param {boolean} [isClick=false] (是否为点击广告而非展示广告)
   * @memberof Fun
   */
  subMsg(msg, isClick = false) {
    if (!msg) throw new Error('请传入调用getMsg方法获取的元素');

    const opt = {
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      url: `https://${this.domain}/statistics/ad/${isClick ? 'hit' : 'show'}`,
      data: {
        app_name: this.appName, // APP唯一标识符, 必填
        open_id: this.openid, // 微信开放ID, 必填
        name: this.nickname, // 昵称
        gender: this.gender, // 性别
        ad_id: msg.id, // 广告ID
        weight: msg.weight, // 权重
      },
    };
    wx.request(opt);

    // 切换元素的时机
    let isRun;
    switch (this.mode) {
      //  点击后切换元素
      case 0: {
        isRun = isClick;
        break;
      }

      // 展示后切换元素
      case 1: {
        isRun = !isClick;
        break;
      }

      // 点击或展示后都切换元素
      case 2: {
        isRun = true;
        break;
      }

      default:
        break;
    }

    if (isRun) {
      const key = `bmsAd_${msg.flag}`;
      const index = wx.getStorageSync(key); // 获取当前显示索引
      const nextIndex = index ? index + 1 : 1; // 下一个索引
      wx.setStorageSync(key, nextIndex);
    }
  }

  /** 登录
   * @param {string} appName (APP唯一标识符, 必填),
   * @returns {promise}
   * @memberof Fun
   */
  sign(appName) {
    return new Promise((resolve) => {
      wx.getStorage({
        key: 'bmsAd_sign',
        complete: ({ data }) => {
          if (data) {
            resolve(data);
          } else {
            wx.login({
              success: ({ code }) => {
                const opt = {
                  method: 'POST',
                  header: { 'content-type': 'application/x-www-form-urlencoded' },
                  url: `https://${this.domain}/common/session/sign_in`,
                  data: {
                    app_name: appName, // APP唯一标识符, 必填
                    code, // 微信code, 必填
                  },
                  success: (res) => {
                    const { data: data2, msg } = res.data;

                    // 登录失败
                    if (data2.length === 0) throw new Error(msg);

                    wx.setStorage({
                      key: 'bmsAd_sign',
                      data: data2,
                    });

                    resolve(data2);
                  },
                  fail(err) {
                    console.error('BMS登录失败', err);
                  },
                };
                wx.request(opt);
              },
            });
          }
        },
      });
    });
  }

  /** 获取配置
   * @param {string} ver (版本号)
   * @returns {promise}
   * @memberof Fun
   */
  getConfig(ver) {
    if (!ver) throw new Error('请传入版本号');

    const fun = new Promise((resolve, reject) => {
      const opt = {
        url: `https://${this.domain}/common/config/info`,
        data: {
          app_name: this.appName, // APP唯一标识符, 必填
          version: ver, // 版本号
        },
        success(res) {
          const { data } = res;
          switch (+data.code) {
            case 0: {
              resolve(data.data);
              break;
            }

            default: {
              reject(res);
            }
          }
        },
        fail(res) {
          reject(res);
        },
      };
      wx.request(opt);
    });

    return this.prom.then(() => fun);
  }
}

export default Fun;

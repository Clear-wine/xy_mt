// pages/child/pages/activityzl/activityzl.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js');
// var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // percent: 20, //进度条占用百分比
    radius: 20, //圆角大小
    width: 28, //进度条的宽度
    active: true, //进度条从左往右
    activeColor: '#ff6161', //已选进度条颜
    backgroundColor: '#EBEBEB',
    statusTitle: "",
    showDialog: true, //是否活动结束/失败
    basePrice: 1, //1发起人完成 2未完成
    userType: '1', //1发起者 2参与者
    activityType: '1',
    partin: false,
    isshare: 0, //isshare = 0, 表示不是从分享进入, isshare = 1 表示是从分享进入
    showDialogSucceed: true,
    height: 32,
    zlchenggong:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let that = this;
    if (options.isshare == 1) {
      console.log('是分享进去的');
      this.setData({
        'isshare': options.isshare
      })
    }
    if(wx.getStorageSync('shareUserId').length!=0||options.faqi==2){
      if (options.userId==wx.getStorageSync('userId')) {
          var faqi=1 //进入页面的用户是发起者
      } else {
          var faqi=2 //不是发起者
      }
    }else{
      var faqi=1 //进入页面的用户是发起者
    }
    console.log("发起人与好友的判断",faqi)
    this.setData({
      activityNo: options.activityNo,
      cartNo: options.cartNo,
      faqi:faqi
    })

  },
  onShow: function () {
    // 进入页面判断活动的状态
    this.setData({
      statusTitle: this.data.statusTitle,
      showDialog: this.data.showDialog
    })
    if (wx.getStorageSync('userId')) {
      //获取助力活动页面详情
      this.getHelpActivity()
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    var that = this;
    that.logins = that.selectComponent("#logins");
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      wx.showModal({
        title: '提示',
        content: '如想体验更多操作,请赶快去授权吧~',
        success: function (res) {
          if (res.confirm) { //如果按钮确定
            that.logins.toggleDialog();
          } else if (res.cancel) { //如果点了取消
            wx.showModal({
              title: '警告',
              content: '您取消授权, 将无法体验更多操作, 请授权后再进入!!!',
              showCancel: false,
              confirmText: '返回',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击了"返回授权"')
                }
              }
            })
          }
        }
      })
    }
  },
  //授权完毕后刷新本页面
  callSomeFun(e) {
    console.log("授权完成", wx.getStorageSync('userId'))
    this.getHelpActivity()
  },
  // onUnload() {
  //   if (this.data.isshare) {
  //     wx.switchTab({
  //       url: '/pages/index/index',
  //     })
  //   }
  // },
  getHelpActivity() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      shareUserId:wx.getStorageSync('shareUserId'),
      activityOrderNo: _this.data.cartNo
    }
    console.log(params)
    requestUtil.Requests('activity/help/queryJoinDetail', params).then((res) => {
      let data = res.data
      console.log(data)
      let currentDate = data.currentDate; //当前时间
      let endDate = data.endDate; //结束时间
      //进度条的长度计算(总需要人数除以已助力人数取百分比)
      let cd=Number(data.joinNum)/Number(data.helpNumber)*100
      let jdwidth=cd.toFixed(2)
      //计算差价
      let chajia=data.originalPrice-data.price-data.deductionPrice;
      console.log("差价====>",chajia)
      _this.setData({
        helpData: res.data,
        currentDate: data.currentDate, //当前时间
        endDate: data.endDate, //结束时间
        join: data.join, //当前用户是否可以参团(true为可以,false为不可以)
        orderStatus: data.orderStatus, //该团的状态1为进行中,2为成功,3为失败
        status: data.status, //总活动状态1为进行中,2为结束
        isHelpMoney: data.isHelpMoney, //当前活动助力是否需要支付 1为需要支付,0为不需要支付
        jdwidth:jdwidth,
        chajia:chajia.toFixed(2)
      })
      // _this.getcountTime();
      _this.countTime();
    })
  },
  /**活动倒计时*/
  // getcountTime() {
  //   let that = this;
  //   //计算目标与现在时间差(毫秒)
  //   let endtime = new Date(that.data.endDate).getTime(); //结束时间
  //   let nowtime = new Date(that.data.currentDate).getTime(); //当前时间
  //   that.countTime(endtime, nowtime);
  // },
  countTime() {
    // 
    let that = this;
    var conut_down = 1;
    //计算目标与现在时间差(毫秒)
    let endDates = that.data.endDate.replace(/-/g, "/");
    let endtime = new Date(endDates).getTime(); //结束时间
    let nowtime = new Date().getTime(); //当前时间
    // nowtime = nowtime + 1000
    var leftTime = endtime - nowtime;
    var d, h, m, s, ms;
    if (leftTime > 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      d = d < 10 ? "0" + d : d
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h
      conut_down = 1; //未到时间
      that.setData({
        countdown: h + "：" + m + "：" + s,
        conut_down: conut_down,
        d: d,
        s: s,
        m: m,
        h: h
      })
      //递归每秒调用countTime方法，显示动态时间效果
      setTimeout(function () {
        // leftTime -= 1000;
        that.countTime();
      }, 1000);
    } else {
      console.log('已截止')
      conut_down = 0; //已到时间
      that.setData({
        countdown: '00:00:00',
        conut_down: conut_down
      })
    }
    if (conut_down === 0 && that.data.basePrice === 2) { //活动失败
      that.data.statusTitle = '活动失败~'
      that.data.showDialog = false
      //更改活动订单状态为活动失败
      that.updateActivityStatus()
    } else if (conut_down === 1 && that.data.basePrice === 1 && that.data.isjoinUser == false) {
      that.data.statusTitle = '活动已结束~'
      that.data.showDialog = false
    } else {
      that.data.showDialog = true
    }
    that.setData({
      statusTitle: that.data.statusTitle,
      showDialog: that.data.showDialog

    })
  },


  updateActivityStatus() {
    let _this = this;
    let params = {
      cartNo: _this.data.cartNo,
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('cart/updateActivityCartStatus', params).then((res) => {
      console.log(res.data, '活动失败了!!!')
    })
  },
  /**
   *  点击查看订单
   */
  handleStatus() {
    wx.navigateTo({
      url:'/pages/order/order?index=3&status=1'
    })
  },
  /**
   * 参与者助力活动
   */
  toHelpGoods() {
    //判断参与者为几档并助力多少钱
    let _this = this;
    let helpRuleList = _this.data.helpRuleList
    let perGrade = _this.data.helpData.nextHelpPersonGrade;
    var helpPrice = 0;
    var deductionMoney = 0;
    for (let i in helpRuleList) {
      if (helpRuleList[i].grade === perGrade) {
        helpPrice = helpRuleList[perGrade - 1].helpPrice
        deductionMoney = helpRuleList[perGrade - 1].deductionMoney
        _this.setData({
          helpPrice: helpPrice,
          deductionMoney: deductionMoney
        })
      }
    }
    let params = {
      orderNo: _this.data.cartNo,
      userId: wx.getStorageSync('userId'),
      userType: _this.data.userType, //参与活动的身份
      payType: '4',
      payStrategy: _this.data.activityType,
      openId: wx.getStorageSync('openId'),
      helpPrice: _this.data.helpPrice.toString(),
      // helpPrice: '0.01'
      grade: perGrade //助力等级

    }
    requestUtil.Requests('order/joinActivityPay', params).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function (res) {
          console.log('支付成功啦!!!')
          _this.setData({
            showDialogSucceed: false,
            ispaysuccess: 1
          })
          // _this.getHelpActivity()

        },
        fail: function () {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
        }
      })
    })
  },
  /**
   * 分享
   */
  onShareAppMessage: function () {
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    return {
      title: _this.data.helpData.goodsName,
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityzl/activityzl&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=1' + '&shopType=' + _this.data.helpData.shopType,
      imageUrl: _this.data.helpData.imgPath,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 回到首页(分享的时候)
   */
  backHome: function () {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  /**补差价购买商品 */
  markUpPrice() {
    //判断活动商品是优店还是网店 
    let _this = this;
    let fillPrice = _this.data.helpData.fillPrice;
    let params = {
      orderNo: _this.data.cartNo,
      userId: wx.getStorageSync('userId'),
      userType: _this.data.userType, //参与活动的身份
      payType: '4',
      // payStrategy: _this.data.activityType,
      payStrategy: '6',
      openId: wx.getStorageSync('openId'),
      helpPrice: fillPrice
      // helpPrice: '0.01'

    }
    requestUtil.Requests('order/joinActivityPay', params).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function (res) {
          console.log('支付成功啦!!!')
          _this.getHelpActivity()
        },
        fail: function () {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
        }
      })
    })
  },
  /**关闭弹窗 */
  hiddenDialog() {
    this.setData({
      showDialogSucceed: true
    })
  },
  /**助力人发起一个新的助力活动*/
  toPerson() {
    let _this = this;
    let shopType = _this.data.helpData.shopType;
    let activityNo = _this.data.helpData.activityNo;
    let goodsNo = _this.data.helpData.goodsNo;
    if (shopType == '1') {
      wx.navigateTo({
        url: '../activity-details/activity-details?activityType=1' + '&type=' + shopType + '&activityNo=' + activityNo + '&goodsNo=' + goodsNo,
      })
    } else {
      wx.navigateTo({
        url: '../product-act-details/product-act-details?activityType=1' + '&type=' + shopType + '&activityNo=' + activityNo + '&goodsNo=' + goodsNo,
      })
    }
  },
  upper(e) {
    console.log(e)
  },

  lower(e) {
    console.log(e)
  },

  scroll(e) {
    console.log(e)
  },

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },

  tap() {
    for (let i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1],
          scrollTop: (i + 1) * 200
        })
        break
      }
    }
  },

  tapMove() {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  //去参团
  gocantuan() {
    console.log(this.data.activityNo)
    wx.navigateTo({
      url: '/pages/index-child/pages/activityzl-details/index?activityNo=' + this.data.activityNo
    })
  },
  //去参加活动(去活动列表)
  gohuodong() {
    wx.navigateTo({
      url: '/pages/index-child/pages/ptlist/index'
    })
  },
  //去活动介绍
  gojieshao(){
    wx.navigateTo({
      url: '/pages/index-child/pages/playmethod/index?type=1'
    })
  },
  //帮ta助力
  gobangtazhuli() {
    wx.showLoading({
      title: '助力提交中...',
      mask: true
    });
    let that = this;
    let isHelpMoney=that.data.helpData.isHelpMoney;
    let params = {
      activityOrderNo: that.data.cartNo,
      userId: wx.getStorageSync('userId'),
      openId: wx.getStorageSync('openId'),
      price: that.data.helpData.price,
      token:that.data.helpData.token
    };
    console.log("帮他助力提交参数",params)
    requestUtil.Requests('activity/help/participateActivity', params).then((res) => {
      console.log("帮他助力",res)
      if(isHelpMoney==1){
        var obj = JSON.parse(res.data)
        wx.requestPayment({
          timeStamp: obj.timeStamp,
          nonceStr: obj.nonceStr,
          package: obj.package,
          signType: obj.signType,
          paySign: obj.sign,
          success: function (res) {
            console.log('支付成功啦!!!')
            that.getHelpActivity()
            wx.hideLoading()
            that.setData({
              zlchenggong:true
            })
          },
          fail: function () {
            wx.hideLoading()
            wx.showToast({
              title: '支付失败!',
              icon: 'none'
            })
          }
        })
      }else{
        if(res.flag){
          wx.hideLoading()
          console.log("助力成功")
          that.getHelpActivity()
          that.setData({
            zlchenggong:true
          })
        }
      }
    })
  },
  //关闭弹窗
  guanbi(){
    this.setData({
      zlchenggong:false
    })
  },
  //补差价
  getchajia() {
    let that = this;
    wx.showLoading({
      title: '助力提交中...',
      mask: true
    });
    let params = {
      activityOrderNo: that.data.cartNo,
      userId: wx.getStorageSync('userId'),
      openId: wx.getStorageSync('openId'),
      price: that.data.chajia,
      payType: '4',
      token:that.data.helpData.token
    };
    console.log("帮他助力提交参数",params)
    requestUtil.Requests('activity/help/makeUpTheDifference', params).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function (res) {
          console.log('支付成功啦!!!')
          that.getHelpActivity()
          wx.hideLoading()
        },
        fail: function () {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
        }
      })
    })
  },
})
// pages/user/user.js
const app = getApp()
const requestUtil = require('../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, //用户信息
    height:32
  },
  handleRefund() {
    wx.navigateTo({
      url: '/pages/child/pages/refund/refund',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      height:wx.getStorageSync('navHeight')
    })
  },
  onShow: function() {
    //获取用户信息
    let userId = wx.getStorageSync('userId')
    if(userId){
      // 获取订单数量
      this.getOrderNum()
      //获取金额及其他数量
      this.getusernum()
    }else{
      // wx.redirectTo({
      //   url: '../auth/auth',
      // })
    }
  },
  onReady: function () {
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
    this.onShow()
  },
  // 分享
  onShareAppMessage(res) {
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'button') { }
    return {
      title: '壹叁新消费',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/user/user&isshare=1'+ '&noparam=1',
      success: function (res) { }
    }

  },
  getOrderNum(){
    let _this = this;
    let param = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('order/queryOrderStatusNum', param).then((res) => {
      console.log(res)
      _this.setData({
        orderNum: res.data
      })
    })
  },
  //我的会员
  govip(){
    wx.navigateTo({
      url: '/pages/user-child/pages/member-upgrade/index',
    })
  },
  //获取金额及其他数量
  getusernum(){
    let that = this;
    let param = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/queryPage', param).then((res) => {
      console.log("金额及其他数量",res)
      that.setData({
        userInfo: res.data.user,
        account:res.data.account,
        team:res.data.team
      })
      wx.setStorageSync('userPhone', res.data.user.userPhone);
      wx.setStorageSync('tradePwdFlag', res.data.user.tradePwdFlag);
    })
  },
})
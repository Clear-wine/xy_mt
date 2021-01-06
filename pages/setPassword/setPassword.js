// pages/setPassword/setPassword.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    vcode: "",
    openId: "",
    pwd: "",
    surePwd: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      phone: options.phone,
       vcode: options.vcode
    })
  },
  //获取到密码
  getPwdValue: function(e) {
    this.setData({
      pwd: e.detail.value
    })
  },

  //获取到确认密码
  getSureValue: function(e) {
    this.setData({
      surePwd: e.detail.value
    })
  },


  //用户绑定
  userBind() {
    var _this = this;
    let openId = wx.getStorageSync('openId')
    let userInfo = wx.getStorageSync('userInfo');
    var returnUrl = wx.getStorageSync('returnUrl');
    var activityNo = wx.getStorageSync('activityNo');
    var cartNo = wx.getStorageSync('cartNo');
    var activityType = wx.getStorageSync('activityType');
    var goodsNo = wx.getStorageSync('goodsNo');
    var type = wx.getStorageSync('type');
    var pwd = this.data.pwd;
    var surePwd = this.data.surePwd;
    if (pwd != surePwd) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var param = {
      pwd: pwd,
      phone: _this.data.phone,
      vCode: _this.data.vcode,
      headImg: userInfo.avatarUrl,
      nickName: userInfo.nickName,
      openId: openId,
      // sharePerson: wx.getStorageSync('shareUserId')
    }
    if (wx.getStorageSync('shareUserId') !== "") {
      param.sharePerson = wx.getStorageSync('shareUserId');
    }
    requestUtil.Requests('user/userBind', param).then((res) => {
      console.log("密码绑定",res)
      wx.setStorageSync('userId', res.data);
      //跳转到首页
      if (returnUrl.indexOf("index") >= 0) { //判断returnUrl中是否包含index
        //跳转到首页
        setTimeout(function () {
          wx.reLaunch({
          url: "/pages/start/start",
        });
        }, 1000);
      } else if (activityType) {
        //跳转到对应的分享页
        setTimeout(function() {
          wx.navigateTo({
            url: returnUrl + "?activityNo=" + activityNo + '&cartNo=' + cartNo + '&isshare=1'  + '&goodsNo=' + goodsNo + "&type=" + type + '&activityType=' + activityType
          })
        }, 1000);
      } else if (cartNo) {
        //跳转到对应的分享页
        setTimeout(function () {
          wx.navigateTo({
            url: returnUrl + "?cartNo=" + cartNo + '&activityNo=' + activityNo + '&isshare=1' + '&goodsNo=' + goodsNo,
          });
        }, 1000);      
      } else {
        setTimeout(function () {
          wx.navigateTo({
            url: returnUrl + "?goodsNo=" + goodsNo + '&isshare=1',
          });
        }, 1000);
      }
    })
  },
})
// pages/auth/auth.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'), //判断小程序的API,回调,参数,组件等是否在当前版本可用
    openId: "",
    sharePerson: "",
    authFlag: false,
    showDialog: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var sharePerson = wx.getStorageSync('shareUserId'); //获取到分享者的openId
    var that = this;
    var authFlag = wx.getStorageSync('authFlag');
    that.setData({
      sharePerson: sharePerson,
      authFlag: authFlag
    });

    if (!authFlag) {
      //查看是否授权
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            //已经授权,不需要显示授权页面,可以直接调用getUserInfo获取头像昵称
            //用户授权成功后,调用微信的wx.login接口,从而获取code
            wx.getUserInfo({
              success: function(res) {
                console.log(res)

              }
            })
          }
        },
        fail: function(res) {
          console.log(res)
        }
      })
    } else {
      //用户已经授权的处理
      //通过openId去查询用户userId然后缓存在前端
      wx.switchTab({
        url: '/pages/index/index',
      })
    }

  },
  //用户授权绑定信息
  bindGetUserInfo: function(e) {
    var that = this;
    var sharePerson = that.data.sharePerson; //邀请者的openId
    // wx.showModal({
    //   title: '微信授权',
    //   content: '请微信授权登陆',
    //   success(res) {
        //if (res.confirm) {
          if (e.detail.userInfo) {
            var userInfo = e.detail.userInfo;
            var openId = wx.getStorageSync('openId'); //用户openId
            let params = {
              thirdId: openId,
              type: 1,
              status: '1',
              sharePerson: sharePerson
            }
            console.log(e.detail.userInfo);
            userInfo.openId = openId;
            userInfo.sharePerson = sharePerson;
            wx.setStorageSync('userInfo', userInfo)
            var queryBean = JSON.stringify(userInfo);
            console.log(queryBean)
            requestUtil.Requests('user/saveThidBind', params).then((res) => {
              wx.reLaunch({
                //跳转到首页
                url: '../login/login',
              })
            })
            that.setData({
              showDialog: !this.data.showDialog
            });
          }
        // } else if (res.cancel) {
        //   //用户按了拒绝按钮
        //   wx.showModal({
        //     title: '警告',
        //     content: '您点击了拒绝授权,将无法体验更多功能,建议请授权后再进入!!!',
        //     showCancel: false,
        //     confirmText: '返回授权',
        //     success: function(res) {
        //       if (res.confirm) {
        //         console.log('用户点击了"返回授权"')
        //       }
        //     }
        //   })
        // }
    //   }
    // })
  },
  //用户点了拒绝的按钮
  authCancel() {
    console.log('用户点击了确定,拒绝授权')
    wx.showToast({
      title: '您已拒绝授权',
      icon: 'none',
      duration: 2000
    })
    setTimeout(function() {
      wx.switchTab({
        url: '../index/index',
      })
    }, 1000)

    // wx.showModal({
    //   title: '警告',
    //   content: '您点击了拒绝授权,将无法体验更多功能,建议请授权后再进入!!!',
    //   success: function (res) {
    //     if (res.confirm) {
    //       console.log('用户点击了确定,拒绝授权')
    //       wx.switchTab({
    //         url: '../index/index',
    //       })
    //     }else if(res.cancel){
    //       console.log('用户点击了取消拒绝')
    //   
    //     }
    //   }
    // })
  },
  //点击获取手机号
  getPhoneNumber(e) {
    var that = this;
    wx.checkSession({
      success: function () {
        console.log(e.detail.errMsg)
        console.log(e.detail.iv)
        console.log(e.detail.encryptedData)
        var ency = e.detail.encryptedData;
        var iv = e.detail.iv;
        if (!e.detail.encryptedData) {
          //不同意授权
          wx.showToast({
            title: '授权失败,请重新授权',
            icon: 'none',
            duration: 5000
          })
        } else { //同意授权
          wx.showLoading({
            title: '授权中',
            mask: true
          })
          let data = {
            encrypdata: ency,
            ivdata: iv,
            sessionkey: wx.getStorageSync('sessionKey')
          }
          requestUtil.Requests('user/decNumberPhone', data).then((res) => {
            console.log(res.data)
            let data = JSON.parse(res.data)
            let userPhone = data.phoneNumber //用户绑定电话
            // 判断用户是否已注册 如果注册调转到首页,如果没有注册直接走流程
            console.log(data)
            wx.setStorageSync('userId', data.userId);
            debugger
            let params = {
              thirdId: wx.getStorageSync('openId'),
              userId: data.userId,
              type: 1,
              status: 1,
              sharePerson: wx.getStorageSync('shareUserId')
            }
            requestUtil.Requests('user/saveThidBind', params).then((res) => {
              // wx.switchTab({
              //   url: "../index/index"
              // })
            })
          })
        }
      }
    })
  },
  //弹窗控制
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    });
  }
})
// pages/bindingPhone/bindingPhone.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', //手机号
    code: '', //验证码
    iscode: null, //用于存放验证码接口里获取到的code
    codename: '获取验证码',
    userInfo: {},
    isDisabled: false,
    disableds: false,
    loading: false,
    smsType: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var userInfo = options.userInfo;
    // this.setData({
    //   userInfo: JSON.parse(userInfo)
    // });
  },
  //获取到电话号码
  getPhoneValue: function (e) {
    let that = this;
    this.setData({
      phone: e.detail.value
    });
  },

  //获取到输入框验证码
  getCodeValue: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  //获取验证码
  getCode: function () {
    var that = this;
    if (this.data.phone == "" || this.data.phone.length != 11) {
      wx.showToast({
        title: '请检查手机号是否为空或有误',
        icon: 'none',
        duration: 1000
      })
      return false;
    } else {
      that.countDown();
      let data = {
        phone: that.data.phone,
        smsType: that.data.smsType
      }
      let params = {
        data
      }
      let datas = JSON.stringify(params)
      //  requestUtil.Requests('user/getAppRegistCode', data)
      wx.request({
        url: app.globalData.requestPath + 'user/getAppRegistCode',
        method: 'POST',
        data: {
          param: datas
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success(res) {
          if (res.data.flag) {
            console.log('获取验证码成功')
          } else {
            // 判断用户是否以及注册,如果注册直接到首页,如果没有注册走下一步流程
            if (res.data.code === "10008") {
              wx.setStorageSync('userId', res.data.data);
              wx.showModal({
                title: '注册',
                content: res.data.msg,
                success(result) {
                  if (result.confirm) {
                    let userdata = {
                      thirdId: wx.getStorageSync('openId'),
                      userId: res.data.data,
                      type: 1,
                      status: 1,
                      sharePerson: wx.getStorageSync('shareUserId')
                    };
                    requestUtil.Requests('user/saveThidBind', userdata).then((res) => {
                      wx.switchTab({
                        url: "../index/index"
                      })
                    })
                  } else if (result.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            } else {
              that.setData({
                codename: '重新发送',
                isDisabled: false
              })
            }
          }
        }
      })
    }
  },

  //短息发送成功后  倒计时60秒
  countDown: function () {
    var that = this;
    var num = 61;
    var timer = setInterval(function () {
      num--;
      if (num <= 0) {
        clearInterval(timer);
        that.setData({
          codename: '重新发送',
          isDisabled: false,
          loading:false,
          disableds:false
        })

      } else {
        that.setData({
          codename: num + "s",
          isDisabled: true
        });
      }
    }, 1000)
  },

  //获取验证码
  getVerificationCode() {
    this.getCode();
    var _this = this
  },
  //用户绑定
  userBind: function () {
    var _this = this;
    if (_this.data.phone && _this.data.code) {
      let openId = wx.getStorageSync('openId')
      let userInfo = wx.getStorageSync('userInfo');
      var returnUrl = wx.getStorageSync('returnUrl');
      var proId = wx.getStorageSync('proId');
      var data = {
        phone: _this.data.phone,
        vCode: _this.data.code,
        openId: openId
      }
      let bindCode = requestUtil.Requests('user/userBindVidata', data).then((res) => {
        console.log("绑定电话",res)
        _this.setData({
          loading: true,
          disableds: true
        })
        if(res.flag){
          if (res.code === '1') {
            //跳转到设置密码页面
            wx.redirectTo({
              url: '../setPassword/setPassword?phone=' + _this.data.phone + '&vcode=' + _this.data.code,
            })
          } else {
            wx.setStorageSync('userId', res.data.data);
            wx.switchTab({
              url: '../index/index',
            })
          }
        }else{
          wx.showModal({
            title: res.msg
          })
        }
        
      })
    } else {
      wx.showToast({
        title: '请检查手机号或验证码是否为空或有误',
        icon: 'none',
        duration: 1000
      })
    }

  },
})
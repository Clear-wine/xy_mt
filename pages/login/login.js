// pages/login/login.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogin: false, //显示授权
    sessionKey: null,
    openId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //手动绑定手机号
  handlePhone() {
    console.log(1)
    wx.navigateTo({
      url: '../bindingPhone/bindingPhone',
    })
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
            if (res.code === '10008') {
              wx.setStorageSync('userId', data.userId);
              let params = {
                thirdId: wx.getStorageSync('openId'),
                userId: data.userId,
                type: 1,
                status: 1,
                sharePerson: wx.getStorageSync('shareUserId')
              }
              requestUtil.Requests('user/saveThidBind', params).then((res) => {
                wx.switchTab({
                  url: "../index/index"
                })
              })
            } else {
              wx.navigateTo({
                url: '../setPassword/setPassword?phone=' + userPhone,
              })
            }
          })
        }
      }
    })
  },
})
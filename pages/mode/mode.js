// pages/mode/mode.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.login({
      success: res => {
        //wx.login获取code
        that.setData({
          code:res.code
        })
      }
    })
    wx.getSetting({
      success(res) {
        that.setData({
          userInfos: res.authSetting['scope.userInfo']
        })
        if (res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: function (res) {
              console.log("授权的数据====>",res)
              that.setData({
                encryptedData:res.encryptedData,
                iv:res.iv
              })
              that.getuid()
            }
          })
        }
      }
    })
  },
  getuid(){
    let that=this;
    console.log(that.data)
    wx.request({
      url: app.globalData.requestPath + 'user/getUserInfo',
      method: 'POST',
      data: {
        code: that.data.code, //将code发送到后台服务器
        encryptedData:that.data.encryptedData,
        iv:that.data.iv
      },
      header: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: result => {
        console.log(result)
      },
      
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
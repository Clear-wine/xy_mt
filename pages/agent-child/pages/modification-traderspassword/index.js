// pages/agent-child//pages/modification-traderspassword/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codename: '获取验证码'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userPhone:wx.getStorageSync('userPhone')
    })
  },
  //输入的value值
  getvalue(e){
    console.log(e.detail.value)
    this.setData({
      value:e.detail.value
    })
  },
  //获取验证码
  huoqu(){
    let that=this;
    that.countDown()
    let params = {
      phone:that.data.userPhone,
      smsType: 2
    }
    requestUtil.Requests('user/getAppRegistCode', params).then((res) => {
      console.log(res)
    })
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
        codename: num + "s后重新发送",
        isDisabled: true
      });
    }
  }, 1000)
},
  //下一步
  xiayibu(){
    let that=this;
    let params = {
      userPhone:that.data.userPhone,
      vCode: that.data.value
    }
    requestUtil.Requests('user/checkSmsCode', params).then((res) => {
      console.log('验证验证码',res)
      if(res.flag){
        wx.navigateTo({
          url:'../traders-password/index'
        })
      }
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
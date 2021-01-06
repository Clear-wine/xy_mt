// pages/agent-child//pages/traders-password/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Length:6,        //输入框个数
    isFocus:true,    //聚焦
    Value:"",        //输入的内容
    ispassword:true, //是否密文显示 true为密文， false为明文。
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  Focus(e){
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value:inputValue
    })
  },
  Tap(){
    var that = this;
    that.setData({
      isFocus:true,
    })
  },
  formSubmit(e){
    let that=this;
    console.log(e.detail.value.password);
    var mima=QQMapWX.Utils.hexMD5(e.detail.value.password)
    var params = {
      userId: wx.getStorageSync('userId'),
      tradePwd:mima
    }
    requestUtil.Requests('user/pwd/updateTradePwd', params).then((res) => {
        console.log(res)
        if(res.flag){
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function(){
            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
              success: function () {
                //beforePage.onLoad(); // 执行前一个页面的onLoad方法
              }
            });
          },2000)
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
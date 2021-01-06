// pages/refund-child//pages/refund-progress/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sl:6,
    zhanghu:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.setData({
      id:options.id
    })
    that.getrefunddetails()
  },
  //获取退款订单详情
  getrefunddetails(){
    let that=this;
    let params={
      id:that.data.id
    };
    requestUtil.Requests('order/refund/queryRefundDetail', params).then((res) => {
      console.log("退款订单详情",res)
      if(res.data.payType==2||res.data.payType==3||res.data.payType==4){
        var zhanghu=1;
      }else{
        var zhanghu=2;
      }
      that.setData({
        goodsList:res.data.goodsList,
        refundAmount:res.data.refundAmount,
        statusText:res.data.statusText,
        passDate:res.data.passDate,
        zhanghu:zhanghu
      })
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
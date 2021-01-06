// pages/refund-child//pages/refund-type/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
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
    that.setData({
      orderNo:options.orderNo,
      orderShopId:options.orderShopId,
      shopType:options.shopType
    })
    that.getdetails();
  },
  //查询订单详情
  getdetails(){
    let that=this;
    let params={
      orderNo:that.data.orderNo,
      orderShopId:that.data.orderShopId,
      shopType:that.data.shopType
    };
    requestUtil.Requests('product/refund/query/applyData', params).then((res) => {
      console.log("订单详情",res)
      that.setData({        
        goodsList:res.data.data.goodsList
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

  },
  //仅退款
  gorefund(){
    let that=this;
    let shopType=that.data.shopType; //店铺编码
    let orderNo=that.data.orderNo;//订单编码
    let orderShopId=that.data.orderShopId;//订单ID
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-application/index?refundModel=2&shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId 
    })
  },
  //退款退货
  gorefunds(){
    let that=this;
    let shopType=that.data.shopType; //店铺编码
    let orderNo=that.data.orderNo;//订单编码
    let orderShopId=that.data.orderShopId;//订单ID
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-application/index?refundModel=3&shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId
      //refundModel为是否收到货物的判断条件 3则表示选择了退款退货
    })
  },
})
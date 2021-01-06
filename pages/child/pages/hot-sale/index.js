// pages/child/pages/hot-sale/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    pageSize:10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getshuju()
    that.setimgurl()
  },
  //获取列表数据
  getshuju(){
    let that = this;
    let params = {
      page: that.data.page,
      pageSize: that.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_other/queryHotBuyTopPage', params, that.data.list).then((res) => {
      console.log('热卖', res.data)
      that.setData({
        list: res.data
      })
    })
  },
  //获取广告图
  setimgurl(){
    let that = this;
    let params = {
      source:2
    }
    requestUtil.Requests('product/popular/banner/queryAppData', params).then((res) => {
      console.log('热卖广告图', res.data)
      that.setData({
        imgUrl:res.data.url
      })
    })
  },
  //跳转到商品详情页
  godetails(e) {
    let activityNo = e.currentTarget.dataset.activityno;
    let type = e.currentTarget.dataset.type
    if(type==4){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityjl-details/index?activityNo='+activityNo //接龙
      })
    }else if(type==1){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityzl-details/index?activityNo='+activityNo //助力
      })
    }else if(type==5){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitypt-details/index?activityNo='+activityNo//拼团
      })
    }else if(type==3){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitydy-details/index?activityNo='+activityNo//代言
      })
    }else{
    wx.navigateTo({
      url: '/pages/index-child/pages/activitylb-details/index?activityNo='+activityNo//大礼包
    })
  }
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
    this.setData({
      page:this.data.page+1
    })
    this.getshuju()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
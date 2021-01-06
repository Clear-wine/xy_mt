// pages/child/pages/popularity/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    pageSize:10,
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
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
    requestUtil.Requests_page('product/queryTopPage', params,that.data.list).then((res) => {
      console.log('人气推荐', res.data)
      if(res.data.length>that.data.list.length){
        that.setData({
          list: res.data,
          jiazai:true
        })
      }else{
        that.setData({
          jiazai:false
        })
      }
      
    })
  },
  //获取广告图
  setimgurl() {
    let that = this;
    let params = {
      source: 1
    }
    requestUtil.Requests('product/popular/banner/queryAppData', params).then((res) => {
      console.log('人气广告图', res.data)
      that.setData({
        imgUrl: res.data.url
      })
    })
  },
  //跳转到商品详情页
  godetails(e){
    let goodsNo = e.currentTarget.dataset.nonum;
    wx.navigateTo({
      url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
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
    let that=this;
    that.setData({
      page:that.data.page+1
    })
    this.getshuju()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
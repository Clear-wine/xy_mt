// pages/index-child//pages/lblist/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    pageSize:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getlist()
    this.gettupian()
  },
   //获取图片
   gettupian(){
    let that=this;
      let params = {
        activityType:2
      }
      requestUtil.Requests('activity/banner/queryBanner', params).then((res) => {
        console.log("图片==>",res)
        that.setData({
         tupian:res.data
        })
      })
  },
    //获取列表
    getlist(){
      let that=this;
      let params = {
        page: that.data.page,
        pageSize: that.data.pageSize
      }
      requestUtil.Requests_page('activity/giftPacks/queryPage', params, that.data.activityList).then((res) => {
        console.log(res)
        that.setData({
          activityList:res.data,
          count:res.count
        })
      })
    },
    //去详情页
    godetails(e){
      let activityNo=e.currentTarget.dataset.activityno;
      console.log(activityNo)
      wx.navigateTo({
        url: '../activitylb-details/index?activityNo='+activityNo,
      })
    },
    //下拉刷新
    xiala(){
      console.log('下拉刷新')
      let that=this;
      that.setData({
        page:that.data.page+1
      })
      that.getlist();
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
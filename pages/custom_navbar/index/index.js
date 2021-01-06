// pages/custom_navbar/index/index.js
var that, app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pagesize: 10,
    one_1:4,
    tow_1:1,
    nav_4:[
      {name:"精选",id:0},
      {name:"商品",id:1},
      {name:"活动",id:2},
      {name:"上新",id:3},
    ],
    this_nav_id:0,
  },

  change_nav: function(e){
    console.log(e);
    let id = e.currentTarget.dataset.id;
    that.setData({
      this_nav_id: id,
      page: 1
    }, () => {
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.custom_bottom_navbar(),app.getTopHeight(this);
    that = this;
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
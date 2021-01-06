const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    likedata:[],
    page:1,
    pageSize:6
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取猜你喜欢
    this.getLoveGoodsPage()
    this.setData({
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade')
    })
  },

    getLoveGoodsPage(){
      let _this = this;
      let params = {
        userId: wx.getStorageSync('userId'),
        type: 1,
        page: _this.data.page,
        pageSize: _this.data.pageSize
      }
      requestUtil.Requests_page('product/netGoods/queryLoveGoodsPage', params, _this.data.likedata).then((res) => {
        _this.setData({
          likedata: res.data
        })
      })
    },
  /*跳转到商品详情页*/
  toGoodsDetails(e) {
    let _this = this;
    let goodsNo = e.currentTarget.dataset.goodsno;
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

  },
})
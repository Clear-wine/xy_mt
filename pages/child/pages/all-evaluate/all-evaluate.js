const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 10,
    evaData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      type: options.type
    })
    //查看用户评价
    this.findProductEvaluate();
  },
  findProductEvaluate() {
    let _this = this;
    let param = {
      userId: wx.getStorageSync('userId'),
      page: _this.data.page,
      pageSize: _this.data.pageSize,
      type: Number(_this.data.type) // 0 所有 1有图
    }
    requestUtil.Requests_page('product/findProductEvaluate', param, _this.data.evaData).then((res) => {
      _this.setData({
        evaData: res.data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
   this.data.page = 1;
    this.findProductEvaluate();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.hasMoreData){
      this.findProductEvaluate()
    }else{
      console.log('没有更多数据了')
    }

  },
})
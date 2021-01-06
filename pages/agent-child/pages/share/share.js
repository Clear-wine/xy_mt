var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detailsType: 0, //分润类型
    page: 1,
    pageSize: 5,
    contentlist: [],
    hasMoreData: true,
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      detailsType: options.type
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取分润详情
    this.getShareDeatils()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  getShareDeatils(){
    let that = this;
    let params = {
      userId: wx.getStorageSync('userId') + "",
      page: that.data.page,
      pageSize: that.data.pageSize,
      detailsType: that.data.detailsType
    }
    requestUtil.Requests_page('user/queryProfitDetailPage', params, that.data.contentlist).then((res)=>{
        that.setData({
          contentlist: res.data,
          hasMoreData: res.pageParam.hasMoreData,
          page:res.pageParam.page
        })
    })
  },
  /**
* 页面相关事件处理函数--监听用户下拉动作
*/
  onPullDownRefresh: function () {
    this.data.page = 1
    this.getShareDeatils('正在刷新数据')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getShareDeatils('加载更多数据')
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
 
})
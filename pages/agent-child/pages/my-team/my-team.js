var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 13,
    contentlist: [],
    teamId: 0,
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取代理团队信息
    this.getMyTeam()
  },
  getMyTeam() {
    let that = this;
    let param = {
      userId: wx.getStorageSync('userId'),
      pageSize: that.data.pageSize,
      page: that.data.page
    }
    requestUtil.Requests_page('user/queryMyTeam', param, that.data.contentlist).then((res) => {
      if(res.data.length == 0){
        that.data.isShow = true;
      }
      that.setData({
        contentlist: res.data,
        hasMoreData: res.pageParam.hasMoreData,
        page: res.pageParam.page,
        isShow: that.data.isShow
      })
    })
  },
  /**下一级团队 */
  toTeam(e) {
    let teamNum = e.currentTarget.dataset.teamnum;
    let teamId = e.currentTarget.dataset.id;
    // if (teamNum > 0) {
      let that = this;
      that.setData({
        contentlist: [],
        pageSize: 13,
        page: 1
      })
      let param = {
        userId: teamId,
        pageSize: that.data.pageSize,
        page: that.data.page
      }
      requestUtil.Requests_page('user/queryMyTeam', param, that.data.contentlist).then((res) => {
        if (res.data.length == 0) {
          that.data.isShow = true;
        }
        that.setData({
          contentlist: res.data,
          hasMoreData: res.pageParam.hasMoreData,
          page: res.pageParam.page,
          isShow: that.data.isShow
        })
      })
    // }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.page = 1
    this.getMyTeam('正在刷新数据')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMoreData) {
      this.getMyTeam('加载更多数据')
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
})
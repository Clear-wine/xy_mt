// pages/index-child/pages/gift-packs/gift-packs.js
//获取应用实例
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityType: '',
    activityList: [],
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      activityType: options.type
    }, function() {
      //根据类型得到不同商品列表
      this.getActivityList()
    })

  },
  /*
   *获取活动分页列表
   */
  getActivityList() {
    let that = this;
    let params = {
      activityType: that.data.activityType,
      page: that.data.page,
      pageSize: that.data.pageSize
    }
    requestUtil.Requests_page('product/queryIndexActivityPage', params, that.data.activityList).then((res) => {
      console.log(res.data)
      let activityList = res.data;
      activityList.forEach((item) => {
        if (item.activityType === '1') {
          item.activityTitle = '助力购';
          item.actPrice = item.lowPrice
        } else if (item.activityType === '2') {
          item.activityTitle = '大礼包';
          item.actPrice = item.giftPacksPrice;
        } else if (item.activityType === '3') {
          item.activityTitle = '代言购'
          item.actPrice = item.price;

        } else if (item.activityType === '4') {
          item.activityTitle = '接龙购'
          item.actPrice = item.chainsHeadPrice;

        } else if (item.activityType === '5') {
          item.activityTitle = '拼团购'
          item.actPrice = item.collagePrice;

        }
      })
      that.setData({
        activityList: activityList,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  //跳转到活动商品详情
  toActivityDetail(e) {
    let _this = this;
    let activityType = e.currentTarget.dataset.activitytype;
    let activityNo = e.currentTarget.dataset.activityno;
    let type = e.currentTarget.dataset.type;
    let goodsNo = e.currentTarget.dataset.goodsno
    wx.navigateTo({
      url: '/pages/child/pages/activity-details/activity-details?activityType=' + activityType + '&activityNo=' + activityNo + '&type=' + type + '&goodsNo=' + goodsNo,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getActivityList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMoreData) {
      this.getActivityList()
    } else {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }

  },

})
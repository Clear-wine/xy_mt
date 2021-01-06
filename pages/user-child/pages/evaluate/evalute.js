const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 10,
    status: 3,
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },
  orderListPage() {
    let _this = this;
    let param = {
      userId: wx.getStorageSync('userId'),
      status: _this.data.status,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('order/net/queryListPage', param, _this.data.orderList).then((res) => {
      console.log(res)
      _this.setData({
        orderList: res.data
      })
    })
  },
  userEvaluate() {
    let _this = this;
    let param = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('product/countUserEvaluate', param).then((res) => {
      console.log("111111",res)
      _this.setData({
        data: res.data
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
    //  查看待评价列表
    this.orderListPage();
    // 我的评价中心头部全部评价,有图评价
    this.userEvaluate();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  toComment(e) {
    let that = this;
    let orderCode = e.currentTarget.dataset.ordercode;
    let merchantNo = e.currentTarget.dataset.merchantno;
    let shopNo = e.currentTarget.dataset.shopno
    let orderGoodsList = e.currentTarget.dataset.ordergoodslist;
    let shopType = e.currentTarget.dataset.shoptype;
    let activityNo=e.currentTarget.dataset.activityno;
    let orderType=e.currentTarget.dataset.ordertype;
    let goodsNoObj = {};
    let goodsNoarr = [];
    orderGoodsList.forEach(el => {
      goodsNoObj = {
        goodsNo:el.goodsNo,
        goodsImg: el.goodsImg
      }
      goodsNoarr.push(goodsNoObj);
    })
    if(orderType!=0){
      wx.navigateTo({
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsNoarr) + '&orderCode=' + orderCode + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+'&activityNo='+activityNo+'&orderType='+orderType,
      })
    }else{
      wx.navigateTo({
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsNoarr) + '&orderCode=' + orderCode + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+'&activityNo=0',
      })
    }
  },
})
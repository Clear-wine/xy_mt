// pages/user-child//pages/mycommission/index.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    page:1,
    pageSize:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(+'ggfffffffffffffff')
    if(wx.getStorageSync('userId')){
       //获取佣金商品列表
       this.getMyCommissionList()
    }
    this.setData({
      commission:options.commission
    })
  },

 //获取佣金商品列表
  getMyCommissionList(){
    let _this = this;
    let params = {
      userId:wx.getStorageSync('userId'),
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_order/queryAdvertiseOrder', params, _this.data.recordData).then((res) => {
      let data = res.data;
      console.log(res);
      _this.setData({
        recordData: data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData,
      })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.page = 1;
    this.getMyCommissionList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let vm = this;
    if (vm.data.hasMoreData) {
      vm.getMyCommissionList();
    }
  },
})
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 10,
    pageData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.showTitle){
      wx.setNavigationBarTitle({
        title: '未入账分润',
      })
      this.setData({
        showTitle: options.showTitle
      })
    }
      this.getDetailPage()
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
  getDetailPage() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      detailsType: 1,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    if(_this.data.showTitle){
      requestUtil.Requests_page('user/queryWaitProfitPage', params, _this.data.pageData).then((res) => {
        let list = res.data
        
        _this.setData({
          data: res.resdata,
          pageData: list,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData
        })

      })
    }else{
      requestUtil.Requests_page('user/queryProfitDetailPage', params, _this.data.pageData).then((res) => {
        let list = res.data
        
        _this.setData({
          data: res.resdata,
          pageData: list,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData
        })

      })
    }

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
    this.getDetailPage();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.hasMoreData){
      this.getDetailPage();
    }
  },
})
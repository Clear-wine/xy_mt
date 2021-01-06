// pages/index-child//pages/classification/classification.js

//获取应用实例
var that, requestUtil = require('../../../../utils/requestUtil.js'), QQMapWX = require('../../../../libs/qqmap-wx-jssdk.min.js');
const app = getApp();
const random = require("../../../../utils/random.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navHeight:wx.getStorageSync('navHeight'),//顶部沉浸式高度
    page:1,
    pagesize:10,
    this_tabid:'', //一类选择id
    hideHeader: true,
    hideBottom: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    app.getTopHeight(this);
    that.get_one_data();
  },

  //左侧导航栏切换
  tab_change: function(e){
    console.log(e);
    let catid = e.currentTarget.dataset.catid;
    if(catid == that.data.this_tabid){
      return false
    }else{
      that.setData({
        this_tabid: catid
      }),that.get_two_data(catid);
    }
    
  },

  //一级分类数据
  get_one_data: function(){
    // commgoods/category/queryOneCategory
    var noStr = random.getRandom(10,"0");
    let params = {
      noStr : noStr
    }
    requestUtil.Requests_p('commgoods/category/queryOneCategory', params).then((res) => {
      if(res.data.length>0){
        console.log("一级分类===", res)
        that.setData({
          oneCategory_list: res.data,
          this_tabid: res.data[0].catId
        }),that.get_two_data(res.data[0].catId);
      }else{
        console.log('暂无数据');
      }

    })
  },

  //二级三级分类数据
  get_two_data: function(catId){
    let params = {
      catId : catId
    }
    requestUtil.Requests_p('commgoods/category/queryCategoryPage', params).then((res) => {
      if(res.data.length>0){
        console.log("二级三级分类===", res);

        that.setData({
          twoCategory_list: res.data
        })
        
      }else{
        console.log('暂无数据');
      }

    })

  },

  // 上拉加载更多
  loadMore: function(e){
    console.log(e);
    setTimeout(function(){
      that.setData({
        hideBottom: false  
      })
    },300);

    // var self = this;
    // // 当前页是最后一页
    // if (self.data.currentPage == self.data.allPages){
    //   self.setData({
    //     loadMoreData: '已经到顶'
    //   })
    //   return;
    // }
    // setTimeout(function(){
    //   console.log('上拉加载更多');
    //   var tempCurrentPage = self.data.currentPage;
    //   tempCurrentPage = tempCurrentPage + 1;
    //   self.setData({
    //     currentPage: tempCurrentPage,
    //     hideBottom: false  
    //   })
    //   self.getData();  
    // },300);
  },
  // 下拉刷新
  refresh: function(e){
    console.log(e);
    setTimeout(function(){
      that.setData({
        hideHeader: false  
      })
    },300);
    // var self = this;
    // setTimeout(function(){
    //   console.log('下拉刷新');
    //   var date = new Date();
    //   self.setData({
    //     currentPage: 1,
    //     refreshTime: date.toLocaleTimeString(),
    //     hideHeader: false
    //   })
    //   self.getData();
    // },300);
  },

  back: function(){
    wx.navigateBack('1');
  },

  /**扫一扫 */
  scanCode() {
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        let result = res.result
        wx.navigateTo({
          url: '/pages/child/pages/scan-code/scan-code?code=' + result,
        })
      }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
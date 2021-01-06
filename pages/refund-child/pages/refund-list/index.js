// pages/refund-child//pages/refund-list/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['全部', '处理中','售后记录'],
    currentTab: 0,
    page:1
  },
   //切换bar
   navbarTap: function (e) {
    let that=this;
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      page:1
    })
    //全局变量
    app.globalData.currentTab = e.currentTarget.dataset.idx;
  },
  swiperChange: function (e) {
    let that=this;
    this.setData({
      currentTab: e.detail.current,
    })
    //全局变量
    app.globalData.currentTab = e.detail.current;
    if(!that.data.list||!that.data.list1||!that.data.list2){
      this.setrufundlist()
    }
  },
  //前往退款详情
  gorefunddeteils(e){
    let id=e.currentTarget.dataset.id;
    let status=e.currentTarget.dataset.status;
    console.log(id,status)
    if(status==3){
      wx.navigateTo({
        url: '/pages/refund-child/pages/refund-progress/index?id='+id 
      })     
    }else{
      wx.navigateTo({
        url: '/pages/refund-child/pages/refund-details/index?id='+id
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.setrufundlist()
  },
  //获取退款订单列表
  setrufundlist(){
    let that=this;
    if(that.data.currentTab==0){
      var solist=that.data.list
    }else if(that.data.currentTab==1){
      var solist=that.data.list1
    }else if(that.data.currentTab==2){
      var solist=that.data.list2
    }
    let params={
      page:that.data.page,
      pageSize:10,
      type:that.data.currentTab,
      userId:wx.getStorageSync('userId')
    };
    requestUtil.Requests_page('order/refund/queryRefundList', params,solist).then((res) => {
      console.log("订单列表",res)
      let list=res.data;
      list.forEach(item => {
        var a=0;
        for(let i=0;i<item.goodsList.length;i++){
          a=a+parseInt(item.goodsList[i].num)
        }
        item.znum=a;
      });
      console.log('=======>',list)
      if(that.data.currentTab==0){
        that.setData({
          list:res.data,
          count:res.count
        })
      }else if(that.data.currentTab==1){
        that.setData({
          list1:res.data,
          count:res.count
        })
      }else if(that.data.currentTab==2){
        that.setData({
          list2:res.data,
          count:res.count
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
  //ssroll-view的上拉触底函数
  onbottom(){
    let that=this;
    that.setData({
      page:that.data.page+1,
    })
    if(that.data.currentTab==0){
      var solist=that.data.list
    }else if(that.data.currentTab==1){
      var solist=that.data.list1
    }else if(that.data.currentTab==2){
      var solist=that.data.list2
    }
    if(solist.length<that.data.count){
      that.setrufundlist();
    }else{
      wx.showToast({
        title: '暂无更多数据',
        icon:'none'
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
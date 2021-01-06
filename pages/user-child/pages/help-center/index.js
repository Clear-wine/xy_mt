// pages/user-child//pages/help-center/index.js
const app = getApp()
const requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar:['常见问题','订单问题'],
    currentTab: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    datList(that);
  },
    //切换bar
    navbarTap: function (e) {
      this.setData({
        currentTab: e.currentTarget.dataset.idx
      })
      //全局变量
      //app.globalData.currentTab = e.currentTarget.dataset.idx;
    },
    swiperChange: function (e) {
      let that = this;
      let typeId = that.data.dataListX[e.detail.current].value
      dataListY(that,typeId)
      this.setData({
        currentTab: e.detail.current,
      })
      //全局变量
      //app.globalData.currentTab = e.detail.current;
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
  //联系客服
  kefu(){

  },
  //意见反馈
  yijian(){
    wx.navigateTo({
      url: '../feedback/index',
    })
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

  },
  //服务跳转
  //订单查询
  dingdanchaxun(){
    wx.navigateTo({
      url: '/pages/order/order?index=0&status=-1'
    })
  },
  //退款售后
  tuikuanshouhou(){
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-list/index'
    })
  },
  //我要催单
  woyaocuidan(){
    wx.navigateTo({
      url: '/pages/order/order?index=3&status=1'
    })
  },
  //我的资金
  wodezijin(){
    wx.navigateTo({
      url: '/pages/user-child/pages/agent/agent'
    })
  },
  //银行卡
  yinghangka(){
    wx.navigateTo({
      url: '/pages/child/pages/bank-card/bank-card'
    })
  },
  //我要提现
  woyaotixian(){
    wx.navigateTo({
      url: '/pages/agent-child/pages/drawings/drawings'
    })
  },
  junpDetails(e){
    console.log(e)
    let index = parseInt(e.target.dataset.index);
    let data = this.data.dataListY[index]
    wx.navigateTo({
      url: `../help-details/index?title=${data.title}&content=${data.content}`,
    })
  }
})

function datList(that){
  requestUtil.Requests('product/question/queryTypeList').then((res) => {
    that.setData({
      dataListX : res.data
    })
  }).then(result=>{
    let param = {page:1,pagesize:10,typeId:that.data.dataListX[0].value,showDevice:2}
    requestUtil.Requests('product/question/queryQuestionList',param).then(res=>{
      that.setData({
        dataListY:res.data
      })
    })
  })
}

function dataListY(that,typeId){
  let param = {page:1,pagesize:10,typeId:typeId,showDevice:2}
  requestUtil.Requests('product/question/queryQuestionList',param).then(res => {
    that.setData({
      dataListY:res.data
    })
  })
}
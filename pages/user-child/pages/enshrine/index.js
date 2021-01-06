// pages/user-child//pages/enshrine/index.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yc:false,
    qxtu:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getlist()
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
  //获取列表数据
  getlist(){
    let that=this;
    let hasMoreData=[];
    let params={
      userId: wx.getStorageSync('userId'),
      page:1,
      pageSize:10
    };
    requestUtil.Requests_page('product/collect/queryList', params,hasMoreData).then((res) => {
      console.log("收藏列表",res)
      let data=res.data;
      data.forEach(item => {
        item.xq=false
      });
      that.setData({
        list:data
      })
    })
  },
  //前往商品详情
  goshop(e){
    console.log(e.currentTarget.dataset.goodsno)
    wx.navigateTo({
      url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + e.currentTarget.dataset.goodsno,
    })
  },
  //删除按钮
  shanchu(e){
    let that=this;
    let id=e.currentTarget.dataset.id
    var obj=[];
    obj.push(id)
    console.log(id,obj)
    var params={
      id:obj
    };
    wx.showModal({
      title: '提示',
      content: '您确认取消该收藏吗?',
      success (res) {
        if (res.confirm) {
          requestUtil.Requests("product/collect/del", params).then((res) => {
            console.log("确认取消收藏",res)
            if(res.flag){
              wx.showToast({
                title: '取消收藏成功',
                icon:'success'
              })
              that.getlist()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //选中按钮
  xuanqu(e){
    let that=this;
    let id=e.currentTarget.dataset.id;
    let list=that.data.list;
    list.forEach(item => {
      if(item.id==id){
        if(item.xq){
          item.xq=false
        }else{
          item.xq=true
        }
      }
    })
    that.setData({
      list:list
    })
  },
  //全选按钮
  quanxian(){
    let that=this;
    let list=that.data.list
    list.forEach(item=>{
      if(that.data.qxtu){
        item.xq=false
      }else{
        item.xq=true
      }
    })
    that.setData({
      list:list,
      qxtu:!that.data.qxtu
    })
  },
  //编辑按钮
  bianji(){
    this.setData({
      yc:!this.data.yc
    })
  },
  //删除按钮
  shanchu2(){
    let that=this;
    let obj=[];
    let list=that.data.list;
    list.forEach(item=>{
      if(item.xq){
        obj.push(item.id)
      }
    })
    console.log("删除的id",obj)
    var params={
      id:obj
    };
    wx.showModal({
      title: '提示',
      content: '您确认取消这些收藏吗?',
      success (res) {
        if (res.confirm) {
          requestUtil.Requests("product/collect/del", params).then((res) => {
            console.log("确认取消收藏",res)
            if(res.flag){
              wx.showToast({
                title: '取消收藏成功',
                icon:'success'
              })
              that.getlist()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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

  }
})
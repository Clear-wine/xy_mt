// pages/refund-child//pages/refund-details/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sl:6, //商品数量
    auditType:1  //1待处理 2：退款取消 3：退款通过 4：退款拒绝 5：待用户寄件 6：待确认收货 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.setData({
      id:options.id
    })
    that.getrefunddetails()
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
  //获取退款订单详情
  getrefunddetails(){
    let that=this;
    let params={
      id:that.data.id
    };
    requestUtil.Requests('order/refund/queryRefundDetail', params).then((res) => {
      console.log("退款订单详情",res)
      that.setData({
        goodsList:res.data.goodsList,
        auditType:res.data.auditType,//审核状态
        logistics:res.data.logistics,
        handleSubTime:res.data.handleSubTime,
        status:res.data.status,//退款状态,
        shopNo:res.data.shopNo,
        refundNo:res.data.refundNo,
        platformHandler:res.data.platformHandler//平台是否已经介入
      })
      that.tiemjie()
    })
  },
  //解析时间创建倒计时
  tiemjie(){
    let that=this;
    let tiem=that.data.handleSubTime;
    var days = parseInt(tiem  / 60 / 60 / 24 , 10); //计算剩余的天数 
    var hours = parseInt(tiem  / 60 / 60 % 24 , 10); //计算剩余的小时 
    var minutes = parseInt(tiem / 60 % 60, 10);//计算剩余的分钟
    var shijian="还剩"+days+"天"+hours+"小时"+minutes+"分"
    console.log(shijian)
    if(days == NaN){
      that.setData({
        handleSubTimes:shijian
      })
    }else{
      that.setData({
        handleSubTimes:''
      })
    }
  },
  //取消退款
  cancelrefund(){
    let that=this;
    wx.showModal({
      title: '提示',
      content: '您确认取消退款吗?',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let params={
            id:that.data.id
          };
          requestUtil.Requests('order/refund/cancelRefund', params).then((res) => {
            console.log("取消退款",res)
            if(res.flag){
              that.setData({
                auditType:5
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //联系客服
  goservice(){
    wx.makePhoneCall({
      phoneNumber: '13755089157', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  //联系平台
  goservices(){
    let that=this;
    let platformHandler=that.data.platformHandler;
    if(platformHandler==0){
      wx.showModal({
        title: '提示',
        content: '您确认需要平台介入吗?',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            let params={
              id:that.data.id
            };
            requestUtil.Requests('order/refund/applyPlatformHandler', params).then((res) => {
              console.log("平台介入",res)
              if(res.flag){
                wx.showModal({
                  title: '成功',
                  content: '申请平台介入成功,请耐心等待!',
                })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      wx.showModal({
        title:'提示',
        content:'平台介入已申请,请耐心等待'
      })
    }
  },
  //填写物流信息
  writelogistics(){
    wx.navigateTo({
      url: '/pages/refund-child/pages/logistics/index?id='+this.data.id 
    })
  },
  //查看物流信息
  gologistics(){
    let that=this;
    wx.navigateTo({
      url: '/pages/child/pages/logistics/logistics?refundId='+that.data.id
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
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that=this;
    that.setData({
      orderNo: options.orderNo,
      shopNo: options.shopNo,
      deliveryAddress: options.deliveryAddress,
      refundId:options.refundId
    })
    if(options.refundId){
      //查看退款订单物流
      that.getrefundwuliu();
    }else{
      //查看订单物流
      that.queryLogisticInfo();
    }

  },
  queryLogisticInfo() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      orderNo: _this.data.orderNo,
      shopNo: _this.data.shopNo
    }
    requestUtil.Requests('order/queryLogisticInfo', params).then((res) => {
      console.log(res)
      let traces=res.data.traces;
    traces.forEach((item)=>{
      if(item.acceptStation.indexOf("已发货")!=-1){
        item.ps=1
      }else if(item.acceptStation.indexOf("已签收")!=-1){
        item.ps=2
      }else{
        item.ps=3
      }
    })
      _this.setData({
        data:res.data,
        traces: traces.reverse()
      })
    })
  },
  //查看退款订单物流
  getrefundwuliu(){
    let that=this;
    let params={
      refundId:that.data.refundId
    }
    requestUtil.Requests('order/refund/logistics/queryLogisticProcess',params).then((res)=>{
      console.log(res)
      let traces=res.data.traces;
    traces.forEach((item)=>{
      if(item.acceptStation.indexOf("已发货")!=-1){
        item.ps=1
      }else if(item.acceptStation.indexOf("已签收")!=-1){
        item.ps=2
      }else{
        item.ps=3
      }
    })
      that.setData({
        data:res.data,
        traces: traces.reverse()
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

})
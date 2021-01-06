// pages/child/pages/use-coupon/use-coupon.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 10,
    type: 1,
    contentlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      price: options.price, //店铺支付金额
      useShopNo: options.shopNo, //店铺编码
      sumPrice: options.sumPrice,
      shopPrice: options.shopPrice
    })
    //获取可用优惠卷列表
    this.getCouponList()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (this.data.iscoupon) {
      if (prevPage) {
        prevPage.setData({
          iscoupon: true
        })
      }
    } else {
      if (prevPage) {
        prevPage.setData({
          iscoupon: false
        })
      }
    }

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.page = 1;
    this.getCouponList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMoreData) {
      this.getCouponList()
    }
  },
  //获取代金券列表
  getCouponList() {
    var _this = this;
    var params = {
      userId: wx.getStorageSync('userId') + "",
      page: _this.data.page,
      pageSize: _this.data.pageSize,
      shopNo: _this.data.useShopNo
    }
    requestUtil.Requests_page('user/chooseVoucher', params, _this.data.contentlist).then((res) => {
      console.log(res)
      _this.setData({
        contentlist: res.data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })

  },
  /**立即使用代金券 */
  // handleUse(e) {
  //   let id = e.currentTarget.dataset.item.id
  //   let pages = getCurrentPages();
  //   let prevPage = pages[pages.length - 2];
  //   this.setData({
  //     iscoupon: true
  //   })
  //   if (prevPage) {
  //     prevPage.setData({
  //       couponData: e.currentTarget.dataset.item,
  //       useShopNo: this.data.useShopNo,
  //       iscoupon: true
  //     })
  //     wx.navigateBack();
  //   }
  // },
  /**选择代金券 */
  radio: function(e) {
    let _this = this;
    let voucherPrice = 0;
    let isBind = e.currentTarget.dataset.isbind;
    let voucherId = e.currentTarget.dataset.id
    if(isBind != '1'){
      voucherPrice = e.currentTarget.dataset.amount
    } 
      let params = {
        userId: wx.getStorageSync('userId') + "",
        voucherId: voucherId+"",
        shopNo: _this.data.useShopNo,
        subtotal: _this.data.price,
        sumPrice: _this.data.sumPrice
      }
      //requestUtil.Requests('order/changeVoucherBindShop', params).then((res) => {
        //console.log(res)
        //if(res.flag){
          let newSubtotal =  _this.data.price//res.data.newSubtotal
          let newSumPrice =  _this.data.sumPrice
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];
          this.setData({
            iscoupon: true
          })
          if (prevPage) {
            if(isBind != '1'){
              prevPage.setData({
                voucherId: voucherId,
                voucherPrice: voucherPrice,
                newSubtotal: newSubtotal,
                newSumPrice: newSumPrice,
                useShopNo: this.data.useShopNo,
                iscoupon: true
              })
            }else{
              prevPage.setData({
                voucherId: null,
                voucherPrice: voucherPrice,
                newSubtotal: newSubtotal,
                newSumPrice: newSumPrice,
                useShopNo: this.data.useShopNo,
                iscoupon: true
              })
            }
            wx.navigateBack();
            prevPage.youhuijuan()
          }
        //}
      //})
  },
  // 发货地址选择,获取用户选择的单选框的值
  radioChange: function(e) {
    let _this = this;
    let voucherId = e.detail.value
    _this.setData({
      voucherId: voucherId
    })
  }

})
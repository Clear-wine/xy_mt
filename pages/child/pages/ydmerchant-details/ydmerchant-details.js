// pages/child/pages/ydmerchant-details/ydmerchant-details.js
const app = getApp()
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
    let _this = this;
    _this.setData({
      shopNo: options.shopNo
    })
    //获取商家信息
    _this.getShopMsg()
    //获取商家评分
    _this.getShopGrade()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**获取商家信息 */
  getShopMsg() {
    let _this = this;
    let params = {
      shopNo: _this.data.shopNo,
    }
    requestUtil.Requests('product/yo/getShopInfo', params).then((res) => {
      // console.log(res.data)
      let data1 = res.data
      if(data1.phone==null){
        data1.phone = ''
      }
      if(data1.tradeTypeName==null){
        data1.tradeTypeName = ''
      }
      if(data1.shopDesc==null){
        data1.shopDesc = ''
      }
      if(data1.deliveryText==null){
        data1.deliveryText = ''
      }
      _this.setData({
        shopMsg: data1
      })
    })
  },
  /**获取店铺评分 */
  getShopGrade() {
    let _this = this;
    let params = {
      shopNo: _this.data.shopNo,
    }
    requestUtil.Requests('product/countEvaluateAvg', params).then((res) => {
      // console.log(res.data)
      let num
      if (res.data.allAvg <= 1) {
        num = 1;
      } else if (res.data.allAvg <= 2) {
        num = 2;
      } else if (res.data.allAvg <= 3) {
        num = 3;
      } else if (res.data.allAvg <= 4) {
        num = 4;
      } else if (res.data.allAvg <= 5) {
        num = 5
      }
      _this.setData({
        shopGrade: res.data,
        one_1: num,
        tow_1: parseInt(5 - num)
      })
    })

  },
  /**查看 */
  businessIicense() {
    let _this = this;
    let imgurl = _this.data.shopMsg.businessLicensePath
    if(imgurl){
      wx.navigateTo({
        url: '../merchant-img/merchant-img?imgurl=' + imgurl,
      })
    }else{
      wx.showToast({
        title: '商家尚未上传商品许可证',
        icon: 'none'
      })
    }
  
  },
  /**查看商家许可证 */
  licence() {
    let _this = this;
    let imgurl = _this.data.shopMsg.hygieneLicense
    if(imgurl){
      wx.navigateTo({
        url: '../merchant-img/merchant-img?imgurl=' + imgurl,
      })
    }else{
      wx.showToast({
        title: '商家尚未上传商品许可证',
        icon:'none'
      })
    }

  }
})
// pages/child/pages/merchant-details/merchant-details.js
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
    this.setData({
      shopNo: options.shopNo
    })
    //获取网店店铺信息
    this.getShopDeatil()
    //获取网店店铺评分
  },
  /**获取网店店铺信息 */
  getShopDeatil() {
    let that = this;
    let params = {
      shopNo: that.data.shopNo
    }
    requestUtil.Requests('product/getNetShopServiceInfo', params).then((res) => {
  
      that.setData({
      
        shopObj:res.data
      })
    })
    requestUtil.Requests('product/countEvaluateAvg', params).then((res) => {
      //判断店铺星级
      let num
      if (res.data.allAvg <= 1) {
        num = 1
      } else if (res.data.allAvg <= 2) {
        num = 2
      } else if (res.data.allAvg <= 3) {
        num = 3
      } else if (res.data.allAvg <= 4) {
        num = 4
      } else if (res.data.allAvg <= 5) {
        num = 5
      }
      that.setData({
        one_1: num,
        tow_1: parseInt(5 - num),
        shopNum:res.data
      })

    })
  },
  /**查看营业执照 */
  businessIicense() {
    let _this = this;
    let imgurl = _this.data.shopObj.businessLicensePath
    if (imgurl) {
      wx.navigateTo({
        url: '../merchant-img/merchant-img?imgurl=' + imgurl,
      })
    } else {
      wx.showToast({
        title: '商家尚未上传商品许可证',
        icon: 'none'
      })
    }

  },
})
// pages/child/pages/order-pay/order-pay.js
// pages/child/pages/order-success/order-success.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //会员id
    price: 0, //会员价格
    imgPath: '', //vip图片
    gradeText: '', //vip名称
    directRemark: "",
    indirectRemark: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id,
      price: options.price,
      imgPath: options.imgPath,
      gradeText: options.gradeText,
      directRemark: options.directRemark,
      indirectRemark: options.indirectRemark
    })
  },
  radioChange: function(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  //确认支付
  handlePay() {
    var that = this;
    var params = {
      userId: wx.getStorageSync('userId') + "",
      openId: wx.getStorageSync('openId') + "",
      id: that.data.id,
      price: that.data.price,
      payStrategy: 6,
      payState: 4
    }
    requestUtil.Requests('user/applyUpgrade', params).then((res) => {
      var obj = JSON.parse(res.data);
      wx.requestPayment({ //调用微信的支付页面
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
          that.showModal("支付成功！");
        },
        fail: function() {
          that.showModal("支付失败！");
        }
      });
    })
  },

  //提示框的显示
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    });
  },

})
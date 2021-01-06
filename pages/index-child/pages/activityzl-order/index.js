// pages/index-child//pages/activitypt-order/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      stockNo:options.stockNo,
      activityNo:options.activityNo,
      activityOrderNo:options.activityOrderNo
    })
    this.getxiangqing();
    this.getDefaultAddress()
     //实例化api核心类
     qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })
  },
  //获取商品详情
  getxiangqing(){
    let that=this;
    let params = {
      activityNo:that.data.activityNo,
      stockNo:that.data.stockNo
    }
    console.log(params)
    requestUtil.Requests('activity/help/querySubmitOrderDetail', params).then((res) => {
      console.log("商品详情====>",res)
      that.setData({
        data:res.data
      })
    })
  },
    /**
   * 获取默认地址
   * */
  getDefaultAddress() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    //判断是否有默认地址
    requestUtil.Requests('user/queryDefaultAddress', params).then((res) => {
      console.log("地址",res)
      if (res.data.isDefault === null) {
        // 选择收货地址
      } else {
        _this.setData({
          addressData: res.data,
          phone: res.data.phone
        })
      }
    })
  },
    /**
   * 选择收货地址
   */
  selectAddress() {
    wx.navigateTo({
      url: '/pages/child/pages/location/location?ishandle=0',
    })
  },
  /**
   * 一键获取微信共享地址
   */
  getWxaddress(){
    var that = this;
    wx.showLoading({
      title: '地址获取中...',
      mask:true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
    wx.getSetting({
      success(res) {
        console.log("用户授权信息",res)
        if (res.authSetting['scope.address']==true) {
          wx.authorize({
            scope: 'scope.address',
            success () {
              wx.chooseAddress()
            }
          })
        }else if(res.authSetting['scope.address']==undefined){
          wx.chooseAddress()
        }else if(res.authSetting['scope.address']==false){
          wx.openSetting({
            success (res) {
              console.log(res.authSetting)
            }
          })
        }
      }
    })
    wx.chooseAddress({
      success(res) {
        console.log(res);
        that.setData({
          yjdizhi:res
        })
        var location = res.provinceName + res.cityName + res.countyName + res.detailInfo
        //获取选择地区的经纬度
        qqmapsdk.geocoder({
          address: location, //地址参数
          success: function (res) { //成功后的回调
          console.log(res)
            var res = res.result;
            var reliability = res.reliability; //可信度参考
            var deviation = res.deviation; //误差距离
            if (reliability >= 7 && deviation != -1) {
              var latitude = res.location.lat;
              var longitude = res.location.lng;
              that.setData({
                latitude: latitude,
                longitude: longitude
              });
              that.setdizhi();
            } else if (reliability < 7) {
              wx.showToast({
                title: '请输入正确的详情地址',
                icon: 'none'
              })
            }
          }
        })
      }  
    })
  },
  //一键获取获取的地址存入后台
  setdizhi(){
    var that=this;
    var res=that.data.yjdizhi;
    let params = {
      userId: wx.getStorageSync('userId') + "", //用户id
      address: res.detailInfo, //详细地址
      persion: res.userName, //收件人
      phone: res.telNumber, //手机号
      lable: "无", //标签
      province: res.provinceName,
      city: res.cityName,
      area: res.countyName,
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      isDefault: 1 //默认地址
    };
    requestUtil.Requests('user/saveAddress', params).then((res) => {
      console.log(res)
      wx.showToast({
        title: '地址加载中',
        icon: 'loading',
        duration: 500
      })
    })
    setTimeout(function () {
      that.getDefaultAddress();
    }, 500) //延迟时间 这里是1秒
  },
  //提交订单
  submitOrder(){
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    let that=this;
    if(!that.data.addressData){
      wx.showToast({
        title: '请填写正确的地址',
        icon: 'none',
      })
      return
    }
    let shippingAddress=that.data.addressData.province+that.data.addressData.city+that.data.addressData.area+that.data.addressData.address
      let params = {
        activityNo:that.data.activityNo,
        stockNo:that.data.stockNo,
        price:that.data.data.helpPrice,
        num:that.data.data.num,
        userId:wx.getStorageSync('userId'),
        receiver:that.data.addressData.persion,
        telephone:that.data.phone,
        shippingAddress:shippingAddress,
        remark:that.data.remark,//备注,
        token:that.data.data.token
      };
      console.log(params)
      requestUtil.Requests('activity/help/launchActivity', params).then((res) => {
        console.log("订单提交===>",res)
        if(res.flag){
          that.handleActivityPay(res.data.activityOrderNo)
          wx.hideLoading()
        }else{
          wx.hideLoading()
        }
      })
  },
  //支付
  handleActivityPay(dataNo) {
    console.log("订单编码===>",dataNo)
    let that=this;
    let shopName=that.data.data.shopDTO.shopName;
    let shopType=that.data.data.shopDTO.shopType;
    let shopNo=that.data.data.shopDTO.shopNo;
    let payPrice=that.data.data.helpPrice;
    let activityNo=that.data.data.activityNo;
    let img=that.data.data.imgPath
    let params={
      activityOrderNo:dataNo,
      payType:4,
      openId:wx.getStorageSync('openId'),
      userId:wx.getStorageSync('userId'),
      price:that.data.data.helpPrice
    };
    console.log(params)
    requestUtil.Requests('activity/help/payLaunchActivity', params).then((res) => {
      console.log(res)
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
            wx.redirectTo({
              url: '/pages/child/pages/order-success/order-success?shopName=' + shopName + '&payPrice=' + payPrice + '&activityNo=' + activityNo + '&activityType=' + '1' + '&cartNo=' + dataNo + '&shopType=' + shopType + '&shopNo=' + shopNo + '&len=1'+'&img='+img+'&type='+shopType+'&shopname='+that.data.data.activityName+"&isshare=1",
            })
        },
        fail: function() {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
        }
      })
    })
  },
  /*订单填写备注*/
    handlebindinput(e) {
      this.setData({
        remark: e.detail.value
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
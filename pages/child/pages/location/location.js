// pages/child/pages/location/location.js
var requestUtil = require('../../../../utils/requestUtil.js')
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
  onLoad: function(options) {
    let _this = this;
    console.log(options.ishandle)
    _this.setData({
      ishandle: options.ishandle
    })
    //实例化api核心类
    qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })
  },
  onShow: function() {
    this.getAddress();
  },
  getAddress() {
    let params = {
      userId: wx.getStorageSync('userId') + "", //用户id
    }
    requestUtil.Requests('user/queryAddress', params).then((res) => {
      this.setData({
        address: res.data
      })
    })
  },
  //修改收货地址
  handleAmend(e) {
    let item = JSON.stringify(e.currentTarget.dataset.item)
    console.log(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: '../add-location/add-location?item= ' + item,
    })
  },
  /**
   * 选择收货地址
   */
  selectSite(e) {
    let _this = this;
    if (_this.data.ishandle == 1) {
      console.log('点击无效!!!!!')
    } else if (_this.data.ishandle == 0) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      console.log(pages)
      if (prevPage) {
        prevPage.setData({
          addressData: e.currentTarget.dataset.item
        })
        wx.navigateBack();
      }
    }

  },
  /**
  * 一键获取微信共享地址
  */
  getWxaddress() {
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
              wx.chooseAddress({
                success(res) {
                  console.log(res);
                  that.setData({
                    yjdizhi: res
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
            }
          })
        }else if(res.authSetting['scope.address']==undefined){
          console.log(res.authSetting['scope.address'],2222222222222222)
          wx.authorize({
            scope: 'scope.address',
            success () {
              wx.chooseAddress({
                success(res) {
                  console.log(res);
                  that.setData({
                    yjdizhi: res
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
            }
          })
        }else if(res.authSetting['scope.address']==false){
          console.log(res.authSetting['scope.address'],3333333)
          wx.openSetting({
            success (res) {
              console.log(res.authSetting)
            }
          })
        }
      }
    })
  },
  //一键获取获取的地址存入后台
  setdizhi() {
    var that = this;
    var res = that.data.yjdizhi;
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
      console.log("存入地址",res)
      if(res.flag){
        that.getAddress();
      }
    })
  },
})
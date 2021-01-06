var requestUtil = require('../../../../utils/requestUtil.js');
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_index: 1,
    inputListShow: false,
    cityListShow: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //实例化api核心类
    console.log(new QQMapWX.QQMapWX({key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'}))
    qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })
    //获取城市定位
    this.getLocation();
  },
  onShow() {
    //获取用户收货地址
    this.getAddress();
  },
  getAddress() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/queryAddress', params).then((res) => {
      _this.setData({
        addressData: res.data
      })
    })
  },
  /**获取用户位置 经纬度 */
  getLocation() {
    let _this = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var latitude = res.latitude; //纬度
        var longitude = res.longitude; //经度
        var speed = res.speed
        var accuracy = res.accuracy; //位置的精确度
        _this.setData({
          latitude: latitude,
          longitude: longitude
        })
        _this.getCity(latitude, longitude)
      },
    })
  },
  /**获取城市 */
  getCity(lat, lon) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lon
      },
      success: function(res) {
        let city = res.result.address_component.city
        that.setData({
          city: city,
          address: res.result.formatted_addresses.recommend
        })
      }
    })
  },
  /**跳转到收货地址 */
  addAddress() {
    wx.navigateTo({
      url: '/pages/child/pages/add-location/add-location?item=0',
    })
  },
  /**选择收货地址后 将地址定位到优店 */
  handleStore(e) {
    let address = e.currentTarget.dataset.address; //地址名
    let latitude = e.currentTarget.dataset.latitude;
    let longitude = e.currentTarget.dataset.longitude
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        city: address,
        latitude: latitude,
        longitude: longitude
      })
      wx.navigateBack();
    }

  },
  /**重新定位到当前位置 */
  updateAddress() {
    this.getLocation();
  },
  /**选择城市 */
  selectCity() {
    wx.navigateTo({
      url: '../location-city/location-city',
    })
  },
  /**输入地点 */
  handleInput(e) {
    let that = this;
    if (e.detail.value) {
      that.setData({
        hidden: false,
        searchContent: e.detail.value
      })
      // that.search(e.detail.value);
    } else {
      that.setData({
        hidden: true
      })
    }
  },
  /**输入完成之后触发 */
  handleConfirm() {
    let searchContent = this.data.searchContent;
    this.search(searchContent);
  },
  /**搜索*/
  search: function(text) {
    var _this = this;
    //调用接口
    qqmapsdk.search({
      keyword: text, //搜索关键字
      page_index: _this.data.page_index, //页码
      location: {
        latitude: _this.data.latitude,
        longitude: _this.data.longitude
      },
      //设置周边搜索中心点
      success: function(res) { //搜索成功后的回调
        let searchList = res.data
        _this.setData({
          searchList: searchList,
          inputListShow: true,
          cityListShow: false
        })
      },
      fail: function(res) {
        console.log('搜索失败~')
      }
    })
  },
  handleSelect(e) {
    let title = e.currentTarget.dataset.title;
    let lat = e.currentTarget.dataset.lat
    let lng = e.currentTarget.dataset.lng
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        city: title,
        latitude: lat,
        longitude: lng
      })
      wx.navigateBack();
    }
  }
})
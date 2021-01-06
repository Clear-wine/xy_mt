// pages/store-child/pages/location-city/location-city.js
var city = require('../../../../libs/city.js');
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _py: ["hot", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"],
    //搜索列表
    inputVal: '',
    showPy: '★',
    historicCityData: [], //历史搜索城市
    hotCityData: [], //热门城市
    hidden: true,
    cityListShow: true,
    inputListShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //实例化api核心类
    qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })
    that.setData({
      historicCityData: wx.getStorageSync('historyList').length > 0 ? wx.getStorageSync('historyList') : [],
      cityData: city.all,
      hotCityData: city.hot
    })
    //获取城市定位
    this.getLocation();
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
        })
      }
    })
  },
  /**重新定位到当前位置 */
  updateAddress() {
    this.getLocation();
  },
  /**取消操作 回到上一页*/
  handleBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  /**选择城市 */
  selectCity(e) {
    var dataset = e.currentTarget.dataset;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        city: dataset.fullname,
        latitude: dataset.lat,
        longitude: dataset.lng
      })
      wx.navigateBack();
    }
  },
  /**搜索后选择的城市 */
  searchSelectCity(e){
    let city = e.currentTarget.dataset.name;
    let lat = e.currentTarget.dataset.poilocation.lat;
    let lng = e.currentTarget.dataset.poilocation.lng
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        city: city,
        latitude:lat,
        longitude: lng
      })
      wx.navigateBack();
    }
  },
  //获取文字信息
  getPy: function(e) {

    this.setData({
      hidden: false,
      showPy: e.target.id,
    })
  },

  setPy: function(e) {

    this.setData({
      hidden: true,
      scrollTopId: this.data.showPy
    })
  },

  //滑动选择城市
  tMove: function(e) {
    var y = e.touches[0].clientY,
      offsettop = e.currentTarget.offsetTop;

    //判断选择区域,只有在选择区才会生效
    if (y > offsettop) {
      var num = parseInt((y - offsettop) / 12);
      this.setData({
        showPy: this.data._py[num]
      })
    };
  },

  //触发全部开始选择
  tStart: function() {
    this.setData({
      hidden: false
    })
  },

  //触发结束选择
  tEnd: function() {
    this.setData({
      hidden: true,
      scrollTopId: this.data.showPy
    })
  },
  /**处理输入 */
  handleInput: function(e) {
    let keywords = e.detail.value;
    this.setData({
      searchContext: keywords
    })
  },
  /**搜索及搜索结果 */
  handleConfirm: function(e) {
    let _this = this;
    var cityList = [];
    var citylist = [];
    var searchContext = _this.data.searchContext; //输入文字
    for (let i in _this.data.cityData) { //城市集合
      cityList.push(_this.data.cityData[i])
    }
    var searchArr = []; //搜索结果数组
    cityList.forEach(item => {
      var citylist = item;
      citylist.forEach(value => {
        if (value.fullname.indexOf(searchContext) >= 0) {
          searchArr.push(value);
        }
      })
    })
    if (searchArr) {
      _this.setData({
        searchList: searchArr,
        inputListShow: true,
        cityListShow: false,
        inputVal: searchContext
      })
    }
  }
})
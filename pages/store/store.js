// pages/store/store.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //num:4,//后台给的分数,显示的星星
    one_1: '', //点亮的星星数
    tow_1: '', //没有点亮的星星数
    page: 1,
    pageSize: 10,
    one_1:3,
    tow_1:2,
    bannerList:[],
    newcomerAdv:undefined,
    xuanze:false,
    xuanze2:false,
    sortAttr:3,
    navHeight:wx.getStorageSync('navHeight'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userId = wx.getStorageSync('userId');
      //实例化api核心类
      qqmapsdk = new QQMapWX.QQMapWX({
        key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
      })
      let latitude = wx.getStorageSync('latitude');
      let longitude = wx.getStorageSync('longitude');
      this.setData({
        latitude: latitude,
        longitude: longitude,
        vipRate: wx.getStorageSync('vipRate'),
        vipGrade: wx.getStorageSync('vipGrade')
      })
      // //获取Banner图信息
      // this.getBanner();
      //获取新人广告
      this.getpNewcomerAdvertising();
      //获取头部/底部导航
      this.getNavigation();
      //调用定位方法
      this.getUserLocation();
  },
  onShow() {
    let _this = this;
    let userId = wx.getStorageSync('userId')
    console.log(userId)
    if (userId) {
      //获取精选店铺
      _this.getShopData()
      //获取附近店铺
      _this.data.page = 1;
      _this.getNearShop()
    } else {
      // wx.redirectTo({
      //   url: '../auth/auth',
      // })
    }
    let query = wx.createSelectorQuery();
    query.select('.head').boundingClientRect(res => {
      // 顶部搜索框高度
      let headHeight = res.height;
      _this.setData({
        headHeight: headHeight || 53
      })
    }).exec()
  },
  //页面完成渲染后触发 且只触发一次
  onReady: function () {
    var that=this;
    that.logins = that.selectComponent("#logins");
    let userId = wx.getStorageSync('userId');
    if(!userId){
      wx.showModal({
        title: '提示',
        content: '如想体验更多操作,请赶快去授权吧~',
        success: function (res) {
          if (res.confirm) { //如果按钮确定
            that.logins.toggleDialog();
          } else if (res.cancel) { //如果点了取消
            wx.showModal({
              title: '警告',
              content: '您取消授权, 将无法体验更多操作, 请授权后再进入!!!',
              showCancel: false,
              confirmText: '返回',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击了"返回授权"')
                }
              }
            })
          }
        }
      })
    }
  },
  //授权完毕后刷新本页面
  callSomeFun(e) {
     //获取精选店铺
     this.getShopData()
     //获取附近店铺
     this.getNearShop()
  },
  // 分享
  onShareAppMessage() {
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'button') {}
    return {
      title: '转发',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/store/store&isshare=1'+ '&noparam=1',
      success: function(res) {}
    }

  },
  //获取精选店铺
  getShopData() {
    let _this = this;
    let params = {
      lat: _this.data.latitude,
      lon: _this.data.longitude
    }
    requestUtil.Requests('product/yoGoods/getChoiceShopData', params).then((res) => {
      var ress = res.data;
      ress.forEach((item) => {
        if(item.score==0){
          item.score=5;
        }
        item.tow_1=5-item.score
      })
      console.log('精选', ress,ress.length)
      if(res.data.length==1){
        _this.setData({
          choiceShop: {}
        })
      } else if (res.data.length == 2){
        _this.setData({
          choiceShop: res.data
        })
      } else if (res.data.length == 3) {
        var obj=res.data
        obj.splice(2, 2);
        _this.setData({
          choiceShop: obj
        })
      }else{
        _this.setData({
          choiceShop: res.data
        })
      }
    })

  },
  /*获取优店附近店铺 */
  getNearShop() {
    let _this = this;
    let params = {
      lat: _this.data.latitude,
      lon: _this.data.longitude,
      page: _this.data.page,
      pageSize: _this.data.pageSize,
      sortAttr: _this.data.sortAttr
    }
    console.log('获取附近店铺的参数',params)
    /* 获取优店首页附近店铺*/
    requestUtil.Requests_page('product/yoGoods/getNearShopData', params, _this.data.nearShop).then((res) => {
      console.log('附近', res.data)
      let data = res.data;
      data.forEach((item) => {
        item.tow_1 =5-item.score
      })
      //算折扣价格
      let vipRate = wx.getStorageSync("vipRate");
      console.log("会员折扣",vipRate)
      data.forEach((list) => {
        list.goodsList.forEach((item)=>{
          item.discountprice = (item.price - item.profit * vipRate).toFixed(2)
        })
      })
      _this.setData({
        nearShop: res.data,
        hasMoreData: res.pageParam.hasMoreData,
        page: res.pageParam.page
      })
    })
  },
  //获取导航栏信息
  getNavigation() {
    let _this = this;
    let data = {
      type: 2
    }
    requestUtil.Requests('product/queryNavigation', data).then((res) => {
      let navlist = res.data
      navlist.forEach(item => {
        //console.log(item)
        if (item.name === "优店") {
          let homelist = item.list
          var bottomNaviId=item.id;
          _this.setData({
            sectionlist: homelist,
            bottomNaviId: bottomNaviId
          })
        }
      })
      _this.getBanner();
    })
  },
  //获取banner图信息
  getBanner() {
    let _this = this;
    let bottomNaviId = _this.data.bottomNaviId;
    let data = {
      bottomNaviId: _this.data.bottomNaviId
    }
    requestUtil.Requests('product/queryYoBannerByType', data).then((res) => {
      console.log("轮播图!!!!!!!",res)
      _this.setData({
        bannerList: res.data
      })
    })
  },
    //获取新人广告
  getpNewcomerAdvertising() {
    let _this = this;
    let data = {
      source: 4
    }
    requestUtil.Requests('product/popular/banner/queryAppData', data).then((res) => {
      _this.setData({
        newcomerAdv: res.data
      })
    })
  },
  //定位方法
  getUserLocation: function() {
    let _this = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          // 未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置,请确认授权',
            success: (res) => {
              if (res.cancel) {
                // 取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                //确定授权,通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      _this.geo();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          _this.geo();
        } else {
          console.log('授权成功')
          //调用wx.getLocation的API
          _this.geo();
        }
      }

    })
  },
  //微信获取当前位置
  geo() {
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
        console.log(latitude)
        _this.getLocal(latitude, longitude)
        // //获取精选店铺
        // _this.getShopData()
        // //获取附近店铺
        // _this.getNearShop()
      },
      fail: function(res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
    console.log('位置')
  },
  /*根据经纬度获取到城市*/
  getLocal(latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        let city = res.result.formatted_addresses.recommend
        that.setData({
          city: city
        })
      }
    })
  },
  /**点击搜索框查询店铺*/
  handleStoreList() {
    
    let that = this;
    let lat = that.data.latitude;
    let lng = that.data.longitude;
    let city = that.data.city
    wx.navigateTo({
      url: '../store-child/pages/store-sreach/index?tradeTypeId=-1' + '&lat=' + lat + '&lng=' + lng + '&city=' + city,
    })
    // wx.navigateTo({
    //   url: '../store-child/pages/storeList/storeList?tradeTypeId=-1' + '&lat=' + lat + '&lng=' + lng + '&city=' + city,
    // })
  },
  /**根据类别点击查询店铺 */
  stroeList(e) {
    let that = this;
    let tradeTypeId = e.currentTarget.dataset.id;
    let lat = that.data.latitude;
    let lng = that.data.longitude;
    let city = that.data.city
    wx.navigateTo({
      url: '../store-child/pages/storeList/storeList?tradeTypeId=' + tradeTypeId + '&lat=' + lat + '&lng=' + lng + '&city=' + city,
    })
  },
  //进入店铺
  toShop(e) {
    let shopNo = e.currentTarget.dataset.nonum;
    console.log("shopNo====>",e.currentTarget.dataset)
    wx.navigateTo({
      url: '/pages/store-child/pages/storeHome/storeHome?shopNo=' + shopNo,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    that.getNearShop()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.hasMoreData) {
      that.getNearShop()
    } else {
      that.setData({
        hasMoreData: !that.data.hasMoreData
      })
    }

  },
  /**跳转到 */
  toLocationSearch() {
    wx.navigateTo({
      url: '../store-child/pages/location-search/index?',
    })
  },
  //跳转到商品详情
  gogoodsNo(e){
    let goodsNo = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/child/pages/product-details/product-details?goodsNo=' + goodsNo
    })
  },
  /**
   * 分类排序*/
   //综合排序
   zonghe(){
     let that=this;
     if(that.data.sortAttr!=3){
      that.setData({
        xuanze:false,
        xuanze2:false,
        sortAttr:3,
        page:1
      })
      that.getNearShop();
    }
   },
   //距离排序
   juli(){
     let that=this;
     let sortAttr = that.data.sortAttr || 3
     if(sortAttr==1){
      sortAttr=3
     }else{
      sortAttr=1
     }
     that.setData({
       xuanze:!that.data.xuanze,
       xuanze2:false,
       sortAttr:sortAttr,
       page:1
     })
     that.getNearShop();
   },
   //销量排序
   xiaoliang(){
    let sortAttr = this.data.sortAttr || 3
    if(sortAttr==2){
     sortAttr=3
    }else{
     sortAttr=2
    }
     this.setData({
       xuanze2: !this.data.xuanze2,
       xuanze:false,
       sortAttr:sortAttr,
       page:1
     })
     this.getNearShop();
   }, 
})  
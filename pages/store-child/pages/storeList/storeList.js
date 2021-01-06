 // pages/store-index/pages/storeList/storeList.js
 var requestUtil = require('../../../../utils/requestUtil.js')
 const app = getApp();
 var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
 var qqmapsdk;
 Page({

   /**
    * 页面的初始数据
    */
   data: {
     selected: 0,
     mask1Hidden: true,
     mask2Hidden: true,
     mask3Hidden: true,
     animationData: "",
     location: "",
     characteristicSelected: [false, false, false, false, false, false, false],
     discountSelected: null,
     selectedNumb: 0,
     sortSelected: "综合排序",
     // jingshu: "净蔬",
     allType: "全部类型",
     sortList: [{
       sort: "销量排序",
       sortType: 1,
     }, {
       sort: "服务排序",
       sortType: 2,
     }, {
       sort: "评分排序",
       sortType: 3,
     }, {
       sort: "配送费最低",
       sortType: 4,
     }],
     // typelist: [{
     //     typeName: "净蔬",
     //     index: "0",
     //     typeNum: '0'
     //   },
     //   {
     //     typeName: "快餐",
     //     index: "1",
     //     typeNum: '1'
     //   },
     //   {
     //     typeName: "超市",
     //     index: "2",
     //     typeNum: '2'
     //   },
     //   {
     //     typeName: "生鲜",
     //     index: "3",
     //     typeNum: '3'
     //   },
     // ],
     allTypelist: [],
     categoryType: -1,
     searchName: '',
     sortType: -1,
     page: 1,
     pageSize: 10,
     shoplist: [],
     tradeTypeId: -1
   },

   handleSelect: function(e) {
     var that = this;
     if (that.data.selected === e.currentTarget.dataset.current) {
       return false;
     } else {
       that.setData({
         selected: e.currentTarget.dataset.current
       })
     }
   },
   onTapTag: function(e) {
     this.setData({
       selected: e.currentTarget.dataset.index
     });
   },
   mask1Cancel: function() {
     this.setData({
       mask1Hidden: true
     })
   },
   mask2Cancel: function() {
     this.setData({
       mask2Hidden: true
     })
   },
   mask3Cancel: function() {
     this.setData({
       mask3Hidden: true
     })
   },
   onjingshu: function() {
     this.setData({
       mask1Hidden: false
     })
   },
   onOverallTag: function() {
     this.setData({
       mask2Hidden: false
     })
   },
   onFilter: function() {
     this.setData({
       mask3Hidden: false
     })
   },
   /*综合排序*/
   sortSelected: function(e) {
     let that = this;
     let sortType = e.currentTarget.dataset.sorttype;
     let index = e.currentTarget.dataset.index
     that.setData({
       sortType: sortType,
       sortSelected:index
     }, function() {
       that.data.page = 1;
       that.getShopPage()
     })
   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function(options) {
     //实例化api核心类
     qqmapsdk = new QQMapWX.QQMapWX({
       key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
     })
     let _this = this;

     //调用定位方法
     // _this.getLocation();

     //获取全部类型
     _this.getNavigation();
     
       _this.setData({
         categoryType: options.tradeTypeId || -1,
         city: options.city,
         lat: options.lat,
         lng: options.lng,
         content: options.content
       })
     _this.getShopPage()

    //  if (options.isSreach) {
    //    _this.setData({
    //      content: options.content,
    //      lat: options.lat,
    //      lng: options.lng
    //    })
    //    _this.getShopPage()
    //  } else {
    //    _this.setData({
    //      categoryType: options.tradeTypeId,
    //      city: options.city,
    //      lat: options.lat,
    //      lng: options.lng

    //    })
    //    _this.getShopByIndustry()
    //  }
   },
   onShow: function() {
    //  if (this.data.isSreach) {
    //    this.getShopPage()
    //  }
   },
   /**获取用户位置 经纬度 */
   // getLocation() {
   //   let _this = this;
   //   wx.getLocation({
   //     type: 'gcj02',
   //     success: function (res) {
   //       var latitude = res.latitude; //纬度
   //       var longitude = res.longitude; //经度
   //       var speed = res.speed
   //       var accuracy = res.accuracy; //位置的精确度
   //       _this.getCity(latitude, longitude)
   //     },
   //   })
   // },
   /**获取城市 */
   // getCity(lat, lon) {
   //   let that = this;
   //   qqmapsdk.reverseGeocoder({
   //     location: {
   //       latitude: lat,
   //       longitude: lon
   //     },
   //     success: function (res) {
   //       let city = res.result.address_component.city
   //       that.setData({
   //         city: city,
   //       })
   //     }
   //   })
   // },
   getShopByIndustry() {
     let _this = this;
     let params = {
       page: _this.data.page,
       pageSize: _this.data.pageSize,
       tradeTypeId: _this.data.categoryType, //商品品类
       sortType: _this.data.sortType, // 排序类型
       lat: _this.data.lat, //维度
       lon: _this.data.lng
     }
     requestUtil.Requests_page('product/getShopByIndustry', params, _this.data.shoplist).then((res) => {
       let data = res.data;
       console.log(res)
       let num
       data.forEach((item) => {
         if (item.score <= 1) {
           num = 1;
         } else if (item.score <= 2) {
           num = 2;
         } else if (item.score <= 3) {
           num = 3;
         } else if (item.score <= 4) {
           num = 4;
         } else if (item.score <= 5) {
           num = 5
         }
       })
       _this.setData({
         shoplist: data,
         page: res.pageParam.page,
         hasMoreData: res.pageParam.hasMoreData,
         one_1: num,
         tow_1: parseInt(5 - num)
       })

     })
   },
   getShopPage() {
     let _this = this;
     let params = {
       //  content: _this.data.searchName, //搜索内容
       content: _this.data.content || "", //搜索内容
       page: _this.data.page,
       pageSize: _this.data.pageSize,
       categoryType: _this.data.categoryType, //商品品类
       sortType: _this.data.sortType, // 排序类型
       lat: _this.data.lat, //维度
       lon: _this.data.lng
     }
     requestUtil.Requests_page('product/yoGoods/queryShopPage', params, _this.data.shoplist).then((res) => {
       let data = res.data;
       console.log(res)
       let num
       data.forEach((item) => {
         if (item.score <= 1) {
           num = 1;
         } else if (item.score <= 2) {
           num = 2;
         } else if (item.score <= 3) {
           num = 3;
         } else if (item.score <= 4) {
           num = 4;
         } else if (item.score <= 5) {
           num = 5
         }
       })
       _this.setData({
         shoplist: data,
         page: res.pageParam.page,
         hasMoreData: res.pageParam.hasMoreData,
         one_1: num,
         tow_1: parseInt(5 - num)
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
         console.log(item)
         if (item.name === "优店") {
           let homelist = item.list
           _this.setData({
             allTypelist: homelist,
           })
         }
       })

     })
   },
   /**选中优店类型 */
   allSelected(e) {
     let _this = this;
     let categoryType = e.currentTarget.dataset.id;
     let index = e.currentTarget.dataset.index;
     _this.setData({
       categoryType: categoryType,
       allType:index
     }, function() {
       _this.data.page = 1;
       _this.getShopPage()
     })
   },
   //获取查询输入的关键字
   getSearchName: function(e) {
     this.setData({
       searchName: e.detail.value,
     })
   },
   handleStoreHome(e) {
     let shopNo = e.currentTarget.dataset.shopno
     wx.navigateTo({
       url: '../storeHome/storeHome?shopNo=' + shopNo,
     })
   },
   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function() {
     let that = this;
     that.data.page = 1;
     that.getShopPage()
   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function() {
     let that = this;
     if (that.data.hasMoreData) {
       that.getShopPage()
     } else {
       that.setData({
         hasMoreData: !that.data.hasMoreData
       })
     }

   },
   /**跳转到 */
   toLocationSearch() {
     wx.navigateTo({
       url: '../location-search/index',
     })
   }
 })
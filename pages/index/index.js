//index.js
//获取应用实例
var requestUtil = require('../../utils/requestUtil.js')
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
})
const app = getApp()
var that;
// var interval = ""; //周期执行函数的对象
// var time = 0; //滑动时间
// var touchDot = 0; //触摸时的原点
// var flag_hd = true; //判定是否可以滑动
// let animationShowHeight = 300; //动画偏移高度
Page({
  data: {
    addressAll: '',
    //section: [],
    currentIndex: 0,
    lunboindex:0,
    //industryNaviId: 0, //行业id
    page: 1,
    pageSize: 10,
    recommendlist: [],
    activitylist:[], //附近活动
    showDialog: true,
    isshowPop: true,
    showPop: false,
    page_show: false,
    show_1:true,
    jiazai:true,
    scrollTop: 0,
    ycshow:false,
    ycheight:228,
    selected:true,
    navHeight:wx.getStorageSync('navHeight'),//顶部沉浸式高度
    section:wx.getStorageSync('section'),// 导航/精选/食品
    //industryNaviId:wx.getStorageSync('industryNaviId'),//精选的id
    activityMenuList:wx.getStorageSync('activityMenuList'),// 活动分类的图标列表
    bannerList:wx.getStorageSync('bannerList'), //轮播图
    noticeList:wx.getStorageSync('noticeList'), //公告
    popularList:wx.getStorageSync('popularList'), //人气推荐
    hotBuyList:wx.getStorageSync('hotBuyList'), //热卖
    //vipRate:wx.getStorageSync('vipRate'), //会员分润
    //vipGrade:wx.getStorageSync('vipGrade'),//会员等级
    //userId: wx.getStorageSync('userId'),
  },
  onLoad: function(options) {
    that = this;
    console.log(  "navHeight",wx.getStorageSync('navHeight'),//顶部沉浸式高度
    "section",wx.getStorageSync('section'),// 导航/精选/食品
    "industryNaviId",wx.getStorageSync('industryNaviId'),//精选的id
    "activityMenuList",wx.getStorageSync('activityMenuList'),// 活动分类的图标列表
    "bannerList",wx.getStorageSync('bannerList'), //轮播图
    "noticeList",wx.getStorageSync('noticeList'), //公告
    "popularList",wx.getStorageSync('popularList'), //人气推荐
    "hotBuyList",wx.getStorageSync('hotBuyList'), //热卖
    "vipRate",wx.getStorageSync('vipRate'), //会员分润
    "vipGrade",wx.getStorageSync('vipGrade'),//会员等级
    "userId",wx.getStorageSync('userId'),)
      this.setData({
        industryNaviId:wx.getStorageSync('industryNaviId'),
        section:wx.getStorageSync('section'),
        activityMenuList:wx.getStorageSync('activityMenuList'),
        bannerList:wx.getStorageSync('bannerList'),
        noticeList:wx.getStorageSync('noticeList'),
        popularList:wx.getStorageSync('popularList'),
        hotBuyList:wx.getStorageSync('hotBuyList'),
        vipRate:wx.getStorageSync('vipRate'),
        vipGrade:wx.getStorageSync('vipGrade'),
        userId:wx.getStorageSync('userId'),
      })
    //得到位置
    this.getSetting()
    //推荐分页
    this.getRecoGoodsPage()
    //获取活动信息
    this.getcontent()

    this.get_wntj();
  },
  get_wntj: function(){
    var list = [];
    let data = {
      categoryType: this.data.industryNaviId,
      page: this.data.page,
      pageSize: that.data.pageSize,
    }
    requestUtil.Requests_page1('product/net/spu/query/mobile/recommend', data, list).then((res) => {
      console.log("为为为为为为为为为为为为为为为",res);
      
    })
  },
  onShow: function() {
    // flag_hd = true; //重新进入页面之后，可以再次执行滑动切换页面代码
    // clearInterval(interval); // 清除setInterval
    // time = 0;
    // wx.getSystemInfo({
    //   success: function(res) {
    //     animationShowHeight = res.windowHeight;
    //   }
    // })
    this.setData({
      userId:wx.getStorageSync('userId'),
    })
  },
  onReady: function () {
    //  页面初次渲染完成后，使用选择器选择组件实例节点，返回匹配到组件实例对象 
    this.logins = this.selectComponent("#logins");
  },
  //授权完毕后刷新本页面
  callSomeFun(e){
    let that=this;
    console.log("授权完毕刷新本页面",e)
    that.onLoad();
    that.onShow();
  },
  //获取人气推荐与热卖top3的商品
  getqueryTopList() {
    let that=this;
    if(that.data.selected){
      let params={};
      requestUtil.Requests('product/queryTopList', params).then((res) => {
        let list=res.data.hotBuyList;
        console.log("人气和热卖=====>",res.data.popularList,list)
        that.setData({
          popularList: res.data.popularList,//人气推荐
          hotBuyList: list   //热卖top3
        })
      })
   }
  },
  //根据行业id查询banner/公告
  getbanner(){
    var _this = this;
    let params = {
      industryNaviId: _this.data.industryNaviId,
      categoryType: _this.data.industryNaviId
    }
    requestUtil.Requests('product/queryBannerAndActivity', params).then((res) => {
      _this.setData({
        activityMenuList: res.data.activityMenuList, //活动列表
        noticeList: res.data.noticeList, //公告列表
        bannerList: res.data.bannerList //轮播图列表
      })
    })
  },
  //根据行业id查询活动信息
  getcontent() {
    var _this = this;
    let params = {
      industryNaviId: _this.data.industryNaviId,
      categoryType: _this.data.industryNaviId
    }
    requestUtil.Requests('activity/ac_other/queryIndexActivity', params).then((res) => {
      console.log("首页的活动信息====>",res)
      if (res.flag) {
        _this.setData({
          advertiseActivityList: res.data.advertiseActivityList, //代言购
          helpActivityList: res.data.helpActivityList, //助力购
          giftPacksActivityList: res.data.giftPacksActivityList, //大礼包
          collageActivityList: res.data.collageActivityList, //拼团购
          chainsActivityList: res.data.chainsActivityList, //接龙购
          showDialog: true
        })
      } else {
        _this.setData({
          showDialog: false
        })
      }

    })

  },
  /*推荐商品分页*/
  getRecoGoodsPage() {
    var _this = this;
    var currentPage = 0; // 因为数组下标是从0开始的，所以这里用了0
    let data = {
      industryNaviId: _this.data.industryNaviId,
      categoryType: _this.data.industryNaviId,
      page: _this.data.page,
      pageSize: 10,
    }
    _this.setData({
      recommendlist: []
    })
    //根据行业id查询首页推荐
    requestUtil.Requests_page('product/netGoods/queryRecommendList', data, _this.data.recommendlist).then((res) => {
      let articles = res.data;
      console.log("为你推荐-->",articles)
      if(articles.length==0){
        var jiazai=false
      }else{
        var jiazai=true
      }
      _this.setData({
        ["recommendlist[" + currentPage + "]"]: articles, // 因为数组下标是从0开始的，所以这里用了0 //推荐
        count: res.count,
        currentPage: currentPage,
        jiazai:jiazai
      })
    })
  },
  //加载下一页数据
  loadMoreData() {
    var _this = this;
    var currentPage = _this.data.currentPage; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    var data = {
      industryNaviId: _this.data.industryNaviId,
      categoryType: _this.data.industryNaviId,
      page: _this.data.page,
      pageSize: _this.data.pageSize,
    }
    var json = {
      v : "v2473",
      params: data
    }
    var jsonStr = JSON.stringify(json)
    wx.request({
      url: app.globalData.requestPath +"product/netGoods/queryRecommendList/v247",
      data: jsonStr,
      method: "POST",
      header: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      success: function (res) {
        var datas = res.data.data; // 接口相应的json数据
        var articles =datas.data; // 接口中的data对应了一个数组，这里取名为 articles
        //console.log(articles)
        // if (articles.length < 10) {
        //   var hasMoreData = false
        // } else {
        //   var hasMoreData = true
        // }
        _this.setData({
          ["recommendlist[" + currentPage + "]"]: articles,
          currentPage: currentPage,
          // hasMoreData: hasMoreData,
        })
        console.log(_this.data.recommendlist)
      }
    })
  },
  //导航选择  
  handleTap(e) {
    console.log(e);
    let _this = this
    if (_this.data.currentIndex === e.currentTarget.dataset.current) {
      return false;
    } else {
      if (_this.data.isshowPop == false) {
        _this.data.showPop = false
      }
      _this.setData({
        currentIndex: e.currentTarget.dataset.current,
        industryNaviId: e.currentTarget.dataset.id,
        showPop: _this.data.showPop,
        show_1:false,
        page:1,
        lunboindex:0,
        jiazai: true,
        pageSize:10,
        selected:false
      })
    }
    _this.data.timer2=setTimeout(() => {
      this.setData({
        show_1: true,
      })
    }, 1000);
  },
  //swiper切换时会调用
  pagechange: function(e) {
    var _this = this;
    if ("touch" === e.detail.source) {
      _this.setData({
        currentIndex: e.detail.current,
        industryNaviId: _this.data.section[e.detail.current].id,
        show_1: false,
        page: 1,
        lunboindex:0,
        jiazai: true,
        pageSize:10
      })
    }
    _this.getcontent();
    _this.getbanner();
    _this.getqueryTopList();
    //推荐分页
    _this.data.page = 1;
    _this.getRecoGoodsPage()
    _this.checkCor()
    _this.data.timer3=setTimeout(() => {
      this.setData({
        show_1: true,
      })
    }, 1000);
  },
  //判断当前滚动超过一屏时,设置tab标题滚动条
  checkCor() {
    if (this.data.currentIndex > 5) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // //轮播滑动时，获取当前的轮播id
  // swiperChange(e) {
  //   const that = this;
  //   that.setData({
  //     swiperIndex: e.detail.current,
  //   })
  // },

  //提示框的显示
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    });
  },
  //点击更多导航分类
  handleModel() {
    wx.navigateTo({
      url: '/pages/index-child/pages/classification/classification',
    })
    // if (this.data.showPop) {
    //   this.hideModal();
    // } else {
    //   this.showModalHead()
    // }
  },
  // 显示底部弹层
  showModalHead: function() {
    var _this = this;
    // var animation = wx.createAnimation({
    //   duration: 500,
    //   timingFunction: 'ease',
    //   delay: 0
    // })
    // _this.animation = animation
    // animation.translateY(300).step()
    _this.setData({
      // animationData: animation.export(),
      showPop: true,
      isshowPop: false,
    })
    // setTimeout(function() {
    //   animation.translateY(0).step()
    //   _this.setData({
    //     animationData: animation.export()
    //   })
    // }.bind(_this), 50)
  },
  // 隐藏底部弹层
  hideModal: function() {
    var _this = this;
    _this.setData({
      // animationData: animation.export(),
      showPop: false,
      isshowPop: true
    })
    // // 隐藏遮罩层
    // var animation = wx.createAnimation({
    //   duration: 500,
    //   timingFunction: "ease",
    //   delay: 0
    // })
    // _this.animation = animation
    // animation.translateY(300).step()
    // _this.setData({
    //   animationData: animation.export(),
    // })
    // setTimeout(function() {
    //   animation.translateY(0).step()
    //   _this.setData({
    //     animationData: animation.export(),
    //     showPop: false,
    //     isshowPop: true
    //   })
    // }.bind(this), 200)
  },

  //转发小程序分享
  onShareAppMessage: function() {
    let openId = wx.getStorageSync('openId');
    return {
      title: '壹叁新消费',
      path: '/pages/start/start?openId=' + openId + '&url=/pages/index/index',
      success: function(res) {},
    }
  },
  //获取列表
  handleProductlist(e) {
    let that = this;
    if (that.data.userId) {
      let type = e.currentTarget.dataset.type
      console.log("type==================>",type)
      if(type==4){
        wx.navigateTo({
          url: '/pages/index-child/pages/jllist/index' //接龙
        })
      }else if(type==1){
        wx.navigateTo({
          url: '/pages/index-child/pages/zllist/index' //助力
        })
      }else if(type==5){
        wx.navigateTo({
          url: '/pages/index-child/pages/ptlist/index'//拼团
        })
      }else if(type==3){
        wx.navigateTo({
          url: '/pages/index-child/pages/dylist/index'//代言
        })
      }else{
      wx.navigateTo({
        url: '/pages/index-child/pages/lblist/index',//大礼包
      })
    }
    } else {
      this.logins.toggleDialog();
    }

  },
  //助力购更多
  zlhandleProductlist(){
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/zllist/index' 
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  //大礼包更多
  lbhandleProductlist(){
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/lblist/index' 
      })
    }else{
      this.logins.toggleDialog();
    }
  },
    //代言购更多
    dyhandleProductlist(){
      if(this.data.userId){
        wx.navigateTo({
          url: '/pages/index-child/pages/dylist/index' 
        })
      }else{
        this.logins.toggleDialog();
      }
    },
    //拼团购更多
    pthandleProductlist(){
      if(this.data.userId){
        wx.navigateTo({
          url: '/pages/index-child/pages/ptlist/index' 
        })
      }else{
        this.logins.toggleDialog();
      }
    },
    //接龙购更多
    jlhandleProductlist(){
      if(this.data.userId){
        wx.navigateTo({
          url: '/pages/index-child/pages/jllist/index'
        })
      }else{
        this.logins.toggleDialog();
      }
    },
  //跳转到普通商品详情
  toDetails(e) {
    if (this.data.userId) {
      let goodsNo = e.currentTarget.dataset.nonum;
      wx.navigateTo({
        url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
      })
    } else {
      this.logins.toggleDialog();
    }

  },
  /**跳转到附近活动 */
  toNearby() {
    if (this.data.userId) {
      wx.navigateTo({
        url: '/pages/child/pages/nearbyActivity/nearbyActivity',
      })
    } else {
      this.logins.toggleDialog();
    }
  },
  /**获取首页活动 */
  getActivity() {
    let that = this;
    let params = {
      lat: wx.getStorageSync('latitude'),
      lon: wx.getStorageSync('longitude')
    }
    requestUtil.Requests('product/getIndexYoActivity', params).then((res) => {
      if(res.data.length>0){
        console.log("附近活动===", res)
        that.setData({
          activitylist: res.data
        })
      }else{
        console.log('暂无附近活动')
      }
      console.log(that.data.activitylist)
    })
  },
  /**跳转到优店活动商品详情页 */
  toActivityDetail(e) {
    if (this.data.userId) {
      let activityNo = e.currentTarget.dataset.activityno;
      let activityType = e.currentTarget.dataset.activitytype;
      let goodsNo = e.currentTarget.dataset.goodsno;
      let type = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '/pages/child/pages/product-act-details/product-act-details?activityNo=' + activityNo + '&activityType=' + activityType + '&goodsNo=' + goodsNo + '&type=' + type,
      })
    } else {
      this.logins.toggleDialog();
    }
  },
  /*跳转到网店活动商品详情*/
  handleDetail(e) {
    let _this = this;
    if (_this.data.userId) {
      let activityNo = e.currentTarget.dataset.activityno;
      let type = e.currentTarget.dataset.type
      console.log("type==================>",type)
      if(type==4){
        wx.navigateTo({
          url: '/pages/index-child/pages/activityjl-details/index?activityNo='+activityNo //接龙
        })
      }else if(type==1){
        wx.navigateTo({
          url: '/pages/index-child/pages/activityzl-details/index?activityNo='+activityNo //助力
        })
      }else if(type==5){
        wx.navigateTo({
          url: '/pages/index-child/pages/activitypt-details/index?activityNo='+activityNo//拼团
        })
      }else if(type==3){
        wx.navigateTo({
          url: '/pages/index-child/pages/activitydy-details/index?activityNo='+activityNo//代言
        })
      }else{
      wx.navigateTo({
        url: '/pages/index-child/pages/activitylb-details/index?activityNo='+activityNo//大礼包
      })
    }
    } else {

      this.logins.toggleDialog();
    }
  },
  /*跳转到助力活动商品详情*/
  zlhandleDetail(e) {
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityzl-details/index?activityNo='+e.currentTarget.dataset.activityno,
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  /*跳转到礼包活动商品详情*/
  lbhandleDetail(e) {
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitylb-details/index?activityNo='+e.currentTarget.dataset.activityno,
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  /*跳转到代言活动商品详情*/
  dyhandleDetail(e) {
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitydy-details/index?activityNo='+e.currentTarget.dataset.activityno,
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  /*跳转到助力活动商品详情*/
  pthandleDetail(e) {
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitypt-details/index?activityNo='+e.currentTarget.dataset.activityno,
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  /*跳转到助力活动商品详情*/
  jlhandleDetail(e) {
    if(this.data.userId){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityjl-details/index?activityNo='+e.currentTarget.dataset.activityno,
      })
    }else{
      this.logins.toggleDialog();
    }
  },
  //跳转到人气推荐列表
  goPopularity(){
    wx.navigateTo({
      url: '/pages/child/pages/popularity/index'
    })
  },
  //跳转到热卖top3的列表
  gohotsale(){
    wx.navigateTo({
      url: '/pages/child/pages/hot-sale/index'
    })
  },
  getSetting() {
    let _this = this;
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) { //用户初始化进去页面,并且未地理位置授权

        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的api
          _this.getLocation();
        } else if (res.authSetting['scope.userLocation'] == true) {
          //调用wx.getLocation的api
          _this.getLocation();
        }
      }
    })
  },
  //微信获得经纬度
  getLocation() {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude)
        that.getLocal(latitude, longitude)
        //获取首页优店活动
        // that.getActivity()
      },
      fail: function(res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  //获取当前地理位置
  getLocal(latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        let city = res.result.ad_info.city
        wx.setStorageSync('city', city)
      },
      fail(res) {
        console.log('...')
      }
    })
  },
  /**向上滑  */
  handleupper() {
    //console.log('向上滑动')
    // this.data.page = 1;
    // this.getRecoGoodsPage()
  },
  /**向下滑 */
  handlelower() {
    console.log('向下滑动')
    let _this = this;
    var sum=0;
    var count = _this.data.count;
    console.log(_this.data.recommendlist)
    for(let i=0;i<_this.data.recommendlist.length;i++){
      sum += _this.data.recommendlist[i].length
    }
    console.log("已获取的数据量",sum,"总数据量",count)
    if (sum<count) {
      //var cha=count-sum;
      // if(cha<10){
        _this.setData({
          pageSize: 10,
          jiazai: true,
          page: _this.data.page + 1
        })
        _this.loadMoreData()
      // }else{
      //   _this.setData({
      //     pageSize: 10,
      //     jiazai: true,
      //     page: _this.data.page + 1
      //   })
      //   _this.loadMoreData()
      // }
    } else {
      _this.setData({
      jiazai:false
      })
    }

  },
  /**查看banner图详情 */
  bannerDetail(e) {
    console.log("111",e)
    let id = e.currentTarget.dataset.id;
    let shopNo = e.currentTarget.dataset.shopno;
    let goodsNo = e.currentTarget.dataset.goodsno;
    let relation = e.currentTarget.dataset.relation;
    let type = e.currentTarget.dataset.type
    if (relation === '1') { // 关联店铺
      if (type === 1) { // 网店
        wx.navigateTo({
          url: '/pages/child/pages/shop/shop?shopNo=' + shopNo
        })
      } else { // 优店
        wx.navigateTo({
          url: '/pages/store-child/pages/storeHome/storeHome?shopNo=' + shopNo,
        })
      }
    } else if (relation === '2') { //关联商品
      if (type === 1) { // 网店
        wx.navigateTo({
          url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo
        })
      } else { // 优店
        wx.navigateTo({
          url: '/pages/child/pages/product-details/product-details?goodsNo=' + goodsNo,
        })
      }

    } else if (relation === '0'){
      if (type== null){
        wx.navigateTo({
          url: '/pages/index-child/pages/bannerDetail/index?id=' + id,
        })
      }
    }else{
      wx.navigateTo({
        url: '/pages/index-child/pages/bannerDetail/index?id=' + id,
      })
    }
  },
  /**查看公告详情 */
  handleitem(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/index-child/pages/notice/index?id=' + id,
    })
  },
  /**扫一扫 */
  scanCode() {
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        console.log(res)
        let result = res.result
        wx.navigateTo({
          url: '/pages/child/pages/scan-code/scan-code?code=' + result,
        })
      }
    })
  },
  //判断用户上滑下滑
  gundong(ev){
    var _this = this;
    //console.log(ev.detail)
    //当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
    if (ev.detail.scrollTop <= 0) {
      ev.detail.scrollTop = 0;
    } //else if (ev.detail.scrollTop > wx.getSystemInfoSync().windowHeight) {
      //ev.detail.scrollTop = wx.getSystemInfoSync().windowHeight;
    //}
    //判断浏览器滚动条上下滚动 || ev.detail.scrollTop == wx.getSystemInfoSync().windowHeight   
    if (ev.detail.scrollTop > _this.data.scrollTop) {
      //console.log('向下滚动');
      if (_this.data.currentIndex == 0){
        var animation = wx.createAnimation({
          duration: 700,
          timingFunction: 'ease'
        });
        animation.opacity(0).translateY(-50).step()
        _this.setData({
          ani: animation.export(),
          ycheight: 95
        })
      }
    } else{
      //console.log('向上滚动');
      var animation = wx.createAnimation({
        duration: 700,
        timingFunction: 'ease'
      });
      animation.opacity(1).translateY(0).step()
      _this.setData({
        ani: animation.export(),
        ycheight:228
      })
    }
    //给scrollTop重新赋值    
    _this.data.timer4=setTimeout(function () {
      _this.setData({
        scrollTop: ev.detail.scrollTop
      })
    }, 0)
  },
    /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that=this
    clearTimeout(that.data.timer2);
    clearTimeout(that.data.timer3);
    clearTimeout(that.data.timer4);
    console.log('定时器===>',that.data.timer2,that.data.timer3,that.data.timer4)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that=this;
    clearTimeout(that.data.timer2);
    clearTimeout(that.data.timer3);
    clearTimeout(that.data.timer4);
  },
})
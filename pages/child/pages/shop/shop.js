// pages/child/pages/shop/shop.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: 0, //scroll-view的高度
    currentIndex: 0,
    currentTab: 0,
    selected: 0,
    shopteb: [{
      tabtitle: "商品",
      id: '0'
    }, {
      tabtitle: "活动",
      id: '1'
    }],
    goodsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    select: null,
    indexTab: 0,
    iid: '0',
    shopGoodsList: [],
    goodsActivityList: []
  },
  //滑动切换
  // swiperTab: function (e) {
  //   var that = this;
  //   that.setData({
  //     currentTab: e.detail.current
  //   });
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this;
    _this.setData({
      shopNo: options.shopNo,
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade')
    });
     if(wx.getStorageSync('userId')){
       //获取到网店店铺信息
    _this.getShopDeatil()
    //获取网店店铺商品分类
    _this.getGoodsTypeList()
    }
   
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // let that = this
    // let query = wx.createSelectorQuery().in(this)
    // for (var o = 0; o < that.data.shopteb.length; o++){
    //   query.select('#num' + 0).boundingClientRect()
    // }
    // query.exec(function(res){
    //   var h = [];
    //   for(var i = 0;i<that.data.shopteb.length;i++){
    //     h.push(res[i].top)
    //   }
    //   that.h = h
    // })
    // query.select('.shopNavTop').boundingClientRect()
    // // query.select('.shop-body').boundingClientRect()
    // query.exec(res => {

    //   // 得到背景高度
    //   let headBack = res[0].height
    //   //得到head头高度
    //   // let headHeight = res[1].height

    //   //scroll-view的高度 = 屏幕高度 - tabbar高(30) -10 -10 -headHeight
    //   //获取屏幕可用高度
    //   let screenHeight = wx.getSystemInfoSync().windowHeight
    //   //计算 scroll-view 的高度
    //   let scrollHeight = screenHeight - headBack

    //   that.setData({
    //     scrollHeight: scrollHeight,
    //     headBack: headBack
    //   })

    // })
  },
  //页面完成渲染后触发 且只触发一次
  onReady: function () {
    var that = this;
    that.logins = that.selectComponent("#logins");
    let userId = wx.getStorageSync('userId');
    if (!userId) {
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
    //获取到网店店铺信息
    _this.getShopDeatil()
    //获取网店店铺商品分类
    _this.getGoodsTypeList()
  },
  onShareAppMessage(res) {
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'menu') {
      return {
        title: this.data.shopObj.shopName,
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shop/shop&shopNo=' + this.data.shopNo + '&isshare=1',
        imageUrl: this.data.shopObj.headImg
      }
    }
  },
  clickTab: function(e) {
    var that = this;
    // if (this.data.currentTab === e.target.dataset.current) {
    //   return false;
    // } else {
    //   that.setData({
    //     currentTab: e.target.dataset.current
    //   })
    // }
    var index = e.currentTarget.dataset.current
    let id = e.currentTarget.dataset.id;
    // wx.pageScrollTo({
    //   scrollTop: that.h[index]-60,
    //   duration:300,
    // })
    that.setData({
      currentTab: index,
      iid: id
    })
    if (id === '1') {
      that.data.page = 1;
      //获取网店活动分页列表
      that.getShopAcitvityPage()
    } else {
      that.data.page = 1;
      //获取网店商品分页列表
      that.getShopGoodsPage()
    }
    console.log(e.target.dataset.current)
  },
  // onPageScroll: function (e) {
  //   // 
  //   var that = this
  //   var scrollTop = e.scrollTop + 82 + 41  //加上吸顶框的高度
  //   var i = 111//随便给一个大于索引的数值
  //   switch (true) {
  //     case scrollTop > that.h[0] && scrollTop < that.h[1]:
  //       i = 0;
  //       break;
  //     case scrollTop > that.h[1] && scrollTop < that.h[2]:
  //       i = 1;
  //       break;
  //   }
  //   if (i != that.select) {
  //     that.setData({
  //       select: i
  //     })
  //   }
  // },
  handleSelect(e) {
    var that = this;
    let goodsTypeId = e.currentTarget.dataset.id
    if (this.data.currentIndex === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentIndex: e.currentTarget.dataset.current,
        goodsTypeId: goodsTypeId
      }, function() {
        that.data.page = 1;
        that.getShopGoodsPage()
      })
    }
  },
  // 截获竖向滑动
  catchTouchMove: function(res) {
    return false
  },
  //跳转商家详情页
  toMerchant() {
    let _this = this;
    let shopNo = _this.data.shopNo
    wx.navigateTo({
      url: "../merchant-details/merchant-details?shopNo=" + shopNo,
    })
  },

  /*获取网店店铺活动分页*/
  getShopAcitvityPage() {
    let _this = this;
    let params = {
      shopNo: _this.data.shopNo,
      shopType: 1,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_other/queryInShopActivity', params, _this.data.goodsActivityList).then((res) => {
      console.log("活动商品",res)
      let data = res.data;
      for (let i in data) {
        switch (data[i].activityType) {
          case '1':
            data[i].actPrice = data[i].lowPrice;
            data[i].actName = '助力购'
            break;
          case '2':
            data[i].actPrice = data[i].giftPacksPrice;
            data[i].actName = '大礼包'
            break;
          case '3':
            data[i].actPrice = data[i].price;
            data[i].actName = '代言购'
            break;
          case '4':
            data[i].actPrice = data[i].chainsHeadPrice;
            data[i].actName = '接龙购'
            break;
          case '5':
            data[i].actPrice = data[i].collagePrice;
            data[i].actName = '拼团购'
            break;
        }
      }

      _this.setData({
        goodsActivityList: res.data, //活动商品
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  /**
   * 上滑更新
   */
  scrollBottom() {
    let self = this;
    if (self.data.shopHasMoreData) {
      self.getShopGoodsPage(); //店铺商品更新
    }
  },
  /*获取网店店铺商品分类*/
  getGoodsTypeList() {
    let _this = this;
    let params = {
      shopNo: _this.data.shopNo
    }
    requestUtil.Requests('product/getGoodsTypeList', params).then((res) => {
      let goodstypelist = {
        id: -1,
        name: '全部'
      }
      res.data.unshift(goodstypelist);
      let goodsTypeId = res.data[0].id;
      _this.setData({
        goodsList: res.data,
        goodsTypeId: goodsTypeId
      }, function() {
        //获取网店店铺商品分页列表
        _this.data.page = 1;
        _this.getShopGoodsPage()
      })
    })

  },
  /* 获取网店店铺商品分页列表*/
  getShopGoodsPage() {
    let that = this;
    let params = {
      shopNo: that.data.shopNo,
      goodsTypeId: that.data.goodsTypeId,
      page: that.data.page,
      pageSize: that.data.pageSize
    }
    requestUtil.Requests_page('product/netGoods/queryShopGoodsPage', params, that.data.shopGoodsList).then((res) => {
      console.log('商品分页', res.data);
      that.setData({
        shopGoodsList: res.data,
        page: res.pageParam.page,
        shopHasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  /**获取网店店铺信息 */
  getShopDeatil() {
    let that = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      shopNo: that.data.shopNo
    }
    // requestUtil.Requests('product/enterNetShop', params).then((res) => {
    requestUtil.Requests('product/getNetShopInfo', params).then((res) => {
      let num;
      let isAttention;
      let isAttentionText;
      if (res.data.shopScore <= 1) {
        num = 1;
      } else if (res.data.shopScore <= 2) {
        num = 2;
      } else if (res.data.shopScore <= 3) {
        num = 3;
      } else if (res.data.shopScore <= 4) {
        num = 4;
      } else if (res.data.shopScore <= 5) {
        num = 5
      }
      if (res.data.isAttention === '0') { //未关注
        isAttentionText = '关注'
        res.data.isAttention = false;
      } else if (res.data.isAttention === '1') { //已关注
        isAttentionText = '已关注';
        res.data.isAttention = true
      }
      that.setData({
        shopObj: res.data,
        one_1: num,
        tow_1: parseInt(5 - num),
        isAttention: res.data.isAttention,
        isAttentionText: isAttentionText
      })
    })

  },
  /**关注/取消店铺*/
  handleAttention() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      shopNo: _this.data.shopNo
    }
    requestUtil.Requests('product/operateShopAttention', params).then((res) => {
      if (_this.data.isAttention) {
        _this.data.isAttentionText = '已关注';
      } else {
        _this.data.isAttentionText = '关注';

      }
      _this.setData({
        isAttention: !_this.data.isAttention,
        isAttentionText: _this.data.isAttentionText
      })
    })
  },
  /**滚动到底部刷新 获取更多数据 */
  bindscrolltolower(e) {
    let _this = this;
    if (_this.data.hasMoreData) {
      _this.getShopAcitvityPage(); //活动商品更新
    }
  },
  /**
   *查看商品详情 
   */
  todetails(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '../shopping-details/shopping-details?goodsNo=' + goodsNo,
    })
  },
  /**跳转到活动详情页
   */
  toactivtyDetails(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    let shopType = e.currentTarget.dataset.shoptype;
    let activityNo = e.currentTarget.dataset.activityno;
    let activityType = e.currentTarget.dataset.activitytype
    if(activityType=="1"){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityzl-details/index?activityNo=' + activityNo,
      })
    }else if(activityType=="2"){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitylb-details/index?activityNo=' + activityNo,
      })
    }else if(activityType=="3"){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitydy-details/index?activityNo=' + activityNo,
      })
    }else if(activityType=="4"){
      wx.navigateTo({
        url: '/pages/index-child/pages/activityjl-details/index?activityNo=' + activityNo,
      })
    }else if(activityType=="5"){
      wx.navigateTo({
        url: '/pages/index-child/pages/activitypt-details/index?activityNo=' + activityNo,
      })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.page = 1;
    if (this.data.iid === '0') {
      this.getShopGoodsPage()
    } else {
      this.getShopAcitvityPage()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.shopHasMoreData) {
      this.getShopGoodsPage()
    }
    if (this.data.hasMoreData) {
      this.getShopAcitvityPage()
    }

  },
})
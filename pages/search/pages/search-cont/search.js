// pages/search/search.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    hasMoreData: true,
    contentlist: [],
    searchName: "", //查询参数名称   
    isShow: false,
    sorttab: [ //类别分类
      {
        tabtitle: "商品",
        index: '0',
        type: 1
      },
      {
        tabtitle: "活动",
        index: '1',
        type: 2
      },
      {
        tabtitle: "店铺",
        index: '2',
        type: 3
      },
    ],
    currentTab: 0,
    tabShopList: [ //店铺搜索结果条件查询
      {
        title: "综合排序",
        index: '0',
        sortType: 1
      },
      {
        title: "销量优先",
        index: '1',
        sortType: 2
      },
      {
        title: "评分优先",
        index: '2',
        sortType: 3
      }
    ],
    tabArr: {
      curHdIndex: 1,
      curBdIndex: 1,
      sortType: 1,
      agg: 0
    },
    t: 0, //价格
    sort: "desc",
    condition: '综合',
    tabIndex: 0,
    top: 0,
    type: 1,
    sortType: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade'),
      type: options.type,
      content: options.content,
      sortType: options.sortType
    })

  },
  onShow() {
     let that = this;
    // let query = wx.createSelectorQuery().in(this)
    // query.select('.swiper-tab-list').boundingClientRect(function(res) {
    //   //得到head头高度
    //   let headHeight = res.height;
    //   console.log(headHeight)
    //   // scroll-view的高度 = 屏幕高度 -headHeight
    //   //获取屏幕可用高度
    //   let screenHeight = wx.getSystemInfoSync().windowHeight
    //   //计算scroll-view的高度
    //   let scrollHeight = screenHeight - headHeight
    //   that.setData({
    //     scrollHeight: scrollHeight
    //   })
    // }).exec()
    that.findSearchProduct()
  },
  //商品/活动 tab切换
  tabFun(e) {
    //获取触发事件组件的dataset属性
    let that = this;
    let _id = e.target.dataset.id;
    let _p = e.target.dataset.p;
    let _t = e.target.dataset.t;
    let sortType = e.target.dataset.sorttype
    let _obj = {};
    _obj.curBdIndex = _id;
    _obj.curHdIndex = _id;
    //第一个没排序
    if (_id == 1) {
      _obj.agg = 0;
      that.setData({
        condition: '综合',
        sort: 'desc',
        tabArr: _obj,
        t: 0,
        sortType: sortType,
        page:1
      }, function() {
        that.findSearchProduct()
      });
    }
    //第二个没有排序
    if (_id == 3) {
      _obj.agg = 0;
      that.setData({
        tabArr: _obj,
        t: 0,
        condition: 'sell',
        sort: 'desc',
        sortType: sortType,
        page:1
      }, function() {
        that.findSearchProduct()
      });
    }
    //第三个
    if (_id == 2 && _t == 0) {
      _obj.agg = 4;
      that.setData({
        tabArr: _obj,
        t: 5,
        condition: 'price',
        sort: 'asc',
        sortType: 4
      }, function() {
        that.findSearchProduct()
      })
    }
    if (_id == 2 && _t == 5) {
      _obj.agg = 5;
      that.setData({
        tabArr: _obj,
        t: 0,
        condition: 'price',
        sort: 'desc',
        sortType: 2,
        page:1  
      }, function() {
        that.findSearchProduct()
      })
    }
  },
  /*点击tab切换 查询类型*/
  clickTab: function(e) {
    let _this = this;
    if (_this.data.currentTab === e.currentTarget.dataset.current) {
      return false
    } else {
      _this.setData({
        currentTab: e.currentTarget.dataset.current,
        type: e.currentTarget.dataset.type,
        page:1
      }, function() {
        _this.findSearchProduct()
      })
    }
  },
  /**点击排序类型查询 */
  handleType(e) {
    let _this = this;
    if (_this.data.tabIndex === e.currentTarget.dataset.index) {
      return false;
    } else {
      _this.setData({
        tabIndex: e.currentTarget.dataset.index,
        sortType: e.currentTarget.dataset.sorttype
      }, function() {
        _this.findSearchProduct()
      })
    }
  },
  //按条件查询产品列表
  findSearchProduct() {
    let _this = this;
    let params = {
      content: _this.data.content, //搜索内容
      type: _this.data.type, //查询类型
      sortType: _this.data.sortType, //排序类型
      page:_this.data.page,
      pageSize:10
    }
    requestUtil.Requests_page('product/queryNetShopPage', params,_this.data.contentlist).then((res) => {
      //判断店铺星级
      console.log(JSON.stringify(res.data))
      let num
      let data = res.data
      data.forEach((item) => {
        if (item.shopScore <= 1 || item.activityType === '1') {
          num = 1
          item.activityTypeName = '助力'
          item.actPrice = item.lowPrice
        } else if (item.shopScore <= 2 || item.activityType === '2') {
          num = 2
          item.activityTypeName = '礼包'
          item.actPrice = item.giftPacksPrice
        } else if (item.shopScore <= 3 || item.activityType === '3') {
          num = 3
          item.activityTypeName = '代言'
          item.actPrice = item.price
        } else if (item.shopScore <= 4 || item.activityType === '4') {
          num = 4
          item.activityTypeName = '接龙'
          item.actPrice = item.chainsHeadPrice
        } else if (item.shopScore <= 5 || item.activityType === '5') {
          num = 5
          item.activityTypeName = '拼团'
          item.actPrice = item.collagePrice
        }

      })

      //判断活动
      _this.setData({
        contentlist: res.data,
        one_1: num,
        tow_1: parseInt(5 - num),
        count:res.count
      })
      console.log('查询', res)
    })
  },
  handleFocus() {
    var pages = getCurrentPages(); //当前页面
    var beforePage = pages[pages.length - 2]; //前一页
    var obj={
      type:1,
      sorttype:1
    }
    wx.navigateBack({
      success: function () {
        beforePage.onLoad(obj); // 执行前一个页面的onLoad方法
      }
});
  },
  /**跳转到店铺 */
  toShop(e) {
    let _this = this;
    let shopNo = e.currentTarget.dataset.shopno
    wx.navigateTo({
      url: '/pages/child/pages/shop/shop?shopNo=' + shopNo,
    })
  },
  /**跳转到普通的商品详情 */
  toGoods(e) {

    let that = this;
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
    })
  },
  /**跳转到活动的商品详情 */
  toActivity(e) {
    let _this = this;
    let activityType = e.currentTarget.dataset.activitytype;
    let activityNo = e.currentTarget.dataset.activityno;
    let type = e.currentTarget.dataset.type
    let goodsNo = e.currentTarget.dataset.goodsno
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
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function() {
  //   
  //   let pages = getCurrentPages(); // 当前页的数据，可以输出来看看有什么东西
  //   let prevPage = pages[pages.length - 2]; // 上一页的数据，也可以输出来看看有什么东西
  //   /** 设置数据 这里面的 value 是上一页你想被携带过去的数据，后面是本方法里你得到的数据，我这里是detail.value，根据自己实际情况设置 */
  //   prevPage.setData({
  //     type:this.data.type,
  //     sortType:this.data.sortType
  //   })
  //   // /** 返回上一页 这个时候数据就传回去了 可以在上一页的onShow方法里把 value 输出来查看是否已经携带完成 */
  //   // wx.navigateBack({});
  // },

   /**
   * 页面上拉触底事件的处理函数
   */
  scrollBottom: function () {
    let that=this;
    this.setData({
      page:this.data.page+1
    })
    if(that.data.contentlist.length<that.data.count){
      this.findSearchProduct()
    }else{
      wx.showToast({
        title: '暂无更多数据',
        icon:'none'
      })
    }
  },
});
// pages/coupon/coupon.js
var requestUtil = require('../../utils/requestUtil.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentlist: [], //分页数据
    type: 1,
    // isShowCoupon: true //是否显示失效的卷
    currentIndex: 0,
    orderteb: [{
        tebtitle: "未使用",
        index: "0",
        type: '1'
      },
      {
        tebtitle: "已使用",
        index: "1",
        type: '2'
      },
      {
        tebtitle: "已过期",
        index: "2",
        type: '3'

      }
    ],
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //获取代金券列表
    this.getCouponList()
  },
  onShow() {
    let that = this;
    let query = wx.createSelectorQuery().in(this);
    query.select('.couponNav').boundingClientRect(function(res) {
      //得到head头高度
      let headHeight = res.height
      console.log(headHeight)
      //scroll-view的高度 = 屏幕高度 - headHeight
      //获取屏幕可用高度
      let screenHeight = wx.getSystemInfoSync().windowHeight
      //计算scroll-view 的高度
      let scrollHeight = screenHeight - headHeight
      that.setData({
        scrollHeight: scrollHeight,
        headHeight: headHeight
      })
    }).exec()
  },
  //获取代金券列表
  getCouponList() {
    var _this = this;
    var params = {
      userId: wx.getStorageSync('userId'),
      type: _this.data.type,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('user/findVoucher', params).then((res) => {
      console.log(res)
      _this.setData({
        contentlist: res.data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })

  },
  //swiper切换时会调用
  pagechange: function(e) {
    var _this = this;
    if ("touch" === e.detail.source) {
      // let currentPageIndex = _this.data.currentIndex
      // currentPageIndex = (currentPageIndex + 1) % 2
      _this.setData({
        currentIndex: e.detail.current
      })
    }
  },
  //用户点击tab时调用
  titleClick: function(e) {
    var that = this;
    if (that.data.currentIndex == e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        //拿到当前索引并动态改变
        currentIndex: e.currentTarget.dataset.current,
        type: e.currentTarget.dataset.type
      })
      that.data.page = 1;
      that.getCouponList()
    }

  },
  // 截获竖向滑动
  catchTouchMove: function(res) {
    return false
  },
  //滚动到底部触发
  scrollBottom() {
    // //是否显示失效的卷
    if (this.data.hasMoreData) {
      this.getCouponList()
    }
  },
  //立即使用,去首页
  goindex(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
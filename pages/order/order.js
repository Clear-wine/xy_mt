// pages/order/order.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    page: 1,
    pageSize: 10,
    status: -1,
    orderteb: [{
        tebtitle: "全部订单",
        index: "0",
        status: -1
      },
      {
        tebtitle: "优店订单",
        index: "1",
        status: -2
      },
      {
        tebtitle: "待付款",
        index: "2",
        status: 0
      },
      {
        tebtitle: "待发货",
        index: "3",
        status: 1
      },
      {
        tebtitle: "待收货",
        index: "4",
        status: 2
      },
      {
        tebtitle: "待评价",
        index: "5",
        status: 3
      }
    ],
    isremind:null,
    orderList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      currentIndex: options.index,
      index: options.index,
      status: options.status
    })
    console.log("订单列表获取的数据",options)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.title').boundingClientRect(function(res) {
      //得到head头高度
      let headHeight = res.height
      console.log(headHeight + '顶部高度')
      //scroll-view的高度 = 屏幕高度 - tabbar高(30) -10 -10 -headHeight
      //获取屏幕可用高度
      let screenHeight = wx.getSystemInfoSync().windowHeight
      //计算 scroll-view 的高度
      let scrollHeight = screenHeight - headHeight
      that.setData({
        scrollHeight: scrollHeight,
        headHeight: headHeight,
        page:1
      })
      //获取订单列表
      that.getOrderListPage()
    }).exec()
  },
  // 分享
  onShareAppMessage(res) {
    if (res.from === 'button') {}
    return {
      title: '壹叁新消费',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/order/order' + '&isshare=1'+ '&noparam=1',
      success: function(res) {}
    }

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
        status: e.currentTarget.dataset.status
      }, function() {
        that.data.page = 1;
        that.getOrderListPage()
      })

    }

  },
  // 截获竖向滑动
  catchTouchMove: function(res) {
    return false
  },
  //跳转到订单详情
  handleOrderDetails(e) {
    let _v = this;
    let orderNo = e.currentTarget.dataset.orderno;
    let shopNo = e.currentTarget.dataset.shopno;
    let status = e.currentTarget.dataset.status;
    let orderType = e.currentTarget.dataset.ordertype;
    let merchantNo = e.currentTarget.dataset.merchantno;
    if (_v.data.status == -2) {
      wx.navigateTo({
        url: '../child/pages/orderYo-details/index?orderNo=' + orderNo + '&shopNo=' + shopNo + '&status=' + status + '&orderType=' + orderType + '&merchantNo=' + merchantNo,
      })
    } else {
      wx.navigateTo({
        url: '../child/pages/order-details/order-details?orderNo=' + orderNo + '&shopNo=' + shopNo + '&status=' + status + '&orderType=' + orderType + '&merchantNo=' + merchantNo,
      })
    }

  },

  getOrderListPage() {
    let vm = this;
    if(vm.data.status==-2){
      var url='order/yo/queryListPage'
    }else{
      var url='order/net/queryListPage'
    }
    let params = {
      userId: wx.getStorageSync('userId'),
      status: vm.data.status,
      page: vm.data.page,
      pageSize: vm.data.pageSize
    }
    requestUtil.Requests_page(url, params, vm.data.orderList).then((res) => {
      let data = res.data;
      console.log(data)
      data.forEach((el) => {
        switch (el.status) {
          case 0:
            el.statusName = '等待买家付款';
            el.statusNameDelivery = '买家待付款';
            el.statusNameUp = '买家待付款';
            console.log('a')
            el.m=vm.endtime(el.orderEnd)
            break;
          case 1:
            el.statusName = '等待卖家发货';
            el.statusNameDelivery = '商家备货中';
            el.statusNameUp = '商家备货中';
            break;
          case 2:
            el.statusName = '等待卖家收货';
            el.statusNameDelivery = '骑手配送中';
            el.statusNameUp = '待买家提货'
            break;
          case 3:
            el.statusName = '交易成功';
            el.statusNameDelivery = '订单已送达';
            el.statusNameUp = '交易成功'
            break;
          case 4:
            el.statusName = '交易成功';
            el.statusNameDelivery = '订单已送达';
            el.statusNameUp = '交易成功'
            break;
          case 5:
            el.statusName = '交易关闭';
            el.statusNameDelivery = '订单已取消';
            el.statusNameUp = '订单已取消'
            break;
          case 6:
            el.statusName = '退款中';
            el.statusNameDelivery = '退款中';
            el.statusNameUp = '退款中'
            break;
          case 7:
            el.statusName = '已退款';
            el.statusNameDelivery = '已退款';
            el.statusNameUp = '已退款'
        }
        switch (el.orderType) {
          case 1:
            el.orderTypeName = '助力购';
            el.orderIcon = '../images/help_shopping.png'
            break;
          case 2:
            el.orderTypeName = '大礼包';
            el.orderIcon = '../images/gift_packs.png'
            break;
          case 3:
            el.orderTypeName = '代言购';
            el.orderIcon = '../images/represent_shopping.png'
            break;
          case 4:
            el.orderTypeName = '接龙购';
            el.orderIcon = '../images/jie_long.png'
            break;
          case 5:
            el.orderTypeName = '拼团购';
            el.orderIcon = '../images/group_shopping.png'
            break;
        }
        //判断订单列表的未支付商品是否已经到订单结束时间,如果是的那么就不能支付商品
        if (el.status == 0) {
          vm.handleOutTime(el.status, el.orderEnd)
        }
      })
      vm.setData({
        orderList: data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData,
        // shopType: res.data.shopType,
        // deliveryType: res.data.deliveryType // 0：送货 1：自提
      })

    })
  },
   //计算待付款剩余时间
   endtime(time){
    //let time="2020-12-31 11:15:24.0";
    if(time.length>19){
      var sj=time.substring(0,19)
    }else{
      var sj=time
    }
    //计算目标与现在时间差(毫秒)
    let endDates = sj.replace(/-/g, "/");
    let endtime = new Date(endDates).getTime(); //结束时间
    let nowtime = new Date().getTime(); //当前时间
    var leftTime = endtime - nowtime;
    if(leftTime>0){
      var d, h, m, s, ms;
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      d = d < 10 ? "0" + d : d //天数
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h //小时
      var fhtime=m
    }else{
      var fhtime=0
    }
    return fhtime
  },
  /*判断是否超时*/
  handleOutTime(status, orderEnd) {
    let _this = this;
    if (status == 0) {
      var d = new Date(Date.parse((orderEnd).replace(/-/g, "/")));
      var curDate = new Date();
      if (d <= curDate) {
        _this.setData({
          hidPay: true
        })
        return;
        //console.log('订单时间小于当前时间,表示订单已结束')
      } else {
        //console.log('订单时间小于当前时间,表示订单未结束')
      }
    }
    setTimeout(function() {
      _this.handleOutTime(status, orderEnd);
    }, 1000)

  },
  /**
   *删除订单
   */
  delHandle(e) {
    let _this = this;
    let orderNo = e.currentTarget.dataset.orderno; //订单编码
    let status = e.currentTarget.dataset.status;
    let shopNo = e.currentTarget.dataset.shopno
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: orderNo,
      shopNo: shopNo,
      operateType: 1,
      shopType:e.currentTarget.dataset.shoptype+''
    }
    wx.showModal({
      title: '删除订单',
      content: '确定删除该订单?',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            _this.data.page = 1;
            _this.getOrderListPage()
          })
          console.log("取消/删除成功啦!!!!")
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**取消订单*/
  handleCancel(e) {
    let _this = this;
    let orderNo = e.currentTarget.dataset.orderno; //订单编码
    let status = e.currentTarget.dataset.status;
    let shopNo = e.currentTarget.dataset.shopno
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: orderNo,
      shopNo: shopNo,
      operateType: 0,
      shopType:e.currentTarget.dataset.shoptype+''
    }
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单?',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            _this.data.page = 1;
            _this.getOrderListPage()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 滚动到底部 数据更新
   */
  updatalower() {
    if (this.data.hasMoreData) {
      this.getOrderListPage()
    } else {
      // wx.showToast({
      //   title: '没有更多数据了...',
      //   icon: "none"
      // })
    }
  },
  /**
   * 滚动到顶部 数据更新
   */
  updatatop() {
    this.data.page = 1;
    this.getOrderListPage()
  },
  /**付款 */
  handlePay(e) {
    let _this = this;
    if (_this.data.hidPay) {
      wx.showToast({
        title: '订单已超时',
        icon: 'none'
      })
    } else {
      let shopType = e.currentTarget.dataset.shoptype;
      let orderPrice=e.currentTarget.dataset.orderprice;
      let params = {
        orderNoStr: e.currentTarget.dataset.orderno,
        userId: wx.getStorageSync('userId'),
        payType: 3,
        openId: wx.getStorageSync('openId'),
        shopType: shopType,
        price:orderPrice
      }
      console.log(params)
      requestUtil.Requests('order/payOrder', params).then((res) => {
        console.log(res)
        var obj = JSON.parse(res.data)
        console.log(obj)
        wx.requestPayment({
          timeStamp: obj.timeStamp,
          nonceStr: obj.nonceStr,
          package: obj.package,
          signType: obj.signType,
          paySign: obj.sign,
          success: function(res) {
            console.log('支付成功啦!!!')
            //获取订单列表
            _this.getOrderListPage()
          },
          fail: function() {
            wx.showToast({
              title: '支付失败!',
              icon: 'error'
            })
          }
        })
      })
    }
  },
  /**查看订单物流 */
  checklogistics(e) {
    let _this = this;
    let orderNo = e.currentTarget.dataset.orderno;
    let shopNo = e.currentTarget.dataset.shopno;
    wx.navigateTo({
      url: '/pages/child/pages/logistics/logistics?orderNo=' + orderNo + '&shopNo=' + shopNo,
    })
  },
  /**确认收货 */
  affirm(e) {
    let _this = this;
    let orderNo = e.currentTarget.dataset.orderno;
    let shopNo = e.currentTarget.dataset.shopno;
    let params = {
      orderNo: orderNo,
      userId: wx.getStorageSync('userId'),
      shopNo: shopNo,
      shopType:e.currentTarget.dataset.shoptype+''
    }
    requestUtil.Requests('order/confirmReceiptGoods', params).then((res) => {
      console.log(res)
      if (res.flag) {
        wx.showToast({
          title: '收货成功',
          icon:'success'
        })
        _this.setData({
          page:1
        })
        _this.getOrderListPage()
      }
    })
  },
  /**评价 */
  evaluate(e) {
    let orderNo = e.currentTarget.dataset.orderno;
    let shopNo = e.currentTarget.dataset.shopno;
    let orderGoodsList = e.currentTarget.dataset.ordergoodslist;
    let merchantNo = e.currentTarget.dataset.merchantno;
    let shopType = e.currentTarget.dataset.shoptype;
    let activityNo=e.currentTarget.dataset.activityno;
    let orderType=e.currentTarget.dataset.ordertype;
    let goodsobj = {};
    let goodsarr = [];
    orderGoodsList.forEach(el => {
      goodsobj = {
        goodsNo: el.goodsNo,
        goodsImg: el.goodsImg
      }
      goodsarr.push(goodsobj);
    })
    if(orderType!=0){
      wx.navigateTo({
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsarr) + '&orderCode=' + orderNo + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+"&activityNo="+activityNo+'&orderType='+orderType,
      })
    }else{
      wx.navigateTo({
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsarr) + '&orderCode=' + orderNo + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+"&activityNo=0",
      })
    }
  },
  /**提醒发货 */
  remind(e) {
    let _this = this;
    if(_this.data.isremind){
      wx.showToast({
        title: '已提醒商家发货，无需重复提醒~',
        icon: 'none',
        duration: 3000
      })
    }else{
      
      let orderNo = e.currentTarget.dataset.orderno
      let params = {
        orderNo: orderNo,
        shopType:e.currentTarget.dataset.shoptype+''
      }
      requestUtil.Requests('order/orderRemindNotice', params).then((res) => {
        if (res.flag) {
          wx.showToast({
            title: '已提醒发货~',
            icon: 'success',
            duration: 3000
          })
          _this.setData({
            isremind: true
          })
        }
      })

    }

  },
})
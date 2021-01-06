// pages/child/pages/order-details/order-details.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShareTrue: false,
    toView: 'red',
    scrollTop: 100,
    page: 1,
    pageSize: 10,
    likedata: [],
    orderTypeName: "",
    operateType: 0,
    shouhou:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.merchantNo) {
      this.setData({
        merchantNo: options.merchantNo
      })
    }
    if (options.status) {
      this.setData({
        orderStatus: options.status
      })
    }
    this.setData({
      shopNo: options.shopNo,
      orderNo: options.orderNo,
      // status: options.status, //订单状态
      // orderType: options.orderType, //订单类型
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade')
    })
     if(wx.getStorageSync('userId')){
        //获取猜你喜欢分页列表
    this.getLikeGoodsPage()
    //获取订单详情
    this.getOrderDetail()
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
    //获取猜你喜欢分页列表
    this.getLikeGoodsPage()
    //获取订单详情
    this.getOrderDetail()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    // 分享产品的id
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    if (res.form === 'button') {
      console.log(res.target)
    }
    return {
      title: _this.data.orderDetailList[0].goodsName,
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitydy-details/index&shopType=' + _this.data.orderDetailData.shopType + '&goodsNo=' + _this.data.orderDetailList[0].goodsNo + '&activityType=3' + '&activityNo=' + _this.data.orderDetailData.activityNo + '&isshare=1' + '&cartNo=' + _this.data.orderNo, //分享后打开的页面\
      imageUrl: _this.data.orderDetailList[0].goodsImg, 
    }

  },
  /**
   * 点击为商品代言,需判断一个订单中有几个商品
   * 一个商品则直接分享
   * 多个商品弹出商品 进行选择分享
   */
  handleShare() {
    // 如果是多个商品
    this.setData({
      isShareTrue: true
    })
  },
  /**
   * 关闭弹出层
   */
  hideShare() {
    this.setData({
      isShareTrue: false
    })
  },
  // 
  upper: function(e) {
    console.log(e)
  },
  lower: function(e) {
    console.log(e)
  },
  scroll: function(e) {
    console.log(e)
  },
  getLikeGoodsPage() {
    let that = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      type: 1,
      page: that.data.page,
      pageSize: that.data.pageSize

    }
    requestUtil.Requests_page('product/netGoods/queryLoveGoodsPage', params, that.data.likedata).then((res) => {
      console.log('猜你喜欢', res.data)
      that.setData({
        likedata: res.data,
        page: res.pageParam.page,
        hasMore: res.pageParam.hasMoreData
      })

    })
  },
  getOrderDetail() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      //shopNo: _this.data.shopNo,
      orderNo: _this.data.orderNo
    }
    requestUtil.Requests('order/net/queryDetail', params).then((res) => {
      let data = res.data;
      console.log("订单详情",res)
      let reallyPay = 0;
      // let orderTime = data.orderTime.replace(/-/g, "/"); //下单时间
      let odend = data.orderEnd || ''
      let orderEnd = odend.replace(/-/g, "/"); //订单结束时间
      let openTime = new Date().getTime();
      let endTime = new Date(orderEnd).getTime();
      if (data.status == 0) { //待付款
        // var timer = (endTime - openTime);
        _this.countdown(endTime, openTime); //倒计时
      } else if (data.status == 2) { //待收货
        _this.queryLogisticInfo(); //查看订单物流信息
      }
      //实际付款
      if (data.activityNo) {
        reallyPay = Math.round((data.price - data.voucherPrice) * 100) / 100;
      } else {
        data.orderDetailList.forEach(el => {
          reallyPay = el.num * el.price
        })
        reallyPay = Math.round((reallyPay - data.voucherPrice) * 100) / 100;
      }
      _this.setData({
        orderDetailData: res.data,
        orderDetailList: res.data.orderDetailList, //订单商品列表
        addressData: res.data.scroll, //收货地址
        reallyPay: reallyPay,
        status: res.data.status, //订单状态
        orderType: res.data.orderType, //订单类型
        price: res.data.price,
        orderShopId:res.data.orderShopId,
        shopType:res.data.shopType,
        allowRefund:res.data.allowRefund,//是否可以申请退款
        refundId:res.data.refundId,//退款订单的ID
        clock:_this.date_format(endTime - openTime)
      })
      //判断订单来源
      _this.decideOrderType()
      //判断订单是否可以售后
      _this.parefund()
    })
  },
  //判断订单是否可以售后
  parefund(){
    let that=this;
    let allowRefund=that.data.allowRefund;
    let status=that.data.status;
    if((status==3||status==4||status==2)&&allowRefund){
      that.setData({
        shouhou:true
      })
    }
  },
  /**查看订单物流信息 */
  queryLogisticInfo() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      orderNo: _this.data.orderNo,
      shopNo: _this.data.shopNo
    }
    requestUtil.Requests('order/queryLogisticInfo', params).then((res) => {
      console.log(res)
      if (!res.flag) {
        let islog = true
        _this.setData({
          islog: islog
        })
      } else {
        let len = res.data.traces.length;
        _this.setData({
          acceptStation: res.data.traces[len - 1].acceptStation,
          acceptTime: res.data.traces[len - 1].acceptTime,
          islog: false,
          companyName:res.data.companyName,
          deliveryNo:res.data.deliveryNo
        })
      }

    })
  },
  decideOrderType() {
    let _this = this;
    if (_this.data.orderType == 1) {
      _this.data.orderTypeName = '助力购'
    } else if (_this.data.orderType == 2) {
      _this.data.orderTypeName = '大礼包'
    } else if (_this.data.orderType == 3) {
      _this.data.orderTypeName = '代言购'
    } else if (_this.data.orderType == 4) {
      _this.data.orderTypeName = '接龙购'
    } else if (_this.data.orderType == 5) {
      _this.data.orderTypeName = '拼团购'
    }
    _this.setData({
      orderTypeName: _this.data.orderTypeName
    })
  },
  /**查看商品详情*/
  toGoodsDetails(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '../shopping-details/shopping-details?goodsNo=' + goodsNo,
    })
  },
  onUnload(){
    let that = this;
    clearInterval(that.intval)
  },
  /**倒计时 */
  countdown(endTime, openTime) {
    let that = this;
    let intDiff = Math.floor((endTime - openTime) / 1000 -1);
    that.intval = setInterval(function(){
      let day=0,
        hour=0,
        minute=0,
        second=0;//时间默认值        
        if(intDiff > 0){
            day = Math.floor(intDiff / (60 * 60 * 24));
            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }else{
          clearInterval(intval);
          return;
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        that.setData({
          clock:`${hour}:${minute}:${second}`
        })
        intDiff--;
    },1000)
    // //倒计时毫秒
    // var duringMs = endTime - openTime;
    // // 渲染倒计时时钟
    // that.setData({
    //   clock: that.date_format(duringMs)
    // });
    // if (duringMs <= 0) {
    //   that.setData({
    //     clock: '支付已截止,请重新下单'
    //   });
    //   that.data.operateType = 0;
    //   if (that.data.orderStatus != 5) {
    //     that.updateOrder();
    //   }
    //   // timeout则跳出递归
    //   return;
    // }
    // setTimeout(function() {
    //   // 放在最后--
    //   duringMs -= 10;
    //   that.countdown;
    // }, 10)
  },
  /* 格式化倒计时 */
  date_format: function(micro_second) {
    var that = this
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = Math.floor(second / 3600);
    // 分钟位
    var min = that.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
    // 秒位
    var sec = that.fill_zero_prefix(second % 60); // equal to => var sec = second % 60;
    return hr + ":" + min + ":" + sec + " ";
  },

  /* 分秒位数补0 */
  fill_zero_prefix: function(num) {
    return num < 10 ? "0" + num : num
  },
  /**查看物流信息 */
  querylogistics() {
    let orderNo = this.data.orderNo;
    let shopNo = this.data.shopNo;
    let deliveryAddress = this.data.orderDetailData.deliveryAddress
    wx.navigateTo({
      url: '../logistics/logistics?orderNo=' + orderNo + '&shopNo=' + shopNo + '&deliveryAddress=' + deliveryAddress,
    })
  },
  /**删除订单 */
  delOrder() {
    let _v = this;
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: _v.data.orderNo,
      shopNo: _v.data.shopNo,
      operateType: 1, //删除订单
      shopType:_v.data.shopType
    }
    wx.showModal({
      title: '删除订单',
      content: '确定删除该订单吗?',
      success: function(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            if(res.flag){
              wx.showToast({
                title: '删除成功',
                icon:'success'
              })
              setTimeout(function() {
                var pages = getCurrentPages(); //当前页面
                var beforePage = pages[pages.length - 2]; //前一页
                wx.navigateBack({
                  success: function () {
                    beforePage.onLoad(); // 执行前一个页面的onLoad方法
                  }
                });
              },1500)
            }else{
              wx.showToast({
                title: '删除失败,请稍后重试',
                icon:'none'
              })
            }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**取消订单 */
  cancelOrder() {
    let _v = this;
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: _v.data.orderNo,
      shopNo: _v.data.shopNo,
      operateType: 0, //取消订单
      shopType:_v.data.shopType
    }
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单?',
      success: function(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            console.log("取消/删除成功啦!!!!",res)
            _v.getOrderDetail()
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**支付*/
  handlePay() {
    let _p = this;
    let param = {
      orderNoStr: _p.data.orderNo,
      userId: wx.getStorageSync('userId'),
      payType: 3,
      openId: wx.getStorageSync('openId'),
      shopType: _p.data.shopType,
      price: _p.data.price,
    }
    requestUtil.Requests('order/payOrder', param).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
          console.log('支付成功啦!!!')
          wx.redirectTo({
            url: '/pages/order/order?status=-1' + '&index=0'
          })
        },
        fail: function() {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
        }
      })

    })
  },
  /**查看物流 */
  checklogistics() {
    let _c = this;
    wx.navigateTo({
      url: '../logistics/logistics?orderNo=' + _c.data.orderNo + '&shopNo=' + _c.data.shopNo,
    })
  },
  /**提醒发货 */
  handleRemind() {
    let _this = this;
    if (_this.data.isremind) {
      wx.showToast({
        title: '已提醒商家发货，无需重复提醒~',
        icon: 'none',
        duration: 3000
      })
    } else {
      let params = {
        orderNo: _this.data.orderNo,
        shopType:_this.data.shopType
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
  /**评价订单 */
  evaluate() {
    let _this=this;
    let orderNo =  _this.data.orderNo;
    let shopNo =  _this.data.shopNo;
    let orderGoodsList =  _this.data.orderDetailList;
    let merchantNo =  _this.data.merchantNo;
    let shopType =  _this.data.shoptype;
    let activityNo=_this.data.activityNo;
    let orderType=_this.data.orderType;
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
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsarr) + '&orderCode=' + orderNo + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+'&activityNo='+activityNo+'&orderType='+orderType,
      })
    }else{
      wx.navigateTo({
        url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsarr) + '&orderCode=' + orderNo + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType+'&activityNo=0',
      })
    }
  },
  /**倒计时取消订单 */
  updateOrder() {
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: this.data.orderNo,
      operateType: this.data.operateType,
      shopNo: this.data.shopNo
    }
    requestUtil.Requests("order/updateOrder", param).then((res) => {
      console.log('取消成功!')
    })
  },
  /**确认收货 */
  affirm() {
    
    let _this = this;
    let orderNo = _this.data.orderNo;
    let shopNo = _this.data.shopNo;
    let params = {
      orderNo: orderNo,
      userId: wx.getStorageSync('userId'),
      shopNo: shopNo,
      shopType:_this.data.shopType
    }
    requestUtil.Requests('order/confirmReceiptGoods', params).then((res) => {
      if (res.flag) {
        wx.showToast({
          title: '收货成功',
          icon:'success'
        })
        _this.getOrderDetail()      
      }
    })
  },
  //申请退款
  gorefund(){
    let that=this;
    let shopType=that.data.shopType; //店铺编码
    let orderNo=that.data.orderNo;//订单编码
    let orderShopId=that.data.orderShopId;//订单ID
    if(that.data.status==1){
      wx.showModal({
        title: '申请退款',
        content: '您购买的商品，马上就要发货了，是否确认退款？',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/refund-child/pages/refund-application/index?shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId+'&refundModel=1' 
            })
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/refund-child/pages/refund-application/index?shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId+'&refundModel=1' 
      })
    }
  },
  //申请售后
  gorefunds(){
    let that=this;
    let shopType=that.data.shopType; //店铺编码
    let orderNo=that.data.orderNo;//订单编码
    let orderShopId=that.data.orderShopId;//订单ID
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-type/index?shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId
    })
  },
  //取消退款
  gorefundss(){
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-details/index?id='+this.data.refundId
    })
  },
  //查看退款进度
  gorefundsss(){
    wx.navigateTo({
      url: '/pages/refund-child/pages/refund-progress/index?id='+this.data.refundId
    })
  },
  //复制单号
  fuzhidanhao(){
    wx.setClipboardData({
      data: this.data.deliveryNo,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
})
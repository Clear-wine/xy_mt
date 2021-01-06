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
    operateType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("传参",options)
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
    //获取猜你喜欢分页列表
    // this.getLikeGoodsPage()
     if(wx.getStorageSync('userId')){
      //获取订单详情
    this.getOrderDetail()
    }
    
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
    //为商品代言新增我的代言
    _this.joinAdvertiseGoods()
    return {
      title: '13新消费',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activity-details/activity-details&shopType=' + _this.data.orderDetailData.shopType + '&goodsNo=' + _this.data.orderDetailList[0].goodsNo + '&activityType=3' + '&activityNo=' + _this.data.orderDetailData.activityNo + '&isshare=1' + '&cartNo=' + _this.data.orderNo, //分享后打开的页面
    }

  },
  joinAdvertiseGoods() {
    let _this = this;
    let params = {
      activityNo: _this.data.orderDetailData.activityNo,
      goodsNo: _this.data.orderDetailList[0].goodsNo,
      userId: wx.getStorageSync('userId'),
      type: _this.data.orderDetailData.shopType,
      orderNo: _this.data.orderDetailData.orderNo,
      stockNo: _this.data.orderDetailList[0].goodsNorms
    }
    requestUtil.Requests('cart/myAdvertiseGoods', params).then((res) => {
      console.log('新增代言成功啦!!!!')
    })
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
  /**查看商品详情*/
  toGoodsDetails(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '../product-details/product-details?goodsNo=' + goodsNo,
    })
  },
  getOrderDetail() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      //shopNo: _this.data.shopNo,
      orderNo:_this.data.orderNo
    }
    console.log("上传数据",params)
    requestUtil.Requests('order/yo/queryDetail', params).then((res) => {
      console.log(res)
      let data = res.data;
      let reallyPay = 0;
      let goodsallprice = 0;
      // let orderTime = data.orderTime.replace(/-/g, "/"); //下单时间
      if (data.status == 0) { //待付款
        let orderEnd = data.orderEnd.replace(/-/g, "/"); //订单结束时间
        let openTime = new Date().getTime();
        let endTime = new Date(orderEnd).getTime();
        // var timer = (endTime - openTime);
        _this.countdown(endTime, openTime); //倒计时
      } else if (data.status == 2 && data.deliveryMode == '2') { //待收货
        _this.queryLogisticInfo(); //查看订单物流信息
      }
      //实际付款
      if (data.activityNo) {
        reallyPay = Math.round((data.price - data.voucherPrice) * 100) / 100;
      } else {
        data.goodsList.forEach(el => {
          goodsallprice += el.num * el.price
        })
        reallyPay = Math.round((goodsallprice + res.data.packFee - data.voucherPrice) * 100) / 100;
      }
      //是否可以退款按钮
      if(res.data.status==1||res.data.status==2||res.data.status==3||res.data.status==4){
        if(res.data.allowRefund){
          var allowRefunds=true;
        }else{
          var allowRefunds=false;
        }
      }else{
        var allowRefunds=false;
      }
      _this.setData({
        orderDetailData: res.data,
        orderDetailList: res.data.goodsList, //订单商品列表
        addressData: res.data.scroll, //收货地址
        reallyPay: reallyPay, //实际付款
        status: res.data.status, //订单状态
        orderType: res.data.orderType, //订单类型
        likedata: data.footPrintList,
        goodsallprice: goodsallprice, //商品总价
        deliveryType: res.data.deliveryType, //订单配送方式
        price: res.data.price,
        allowRefunds:allowRefunds,//是否可以退款
        shopType:res.data.shopType,
        orderNo:res.data.orderNo,
        orderShopId:res.data.orderShopId,
        shopNo:res.data.shopNo,
        deliveryModeText:res.data.deliveryModeText,
        refundId:res.data.refundId
      })
      //判断订单来源
      _this.decideOrderType()
    })
  },
  /**判断订单来源 */
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
    /**
   *删除订单
   */
  delHandle(e) {
    let _this = this;
    let orderNo = _this.data.orderNo; //订单编码
    let status = _this.data.status;
    let shopNo = _this.data.shopNo
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: orderNo,
      shopNo: shopNo,
      operateType: 1,
      shopType:_this.data.shopType
    }
    console.log(param)
    wx.showModal({
      title: '删除订单',
      content: '确定删除该订单?',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            console.log("删除订单",res)
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
                    beforePage.onShow(); // 执行前一个页面的onLoad方法
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
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**取消订单*/
  handleCancel(e) {
    let _this = this;
    let orderNo = _this.data.orderNo; //订单编码
    let status = _this.data.status;
    let shopNo = _this.data.shopNo
    let param = {
      userId: wx.getStorageSync('userId'),
      orderNo: orderNo,
      shopNo: shopNo,
      operateType: 0,
      shopType:_this.data.shopType
    }
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单?',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('order/updateOrder', param).then((res) => {
            console.log("取消订单",res)
            if(res.flag){
              wx.showToast({
                title: '取消成功',
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
                title: '取消失败,请稍后重试',
                icon:'none'
              })
            }
          })
          console.log("取消/删除成功啦!!!!")
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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
      let shopNo =  _this.data.shopNo;
      let params = {
        orderNoStr: _this.data.orderNo,
        userId: wx.getStorageSync('userId'),
        payType: 3,
        openId: wx.getStorageSync('openId'),
        shopType: _this.data.shopType,
        price: _this.data.price,
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
  /**查看物流 */
  checklogistics() {
    let _c = this;
    wx.navigateTo({
      url: '../logistics/logistics?orderNo=' + _c.data.orderNo + '&shopNo=' + shopNo,
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
        console.log(res)
        if (res.flag) {
          wx.showToast({
            title: '收货成功',
            icon:'success'
          })
          _this.getOrderListPage()
        }
      })
    },
  /**评价 */
  evaluate(e) {
    let _this=this;
    let orderNo =  _this.data.orderNo;
    let shopNo =  _this.data.shopNo;
    let orderGoodsList =  _this.data.orderDetailList;
    let merchantNo =  _this.data.merchantNo;
    let shopType =  _this.data.shoptype
    let goodsobj = {};
    let goodsarr = [];
    orderGoodsList.forEach(el => {
      goodsobj = {
        goodsNo: el.goodsNo,
        goodsImg: el.goodsImg
      }
      goodsarr.push(goodsobj);
    })
    wx.navigateTo({
      url: '/pages/child/pages/comment/comment?goodsNoarr=' + JSON.stringify(goodsarr) + '&orderCode=' + orderNo + '&merchantNo=' + merchantNo + '&shopNo=' + shopNo + '&shopType=' + shopType,
    })
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
  //前往退款
  gorefund(){
    let that=this;
    let shopType=that.data.shopType; //店铺编码
    let orderNo=that.data.orderNo;//订单编码
    let orderShopId=that.data.orderShopId;//订单ID
    let status=that.data.status;
    if(status==1){
      var refundModel=1;
    }else if(status==2){
      var refundModel=2;
    }else if(status==3){
      var refundModel=3;
    }
    if(that.data.status==1){
      var tishi='您购买的商品,马上就要发货了,是否确认退款？'
    }else{
      var tishi='您正在退款,可能会产生配送费,是否确认退款?'
    }
    wx.showModal({
      title: '申请退款',
      content: tishi,
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/refund-child/pages/refund-application/index?shopType='+shopType+'&orderNo='+ orderNo+'&orderShopId='+orderShopId+'&refundModel='+refundModel 
          })
        } else {
          console.log('用户点击取消')
        }
      }
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
})
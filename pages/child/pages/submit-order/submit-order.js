// pages/child/pages/submit-order/submit-order.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity: false, //判断是否是活动
    activityType: 0,
    voucherId: null, //优惠卷
    voucherPrice:0,//优惠券金额
    deliveryType: '0', //0：送货 1：自提
    userType: '1', //参加活动的类型 1:发起者 2：参与者
    typelist: [{
        name: '商家配送',
        type: '0'
      },
      {
        name: '到店自提',
        type: '1'
      }
    ],
    currentSelectTripType: '商家配送',
    index: 0,
    remark: "", //备注
    dataPrice: 0,
    voucherPriceArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('传参=====>',options)
    let _this = this;
    if (options.source && options.type == 1) { //普通网店商品下单
      let array = JSON.parse(options.goodsArr)
      console.log('商品信息=======>',array)
      _this.setData({
        source: options.source, //下单来源
        goodsArr: array,
        shopType: options.type,
        vipGrade: wx.getStorageSync('vipGrade'),
        vipRate: wx.getStorageSync('vipRate'),
        shopNo:options.shopNo,
        shopType:options.type
      })
      //获取普通网店下单页面
      _this.getBuyGoodsOrder()
      // } else if (options.source && options.type == 2) { //获取普通优店下单页面
      //   let array = JSON.parse(options.shopObj)
      //   _this.setData({
      //     source: options.source, //下单来源
      //     shopObj: array,
      //     shopType: options.type
      //   })
      //   //获取普通优店下单页面
      //   _this.getBuyYoGoodsOrder()

    } else if (options.activityNo) { //活动商品下单
      // let activityUser = wx.getStorageSync('activityUser')
      // if (activityUser === "" || activityUser) {
      //   this.data.userType = '1'
      // } else {
      //   this.data.userType = '2'

      // }
      _this.setData({
        shopType: options.type, //店铺类型
        activityNo: options.activityNo, //活动编码
        activityType: options.activityType, //活动类型
        stockNo: options.stockNo, //库存编码
        price: options.price, //活动价
        userType: options.userIdType ? options.userIdType : '1',
        vipGrade: wx.getStorageSync('vipGrade'),
        vipRate: wx.getStorageSync('vipRate')
      })
      //获取活动商品的下单页面
      _this.getBuyActivity()
    }
    //查询用户是否设有默认地址
    _this.getDefaultAddress();
    //实例化api核心类
    qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  //判断优惠券
  youhuijuan(){
    let that=this;
    let data=that.data.data;
    let useShopNo=that.data.useShopNo;
    let iscoupon=that.data.iscoupon;
    console.log('点击优惠劵的店铺',useShopNo)
    data.shopDataList.forEach(item=>{
      if(item.shopNo==useShopNo){
        if(item.voucherId){
          wx.showModal({
            title: '提示',
            content: '以选择优惠券,如需更换,请重新下单',
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                var pages = getCurrentPages(); //当前页面
                var beforePage = pages[pages.length - 2]; //前一页
                wx.navigateBack({
                  success: function () {
                    //beforePage.onLoad(); // 执行前一个页面的onLoad方法
                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          iscoupon=false;
        } 
      }else if(item.voucherId==that.data.voucherId){
        wx.showModal({
          title: '提示',
          content: '该优惠券已被选用,请选择其他优惠券',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        iscoupon=false;
      }
    })
    if (iscoupon) {
      data.price=(data.price-that.data.voucherPrice).toFixed(2)
      data.shopDataList.forEach(item=>{
        if(item.shopNo==useShopNo){
          item.voucherId=that.data.voucherId;
          item.voucherPrice=that.data.voucherPrice;
          item.price=(item.price-that.data.voucherPrice).toFixed(2);
        }else{
        }
      })
    }
    console.log(data)
    that.setData({
      data:data
    })
  },
  //获取页面数据2.4.4-君
  getBuyGoodsOrder() {
    let that=this;
    let params={
      source:that.data.source,
      userId:wx.getStorageSync('userId'),
      shopList:that.data.goodsArr
    };
    requestUtil.Requests('product/netGoods/querySubmitData',params).then((res)=>{
      console.log(res)
      let data=res.data;
      data.shopDataList.forEach(item=>{
        item.voucherId=that.data.voucherId;//优惠券id
        item.voucherPrice=that.data.voucherPrice;//优惠券金额
      })
      that.setData({
        data:res.data,
      })
    })
  },
  /*时间段区间**/
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      // pickUpTime: this.data.timeArr[e.detail.value]
    })
  },
  getBuyActivity() {
    let that = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      type: that.data.shopType,
      activityType: that.data.activityType,
      stockNo: that.data.stockNo,
      price: that.data.price,
      activityNo: that.data.activityNo
    }
    requestUtil.Requests("product/buyHelpActivityPage", params).then((res) => {
      let shopGoodsPrice = res.data.shopGoodsPrice;
      res.data.goodsInfoList[0].shopGoodsPrice = shopGoodsPrice;
      that.setData({
        data: res.data, //店铺信息
        numAll: res.data.goodsInfoList[0].num,
        priceAll: res.data.shopGoodsPrice.toFixed(2),
        priceOriginalAll: res.data.shopGoodsPrice.toFixed(2)
      })
    })
  },
  /**
   * 获取默认地址
   * */
  getDefaultAddress() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    //判断是否有默认地址
    requestUtil.Requests('user/queryDefaultAddress', params).then((res) => {
      console.log("地址"+res)
      if (res.data.isDefault === null) {
        // 选择收货地址
      } else {
        _this.setData({
          addressData: res.data,
          phone: res.data.phone
        })
      }
    })
  },
  /**
   * 一键获取微信共享地址
   */
  getWxaddress(){
    var that = this;
    wx.showLoading({
      title: '地址获取中...',
      mask:true
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
    wx.getSetting({
      success(res) {
        console.log("用户授权信息",res)
        if (res.authSetting['scope.address']==true) {
          wx.authorize({
            scope: 'scope.address',
            success () {
              wx.chooseAddress({
                success(res) {
                  console.log(res);
                  that.setData({
                    yjdizhi:res
                  })
                  var location = res.provinceName + res.cityName + res.countyName + res.detailInfo
                  //获取选择地区的经纬度
                  qqmapsdk.geocoder({
                    address: location, //地址参数
                    success: function (res) { //成功后的回调
                    console.log(res)
                      var res = res.result;
                      var reliability = res.reliability; //可信度参考
                      var deviation = res.deviation; //误差距离
                      if (reliability >= 7 && deviation != -1) {
                        var latitude = res.location.lat;
                        var longitude = res.location.lng;
                        that.setData({
                          latitude: latitude,
                          longitude: longitude
                        });
                        that.setdizhi();
                      } else if (reliability < 7) {
                        wx.showToast({
                          title: '请输入正确的详情地址',
                          icon: 'none'
                        })
                      }
                    }
                  })
                } 
              })
            }
          })
        }else if(res.authSetting['scope.address']==undefined){
          wx.chooseAddress()
        }else if(res.authSetting['scope.address']==false){
          wx.openSetting({
            success (res) {
              console.log(res.authSetting)
            }
          })
        }
      }
    })
  },
  //一键获取获取的地址存入后台
  setdizhi(){
    var that=this;
    var res=that.data.yjdizhi;
    let params = {
      userId: wx.getStorageSync('userId') + "", //用户id
      address: res.detailInfo, //详细地址
      persion: res.userName, //收件人
      phone: res.telNumber, //手机号
      lable: "无", //标签
      province: res.provinceName,
      city: res.cityName,
      area: res.countyName,
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      isDefault: 1 //默认地址
    };
    requestUtil.Requests('user/saveAddress', params).then((res) => {
      console.log(res)
      wx.showToast({
        title: '地址加载中',
        icon: 'loading',
        duration: 500
      })
    })
    setTimeout(function () {
      that.getDefaultAddress();
    }, 500) //延迟时间 这里是1秒
  },
  /**
   * 获取预留电话
   */
  bindKeyInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  /**
   * 选择收货地址
   */
  selectAddress() {
    wx.navigateTo({
      url: '../location/location?ishandle=0',
    })
  },
  //提交订单v2.4.4-君
  submitOrders(){
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    let that=this;
    if(!that.data.addressData){
      wx.showToast({
        title: '请填写正确的地址',
        icon: 'none',
      })
      return
    }
    var addressId=that.data.addressData.id;
    let shoplist=that.data.data.shopDataList;
    let shop=[];
    shoplist.forEach(item=>{
      var goodslist={
        shopNo:item.shopNo,
        voucherId:item.voucherId,
        voucherPrice:item.voucherPrice,
        shopPrice:item.price,
        shopCount:item.totalNum,
        goodsList:item.goodsList
      }
      shop.push(goodslist)
    })
    let params={
      token:that.data.data.token,
      userId:wx.getStorageSync('userId'),
      source:that.data.source,
      count:that.data.data.totalNum,
      price:that.data.data.price,
      addressId:addressId,
      shopList:shop
    };
    console.log("上传数据",JSON.stringify(params))
    requestUtil.Requests('product/netGoods/submitOrder',params).then((res)=>{
      console.log(res)
      if(res.flag){
        that.handlePay(res.data.orderNo)
      }
    })
  },
  /**
   * 提交订单
   */
  submitOrder() {
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    let _this = this;
    let datajson = {};
    let goodsArr = [];
    let goodsObj = {};
    let shopArr = [];
    let i = Number(_this.data.index)
    let shopData = _this.data.data;
    if (_this.data.activityNo) { //是活动商品
      if (_this.data.activityType != '2') { //如果不是大礼包商品
        datajson = {
          "shopNo": shopData.shopNo, //店铺编码
          "shopType": _this.data.shopType, //店铺类型
          "price": shopData.goodsInfoList[0].price.toString(), //订单总价
          "deliveryAddress": _this.data.addressData.id, //收货地址
          "deliveryType": _this.data.deliveryType, //包邮方式
          "remark": _this.data.remark, //订单备注
          "originalPrice": shopData.goodsInfoList[0].originalPrice,
          "rate": 0.0
        }
        for (let v in shopData.goodsInfoList) {
          goodsObj = {
            "goodsNo": shopData.goodsInfoList[v].goodsNo,
            // "stockNo": shopData.goodsInfoList[v].stockNo,
            "num": shopData.goodsInfoList[v].num,
            "price": shopData.goodsInfoList[v].price.toString(),
            "originalPrice": shopData.goodsInfoList[0].originalPrice,
            "rate": 0.0
          }
          if (shopData.goodsInfoList[v].stockNo != null) {
            goodsObj.stockNo = shopData.goodsInfoList[v].stockNo
          } else {
            goodsObj.stockNo = '-1'
          }
          goodsArr.push(goodsObj) //提交订单商品数组
          datajson.goodsArr = goodsArr
        }
        shopArr.push(datajson)
      } else { //如果是大礼包
        //判断是为跨店铺店铺
        for (let p = 0; p < shopData.giftGoodsList.length; p++) {
          datajson = {
            "shopNo": shopData.giftGoodsList[p].shopNo, //店铺编码
            "shopType": _this.data.shopType, //店铺类型
            "price": shopData.giftGoodsList[p].price.toString(), //订单总价
            "deliveryAddress": _this.data.addressData.id, //收货地址
            "deliveryType": _this.data.deliveryType, //包邮方式
            "remark": _this.data.remark, //订单备注
            "originalPrice": shopData.giftGoodsList[p].originalPrice,
            "rate": 0.0
          }
          var giftGoodsArr = [];
          for (let k = 0; k < shopData.giftGoodsList[p].giftGoodsShopList.length; k++) {
            var giftGoodsObj = {};
            giftGoodsObj = {
              "goodsNo": shopData.giftGoodsList[p].giftGoodsShopList[k].goodsNo,
              "num": shopData.giftGoodsList[p].giftGoodsShopList[k].num,
              "price": shopData.giftGoodsList[p].giftGoodsShopList[k].giftPrice.toString(),
              "stockNo": shopData.giftGoodsList[p].giftGoodsShopList[k].stockNo,
              "originalPrice": shopData.giftGoodsList[p].giftGoodsShopList[k].originalPrice,
              "rate": 0.0
            }
            giftGoodsArr.push(giftGoodsObj) //提交订单商品数组
            datajson.goodsArr = giftGoodsArr
          }
          shopArr.push(datajson)
        }
      }
      _this.setData({
        shopArr: shopArr
      }, function() {
        _this.handleOrder()
      })
    } else if (_this.data.activityNo == undefined && _this.data.shopType == '1') { //网店普通商铺下单
      for (let i in shopData) {
        let goosArrs = [];
        let dataPrice = 0;
        datajson = {
          "shopNo": shopData[i].shopNo,
          "deliveryType": _this.data.deliveryType,
          // "price": shopData[i].shopGoodsPrice.toString(),
          "shopType": _this.data.shopType,
          "deliveryAddress": _this.data.addressData.id,
          "fare": shopData[i].deliveryMap.postPrice, //邮费
          "freeShippingType": shopData[i].deliveryMap.freeShippingType, //包邮方式
          "remark": _this.data.remark, //订单备注
          // "voucherId": "" || _this.data.couponData.id //优惠卷
        }
        if (_this.data.vipGrade == '1') {
          datajson.originalPrice = shopData[i].shopGoodsPrice
          datajson.price = shopData[i].shopOriginalAll[0].toString()
          datajson.rate = 0.0
        } else {
          datajson.originalPrice = shopData[i].shopGoodsPrice
          datajson.rate = _this.data.vipRate
          datajson.price = shopData[i].shopsPriceAll[0].toString()
        }
        for (let k in shopData[i].goodsInfoList) {
          let goodsObjs = {};
          goodsObjs = {
            "goodsNo": shopData[i].goodsInfoList[k].goodsNo,
            "stockNo": shopData[i].goodsInfoList[k].stockNo,
            "num": shopData[i].goodsInfoList[k].num
          }
          if (_this.data.vipGrade == '1') {
            goodsObjs.originalPrice = shopData[i].goodsInfoList[k].price
            goodsObjs.rate = 0.0
            goodsObjs.price = shopData[i].goodsInfoList[k].price;
          } else {
            goodsObjs.originalPrice = shopData[i].goodsInfoList[k].price
            goodsObjs.rate = _this.data.vipRate;
            goodsObjs.price = (shopData[i].goodsInfoList[k].price).toFixed(2).toString()
            // dataPrice += shopData[i].goodsInfoList[k].num * (shopData[i].goodsInfoList[k].price - shopData[i].goodsInfoList[k].profit * _this.data.vipRate)
          }
          // datajson.price = dataPrice.toFixed(2).toString()
          goosArrs.push(goodsObjs) //提交订单商品数组
          datajson.goodsArr = goosArrs
        }
        if (_this.data.voucherId) { //如果使用了优惠卷
          datajson.voucherId = shopData[i].voucherId
        }
        shopArr.push(datajson)
      }
      _this.setData({
        shopArr: shopArr
      }, function() {
        _this.handleOrder()
      })
      console.log(shopArr)
    }
  },
  handleOrder() {
    let _this = this;
    let shareUserId = wx.getStorageSync('shareUserId');
    let cartNo = wx.getStorageSync('cartNo') //接龙活动编码
    let params = {
      shopType: _this.data.shopType, //店铺类型
      userId: wx.getStorageSync('userId'),
      shopArr: _this.data.shopArr,
      // sourceType:_this.data.source,
      // price: '0.01',
      // price: _this.data.priceAll + "", //订单总价
      orderType: _this.data.activityType, //商品类型
      activityNo: _this.data.activityNo, //活动编号
      cartNo: wx.getStorageSync('cartNo'), //接龙活动编码
    }
    if (_this.data.source == '2') {
      params.sourceType = 1
    } else {
      params.sourceType = 0
    }
    if (_this.data.activityNo && _this.data.activityType) {
      params.rate = 0.0
      params.originalPrice = _this.data.priceOriginalAll
      params.price = _this.data.priceAll + ""
    } else {
      if (_this.data.vipGrade == '1') {
        params.originalPrice = _this.data.priceOriginalAll
        params.rate = 0.0
        params.price = _this.data.priceOriginalAll + ""
      } else {
        params.rate = _this.data.vipRate
        params.originalPrice = _this.data.priceOriginalAll
        params.price = _this.data.priceAll + ""
      }
    }

    if (_this.data.activityType == 2 && shareUserId) {
      params.shareUserId = shareUserId;
    }
    if (shareUserId && cartNo) {
      params.shareUserId = shareUserId;
    }

    requestUtil.Requests('order/insertOrder', params).then((res) => {
      console.log('订单提交成功啦啦啦啦!!!!!!!!!!!!!!')
      if (res.flag == true) {
        if (_this.data.activityNo && _this.data.activityType) {
          _this.handleActivityPay(res.data.orderNo)
        } else {
          _this.handlePay(res.data.orderNo)
        }
      }
    })
  },
  /**
   * 订单支付
   */
  handlePay(dataNo) {
    let that = this;
    let shopName = that.data.data.shopDataList[0].shopName
    let payPrice = that.data.data.price //会员支付价格
    let priceOriginalAll = that.data.data.price
    let shopType = that.data.shopType;
    let len = that.data.data.shopDataList.length //下单店铺数量
    let img=that.data.data.shopDataList[0].goodsList[0].imgPath;
    console.log("图片========>",img)
    let goodsNo=that.data.goodsArr.goodsNo
    let params = {
      orderNoStr: dataNo,
      userId: wx.getStorageSync('userId'),
      openId: wx.getStorageSync('openId'),
      payType: 3,
      shopType:1,
      price:payPrice
    }
    requestUtil.Requests('order/payOrder', params).then((res) => {
      var obj = JSON.parse(res.data)
      console.log(res)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
          console.log('支付成功啦!!!')
          if(res){
            wx.hideLoading()
          }
          if (that.data.vipGrade == '1') {
            if (len == 1) {
              wx.navigateTo({
                url: "../order-success/order-success?shopName=" + shopName + '&payPrice=' + priceOriginalAll + '&shopType=' + shopType + '&len=' + len + '&shopNo=' + that.data.data.shopDataList[0].shopNo + '&cartNo=' + dataNo+'&img='+img+'&goodsNo='+goodsNo
              })
            } else {
              wx.navigateTo({
                url: "../order-success/order-success?shopName=" + shopName + '&payPrice=' + priceOriginalAll + '&shopType=' + shopType + '&len=' + len + '&cartNo=' + dataNo+'&img='+img + '&shopNo=' + that.data.data.shopDataList[0].shopNo
              })
            }
          } else {
            if (len == 1) {
              wx.navigateTo({
                url: "../order-success/order-success?shopName=" + shopName + '&payPrice=' + payPrice + '&shopType=' + shopType + '&len=' + len + '&shopNo=' + that.data.data.shopDataList[0].shopNo + '&cartNo=' + dataNo+'&img='+img+'&goodsNo='+goodsNo
              })
            } else {
              wx.navigateTo({
                url: "../order-success/order-success?shopName=" + shopName + '&payPrice=' + payPrice + '&shopType=' + shopType + '&len=' + len + '&cartNo=' + dataNo+'&img='+img + '&shopNo=' + that.data.data.shopDataList[0].shopNo
              })
            }

          }

        },
        fail: function() {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
          //if (len === 1) { //如果下单店铺数量为一(同一店铺),则跳转到订单详情
            // wx.redirectTo({
            //   url: '../order-details/order-details?shopNo=' + that.data.data.shopDataList[0].shopNo + '&orderNo=' + dataNo + '&userId=' + wx.getStorageSync('userId'),
            // })
          //} else { //如果下单店铺数量不为一(多店铺下单),则跳转到订单列表
            wx.redirectTo({
              url: '/pages/order/order?status=0'+'&index=2' + '&userId=' + wx.getStorageSync('userId'),
            })
          //}
        }
      })

    })
  },
  /**
   * 活动订单支付
   */
  handleActivityPay(dataNo) {
    //
    let v = this;
    let orderNo = dataNo; //订单编号
    let shopName = v.data.data.shopName
    let payPrice = v.data.priceAll
    let activityNo = v.data.activityNo
    let activityType = v.data.activityType
    let shopNo = v.data.data.shopNo
    let type=v.data.shopType
    // wx.navigateTo({
    //   url: '../order-success/order-success?shopName=' + shopName + '&payPrice=' + payPrice + '&activityNo=' + activityNo + '&activityType=' + activityType + '&cartNo=' + orderNo + '&shopType=' + v.data.shopType + '&shopNo=' + shopNo,
    // })
    let img=v.data.data.goodsInfoList[0].imgPath;
    console.log("图片========>",img)
    let params = {
      orderNo: orderNo,
      userId: wx.getStorageSync('userId'),
      userType: v.data.userType, //参与活动的身份
      payType: '4',
      payStrategy: v.data.activityType,
      openId: wx.getStorageSync('openId')
    }

    requestUtil.Requests('order/joinActivityPay', params).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
          console.log('支付成功啦!!!')
          if (v.data.userType == '2' && v.data.activityType == '1') {
            wx.redirectTo({
              url: '../activityzl/activityzl?activityNo=' + activityNo + '&cartNo=' + orderNo,
            })
          } else {
            wx.redirectTo({
              url: '../order-success/order-success?shopName=' + shopName + '&payPrice=' + payPrice + '&activityNo=' + activityNo + '&activityType=' + activityType + '&cartNo=' + orderNo + '&shopType=' + v.data.shopType + '&shopNo=' + shopNo + '&len=1'+'&img='+img+'&type='+type,
            })
          }
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
  /**选择可用优惠卷 */
  handleCoupon(e) {

    let _this = this;
    _this.setData({

    })
    let price = 0;
    let sumPrice = 0; //合计总价
     let voucherId=_this.data.voucherId
    if (_this.data.vipGrade == '1') {
      price = e.currentTarget.dataset.price; //店铺价格
      sumPrice = _this.data.data.price
    } else {
      price = e.currentTarget.dataset.price; //店铺价格
      sumPrice = _this.data.data.price
    }
    let shopNo = e.currentTarget.dataset.shopno; //商品编码
    wx.navigateTo({
      url: '../use-coupon/use-coupon?price=' + price + '&shopNo=' + shopNo + '&sumPrice=' + sumPrice+'&voucherId='+voucherId,
    })
  },
  /*订单填写备注*/
  handlebindinput(e) {
    this.setData({
      remark: e.detail.value
    })
  }


})
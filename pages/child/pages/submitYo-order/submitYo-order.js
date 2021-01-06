// pages/child/pages/submit-order/submit-order.js
var requestUtil = require('../../../../utils/requestUtil.js')
var util=require('../../../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModalStatus:false,
    flag: 0,
    currentTab: 0,
    activity: false, //判断是否是活动
    activityType: 0,
    voucherId:null, //优惠卷,
    voucherPrice:0,//优惠券金额
    deliveryType: '0', //0：送货 1：自提 2:送货加自提
    deliveryTypes:'0',//获取数据时,时配送的数据还是自提的数据,0为配送,1为自提
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
    isshowdeliveryType: 0,
    presetTime: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this;
    //查询用户是否设有默认地址
    _this.getDefaultAddress(1)
    
    if (options.source && options.type == 2) {
      let array = JSON.parse(options.shopObj)
      _this.setData({
        source: options.source, //下单来源
        shopObj: array,
        shopType: options.type,
        vipRate: wx.getStorageSync('vipRate'),
        vipGrade: wx.getStorageSync('vipGrade')
      })
      //获取普通优店下单页面
      _this.getBuyYoGoodsOrder()
    } else if (options.activityNo) { //活动商品下单
      _this.setData({
        shopType: options.type, //店铺类型
        activityNo: options.activityNo, //活动编码
        activityType: options.activityType, //活动类型
        stockNo: options.stockNo, //库存编码
        price: options.price, //活动价
        userType: options.userIdType ? options.userIdType : '1'

      })
      //获取活动商品的下单页面
      _this.getBuyActivity();
    }else if(options.selectedArr){
      let selectedArr=JSON.parse(options.selectedArr);
      _this.setData({
        selectedArr:selectedArr,
        shopNo:options.shopNo
      })
    }
  },
  //获取页面数据-君
  getshuju(flag){
    let that=this;
    let addressId=that.data.addressData.id;//地址id
    let shopjson=[];
    let goodslist={
      shopNo:that.data.shopNo,
      goodsList:that.data.selectedArr
    };
    shopjson.push(goodslist)
    let params={
      userId:wx.getStorageSync('userId'),
      addressId:addressId,
      deliveryType:that.data.deliveryTypes,//获取数据时,时配送的数据还是自提的数据,0为配送,1为自提
      shopList:shopjson
    }
    console.log("上传数据",JSON.stringify(params))
    requestUtil.Requests('product/yoGoods/querySubmitData',params).then((res)=>{
      console.log("获取的页面数据",res)
      if(res.data.shopDataList[0].deliveryType==1){
        that.setData({
          isdeliveryTypes:1
        })
      }
      let data=res.data;
      data.shopDataList.forEach(item=>{
        item.voucherId=that.data.voucherId;//优惠券id
        item.voucherPrice=that.data.voucherPrice;//优惠券金额
      })
      that.setData({
        data:res.data,
        isdeliveryType:res.data.shopDataList[0].deliveryType,// 配送方式 0-商家配送,1-到店自取,2-配送+自取
        postage:res.data.shopDataList[0].postage, //配送费
        closeTime:res.data.shopDataList[0].closeTime,//关店时间
        openTime:res.data.shopDataList[0].openTime,//开店时间
      })
      if(flag){
        let aa = res.data.shopDataList[0].deliveryType
        if(aa==1){
          aa='到店自提'
        }else{
          aa='商家配送'
        }
        this.setData({
          currentSelectTripType:aa
        })
      }
    })
  },
  //提交订单v2.4.4版本-君-配送
  setdingdan(){
    let that=this;
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    let addressId=that.data.addressData.id;
    if(!addressId){
      wx.showToast({
        title: '请填写正确的地址',
        icon: 'none',
      })
      return
    }
    let shoplist=that.data.data.shopDataList[0];
    let shop=[];
    let goodslist={
      shopNo:shoplist.shopNo,
      voucherId:shoplist.voucherId,
      voucherPrice:shoplist.voucherPrice,
      shopPrice:shoplist.price,
      shopCount:shoplist.totalNum,
      goodsList:shoplist.goodsList
    }
    shop.push(goodslist)
    let params={
      token:that.data.data.token,
      userId:wx.getStorageSync('userId'),
      count:shoplist.totalNum,
      price:shoplist.price,
      addressId:addressId,
      deliveryType:0,
      shopList:shop
    };
    console.log(JSON.stringify(params))
    requestUtil.Requests('product/yoGoods/submitOrder',params).then((res)=>{
      console.log(res)
      if(res.flag){
        that.handlePay(res.data.orderNo)
      }
    })
  },
  //提交订单v2.4.4版本-君-自提
  setdingdanzi(){
    let that=this;
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    if (that.data.phone == '' || that.data.phone == undefined || !(/^1\d{10}$/.test(that.data.phone))) {
      wx.showToast({
        title: '请填写正确的电话',
        icon: 'none',
      })
      return
    }
    if(that.data.flag==0){
      var xtiem=that.data.jtiem;
    }else if(that.data.flag==1){
      var xtiem=that.data.mtiem;
    }else if(that.data.flag==3){
      var xtiem=that.data.htiem;
    }
    let tiemxz=that.data.tiemxz;
    let presetTime=xtiem+'-'+tiemxz;
    console.log("选择好的时间=========>",presetTime)
    if(!tiemxz){
      wx.showToast({
        title: '请选择自提时间',
        icon: 'none',
      })
      return
    }
    let shoplist=that.data.data.shopDataList[0];
    let shop=[];
    let goodslist={
      shopNo:shoplist.shopNo,
      voucherId:that.data.voucherId,
      voucherPrice:that.data.voucherPrice,
      shopPrice:shoplist.price,
      shopCount:shoplist.totalNum,
      goodsList:shoplist.goodsList
    }
    shop.push(goodslist)
    let params={
      token:that.data.data.token,
      userId:wx.getStorageSync('userId'),
      count:shoplist.totalNum,
      price:shoplist.price,
      deliveryType:1,
      telephone:that.data.phone,
      pickUpTime:presetTime,
      shopList:shop
    };
    requestUtil.Requests('product/yoGoods/submitOrder',params).then((res)=>{
      console.log(res)
      if(res.flag){
        that.handlePay(res.data.orderNo)
      }
    })
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
          wx.showToast({
            title: '以选择优惠券,如需更换,请重新下单',
            icon: 'none',
            duration:3000
          })
          iscoupon=false;
        } 
      }else if(item.voucherId==that.data.voucherId){
        wx.showToast({
          title: '该优惠券已被选用,请选择其他优惠券',
          icon: 'none',
          duration:3000
        })
        iscoupon=false;
      }
    })
    if (iscoupon) {
      data.price=data.price-that.data.voucherPrice
      data.shopDataList.forEach(item=>{
          item.voucherId=that.data.voucherId;
          item.voucherPrice=that.data.voucherPrice;
          item.price=item.price-that.data.voucherPrice;
      })
    }
    console.log(data)
    that.setData({
      data:data
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 切换 优店配送方式
   */
  selectedType(e) {
    let type = this.data.data.shopDataList[0].deliveryType; // 0商家配送  1自提  2配送+自提

    if(e.currentTarget.dataset.type == this.data.isdeliveryType){
      return
    }else{
      if (e.currentTarget.dataset.type == 1) {
        if(type==1||type==2){
          this.setData({
            currentSelectTripType: e.currentTarget.dataset.name,
            deliveryType: e.currentTarget.dataset.type,
            isshowdeliveryType: 1,
            deliveryTypes:1
          })
          this.getshuju()
        }else{
          wx.showToast({
            title: '商家暂未开通自提',
            icon:'none'
          })
        }
      } else {
        if(type==0||type==2){
          this.setData({
            currentSelectTripType: e.currentTarget.dataset.name,
            deliveryType: e.currentTarget.dataset.type,
            isshowdeliveryType: 0,
            deliveryTypes:0
          })
          this.getshuju()
        }else{
          wx.showToast({
            title: '商家暂未开通配送',
            icon:'none'
          })
        }
      }
    }
  },
  getBuyYoGoodsOrder() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      shopObj: _this.data.shopObj,
      source: _this.data.source, //提交订单入口
    }
    requestUtil.Requests('order/buyYoGoodsOrderPage', params).then((res) => {
      let data = res.data;
      console.log("======>",data)
      let deliveryMap = [];
      let shopsPriceAll = 0
      let priceAll = 0;
      let priceOriginalAll = 0;
      let numAll = 0;
      let goodsInfoList = data.goodsInfoList
      let shopGoodsPrice = 0; //店铺商品价格
      let timeArr = []; //自提时间集合
      numAll += data.shopGoodsNum;
      let openTime = data.openTime; //开店时间
      let closeTime = data.closeTime; //关店时间
      // let openh = Number(openTime.substr(0, 2));
      // let openm = Number(openTime.substr(3, 2));
      // let closeh = Number(closeTime.substr(0, 2))
      // let isOpen = openm <= 0 ? true : false;
      // let stri = null;
      // for (let i = openh; i <= closeh; i++) {
      //   //
      //   if (i == openh) {
      //     timeArr.push(openTime)
      //   } else if (i == closeh) {
      //     timeArr.push(closeTime)
      //   } else {
      //     if (isOpen) {
      //       if (i < 10) {
      //         stri = "0" + i;
      //       } else {
      //         stri = i + ""
      //       }
      //       if (i % 2 == 0) {
      //         timeArr.push(stri + ":00")
      //         timeArr.push(stri + ":30")
      //       } else {
      //         timeArr.push(stri + ":00")
      //         timeArr.push(stri + ":30")
      //       }
      //     } else {
      //       if (i < 10) {
      //         stri = "0" + i;
      //       } else {
      //         stri = i + ""
      //       }
      //       if (i % 2 == 0) {
      //         timeArr.push(stri + ":00")
      //         timeArr.push(stri + ":30")
      //       } else {
      //         timeArr.push(stri + ":00")
      //         timeArr.push(stri + ":30")
      //       }
      //     }
      //   }
      // }
      // console.log(timeArr + '----------------数组-----------------------------')
      // 需要过滤掉当前系统时间已过自取时间段,判断店铺的营业时间，选择自提时间时，需要过滤掉不在营业时间范围内时间
      // let nowTime = new Date();
      // let hour = nowTime.getHours();//得到当前小时数
      // let length = timeArr.length;
      // for (let t = length; t <= timeArr.length; t--) {
      //   let splice_hour = Number(timeArr[0].substr(0, 2));
      //   if (splice_hour <= hour) {
      //     timeArr.splice(0,1)
      //   }else{
      //     return false;
      //   }
      // }
      let fare = 0;
      let deliveryPrice = 0;
      
      // 判断下单商品的
      var goodsPriceAll = 0;
      var goodsOriginalPriceAll = 0;
      if (_this.data.vipGrade == '1') {
        goodsInfoList.forEach(el => {
          goodsPriceAll += el.num * el.price
          goodsOriginalPriceAll += el.num * el.price
        })
      } else {
        goodsInfoList.forEach(el => {
          goodsPriceAll += el.num * (el.price - el.profit * _this.data.vipRate);
          goodsOriginalPriceAll += el.num * el.price
        })
      }
      data.goodsPriceAll = goodsPriceAll;
      data.goodsOriginalPriceAll = goodsOriginalPriceAll;
      //判断是否满足免配送费
      if (data.deliveryMap.freeShippingPrice <= goodsPriceAll) {
        data.deliveryMap.deliveryPrice = 0;
      }
      if (_this.data.vipGrade == '1') {
        shopsPriceAll = (parseInt((Number(data.fare) + Number(data.deliveryMap.deliveryPrice) + Number(goodsOriginalPriceAll)) * 100) / 100).toFixed(2);
        priceAll = (parseInt((Number(data.fare) + Number(data.deliveryMap.deliveryPrice) + Number(goodsOriginalPriceAll)) * 100) / 100).toFixed(2);
      } else {
        shopsPriceAll = (parseInt((Number(data.fare) + Number(data.deliveryMap.deliveryPrice) + Number(goodsPriceAll)) * 100) / 100).toFixed(2);
        priceAll = (parseInt((Number(data.fare) + Number(data.deliveryMap.deliveryPrice) + Number(goodsPriceAll)) * 100) / 100).toFixed(2);
      }
      if (data.deliveryMap.deliveryType == 2) {
        this.data.isshowdeliveryType = 0;
      }
      // priceOriginalAll = data.fare + data.deliveryMap.deliveryPrice + goodsOriginalPriceAll
      priceOriginalAll = goodsOriginalPriceAll
      _this.setData({
        data: res.data, //店铺信息
        priceAll: Math.round(priceAll * 100) / 100,
        shopsPriceAll: Math.round(shopsPriceAll * 100) / 100,
        oldPriceAll: JSON.parse(JSON.stringify(Math.round((priceAll * 100)) / 100)),
        oldShopsPriceAll: JSON.parse(JSON.stringify(Math.round((shopsPriceAll * 100)) / 100)),
        numAll: numAll,
        // deliveryType: data.deliveryMap.deliveryType,
        deliveryText: data.deliveryMap.deliveryText,
        shopAddr: data.shopAddr,
        packFee: data.fare, //包装费
        deliveryPrice: data.deliveryMap.deliveryPrice, //配送费
        freeShippingPrice: data.deliveryMap.freeShippingPrice, //判断是否免配送费
        distPrice: data.deliveryMap.distPrice, //起送价
        shopPrice: goodsPriceAll,
        isdeliveryType: data.deliveryMap.deliveryType,
        // showdeliveryType: data.deliveryMap.deliveryType,
        goodsOriginalPriceAll: goodsOriginalPriceAll,
        priceOriginalAll: Math.round(priceOriginalAll * 100) / 100,
        isshowdeliveryType: _this.data.isshowdeliveryType,
        openTime:openTime,
        closeTime:closeTime
      })
      //判断优店配送方式
      if (data.deliveryMap.deliveryType == '0' || data.deliveryMap.deliveryType == '2') { //商家配送
        if (data.deliveryMap.deliveryMode === '2') { //达达配送
          //查询配送价格
          _this.queryDeliveryPriceByAddress()
        }
      } else if (data.deliveryMap.deliveryType === 1) { //到店自提

      }
    })
  },
  /*时间段区间**/
  bindPickerChange: function(e) {
    
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      // presetTime: this.data.timeArr[Number(e.detail.value)]
      // pickUpTime: this.data.timeArr[e.detail.value]
    })
    // console.log(this.data.presetTime)
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
      that.setData({
        data: res.data, //店铺信息
        numAll: res.data.goodsInfoList[0].num,
        priceAll: res.data.goodsInfoList[0].price,

      })
    })
  },
  /**
   * 获取默认地址
   * */
  getDefaultAddress(flag) {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    //判断是否有默认地址
    requestUtil.Requests('user/queryDefaultAddress', params).then((res) => {
      console.log("地址",res)
        _this.setData({
          addressData: res.data,
        })
        //获取数据需要先获取地址
        _this.getshuju(flag)
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
  /**
   * 获取预留电话
   */
  bindKeyInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  /*订单填写备注*/
  handlebindinput(e) {
    this.setData({
      remark: e.detail.value
    })
  },
  /**
   * 提交订单
   */
  submitOrder() {
    let _this = this;
    //判断商品是否需要配送
    if (_this.data.deliveryTypes == '0') {
      if (_this.data.data.shopDataList[0].price >= _this.data.data.shopDataList[0].distPrice) { //商品下单价格大于起送价,可以下单
        //_this.submitYoOrder();
        _this.setdingdan()
      } else {
        wx.showToast({
          title: '您还未达到起送价格,快去添加商品吧~',
          icon: 'none'
        })
      }
    } else {
      _this.setdingdanzi()
    }
  },
  submitYoOrder() {
    let _this = this;
    let datajson = {};
    let goodsArr = [];
    let goodsObj = {};
    let shopArr = [];
    let i = Number(_this.data.index)
    let shopData = _this.data.data;
    // if (shopData.deliveryMap == null) {
    //   datajson = {
    //     "shopNo": shopData.shopNo, //店铺编码
    //     "shopType": _this.data.shopType, //店铺类型
    //     "price": shopData.goodsInfoList[0].price.toString(), //订单总价
    //     "deliveryAddress": _this.data.addressData.id, //收货地址
    //     "deliveryType": _this.data.deliveryType, //包邮方式
    //     "remark": _this.data.remark, //订单备注

    //   }
    //   for (let v in shopData.goodsInfoList) {
    //     goodsObj = {
    //       "goodsNo": shopData.goodsInfoList[v].goodsNo,
    //       "stockNo": shopData.goodsInfoList[v].stockNo,
    //       "num": shopData.goodsInfoList[v].num,
    //       "price": shopData.goodsInfoList[v].price.toString()
    //     }
    //     goodsArr.push(goodsObj) //提交订单商品数组
    //     datajson.goodsArr = goodsArr
    //   }
    //   shopArr.push(datajson)
    //   _this.setData({
    //     shopArr: shopArr
    //   }, function() {
    //     _this.handleOrder()
    //   })


    // } else if (shopData.deliveryMap != null && _this.data.shopType == '2') { //优店普通商铺下单
    datajson = {
      "shopNo": shopData.shopNo, //店铺编码
      "shopType": _this.data.shopType, //店铺类型
      // "price": shopData.shopGoodsPrice.toString(), //订单总价
      "price": _this.data.priceAll,
      // "deliveryAddress": _this.data.addressData.id, //收货地址
      "deliveryType": _this.data.deliveryType, //配送方式
      "remark": _this.data.remark, //订单备注
      "fare": _this.data.deliveryPrice.toString(), //配送费
      "packFee": _this.data.packFee.toString() //包装费
      // "pickUpTime": 1, //自提时间
      // "telephone": "18071129453", //自提电话
      // "voucherId": _this.data.voucherId //优惠卷
    }
    if (_this.data.deliveryType === '0'){
      if (!_this.data.addressData){
        wx.showToast({
          title: '请选择收货地址~',
          icon: 'none',
          duration: 2000
        })
        return;
      }else{
        datajson.deliveryAddress = _this.data.addressData.id
      }
    }else{
      datajson.deliveryAddress = -1;
    }
    if (_this.data.vipGrade == '1') {
      datajson.originalPrice = shopData.shopGoodsPrice
      datajson.rate = 0.0
    } else {
      datajson.originalPrice = _this.data.goodsOriginalPriceAll
      datajson.rate = _this.data.vipRate
    }
    if (_this.data.voucherId) { //如果使用了优惠卷
      datajson.voucherId = _this.data.voucherId
    }
    if (_this.data.tiemxz) {
      if(_this.data.flag==0){
        var xtiem=_this.data.jtiem;
      }else if(_this.data.flag==1){
        var xtiem=_this.data.mtiem;
      }else if(_this.data.flag==3){
        var xtiem=_this.data.htiem;
      }
      let tiemxz=_this.data.tiemxz;
      let presetTime=xtiem+''+tiemxz;
      datajson.pickUpTime = presetTime; //自提时间
      if (_this.data.phone == '' || _this.data.phone == undefined || !(/^1\d{10}$/.test(_this.data.phone))) {
        wx.showToast({
          title: '请填写正确的电话',
          icon: 'none',
        })
        return
      } else {
        datajson.telephone = _this.data.phone;
      }
    }
    for (let v in shopData.goodsInfoList) {
      goodsObj = {
        "goodsNo": shopData.goodsInfoList[v].goodsNo,
        "stockNo": shopData.goodsInfoList[v].stockNo,
        "num": shopData.goodsInfoList[v].num,
        // "price": shopData.goodsInfoList[v].price.toString()
      }
      var originalPrice = shopData.goodsInfoList[v].num * shopData.goodsInfoList[v].price
      if (_this.data.vipGrade == '1') {
        goodsObj.price = shopData.goodsInfoList[v].price.toString()
        goodsObj.originalPrice = shopData.goodsInfoList[v].price
        goodsObj.rate = 0.0
      } else {
        goodsObj.price = (shopData.goodsInfoList[v].price - shopData.goodsInfoList[v].profit * _this.data.vipRate).toFixed(2).toString()
        goodsObj.originalPrice = shopData.goodsInfoList[v].price
        goodsObj.rate = _this.data.vipRate
      }
      goodsArr.push(goodsObj) //提交订单商品数组
      datajson.goodsArr = goodsArr
    }
    shopArr.push(datajson)
    _this.setData({
      shopArr: shopArr,
      originalPrice: originalPrice
    }, function() {
      _this.handleOrder()
    })
    // }

  },
  handleOrder() {
    wx.showLoading({
      title: '订单提交中...',
      mask: true
    });
    let _this = this;
    let shareUserId = wx.getStorageSync('shareUserId');
    let cartNo = wx.getStorageSync('cartNo') //接龙活动编码
    if(_this.data.flag==0){
      var xtiem=_this.data.jtiem;
    }else if(_this.data.flag==1){
      var xtiem=_this.data.mtiem;
    }else if(_this.data.flag==3){
      var xtiem=_this.data.htiem;
    }
    let tiemxz=_this.data.tiemxz;
    let presetTime=xtiem+''+tiemxz;
    console.log("选择好的时间=========>",presetTime)
    let params = {
      userId: wx.getStorageSync('userId'),
      shopArr: _this.data.shopArr,
      // price: '0.01',
      price: _this.data.priceAll + "", //订单总价
      orderType: _this.data.activityType, //商品类型
      activityNo: _this.data.activityNo, //活动编号
      cartNo: wx.getStorageSync('cartNo'), //接龙活动编码
      shopType: _this.data.shopType, //店铺类型
      deliveryType: _this.data.deliveryType, //店铺配送方式 0-店铺配送,1-自提
      presetTime: presetTime
    }
    if (_this.data.vipGrade == 1) {
      params.originalPrice = _this.data.priceAll
      params.rate = 0.0
    } else {
      params.originalPrice = _this.data.priceOriginalAll;
      params.rate = _this.data.vipRate
    }
    if (shareUserId && cartNo) {
      params.shareUserId = shareUserId;
    }
    console.log(params)
    requestUtil.Requests('order/insertOrder', params).then((res) => {
      if (res.flag == true) {
        console.log('订单提交成功啦啦啦啦!!!!!!!!!!!!!!',res)
        wx.hideLoading();
        if (_this.data.activityNo && _this.data.activityType) {
          _this.handleActivityPay(res.data.orderNo)
        } else {
          _this.handlePay(res.data.orderNo)
        }
      } else {
        wx.showToast({
          title: '订单提交失败!',
          icon: 'none',
          duration: 1500
        })
      }

    })

  },
  /**
   * 订单支付
   */
  handlePay(dataNo) {
    let that = this;
    let shopName = that.data.data.shopDataList[0].shopName
    let payPrice = that.data.data.shopDataList[0].price
    let shopNo = that.data.data.shopDataList[0].shopNo
    let params = {
      orderNoStr: dataNo,
      userId: wx.getStorageSync('userId'),
      openId: wx.getStorageSync('openId'),
      payType: 3,
      shopType:2,
      price:payPrice
    }
    console.log (params)
    requestUtil.Requests('order/payOrder', params).then((res) => {
      var obj = JSON.parse(res.data)
      wx.requestPayment({
        timeStamp: obj.timeStamp,
        nonceStr: obj.nonceStr,
        package: obj.package,
        signType: obj.signType,
        paySign: obj.sign,
        success: function(res) {
          console.log('支付成功啦!!!')
          wx.navigateTo({
            url: "../order-success/order-success?shopName=" + shopName + '&payPrice=' + payPrice + '&shopNo=' + shopNo + '&shopType=2' + '&len=1' + '&cartNo=' + dataNo
          })
          wx.hideLoading()
        },
        fail: function() {
          wx.showToast({
            title: '支付失败!',
            icon: 'none'
          })
          wx.redirectTo({
            url: '/pages/order/order?status=-2'+'&index=1' + '&userId=' + wx.getStorageSync('userId'),
          })
        }
      })

    })
  },
  /**选择可用优惠卷 */
  handleCoupon(e) {
    let _this = this;
    let sumPrice = e.currentTarget.dataset.price;
    let price = e.currentTarget.dataset.price; //店铺价格
    let shopNo = e.currentTarget.dataset.shopno; //商品编码
    wx.navigateTo({
      url: '../use-coupon/use-coupon?price=' + price + '&shopNo=' + shopNo + '&sumPrice=' + sumPrice,
    })
  },

  /**查询达达配送费 */
  queryDeliveryPriceByAddress() {
    let _this = this;
    let params = {
      addressId: _this.data.addressData.id,
      userId: wx.getStorageSync('userId'),
      shopNo: _this.data.data.shopNo,
      shopPrice: _this.data.shopPrice.toString(),
      cityCode: _this.data.data.cityCode
    }
    requestUtil.Requests('user/queryDeliveryPriceByAddress', params).then((res) => {
      let dd=res.data 
      let priceAll=(dd*1 + _this.data.priceAll).toFixed(2)
      let shopsPriceAll=(dd*1 + _this.data.shopsPriceAll).toFixed(2)
      let priceOriginalAll=(dd*1 + _this.data.priceOriginalAll).toFixed(2)
      _this.setData({
        deliveryPrice: Number(res.data),
        priceAll: priceAll,
        shopsPriceAll: shopsPriceAll,
        priceOriginalAll: priceOriginalAll
      })
    })
  },
  //点击我显示底部弹出框
  clickme: function () {
    this.showModal();
  },

  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
    this.jstiem()
    this.jstiem1()
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  switchNav: function(e) {
    var page = this;
    var id = e.target.id;
    if (this.data.currentTab == id) {
      return false;
    } else {
      page.setData({
        currentTab: id
      });
    }
    page.setData({
      flag: id
    });
  },
  catchTouchMove: function (res) {
    return false
  },
  //选择时间
  xuanzetiem(e){
    let that=this;
    let id=e.currentTarget.dataset.id;
    var tiem=e.currentTarget.dataset.tiem;
    let list=that.data.tiemlist;
    let list1=that.data.tiemlist1;
    let flag=that.data.flag;
    if(flag==0){
      list.forEach((item)=>{
        if(item.id==id){
          item.ps=true
        }else{
          item.ps=false
        }
      })
      list1.forEach((item)=>{
       item.ps=false
      })
      that.setData({
        tiemlist:list,
        tiemlist1:list1,
        tiemxz:tiem
      })
    }else{
      list.forEach((item)=>{
        item.ps=false
      })
      list1.forEach((item)=>{
       if(item.id==id){
        item.ps=true
      }else{
        item.ps=false
      }
      })
      that.setData({
        tiemlist:list,
        tiemlist1:list1,
        tiemxz:tiem
      })
    }
  },
  //确认时间选择
  yestiem(){
    let that=this;
    that.hideModal()
  },
  //计算可选时间
  jstiem(){
    let that=this;
    let stiem=that.data.closeTime;//关店时间
    var s1=stiem.substring(0,2)
    var s11=s1-2;
    var atime = util.formatTime(new Date());
    var y=atime.substring(0,4)
    var m=atime.substring(5,7)
    var d=atime.substring(8,11)
    var jtiem=y+'-'+m+'-'+d
    var mtiem=that.getDateStr(null,1)
    var htiem=that.getDateStr(null,2)
    let ktime=atime.substring(11,16)
    console.log(ktime)
    let k1=ktime.substring(0,2)
    let k2=ktime.substring(3,5)
    var tiemlist=[];
    var id=0;
    if(k2<15){
      id=1;
      var a={
        id:id,
        ps:false,
        tiem:k1+":30"
      };
      tiemlist.push(a)
      var k11=k1*1+1
    }else if(k2>45){
      id=1;
      var k111=k1*1+1
      var a={
        id:id,
        ps:false,
        tiem:k111+":30"
      };
      tiemlist.push(a)
      var k11=k1*1+2
    }else{
      var k11=k1*1+1
    }
    for(var i=k11;s11>i;i++){
      id+=1
      var j={
        id:id,
        ps:false,
        tiem:i+":00"
      };
      id+=1;
      var j1={
        id:id,
        ps:false,
        tiem:i+":30"
      }
      tiemlist.push(j)
      tiemlist.push(j1)
    }
    console.log("今天的可选时间段!!!!!!!!!!!!!",tiemlist)
    that.setData({
      tiemlist:tiemlist,
      jtiem:jtiem,
      mtiem:mtiem,
      htiem:htiem
    })
  },
  //计算明后两天可选时间
  jstiem1(){
    let that=this;
    let stiem=that.data.closeTime;//关店时间
    var s1=stiem.substring(0,2)
    var s11=s1-2;
    let ktime=that.data.openTime;//开店时间
    let k1=ktime.substring(0,2)
    let k2=ktime.substring(3,5)
    var tiemlist=[];
    var id=0;
    if(k2>15){
      var k11=k1*1+1
    }else{
      var k11=k1
    }
    for(var i=k11;s11>i;i++){
      id+=1
      var j={
        id:id,
        ps:false,
        tiem:i+":00"
      };
      id+=1;
      var j1={
        id:id,
        ps:false,
        tiem:i+":30"
      }
      tiemlist.push(j)
      tiemlist.push(j1)
    }
    console.log("明天可选时间!!!!!!",tiemlist)
    that.setData({
      tiemlist1:tiemlist
    })
  },
  //计算明后两天的日期
  getDateStr: function(today, addDayCount) {
    var date;
    if(today) {
      date = new Date(today);
    }else{
      date = new Date();
    }
    date.setDate(date.getDate() + addDayCount);//获取AddDayCount天后的日期 
      var y = date.getFullYear();
      var m = date.getMonth() + 1;//获取当前月份的日期 
      var d = date.getDate();
      if(m < 10){
        m = '0' + m;
      };
      if(d < 10) {
        d = '0' + d;
      };
      console.log( y + "-" + m + "-" + d)
      return y + "-" + m + "-" + d;
    },
})
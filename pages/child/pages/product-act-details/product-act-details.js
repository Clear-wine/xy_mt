var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    circular: true,
    selected: false,
    activityTypeName: '',
    /* 用于区别当前的规格是否选中 */
    isSelect: false,
    num: 1, //初始数量
    //数据结构：以一组一组的数据来进行设定 
    attrValueList: [],
    stockList: [],
    specList: [],
    page: 1,
    pageSize: 3,
    gradelist: [],
    page: 1,
    pageSize: 3,
    gradelist: [],
    actPrice: 0,
    showDialog: true, //分享按钮是否显示
    isshare: 1, //isshare = 0, 表示不是从分享进入, isshare = 1 表示是从分享进入
    joinStatus: '1', //参加接龙成功 1 参加接龙失败 2
    activityTitle:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let that = this;
    //根据wx缓存判断是否为发起人
    // let userIdType = wx.getStorageSync('activityUser')
    // if (userIdType === undefined) {
    //   userIdType = ""
    // }
    //根据带路由带参数判断是否为发起人
    var userIdType = '';
    if (options.activityUser == undefined || options.activityUser === 'true') { //发起者
      userIdType = '1'
    } else { //参与者
      userIdType = '2'
      that.setData({
        cartNo: options.cartNo
      })
    }
    that.setData({
      type: options.type,
      activityType: options.activityType,
      activityNo: options.activityNo,
      goodsNo: options.goodsNo,
      userIdType: userIdType
    })
     if(wx.getStorageSync('userId')){
        //获取活动商品详情信息
      if (options.activityType == '3') { //代言购商品详情
        that.getGoodsDetail()
      } else {
        that.getActivityDetail()
      }
      //获取产品评价
      that.getCommodityGrade()
      //获取商品详情图片
      // that.getGoodsDetailImgPage()
      //判断活动类型
      that.queryactivityType()
    }
    
  },
  onShow() {
    this.setData({
      showDialog: this.data.showDialog,
      windowWidth: wx.getStorageSync('windowWidth')
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 获得dialog组件
    this.dialog = this.selectComponent("#dialog");
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
    let that=this;
    //获取活动商品详情信息
    if (that.data.activityType == '3') { //代言购商品详情
      that.getGoodsDetail()
    } else {
      that.getActivityDetail()
    }
    //获取产品评价
    that.getCommodityGrade()
    //获取商品详情图片
    // that.getGoodsDetailImgPage()
    //判断活动类型
    that.queryactivityType()
  },
  previewImg(e) {
    const imgArr = [];
    this.data.imglist.forEach((el) => {
      imgArr.push(el.imgPath);
    })
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接 
      urls: imgArr // 需要预览的图片http链接列表 
    })
  },
  handleShowImg(){
    let current = this.data.includeGroup[0].makeBeanList[0].specImg;
    wx.previewImage({
      current: current, // 当前显示图片的http链接 
      urls: [current] // 需要预览的图片http链接列表 
    })
  },
  queryactivityType() {
    let _this = this;
    let acturl = '';
    if (_this.data.activityType == 1) {
      acturl = '../images/qinyouzhuligo.png';
    } else if (this.data.activityType == 2) {
      acturl = '../images/chaozhidalibao.png';
    } else if (this.data.activityType == 3) {
      acturl = '../images/daiyanfanyonggo.png';

    } else if (this.data.activityType == 4) {
      acturl = '../images/quweijielonggo.png';

    } else if (this.data.activityType == 5) {
      acturl = '../images/xianshipintuango.png';

    }
    _this.setData({
      acturl: acturl
    })
  },
  /**代言活动商品详情*/
  getGoodsDetail() {
    let _this = this;
    let params = {
      type: _this.data.type,
      userId: wx.getStorageSync('userId'),
      goodsNo: _this.data.goodsNo,
      sourceType: 'wx'
    }
    requestUtil.Requests('product/queryGoodsDetail', params).then((res) => {
      let data = res.data;
      console.log("商品详情!!!!",res)
      let num;
      let selName = '';
      let activityDetailBean = data.shopGoodsDetail
      let goodsBean = activityDetailBean;
      let specList = goodsBean.specList //所有规格
      let stockList = goodsBean.stockList //所有的规格组合
      let footPrintGoodsList = data.footPrintGoodsList; //猜你喜欢
      //判断活动状态
      switch (activityDetailBean.status) {
        case 0:
          activityDetailBean.status = '活动未开始';
          break;
        case 1:
          activityDetailBean.status = '火热进行中';
          break;
        case 2:
          activityDetailBean.status = '活动已结束';
      }
      for (var i = 0; i < specList.length; i++) {
        selName += specList[i].specName + ' '
        for (var j = 0; j < specList[i].specAttrList.length; j++) {
          if (specList[i].attrValueStatus) {
            specList[i].attrValueStatus[j] = true;
          } else {
            specList[i].attrValueStatus = [];
            specList[i].attrValueStatus[j] = true;
          }
        }
      }
      if (_this.data.activityType != '2') {
        _this.setData({
          selectPrice: stockList[0].price
        })
      }
      _this.setData({
        activityDetailBean: activityDetailBean,
        goodsBean: goodsBean,
        imglist: activityDetailBean.imgList,
        footPrintGoodsList: footPrintGoodsList,
        one_1: num,
        tow_1: parseInt(5 - num),
        stockList: stockList,
        specList: specList,
        selName: selName,
        actPrice: activityDetailBean.price,
      })

    })
  },
  /**助力/礼包/接龙/拼团 */
  getActivityDetail() {
    let _this = this;
    let params = {
      activityNo: _this.data.activityNo,
      userId: wx.getStorageSync('userId'),
      type: _this.data.type,
      sourceType: 'wx',
      activityType: _this.data.activityType
    }
    requestUtil.Requests('product/queryActivityDetail', params).then((res) => {
      let data = res.data;
      console.log(res)
      let actmoney = 0
      let activityDetailBean = data.activityDetailBean
      let selName = '';
      let specList = activityDetailBean.goodsBean.specList; //所有规格
      let stockList = activityDetailBean.goodsBean.stockList; //所以规格组合

      for (var i = 0; i < specList.length; i++) {
        selName += specList[i].specName + ' '
        for (var j = 0; j < specList[i].specAttrList.length; j++) {
          if (specList[i].attrValueStatus) {
            specList[i].attrValueStatus[j] = true;
          } else {
            specList[i].attrValueStatus = [];
            specList[i].attrValueStatus[j] = true;
          }
        }
      }
      if (_this.data.activityType != '2') {
        _this.setData({
          selectPrice: stockList[0].price,
        })
      }else{
        _this.setData({
          selectPrice: activityDetailBean.giftPrice
        })
      }
     
      switch (activityDetailBean.activityType) {
        case '1':
          _this.data.activityTypeName = '助力';
          _this.data.actPrice = activityDetailBean.lowPrice;
          _this.data.activityTitle = '助力成功';
          actmoney: (stockList[0].price - stockList[0].reduceMoney).toFixed(2)
          break;
        case '2':
          _this.data.activityTypeName = '礼包'
          _this.data.actPrice = activityDetailBean.giftPrice;
          _this.data.activityTitle = '购买'
          actmoney = activityDetailBean.giftPrice
          break;
        case '3':
          _this.data.activityTitle = '代言此商品'
          break;
        case '4':
          _this.data.activityTypeName = '接龙';
          _this.data.actPrice = activityDetailBean.chainsPriceRange;
          _this.data.activityTitle = '接龙成功';
          actmoney = activityDetailBean.chainsPriceRange
          break;
        case '5':
          _this.data.activityTypeName = '拼团'
          _this.data.actPrice = activityDetailBean.collagePrice;
          _this.data.activityTitle = '拼团成功'
          actmoney = activityDetailBean.collagePrice

      }
      //判断活动状态
      switch (activityDetailBean.status) {
        case 0:
          activityDetailBean.status = '活动未开始';
          break;
        case 1:
          activityDetailBean.status = '火热进行中';
          break;
        case 2:
          activityDetailBean.status = '活动已结束';

      }
      _this.setData({
        activityDetailBean: activityDetailBean,
        goodsBean: activityDetailBean.goodsBean, //商品详情
        imglist: activityDetailBean.goodsBean.imgList, //商品轮播图
        footPrintGoodsList: data.footPrintGoodsList, //猜你喜欢
        specList: specList, //所有规格
        stockList: stockList, //所以规格组合
        activityTypeName: _this.data.activityTypeName,
        actPrice: _this.data.actPrice,
        giftGoodsList: activityDetailBean.giftGoodsList,
        activityTitle: _this.data.activityTitle,
        actmoney: actmoney
      })

    })
  },
  // getGoodsEvaluate() {
  //   let _this = this;
  //   let params = {
  //     goodsNo: _this.data.goodsNo,
  //     page: _this.data.page,
  //     pageSize: _this.data.pageSize
  //   }
  //   requestUtil.Requests_page('product/queryGoodsEvaluate', params, _this.data.evaData).then((res) => {
  //     _this.setData({
  //       evaData: res.data, //商品评价
  //     })
  //   })
  // },
  //跳转到商品店铺
  handleShop() {
    let _this = this;
    let shopNo = _this.data.netShopInfo.shopNo
    wx.navigateTo({
      url: '../shop/shop?shopNo=' + shopNo,
    })
  },
  //选择商品规格
  handleSelect() {
    var _this = this;
    _this.showModal()
    _this.setData({
      includeGroup: this.data.stockList
    });
    // 只有一个属性组合的时候默认选中 
    if (_this.data.stockList.length == 1) {
      for (var i = 0; i < _this.data.stockList[0].makeBeanList.length; i++) {
        _this.data.specList[i].selectedValue = _this.data.stockList[0].makeBeanList[i].specValue;
      }
      _this.setData({
        specList: _this.data.specList
      });
    }

  },
  //关闭底部弹出
  handleHide() {
    let _this = this;
    _this.hideModal()
  },
  // 显示底部弹层
  showModal: function() {
    var _this = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
      showPop: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export()
      })
    }.bind(_this), 50)
  },
  // 隐藏底部弹层
  hideModal: function() {
    var _this = this;
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export(),
        showPop: false
      })
    }.bind(_this), 200)
  },
  /* 选择属性值事件*/
  selectAttrValue(e) {

    var specList = this.data.specList;
    var index = e.currentTarget.dataset.index; //点击的索引
    var key = e.currentTarget.dataset.key; //点击的类型
    var value = e.currentTarget.dataset.value; //点击的的值
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        //  取消选中
        this.disSelectValue(specList, index, key, value);
      } else {
        //选中
        this.selectValue(specList, index, key, value);
      }
    }
  },
  /*选中*/
  selectValue(specList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex); 
    var includeGroup = [];
    var specValue = [];
    let selectSpecName = [];
    let selName = '';
    let selValue = ''
    if (index == this.data.firstIndex && !unselectStatus) { //如果是第一个选中的属性值，则该属性所有值可选 
      var stockList = this.data.stockList;
      // 其他选中的属性值全部置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
      for (var i = 0; i < specList.length; i++) {
        for (var j = 0; j < specList[i].specAttrList.length; j++) {
          specList[i].selectedValue = '';
        }
      }
    } else {
      var stockList = this.data.includeGroup;
    }
    console.log('选中', stockList, index, key, value);
    for (let i = 0; i < stockList.length; i++) {
      for (let j = 0; j < stockList[i].makeBeanList.length; j++) {
        if (stockList[i].makeBeanList[j].specName == key && stockList[i].makeBeanList[j].specValue == value) {
          includeGroup.push(stockList[i]);
        }
      }
    }
    specList[index].selectedValue = value;
    // 判断属性是否可选 
    for (var i = 0; i < specList.length; i++) {
      for (var j = 0; j < specList[i].specAttrList.length; j++) {
        specList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < specList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].makeBeanList.length; j++) {
          if (specList[k].specName == includeGroup[i].makeBeanList[j].specName) {
            for (var m = 0; m < specList[k].specAttrList.length; m++) {
              if (specList[k].specAttrList[m].specValue == includeGroup[i].makeBeanList[j].specValue) {
                specList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    console.log('结果', specList);
    let actmoney = ''; //活动价格
    if (this.data.activityType == '1') {
      actmoney = includeGroup[0].price - includeGroup[0].reduceMoney
    }
    includeGroup[0].makeBeanList.forEach(item => {
     
      if (this.data.activityType == '4' && this.data.userIdType == '1') {
        actmoney = item.chainsHeadPrice
      } else if (this.data.activityType == '4' && this.data.userIdType == '2') {
        actmoney = item.chainsPrice
      } else if (this.data.activityType === '5') {
        actmoney = item.collagePrice
      }
      specValue.push(item.specValue);
    })
    specValue.forEach(item => {
      selValue += item + ' '
    })
    this.setData({
      specList: specList,
      includeGroup: includeGroup,
      specValue: specValue,
      selValue: selValue,
      actmoney: actmoney,
      selectPrice: includeGroup[0].price
    });

    var count = 0;
    for (var i = 0; i < specList.length; i++) {
      for (var j = 0; j < specList[i].specAttrList.length; j++) {
        if (specList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) { // 第一次选中，同属性的值都可选 
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /*取消选中*/
  disSelectValue(specList, index, key, value) {
    var stockList = this.data.stockList;
    specList[index].selectedValue = '';
    //判断属性是否可选
    for (let i = 0; i < specList.length; i++) {
      for (let j = 0; j < specList[i].specAttrList.length; j++) {
        specList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: stockList,
      specList: specList
    });
    for (let i = 0; i < specList.length; i++) {
      if (specList[i].selectedValue) {
        this.selectValue(specList, i, specList[i].specName, specList[i].selectedValue, true)
      }
    }
  },
  /**
   * 选择完规格,进行购买
   */
  handleChosen() {
    let that = this;
    let type = that.data.type; //店铺类型
    let activityNo = that.data.activityNo; //活动编码
    let activityType = that.data.activityType; //活动类型
    // let price = that.data.actPrice; //活动发起价格
    let price = '';
    if (activityType == '2' || activityType == '3') {
      price = that.data.selectPrice; //活动发起价格
    } else {
      price = that.data.actmoney; //活动发起价格
    }
    let stockNo = that.data.includeGroup[0].stockNo; ////库存编码
    that.hideModal(); //关闭弹窗
    let specListData = that.data.specList;
    // let userIdTypejielong = wx.getStorageSync('activityUserjielong')
    //清空选择的规格
    for (let o = 0; o < specListData.length; o++) {
      for (let p = 0; p < specListData[o].attrValueStatus.length; p++) {
        specListData[o].attrValueStatus[p] = false
      }
    }
    if (that.data.activityType === '4') {
      if (this.data.userIdType == '1') { //发起接龙
        that.createChainsGoods()
        that.setData({
          showDialog: false
        })
      } else { //参与接龙
        that.joinChainsActivity()
      }

    } else {
      wx.navigateTo({
        url: '../submit-order/submit-order?type=' + type + '&activityNo=' + activityNo + '&activityType=' + activityType + '&stockNo=' + stockNo + '&price=' + price + '&userIdType=' + that.data.userIdType,
        //  + '&cartNo=' + that.data.cartNoj,
      })
    }
  },
  /**
   * 支付底价
   */
  handlePay() {
   
    let that = this;
    let type = that.data.type; //店铺类型
    let activityNo = that.data.activityNo; //活动编码
    let activityType = that.data.activityType; //活动类型
    // let price = that.data.actPrice; //活动发起价格
    let price = '';
    if (activityType == '2' || activityType == '3') {
      price = that.data.selectPrice; //活动发起价格
    } else {
      price = that.data.actmoney; //活动发起价格
    }
    // 如果是没有规格的商品
    if (that.data.activityType != '2') { //如果不是大礼包
      if (that.data.stockList[0].makeBeanList.length === 0) {
        if (that.data.activityType === '4') { //如果是接龙活动,弹出分享接龙按钮
          that.createChainsGoods()
          that.setData({
            showDialog: false
          })
        } else {
          let stockNo = that.data.goodsBean.stockList[0].stockNo; //库存编码
          wx.navigateTo({
            url: '../submit-order/submit-order?type=' + type + '&activityNo=' + activityNo + '&activityType=' + activityType + '&stockNo=' + stockNo + '&price=' + price + '&userIdType=' + that.data.userIdType,
            //  + '&cartNo=' + that.data.cartNoj,
          })
        }
      } else { //有规格商品
        that.handleSelect()
      }
    } else { //大礼包直接购买
      wx.navigateTo({
        url: '../submit-order/submit-order?type=' + type + '&activityNo=' + activityNo + '&activityType=' + activityType + '&stockNo=-1' + '&price=' + price,
      })
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    let img=_this.data.imglist[0].imgPath;
    console.log(img)
    if (_this.data.activityType == 2) {
      return {
        title: '壹叁新消费',
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activity-details/activity-details&type=' + _this.data.type + '&goodsNo=' + _this.data.goodsNo + '&activityType=' + _this.data.activityType + '&activityNo=' + _this.data.activityNo + '&isshare=1',
        imageUrl:img,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    } else if (_this.data.activityType == 4) {
      return {
        title: '壹叁新消费',
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityjl/activityjl&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=' + _this.data.isshare,
        imageUrl:img,
        success: function(res) {
          // 转发成功
          that.setData({
            showDialog: true
          })
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }

  },
  /**
   * 发起接龙活动新增活动单
   */
  createChainsGoods() {
    let _this = this;
    let stockNo = '';
    // 如果是没有规格的商品
    if (_this.data.stockList[0].makeBeanList.length === 0) {
      stockNo = _this.data.goodsBean.stockList[0].stockNo; //库存编码
    } else {
      stockNo = _this.data.includeGroup[0].stockNo; ////库存编码
    }
    let params = {
      activityNo: _this.data.activityNo,
      goodsNo: _this.data.goodsNo,
      userId: wx.getStorageSync('userId'),
      type: _this.data.type,
      stockNo: stockNo
    }
    requestUtil.Requests('cart/myChainsGoods', params).then((res) => {
      _this.setData({
        cartNo: res.data.cartNo
      })
    })
  },
  /**
   * 加入接龙
   */
  joinChainsActivity() {
    let _this = this;
    let cartNo = wx.getStorageSync('cartNo');
    let formUserId = wx.getStorageSync('formUserId')
    let stockNo = _this.data.includeGroup[0].stockNo; ////库存编码
    let params = {
      cartNo: cartNo,
      userId: wx.getStorageSync('userId'),
      formUserId: formUserId,
      stockNo: stockNo
    }
    requestUtil.Requests('cart/joinChainsActivity', params).then((res) => {
      if (res.flag) {
        _this.data.joinStatus = '1' //接龙成功
        wx.showToast({
          title: '接龙成功啦~',
        })
        _this.setData({
          showDialog: false
        })
      } else {
        _this.data.joinStatus = '2' //接龙失败

      }
      wx.setStorageSync('joinStatus', _this.data.joinStatus)
      wx.showToast({
        title: '接龙成功啦~',
      })
    })


  },
  /**跳转查看商品详情 */
  toGiftDetail(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '../product-details/product-details?goodsNo=' + goodsNo + '&isgift=0',
    })
  },
  /**产品评价 */
  getCommodityGrade() {
    let _this = this;
    let params = {
      goodsNo: _this.data.goodsNo,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('product/queryGoodsEvaluate', params, _this.data.gradelist).then((res) => {
      console.log('获取商品评价', res)
      // let gradelist = res.data.slice(0, 3)
      _this.setData({
        gradelist: res.data,
        allEvaNum: res.count,
      })
    })
  },
  /**点击查看猜你喜欢商品详情 */
  handlelikeDetail(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '../product-details/product-details?goodsNo=' + goodsNo,
    })
  },
  /*查看商品评价*/
  checkEva() {
    let that = this;
    wx.navigateTo({
      url: '../shop-evaluate/index?goodsNo=' + that.data.goodsNo,
    })
  },
  //跳转查看活动介绍
  toIntrodeuce() {
    let _this = this;
    let activityNo = _this.data.activityNo;
    if (_this.data.activityDetailBean.activityType === '1') {
      wx.navigateTo({
        url: '../activity-introduce/activity-introduce?activityNo=' + activityNo,
      })
    } else if (_this.data.activityDetailBean.activityType === '4') {
      wx.navigateTo({
        url: '../activity-introduce-jl/index',
      })
    }
  },
})
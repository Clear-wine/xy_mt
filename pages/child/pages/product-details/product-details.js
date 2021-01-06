// pages/child/pages/product-details/product-details.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 1000,
    howMuch: 12,
    fnum: 0,
    showView: true,
    likeNum: 0,
    page: 1,
    pageSize: 3,
    selectedArr: [],
    cost: 0,
    num: 1,
    chenum:0,
    // navH:20,//导航高度
    selectedvalueArr: [],
    groupindex: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('传参',options)
    this.options = options
    let _this = this;
    if (options.isgift) {
      this.setData({
        isgift: options.isgift
      })
    }
    if (options.cost) {
      let selectedArr = JSON.parse(options.selectedArr)
      _this.setData({
        cost: Number(options.cost),
        selectedArr: selectedArr
      })
    }
    _this.setData({
      goodsNo: options.goodsNo,
      groupindex: options.groupindex,
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade'),
      windowWidth: wx.getStorageSync('windowWidth'),
      zznum:Number(options.zznum)
    })
     if(wx.getStorageSync('userId')){
      //获取优店商品详情
    _this.getGoodsDetail()
    //获取优店商品的评价
    _this.getGoodsEvaluate()
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _this = this;
    let query = wx.createSelectorQuery();
    query.select('.footer').boundingClientRect(function(rect) {
      // console.log(rect.width)
      _this.setData({
        height: rect.height
      })
    }).exec();

    //获取手机系统信息
    wx.getSystemInfo({
      success: function(res) {
        //导航高度
        let navH = res.statusBarHeight + 46;
        _this.setData({
          navH: navH
        })
      },
      fail(err) {
        console.log(err);
      }
    })
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
    //获取优店商品详情
    _this.getGoodsDetail()
    //获取优店商品的评价
    _this.getGoodsEvaluate()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    console.log(_this.data.shopGoodsDetail);
    console.log(_this.data.data);
    if (res.from === 'menu') {
      return {
        title: _this.data.shopGoodsDetail.goodsName,
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/product-details/product-details&goodsNo=' + _this.data.goodsNo + '&isshare=1&zznum='+this.data.zznum,
        imageUrl: _this.data.imglist[0].imgPath,
      }
    }

  },
  /*点击图片进行预览，长按保存分享图片 */
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
  handleShowImg() {
    let current = this.data.imglist[0].imgPath;
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
  // 返回上一页
  navBack: function() {
    let that=this;
    console.log('this.data.selectedArr',this.data.selectedArr)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedArr: that.data.selectedArr,
        zznum:that.data.zznum,
        cost:that.data.cost
      })
      prevPage.jiancha();
      wx.navigateBack();
    }
  },
  onUnload() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedArr: this.data.selectedArr,
        cost: Math.round(this.data.cost * 100) / 100,
        groupindex: this.data.groupindex
      })
    }

  },
  navHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  /**展示购物车 */
  handleShow() {
    let self = this;
    let packprice = 0.0;
    if (self.data.selectedArr.length == 0) {
      wx.showToast({
        title: '您还没有选择商品哦!快去选择商品吧!',
        icon: 'none'
      })
    } else {
      if(self.data.showPop2){
        self.hideModalCart()
      }else{
        self.showModalCart()
      } 
      // self.data.selectedArr.forEach((el) => {
      //   packprice += el.fare
      // })
      self.setData({
        packprice: packprice
      })
      //function() {
      //   this.showModalCart()
      // })
    }
  },
  getGoodsDetail() {
    let _this = this;
    let params = {
      goodsNo: _this.data.goodsNo,
      userId: wx.getStorageSync('userId'),
      type: 2,
      sourceType: 'wx'
    }
    requestUtil.Requests('product/yoGoods/queryGoodsDetail', params).then((res) => {
      console.log("商品详情",res)
      // let data = res.data;
      // let selName = '';
      // let specList = data.shopGoodsDetail.specList; //所有规格
      // let stockList = data.shopGoodsDetail.stockList; //所以规格组合
      // for (var i = 0; i < specList.length; i++) {
      //   selName += specList[i].specName + ' '
      //   for (var j = 0; j < specList[i].specAttrList.length; j++) {
      //     if (specList[i].attrValueStatus) {
      //       specList[i].attrValueStatus[j] = true;
      //     } else {
      //       specList[i].attrValueStatus = [];
      //       specList[i].attrValueStatus[j] = true;
      //     }
      //   }
      // }
      if(res.data.multi){
        _this.getguige()
      }
      _this.setData({
        // shopGoodsDetail: data.shopGoodsDetail, //商品详情
        // imglist: data.shopGoodsDetail.imgList, //商品轮播图
        // footPrintGoodsList: data.footPrintGoodsList, //猜你喜欢
        // specList: specList, //所有规格
        // stockList: stockList, //所以规格组合
        data:res.data
      })

    })
  },
  //获取规格
  getguige(){
    let that=this;
    let params={
      goodsNo:that.data.goodsNo,
      sourceType:"wx"
    }
    requestUtil.Requests('product/yoGoods/queryStockList',params).then((res)=>{
      console.log('商品规格',res)
        let specList = res.data.goodsStockBeanList; //所有规格
        let stockList = res.data.stockList; //所以规格组合
        let selName = '';
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
      that.setData({
        specList: specList, //所有规格
        stockList: stockList, //所以规格组合
      })
    })
  },
  getGoodsEvaluate() {
    let _this = this;
    let params = {
      goodsNo: _this.data.goodsNo,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('product/queryGoodsEvaluate', params, _this.data.evaData).then((res) => {
      _this.setData({
        evaData: res.data, //商品评价
        allEvaNum: res.count,
      })
    })
  },
  /*查看商品评价*/
  checkEva() {
    let that = this;
    wx.navigateTo({
      url: '../shop-evaluate/index?goodsNo=' + that.data.goodsNo,
    })
  },
  /**点击添加到购物车 */
  addToTrolley(e) {
    var that = this
    let selectedArr = that.data.selectedArr
    let data=that.data.data
    if (data.multi) {
      that.setData({
        includeGroup: this.data.stockList
      });
      that.showModal(); //弹出选择规格框
    } else { //判断库存直接添加商品
      let a=2;
      var yhprice=data.price
      let obj={
        goodScoreRate: 100,
        goodsImgPath: data.imgList[0],
        goodsName: data.goodsName,
        goodsNo: data.goodsNo,
        isStock: 1,
        monthSaleNum: 5,
        num: 1,
        packFee: data.packFee,
        price: data.price,
        profit: data.profit,
        stockNo: data.stockNo,
        stockNum: data.stockNum,
        yhprice: yhprice,
        zprice: yhprice,
      };
      for(let i=0;i<selectedArr.length;i++){
        if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
          selectedArr[i].num++;
          selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.yhprice)).toFixed(2);
          a=1;
          break;
        }else{
          a=2;
        }
      }
      console.log(a)
      if(a==2){
        obj.num=1;
        selectedArr.push(obj)
      }
      console.log(selectedArr)
       var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0);
       var cost=selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2);
      that.setData({
        selectedArr:selectedArr,
        zznum:zznum,
        cost:cost
      })
    }
  },
  submitOrder(e) {
    wx.navigateTo({
      url: '../submit-order/submit-order',
    })
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
  // 隐藏底部弹层购物车
  hideModalCart: function() {
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
        showPop2: false
      })
    }.bind(_this), 200)
  },
  // 显示底部弹层购物车
  showModalCart: function() {
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
      showPop2: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export()
      })
    }.bind(_this), 50)
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
    // let selectedvalueArr = []//选择的规格
    let selectedObj = {} //选中的规格
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
          selectedObj = {
            specName: key,
            specValue: value
          }
        }
      }
    }
    this.data.selectedvalueArr.push(selectedObj);
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
    // includeGroup[0].makeBeanList.forEach((item) => {
    //   specValue.push(item.specValue);

    // })
    specList.forEach(item => {
      if (item.selectedValue) {
        specValue.push(item.selectedValue)
      }
    })
    specValue.forEach(item => {
      selValue += item + ' '
    })
    this.setData({
      specList: specList,
      includeGroup: includeGroup,
      specValue: specValue,
      selValue: selValue,
      selectedIncludeGroup: includeGroup,
      selectedvalueArr: this.data.selectedvalueArr,
      chenum:1
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
    let selectedvalueArr = this.data.selectedvalueArr;
    var stockList = this.data.stockList;
    specList[index].selectedValue = '';
    //判断属性是否可选
    for (let i = 0; i < specList.length; i++) {
      for (let j = 0; j < specList[i].specAttrList.length; j++) {
        specList[i].attrValueStatus[j] = true;
      }
    }
    for (let j = 0; j < selectedvalueArr.length; j++) {
      if (selectedvalueArr[j].specName == key && selectedvalueArr[j].specValue == value) {
        selectedvalueArr.splice(j, 1)
      }
    }
    this.setData({
      includeGroup: stockList,
      specList: specList,
      selectedIncludeGroup: undefined,
      selectedvalueArr: selectedvalueArr
    });
    for (let i = 0; i < specList.length; i++) {
      if (specList[i].selectedValue) {
        this.selectValue(specList, i, specList[i].specName, specList[i].selectedValue, true)
      }
    }
  },
  /**选好规格商品 */
  handleChosen() {
    
    let _this = this;
    let info = _this.data.menu;
    let merObj = {};
    let shopGoodsDetail = _this.data.data;
    let selectedArr = _this.data.selectedArr;
    let selectedIncludeGroup = _this.data.selectedIncludeGroup;
    if (_this.data.selectedIncludeGroup == undefined) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    } else {
      //已经选择规格,则需判断是否选择了完整的规格组合
      let isSelected = true;
      for (let i in _this.data.specList) {
        if (!_this.data.specList[i].selectedValue) {
          isSelected = false
        }
      }
      if (!isSelected) {
        wx.showToast({
          title: '请选择完整的规格',
          icon: 'none'
        })
      } else {
        if (_this.data.selectedIncludeGroup[0].num == null) { //表示选择的规格商品库存为无限库存
          _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
        } else { //表示选择的规格商品有限,需要进行判断
          if (_this.data.num > _this.data.selectedIncludeGroup[0].num) {
            wx.showToast({
              title: '您选择的数量超出限购数,请重新选择',
              icon: 'none'
            })
          } else {
            if (selectedArr.length != 0) { //如果购物车不为空
              let item = selectedArr.find(item => {
                return item.stockNo == _this.data.selectedIncludeGroup[0].stockNo
              })
              if (item != undefined) {
                if ((item.num + _this.data.num) > item.stockNum) {
                  wx.showToast({
                    title: '您选择商品数量已超出库存范围,请重新选择',
                    icon: 'none'
                  })
                } else {
                  _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
                }
              } else {
                _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
              }
            } else {
              _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
            }
          }
        }
      }
    }

  },
  /**多规格商品加入购物车 */
  addCartStockGoods(shopGoodsDetail, selectedIncludeGroup) {
    let that=this;
    let data=that.data.data;
    let chenum=that.data.chenum;
    let selectedArr=that.data.selectedArr
    if(chenum==0){
      that.hideModal()
      return;
    }
    var yhprice=selectedIncludeGroup[0].price;
    let obj={
      goodScoreRate: 100,
      goodsImgPath: data.imgList[0],
      goodsName: data.goodsName,
      goodsNo: data.goodsNo,
      isStock: 1,
      monthSaleNum: 5,
      num: chenum,
      packFee: data.packFee,
      price: selectedIncludeGroup[0].price,
      profit: data.profit,
      stockNo: selectedIncludeGroup[0].stockNo,
      stockNum: data.stockNum,
      yhprice: yhprice,
      zprice: yhprice*chenum,
    };
    console.log("最终数据",obj)
    var a=2;
    for(let i=0;i<selectedArr.length;i++){
      if(selectedArr[i].stockNo==obj.stockNo){
        selectedArr[i].num=selectedArr[i].num*1+obj.num*1;
        selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.zprice)).toFixed(2);
        a=1;
        break;
      }else{
        a=2;
      }
    }
    console.log(a)
    if(a==2){
      selectedArr.push(obj)
    }
    var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0)
    var cost=(selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2))
    that.setData({
      zznum:zznum,
      cost:cost,
      selectedArr:selectedArr
    })
    that.hideModal()
},
  /**优店购物车新增数量 */
  addCartNum(e) {
    let that=this;
    let selectedArr=that.data.selectedArr;
    let obj=e.currentTarget.dataset.item;
    for(let i=0;i<selectedArr.length;i++){
      if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
          selectedArr[i].num++;
          selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.yhprice)).toFixed(2);
      } 
    }
    var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0);
    var cost=selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2)
    that.setData({
      selectedArr:selectedArr,
      zznum:zznum,
      cost:cost
    })
  },
  /**优店购物车减去数量 */
  removeCartNum(e) {
    let that=this;
    let selectedArr=that.data.selectedArr;
    let obj=e.currentTarget.dataset.item;
    for(let i=0;i<selectedArr.length;i++){
      if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
        if(selectedArr[i].num>1){
          selectedArr[i].num--;
          selectedArr[i].zprice=(Number(selectedArr[i].zprice)-Number(obj.yhprice)).toFixed(2);
        }else{
          selectedArr.splice(i,1);
        }
      } 
    }
    var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0);
    var cost=selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2)
    that.setData({
      selectedArr:selectedArr,
      zznum:zznum,
      cost:cost
    })
  },
  /**
   * 支付订单
   */
  payOrder() {
    let that=this;
    let selectedArr=JSON.stringify(that.data.selectedArr);
    wx.navigateTo({
      url: '/pages/child/pages/submitYo-order/submitYo-order?selectedArr=' + selectedArr+'&shopNo='+that.data.data.shopNo,
    })
  },
  /**关闭弹窗 */
  handleHide() {
    this.hideModal();
  },
 /*点击减号*/
 bindMinus() {
    
  let _this = this;
  // 如果大于1时,才可以减
  if (_this.data.chenum > 0) {
    _this.data.chenum--;
  }
  // 只有大于一件的时候,才能normal状态,否则disable
  // 将数值与状态写回
  _this.setData({
    chenum: _this.data.chenum,
  });
},
bindPlus() {
  let _this = this;
  // 不作过多考虑自增1
  _this.data.chenum++
  // 将数值与状态写回
  _this.setData({
    chenum: _this.data.chenum
  });
},
/* 输入框事件 */
bindManual: function(e) {
  let _this = this;
  _this.data.chenum = e.detail.value;

  // 将数值与状态写回
  _this.setData({
    chenum: _this.data.chenum
  });
},
  /**点击查看猜你喜欢商品详情 */
  handlelikeDetail(e) {
    if(this.options.flag){
      wx.showToast({
        title: '不能重复跳转',
        icon:'none'
      })
    }else{
      let goodsNo = e.currentTarget.dataset.goodsno;
      wx.navigateTo({
        url: '../product-details/product-details?goodsNo=' + goodsNo + '&cost=' + this.data.cost + '&selectedArr=' + JSON.stringify(this.data.selectedArr) + '&groupindex=' + this.data.groupindex+'&zznum='+this.data.zznum,
      })
    }
  },
  /**清空购物车 */
  clearCart(e) {
    // var info = this.data.menu;
    //不需要选择规格
    // info[this.data.selected].excellentGoodsList.forEach(el => {
    // el.num = 0;
    // })
    this.setData({
      selectedArr: [],
      // menu: info,
      cost: 0
    })
    this.hideModalCart()
  },
})
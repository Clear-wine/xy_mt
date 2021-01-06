var requestUtil = require('../../../../utils/requestUtil.js')
var WxParse = require('../../../../utils/wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    guigec:false,
    num: 1, //初始数量
    buttonText:'立即购买',
    lei:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.goodsNo)
    this.setData({
      goodsNo:options.goodsNo,
      vipRate: wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade'),
    })
    if(wx.getStorageSync('userId')){
      //获取商品详情
      this.getdetails();
      //获取购物车数量
      this.getCartNum();
      //获取规格
      this.getguige();
      //获取商品图片详情
      this.getdetailstu();
    }
  },
  imgClick(e){
    let src = e.currentTarget.dataset.src;//获取data-src
    let imgList = e.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
    current: src, // 当前显示图片的http链接
    urls: imgList // 需要预览的图片http链接列表
    })
  },
  //获取商品详情
  getdetails(){
    let that=this;
    let goodsNo=that.data.goodsNo;
    let params = {
      userId:wx.getStorageSync('userId'),
      goodsNo:goodsNo
    }
    requestUtil.Requests('product/netGoods/queryGoodsDetail', params).then((res) => {
      let score=res.data.shopBaseDTO.score;
      if (score <= 1) {
        res.data.shopBaseDTO.score = 1;
      } else if (score <= 2) {
        res.data.shopBaseDTO.score = 2;
      } else if (score <= 3) {
        res.data.shopBaseDTO.score = 3;
      } else if (score <= 4) {
        res.data.shopBaseDTO.score = 4;
      } else if (score <= 5) {
        res.data.shopBaseDTO.score = 5
      }
      console.log("商品详情====>",res)
      that.setData({
        data:res.data,
        isCollect:res.data.isCollect,
        collectId:res.data.collectId
      })
    })
  },
  //获取商品规格
  getguige(){
    let that=this;
    let goodsNo=that.data.goodsNo;
    let params = {
      goodsNo:goodsNo
    }
    requestUtil.Requests('product/netGoods/queryStockList', params).then((res) => {
      console.log("商品规格====>",res)
      let data=res.data.goodsStockBeanList
      data.forEach(item => {
        item.specAttrList.forEach(arr=>{
          arr.ps=false;
          if(arr.num ==null){
            arr.num=0
          }
        })
      });
      that.setData({
        guigelist:data,
        guigedetails:data[0],
        guigedetailss:data[0]
      })
      console.log('规格的第一个==>',that.data.guigedetails)
    })
  },
  //获取购物车数量
  getCartNum() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('product/cart/queryCartNum', params).then((res) => {
      _this.setData({
        cartNum: res.data
      })
    })
  },
  //获取商品详情图片
  getdetailstu(){
    let _this = this;
    let goodsNo = _this.data.goodsNo
    wx.request({
      //  url: app.globalData.requestPath + 'product/queryGoodsDetailImgList',
      // url: app.globalData.requestPath + 'product/queryGoodsH5DetailPage',
      url: app.globalData.requestPath + 'product/queryWXGoodsH5DetailPage', 
      method: 'POST',
      data: {
        goodsNo: goodsNo
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log("详情图片",res)
        if (res.data) {
          _this.setData({
            detailh5: res.data.data
          })
          let detailh5 = res.data.data
          WxParse.wxParse('detailh5', 'html', detailh5, _this, 0);
        }
      }      
    })
  },
  //跳转到首页
  handleShops() {
    wx.switchTab({
      url:'/pages/index/index'
    })
  },
    //跳转到商品店铺
    handleShop() {
      let _this = this;
      let shopNo = _this.data.data.shopNo
      wx.navigateTo({
        url: '/pages/child/pages/shop/shop?shopNo=' + shopNo,
      })
    },
  //跳转到猜你喜欢的商品页面
  goyoulike(e){
    let _this = this;
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
    })
  },
  //查看购物车
 tocart() {
  wx.switchTab({
    url: '/pages/shoppingCart/shoppingCart',
  })
  // wx.navigateTo({
  //   url: '/pages/child/pages/cart/index',
  // })
},
  //查看商品评价
  checkEva() {
    let that = this;
    wx.navigateTo({
      url: '/pages/child/pages/shop-evaluate/index?activityNo=' + that.data.activityNo+'&goodsNo='+that.data.goodsNo,
    })
  },
  //关闭规格弹出
  yingc(){
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
        guigec: false
      })
    }.bind(this), 200)
  },
  //开启规格弹出
  kaiq(){
    var _this = this;
    let lei = '加入购物车';
    if(_this.data.lei == 1){
      lei= '确认购买';
    }
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
      guigec: true,
      buttonText:lei
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export()
      })
    }.bind(_this), 50)
  },
  //选择规格
  guigex(e){
    let that=this;
    let list=that.data.guigelist
    let specName=e.currentTarget.dataset.specname; //这是规格分类的名称
    let stockNos=e.currentTarget.dataset.stocknos; //这是分类里面的编码
    let wangobj=that.data.wangobj;
    let details={};
    var a=0;
    var b;
    list.forEach(item => {
      if(item.specName==specName){
        console.log(1111)
        item.specAttrList.forEach(arr=>{
          if(arr.stockNo==stockNos){
            arr.ps=true;
            details=arr;
            if(specName==that.data.guigename||!wangobj){
              console.log(2222)
              wangobj=arr.specMakeList
            }else{
              console.log(3333)
               a=1;
               b=arr.specValue;
            }
          }else{
            arr.ps=false
          } 
        })
      }
    });
    if(a==1){
      wangobj.forEach(item=>{
        if(item.specValue==b){
          console.log('以选择',item)
          details=item
        }
      })
    }
    //console.log(specName,details)
    that.setData({
      guigelist:list,
      guigedetails:details,
      guigename:specName,
      wangobj:wangobj
    })
  },
  //加入购物车
  handlePay(){
    let that=this;
    let data=that.data.guigedetailss
    if(data.specAttrList.length>0){
      that.setData({
        lei:2,
        buttonText:'加入购物车'
      })
      this.kaiq()
    }else{
      let params = {
        userId: wx.getStorageSync('userId'),
        stockNo: that.data.data.stockNo, //库存编码
        count:1
      }
      requestUtil.Requests('product/cart/saveAndUpdate', params).then((res) => {
        if (res.flag) {
          wx.showToast({
            title: '添加购物车成功!',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            console.log('购物车添加成功')
            that.getCartNum();
          }, 1000)
        }
      })
    }
  },
  //规格框里面的加入购物车
  goxiadanyi(){
    this.setData({
      lei:2
    })
    this.goxiadan()
  },
  //规格里面的购买按钮
  goxiadaner(){
    if(this.data.guigename&&this.data.guigedetails.num>0){
      console.log(this.data.guigedetails.num)
      console.log(this.data.guigename)
      this.setData({
        lei:1
      })
      this.goxiadan()
    }else if(!this.data.guigename){
      wx.showToast({
        title: '请选择完整的规格',
        icon:'none'
      })
    }else{
      wx.showToast({
        title: '库存不足',
        icon:'none'
      })
    }
  },
  //规格选择选好了
  goxiadan(e){
    let that=this;
    if(that.data.lei==1){ //1为立即去购买
      let goodsObj = [{
        goodsNo: that.data.goodsNo,
        stockNo: that.data.guigedetails.stockNo,
        num: that.data.num,
        price:that.data.guigedetails.price
      }]
      let shopList=[];
      let shop={
        goodsList:goodsObj,
        shopNo:that.data.data.shopNo
      };
      shopList.push(shop)
      let source = 0
      let objArr = JSON.stringify(shopList)
      console.log(objArr)
      wx.navigateTo({
        url: '../submit-order/submit-order?source=' + source + '&goodsArr=' + objArr + '&type=1',
      })
    }else{ //2为加入购物车
      let params = {
        userId: wx.getStorageSync('userId'),
        stockNo:  that.data.guigedetails.stockNo, //库存编码
        count: that.data.num
      }
      requestUtil.Requests('product/cart/saveAndUpdate', params).then((res) => {
        if (res.flag) {
          wx.showToast({
            title: '添加购物车成功!',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            console.log('购物车添加成功')
            that.getCartNum()
          }, 1000)
        }
      })
    }
  },
  //立即购买
  gogoumai(){
    let that=this;
    let data=that.data.guigedetailss
    if(data.specAttrList.length>0){
      that.setData({
        lei:1,
        buttonText:'立即购买'
      })
      this.kaiq()
    }else{
      let goodsObj = [{
        goodsNo: that.data.goodsNo,
        stockNo: that.data.data.stockNo,
        num: that.data.num,
        price:that.data.data.price
      }]
      let shopList=[];
      let shop={
        goodsList:goodsObj,
        shopNo:that.data.data.shopNo
      };
      shopList.push(shop)
      let source = 0
      let objArr = JSON.stringify(shopList)
      wx.navigateTo({
        url: '../submit-order/submit-order?source=' + source + '&goodsArr=' + objArr + '&type=1',
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
    this.getdetails();
    this.getCartNum();
    this.getguige();
    this.getdetailstu();
  },
  //收藏
  shoucang(){
    let that=this;
    console.log('收藏状态',that.data.isCollect)
    if(that.data.isCollect){
      var url= "product/collect/del"; //取消收藏
      var obj=[];
      obj.push(that.data.collectId)
      var params={
        id:obj
      };
    }else{
      var url="product/collect/save"; //添加收藏
      var params = {
        shopType: 1,
        goodsNo: that.data.data.goodsNo,
        userId: wx.getStorageSync('userId'), //用户id
        shopNo:that.data.data.shopNo
      };
    }
    requestUtil.Requests(url, params).then((res) => {
      console.log(res)
      if(res.flag){
        if(that.data.isCollect){
          wx.showToast({
            title: '取消收藏成功',
            icon:'success'
          })
        }else{
          wx.showToast({
            title: '收藏成功',
            icon:'success'
          })
        }
        that.getdetails()
      }
    })
  },
    /*点击减号*/
    bindMinus() {
      let _this = this;
      let num = _this.data.num;
      // 如果大于1时,才可以减
      if (num > 1) {
        num--;
      }
      // 只有大于一件的时候,才能normal状态,否则disable
      let minusStatus = num <= 1 ? 'disabled' : 'normal'
      // 将数值与状态写回
      _this.setData({
        num: num,
        minusStatus: minusStatus
      });
    },
    bindPlus() {
      let _this = this;
      let num = _this.data.num;
      // 不作过多考虑自增1
      num++;
      // 只有大于一件的时候,才能normal状态,否则disable
      let minusStatus = num < 1 ? 'disabled' : 'normal'
      // 将数值与状态写回
      _this.setData({
        num: num,
        minusStatus: minusStatus
      });
    },
    /* 输入框事件 */
    bindManual: function(e) {
      let _this = this;
      let num = e.detail.value;
      if (isNaN(num)) {
        num = 1;
      }
      // 将数值与状态写回
      _this.setData({
        num: Number(num)
      });
    },
//前往vip的展示
govipdetails(){
  let that=this;
  let img=that.data.data.imgList[0];
  wx.navigateTo({
    url: '../vip-details/index?goodsName='+that.data.data.goodsName+'&goodsNo='+that.data.goodsNo+'&img='+img,
  })
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    let img=_this.data.data.imgList[0]
    console.log(img)
      if (res.from === 'button') {
        // wx.showShareMenu();
        //来自页面内的转发按钮
        console.log(res.target, res)
  
        if (_this.data.activityType != '4') {
          return {
            title: _this.data.data.goodsName,
            path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
            imageUrl:img,
          }
        } else {
          return {
            title: _this.data.data.goodsName,
            path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
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
      } else if (res.from === 'menu') {
        return {
          title: _this.data.data.goodsName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
          imageUrl:img,
        }
  
      }
  },
})
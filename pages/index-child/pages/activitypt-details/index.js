// pages/index-child//pages/activitypt-details/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
var WxParse = require('../../../../utils/wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    guigec:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.activityNo)
    this.setData({
      activityNo:options.activityNo,
      activityOrderNo:options.activityOrderNo
    })
    if(wx.getStorageSync('userId')){
      this.getdetails();
      this.getCartNum();
    }
  },
  //获取商品详情
  getdetails(){
    let that=this;
    let activityNo=that.data.activityNo;
    let params = {
      activityNo:activityNo
    }
    requestUtil.Requests('activity/collage/queryDetail', params).then((res) => {
      console.log("商品详情====>",res)
        let detailh5 = res.data.descText
        WxParse.wxParse('detailh5', 'html', detailh5, that, 0);
      that.setData({
        data:res.data
      })
      that.getguige();
    })
  },
  //获取商品规格
  getguige(){
    let that=this;
    let activityNo=that.data.activityNo;
    var num=that.data.data.num
    let params = {
      activityNo:activityNo
    }
    requestUtil.Requests('activity/collage/queryStock', params).then((res) => {
      console.log("商品规格====>",res)
      let data=res.data
      data.forEach(item => {
        if(item.num<num){
          item.ps=false
        }else{
          if(item.id==data[0].id){
            item.ps=true
          }else{
            item.ps=false
          }
        }
      });
      that.setData({
        guigelist:data,
        guigedetails:data[0]
      })
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
  //跳转到首页
  handleShops() {
    let _this = this;
    let shopNo = _this.data.data.shopBaseDTO.shopNo
    wx.switchTab({
      url:'/pages/index/index'
    })
  },
    //跳转到商品店铺
    handleShop() {
      let _this = this;
      let shopNo = _this.data.data.shopNo
      wx.navigateTo({
        url:  '/pages/child/pages/shop/shop?shopNo=' + shopNo,
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
},
  //查看商品评价
  checkEva() {
    let that = this;
    wx.navigateTo({
      url: '/pages/child/pages/shop-evaluate/index?activityNo=' + that.data.activityNo,
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
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
      guigec: true
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
    let id=e.currentTarget.dataset.id;
    let num=e.currentTarget.dataset.num;
    if(num<that.data.data.num){
      that.kcbuzu();
      return
    }
    let details={};
    console.log(id)
    list.forEach(item => {
      if(item.id==id){
        item.ps=true
        details=item;
      }else{
        item.ps=false
      }     
    });
    that.setData({
      guigelist:list,
      guigedetails:details
    })
  },
  //前去购买
  handlePay(){
    let that=this;
    let data=that.data.data
    if(data.multi){
      this.kaiq()
    }else{
      if(data.stockNum<data.num){
        that.kcbuzu();
        return
      }
      let activityNo=data.activityNo;
      let stockNo=data.stockNo;
      let activityOrderNo=that.data.activityOrderNo;
      console.log('无规格的下单传参====>',activityNo,stockNo)
      wx.navigateTo({
        url: '../activitypt-order/index?activityNo='+activityNo+'&stockNo='+stockNo+'&activityOrderNo='+activityOrderNo
      })
    }
  },
  //去下单
  goxiadan(e){
    let that=this;
    let stockNo=e.currentTarget.dataset.stockno;
    let activityNo=e.currentTarget.dataset.activityno;
    let activityOrderNo=that.data.activityOrderNo;
    let num=e.currentTarget.dataset.num;
    if(num<that.data.data.num){
      wx.showModal({
        title: '提示',
        content: '您还未选择规格,请选择规格',
      })
      return
    }
    console.log('有规格的下单传参====>',activityNo,stockNo)
    wx.navigateTo({
      url: '../activitypt-order/index?activityNo='+activityNo+'&stockNo='+stockNo+'&activityOrderNo='+activityOrderNo
    })
  },
  //库存不足弹窗
  kcbuzu(){
    wx.showModal({
      title: '提示',
      content: '当前库存不足,请选择其他商品',
    })
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
          title: _this.data.data.activityName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitypt-details/index&activityNo=' + _this.data.activityNo,
          imageUrl:img,
        }
      } else {
        return {
          title: _this.data.data.activityName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitypt-details/index&activityNo=' + _this.data.activityNo,
          imageUrl: img,
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
        title: _this.data.data.activityName,
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitypt-details/index&activityNo=' + _this.data.activityNo,
        imageUrl:img,
      }

    }
  },
})
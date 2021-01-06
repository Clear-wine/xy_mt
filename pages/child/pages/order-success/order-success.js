// pages/child/pages/order-success/order-success.js
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 0,
    pageSize: 5,
    likedata: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('支付成功页面的数据=====>',options)
    let _this = this;
    if (options.activityNo && options.activityType) {
      let activityTypeName
      if (options.activityType == 1) {
        activityTypeName = '助力'
        this.getmoban()
      } else if (options.activityType == 5) {
        activityTypeName = '拼团'
        this.getmoban()
      } else if(options.activityType==4){
        activityTypeName='接龙'
        this.getmoban()
      } else if(options.activityType==3){
        activityTypeName='代言'
      }else if(options.activityType==2){
        activityTypeName="礼包"
      }
      this.setData({
        shopname: options.shopname,
        payPrice: options.payPrice,
        activityNo: options.activityNo,
        activityType: options.activityType,
        cartNo: options.cartNo,//是支付者的订单编码,没有orderNo则为发起者,有则为参与者
        activityTypeName: activityTypeName,
        len: options.len,
        shopType: options.shopType,
        shopNo: options.shopNo,
        img:options.img,
        goodsNo:options.goodsNo,
        type:options.type,
        isshare:options.isshare,
        orderNo:options.orderNo//参与者进入该页面带过来的发起者订单编码
      })
    } else {
      this.setData({
        shopName: options.shopName,
        payPrice: options.payPrice,
        len: options.len,
        shopType: options.shopType,
        shopNo: options.shopNo,
        cartNo: options.cartNo,
        img:options.img,
        goodsNo:options.goodsNo,
        type:options.type,
        activityType: options.activityType
      })
    }
     if(wx.getStorageSync('userId')){
      //获取猜你喜欢分页列表
    this.getLikeGoodsPage()
    }
  },
  getmoban() {
    let that = this;
    let params = {
      activtiyType:1
    }
    requestUtil.Requests('activity/wx/sub/temp/queryList', params).then((res) => {
      console.log('模板id',res)
      this.dingyue(res.data)
    })
  },
  dingyue(dy){
    let that=this;
    console.log('that.data.orderNo',that.data.orderNo)
    if(that.data.orderNo){
      var activityOrderNo=that.data.orderNo;
    }else{
      var activityOrderNo=that.data.cartNo;
    }
    wx.showModal({
      title:'开启活动成功',
      content:'建议您打开活动消息提醒哦',
      success(res){
        if(res.confirm){
          wx.requestSubscribeMessage({
            tmplIds: dy,
            success (res) {
              console.log('订阅成功',res)
              let params = {
                activityType:that.data.activityType,//"1",
                orderNo:that.data.cartNo,//"ZL_O202007091621113552576",
                openId:wx.getStorageSync('openId'),
                userId:wx.getStorageSync('userId'),
                joinType:that.data.isshare,//"1",
                activityNo:that.data.activityNo,//"ZL_O202007061849441666201"
                activityOrderNo:activityOrderNo
              }
              console.log("上传参数",params)
              requestUtil.Requests('activity/wx/sub/temp/saveSubscribe', params).then((res) => {
                console.log('向后台传输参数',res)
              })
            },
            errMsg(res){
              console.log('订阅失败',res)
            },
          })
        }else if(res.cancel){

        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      vipRate:wx.getStorageSync('vipRate'),
      vipGrade: wx.getStorageSync('vipGrade')
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

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
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let _this = this;
    let shareId = wx.getStorageSync('userId')
    let img=_this.data.img
    console.log(img)
    if (res.from === 'button') {
      //来自页面内的转发按钮
      console.log(res.target, res)
      if (_this.data.activityType == '1') {
        return {
          title: _this.data.shopname,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityzl/activityzl&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=' + _this.data.isshare,
          imageUrl:img
        }
      } else if (_this.data.activityType == '5') {
        if(_this.data.orderNo){
          var cartNo=_this.data.orderNo
        }else{
          var cartNo=_this.data.cartNo
        }
        return {
          title: _this.data.shopname,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activitypt/activitypt&activityNo=' + _this.data.activityNo + '&cartNo=' + cartNo + '&isshare=' + _this.data.isshare,
          imageUrl:img
        }
      } else if (_this.data.activityType == '4') {
        if(_this.data.orderNo){
          var cartNo=_this.data.orderNo
        }else{
          var cartNo=_this.data.cartNo
        }
        return {
          title: _this.data.shopname,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityjl/activityjl&activityNo=' + _this.data.activityNo + '&cartNo=' + cartNo + '&isshare=' + _this.data.isshare,
          imageUrl:img
        }
  
      }else if(_this.data.activityType == '3'){
        return {
          title: _this.data.shopname,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitydy-details/index&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=' + _this.data.isshare,
          imageUrl:img
        }
      }else if(_this.data.activityType == '2'){
        return {
          title: _this.data.shopname,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/index-child/pages/activitylb-details/index&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=' + _this.data.isshare,
          imageUrl:img
        }
      }else{
        return {
          title: '壹叁新消费,实惠又方便',
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/product-act-details/product-act-details&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=' + _this.data.isshare+'&shopType=' + _this.data.type+'&activityType='+_this.data.activityType,
          imageUrl:img
        }
      }
    }else{
      if(_this.data.goodsNo){
        return{
          title: '壹叁新消费,实惠又方便',
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
          imageUrl:img
        }
      }else{
        return{
          title: '壹叁新消费,实惠又方便',
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shop/shop&shopNo=' + _this.data.shopNo,
          imageUrl:img
        }
      
    }
  }
  },
    getLikeGoodsPage() {
      let that = this;
      let params = {
        userId: wx.getStorageSync('userId'),
        type: that.data.shopType,
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
  /**
   * 点击查看活动单
   */
  toActivity() {
    if(this.data.activityType=='2'||this.data.activityType=='3'){
      wx.navigateTo({
        url:'/pages/order/order?index=3&status=1'
      })
    }else{
      wx.navigateTo({
        url: '/pages/user-child/pages/activity/activity',
      })
    }
  },
    /**
   *  点击查看礼包和代言订单
   */
  handleStatus() {
    
  },
  /**点击查看普通商品订单 */
  toOrder() {
    //判断商品的店铺类型是优店还是网店
    // if ((this.data.shopType == 1 || this.data.shopType == 2) && this.data.len != 1) {
    //   wx.navigateTo({
    //     url: '/pages/order/order?status=-1',
    //   })
    // } else if ((this.data.activityType == 2 || this.data.activityType == 3 || this.data.activityType == 4) && this.data.shopType == 1) {
    //   wx.navigateTo({
    //     url: '../order-details/order-details?shopNo=' + this.data.shopNo + '&orderNo=' + this.data.cartNo,
    //   })
    // } else if ((this.data.activityType == 2 || this.data.activityType == 3 || this.data.activityType == 4) && this.data.shopType == 2) {
    //   wx.navigateTo({
    //     url: '../orderYo-details/index?shopNo=' + this.data.shopNo + '&orderNo=' + this.data.cartNo,
    //   })
    // } else if (this.data.shopType == 1 && this.data.len == 1) {
    //   wx.navigateTo({
    //     url: '../order-details/order-details?shopNo=' + this.data.shopNo + '&orderNo=' + this.data.cartNo,
    //   })
    // } else if (this.data.shopType == 2 && this.data.len == 1) {
    //   wx.navigateTo({
    //     url: '../orderYo-details/index?shopNo=' + this.data.shopNo + '&orderNo=' + this.data.cartNo,
    //   })
    // }
    if(this.data.shopType==1){
      wx.reLaunch({
        url: '/pages/order/order?status=1'+'&index=3',
      })
    }else{
      wx.reLaunch({
        url: '/pages/order/order?status=-2'+'&index=1',
      })
    }
  },
  /**点击返回首页 */
  toHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  /**查看商品详情 */
  toGoodsDetails(e) {
    let _this = this;
    let goodsNo = e.currentTarget.dataset.goodsno
    if(_this.data.shopType == '1'){
      wx.navigateTo({
        url: '../shopping-details/shopping-details?goodsNo=' + goodsNo,
      })
    }else {
      wx.navigateTo({
        url: '../product-details/product-details?goodsNo=' + goodsNo,
      })
    }
  }
})
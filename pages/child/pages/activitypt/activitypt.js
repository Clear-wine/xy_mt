// pages/child/pages/activitypt/activitypt.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
// var util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iscomplete: 1, //1是成团 2是未成团 是否完成拼团
    personList: [],
    isshare: 0, //isshare = 0, 表示不是从分享进入, isshare = 1 表示是从分享进入
    conut_down: 1, // 0活动时间结束 1活动正在进行
    showDialog: true, //是否活动结束/失败
    statusTitle: '',
    userType: '1', //1发起者 2参与者
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('传参=======>',options)
    if (options.isshare == 1) {
      console.log('是分享进去的');
      this.setData({
        'isshare': options.isshare
      })
    }
    this.setData({
      activityNo: options.activityNo,
      cartNo: options.cartNo
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 进入页面判断活动的状态
    this.setData({
      statusTitle: this.data.statusTitle,
      showDialog: this.data.showDialog
    })
     if(wx.getStorageSync('userId')){
      //获取拼团活动页面详情
    this.getCollageActivity()
    }
    
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
    this.getCollageActivity()
  },
  // onUnload() {
  //   if (this.data.isshare) {
  //     wx.switchTab({
  //       url: '/pages/index/index',
  //     })
  //   }
  // },
  getCollageActivity() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      // cartNo: _this.data.cartNo,
      // activityNo: _this.data.activityNo
      activityOrderNo:_this.data.cartNo
    }
    requestUtil.Requests('activity/collage/queryJoinDetail', params).then((res) => {
      console.log("数据======>",res)
      let data = res.data;

      _this.setData({
        collageData: data,
        join:data.join, //当前用户是否可以参团(true为可以,false为不可以)
        orderStatus:data.orderStatus,//该团的状态1为进行中,2为成功,3为失败
        status:data.status, //总活动状态1为进行中,2为结束
        endDate:data.endDate, //结束时间
        
      })
      _this.countTime();
    })
  },
  countTime() {
    // 
    let that = this;
    var conut_down = 1;
    //计算目标与现在时间差(毫秒)
    let endDates = that.data.endDate.replace(/-/g, "/");
    let endtime = new Date(endDates).getTime(); //结束时间
    let nowtime = new Date().getTime(); //当前时间
    // nowtime = nowtime + 1000
    var leftTime = endtime - nowtime;
    var d, h, m, s, ms;
    if (leftTime > 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      d = d < 10 ? "0" + d : d
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h
      conut_down = 1; //未到时间
      that.setData({
        countdown: h + "：" + m + "：" + s,
        conut_down: conut_down,
        d:d,
        s:s,
        m:m,
        h:h
      })
      //递归每秒调用countTime方法，显示动态时间效果
      setTimeout(function() {
        // leftTime -= 1000;
        that.countTime();
      }, 1000);
    } else {
      console.log('已截止')
      conut_down = 0; //已到时间
      that.setData({
        countdown: '00:00:00',
        conut_down: conut_down
      })
    }
    if (conut_down === 0 && that.data.iscomplete === 2) { //活动失败
      that.data.statusTitle = '活动失败~'
      that.data.showDialog = false
      //更改活动订单状态为活动失败
      that.updateActivityStatus()
    } else if (conut_down === 1 && that.data.iscomplete === 1 && that.data.isjoinUser == false) {
      that.data.statusTitle = '活动已结束~'
      that.data.showDialog = false
    } else {
      that.data.showDialog = true
    }
    that.setData({
      statusTitle: that.data.statusTitle,
      showDialog: that.data.showDialog

    })
  },
  updateActivityStatus() {
    let _this = this;
    let params = {
      cartNo: _this.data.cartNo,
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('cart/updateActivityCartStatus', params).then((res) => {
      console.log(res.data, '活动失败了!!!')
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let _this = this;
    let shareId = wx.getStorageSync('userId');
    return {
      title: _this.data.collageData.goodsName,
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activitypt/activitypt&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=1' + '&shopType=' + _this.data.collageData.shopType,
      imageUrl: _this.data.collageData.imgPath,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  /**
   * 查看拼团活动详情
   */
  handleActivityDetail(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    let activityNo = e.currentTarget.dataset.activityno;
    // let type = e.currentTarget.dataset.shoptype;
    if (this.data.collageData.shopType == 1){
      wx.navigateTo({
        url: '../activity-details/activity-details?goodsNo=' + goodsNo + '&activityNo=' + activityNo + '&activityType=5' + '&type=' + this.data.collageData.shopType,
      })
    }else{
      wx.navigateTo({
        url: '../product-act-details/product-act-details?goodsNo=' + goodsNo + '&activityNo=' + activityNo + '&activityType=5' + '&type=' + this.data.collageData.shopType,
      })
    }

  },
  /**
   * 拼团结束或失败查看订单
   */
  checkOrder() {
    wx.navigateTo({
      url: '/pages/user-child/pages/activity/activity',
    })
  },
  /**
   * 回到首页(分享的时候)
   */
  backHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  /**
   *参与拼团
   */
  handlejoinActivity() {
    let activityOrderNo=this.data.cartNo
    let activityNo=this.data.activityNo
    let type = this.data.collageData.shopType
    if (type == 1) {
      wx.navigateTo({
        url: '/pages/index-child/pages/activitypt-details/index?activityNo='+activityNo+'&activityOrderNo='+activityOrderNo
      })
    } else {
      wx.navigateTo({
        url: '../product-act-details/product-act-details?goodsNo=' + goodsNo + '&activityNo=' + activityNo + '&activityType=' + activityType + '&type=' + type + '&activityUser=' + this.data.activityUser + '&cartNo=' + this.data.cartNo,
      })
    }

  },
  /**查看订单 */
  toOrder() {
    let _this = this;
    let shopNo = _this.data.collageData.shopNo;
    let orderNo = _this.data.collageData.orderNo
    wx.navigateTo({
      //url: '../order-details/order-details?shopNo=' + shopNo + '&orderNo=' + orderNo
      url:'/pages/order/order?index=3&status=1'
    })
  },
  //去参加活动(去活动列表)
  gohuodong(){
    wx.navigateTo({
      url: '/pages/index-child/pages/ptlist/index'
    })
  },
  //去参团
  gocantuan(){
    wx.navigateTo({
      url: '/pages/index-child/pages/activitypt-details/index?activityNo='+this.data.activityNo
    })
  },
  //去活动介绍
  gojieshao(){
    wx.navigateTo({
      url: '/pages/index-child/pages/playmethod/index?type=5'
    })
  },
})
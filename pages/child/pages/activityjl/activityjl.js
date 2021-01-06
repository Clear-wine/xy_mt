// pages/child/pages/activityjl/activityjl.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
// var util = require('../../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // list: [],
    isshare: 0, //isshare = 0, 表示不是从分享进入, isshare = 1 表示是从分享进入
    issucceed: 1, // 1 接龙成功 2 接龙为失败
    headUserId: '', //龙头用户
    joinStatus: '1', //参加接龙成功 1 参加接龙失败 2
    stockNo: '',
    conut_down: 1, // 0活动时间结束 1活动正在进行
    showDialog: true, //是否活动结束/失败
    statusTitle: '',
    isjoinUser: '',
    list1:[{id:1,yc:true,zhqj:true},{id:2,yc:true,zhqj:true},{id:3,yc:true,zhqj:true},{id:4,yc:true,qj:true,zhqj:true},{id:8,qjyc:true,yc:true,qj:true,zhqj:true},{id:7,qjyc:true,yc:true,zhqj:true},{id:6,qjyc:true,yc:true,zhqj:true},{id:5,qjyc:true,yc:true,zhqj:true},{id:9,yc:true,zhqj:true},{id:10,yc:true,zhqj:true},{id:11,yc:true,zhqj:true},{id:12,yc:true,qj:true,zhqj:true},{id:16,yc:true,qjyc:true,zhqj:false},{id:15,yc:true,qjyc:true,zhqj:true},{id:14,yc:true,qjyc:true,zhqj:true},{id:13,yc:true,qjyc:true,zhqj:true}],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('接龙购参数====>',options)
    if (options.isshare == 1) {
      console.log('是分享进去的');
      this.setData({
        'isshare': options.isshare,
      })
    }
    console.log("参数参数",options.cartNo)
    this.setData({
      activityNo: options.activityNo,
      cartNo: options.cartNo
    })
    wx.setStorageSync('cartNo', options.cartNo)

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
    console.log("授权完成", wx.getStorageSync('userId'))
    //获取接龙活动页面详情
    this.getChainsActivity()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 
    // 进入页面判断活动的状态
    this.setData({
      statusTitle: this.data.statusTitle,
      showDialog: this.data.showDialog
    })
     if(wx.getStorageSync('userId')){
            //获取接龙活动页面详情
    this.getChainsActivity()
     }       
  },
  // onUnload(){
  //   if(this.data.isshare){
  //     wx.switchTab({
  //       url: '/pages/index/index',
  //     })
  //   }
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let _this = this;
    console.log('_this.data.chainsData.activityName',_this.data.chainsData.activityName)
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'button') {
      return {
        title: _this.data.chainsData.activityName,
        path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityjl/activityjl&activityNo=' + _this.data.activityNo + '&cartNo=' + _this.data.cartNo + '&isshare=1' + '&shopType=' + _this.data.chainsData.shopType,
        imageUrl: _this.data.chainsData.imgPath,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }
  },
  getChainsActivity() {
    let _this = this;
    let list=_this.data.list1
    let params = {
      activityOrderNo: _this.data.cartNo,
      userId: wx.getStorageSync('userId'),
      shareUserId:wx.getStorageSync('shareUserId')
    }
    console.log(params)
    requestUtil.Requests('activity/chains/queryJoinDetail', params).then((res) => {
      console.log("接龙购请求的数据",res,data)
      let data = res.data;
      let join=data.joinList;
      list.forEach(item=>{
        if(item.id>data.chainsPersonNum){
          item.yc=false
        }else if(item.id==data.chainsPersonNum){
          item.zhqj=false
        }
      })
      join.forEach(item=>{
        item.ps=true;
      })
      var obj = list.map((item,index) => {
        return {...item, ...join[index]};
    });
    console.log(obj)
      //进度条的长度计算(总需要人数除以已助力人数取百分比)
      let cd=Number(data.joinList.length)/Number(data.chainsPersonNum)*100
      let jdwidth=cd.toFixed(2)
      var ifjl = join.some(function(item) {
        if (item.userId == wx.getStorageSync('userId')) {
            return true;
        }
      })
    console.log(wx.getStorageSync('userId'))  
    console.log("status==",data.status,"orderStatus==",data.orderStatus,"join==",data.join,"ifjl==",ifjl)
      _this.setData({
        chainsData: data,
        endDate: data.endDate, //结束时间
        list1:obj,
        jdwidth:jdwidth,
        join:data.join, //当前用户是否可以参团(true为可以,false为不可以)
        orderStatus: data.orderStatus, //该团的状态1为进行中,2为成功,3为失败
        status: data.status, //总活动状态1为进行中,2为结束
        ifjl:ifjl,//判断该人员是否已经接龙 true为已接,false为未接
      })
      //_this.getActivityDetail();
      _this.countTime();
    })
  },  
  countTime() {
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
        countdown: d+" : "+h + "：" + m + "：" + s,
        conut_down: conut_down
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
    if (conut_down == 0 && that.data.issucceed == 2) { //活动失败
      that.data.statusTitle = '活动失败~'
      that.data.showDialog = false
      //更改活动订单状态为活动失败
      that.updateActivityStatus()
    } else if (conut_down == 1 && that.data.issucceed == 1 && !that.data.joinActivity) {
      that.data.statusTitle = '活动已结束~'
      that.data.showDialog = false
    } else if (conut_down == 0 && that.data.issucceed == 1 && !that.data.joinActivity) {
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

  getActivityDetail() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      type: _this.data.chainsData.shopType,
      activityType: '4',
      activityNo: _this.data.chainsData.activityNo,
      sourceType: 'wx'
    }
    requestUtil.Requests('product/queryActivityDetail', params).then((res) => {
      let stockList = res.data.activityDetailBean.goodsBean.stockList //所有的规格组合
      _this.setData({
        stockList: stockList
      })
    })
  },
  /**
   * 加入接龙
   */
  joinChainsActivity() {
    let activityOrderNo=this.data.cartNo
    let activityNo=this.data.activityNo
    wx.navigateTo({
      url: '/pages/index-child/pages/activityjl-details/index?activityNo='+activityNo+'&activityOrderNo='+activityOrderNo
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
   * 接龙完成 购买商品
   */
  payChainsActivity() {
    let _this = this;
    let userType = '';
    if (_this.data.activityUser === true) {
      userType = '1'
    } else {
      userType = '2'
    }
    let stockNo = '';
    let price = '';
    let userId = wx.getStorageSync('userId');
    let formUserId = wx.getStorageSync('formUserId');
    _this.data.personList.forEach(el => {
      if (userId == el.userId) {
        stockNo = el.stockNo;
        price = el.chainsPrice
      }
    })
    wx.navigateTo({
      url: '../submit-order/submit-order?type=' + _this.data.chainsData.shopType + '&stockNo=' + stockNo + '&price=' + price + '&activityType=4' + '&activityNo=' + _this.data.activityNo + '&userIdType=' + userType,
    })
  },
  /**查看订单 */
  checkOrder() {
    let _this = this;
    let shopNo = _this.data.chainsData.shopNo;
    let orderNo = _this.data.chainsData.orderNo
    wx.navigateTo({
      url: '../order-details/order-details?shopNo=' + shopNo + '&orderNo=' + orderNo
    })
  },
  /** 查看活动介绍 */
  activityMsg() {
    wx.navigateTo({
      url: '/pages/index-child/pages/playmethod/index?type=4'
    })
  },
  /**新增一条接龙活动*/
  addActivity() {
    let _this = this;
    if (_this.data.chainsData.shopType == 1) {
      wx.navigateTo({
        url: '../activity-details/activity-details?activityType=4' + '&activityNo=' + _this.data.activityNo + '&type=' + _this.data.chainsData.shopType + '&goodsNo=' + _this.data.chainsData.goodsNo
      })
    } else {
      wx.navigateTo({
        url: '../product-act-details/product-act-details?activityType=4' + '&activityNo=' + _this.data.activityNo + '&type=' + _this.data.chainsData.shopType + '&goodsNo=' + _this.data.chainsData.goodsNo
      })
    }
  },
  //去参团
  gocantuan(){
    wx.navigateTo({
      url: '/pages/index-child/pages/activityjl-details/index?activityNo='+this.data.activityNo
    })
  },
  //去参加活动(去活动列表)
  gohuodong(){
    wx.navigateTo({
      url: '/pages/index-child/pages/jllist/index'
    })
  },
  /**查看订单 */
  toOrder() {
    wx.navigateTo({
      //url: '../order-details/order-details?shopNo=' + shopNo + '&orderNo=' + orderNo
      url:'/pages/order/order?index=3&status=1'
    })
  }, 
})
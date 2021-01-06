// pages/user-child/pages/activity/activity.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    page: 1,
    pageSize: 10,
    orderteb: [{
        tebtitle: "我发起的",
        index: "0",
        type: "2"
      },
      {
        tebtitle: "我参与的",
        index: "1",
        type: "1"
      },
      {
        tebtitle: "我的佣金",
        index: "2",
        type: "3"
      }
    ],
    type: "2", //1:我参与的 2：我发起的
    countDownList: [],
    actEndTimeList: [],
    isactivity: false,
    isshare: 1, //isshare = 0, 表示不是从分享进入, isshare = 1 表示是从分享进入
    activityData: [], //订单数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.type) {
      this.setData({
        type: options.type,
      })
    }
     if(wx.getStorageSync('userId')){
      //获取活动订单
    this.getActivityPage()
    }
  },
  onShow: function() {
    let that = this;
    let query = wx.createSelectorQuery().in(this)
    query.select('.title').boundingClientRect(function(res) {
      //得到head头高度
      let headHeight = res.height
      console.log(headHeight + '顶部高度')
      //scroll-view的高度 = 屏幕高度 - tabbar高(30) -10 -10 -headHeight
      //获取屏幕可用高度
      let screenHeight = wx.getSystemInfoSync().windowHeight
      //计算 scroll-view 的高度
      let scrollHeight = screenHeight - headHeight - 20
      that.setData({
        scrollHeight: scrollHeight,
        headHeight: headHeight
      })
    }).exec()
  },
  //获取我发起的数据
  getActivityPage() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      // type: _this.data.type,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_order/queryLaunchPage', params, _this.data.activityData).then((res) => {
      console.log("我发起的",res)
      if(res.data.length != 0) {
        let data = res.data
        let endTimeList = []; //活动结束时间数组
        if (data.length != 0) {

          var newtimes = data[0].currentDate
          data.forEach(el => {
            endTimeList.push(el.endDate)
            switch (el.activityType) {
              case '1':
                el.activityTypeName = '助力购';
                break;
              case '2':
                el.activityTypeName = '大礼包';
                break;
              case '3':
                el.activityTypeName = '代言购';
                break;
              case '4':
                el.activityTypeName = '接龙购';
                break;
              case '5':
                el.activityTypeName = '拼团购';
            }
          })
        }
        console.log(endTimeList, newtimes + '==================')
        _this.setData({
          activityData: res.data,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData,
          actEndTimeList: endTimeList, //活动结束时间数组
          newtimes: newtimes, //服务器当前时间
        })
        //执行倒计时函数
        _this.countDown();
      }else{
        _this.setData({
          activityData: res.data,
        })
      }
    })
  },
  //获取我参与的活动
  getqueryParticipatePage() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      // type: _this.data.type,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_order/queryParticipatePage', params, _this.data.activityData).then((res) => {
      console.log("我参与的",res)
      if(res.data.length != 0) {
        let data = res.data
        let endTimeList = []; //活动结束时间数组
        if (data.length != 0) {

          var newtimes = data[0].currentDate
          data.forEach(el => {
            endTimeList.push(el.endDate)
            switch (el.activityType) {
              case '1':
                el.activityTypeName = '助力购';
                break;
              case '2':
                el.activityTypeName = '大礼包';
                break;
              case '3':
                el.activityTypeName = '代言购';
                break;
              case '4':
                el.activityTypeName = '接龙购';
                break;
              case '5':
                el.activityTypeName = '拼团购';
            }
          })
        }
        console.log(endTimeList, newtimes + '==================')
        _this.setData({
          activityData: res.data,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData,
          actEndTimeList: endTimeList, //活动结束时间数组
        })
        //执行倒计时函数
        _this.countDown();
        
      }else{
        _this.setData({
          activityData: res.data,
        })
      }
    })
  },
  //获取我的佣金
  getwodeyongjin() {
    let _this = this;
    let params = {
      userId:wx.getStorageSync('userId'),
      // type: _this.data.type,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('activity/ac_order/queryAdvertiseOrder', params, _this.data.activityData).then((res) => {
      console.log("我的佣金",res)
      if(res.data.length != 0) {
        let data = res.data
        let endTimeList = []; //活动结束时间数组
        if (data.length != 0) {

          var newtimes = data[0].currentDate
          data.forEach(el => {
            endTimeList.push(el.endDate)
            switch (el.activityType) {
              case '1':
                el.activityTypeName = '助力购';
                break;
              case '2':
                el.activityTypeName = '大礼包';
                break;
              case '3':
                el.activityTypeName = '代言购';
                break;
              case '4':
                el.activityTypeName = '接龙购';
                break;
              case '5':
                el.activityTypeName = '拼团购';
            }
          })
        }
        console.log(endTimeList, newtimes + '==================')
        _this.setData({
          activityData: res.data,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData,
          actEndTimeList: endTimeList, //活动结束时间数组
        })
        //执行倒计时函数
        _this.countDown();
        
      }else{
        _this.setData({
          activityData: res.data,
        })
      }
    })
  },
  /**
   * 小于10的格式化函数
   */
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },
  /**
   * 倒计时函数
   */
  countDown() {
    //获取当前时间,同时得到活动结束时间数组
    let _v = this;
    let newTime = new Date().getTime(); //当前时间
    let endTimeList = _v.data.actEndTimeList;
    let countDownArr = [];
    //结束时间进行处理渲染到页面
    endTimeList.forEach((el, e) => {
      let endTimeall = el.replace(/-/g, "/");
      let endTime = new Date(endTimeall).getTime();
      let obj = null;
      //如果活动未结束,对时间进行处理
      if (endTime - newTime > 0) {
        let time = (endTime - newTime) / 1000;
        //获取天/时/分/秒
        let day = parseInt(time / (60 * 60 * 24));
        let hou = parseInt(time % (60 * 60 * 24) / 3600);
        let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
        let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
        obj = {
          day: _v.timeFormat(day),
          hou: _v.timeFormat(hou),
          min: _v.timeFormat(min),
          sec: _v.timeFormat(sec)
        }
        _v.data.activityData[e].isactivity = false;

      } else { //活动已结束,全部设置为'00'
        obj = {
          day: '00',
          hou: '00',
          min: '00',
          sec: '00'
        }
        _v.data.activityData[e].isactivity = true;
      }
      _v.data.activityData[e].obj = obj;
    })

    //渲染,然后每隔一秒执行一次倒计时函数
    _v.setData({
      activityData: _v.data.activityData
    })
    setTimeout(function(){
      _v.countDown()
    },1000);
  },
  //swiper切换时会调用
  pagechange: function(e) {
    var _this = this;
    if ("touch" === e.detail.source) {
      // let currentPageIndex = _this.data.currentIndex
      // currentPageIndex = (currentPageIndex + 1) % 2
      _this.setData({
        currentIndex: e.detail.current
      })
    }
  },
  //用户点击tab时调用
  titleClick: function(e) {
    var that = this;
    if (that.data.currentIndex == e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        //拿到当前索引并动态改变
        currentIndex: e.currentTarget.dataset.current,
        type: e.currentTarget.dataset.type
      }, function() {
        that.data.page = 1;
        that.data.activityData = [] //订单数组
        if(that.data.type==2){
          that.getActivityPage()
        }else if(that.data.type==1){
          that.getqueryParticipatePage()
        }else if(that.data.type==3){
          that.getwodeyongjin()
        }
      })

    }

  },
  // 截获竖向滑动
  catchTouchMove: function(res) {
    return false
  },
  // 点击查看订单或分享
  handleActivity(e) {
    let _this = this;
    let activityNo = e.currentTarget.dataset.activityno;
    let cartNo = e.currentTarget.dataset.cartno
    let activityType = e.currentTarget.dataset.activitytype
    let uid = e.currentTarget.dataset.userid
    console.log(e)
    // 判断该活动的类型,并点击跳转
    if (activityType == '1') { //助力活动
      wx.navigateTo({
        url: '/pages/child/pages/activityzl/activityzl?activityNo=' + activityNo + '&cartNo=' + cartNo+'&faqi=2&userId=' +  uid,
      })
    } else if (activityType == '5') { //拼团
      wx.navigateTo({
        url: '/pages/child/pages/activitypt/activitypt?activityNo=' + activityNo + '&cartNo=' + cartNo+'&faqi=2',
      })
    } else if (activityType == '4') { //接龙
      wx.navigateTo({
        url: '/pages/child/pages/activityjl/activityjl?activityNo=' + activityNo + '&cartNo=' + cartNo+'&faqi=2',
      })

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
    //获取活动订单
    this.getActivityPage()
  },
  share(e){
    console.log(e.dataset)
    this.setData({
      dataset:e.dataset
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    let _this = this;
    let shareId = wx.getStorageSync('userId')
    let activityNo = res.target.dataset.activityno; // 活动编码
    let cartNo = res.target.dataset.cartno; //订单编码
    let activityType = res.target.dataset.activitytype; //活动类型
    let shopType = res.target.dataset.shoptype; //店铺类型
    let goodsName = res.target.dataset.goodsname;//商品名称
    let imgPath = res.target.dataset.imgpath
    console.log(res)
    if (res.from === 'button') {
      //来自页面内的转发按钮
      if (activityType == '1') { //助力活动
        return {
          title: goodsName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityzl/activityzl&activityNo=' + activityNo + '&cartNo=' + cartNo + '&isshare=' + _this.data.isshare + '&shopType=' + shopType,
          imageUrl:imgPath
        }
      } else if (activityType == '5') {
        return {
          title: goodsName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activitypt/activitypt&activityNo=' + activityNo + '&cartNo=' + cartNo + '&isshare=' + _this.data.isshare + '&shopType=' + shopType,
          imageUrl: imgPath
        }
      } else if (activityType == '4') {
        return {
          title: goodsName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/activityjl/activityjl&activityNo=' + activityNo + '&cartNo=' + cartNo + '&isshare=' + _this.data.isshare + '&shopType=' + shopType,
          imageUrl: imgPath
        }
  
      }  
    }
  },
  /**
   * 向下滑 刷新  加载数据
   */
  handleupper() {
    let that=this;
    that.data.page = 1;
    if(that.data.type==2){
      that.getActivityPage()
    }else if(that.data.type==1){
      that.getqueryParticipatePage()
    }
  },
  /**向上滑 加载数据 */
  handlelower() {
    let that = this;
    if (that.data.hasMoreData) {
      if(that.data.type==2){
        that.getActivityPage()
      }else if(that.data.type==1){
        that.getqueryParticipatePage()
      }
    }
  }
})
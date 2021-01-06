// pages/child/pages/nearbyActivity/nearbyActivity.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    mask2Hidden: true,
    mask3Hidden: true,
    allType: "综合排序",
    allActivity: "全部活动",
    sortList: [ //全部活动 
      {
        sort: '助力购',
        activityType: '1'
      },
      {
        sort: '大礼包',
        activityType: '2'
      },
      {
        sort: '代言购',
        activityType: '3'
      },
      {
        sort: '接龙购',
        activityType: '4'
      },
      {
        sort: '拼团购',
        activityType: '5'
      }
    ],
    allTypelist: [ //排序类型
      {
        allName: '离我最近',
        sortType: '1'
      },
      {
        allName: '价格从低到高',
        sortType: '2'
      },
      {
        allName: '价格从高到低',
        sortType: '3'
      }

    ],
    activityType: '-1', //活动类型
    sortType: '1', //综合排序
    page: 1,
    pageSize: 10,
    goodslist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
     if(wx.getStorageSync('userId')){
      //获取附近活动分页列表
    this.getNearActivity()
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
    this.getNearActivity()
  },
  // 分享
  onShareAppMessage() {
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'button') {}
    return {
      title: '壹叁新消费',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/nearbyActivity/nearbyActivity' + '&isshare=1' + '&noparam=1',
      success: function(res) {}
    }

  },
  getNearActivity() {
    let _this = this;
    let params = {
      lat: wx.getStorageSync('latitude'),
      lon: wx.getStorageSync('longitude'),
      activityType: _this.data.activityType,
      sortType: _this.data.sortType,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('product/getIndexYoActivityPage', params, _this.data.goodslist).then((res) => {
      let data = res.data;
      data.forEach((item) => {
        switch (item.activityType) {
          case '1':
            item.activityTypeName = '助力';
            item.actPrice = item.lowPrice
            break;
          case '2':
            item.activityTypeName = '礼包';
            item.actPrice = item.giftPacksPrice

            break;
          case '3':
            item.activityTypeName = '代言';
            item.actPrice = item.price

            break;
          case '4':
            item.activityTypeName = '接龙';
            item.actPrice = item.chainsHeadPrice

            break;
          case '5':
            item.activityTypeName = '拼团';
            item.actPrice = item.collagePrice

        }
      })
      _this.setData({
        hasMoreData: res.pageParam.hasMoreData,
        page: res.pageParam.page,
        goodslist: res.data
      })
    })
  },
  // 点击查看活动详情
  handleToDetails(e) {
    let goodsNo = e.currentTarget.dataset.goodsno;
    let activityNo = e.currentTarget.dataset.activityno;
    let activityType = e.currentTarget.dataset.activitytype;
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../product-act-details/product-act-details?goodsNo='+ goodsNo + '&activityNo=' + activityNo + '&activityType=' + activityType + '&type='+ type,
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    that.getNearActivity()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.hasMoreData) {
      that.getNearActivity()
    } else {
      that.setData({
        hasMoreData: !that.data.hasMoreData
      })
    }
  },
  mask2Cancel: function() {
    this.setData({
      mask2Hidden: true
    })
  },
  mask3Cancel: function() {
    this.setData({
      mask3Hidden: true
    })
  },
  onOverallTag: function() {
    this.setData({
      mask2Hidden: false
    })
  },
  onFilter: function() {
    this.setData({
      mask3Hidden: false
    })
  },
  /*点击获取活动类型*/
  sortSelected(e) {
    let _this = this;
    let activityType = e.currentTarget.dataset.type
    _this.setData({
      activityType: activityType
    }, function() {
      _this.getNearActivity()
    })
  },
  /**点击获取综合排序 */
  allSelected(e) {
    let _this = this;
    let sortType = e.currentTarget.dataset.type
    _this.setData({
      sortType: sortType
    }, function() {
      _this.getNearActivity()
    })
  }
})
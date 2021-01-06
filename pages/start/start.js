var util = require('../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
 
  //获取导航栏信息
  getNavigation() {
    let _this = this;
    let data = {
      type: 2
    }
    util.Requests('product/queryNavigation', data).then((res) => {
      let navlist = res.data
      console.log("navlist===>",navlist)
      navlist.forEach(item => {
        if (item.name === "首页") {
          let homelist = item.list
          let industryNaviId = item.list[0].id;
          _this.getcontent(industryNaviId)
          wx.setStorageSync('section', homelist);
          wx.setStorageSync('industryNaviId', industryNaviId);
        }
      })
    })
  },
  //获取首页第一页轮播图等信息
  getcontent(id){
    let params = {
      industryNaviId: id,
      categoryType: id
    }
    util.Requests('product/queryBannerAndActivity', params).then((res) => {
      // _this.setData({
      //   activityMenuList: res.data.activityMenuList, //活动列表
      //   noticeList: res.data.noticeList, //公告列表
      //   bannerList: res.data.bannerList //轮播图列表
      // })
      console.log(res)
      wx.setStorageSync('activityMenuList',  res.data.activityMenuList);//活动列表
      wx.setStorageSync('noticeList',  res.data.noticeList);//公告列表
      wx.setStorageSync('bannerList',  res.data.bannerList);//轮播图列表
    })
  },

  //获取用户会员等级
  queryUserById() {
      let params = {
        userId: wx.getStorageSync('userId')
      }
      util.Requests('user/queryUserById', params).then((res) => {
        console.log("会员等级",res)
        wx.setStorageSync('vipRate', res.data.rate);//会员分润率
        wx.setStorageSync('vipGrade', res.data.grade); //会员等级
      })
  },
  //获取人气推荐与热卖top3的商品
  getqueryTopList() {
    let params={};
    util.Requests('product/queryTopList', params).then((res) => {
      let list=res.data.hotBuyList;
      console.log("人气和热卖=====>",res.data.popularList,list)
      wx.setStorageSync('popularList',  res.data.popularList);//人气推荐
      wx.setStorageSync('hotBuyList', list); //热卖top3
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getNavigation()
    this.getqueryTopList()
    console.log("从分享进来的数据", options)
    var sharePerson = options.userId;
    var returnUrl = options.url;
    var activityNo = options.activityNo;
    var cartNo = options.cartNo;
    var isshare = options.isshare
    var activityType = options.activityType; //活动类型
    var goodsNo = options.goodsNo; //商品编码
    var type = options.shopType; //店铺类型
    var shopNo = options.shopNo // 店铺编码
    var noparam = options.noparam
    if (sharePerson == undefined) {
      sharePerson = "";
    }
    if (returnUrl == undefined || returnUrl == '') {
      returnUrl = '/pages/index/index';
    }
    
    //保存到缓存中
    wx.setStorageSync('returnUrl', returnUrl);
    wx.setStorageSync('activityNo', activityNo);
    wx.setStorageSync('cartNo', cartNo);
    wx.setStorageSync('isshare', isshare)
    wx.setStorageSync('activityType', activityType);
    wx.setStorageSync('goodsNo', goodsNo);
    wx.setStorageSync('type', type);
    wx.setStorageSync('shareUserId', sharePerson);
    //登录
    wx.login({
      success: res => {
        //wx.login获取code
        if (res.code) {
          wx.request({
            url: app.globalData.requestPath + 'user/auth',
            method: 'POST',
            data: {
              code: res.code //将code发送到后台服务器
            },
            header: { 
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: result => {
              console.log("登录数据==========>",result);
              wx.setStorageSync('unionid', result.data.unionid); //将unionid存入本地缓存,这是app和小程序之间的唯一标识
              wx.setStorageSync('openId', result.data.openId); //将openId存入本地缓存
              wx.setStorageSync('authFlag', result.data.authFlag); //将用户是否授权登录过的标识       
              wx.setStorageSync('sessionKey', result.data.sessionKey) //用户的sessionKey
              wx.setStorageSync('userId', result.data.userId); //用户授权获取用户信息
              // wx.setStorageSync('sharePerson', sharePerson); //分享者的openId
              var authFlag = wx.getStorageSync('authFlag');
              var openId = wx.getStorageSync('openId')
              let userId = wx.getStorageSync('userId');
              if(userId){
                this.queryUserById()
              }
              // that.setData({
              //   sharePerson: sharePerson,
              //   authFlag: authFlag,
              //   userId: userId
              // });
              // if (!userId) { //如果未授权,并且是分享出来的有分享人的userId
              //   setTimeout(function() {
              //     wx.reLaunch({
              //       url: returnUrl + "?type=" + type + '&activityType=' + activityType + '&isshare=' + isshare + '&goodsNo=' + goodsNo + "&activityNo=" + activityNo + '&cartNo=' + cartNo,
              //     })
              //   }, 1000);
              // } else if (!authFlag && returnUrl.indexOf("index") >= 0) {
              //   setTimeout(function() {
              //     wx.switchTab({
              //       url: returnUrl,
              //     })
              //   })
              // } else { //用户已经授权
                if (returnUrl.indexOf("index/index") >= 0) { //判断retrunUrl中是否包含index
                  //跳转到首页               
                  setTimeout(function() {
                    wx.switchTab({
                      url: returnUrl
                    })
                  }, 1000)
                } else if (activityType == '3' || activityType === '2') {
                  //跳转到对应的分享页
                  setTimeout(function() {
                    wx.reLaunch({
                      url: returnUrl + "?type=" + type + '&activityType=' + activityType + '&isshare=' + isshare + '&goodsNo=' + goodsNo + "&activityNo=" + activityNo,
                    })
                  }, 1000);
                } else if (activityNo) {
                  //跳转到对应的分享页
                  setTimeout(function() {
                    wx.redirectTo({
                      url: returnUrl + "?activityNo=" + activityNo + '&cartNo=' + cartNo + '&isshare=' + isshare + '&goodsNo=' + goodsNo + "&type=" + type + '&activityType=' + activityType,
                    })
                  }, 1000);
                } else if (shopNo) { // 店铺分享
                  setTimeout(function() {
                    wx.redirectTo({
                      url: returnUrl + '?isshare=' + isshare + '&shopNo=' + shopNo,
                    })
                  }, 1000);
                } else if (noparam) { //列表分享
                  setTimeout(function() {
                    wx.reLaunch({
                      url: returnUrl + '?isshare=' + isshare
                    })
                  }, 1000);

                } else { // 普通商品详情
                  setTimeout(function() {
                    wx.redirectTo({
                      url: returnUrl + '?isshare=' + isshare + '&goodsNo=' + goodsNo,
                    })
                  }, 1000);
                }
              // }
            },
            fail: function(res) {              
              wx.showToast({
                title: '初始化数据失败',
              })
            }
          })
        } else {
          console.log("获取用户登录状态失败!" + res.errMsg)
        }
      }
    })

  },
  imageLoad: function(e) {
    var $width = e.detail.width, //获取图片真实宽度
      $height = e.detail.height,
      // 图片的真实宽高比例
      ratio = $width / $height;
    var viewWidth = 750, //设置图片显示宽度，左右留有16rpx边距
      //计算的高度值
      viewHeight = 718 / ratio;
    var image = this.data.images;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  }
})
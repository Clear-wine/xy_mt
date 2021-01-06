//app.js
var QQMapWX = require('libs/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
})
var livePlayer = requirePlugin('live-player-plugin');//直播参数
App({
  onLaunch: function() {
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    // 展示本地存储能力
    wx.setStorageSync('windowWidth', windowWidth)
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //沉浸式顶部自适应
    var sysinfo = wx.getSystemInfoSync()                
    var statusHeight = sysinfo.statusBarHeight                
    var isiOS = sysinfo.system.indexOf('iOS') > -1
      if (!isiOS) {                
         var navHeight =statusHeight+8;   //安卓         
       } else {                
        var navHeight =statusHeight+7;   //ios  
      }
      console.log("导航高度=======>",statusHeight,navHeight)
      wx.setStorageSync('navHeight', navHeight);                  
  },
  //判断当前版本是不是最新版,然后提示进行更新
  onShow: function (options) {
    // 分享卡片入口场景才调用getShareParams接口获取以下参数
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1044) {
      livePlayer.getShareParams()
        .then(res => {
          console.log('get room id', res.room_id) // 房间号
          console.log('get openid', res.openid) // 用户openid
          console.log('get share openid', res.share_openid) // 分享者openid，分享卡片进入场景才有
          console.log('get custom params', res.custom_params.userId) // 开发者在跳转进入直播间页面时，页面路径上携带的自定义参数，这里传回给开发者
          wx.setStorageSync('shareUserId', res.custom_params.userId); //将分享者的userid存入缓存中
        }).catch(err => {
          console.log('get share params', err)
        })
    }
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        console.log('是否需要更新'+res.hasUpdate)
        //请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好,是否重启应用?',
              success: function(res) {
                //新版本已经下载好,调用applyUpdate应用新版本并启动
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: '已经有新版本了哟',
              content: '新版本已经上线啦,请您删除当前小程序,重新搜索进去',
            })
          })
        }
      })
    } else {
      //如果希望用户在最新版本的客户端上体验小程序,这样提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低,无法使用该功能,请升级都最新微信版本后重试',
      })
    }
  },
  globalData: {
    requestPath: 'https://www.yisanmall.com/', //生产环境
    // requestPath: 'http://192.168.1.130/', //测试环境
    // requestPath: 'http://192.168.1.251:8081/', //开发  
    // requestPath: 'http://192.168.1.200/', //开发 lz
    // requestPath: 'http://192.168.1.157:8081/', //开发
    // navHeight: 0,
    list: [] //存放tabbar数据 
  },
  custom_bottom_navbar: function(){
    console.log("这里试自定义底部导航栏!");
  },
  getTopHeight: function(t){
    var that = t;
    //获取胶囊位置信息
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    //定义导航位置参数
    var globalData={
      navHeight:0,
      navTop:0,
      barHeight:32,
    }
    var navTop,navHeight,barHeight;
    //获取手机系统信息
    wx.getSystemInfo({
      success: res => {
        console.log(res);
        //导航栏高度
        var statusBarHeight = res.statusBarHeight;
        navTop = menuButtonObject.top;
        barHeight = menuButtonObject.height; //胶囊高度
        navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2;
        globalData.navHeight = navHeight;
        globalData.navTop = navTop;
        globalData.barHeight = barHeight;
        
        console.log(globalData)         
        that.setData({
          globalData:globalData,   
        })
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  //数组去重
  unique1(arr) {
    let res = [arr[0]]
    for (let i = 1; i < arr.length; i++) {
        let flag = true
        for (let j = 0; j < res.length; j++) {
            if (arr[i] === res[j]) {
                flag = false;
                break
            }
        }
        if (flag) {
            res.push(arr[i])
        }
    }
    return res
  }
})
var requestUtil = require('../../utils/requestUtil.js');
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showDialog: {
      type: Boolean,
      vaule: true
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDialogs:false,
    showDialog:false
  },
  attached(){
    //查看用户是否受过权
    let that = this;
    if(!wx.getStorageSync('userInfo')){
      wx.getSetting({
        success(res) {
          that.setData({
            userInfos: res.authSetting['scope.userInfo']
          })
          console.log("授权状态", res.authSetting['scope.userInfo'])
          if (res.authSetting['scope.userInfo']){
              wx.getUserInfo({
                success: function (res) {
                  console.log("授权的数据====>",res)
                  wx.setStorageSync('userInfo', res.userInfo);
                  if(!wx.getStorageSync('unionid')){
                    wx.request({
                      url: app.globalData.requestPath + 'user/getUserInfo/v247',
                      method: 'POST',
                      data: {
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        sessionKey: wx.getStorageSync('sessionKey'),
                        openId: wx.getStorageSync('openId'),
                        sharePerson: wx.getStorageSync('shareUserId')
                      },
                      header: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      success: result => {
                        console.log("解码出来的unionid",result.data.data.unionid)
                        wx.setStorageSync('unionid', result.data.data.unionid);
                      }, 
                    })
                  }
                }
              })
          }
          console.log("用户是否授权", res.authSetting['scope.userInfo'])
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //弹窗控制
    toggleDialog() {
      if (this.data.userInfos){
        this.setData({
          showDialog: !this.data.showDialog
        });
      }else{
        this.setData({
          showDialogs: !this.data.showDialogs
        });
      }     
    },
    //获取用户会员等级
    queryUserById() {
      let _this = this;
      let userId = wx.getStorageSync('userId');
      if (typeof(userId)=='number') {
        let params = {
          userId: wx.getStorageSync('userId')
        }
        requestUtil.Requests('user/queryUserById', params).then((res) => {
          console.log("会员等级", res)
          wx.setStorageSync('vipRate', res.data.rate);
          wx.setStorageSync('vipGrade', res.data.grade); //会员等级
          _this.setData({
            vipRate: res.data.rate, //会员分润率
            vipGrade: res.data.grade
          })
        })
      } else {
        console.log('用户未授权,未获取到userId')
      }

    },
    //点击获取手机号
    getPhoneNumber(e) {
      var that = this;
      wx.checkSession({
        success: function () {
          console.log(e.detail.errMsg)
          console.log(e.detail.iv)
          console.log(e.detail.encryptedData)
          var ency = e.detail.encryptedData;
          var iv = e.detail.iv;
          if (!e.detail.encryptedData) {
            //不同意授权
            wx.showToast({
              title: '授权失败,请重新授权',
              icon: 'none',
              duration: 5000
            })
          } else { //同意授权
            wx.showLoading({
              title: '授权中',
              mask: true
            })
            let data = {
              encrypdata: ency,
              ivdata: iv,
              sessionkey: wx.getStorageSync('sessionKey')
            }
            requestUtil.Requests('user/decNumberPhone', data).then((res) => {
              console.log("获取到的用户电话",res)
              let data = JSON.parse(res.data)
              let userPhone = data.phoneNumber //用户绑定电话
              let userInfo = wx.getStorageSync('userInfo');
              console.log("用户的绑定信息",userInfo )
              let name=userInfo.nickName;
              let nickName = name.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
              let params = {
                phone: userPhone,
                headImg: userInfo.avatarUrl,
                nickName: nickName,
                openId: wx.getStorageSync('openId'),
                sharePerson: wx.getStorageSync('shareUserId'),
                unionid:wx.getStorageSync('unionid'),
              }
              requestUtil.Requests('user/userBind', params).then((res) => {
                console.log("授权成功之后",res)
                wx.setStorageSync('userId', res.data);
                if(res.data){
                  setTimeout(function () {
                    var value = 123;
                    that.triggerEvent('callSomeFun', value)
                  }, 500);
                  that.queryUserById()
                }
                that.toggleDialog();
                wx.hideLoading()
              })
            })
            
          }
        },
        fail (res) {
          // session_key 已经失效，需要重新执行登录流程
          console.log(res)
        }
      })
    },
    //手动绑定手机号
    handlePhone() {
      console.log(1)
      wx.navigateTo({
        url: '/pages/bindingPhone/bindingPhone',
      })
    },
    //用户授权绑定信息
    bindGetUserInfo: function (e) {
      var that = this;
      var sharePerson = wx.getStorageSync('shareUserId'); //邀请者的openId
      if (e.detail.userInfo) {
        var userInfo = e.detail.userInfo;
        console.log("获取到的用户信息",e)
        wx.setStorageSync('userInfo', userInfo)
        wx.request({
          url: app.globalData.requestPath + 'user/getUserInfo/v247',
          method: 'POST',
          data: {
            encryptedData: e.detail.encryptedData,
            iv:e.detail.iv,
            sessionKey: wx.getStorageSync('sessionKey'),
            openId: wx.getStorageSync('openId'),
            sharePerson: wx.getStorageSync('shareUserId')
          },
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: result => {
            console.log("222222result.data.unionid",result.data.data.unionid)
            wx.setStorageSync('unionid', result.data.data.unionid);
          }, 
        })
        that.setData({
          showDialog: !that.data.showDialog,
          showDialogs: false,
          userInfos:true
        });
      }
    },
    toggleDialogss(){
      this.setData({
        showDialog: false,
        showDialogs: false
      })
    },
  }
})
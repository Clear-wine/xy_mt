const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //获取旅客姓名
  getUserName: function(e) {
    this.setData({
      userName: e.detail.value
    });
  },

  //获取旅客手机号码
  getPhone: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  //获取到身份证号
  getCode: function(e) {
    this.setData({
      idCard: e.detail.value
    });
  },

  //获取银行卡号
  getBankCard: function(e) {
    this.setData({
      bankNo: e.detail.value
    });
  },
  //获取银行名称
  getBankCardname: function(e) {
    this.setData({
      bankName: e.detail.value
    });
  },
  //获取银行支行
  getBankCardzhihang: function(e) {
    this.setData({
      branchName: e.detail.value
    });
  },
  //保存银行卡
  savaBankCard: function() {
    var that = this;
    if (that.testParam()) {
      var param = {
        userId: wx.getStorageSync('userId'),
        userName: that.data.userName,
        phone: that.data.phone,
        idCard: that.data.idCard,
        bankNo: that.data.bankNo,
        bankName:that.data.bankName,
        branchName:that.data.branchName
      }
      requestUtil.Requests('user/bank/card/add', param).then((res) => {
        console.log(res)
        if (res.flag) {
          wx.navigateBack({
            delta: 1,
          })
        } else {
          console.log('添加银行卡失败!')
        }

      })
    }
  },

  //校验请求参数
  testParam: function() {
    if (this.data.userName == "" || this.data.userName == undefined) {
      wx.showToast({
        title: '用户姓名不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.phone == "" || this.data.phone.length != 11) {
      wx.showToast({
        title: '请检查手机号是否为空或有误',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.idCard == "" || this.data.idCard == undefined) {
      wx.showToast({
        title: '身份证号不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.bankNo == "" || this.data.bankNo == undefined) {
      wx.showToast({
        title: '银行卡号不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.bankName == "" || this.data.bankName == undefined) {
      wx.showToast({
        title: '银行名称不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (this.data.branchName == "" || this.data.branchName == undefined) {
      wx.showToast({
        title: '支行名称不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    return true;

  }
})
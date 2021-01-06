const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blackgold_vip: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取会员信息
    this.getUserVip()
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
  getUserVip() {
    var that = this;
    var params = {
      userId: wx.getStorageSync('userId'),
    }
    requestUtil.Requests('user/queryUpgradePage', params).then((res) => {
      
      let blackgold_vip = that.data.blackgold_vip
      let rule = res.data.rule;
      let data = res.data
      for (let i in rule) {
        switch (rule[i].upgradeWay) {
          case '1':
            rule[i].title = rule[i].amountExplain;
            break;
          case '2':
            rule[i].title = rule[i].numberExplain;
            break;
          case '3':
            rule[i].title = rule[i].amountExplain + '或' + rule[i].numberExplain;
        }
      }
      if (res.data.code === 1) {
        blackgold_vip = "../images/common_vip.png"
      } else if (res.data.code === 2) {
        blackgold_vip = "../images/gold_vip.png"
      } else if (res.data.code === 3) {
        blackgold_vip = "../images/platinum_vip.png";
      } else if (res.data.code === 4) {
        blackgold_vip = "../images/blackgold_vip.png";
      }
      that.setData({
        rule: rule,
        data: data,
        blackgold_vip: blackgold_vip
      });
    })
  },

  //提示框的显示
  showModal(error) {
    wx.showModal({
      content: error,
      showCancel: false,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

})
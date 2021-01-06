// pages/members/members.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    desc: [], //会员说明
    viplist: [], //会员等级
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取会员信息
    this.getUserVip()

  },
  //获取会员信息
  getUserVip() {
    var that = this;
    var params = {
      userId: wx.getStorageSync('userId'),
    }
    requestUtil.Requests('user/queryUpgradePage',params).then((res)=>{
      let list = res.data.list;
      let descArr = res.data.desc
      let isshow = false;
      for (let i in list) {
        if (list[i].isUpgrade == 0) {
          isshow = true;
        } else {
          isshow = false;
        }
      }
      that.setData({
        desc: descArr,
        viplist: list,
        isShow: isshow
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
  //升级支付
  // upgrade(){
  // wx.navigateTo({
  // url: '/pages/child/pages/order-pay/order-pay',
  // })
  // }

})
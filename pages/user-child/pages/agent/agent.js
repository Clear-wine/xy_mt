const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamTotal: 0, //团队总人
    withdrawableAmount: 0, //提现金额
    transactionAmount: 0, //总交易额
    transactionAmount: 0, //总分润额
    rewardAmount: 0, //总奖励额
    memberDivided: [], //用户分润
    partnerDivided: [], //合伙人分润
    memberReward: [], //用户奖励
    partnerReward: [], //合伙人奖励
    type: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取代理商信息
    this.getAgentList()
  },
  /**获取代理商 */
  getAgentList() {
    var that = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/queryAgent', params).then((res) => {
      let data = res.data;
      that.setData({
        data: data,
        // teamNum: data.teamNum,//团队总人数
        // waitAmoun: data.waitAmoun,//为入账
        // consumeAmount: data.consumeAmount,//历史累计交易金额
        // withdrawableAmount: data.withdrawableAmount,//可提现金额
        // teamTradeAmount: data.teamTradeAmount,//团队交易金额
        // teamTradeCount:data.teamTradeCount//团队商品交易数据
        // transactionAmount: data.transactionAmount,//总交易额
        // dividedAmount: data.dividedAmount,//总分润额
        // rewardAmount: data.rewardAmount,//总奖励额
        // memberDivided: data.memberDivided,//用户分润
        // partnerDivided: data.partnerDivided,//合作人分润
        // memberReward: data.memberReward,//用户奖励
        // partnerReward: data.partnerReward//合伙人奖励
      })
    })
  },
  // 查看我的团队
  handleToTeam() {
    wx.navigateTo({
      url: '/pages/agent-child/pages/my-team/my-team',
    })
  },
  // 查看历史累计分润
  handleToShare() {
    wx.navigateTo({
      url: '/pages/agent-child/pages/share-both/index',
    })
  },
  // 未入账分润
  handleNoToShare(){
    wx.navigateTo({
      url: '/pages/agent-child/pages/share-both/index?showTitle?=true',
    })
  },
  //用户分润
  memberDivided(e) {
    let _this = this;
    if (_this.data.memberDivided.gradeText == '未开通') {
      wx.showToast({
        title: '您未开通此功能',
        icon: 'none',
        duration: 2000
      })
    } else {
      let type = e.currentTarget.dataset.type;
      let str = JSON.stringify(type);
      wx.navigateTo({
        url: '/pages/agent-child/pages/share/share?type=' + str,
      })
    }

  },
  //合作人分润
  partnerDivided(e) {
    let _this = this;
    if (_this.data.partnerDivided.gradeText == '未开通') {
      wx.showToast({
        title: '您未开通此功能',
        icon: 'none',
        duration: 2000
      })
    } else {
      let type = e.currentTarget.dataset.type;
      let str = JSON.stringify(type);
      wx.navigateTo({
        url: '/pages/agent-child/pages/share/share?type=' + str,
      })
    }
  },
  //用户奖励
  memberReward(e) {
    let _this = this;
    if (_this.data.memberReward.gradeText == '未开通') {
      wx.showToast({
        title: '您未开通此功能',
        icon: 'none',
        duration: 2000
      })
    } else {
      let type = e.currentTarget.dataset.type;
      let str = JSON.stringify(type);
      wx.navigateTo({
        url: '/pages/agent-child/pages/generalize/generalize?type=' + str,
      })
    }

  },
  //合作人奖励
  partnerReward(e) {
    let _this = this;
    if (_this.data.partnerReward.gradeText == '未开通') {
      wx.showToast({
        title: '您未开通此功能',
        icon: 'none',
        duration: 2000
      })
    } else {
      let type = e.currentTarget.dataset.type;
      let str = JSON.stringify(type);
      wx.navigateTo({
        url: '/pages/agent-child/pages/generalize/generalize?type=' + str,
      })
    }
  },
  /**提现 */
  handleDrawings() {
    let _this = this;
    let withdrawableAmount = _this.data.data.withdrawableAmount;
    wx.navigateTo({
      url: '/pages/agent-child/pages/drawings/drawings?withdrawableAmount=' + withdrawableAmount,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  }

})
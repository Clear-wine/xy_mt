var requestUtil = require('../../../../utils/requestUtil.js')
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ischoose: 0, //是否购买保险 0默认没有购买
    ischecked: true,
    Length:6,        //输入框个数
    isFocus:false,    //聚焦
    Value:"",        //输入的内容
    ispassword:true, //是否密文显示 true为密文， false为明文。
    showDialog:false,
    showCp:false,
    bankName:'选择提现方式'
  },
  Focus(e){
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value:inputValue
    })
    that.tijiao(inputValue)
  },
  Tap(){
    var that = this;
    that.setData({
      isFocus:true,
    })
  },
  formSubmit(e){
    this.toggleDialog()
  },
  toggleDialog() {
      this.setData({
        showDialog: !this.data.showDialog,
        isFocus:!this.data.isFocus
      });
  },
  //输入密码了提交
  tijiao(value){
    let that=this;
    if(value.length==6){
      wx.showLoading({
        title: '提交中...',
      })
      console.log(value,"提交")
     var mima=QQMapWX.Utils.hexMD5(value)
     console.log("md5=====",mima)
      if(that.data.type==1){
        var params = {
          userId: wx.getStorageSync('userId') + "",
          bankId: that.data.bankId,
          price: that.data.price,
          destination:1,
          withdrawType:1,
          tradePwd:mima
        }
      }else{
        //微信提现
        var params = {
          userId: wx.getStorageSync('userId'),
          destination:2,
          withdrawType:2,
          price: that.data.price,
          tradePwd:mima,
          openId:wx.getStorageSync('openId')
        }
      }
      requestUtil.Requests('user/withdraw/apply', params).then((res) => {
        that.setData({
          Value:''
        })
        if (res.flag) {
          wx.hideLoading()
            //要延时执行的代码
            wx.navigateTo({
              url: '../sucpage/index?bankName=' + that.data.bankName + '&bankNo=' + that.data.bankNo + '&price=' + that.data.price,
            })
        } else {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取保险id
    if(options.withdrawableAmount){
      this.setData({
        withdrawableAmount: options.withdrawableAmount
      })
    }else{
      this.getAgentList()
      this.getxianzhi()
    }
  },
  onShow(){
    this.getBankCard()
  },
  //获取可提现金额限制数
  getxianzhi(){
    let that=this;
    let params = {
      userId:wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/withdraw/queryWithdraw', params).then((res) => {
      console.log(res)
      that.setData({
        minValue:res.data.minValue,
        maxValue:res.data.maxValue
      })
    })
  },
  /**获取代理商 */
  getAgentList() {
    var that = this;
    let params = {
      userId:wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/queryAgent', params).then((res) => {
      let data = res.data;
      console.log(data)
      that.setData({
        // teamNum: data.teamNum,//团队总人数
        // waitAmoun: data.waitAmoun,//为入账
        // consumeAmount: data.consumeAmount,//历史累计交易金额
         withdrawableAmount: data.withdrawableAmount,//可提现金额
        // teamTradeAmount: data.teamTradeAmount,//团队交易金额
        // teamTradeCount:data.teamTradeCount//团队商品交易数据
        //transactionAmount: data.transactionAmount,//总交易额
        // dividedAmount: data.dividedAmount,//总分润额
        // rewardAmount: data.rewardAmount,//总奖励额
        // memberDivided: data.memberDivided,//用户分润
        // partnerDivided: data.partnerDivided,//合作人分润
        // memberReward: data.memberReward,//用户奖励
        // partnerReward: data.partnerReward//合伙人奖励
      })
    })
  },
  //获得可提现金额
  getPrice: function(e) {
    this.setData({
      price: e.detail.value
    });
  },
  // 全部提现
  handleAllPrice() {
    
    this.setData({
      price: this.data.withdrawableAmount

    })
  },

  radioChange: function(e) {
    this.setData({
      ischecked: !this.data.ischecked
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },

  // 这是输入的数据绑定到value值的方法
  //提现
  submitWithdraw: function() {
    let that = this;
    if (that.testParam()) {
      that.toggleDialog()
    }
  },
  //校验请求参数
  testParam: function() {
    let that=this;
    let tradePwdFlag=wx.getStorageSync('tradePwdFlag')
    console.log(tradePwdFlag)
    if(!tradePwdFlag||tradePwdFlag=='false'){
      wx.showModal({
        title: '请先设置交易密码!',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
              wx.navigateTo({
                url:'../traders-password/index'
              })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return false;
    }
    if (that.data.bankId == "" || that.data.bankId == undefined) {
      wx.showToast({
        title: '请选择提现方式',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (that.data.price == "" || that.data.price == undefined) {
      wx.showToast({
        title: '请输入提现金额',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (Number(that.data.price) > Number(that.data.withdrawableAmount)) {
      wx.showToast({
        title: '不能超过可提现金额',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (Number(that.data.price) < that.data.minValue) {
      wx.showToast({
        title: '提现金额不能少于'+that.data.minValue+'元',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (Number(that.data.price) > that.data.maxValue) {
      wx.showToast({
        title: '提现金额不能超过'+that.data.maxValue+'元',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    return true;
  },
  //提现方式显示隐藏
  showCp:function(){
    this.setData({showCp:!this.data.showCp})
  },
  //获取银行卡列表
  getBankCard(){
    let _this = this;
    let param = {
      userId:wx.getStorageSync('userId')
    }
    requestUtil.Requests('user/bank/card/query', param).then((res) => {
      if(res.data.length != 0){
          res.data.forEach(el=>{
            el.bankNo =  el.bankNo.replace(/\s/g, '').replace(/(\d{4})\d+(\d{4})$/, "**** **** **** $2")
          })
      }
      _this.setData({
        bankList: res.data
      })
    })
  },
  scpReturn(){
    return
  },
  addCard() {
    wx.navigateTo({
      url: '../../../child/pages/addbankCard/addbankCard',
    })
  },
  // 选择银行卡
  handleSelCard(e){
    let bankName = e.currentTarget.dataset.bankname;
    let bankNo = e.currentTarget.dataset.bankno;
    let bankId = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    //获取当前页面js里面的pages里的所有信息。
    var ischoose = 0;
    if (bankName != "") {
      ischoose = 1;
    }
    this.setData({
      bankId: bankId,
      bankName: bankName,
      bankNo: bankNo,
      ischoose: ischoose,
      type:type,
      showCp:!this.data.showCp
    });
  }
})
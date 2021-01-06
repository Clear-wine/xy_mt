const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bankList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow:function(){
    //获取银行卡列表
    this.getBankCard()
  },
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
  addCard() {
    wx.navigateTo({
      url: '../addbankCard/addbankCard',
    })
  },
// 选择银行卡
  handleSelCard(e){
    let bankName = e.currentTarget.dataset.bankname;
    let bankNo = e.currentTarget.dataset.bankno;
    let bankId = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    //获取当前页面js里面的pages里的所有信息。
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    var ischoose = 0;
    if (bankName != "") {
      ischoose = 1;
    }
    prevPage.setData({
      bankId: bankId,
      bankName: bankName,
      bankNo: bankNo,
      ischoose: ischoose,
      type:type
    });
    //返回上一级页面
    wx.navigateBack({
      delta: 1
    })
  }
})
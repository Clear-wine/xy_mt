const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bankList: [], //保险类型
    id: 0, //保险id
    title: '', //保险名称
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取银行卡列表
    this.getBankList()
  },

 getBankList(){
   let _this = this;
   let param = {
     userId: wx.getStorageSync('userId')
   }
   requestUtil.Requests('user/bank/card/query',param).then((res)=>{
      _this.setData({
        bankList:res.data
      })
   })
 },
  //选中传值并返回到上一个页面
  radioChange(e) {
    
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    //获取当前页面js里面的pages里的所有信息。
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    var arr = this.data.casualtyArr;
    var that = this;
    var split = e.detail.value.split("-");
    var ischoose = 0;
    if (split[0] != "") {
      ischoose = 1;
    }
    prevPage.setData({
      bankId: split[0],
      bankName: split[1],
      bankNo: split[2],
      ischoose: ischoose
    });
    //返回上一级页面
    wx.navigateBack({
      delta: 1
    })
  },
})
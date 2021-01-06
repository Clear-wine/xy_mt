// pages/child/pages/vip-details/index.js
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
  onLoad: function (options) {
    console.log(this.data.vipGrade)
    this.setData({
      img:options.img,
      goodsName:options.goodsName,
      goodsNo:options.goodsNo
    })
    this.gethuiyuan()
  },
  //获取会员
  gethuiyuan(){
    let that=this;
    let params={
      userId:wx.getStorageSync('userId'),
    };
    requestUtil.Requests('user/queryUpgradePage',params).then((res)=>{
      console.log(res)
      let rule=res.data.rule;
      var obj;
      var obj2,obj3,obj4;
      rule.forEach(item => {
        if(item.grade==res.data.code){
          obj=item;
        }
        if(item.grade==2){
          obj2=item
        }else if(item.grade==3){
          obj3=item
        }else if(item.grade==4){
          obj4=item
        }
      });
      that.setData({
        code:res.data.code,//当前会员等级
        gradeText:res.data.gradeText,//会员等级名称
        obj:obj,
        obj2:obj2,
        obj3:obj3,
        obj4:obj4,
        toUpgradeText:res.data.toUpgradeText
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res.target.dataset.like)
    let shareId = wx.getStorageSync('userId');
    let that=this;
    if (res.from === 'button') {
      if(res.target.dataset.like==1){
        return {
          title:'壹叁新消费,百万红利等你来赚',
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/index/index',
          imageUrl:'../images/zhuanfatu.png',
        }
      }else{
        return {
          title: that.data.goodsName,
          path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + that.data.goodsNo,
          imageUrl:that.data.img,
        }
      }
    }
    // let _this = this;
    // let shareId = wx.getStorageSync('userId');
    // let img=_this.data.data.imgList[0]
    // console.log(img)
    //   if (res.from === 'button') {
    //     // wx.showShareMenu();
    //     //来自页面内的转发按钮
    //     console.log(res.target, res)
  
    //     if (_this.data.activityType != '4') {
    //       return {
    //         title: _this.data.data.goodsName,
    //         path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
    //         imageUrl:img,
    //       }
    //     } else {
    //       return {
    //         title: _this.data.data.goodsName,
    //         path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
    //         imageUrl:img,
    //       }
    //     }
    //   } else if (res.from === 'menu') {
    //     return {
    //       title: _this.data.data.goodsName,
    //       path: '/pages/start/start?userId=' + shareId + '&url=/pages/child/pages/shopping-details/shopping-details&goodsNo=' + _this.data.goodsNo,
    //       imageUrl:img,
    //     }
    //   }
  }
})
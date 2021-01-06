// pages/user-child//pages/feedback/index.js
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
  onLoad: function (options) {

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
  //建议
  yijian(e){
    let text=e.detail.value;
    console.log(text)
    if(text.length<=0){ 
      wx.showToast({
        title: '请输入建议~',
        icon:'none'
      });  
      return false; 
    }
    this.setData({
      text:text
    })
  },
  //手机号码
  shouji(e){
    let phone=e.detail.value;
    if(!(/^1\d{10}$/.test(phone))){ 
      wx.showToast({
        title: '手机号码输入有误!',
        icon:'none'
      });  
      return false; 
    }
    this.setData({
      phone:phone
    })
  },
  //提交
  tijiao(){
    let that=this;
    if(!that.data.phone){ 
      wx.showToast({
        title: '手机号码不能为空!',
        icon:'none'
      });  
      return false; 
    }
    if(!that.data.text){ 
      wx.showToast({
        title: '麻烦您输入建议哦~',
        icon:'none'
      });  
      return false; 
    }
    let param = {
      userId: wx.getStorageSync('userId'),
      content:that.data.text,
      tel:that.data.phone
    }
    requestUtil.Requests('user/insertFeedBack', param).then((res) => {
      console.log(res)
      if(res.flag){
        wx.showToast({
          title: '感谢您的反馈!',
          icon:'success'
        })
        setTimeout(function() {
          var pages = getCurrentPages(); //当前页面
          var beforePage = pages[pages.length - 2]; //前一页
          wx.navigateBack({
            success: function () {
              beforePage.onShow(); // 执行前一个页面的onLoad方法
            }
        });
      },1500)
      }else{
        wx.showToast({
          title: '提交失败,请稍后重试!',
          icon:'none'
        })
      }
    })
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
  onShareAppMessage: function () {

  }
})
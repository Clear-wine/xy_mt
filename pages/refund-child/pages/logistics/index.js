// pages/refund-child//pages/logistics/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tupianhide:true,//上传图片的隐藏和显示
    sl:6,
    shangpsl:3,
    imgurl:[],
    annerList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    that.setData({
      id:options.id
    })
    that.getrefunddetails()
  },

  //input物流单号
  setorderCode(e){
    this.setData({
      orderCode:e.detail.value
    })
  },
  //input联系方式
  setcontactTel(e){
    if(!(/^1\d{10}$/.test(e.detail.value))){ 
      wx.showToast({
        title: '手机号码输入有误!',
        icon:'none'
      });  
      return false; 
    } 
    this.setData({
      contactTel:e.detail.value
    })
    console.log(this.data.contactTel)
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
  //获取退款订单详情
  getrefunddetails(){
    let that=this;
    let params={
      id:that.data.id
    };
    requestUtil.Requests('order/refund/queryRefundDetail', params).then((res) => {
      console.log("退款订单详情",res)
      that.setData({
        goodsList:res.data.goodsList,
        handleSubTime:res.data.handleSubTime
      })
      that.tiemjie()
    })
  },
   //解析时间创建倒计时
   tiemjie(){
    let that=this;
    let tiem=that.data.handleSubTime;
    var days = parseInt(tiem  / 60 / 60 / 24 , 10); //计算剩余的天数 
    var hours = parseInt(tiem  / 60 / 60 % 24 , 10); //计算剩余的小时 
    var minutes = parseInt(tiem / 60 % 60, 10);//计算剩余的分钟
    var shijian="还剩"+days+"天"+hours+"小时"+minutes+"分"
    console.log(shijian)
    that.setData({
      handleSubTimes:shijian
    })
  },
  //选择图片
  shangchuantu(){
    var that=this;
    var imgurl=that.data.imgurl;
    var annerList=that.data.annerList;
    wx.chooseImage({
      count:3,
      success(res){
        var tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '图片提交中...',
          mask: true
        });
        for(let i=0;i<tempFilePaths.length;i++){
          imgurl.push(tempFilePaths[i])//显示时使用
          wx.uploadFile({
            url: 'https://www.yisanmall.com/imgMultiUpload', //请求地址
            filePath: tempFilePaths[i],
            name: 'file',
            success: function(res) {
              let data=JSON.parse(res.data);
              let obj=data.data[0];
              let filePath=obj.filePath;
              console.log(filePath)
              annerList.push(filePath) //提交时使用
            },
            fail:function(res){
              console.log("上传图片失败",res)
            }
          })
        }
        //因为异步原因,在数据还未请求完毕时,下面的代码已经执行所以没有数据(加入延时器,延时执行)
        setTimeout(function() {
          wx.hideLoading();
          console.log(imgurl,annerList)
          if(annerList.length>=3){
            var tupianhide=false
          }
          that.setData({
            //imgurl:imgurl,
            tupianhide:tupianhide,
            annerList:annerList
          })
        },2000);
      }
    })
  },
  //显示更多商品
  gengduosp(){
    let that=this;
    if(that.data.shangpsl==3){
      that.setData({
        shangpsl:1000
      })
    }else{
      that.setData({
        shangpsl:3
      })
    }
  },
  //提交物流信息
  setlogistics(){
    let that=this;
    if(!that.data.contactTel){ 
      wx.showToast({
        title: '手机号码不能为空!',
        icon:'none'
      });  
      return false; 
    }
    let params={
      refundId:that.data.id,
      loginsticsName:that.data.loginsticsName,
      loginsticsCode:that.data.loginsticsCode,
      orderCode:that.data.orderCode,
      contactTel:that.data.contactTel,
      userId:wx.getStorageSync('userId'),
      annerList:that.data.annerList
    };
    console.log("提交的参数",params)
    requestUtil.Requests('order/refund/logistics/submit', params).then((res) => {
      console.log("确认提交",res)
      if(res.flag){
        wx.showToast({
          title: '提交成功',
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
          title: '提交失败,请稍后重试',
          icon:'none'
        })
      }
    })
  },
  //查询物流公司名称
  cxwuliuname(){
    let that=this;
    setTimeout(function() {
      let params={
        deliveryNo:that.data.orderCode
      }
      requestUtil.Requests('order/refund/logistics/queryLogistic', params).then((res) => {
        console.log(res)
        that.setData({
          loginsticsName:res.data.ShipperName,
          loginsticsCode:res.data.ShipperCode
        })
      })
   }, 500);
  },
  //长按删除图片
  longPress(e){
    let that=this;
    let files=that.data.annerList;
    let img=e.currentTarget.dataset.img;
    console.log(img)
    wx.showModal({
      title: '提示',
      content: '您确认需要删除此图片吗?',
      success (res) {
        if (res.confirm) {
          for(let i=0;i<files.length;i++){
            if (img == files[i]) {
              files.splice(i,1);
            }
          }
          that.setData({
            annerList:files,
            tupianhide:true
          })
          console.log(that.data.annerList)
        } else if (res.cancel) {
          console.log('用户点击取消') 
        }
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
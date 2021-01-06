// pages/refund-child//pages/refund-application/index.js
var requestUtil = require('../../../../utils/requestUtil.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shangpsl:3,
    sl:10,
    cargo:true, //是否收到货整列的隐藏与显示判断
    cargo1:true,
    xuanzeY:true, //是否收到货中的是
    xuanzeN:false,//是否收到货中的否
    yuanyinX:false,//退款原因的隐藏和显示
    tupianhide:true,//上传图片的隐藏和显示
    gengduosp:true,//显示更多商品
    isReceivedGoods:0,//给后台的数据 1为已收到货
    yuanyinlist:[],
    imgurl:[],
    files:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    console.log(options)
    if(options.refundModel==1){
      if(options.shopType==1){
        that.setData({
          cargo1:false,
          cargo:false
        })
      }else{
        that.setData({
          cargo1:false,
          cargo:false
        })
      }
    }else if(options.refundModel==3){
      that.setData({
        cargo:false
      })
    }
    that.setData({
      orderNo:options.orderNo,
      orderShopId:options.orderShopId,
      shopType:options.shopType,
      refundModel:options.refundModel
    })
    that.getdetails();
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
  //查询订单详情
  getdetails(){
    let that=this;
    let refundModel=that.data.refundModel;
    let params={
      orderNo:that.data.orderNo,
      orderShopId:that.data.orderShopId,
      shopType:that.data.shopType
    };
    requestUtil.Requests('product/refund/query/applyData', params).then((res) => {
      console.log("订单详情",res)
      var price=res.data.data.price;
      var fare=res.data.data.fare;
      var list=res.data.data.refundReasonList;
        list.forEach((item)=>{
          item.ps=false
        })
        if(refundModel==3){
          var jiage=(price-fare).toFixed(2);
        }else{
          var jiage=price
        }
      that.setData({        
        yuanyinlist:list,
        goodsList:res.data.data.goodsList,
        price:res.data.data.price,
        jiage:jiage,
        fare:fare
      })
    })
  },
  //是否收到货的选择
  xuanzeYES(){
    let that=this;
    that.setData({
      xuanzeY:true,
      xuanzeN:false,
      isReceivedGoods:1//给后台的数据 1为已收到货
    })
  },
  xuanzeNO(){
    let that=this;
    that.setData({
      xuanzeY:false,
      xuanzeN:true,
      isReceivedGoods:0//给后台的数据 0为未收到货
    })
  },
  //退款原因的展开
  yuanyin(){
    let that=this;
    that.setData({
      yuanyinX:!that.data.yuanyinX
    })
  },
  //退款确认提交
  setrefund(){
    let that=this;
    let refundDesc=that.data.refundDesc;//退款说明
    let reason=that.data.reason;//退款原因
    let files=that.data.files;//凭证图片
    if(!reason){
      wx.showToast({
        title: '请选择退款原因',
        icon:'none',
        duration: 1500
      })
      return
    }
    let params={
      userId:wx.getStorageSync('userId'),
      openId:wx.getStorageSync('openId'),
      orderNo:that.data.orderNo,
      orderShopId:that.data.orderShopId,
      refundModel:that.data.refundModel,
      shopType:that.data.shopType,
      price:that.data.price,
      refundDesc:refundDesc,
      reason:reason,
      files:files,
      isReceivedGoods:that.data.isReceivedGoods,
      price:that.data.jiage,
      fee:that.data.fare
    };
    console.log(params)
    requestUtil.Requests('order/refund/submitRefund', params).then((res) => {
      console.log("确认提交",res)
      var id=res.data.id
      if(res.flag){
          wx.navigateTo({
            url: '/pages/refund-child/pages/refund-details/index?id='+id 
          })
      }else{
        wx.showToast({
          title: '提交失败,请稍后重试!',
          icon:'none',
          duration: 2000
        })
      }
    })
  },
  //前往退款详情
  godetails(){
    let that=this;
    wx.showModal({
      title: '提示',
      content: '您确认需要退款吗?',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.setrefund()
        } else if (res.cancel) {
          console.log('用户点击取消') 
        }
      }
    })
  },
  //选择退款的原因
  xuanzeyy(e){
    let that=this;
    var id = e.currentTarget.dataset.id;
    var reason = e.currentTarget.dataset.text;
    let yuanyinlist=that.data.yuanyinlist
    console.log(id)
    yuanyinlist.forEach((el) => {
      if (id == el.value) {
        el.ps = true; //代表为选中
      } else {
        el.ps = false;
      }
    })
    that.setData({
      yuanyinlist:yuanyinlist,
      reason:reason
    })
  },
  //退款说明文字
  shuomingwen(e){
    let wen=e.detail.value;
    console.log(wen)
    this.setData({
      refundDesc:wen
    })
  },
  //选择图片
  shangchuantu(){
    var that=this;
    var imgurl=that.data.imgurl;
    var files=that.data.files;
    wx.chooseImage({
      count:3,
      success(res){
        var tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '图片提交中...',
          mask: true
        });
        for(let i=0;i<tempFilePaths.length;i++){
          imgurl.push(tempFilePaths[i])
          wx.uploadFile({
            url: 'https://www.yisanmall.com/imgMultiUpload', //请求地址
            filePath: tempFilePaths[i],
            name: 'file',
            success: function(res) {
              let data=JSON.parse(res.data);
              let obj=data.data[0];
              let filePath=obj.filePath;
              files.push(filePath) //提交时使用
              //imgurl.push(obj.requestThumPath)//显示时使用
            },
            fail:function(res){
              console.log("上传图片失败",res)
            }
          })
        }
        //因为异步原因,在数据还未请求完毕时,下面的代码已经执行所以没有数据(加入延时器,延时执行)
        setTimeout(function() {
          console.log(imgurl,files)
          wx.hideLoading();
          if(imgurl.length>=3){
            var tupianhide=false
          }
          that.setData({
            //imgurl:imgurl,
            tupianhide:tupianhide,
            files:files
          })
        }, 2000);
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
  //长按删除图片
  longPress(e){
    let that=this;
    let files=that.data.files;
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
            files:files,
            tupianhide:true
          })
          console.log(that.data.files)
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
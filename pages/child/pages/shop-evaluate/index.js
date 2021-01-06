var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 10,
    evadata: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      goodsNo: options.goodsNo,
      activityNo:options.activityNo
    })
    if(options.activityNo!='undefined'){
      this.getpingjia()
    }else{
      //查看商品评价
    this.queryGoodsEvaluate()
    }
    
  },
  queryGoodsEvaluate() {
    let _this = this;
    let params = {
      goodsNo: _this.data.goodsNo,
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('product/queryGoodsEvaluate', params, _this.data.evadata).then((res) => {
      console.log(res)
      _this.setData({
        evadata: res.data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  //获取评价列表-活动商品
    getpingjia(){
      let that=this;
      let params = {
        page:that.data.page,
        pageSize:that.data.pageSize,
        //type:1
        activityNo:that.data.activityNo
      }
      console.log(JSON.stringify(params))
      requestUtil.Requests_page('activity/evaluate/queryForPage', params,that.data.evadata).then((res) => {
        console.log("评价====>",res)
        that.setData({
          evadata: res.data,
          page: res.pageParam.page,
          hasMoreData: res.pageParam.hasMoreData
        })
      })
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
    if (this.data.activityNo!='undefined') {
      this.getpingjia()
    } else {
      this.queryGoodsEvaluate()
    }
  },


})
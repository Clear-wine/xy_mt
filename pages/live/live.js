// pages/live/live.js
var requestUtil = require('../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // btn:[
    //   {
    //     id:0,
    //     name:"第一场",
    //     riqi:"5月3日",
    //     pan:false,
    //     shijian:"19:00"
    //   },
    //   {
    //     id: 1,
    //     name: "第二场",
    //     riqi: "5月9日",
    //     pan: true,
    //     shijian: "19:00"
    //   },
    //   {
    //     id: 2,
    //     name: "第三场",
    //     riqi: "5月16日",
    //     pan: false,
    //     shijian: "19:00"
    //   },
    // ],
    lunbo:1,
    dataList:[],
    roomlist:[],
    page: 1,
    pageSize: 10,
    hasMoreData: true,
    loadingHidden:false,
    hasMoreData: true,
    isRefreshing: false,
    isLoadingMoreData: false,
    count:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getroomid()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //获取房间号
  getroomid(){
    let that=this;
    requestUtil.Requests('user/live/queryLiveList',that.data).then((res) => {
      console.log(res)
      let cou=res.data.count;
      let mod=cou%10;
      let countPage=1;
        if(mod>1){
          countPage=parseInt(cou/10)+1;
        }else{
          countPage=cou/10;
        }
      if (countPage==res.data.page) {
        that.setData({
          roomlist:this.data.roomlist.concat(res.data.data),
          isLoadingMoreData:false
        })        
      } else {
        that.setData({
          roomlist:this.data.roomlist.concat(res.data.data),
          isLoadingMoreData:true,
          page: that.data.page + 1
        })
      }        
    })
  },
  //前往直播
  goLive(event){
    let that=this;
    let dataset=event.currentTarget.dataset;
    var roomId=dataset.roomid; // 房间号
    console.log("roomid---->"+roomId)
    let userId = wx.getStorageSync('userId');
    console.log(roomId)
    let customParams = encodeURIComponent(JSON.stringify({userId: userId})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
    })
    // 其中wx2b03c6e691cd7370是直播组件appid不能修改
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isLoadingMoreData) {
      return;
    }else{
      this.getroomid();
    }
  },  

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
var requestUtil = require('../../../../utils/requestUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listarr: [],
    inputVal: "", //input框内值
    keydown_number: 0, //检测input框内是否有内容
    hostarr: [], //热门搜索接收请求存储数组  
    name_focus: true, //获取焦点
    searchText: '取消',
    aslistps: false,
    type: 1,
    page:1,
    sortType:1,
    //新版-2.4.6君
    navHeight:wx.getStorageSync('navHeight'),//顶部沉浸式高度
    sl:20,
    heziShop:true,
    navbar:['商品','活动','店铺'],
    currentTab: 0,
    paixu:true, //列表,卡片切换
    zonghe:false,//综合排序
    xiaoliang:false,//销量排序
    jiage:false,//价格排序的高低
    jiageyes:false,//价格排序的选中
    pinfen:false,//评分优选选中
    vipRate:wx.getStorageSync('vipRate'),
    vipGrade:wx.getStorageSync('vipGrade'),
    jiazai:true
  },

 //切换bar
 navbarTap: function (e) {
  this.setData({
    currentTab: e.currentTarget.dataset.idx
  })
},
swiperChange: function (e) {
  this.setData({
    currentTab: e.detail.current,
    type:e.detail.current+1,
    page:1
  })
  this.handleSearchDetails()
},
//列表和卡片样式的切换
paixu(){
  this.setData({
    paixu:!this.data.paixu
  })
},
//综合,销量,价格的排序切换
zonghe(){
  let that=this;
  that.setData({
    zonghe:true,
    xiaoliang:false,
    jiageyes:false,
    sortType:1,
    page:1
  })
  that.handleSearchDetails()
},
xiaoliang(){
  let that=this;
  if(that.data.type==1||that.data.type==2){
    var sortType=3;
  }else{
    var sortType=2;
  }
  that.setData({
    xiaoliang:true,
    zonghe:false,
    jiageyes:false,
    sortType:sortType,
    page:1
  })
  that.handleSearchDetails()
},
jiage(){
  let that=this;
  if(that.data.jiage){
    var sortType=2;//价格是高到低
  }else{
    var sortType=4;//价格是低到高
  }
  that.setData({
    jiage:!that.data.jiage,
    zonghe:false,
    xiaoliang:false,
    jiageyes:true,
    sortType:sortType,
    page:1
  })
  that.handleSearchDetails()
},
pinfen(){
  let that=this;
  that.setData({
    zonghe:false,
    xiaoliang:false,
    pinfen:true,
    sortType:3,
    page:1
  })
  that.handleSearchDetails()
},
//返回上一页
fanhui(){
  var pages = getCurrentPages(); //当前页面
    var beforePage = pages[pages.length - 2]; //前一页
    wx.navigateBack({
      // success: function () {
      //   beforePage.onLoad(obj); // 执行前一个页面的onLoad方法
      // }
});
},
  //取值input判断输入框内容修改按钮
  inputvalue: function(e) {
    let val = e.detail.value;
    this.getBlurWordsList(val);
    this.setData({
      inputVal: e.detail.value
    })
    if (e.detail.cursor != 0) {
      this.setData({
        searchText: "搜索",
        keydown_number: 1,
        aslistps:true
      })
    } else {
      this.setData({
        searchText: "取消",
        keydown_number: 0,
        aslistps:false
      })
    }
  },
  //输入完成后的搜索
  sousuo(e){
    this.setData({
      inputVal:e.detail.value
    })
    this.handleSearchDetails()
  },
  getBlurWordsList(val) {
    let _this = this;
    let params = {
      keyWord: val,
      searchType: _this.data.type, // 查询类型
      shopType: '1'
    }
    requestUtil.Requests('product/hotWordes/queryBlurWordsList', params).then((res) => {
      _this.setData({
        aslist: res.data,
      })
    })
  },
  //搜索方法
  search: function() {
    if (this.data.keydown_number == 1) {
      let This = this;
      //把获取的input值插入数组里面
      let arr = this.data.listarr;
      console.log(this.data.inputVal)
      //判断取值是手动输入还是点击赋值
      if (this.data.inputVal == "") {
        // console.log('进来第er个')
        // 判断数组中是否已存在
        let arrnum = arr.indexOf(this.data.inputVal);
        console.log(arr.indexOf(this.data.inputVal));
        if (arr.length < 10) { // 当不超过10的时候
          if (arrnum != -1) {
            // 删除已存在后重新插入至数组
            arr.splice(arrnum, 1)
            arr.unshift(this.data.inputVal);
          } else {
            arr.unshift(this.data.inputVal);
          }
        } else { // 当超过10个的时候
          if (arrnum != -1) {
            // 删除已存在后重新插入至数组
            arr.splice(arrnum, 1)
            arr.unshift(this.data.inputVal);

          } else {
            arr.pop() //删掉旧的时间最早的第一条
            arr.unshift(this.data.inputVal);
          }

        }
      } else {
        console.log('进来第一个')
        let arr_num = arr.indexOf(this.data.inputVal);
        console.log(arr.indexOf(this.data.inputVal));
        if (arr.length < 10) {
          if (arr_num != -1) {
            arr.splice(arr_num, 1)
            arr.unshift(this.data.inputVal);
          } else {
            arr.unshift(this.data.inputVal);
          }
        }else{
          if (arr_num != -1) {
            arr.splice(arr_num, 1)
            arr.unshift(this.data.inputVal);
          } else {
            arr.pop() //删掉旧的时间最早的第一条
            arr.unshift(this.data.inputVal);
          }
        }
      }
      console.log(arr)

      //存储搜索记录
      wx.setStorage({
        key: "list_arr",
        data: arr
      })


      //取出搜索记录
      wx.getStorage({
        key: 'list_arr',
        success: function(res) {
          This.setData({
            listarr: res.data
          })
        }
      })
    } else {
      console.log("取消")
    }
  },
  //清除搜索记录
  delete_list: function() {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定清空所有历史搜索吗?',
      success(res) {
        if (res.confirm) {
          //清除当前数据
          _this.setData({
            listarr: []
          });
          //清除缓存数据
          wx.removeStorage({
            key: 'list_arr'
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  //点击赋值到input框
  this_value: function(e) {
    let value = e.currentTarget.dataset.text;
    this.setData({
      inputVal: value,
      SearchText: "搜索",
      keydown_number: 1,
      name_focus: true
    })
    this.handleSearchDetails()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let This = this;
    //读取缓存历史搜索记录
    wx.getStorage({
      key: 'list_arr',
      success: function(res) {
        This.setData({
          listarr: res.data
        })
      }
    })
    //请求热门搜索
    this.getHotData()
  },
  //联想结果
  getHotData() {
    let _this = this;
    requestUtil.Requests('product/hotWordes/queryHotWordsList').then((res) => {
      _this.setData({
        hostarr: res.data
      })
    })
  },
  handleSearchDetails(e) {
    let _this = this;
    if(_this.data.inputVal==""){
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none',
      })
      return
    }
    if(_this.data.page==1){
      wx.showToast({
        title: '加载中...',
        icon: 'loading',
        duration: 1000
      })
    }
    let type=_this.data.type
    if(type==1){
      var contentlist=_this.data.contentlist;//商品列表
    }else if(type==2){
      var contentlist=_this.data.hdcontentlist;//活动列表
    }else if(type==3){
      var contentlist=_this.data.dpcontentlist;//店铺列表
    }
    let params = {
      content: _this.data.inputVal, //搜索内容
      type: _this.data.type, //查询类型
      sortType: _this.data.sortType, //排序类型
      page:_this.data.page,
      pageSize:10
    }
    requestUtil.Requests_page('product/queryNetShopPage', params,contentlist).then((res) => {
      //判断店铺星级
      console.log('查询', res)
      let num
      let data = res.data
      data.forEach((item) => {
        if (item.shopScore <= 1 || item.activityType === '1') {
          num = 1
          item.activityTypeName = '助力'
          item.actPrice = item.lowPrice
        } else if (item.shopScore <= 2 || item.activityType === '2') {
          num = 2
          item.activityTypeName = '礼包'
          item.actPrice = item.giftPacksPrice
          let time=_this.endtime(item.endDate)
          //console.log("计算的时间=====>",time)
          item.d=time.d
          item.h=time.h
        } else if (item.shopScore <= 3 || item.activityType === '3') {
          num = 3
          item.activityTypeName = '代言'
          item.actPrice = item.price;
          let time=_this.endtime(item.endDate)
          //console.log("计算的时间=====>",time)
          item.d=time.d
          item.h=time.h
        } else if (item.shopScore <= 4 || item.activityType === '4') {
          num = 4
          item.activityTypeName = '接龙'
          item.actPrice = item.chainsHeadPrice
        } else if (item.shopScore <= 5 || item.activityType === '5') {
          num = 5
          item.activityTypeName = '拼团'
          item.actPrice = item.collagePrice
        }
        if(item.netGoods){
          item.netGoods.forEach((item1)=>{
            item1.price = item1.price.toFixed(2)
          })
        }
      })
      if(res.count<11){
        var jiazai=false
      }else{
        var jiazai=true
      }
      if(type==1){
        //商品列表
        _this.setData({
          contentlist: data,
          one_1: num,
          tow_1: parseInt(5 - num),
          count:res.count,
          heziShop:false,
          aslistps:false,
          jiazai:jiazai
        })
      }else if(type==2){
        //活动列表
        _this.setData({
          hdcontentlist: data,
          one_1: num,
          tow_1: parseInt(5 - num),
          count:res.count,
          heziShop:false,
          aslistps:false,
          jiazai:jiazai
        })
      }else if(type==3){
       //店铺列表
       _this.setData({
        pdcontentlist: data,
        one_1: num,
        tow_1: parseInt(5 - num),
        count:res.count,
        heziShop:false,
        aslistps:false,
        jiazai:jiazai
      })
      }
      console.log(_this.data.jiazai)
    })
    _this.search()
  },
  //下拉加载
  xiala(){
    let that=this;
    if(that.data.type==1){
      var sum=that.data.contentlist.length
    }else if(that.data.type==2){
      var sum=that.data.hdcontentlist.length
    }else if(that.data.type==4){
      var sum=that.data.pdcontentlist.length
    }
    if(sum<that.data.count){
      this.handleSearchDetails()
      that.setData({
        jiazai:true,
        page:that.data.page+1
      })
    }else{
      that.setData({
        jiazai:false
      })
    }
  },

  //计算代言 礼包剩余时间
  endtime(time){
    //let time="2020-12-31 11:15:24.0";
    if(time.length>19){
      var sj=time.substring(0,19)
    }else{
      var sj=time
    }
    //计算目标与现在时间差(毫秒)
    let endDates = sj.replace(/-/g, "/");
    let endtime = new Date(endDates).getTime(); //结束时间
    let nowtime = new Date().getTime(); //当前时间
    var leftTime = endtime - nowtime;
    if(leftTime>0){
      var d, h, m, s, ms;
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      d = d < 10 ? "0" + d : d //天数
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h //小时
      var fhtime={
        d:d,
        h:h
      }
    }else{
      var fhtime={
        d:'00',
        h:'00'
      }
    }
    return fhtime
  },
  //加入购物车
  handlePay(e){
    console.log(e)
    if(e.currentTarget.dataset.multi){
      this.toGoods()
    }else{
      let params = {
        userId: wx.getStorageSync('userId'),
        stockNo: e.currentTarget.dataset.stockno,//stockNo, //库存编码
        count:1
      }
      requestUtil.Requests('product/cart/saveAndUpdate', params).then((res) => {
        if (res.flag) {
          wx.showToast({
            title: '添加购物车成功!',
            icon: 'success',
            duration: 2000
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

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

  },
  /**跳转到店铺 */
  toShop(e) {
    let _this = this;
    let shopNo = e.currentTarget.dataset.shopno
    wx.navigateTo({
      url: '/pages/child/pages/shop/shop?shopNo=' + shopNo,
    })
  },
 /**跳转到普通的商品详情 */
 toGoods(e) {
  let goodsNo = e.currentTarget.dataset.goodsno;
  wx.navigateTo({
    url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
  })
},
/**跳转到活动的商品详情 */
toActivity(e) {
  let activityType = e.currentTarget.dataset.activitytype;
  let activityNo = e.currentTarget.dataset.activityno;
  if(activityType=="1"){
    wx.navigateTo({
      url: '/pages/index-child/pages/activityzl-details/index?activityNo=' + activityNo,
    })
  }else if(activityType=="2"){
    wx.navigateTo({
      url: '/pages/index-child/pages/activitylb-details/index?activityNo=' + activityNo,
    })
  }else if(activityType=="3"){
    wx.navigateTo({
      url: '/pages/index-child/pages/activitydy-details/index?activityNo=' + activityNo,
    })
  }else if(activityType=="4"){
    wx.navigateTo({
      url: '/pages/index-child/pages/activityjl-details/index?activityNo=' + activityNo,
    })
  }else if(activityType=="5"){
    wx.navigateTo({
      url: '/pages/index-child/pages/activitypt-details/index?activityNo=' + activityNo,
    })
  }
},
})
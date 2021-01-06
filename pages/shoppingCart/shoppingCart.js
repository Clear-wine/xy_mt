// pages/shoppingCart/shoppingCart.js
var requestUtil = require('../../utils/requestUtil.js')
var util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    minusStatus: 'disabled',
    showModalStatus: false,
    animationData: {},
    showPop: false,
    editAllStatus: true,
    editTitle: '管理',
    checkeedAll: false,
    count: 0,
    priceAll: 0.0, //总价,初始值为0
    page: 1,
    pageSize: 10,
    data: [],
    likedata: [],
    listcheckedarr: [], //单选 选中的 的课程
    listindex: 0,
    itemList:[],
    ckNum:0,
    ckNum1:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userId = wx.getStorageSync('userId')
    // if (options.isgoods){
    //   this.setData({
    //     isgoods: options.isgoods
    //   })
    // }
      this.setData({
        vipRate: wx.getStorageSync('vipRate'),
        vipGrade: wx.getStorageSync('vipGrade')
      })
      console.log(this.data.vipRate,this.data.vipGrade)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //获取网店购物车所有的列表
    let userId = wx.getStorageSync('userId')
    if (userId) {
      this.data.page = 1;
      this.getCarlist();
      //获取猜你喜欢分页列表
      this.getLikeGoodsPage()
      this.setData({
        checkeedAll: false,
        priceAll: 0,
        count: 0,
        datarr: [],
        singlecheckeed: [],
        listcheckedarr: [],
        itemList:[],
        ckNum:0,
        ckNum1:0
      })
    } else {
      // wx.redirectTo({
      //   url: '../auth/auth',
      // })
    }

  },

  //页面完成渲染后触发 且只触发一次
  onReady: function () {
    var that = this;
    that.logins = that.selectComponent("#logins");
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      wx.showModal({
        title: '提示',
        content: '如想体验更多操作,请赶快去授权吧~',
        success: function (res) {
          if (res.confirm) { //如果按钮确定
            that.logins.toggleDialog();
          } else if (res.cancel) { //如果点了取消
            wx.showModal({
              title: '警告',
              content: '您取消授权, 将无法体验更多操作, 请授权后再进入!!!',
              showCancel: false,
              confirmText: '返回',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击了"返回授权"')
                }
              }
            })
          }
        }
      })
    }
  },
  //授权完毕后刷新本页面
  callSomeFun(e) {
    this.onShow();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    that.getLikeGoodsPage();
    that.data.page = 1;
    that.getCarlist();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
      that.getLikeGoodsPage()
  },
  // 分享
  onShareAppMessage(res) {
    let shareId = wx.getStorageSync('userId');
    if (res.from === 'button') { }
    return {
      title: '壹叁新消费',
      path: '/pages/start/start?userId=' + shareId + '&url=/pages/shoppingCart/shoppingCart&isshare=1' + '&noparam=1',
      success: function (res) { }
    }

  },
  //计算总价格 所以选中商品的(价格*数量)相加
  getallPrices: function() {
    var cartsdata = this.data.data //购物车数据
    var allprices = 0 //总价格
    let allmun = 0 //总数量
    for (var i = 0; i < cartsdata.length; i++) {
      var data = cartsdata[i].data
      for (var a = 0; a < data.length; a++) {
        if (data[a].checked === true) {
          //当前商品价格*数量
          let price = Number(data[a].price)
          let num = parseInt(data[a].num)
          allprices += price * num
          allmun += num
        }
      }
    }
    //更新已选数量
    this.setData({
      allmun: allmun,
      allprices: allprices
    })
  },
  //店铺全选
  checkall: function(e) {
    var that=this;
    var ckNum = 0;
    var ckNum1 = that.data.ckNum1
    var index = e.target.dataset.index; //点击元素的下标
    var data = that.data.data;
    var list = data[index].list; //获取到了 当前老师元素的 下的所有课程
    var status = data[index].checkedAll; //获取老师下的checkedAll
    let allselectedmun = 0; //选中的所以数量
    for (var i = 0; i < list.length; i++) {
      list[i].checked = !status; //将当前老师元素下的所有课程 的checked都为 false  或者是  true
    };
    var dataIndex = 'data[' + index + '].list'; //这个可以拿到 data 中 index的老师下的所有课程  数据
    var dataStatus = 'data[' + index + '].checkedAll'; //当前老师元素下checkedAll的属性 
    var itemList = that.data.itemList;
    data.forEach((item,index)=>{
      item.list.forEach((item1,index1)=>{
        ckNum++
      })
    })
    console.log(data)
    if(unique(itemList).indexOf(list[0].shopNo)!=-1&&status){
      itemList.splice(unique(itemList).indexOf(list[0].shopNo),1)
      ckNum1 -= parseInt(list.length)
    }else{
      itemList.push(list[0].shopNo)
      ckNum1 += parseInt(list.length)
    }
    that.setData({
      [dataIndex]: list,
      [dataStatus]: !status,
      ckNum1:ckNum1,
      ckNum:ckNum,
      itemList:unique1(itemList)
    });
    //只有所有单选的 都选中了  当前单选的这块的的父级就会 选中 ，将选中的 父级 添加在一个数组当中 如果过 它本身的数据的length == 它被选中的length 就让  三级的全选 选中
    var data = that.data.data;
    // var datarr = [];
    for (var a = 0; a < data.length; a++) {
      if (data[a].checkedAll == true) {
        var flag = true;
        for (let i in that.data.datarr) {
          if (that.data.datarr[i].shopNo == data[a].shopNo) {
            flag = false;
          }
        }
        if(flag){
          that.data.datarr.push(JSON.parse(JSON.stringify(data[a])));
          that.setData({
            datarr: that.data.datarr
          })
        }
    
      }
    }
    var arrindex = util.getNowArrayIndex(that.data.datarr, data[index].shopNo)
    if (data[index].checkedAll == false) {
      that.data.datarr.splice(arrindex, 1)
    }
    let item = data.find(item => {
      return item.checkedAll == false
    })
    if (item != undefined) {
      that.setData({
        checkeedAll: false
      })
    } else {
      that.setData({
        checkeedAll: true
      })
    }
    for(let i=0;i<data.length;i++){
      if(!data[i].checkedAll){
        var checkeedAll=false;
        break
      }else{
        var checkeedAll=true;
      }
    }
    //console.log(that.data.data)
    //单选 选中的时候 的结算 为多少
    var count = [];
    var priceAll = 0;
    let allnum = 0;
    for (var b = 0; b < data.length; b++) {
      var datacount = data[b].list;
      for (var c = 0; c < datacount.length; c++) {
        if (datacount[c].checked == true) {
          count.push(datacount[c]);
          let price = Number(datacount[c].price)
          let profit = Number(datacount[c].profit)
          let num = parseInt(datacount[c].num);
          if (that.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    that.setData({
      count: (count.length),
      priceAll: priceAll.toFixed(2),
      checkeedAll:checkeedAll
    });
  },
  //选中商品
  Checks2:function (e){
    let that = this;
    let data = that.data.data;
    let groupIndex = e.target.dataset.groupindex; // 当前点击的第i个店铺
    let index = e.currentTarget.dataset.index; // 店铺内第i个商品
    let list = data[groupIndex].list; //当前店铺内的第i个商品的商品属性集合
    let list2 = data[groupIndex].list[index].checked; //获取到当前商品是否选中
    let dataIndexchecked = 'data[' + groupIndex + '].list[' + index + '].checked'; //设置到当前店铺下当前商品是否选中
    let dataStatus = 'data[' + groupIndex + '].checkedAll'; //设置当前店铺下全选按钮是否选中
    let checkedAll = false;//当前商铺全选状态
    let checkeedAll = false;//全部商品全选状态
    let ckNum = that.data.ckNum;//选中的商品的总量
    let ckNum1 = that.data.ckNum1;//选中了多少商品
    let num = list[index].num; //当前商品数量
    let price = list[index].price//当前商品价格
    let p = ((num*10) * (price*10)) / 100
    let priceAll = that.data.priceAll;//总价
    let count = that.data.count;//商品总数
    let datarr = that.data.datarr
    let itemList = that.data.itemList;//店铺No数组
    let plist2 = []; //当前店铺下的所有商品
    for (let i = 0; i < list.length; i++) {
      plist2.push(JSON.parse(JSON.stringify(list[i])));
    }
    //设置取消/选中
    that.setData({
      [dataIndexchecked]: !list2,
    });
    if(list2){
      let p = ((num*10) * (price*10)) / 100
      //选中 取消选择 删除datarr下标数据 重新计算价格 清除当前店铺全选 清除全选
      let goodsNo = e.currentTarget.dataset.kc.goodsNo
      let shopNo = e.currentTarget.dataset.kc.shopNo
      let dIndex,lIndex;
      datarr.forEach((item,i) => {
        if(item.shopNo == shopNo){
          dIndex = i
          datarr[i].list.forEach((item1,j)=>{
            if(item1.goodsNo == goodsNo){
              lIndex = j
            }
          }) 
        }
      })
      ckNum1 -=1
      let ptest = 'data['+groupIndex+'].checkedAll'
      if(datarr[dIndex].list.length>1){
        //商铺内有多个商品被勾选
        console.log(that.data.data)
        datarr[dIndex].list.splice(lIndex,1)
        console.log(that.data.data)
      }else{
        //商铺内只有一个商铺，直接删除datarr内下标元素
        // datarr.splice(dIndex,1);
        let b = []
        datarr.forEach((item,index)=>{
          if(dIndex == index){
            return
          }else{
            b.push(item)
          }
        })
        datarr = b
        itemList.splice(dIndex,1)
      }
      
      that.setData({
        checkeedAll:false,
        [ptest]:false,
        priceAll:(priceAll * 10 - p * 10) / 10,
        count:count - 1,
        ckNum1:ckNum1,
        datarr:datarr
      })
    }else{
      //未选中 选择 构建 计算价格
      if(datarr.length ==0){
        //datarr没有值 构建datarr josn字符串
        console.log('构建')
        ckNum =0
        if([plist2[index]].length>=list.length){  //店铺内的商品全部选中
          checkedAll = true
        }
        data.forEach((item,index)=>{
          item.list.forEach((item1,index1)=>{
            ckNum++
          })
        })
        ckNum1 = 1;
        if(ckNum1 == ckNum){
          checkeedAll = true
        }
        //构建
        let plist1 = {
          shopNo:plist2[index].shopNo,
          shopName:data[groupIndex].shopName,
          count:data[groupIndex].count,
          subtotal:data[groupIndex].subtotal,
          list:[plist2[index]],
          checkedAll:checkedAll,
        }
        itemList.push(plist1.shopNo)
        that.setData({
          datarr:[plist1],
          [dataStatus]:checkedAll,
          priceAll:((num*10) * (price*10)) / 100,  //失精
          count:1,
          checkeedAll:checkeedAll,
          ckNum:ckNum,
          ckNum1:ckNum1
        })
      }else{
        //datarr有值 往对应的shopNo追加数据(当前店铺/其他店铺)
        // var shopNo = list[0].shopNo;
        let shopId = data[groupIndex].shopNo//当前点击的shopNo
        if(unique(itemList).indexOf(shopId)!=-1){
          console.log('现有店铺内')
          let itemIndex = parseInt(unique(itemList).indexOf(shopId));//在datarr中第n个
          if(datarr[itemIndex].list.length+1>=list.length){  //店铺内的商品全部勾选
            checkedAll=true
          }
          ckNum1 +=1
          if(ckNum1 == ckNum){
            checkeedAll = true
          }
          let oList = datarr[itemIndex].list;
          let nList = oList.push(list[index]) //这行一定不能删
          // datarr[itemIndex].list.push(list[index])
          let ptest = 'datarr[' +itemIndex+'].list'
          that.setData({
            priceAll: (priceAll * 10 + p * 10) / 10,
            [dataStatus]:checkedAll,
            [ptest]:oList,
            count:count+1,
            checkeedAll:checkeedAll,
            ckNum1:ckNum1
          })
        }else{
          console.log('其他店铺')
            if([plist2[index]].length>=list.length){  //店铺内的商品全部选中
              checkedAll = true
            }
            let plist1 = {
              shopNo:plist2[index].shopNo,
              shopName:data[groupIndex].shopName,
              count:data[groupIndex].count,
              subtotal:data[groupIndex].subtotal,
              list:[plist2[index]],
              checkedAll:checkedAll
            }
            ckNum1 +=1
            if(ckNum1 == ckNum){
              checkeedAll = true
            }
            itemList.push(shopId)
            let iIndex = that.data.itemList.length-1
            let ptest= 'datarr['+iIndex+']'
            that.setData({
              [ptest]:plist1,
              [dataStatus]:checkedAll,
              priceAll:(priceAll * 10 + p * 10) / 10,  //失精
              count:count+1,
              checkeedAll:checkeedAll,
              ckNum1:ckNum1
            })
        }
      }
    }
  },
  //点击全选
  AllTap: function(e) {
    // debugger
    let _this = this;
    var checkeedAll = _this.data.checkeedAll;
    var list1 = _this.data.data;
    var itemList = []
    // for (var i = 0; i < list1.length; i++) {
      
    //   for (var c = 0; a < list2.length; a++) {
        
    //   }
    // }
    //单选 选中的时候 的结算 为多少
    var count = [];
    var priceAll = 0;
    let allnum = 0;
    for (var b = 0; b < list1.length; b++) {
      var list2 = list1[b].list;
      itemList.push(list1[b].shopNo)
      list1[b].checkedAll = !checkeedAll;
      for (var c = 0; c < list2.length; c++) {
          count.push(list2[c]);
          list2[c].checked = !checkeedAll;
          let price = Number(list2[c].price)
          let profit = Number(list2[c].profit)
          let num = parseInt(list2[c].num)
          if (this.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price).toFixed(2)) * num
          }
          allnum += num;
      }
    }
    if(checkeedAll){
      _this.setData({
        checkeedAll: (!checkeedAll),
        data: list1,
        datarr: [],
        count: 0,
        priceAll: 0,
        itemList:[],
        ckNum:0,
        ckNum1:0
      });
    }else{
      _this.setData({
        checkeedAll: (!checkeedAll),
        data: list1,
        datarr: wx.getStorageSync('datarr'),
        count: (count.length),
        priceAll: priceAll.toFixed(2),
        itemList:unique1(itemList)
      });
    }
    console.log(list1)
  },
  /* 点击减号 */
  bindMinus: function(e) {
    let that=this;
    let stockNo=e.currentTarget.dataset.stockno;
    let params = {
      userId: wx.getStorageSync('userId'),
      stockNo:stockNo,
      count:-1
    }
    requestUtil.Requests('product/cart/saveAndUpdate', params).then((res) => {
      console.log(res)
      if(res.flag){
        that.onShow()
      }
    })
    // let _this = this;
    // let id = e.currentTarget.dataset.id; //商品的id
    // let goodsNum = e.currentTarget.dataset.num; //商品的数量
    // var groupIndex = e.target.dataset.groupindex; //拿到当前店铺的index
    // var index = e.target.dataset.index; //拿到店铺里商品的index
    // let carts = _this.data.data;
    // let cai = carts[groupIndex].list //当前商品的店铺 data.data
    // let curt = cai[index] //当前商品的数组
    // var num = curt.num; //当前商品的数量
    // if (num <= 1) {
    //   return false
    // }
    // num = --num;
    // carts[groupIndex].list[index].num = num //点击后当前店铺下当前商品的数量
    // // 只有大于一件的时候，才能normal状态，否则disable状态  
    // //var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // // 将数值与状态写回  
    // _this.setData({
    //   data: carts,
    //   id: id,
    //   num: num
    //   // minusStatus: minusStatus
    // }, function() {
    //   _this.updateGoodsNum()
    // });
    // //计算总价格
    // var count = [];
    // var priceAll = 0;
    // let allnum = 0;
    // for (var b = 0; b < carts.length; b++) {
    //   var datacount = carts[b].list;
    //   for (var c = 0; c < datacount.length; c++) {
    //     if (datacount[c].checked == true) {
    //       count.push(datacount[c]);
    //       let price = Number(datacount[c].price)
    //       let profit = Number(datacount[c].profit)
    //       let num = parseInt(datacount[c].num)
    //       if (_this.data.vipGrade == '1') {
    //         priceAll += price * num;
    //       } else {
    //         priceAll += ((price - profit * _this.data.vipRate).toFixed(2)) * num
    //       }
    //       allnum += num
    //     }
    //   }
    // }
    // _this.setData({
    //   count: (count.length),
    //   priceAll: priceAll.toFixed(2)
    // });
  },
  /* 点击加号 */
  bindPlus: function(e) {
    if(e.currentTarget.dataset.stocknum==e.currentTarget.dataset.num){
      wx.showToast({
        title: '商品数量已上限',
        icon: 'none',
      })
      return
    }
    let that=this;
    let stockNo=e.currentTarget.dataset.stockno;
    let params = {
      userId: wx.getStorageSync('userId'),
      stockNo:stockNo,
      count:1
    }
    requestUtil.Requests('product/cart/saveAndUpdate', params).then((res) => {
      console.log(res)
      if(res.flag){
        that.onShow()
      }
    })
    // let id = e.currentTarget.dataset.id; //商品的id
    // var groupIndex = e.target.dataset.groupindex; //拿到当前店铺的index
    // var index = e.target.dataset.index; //拿到店铺里商品的index
    // let carts = this.data.data;
    // let cai = carts[groupIndex].list //当前商品的店铺 data.data
    // let curt = cai[index] //当前商品的数组
    // var num = curt.num; //当前商品的数量
    // // 不作过多考虑自增1  
    // ++num;
    // carts[groupIndex].list[index].num = num //点击后当前店铺下当前商品的数量
    // // 只有大于一件的时候，才能normal状态，否则disable状态  
    // // var minusStatus = num < 1 ? 'disabled' : 'normal';
    // // 将数值与状态写回  
    // this.setData({
    //   data: carts,
    //   id: id,
    //   num: num
    //   // minusStatus: minusStatus
    // }, function() {
    //   this.updateGoodsNum(groupIndex, index)
    // });

    // //计算总价格
    // var count = [];
    // var priceAll = 0;
    // let allnum = 0;
    // for (var b = 0; b < carts.length; b++) {
    //   var datacount = carts[b].list;
    //   for (var c = 0; c < datacount.length; c++) {
    //     if (datacount[c].checked == true) {
    //       count.push(datacount[c]);
    //       let price = Number(datacount[c].price)
    //       let profit = Number(datacount[c].profit)
    //       let num = parseInt(datacount[c].num)
    //       if (this.data.vipGrade == '1') {
    //         priceAll += price * num;
    //       } else {
    //         priceAll += ((price - profit * this.data.vipRate).toFixed(2)) * num
    //       }
    //       allnum += num
    //     }
    //   }
    // }
    // this.setData({
    //   count: (count.length),
    //   priceAll: priceAll.toFixed(2)
    // });
  },
  /* 输入框事件 */
  bindManual: function(e) {
    var num = e.detail.value;
    // 将数值与状态写回  
    this.setData({
      num: num
    });
  },
  //管理购物车
  editAll() {
    let _this = this;
    _this.setData({
      editAllStatus: !_this.data.editAllStatus
    })
  },
  //管理删除购物车
  hadleRemove(e) {
    var that = this;
    let goodsArr = [];
    let datarr=that.data.datarr;
      datarr.forEach((item) => {
        item.list.forEach(arr=>{
          goodsArr.push(arr.stockNo)
        })
      })
    if(goodsArr.length==0){
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
      })
      return
    }
    wx.showModal({
      title: '',
      content: '确定要删除吗？',
      cancelColor: "#ababab",
      confirmColor: "#027ee7",
      success(res) {
        if (res.confirm) {
          let params = {
            userId: wx.getStorageSync('userId'),
            stockNos: goodsArr
          }
          console.log(goodsArr)
          requestUtil.Requests('product/cart/emptyShoppingCart', params).then((res) => {
           if(res.flag){
            wx.showToast({
              title: '删除成功',
              icon: "none",
            })
              that.setData({
                editAllStatus: true,
                count: 0,
                priceAll: 0,
                checkeedAll: false,
                page:1,
                datarr:[],
                listcheckedarr:[],
                itemList:[],
                ckNum:0,
                ckNum1:0
              })
              that.getCarlist()
           }else{
            //删除失败,后台会给提示,前端不给
           }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });
  },

  getCarlist() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId')
    }
    requestUtil.Requests('product/cart/queryCart', params, _this.data.data).then((res) => {
      console.log('购物车列表', res)
      wx.setStorageSync('datarr', res.data)
      _this.setData({
        data: res.data,
        //hasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  /*购物车修改商品数量*/
  updateGoodsNum(groupIndex,index) {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      num: _this.data.num,
      id: _this.data.id
    }
    requestUtil.Requests('cart/updateGoodsCartRecord', params).then((res) => {
       
      if(res.flag){
        console.log('修改成功了!!!!!!!!!!!!!')
      }else{
        _this.data.num--;
        _this.data.data[groupIndex].list[index].num = _this.data.num
        _this.setData({
         data:_this.data.data
        })
      }
    
    })
  },
  getLikeGoodsPage() {
    let that = this;
    let params = {
      userId:wx.getStorageSync('userId'),
      type: 1,
      page: that.data.page,
      pageSize: that.data.pageSize
    }
    requestUtil.Requests_page('product/netGoods/queryLoveGoodsPage', params, that.data.likedata).then((res) => {
      console.log('猜你喜欢', res)
      that.setData({
        likedata: res.data,
        page: res.pageParam.page,
        hasMore: res.pageParam.hasMoreData
      })

    })
  },
  /*跳转到商品详情页*/
  toGoodsDetails(e) {
    let _this = this;
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
    })

  },
  /*结算商品*/
  handleClose(e) {
    let that = this;
    let source = 1;
    let datarr=that.data.datarr
    let shopList=[];
    datarr.forEach(item=>{
      var goodsList=[];
      item.list.forEach(arr=>{
        let goodsObj = {
            goodsNo: arr.goodsNo,
            stockNo: arr.stockNo,
            num: arr.num,
            price: arr.price
        }
        goodsList.push(goodsObj)
      })
      var shop={
        goodsList:goodsList,
        shopNo:item.shopNo
      };
      shopList.push(shop)
    })
    //console.log(shopList)
    if (shopList.length) {
      let objArr = JSON.stringify(shopList)
      wx.navigateTo({
        url: '/pages/child/pages/submit-order/submit-order?source=' + source + '&goodsArr=' + objArr + '&type=1',
      })
    } else {
      wx.showToast({
        title: '请选择结算商品',
        icon: 'none'
      })
    }
  },
  toShopList(e) {
    let shopNo = e.currentTarget.dataset.shopno;
    wx.navigateTo({
      url: "/pages/child/pages/shop/shop?shopNo=" + shopNo
    })
  }
})

function unique (arr) {
  return Array.from(new Set(arr))
}
//数组去重
function unique1(arr) {
  let res = [arr[0]]
  for (let i = 1; i < arr.length; i++) {
      let flag = true
      for (let j = 0; j < res.length; j++) {
          if (arr[i] === res[j]) {
              flag = false;
              break
          }
      }
      if (flag) {
          res.push(arr[i])
      }
  }
  return res
}
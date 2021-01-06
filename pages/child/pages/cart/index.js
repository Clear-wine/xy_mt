// pages/shoppingCart/shoppingCart.js
var requestUtil = require('../../../../utils/requestUtil.js')
var util = require('../../../../utils/util.js')
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
    listindex: 0

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userId = wx.getStorageSync('userId')
    // if (options.isgoods){
    //   this.setData({
    //     isgoods: options.isgoods
    //   })
    // }
    if (userId) {
      //获取猜你喜欢分页列表
      this.getLikeGoodsPage()
      this.setData({
        vipRate: wx.getStorageSync('vipRate'),
        vipGrade: wx.getStorageSync('vipGrade')
      })

    } else {
      wx.redirectTo({
        url: '/pages/auth/auth',
      })
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取网店购物车所有的列表
    let userId = wx.getStorageSync('userId')
    if (userId) {
      this.data.page = 1;
      this.getCarlist()
      this.setData({
        checkeedAll: false,
        priceAll: 0,
        count: 0,
        datarr: [],
        singlecheckeed: [],
        listcheckedarr: []
      })
    } else {
      wx.redirectTo({
        url: '/pages/auth/auth',
      })
    }

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    that.getLikeGoodsPage();
    that.data.page = 1;
    that.getCarlist();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.hasMore) {
      that.getLikeGoodsPage()
    } else {
      wx.showToast({
        title: '没有更多数据了...',
      })
    }
    if (that.data.hasMoreData) {
      that.getCarlist()
    } else {
      wx.showToast({
        title: '没有更多数据了...',
      })

    }

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
  getallPrices: function () {
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
  checkall: function (e) {
    
    var index = e.target.dataset.index; //点击元素的下标
    var list = this.data.data[index].list; //获取到了 当前老师元素的 下的所有课程
    var status = this.data.data[index].checkedAll; //获取老师下的checkedAll
    let allselectedmun = 0; //选中的所以数量
    for (var i = 0; i < list.length; i++) {
      list[i].checked = !status; //将当前老师元素下的所有课程 的checked都为 false  或者是  true
    };
    var dataIndex = 'data[' + index + '].list'; //这个可以拿到 data 中 index的老师下的所有课程  数据
    var dataStatus = 'data[' + index + '].checkedAll'; //当前老师元素下checkedAll的属性 
    this.setData({
      [dataIndex]: list,
      [dataStatus]: !status,
    });
    //只有所有单选的 都选中了  当前单选的这块的的父级就会 选中 ，将选中的 父级 添加在一个数组当中 如果过 它本身的数据的length == 它被选中的length 就让  三级的全选 选中
    var data = this.data.data;
    // var datarr = [];
    for (var a = 0; a < data.length; a++) {
      if (data[a].checkedAll == true) {
        var flag = true;
        for (let i in this.data.datarr) {
          if (this.data.datarr[i].shopNo == data[a].shopNo) {
            flag = false;
          }
        }
        if (flag) {
          this.data.datarr.push(JSON.parse(JSON.stringify(data[a])));
          this.setData({
            datarr: this.data.datarr
          })
        }

      }
    }
    var arrindex = util.getNowArrayIndex(this.data.datarr, data[index].shopNo)
    if (data[index].checkedAll == false) {
      this.data.datarr.splice(arrindex, 1)
    }
    let item = data.find(item => {
      return item.checkedAll == false
    })
    if (item != undefined) {
      this.setData({
        checkeedAll: false
      })
    } else {
      this.setData({
        checkeedAll: true
      })
    }
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
          if (this.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price - profit * this.data.vipRate).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    this.setData({
      count: (count.length),
      priceAll: priceAll.toFixed(2)
    });
  },
  //点击店铺里商品上的 checkbox
  Checks1: function (e) {
    
    let _this = this;
    var groupIndex = e.target.dataset.groupindex; // 拿到老师的index
    var index = e.currentTarget.dataset.index; // 拿到当前课程 的index
    var list = _this.data.data[groupIndex].list; //获取到了 当前老师元素的 下的所有课
    var list2 = _this.data.data[groupIndex].list[index].checked; //获取到了 当前老师元素的 下的所有课程的某一个index 的checked 值
    var dataIndexchecked = 'data[' + groupIndex + '].list[' + index + '].checked'; //这个可以拿到 data 中 index的老师下的所有课程  数据
    var dataStatus = 'data[' + groupIndex + '].checkedAll'; //当前老师元素下checkedAll的属性 
    _this.setData({
      [dataIndexchecked]: !list2,
    });
    if (_this.data.datarr) {
      for (let i in _this.data.datarr) {
        if (_this.data.datarr[i].shopNo == _this.data.data[groupIndex].shopNo) {
          for (let j in _this.data.datarr[i].list) {
            if (_this.data.datarr[i].list[j].goodsNo == _this.data.data[groupIndex].list[index].goodsNo) {
              _this.data.datarr[i].list[j].checked = _this.data.data[groupIndex].list[index].checked
            }
          }
        }
      }
    }
    var checkedarr = []; //单选 选中的 的课程
    var listcheckedarr = [];
    var listindex = _this.data.listindex;
    for (var i = 0; i < list.length; i++) {
      var listcheckedobj = {}
      if (list[i].checked == true) {
        // list[i].flag = true;
        var flag = true;
        var itemindex = 0;
        if (_this.data.listcheckedarr.length == 0) {
          listindex = 0;
          listcheckedobj = {
            shopNo: _this.data.data[groupIndex].shopNo,
            checkedAll: _this.data.data[groupIndex].checkedAll
          }
          checkedarr.push(JSON.parse(JSON.stringify(list[i])));
          listcheckedobj.list = checkedarr
          _this.data.listcheckedarr.push(listcheckedobj);
          _this.setData({
            datarr: _this.data.listcheckedarr,
          })
        } else {
          for (let m = 0; m < _this.data.listcheckedarr.length; m++) {
            var islist = true
            if (_this.data.listcheckedarr[m].shopNo == _this.data.data[groupIndex].shopNo) {
              islist = false;
              for (let c = 0; c < _this.data.listcheckedarr[m].list.length; c++) {
                if (list[i].id == _this.data.listcheckedarr[m].list[c].id) {
                  flag = false;
                  console.log('不添加')
                  break;
                }
              }
              if (flag) {
                _this.data.listcheckedarr[m].list.push(JSON.parse(JSON.stringify(list[i])));
                itemindex++;
              }
              _this.setData({
                datarr: _this.data.listcheckedarr,
              })
            }
          }
          if (islist) {
            listindex++;
            listcheckedobj = {
              shopNo: _this.data.data[groupIndex].shopNo,
              checkedAll: _this.data.data[groupIndex].checkedAll
            }
            checkedarr.push(JSON.parse(JSON.stringify(list[i])));
            listcheckedobj.list = checkedarr
            _this.data.listcheckedarr.push(listcheckedobj);
            _this.setData({
              datarr: _this.data.listcheckedarr,
              listindex: listindex
            })
          }
        }
      }
    }
    // _this.data.datarr[groupIndex].list.indexOf('checked == false')
    let isExist = _this.data.datarr[listindex].list.find(isExist => {
      return isExist.checked == false
    })
    var arrindex = util.getArrayIndex(_this.data.datarr[listindex].list, false)
    if (isExist != undefined) {
      _this.data.datarr[listindex].list.splice(arrindex, 1)
    }
    if (_this.data.datarr[listindex].list.length == 0) {
      _this.data.datarr.splice(listindex, 1)
      _this.setData({
        [dataStatus]: false
      });
    } else {
      if (list.length === _this.data.datarr[listindex].list.length) {
        _this.setData({
          [dataStatus]: true
        });
      } else {
        _this.setData({
          [dataStatus]: false
        });
      }

    }

    //只有所有单选的 都选中了  当前单选的这块的的父级就会 选中 ，将选中的 父级 添加在一个数组当中 如果过 它本身的数据的length == 它被选中的length 就让  三级的全选 选中
    var data = _this.data.data;
    // var datarr = [];
    for (var a = 0; a < data.length; a++) {
      if (data[a].checkedAll == true) {
        var isupdata = true
        for (let t = 0; t < _this.data.datarr.length; t++) {
          if (data[a].shopNo == _this.data.datarr[t].shopNo) {
            console.log('不添加')
            isupdata = false;
            break;
          }
        }
        if (isupdata) {
          _this.data.datarr.push(data[a]);
          _this.setData({
            datarr: _this.data.datarr
          })
        }
      }
    }
    let item = data.find(item => {
      return item.checkedAll === false;
    })
    if (item != undefined) {
      this.setData({
        checkeedAll: false
      })
    } else {
      this.setData({
        checkeedAll: true
      })
    }
    //单选 选中的时候 的结算 为多少  价格为多少
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
          let num = parseInt(datacount[c].num)
          if (this.data.vipGrade == '1') {
            priceAll += price * num
          } else {
            priceAll += ((price - profit * this.data.vipRate).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    _this.setData({
      count: (count.length),
      priceAll: priceAll.toFixed(2),
    });
  },
  //点击全选
  AllTap: function (e) {
    
    let _this = this;
    var checkeedAll = _this.data.checkeedAll;
    var list1 = _this.data.data;
    for (var i = 0; i < list1.length; i++) {
      list1[i].checkedAll = !checkeedAll;
      var list2 = _this.data.data[i].list;
      for (var a = 0; a < list2.length; a++) {
        list2[a].checked = !checkeedAll;
      }
    }
    //单选 选中的时候 的结算 为多少
    var count = [];
    var priceAll = 0;
    let allnum = 0;
    for (var b = 0; b < list1.length; b++) {
      var datacount = list1[b].list;
      for (var c = 0; c < datacount.length; c++) {
        if (datacount[c].checked == true) {
          count.push(datacount[c]);
          let price = Number(datacount[c].price)
          let profit = Number(datacount[c].profit)
          let num = parseInt(datacount[c].num)
          if (this.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price - profit * _this.data.vipRate).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    _this.setData({
      checkeedAll: (!checkeedAll),
      data: list1,
      datarr: list1,
      count: (count.length),
      priceAll: priceAll.toFixed(2)
    });

  },
  /* 点击减号 */
  bindMinus: function (e) {
    let _this = this;
    let id = e.currentTarget.dataset.id; //商品的id
    let goodsNum = e.currentTarget.dataset.num; //商品的数量
    var groupIndex = e.target.dataset.groupindex; //拿到当前店铺的index
    var index = e.target.dataset.index; //拿到店铺里商品的index
    let carts = _this.data.data;
    let cai = carts[groupIndex].list //当前商品的店铺 data.data
    let curt = cai[index] //当前商品的数组
    var num = curt.num; //当前商品的数量
    if (num <= 1) {
      return false
    }
    num = --num;
    carts[groupIndex].list[index].num = num //点击后当前店铺下当前商品的数量
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    //var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    _this.setData({
      data: carts,
      id: id,
      num: num
      // minusStatus: minusStatus
    }, function () {
      _this.updateGoodsNum()
    });
    //计算总价格
    var count = [];
    var priceAll = 0;
    let allnum = 0;
    for (var b = 0; b < carts.length; b++) {
      var datacount = carts[b].list;
      for (var c = 0; c < datacount.length; c++) {
        if (datacount[c].checked == true) {
          count.push(datacount[c]);
          let price = Number(datacount[c].price)
          let profit = Number(datacount[c].profit)
          let num = parseInt(datacount[c].num)
          if (_this.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price - profit * _this.data.vipRate).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    _this.setData({
      count: (count.length),
      priceAll: priceAll.toFixed(2)
    });
  },
  /* 点击加号 */
  bindPlus: function (e) {
    let id = e.currentTarget.dataset.id; //商品的id
    var groupIndex = e.target.dataset.groupindex; //拿到当前店铺的index
    var index = e.target.dataset.index; //拿到店铺里商品的index
    let carts = this.data.data;
    let cai = carts[groupIndex].list //当前商品的店铺 data.data
    let curt = cai[index] //当前商品的数组
    var num = curt.num; //当前商品的数量
    // 不作过多考虑自增1  
    ++num;
    carts[groupIndex].list[index].num = num //点击后当前店铺下当前商品的数量
    // 只有大于一件的时候，才能normal状态，否则disable状态  
    // var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回  
    this.setData({
      data: carts,
      id: id,
      num: num
      // minusStatus: minusStatus
    }, function () {
      this.updateGoodsNum(groupIndex, index)
    });

    //计算总价格
    var count = [];
    var priceAll = 0;
    let allnum = 0;
    for (var b = 0; b < carts.length; b++) {
      var datacount = carts[b].list;
      for (var c = 0; c < datacount.length; c++) {
        if (datacount[c].checked == true) {
          count.push(datacount[c]);
          let price = Number(datacount[c].price)
          let profit = Number(datacount[c].profit)
          let num = parseInt(datacount[c].num)
          if (this.data.vipGrade == '1') {
            priceAll += price * num;
          } else {
            priceAll += ((price - profit * this.data.vipRate).toFixed(2)) * num
          }
          allnum += num
        }
      }
    }
    this.setData({
      count: (count.length),
      priceAll: priceAll.toFixed(2)
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
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
    let shopArr = [];
    var json = {};
    var datajson = {}
    if (that.data.singlecheckeed) {
      that.data.singlecheckeed.forEach((item) => {
        item.checkedarr.forEach(el => {
          json = {
            "id": el.id
          }
          goodsArr.push(json)
          that.setData({
            goodsArr: goodsArr
          })
        })

      })
    }
    if (that.data.datarr) {
      that.data.datarr.forEach((item) => {
        datajson = {
          "shopNo": item.shopNo
        }
        shopArr.push(datajson)
        that.setData({
          shopArr: shopArr
        })
      })

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
            goodsArr: goodsArr,
            shopArr: shopArr
          }
          requestUtil.Requests('cart/deleteGoodsCart', params).then((res) => {
            wx.showToast({
              title: '删除成功',
              icon: "none",
            })
            setTimeout(function () {
              that.setData({
                editAllStatus: true,
                count: 0,
                priceAll: 0,
                checkeedAll: false
              })
              that.data.page = 1;
              that.getCarlist()
            }, 1000)
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
      userId: wx.getStorageSync('userId'),
      page: _this.data.page,
      pageSize: _this.data.pageSize
    }
    requestUtil.Requests_page('cart/queryGoodsCartPage', params, _this.data.data).then((res) => {
      console.log('购物车列表', res.data)
      _this.setData({
        data: res.data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData
      })
    })
  },
  /*购物车修改商品数量*/
  updateGoodsNum(groupIndex, index) {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      num: _this.data.num,
      id: _this.data.id
    }
    requestUtil.Requests('cart/updateGoodsCartRecord', params).then((res) => {
      
      if (res.flag) {
        console.log('修改成功了!!!!!!!!!!!!!')
      } else {
        _this.data.num--;
        _this.data.data[groupIndex].list[index].num = _this.data.num
        _this.setData({
          data: _this.data.data
        })
      }

    })
  },
  getLikeGoodsPage() {
    let that = this;
    let params = {
      userId: wx.getStorageSync('userId'),
      type: 1,
      page: that.data.page,
      pageSize: that.data.pageSize

    }
    requestUtil.Requests_page('product/netGoods/queryLoveGoodsPage', params, that.data.likedata).then((res) => {
      console.log('猜你喜欢', res.data)
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
    let _this = this;
    let source = 2;
    let datajson = {}
    let goodsArr = []
    // if (_this.data.singlecheckeed && _this.data.singlecheckeed.length != 0) {
    //   _this.data.singlecheckeed.forEach((item) => {
    //     datajson = {
    //       "shopNo": item.shopNo
    //     }
    //     let goodsNo = [];
    //     item.checkedarr.forEach(el => {
    //       goodsNo.push(el.id);
    //       datajson.goodsNo = goodsNo
    //     })
    //     goodsArr.push(datajson);
    //     _this.setData({
    //       goodsArr: goodsArr,
    //     })
    //   })
    //   let goodsarr = JSON.stringify(goodsArr)
    //   wx.navigateTo({
    //     url: '/pages/child/pages/submit-order/submit-order?source=' + source + '&goodsArr=' + goodsarr + '&type=1',
    //   })
    // } else 
    if (_this.data.datarr && _this.data.datarr.length != 0) {
      for (let i = 0; i < _this.data.datarr.length; i++) {
        datajson = {
          "shopNo": _this.data.datarr[i].shopNo,
        }
        let goodsNo = [];
        for (let k = 0; k < _this.data.datarr[i].list.length; k++) {
          goodsNo.push(_this.data.datarr[i].list[k].id)
          datajson.goodsNo = goodsNo
        }
        goodsArr.push(datajson);
        _this.setData({
          goodsArr: goodsArr,
        })
      }
      let goodsarr = JSON.stringify(goodsArr)
      wx.navigateTo({
        url: '/pages/child/pages/submit-order/submit-order?source=' + source + '&goodsArr=' + goodsarr + '&type=1',
      })

      // } else {
      //   wx.showToast({
      //     title: '请选择结算商品',
      //   })
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
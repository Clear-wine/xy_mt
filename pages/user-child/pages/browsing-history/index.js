const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pageSize: 20,
    //recordData: [],
    likedata: [],
    isCheckBox: false,
    checkedAll: false,
    botHeight:80,
    strlist:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 分页获取浏览记录
    this.getBrowseRecord();

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
    let _this = this;
    if (_this.data.isCheckBox){
      let query = wx.createSelectorQuery().in(this)
      query.select('.botton-view').boundingClientRect(function (res) {
        // 底部模块高度
        
        let botHeight = res.height;
        _this.setData({
          botHeight: botHeight + 20
        })
      }).exec()
    }
  },

  getBrowseRecord() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId') + "",
      page: _this.data.page + "",
      pageSize: _this.data.pageSize + ""
    }
    requestUtil.Requests_page_both('product/queryMyBrowseRecord', params, _this.data.recordData).then((res) => {
      let data = res.data;
      console.log(data)
      let num = 0
      data.forEach((el) => {
        el.list.forEach((item) => {
          item.checked = false;
          num++
        });
      })
      _this.setData({
        recordData: data,
        page: res.pageParam.page,
        hasMoreData: res.pageParam.hasMoreData, 
        num:num,
        strlist:''
      })
    })
  },
  // 清空浏览记录
  handleEmpty() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId') + "",
    }
    wx.showModal({
      title: '提示',
      content: '确认清空浏览记录？',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('product/emptyRecords', params).then((res) => {
            _this.data.page = 1;
            _this.getBrowseRecord()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 编辑
  handleEdit() {
    let _this = this;
    _this.setData({
      isCheckBox: !_this.data.isCheckBox
    })

  },
  // 选择
  Checks1(e) {
    
    let _this = this;
    let selectedAll;
    _this.data.recordData
    let groupIndex = e.target.dataset.groupindex;
    let index = e.target.dataset.index;
    let goodsNo = e.target.dataset.goodsno;
    let list = _this.data.recordData[groupIndex].list
    let selectChecked = _this.data.recordData[groupIndex].list[index].checked;
    var dataIndexchecked = 'recordData[' + groupIndex + '].list[' + index + '].checked';
    let checkedAll = false;
    _this.setData({
      [dataIndexchecked]: !selectChecked,
    })
    let strNum = 0
    var checkedarr = _this.data.strlist.split(','); //单选 选中的 的课程
    if(checkedarr[0] == ""){
      checkedarr.splice(0,1)
    }
    for (let i in list) {
      if (list[i].checked === true) {
        checkedarr.push(list[i].goodsNo)
        strNum++
      }
    }
    let cList = app.unique1(checkedarr)
    if(selectChecked){
      cList.splice(cList.indexOf(goodsNo),1)
    }
    const str = cList.join()
    console.log(str)
    if(strNum==_this.data.num){
      checkedAll=true
    }
    _this.setData({
      strlist: str,
      strNum:strNum,
      checkedAll:checkedAll
    })
  },
  // 删除
  handleRemove() {
    let _this = this;
    let params = {
      userId: wx.getStorageSync('userId') + "",
      goodsNo: _this.data.strlist
    }
    wx.showModal({
      title: '提示',
      content: '确认清空浏览记录？',
      success(res) {
        if (res.confirm) {
          if (_this.data.checkedAll) {
            requestUtil.Requests('product/emptyRecords', params).then((res) => {
              _this.data.page = 1;
              _this.getBrowseRecord()
            })
          } else {
            requestUtil.Requests('product/deleteRecord', params).then((res) => {
              _this.data.page = 1;
              _this.getBrowseRecord()
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 加入购物车
  // handleAddCart(e){},
  // 点击进入详情页面
  handleDetails(e) {
    let status = e.target.dataset.status;
    if (status === '0') { //如果为下架商品
      wx.navigateTo({
        url: '../lose-details/lose-details',
      })
    } else {
      let goodsNo = e.target.dataset.goodsno;
      wx.navigateTo({
        url: '/pages/child/pages/shopping-details/shopping-details?goodsNo=' + goodsNo,
      })
    }
  },
  // 全选
  AllTap() {
    let _this = this;
    let checkedAll = _this.data.checkedAll;
    let list1 = _this.data.recordData;
    list1.forEach((el) => {
      el.list.forEach((item) => {
        item.checked = !checkedAll;
      })
    })
    _this.setData({
      checkedAll: !_this.data.checkedAll,
      recordData: list1
    })
  },
  // 猜你喜欢
  // getLoveGoodsPage(){
  //   let _this = this;
  //   let params = {
  //     userId: wx.getStorageSync('userId'),
  //     type:1,
  //     page:_this.data.page,
  //     pageSize:_this.data.pageSize
  //   }
  //   requestUtil.Requests_page('product/netGoods/queryLoveGoodsPage', params, _this.data.likedata).then((res) => {
  //     _this.setData({
  //       likedata:res.data
  //     })
  //   })
  // },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.page = 1;
    this.getBrowseRecord()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let vm = this;
    if (vm.data.hasMoreData) {
      vm.getBrowseRecord();
    }
  },

})
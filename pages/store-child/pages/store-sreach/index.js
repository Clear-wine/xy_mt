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
    input_value: "", //value值
    hostarr: [], //热门搜索接收请求存储数组  
    name_focus: true, //获取焦点
    searchText: '取消',
    aslist: null,
    type: 1
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
        keydown_number: 1
      })
    } else {
      this.setData({
        searchText: "取消",
        keydown_number: 0
      })
    }
  },
  getBlurWordsList(val) {
    let _this = this;
    let params = {
      keyWord: val,
      searchType: _this.data.type, // 查询类型
      shopType: '2'
    }
    requestUtil.Requests('product/hotWordes/queryBlurWordsList', params).then((res) => {
      _this.setData({
        aslist: res.data
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
      console.log(this.data.input_value)
      //判断取值是手动输入还是点击赋值
      if (this.data.input_value == "") {
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
        let arr_num = arr.indexOf(this.data.input_value);
        console.log(arr.indexOf(this.data.input_value));
        if (arr_num != -1) {
          arr.splice(arr_num, 1)
          arr.unshift(this.data.input_value);
        } else {
          arr.unshift(this.data.input_value);
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
      this.setData({
        input_value: '',
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
    this.setData({
      name_focus: true
    })
    let value = e.currentTarget.dataset.text;
    this.setData({
      input_value: value,
      SearchText: "搜索",
      keydown_number: 1
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let This = this;
    if (options.sortType) {
      This.setData({
        type: options.type,
        sortType: options.sorttype,

      })
    }
    This.setData({
      lat: options.lat,
      lng: options.lng,
      city: options.city
    })
    //设置当前页标题
    wx.setNavigationBarTitle({
      title: '搜索'
    });
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
    let content = e.currentTarget.dataset.text
    wx.navigateTo({
      url: '../storeList/storeList?content=' + content + '&lat=' + _this.data.lat + '&lng=' + _this.data.lng + '&city=' + _this.data.city + '&isSreach=1',
      // url: '../search-cont/search?content=' + content + '&type=' + _this.data.type + '&sortType=1',
    })
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
    
    let _this = this
    if (_this.data.sortType) {
      _this.setData({
        type: _this.data.type,
        sorttype: _this.data.sorttype
      })
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
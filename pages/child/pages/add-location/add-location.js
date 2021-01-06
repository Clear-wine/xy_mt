// pages/child/pages/add-loation/add-location.js
const app = getApp()
var requestUtil = require('../../../../utils/requestUtil.js')
// 引入SDK核心类
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [], //三维数组
    multiIndex: [0, 0, 0], //默认下标
    objectMultiArray: [
      [],
      []
    ],
    persion: "", //收货人
    phone: "", //手机号
    isDefault: 1, //是否为默认地址 1：是 0：否
    province: '', //选择的省级
    city: '', //选择的市级
    area: '', //选择的区级
    address: '', //详细地址
    //标签
    radio: [
      // { value: "学校" },
      {
        value: "家",
        checked: false
      },
      {
        value: "公司",
        checked: false
      },
      {
        value: "学校",
        checked: false
      },

    ],
    label: '', //标签
    longitude: 0,
    latitude: 0,
    itemlist: '',
    isupdata: false, //判断是否修改地址
    region:'', //['广东省', '广州市', '海珠区'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let itemlist = JSON.parse(options.item);
    if (itemlist.id) {
      var region=[];
      region.push(itemlist.province)
      region.push(itemlist.city)
      region.push(itemlist.area)
      this.setData({
        itemlist: itemlist,
        persion: itemlist.persion,
        address: itemlist.address,
        province: itemlist.province,
        phone: itemlist.phone,
        city: itemlist.city,
        area: itemlist.area,
        isDefault: itemlist.isDefault,
        label: itemlist.lable,
        region:region
      })
    }
    if (options.isaddress) {
      this.setData({
        isaddress: options.isaddress
      })
    }
    //实例化api核心类
    qqmapsdk = new QQMapWX.QQMapWX({
      key: 'I4FBZ-5R5KI-NFQGA-54YDR-EE52H-7OFXO'
    })

  },
  onShow: function(options) {
    //this.getProvince() //获取省级数据
    for (let i = 0; i < this.data.radio.length; i++) {
      if (this.data.itemlist.lable != undefined) {
        if (this.data.itemlist.lable == this.data.radio[i].value) {
          this.data.radio[i].checked = true
        }
      }
    }
    this.setData({
      radio: this.data.radio
    })
  },
  //获取省
  getProvince() {
    var _this = this
    var params = {
      pId: 0
    }
    requestUtil.Requests('user/findAreaList', params).then((res) => {
      var data = res.data
      var provinceList = [...data] //获取所有的省放在数组里
      //获取到数据里面的value值,主要是名称
      var provinceArr = data.map((item) => {
        return item.name //得到省份名称
      })
      _this.setData({
        multiArray: [provinceArr, []], //更新三维数组
        provinceList, //省级原始数据
        provinceArr //省级所有的名称
      })
      var defaultCode = _this.data.provinceList[0].code //使用第一项当作参数获取市级数据
      if (defaultCode) {
        _this.setData({
          currnetProvinceKey: defaultCode //保存在当前的省级key
        })
        _this.getCity(defaultCode) //获取市级数据
      }
    })
  },
  // //获取市级数据
  getCity(code) {
    var _this = this;
    _this.setData({
      currnetProvinceKey: code //保存当前选择的市级code
    })
    var params = {
      pId: code
    }
    requestUtil.Requests('user/findAreaList', params).then((res) => {
      var data = res.data;
      var cityList = [...data];
      var cityArr = data.map((item) => {
        return item.name
      })
      _this.setData({
        multiArray: [_this.data.provinceArr, cityArr], //更新二维数组
        cityList, //保存下市级原始数据
        cityArr //市级所有名称
      })
      var defaultCode = _this.data.cityList[0].code //用第一个获取区级数据
      console.log(defaultCode,_this.data.cityList[0])
      if (defaultCode) {
        _this.setData({
          currnetCityKey: defaultCode //存下当前选择的城市key
        })
        _this.getRegion(defaultCode) //获取区级数据
      }
    })

  },

  //获取区级数据
  getRegion(code) {
    var _this = this;
    _this.setData({
      currnetCityKey: code //更新当前选择的市级key
    })
    var params = {
      pId: code
    }
    requestUtil.Requests('user/findAreaList', params).then((res) => {
      var data = res.data
      var regionList = [...data]
      var regionArr = data.map((item) => {
        return item.name
      })
      console.log("被调用")
      _this.setData({
        multiArray: [_this.data.provinceArr, _this.data.cityArr, regionArr], //重新赋值三级数组
        regionList, //保存下区级元素数据
        regionArr //保存下区级名称
      })
    })
    console.log(_this.data.multiArray)
  },
  //滚动选择器 触发的事件
  bindMultiPickerColumnChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var column = e.detail.column //当前改变的列
    var data = {
      multiIndex: JSON.parse(JSON.stringify(this.data.multiIndex)),
      multiArray: JSON.parse(JSON.stringify(this.data.multiArray))
    }
    data.multiIndex[column] = e.detail.value //第几列改变了就是对应multiIndex的第几个,更新它
    switch (column) {
      //判断 处理选择条件
      case 0: //第一列更改 就是省级更改
        var selectProvinceKey = this.data.provinceList[e.detail.value].code
        if (selectProvinceKey != this.data.currnetProvinceKey) { //判断当前的key是不是真正的更新了
          this.getCity(selectProvinceKey) //获取当前key下面的市级数据
        }
        var shijikey=this.data.cityList[0].code;
        this.getRegion(shijikey) //获取区级
        data.multiIndex[1] = 0 //将市默认选择第一个
        break;

      case 1: //市发送变化
        var selectCityKey = this.data.cityList[e.detail.value].code
        if (selectCityKey != this.data.currnetCityKey) {
          this.getRegion(selectCityKey) //获取区级
        }
        data.multiIndex[2] = 0 //地区默认为第一个
        break;
    }

    this.setData(data) //更新数据

  },
  // 地区选择确定
  bindMultiPickerChange(e) {
    var that = this;
    var province = (that.data.multiArray[0][that.data.multiIndex[0]]); // 获取省份
    var city = (that.data.multiArray[1][that.data.multiIndex[1]]); //获取城市
    var area = (that.data.multiArray[2][that.data.multiIndex[2]]); //获取区级
    that.setData({
      isupdata: true,
      multiIndex: e.detail.value, //更新下标字段
      province: province,
      city: city,
      area: area
    })

  },
  //微信自带的地区选择器
  bindRegionChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  //获取收货人信息
  bindNameInput(e) {
    this.setData({
      persion: e.detail.value
    })
  },
  //获取收货手机号
  bindPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  //获取详细地址
  bindLocationInput(e) {
    this.setData({
      address: e.detail.value
    })
  },
  //选择标签
  getradio: function(e) {
    
    let index = e.currentTarget.dataset.id;
    let radio = this.data.radio;
    // for (let i = 0; i < radio.length; i++) {
    //   this.data.radio[i].checked = false;
    // }
    if (radio[index].checked == true) {
      this.data.radio[index].checked = false;
    } else {
      this.data.radio[index].checked = true;
    }
    let userRadio = radio.filter((item, index) => {
      return item.checked == true;
    })
    let label = '';
    if (userRadio.length != 0) {
       label = userRadio[0].value
    }
    this.setData({
      radio: this.data.radio,
      label: label
    })
    console.log(userRadio)

  },
  //是否设为默认地址
  switchChange(e) {
    let _this = this;
    if (e.detail.value) {
      this.data.isDefault = 1
    } else {
      this.data.isDefault = 0

    }
    console.log('switch1 发生 change 事件，携带值为', e.detail.value)
  },
  //保存地址
  handleSubmit() {
    var that = this;
    if (that.data.persion == '') {
      wx.showToast({
        title: '请填写收货人姓名',
        icon: 'none'
      })
    } else if (that.data.phone == '') {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
    } else if (!(/^1\d{10}$/.test(that.data.phone))) {
      if (that.data.phone.length >= 11 || that.data.phone.length < 11) {
        wx.showToast({
          title: '手机号有误',
          icon: 'none',
          duration: 2000
        })
      }
    } else if (that.data.region == '' || that.data.address == '') {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'none'
      })
    } else {
      var province;
      var city;
      var area;
      var location
      if (that.data.itemlist.id && this.data.isupdata === false) {
        province = that.data.itemlist.province;
        city = that.data.itemlist.city;
        area = that.data.itemlist.area;
        location = province + city + area + that.data.itemlist.address;
      } else if (that.data.persion != '') {
        // province = (that.data.multiArray[0][that.data.multiIndex[0]]); // 获取省份
        // city = (that.data.multiArray[1][that.data.multiIndex[1]]); //获取城市
        // area = (that.data.multiArray[2][that.data.multiIndex[2]]); //获取区级
        var province=that.data.region[0];
        var city=that.data.region[1];
        var area=that.data.region[2];
        location = province + city + area + that.data.address
      }
      console.log(location, 111)
      //获取选择地区的经纬度
      qqmapsdk.geocoder({
        address: location, //地址参数
        success: function(res) { //成功后的回调
          console.log(res)
          var res = res.result;
          var reliability = res.reliability; //可信度参考
          var deviation = res.deviation; //误差距离
          if (reliability >= 7 && deviation != -1) {
            var latitude = res.location.lat;
            var longitude = res.location.lng;
            that.setData({
              latitude: latitude,
              longitude: longitude
            });
            that.sbumitForm()
          } else if (reliability < 7) {
            wx.showToast({
              title: '请输入正确的详情地址',
              icon: 'none'
            })
          }
        }
      })
      that.setData({
        province: province,
        city: city,
        area: area
      })
    }
  },
  //提交数据
  sbumitForm() {
    
    var that = this;
    let params = {
      userId: wx.getStorageSync('userId') + "", //用户id
      address: that.data.address, //详细地址
      persion: that.data.persion, //收件人
      phone: that.data.phone, //手机号
      lable: that.data.label, //标签
      province: that.data.region[0],//省
      city: that.data.region[1],
      area: that.data.region[2],
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      isDefault: that.data.isDefault
    }
    if (that.data.itemlist.id) {
      params.id = that.data.itemlist.id;
      requestUtil.Requests('user/updateAddress', params).then((res) => {
        wx.navigateBack({
          delta: 1
        })
      })
    } else {
      requestUtil.Requests('user/saveAddress', params).then((res) => {
        wx.navigateBack({
          delta: 1
        })
      })

    }
  },
  //删除地址
  handleRemove(e) {
    var that = this;
    let params = {
      userId: wx.getStorageSync('userId') + "", //用户id
      id: that.data.itemlist.id,
      longitude: that.data.itemlist.longitude,
      latitude: that.data.itemlist.latitude,
      isDisable: 0,
    }
    wx.showModal({
      title: '删除地址',
      content: '确认删除该收货地址吗?',
      success(res) {
        if (res.confirm) {
          requestUtil.Requests('user/updateAddress', params).then((res) => {
            //console.log('删除地址',res)
            var pages = getCurrentPages(); //当前页面
            var beforePage = pages[pages.length - 2]; //前一页
            wx.navigateBack({
              success: function () {
                beforePage.onShow(); // 执行前一个页面的onShow方法
              }
            });
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  }
})
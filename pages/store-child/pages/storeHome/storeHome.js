// pages/dianpu/index.js
var requestUtil = require('../../../../utils/requestUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    id:'',
    selectedArr:[],
    cost:0,
    zznum:0,
    chenum:0,
    selectedvalueArr: [],
  },
  daohang1(){
    this.setData({
      currentTab:0
    })
  },
  daohang2(){
    this.setData({
      currentTab:1
    })
  },
  onPageScroll (e) { 
    let that=this;
    let deltaY=that.data.deltaY;
    var query=wx.createSelectorQuery();
    query.select('.tu').boundingClientRect(function(rect){
      if(rect.bottom<0){
        that.setData({
          yc:true
        })
      }else{
        that.setData({
          yc:false
        })
      }
      //console.log('元素的高度',rect.bottom)
    }).exec();
  },
  bindscroll(e){
    let that=this;
    //console.log(e.detail.scrollTop)
    if(e.detail.scrollTop>10){
      that.setData({
        deltaY:1
      })
    }else{
      that.setData({
        deltaY:2
      })
    }
  },
  //获取店铺数据
  getdianpu(){
    wx.showLoading({
      title: '加载中',
    })
    let that=this;
    let vipRate=that.data.vipRate
    let params = {
      shopNo:that.data.shopNo
    }
    requestUtil.Requests('product/yoGoods/getInShopForGoods', params).then((res) => {
      console.log('店铺数据',res)
      let list=res.data.goodsList;
      // delete res.data.goodsList
      let id=0;
      list.forEach(item=>{
        id++;
        item.id='left'+id;
        if(item.name==list[0].name){
          item.ps=true
        }else{
          item.ps=false
        }
        item.goodsList.forEach(arr=>{
          arr.num=0;
          arr.yhprice=Number(arr.price);
          arr.zprice=Number(arr.price);
        })
      })
      that.setData({
        [`list[0]`]:list[0],
        data:res.data
      })
      setTimeout(function(){
        for(let i =1;i<list.length;i++){
          that.setData({
            [`list[${i}]`]:list[i]
          })
        }
        wx.hideLoading()
      },1000)
    }).then(()=>{
      requestUtil.Requests('product/yo/getYoShopInfo',params).then((res=>{
        that.setData({
          [`data.status`]:res.data.status,
          [`data.businessTimeFlag`]:res.data.businessTimeFlag,
          [`data.deliveryType`]:res.data.deliveryType,
          [`data.shopImg`]:res.data.shopImg
        })
      }))
    })
  },
  //左导航菜单选取
  zuodaohang(e){
    let that=this;
    that.zuidibu()
    that.setData({
      yc:true,
    })
    let list=that.data.list;
    list.forEach(item=>{
      if(item.id==e.currentTarget.dataset.id){
        item.ps=true
      }else{
        item.ps=false
      }
    })
    console.log(e.currentTarget.dataset.id)
    that.setData({
      id:e.currentTarget.dataset.id,
      list:list
    })
  },
  toMerchant(){
    wx.navigateTo({
      url: `../../../child/pages/ydmerchant-details/ydmerchant-details?shopNo=${this.data.shopNo}`,
    })
  },
  //滑动到最底部
  zuidibu(){
    wx.pageScrollTo({
      scrollTop:1000
    })
  },
  //滑动事件
  huadong(e){
    // let that=this;
    // that.data.list.forEach(item => {
    //   if (e.detail.scrollTop >= (item.offsetTop - 55) && e.detail.scrollTop <= (item.offsetTop - 55 + item.height)){
    //     item.ps=true
    //   }else{
    //     item.ps=false
    //   }
    // })
    // that.setData({
    //   list:that.data.list
    // })
  },
  //展开购物车
  handleShow() {
    let self = this;
    let packprice = 0.0;
    if (self.data.selectedArr.length == 0) {
      wx.showToast({
        title: '您还没有选择商品哦!快去选择商品吧!',
        icon: 'none'
      })
    } else {
      if(self.data.showPop2){
        self.hideModalCart()
      }else{
        let pf = 0;
        let cost = 0;
        let sArray = self.data.selectedArr
        for(let i = 0;i<sArray.length;i++){
          pf+=sArray[i].packFee * sArray[i].num
          cost+= sArray[i].price * sArray[i].num
        }
        cost = Number(cost.toFixed(2))
        pf = Number(pf.toFixed(2))
        self.setData({pf:pf,cost:cost+pf})
        self.showModalCart()
      }    
      // self.data.selectedArr.forEach((el) => {
      //   packprice += el.fare;
      // })
      // self.setData({
      //   packprice: packprice
      // }, function() {
      //   this.showModalCart()
      // })
    }
  },
  // 显示底部弹层购物车
  showModalCart: function() {
    var _this = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
      showPop2: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export()
      })
    }.bind(_this), 50)
  },
  // 隐藏底部弹层购物车
  hideModalCart: function() {
    var _this = this;
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export(),
        showPop2: false
      })
    }.bind(_this), 200)
  },
  //加入购物车
  addToTrolley(e){
    let that=this;
    let list=that.data.list;
    let selectedArr=that.data.selectedArr;
    let obj=e.currentTarget.dataset.item;
    var a=2;
    let pf = 0;
    console.log(obj.isStock)
    if(obj.isStock==0){//有规格的商品
      console.log(111)
      that.setData({
        obj:obj
      })
      that.getguige(obj.goodsNo,obj)
    }else{//无规格的商品
      for(let i=0;i<selectedArr.length;i++){
        if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
          selectedArr[i].num++;
          selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.yhprice)).toFixed(2);
          a=1;
          break;
        }else{
          a=2;
        }
      }
      if(a==2){
        obj.num=1;
        selectedArr.push(obj)
      }
      list.forEach(item=>{
        item.goodsList.forEach(arr=>{
          if(arr.goodsNo==obj.goodsNo){
            arr.num++
          }
        })
      })
      var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0)
      that.setData({
        selectedArr:selectedArr,
        list:list,
        zznum:zznum,
      })
      for(let i=0;i<selectedArr.length;i++){
        pf+=selectedArr[i].packFee * selectedArr[i].num
      }
      var cost=Number(selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2))
      pf = Number(pf.toFixed(2))
      that.setData({
        cost:cost+pf,
        pf:pf
      })
    }
  },
  //购物车删减
  removeFromTrolley(e){
    let that=this;
    let list=that.data.list;
    let selectedArr=that.data.selectedArr;
    let obj=e.currentTarget.dataset.item;
    let pf = 0
    if(obj.isStock==0){
      wx.showToast({
        title: '含规格的产品需要在购物车删减',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    for(let i=0;i<selectedArr.length;i++){
      if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
        if(selectedArr[i].num>1){
          selectedArr[i].num--;
          selectedArr[i].zprice=(Number(selectedArr[i].zprice)-Number(obj.yhprice)).toFixed(2);
        }else{
          selectedArr.splice(i,1);
        }
      }
    }
    for(let i=0;i<selectedArr.length;i++){
      pf+=selectedArr[i].packFee * selectedArr[i].num
    }
    list.forEach(item=>{
      item.goodsList.forEach(arr=>{
        if(arr.goodsNo==obj.goodsNo){
          arr.num--
        }
      })
    })
    var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0);
    var cost=Number(selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2))
    pf = Number(pf.toFixed(2))
    that.setData({
      selectedArr:selectedArr,
      list:list,
      zznum:zznum,
      cost:cost+pf,
      pf:pf
    })
  },
  /**
   * 跳转到商品详情
   */
  toYoDetail(e) {
    let _this = this;
    let groupindex = e.currentTarget.dataset.groupindex;
    let index = e.currentTarget.dataset.index;
    let zznum=_this.data.zznum
    let cost = _this.data.cost;
    let selectedArr = _this.data.selectedArr
    let goodsNo = e.currentTarget.dataset.goodsno;
    wx.navigateTo({
      url: '/pages/child/pages/product-details/product-details?goodsNo=' + goodsNo + '&cost=' + cost + '&groupindex=' + groupindex + '&selectedArr=' + JSON.stringify(selectedArr)+'&zznum='+zznum +'&flag=1',
    })
    console.log(zznum)
  },
  //规格调取
  getguige(goodsNo,obj){
    let that=this;
    let params = {
      goodsNo:goodsNo,
      sourceType:'wx'
    }
    requestUtil.Requests('product/yoGoods/queryStockList', params).then((res) => {
      console.log('规格',res)
      let specList = res.data.goodsStockBeanList; //所有规格
        let stockList = res.data.stockList; //所以规格组合
        let selName = '';
        for (var i = 0; i < specList.length; i++) {
          selName += specList[i].specName + ' '
          for (var j = 0; j < specList[i].specAttrList.length; j++) {
            if (specList[i].attrValueStatus) {
              specList[i].attrValueStatus[j] = true;
            } else {
              specList[i].attrValueStatus = [];
              specList[i].attrValueStatus[j] = true;
            }
          }
        }
        if (stockList[0].makeBeanList.length != 0) {
          that.setData({
            includeGroup: stockList,
            specList: specList, //所有规格
            stockList: stockList, //所以规格组合
          });
        }
        //这里是因为以前的商品数据错误,无规格返回的也是有规格,所以需要做这一步操作
        if(specList.length==0){
          let list=that.data.list;
          let selectedArr=that.data.selectedArr;
          var a=2;
          for(let i=0;i<selectedArr.length;i++){
            if(selectedArr[i].goodsNo==obj.goodsNo&&selectedArr[i].stockNo==obj.stockNo){
              selectedArr[i].num++;
              selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.yhprice)).toFixed(2);
              a=1;
              break;
            }else{
              a=2;
            }
          }
          console.log(a)
          if(a==2){
            obj.num=1;
            obj.isStock=1
            selectedArr.push(obj)
          }
          list.forEach(item=>{
            item.goodsList.forEach(arr=>{
              if(arr.goodsNo==obj.goodsNo){
                arr.num++,
                arr.isStock=1
              }
            })
          })
          let pf =0
          for(let i=0;i<selectedArr.length;i++){
            pf+=selectedArr[i].packFee * selectedArr[i].num
          }
          var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0)
          var cost=Number(selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2))
          pf = Number(pf.toFixed(2))
          console.log("加入购物车",selectedArr,zznum,cost)
          that.setData({
            selectedArr:selectedArr,
            list:list,
            zznum:zznum,
            cost:cost+pf,
            pf:pf
          })
        }else{
          that.showModal()
        }
    })
  },
    // 显示规格弹层
  showModal: function() {
    var _this = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
      showPop: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export()
      })
    }.bind(_this), 50)
  },
  // 隐藏规格弹层
  hideModal: function() {
    var _this = this;
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    })
    _this.animation = animation
    animation.translateY(300).step()
    _this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      _this.setData({
        animationData: animation.export(),
        showPop: false
      })
    }.bind(_this), 200)
  },
  /**关闭弹窗 */
  handleHide() {
    this.hideModal();
  },
    /**清空购物车 */
    clearCart(e) {
      let that=this;
      let selectedArr=[];
      let list=that.data.list;
      list.forEach(item=>{
        item.goodsList.forEach(arr=>{
          arr.num=0;
        })
      })
      that.setData({
        list:list,
        selectedArr:selectedArr,
        zznum:0,
        cost:0
      })
      this.hideModalCart()
    },



 /* 选择属性值事件*/
 selectAttrValue(e) {
    
  var specList = this.data.specList;
  var index = e.currentTarget.dataset.index; //点击的索引
  var key = e.currentTarget.dataset.key; //点击的类型
  var value = e.currentTarget.dataset.value; //点击的的值
  if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
    if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
      //  取消选中
      this.disSelectValue(specList, index, key, value);
    } else {
      //选中
      this.selectValue(specList, index, key, value);
    }
  }
},
/*选中*/
selectValue(specList, index, key, value, unselectStatus) {
  // console.log('firstIndex', this.data.firstIndex); 
  let that=this;
  var includeGroup = [];
  var specValue = [];
  let selectSpecName = [];
  let selName = '';
  let selValue = ''
  // let selectedvalueArr = []//选择的规格
  let selectedObj = {} //选中的规格
  if (index == this.data.firstIndex && !unselectStatus) { //如果是第一个选中的属性值，则该属性所有值可选 
    var stockList = this.data.stockList;
    // 其他选中的属性值全部置空
    // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
    for (var i = 0; i < specList.length; i++) {
      for (var j = 0; j < specList[i].specAttrList.length; j++) {
        specList[i].selectedValue = '';
      }
    }
  } else {
    var stockList = this.data.includeGroup;
  }
  console.log('选中', stockList, index, key, value);
  for (let i = 0; i < stockList.length; i++) {
    for (let j = 0; j < stockList[i].makeBeanList.length; j++) {
      if (stockList[i].makeBeanList[j].specName == key && stockList[i].makeBeanList[j].specValue == value) {
        includeGroup.push(stockList[i]);
        selectedObj = {
          specName: key,
          specValue: value
        }
      }
    }
  }
  this.data.selectedvalueArr.push(selectedObj);
  specList[index].selectedValue = value;
  // 判断属性是否可选 
  for (var i = 0; i < specList.length; i++) {
    for (var j = 0; j < specList[i].specAttrList.length; j++) {
      specList[i].attrValueStatus[j] = false;
    }
  }
  for (var k = 0; k < specList.length; k++) {
    for (var i = 0; i < includeGroup.length; i++) {
      for (var j = 0; j < includeGroup[i].makeBeanList.length; j++) {
        if (specList[k].specName == includeGroup[i].makeBeanList[j].specName) {
          for (var m = 0; m < specList[k].specAttrList.length; m++) {
            if (specList[k].specAttrList[m].specValue == includeGroup[i].makeBeanList[j].specValue) {
              specList[k].attrValueStatus[m] = true;
            }
          }
        }
      }
    }
  }
  console.log('结果', specList);
  // includeGroup[0].makeBeanList.forEach((item) => {
  //   specValue.push(item.specValue);

  // })
  specList.forEach(item => {
    if (item.selectedValue) {
      specValue.push(item.selectedValue)
    }
  })
  specValue.forEach(item => {
    selValue += item + ' '
  })
  if(that.data.vipGrade!='undefined'&&that.data.vipRate!=1){
    var seprice=(includeGroup[0].price - includeGroup[0].profit * that.data.vipRate).toFixed(2);
  }else{
    var seprice=includeGroup[0].price;
  }
  this.setData({
    specList: specList,
    includeGroup: includeGroup,
    specValue: specValue,
    selValue: selValue,
    seprice:seprice,
    selectedIncludeGroup: includeGroup,
    selectedvalueArr: this.data.selectedvalueArr,
    chenum:1
  });

  var count = 0;
  for (var i = 0; i < specList.length; i++) {
    for (var j = 0; j < specList[i].specAttrList.length; j++) {
      if (specList[i].selectedValue) {
        count++;
        break;
      }
    }
  }
  if (count < 2) { // 第一次选中，同属性的值都可选 
    this.setData({
      firstIndex: index
    });
  } else {
    this.setData({
      firstIndex: -1
    });
  }
},
/*取消选中*/
disSelectValue(specList, index, key, value) {
  let selectedvalueArr = this.data.selectedvalueArr;
  var stockList = this.data.stockList;
  specList[index].selectedValue = '';
  //判断属性是否可选
  for (let i = 0; i < specList.length; i++) {
    for (let j = 0; j < specList[i].specAttrList.length; j++) {
      specList[i].attrValueStatus[j] = true;
    }
  }
  for (let j = 0; j < selectedvalueArr.length; j++) {
    if (selectedvalueArr[j].specName == key && selectedvalueArr[j].specValue == value) {
      selectedvalueArr.splice(j, 1)
    }
  }
  this.setData({
    includeGroup: stockList,
    specList: specList,
    selectedIncludeGroup: undefined,
    selectedvalueArr: selectedvalueArr
  });
  for (let i = 0; i < specList.length; i++) {
    if (specList[i].selectedValue) {
      this.selectValue(specList, i, specList[i].specName, specList[i].selectedValue, true)
    }
  }
},
/**选好规格商品 */
handleChosen() {
  let _this = this;
  let info = _this.data.menu;
  let merObj = {};
  let shopGoodsDetail = _this.data.data;
  let selectedArr = _this.data.selectedArr;
  let selectedIncludeGroup = _this.data.selectedIncludeGroup;
  if (_this.data.selectedIncludeGroup == undefined) {
    wx.showToast({
      title: '请选择规格',
      icon: 'none'
    })
  } else {
    //已经选择规格,则需判断是否选择了完整的规格组合
    let isSelected = true;
    for (let i in _this.data.specList) {
      if (!_this.data.specList[i].selectedValue) {
        isSelected = false
      }
    }
    if (!isSelected) {
      wx.showToast({
        title: '请选择完整的规格',
        icon: 'none'
      })
    } else {
      if (_this.data.selectedIncludeGroup[0].num == null) { //表示选择的规格商品库存为无限库存
        _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
      } else { //表示选择的规格商品有限,需要进行判断
        if (_this.data.num > _this.data.selectedIncludeGroup[0].num) {
          wx.showToast({
            title: '您选择的数量超出限购数,请重新选择',
            icon: 'none'
          })
        } else {
          if (selectedArr.length != 0) { //如果购物车不为空
            let item = selectedArr.find(item => {
              return item.stockNo == _this.data.selectedIncludeGroup[0].stockNo
            })
            if (item != undefined) {
              if ((item.num + _this.data.num) > item.stockNum) {
                wx.showToast({
                  title: '您选择商品数量已超出库存范围,请重新选择',
                  icon: 'none'
                })
              } else {
                _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
              }
            } else {
              _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
            }
          } else {
            _this.addCartStockGoods(shopGoodsDetail, selectedIncludeGroup)
          }
        }
      }
    }
  }

},
/**多规格商品加入购物车 */
addCartStockGoods(shopGoodsDetail, selectedIncludeGroup) {
  let that=this;
  let obj=that.data.obj;
  let chenum=that.data.chenum;
  let selectedArr=that.data.selectedArr
  if(chenum==0){
    that.hideModal()
    return;
  }
  if(that.data.vipGrade!='undefined'&&that.data.vipRate!=1){
    var yhprice=(selectedIncludeGroup[0].price - selectedIncludeGroup[0].profit * that.data.vipRate).toFixed(2);
  }else{
    var yhprice=selectedIncludeGroup[0].price;
  }
  obj.num=chenum;
  obj.yhprice=yhprice;
  obj.zprice=yhprice*chenum;
  obj.price=selectedIncludeGroup[0].price,
  obj.stockNo=selectedIncludeGroup[0].stockNo,
  obj.isStock=1
  console.log('修改后=====>',obj)
  var a=2;
  for(let i=0;i<selectedArr.length;i++){
    if(selectedArr[i].stockNo==obj.stockNo){
      selectedArr[i].num=selectedArr[i].num*1+obj.num*1;
      selectedArr[i].zprice=(Number(selectedArr[i].zprice)+Number(obj.zprice)).toFixed(2);
      a=1;
      break;
    }else{
      a=2;
    }
  }
  console.log(a)
  if(a==2){
    selectedArr.push(obj)
  }
  let list=that.data.list
  list.forEach(item=>{
    item.goodsList.forEach(arr=>{
      if(arr.goodsNo==obj.goodsNo){
        arr.num=obj.num-0+arr.num-0
      }
    })
  })
  var zznum=selectedArr.reduce((znum, item) => znum + item.num, 0)
  var cost=(selectedArr.reduce((ccst,item)=>ccst+Number(item.zprice),0).toFixed(2))
  that.setData({
    zznum:zznum,
    cost:cost,
    selectedArr:selectedArr,
    list:list
  })
  that.hideModal()
},

/*点击减号*/
  bindMinus() {
    
    let _this = this;
    // 如果大于1时,才可以减
    if (_this.data.chenum > 0) {
      _this.data.chenum--;
    }
    // 只有大于一件的时候,才能normal状态,否则disable
    // 将数值与状态写回
    _this.setData({
      chenum: _this.data.chenum,
    });
  },
  bindPlus() {
    let _this = this;
    // 不作过多考虑自增1
    _this.data.chenum++
    // 将数值与状态写回
    _this.setData({
      chenum: _this.data.chenum
    });
  },
  /* 输入框事件 */
  bindManual: function(e) {
    let _this = this;
    _this.data.chenum = e.detail.value;

    // 将数值与状态写回
    _this.setData({
      chenum: _this.data.chenum
    });
  },
  //从商品详情页回来的检查数据函数
  jiancha(){
    let that=this;
    let selectedArr=that.data.selectedArr;
    let list=that.data.list;
    list.forEach(item=>{
      item.goodsList.forEach(arr=>{
        arr.num=0;
        selectedArr.forEach(crr=>{
          if(arr.goodsNo==crr.goodsNo){
            arr.num=arr.num+crr.num
          }
        })
      })
    })
    that.setData({
      list:list
    })
  },
  //前往结算即前往下单页面
  payOrder(){
    let that=this;
    if(that.data.cost==0){
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
      })
      return
    }
    let selectedArr=JSON.stringify(that.data.selectedArr);
    wx.navigateTo({
      url: '/pages/child/pages/submitYo-order/submitYo-order?selectedArr=' + selectedArr+'&shopNo='+that.data.shopNo,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      shopNo:options.shopNo,
      vipRate:wx.getStorageSync('vipRate'),//会员的优惠
      vipGrade:wx.getStorageSync('vipGrade'),//会员等级
    })
    //获取店铺数据
    that.getdianpu()
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